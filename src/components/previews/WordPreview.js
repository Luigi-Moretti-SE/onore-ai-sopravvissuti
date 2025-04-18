import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";
import InfoIcon from "@mui/icons-material/Info";
import { Box, Button, Container, Typography } from "@mui/material";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import PizZip from "pizzip";
import React, { useEffect } from "react";

export const WordPreview = () => {
  useEffect(() => {
    document.title = "Word Preview - Keytech";
  }, []);

  // Get data from sessionStorage
  const data = JSON.parse(sessionStorage.getItem("wordPreviewData") || "{}");
  const {
    filename,
    cliente,
    cognome,
    nome,
    sede,
    oggettoAttivita,
    period: initialPeriod,
    fatture: unsortedInvoices = [],
    kmEntries = [], // Aggiungi i dati dei rimborsi km
  } = data;
  
  // Gestisci il periodo se non specificato
  let period = initialPeriod;
  if (!period) {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
    
    period = `${formatDate(firstDay)} - ${formatDate(lastDay)}`;
  }

  // Sort invoices by date
  const invoices = [...unsortedInvoices].sort((a, b) => {
    const dateA = a.date.split("/").reverse().join("-");
    const dateB = b.date.split("/").reverse().join("-");
    return new Date(dateA) - new Date(dateB);
  });

  // Calculate totals
  const totals = invoices.reduce(
    (acc, invoice) => {
      let amountParsed = parseFloat(
        String(invoice.amount).replace(",", ".") || 0
      );

      // Check if the invoice is prepaid
      if (invoice.prepagata) {
        acc.prepaid += parseFloat(amountParsed || 0);
      } else {
        acc.total += parseFloat(amountParsed || 0);
        switch (invoice.motive) {
          case "food":
            acc.food += parseFloat(amountParsed || 0);
            break;
          case "transportation":
            acc.transportation += parseFloat(amountParsed || 0);
            break;
          case "housing":
            acc.housing += parseFloat(amountParsed || 0);
            break;
          default:
            break;
        }
      }

      // Calculate total including prepaid expenses
      acc.grandTotal = acc.total + acc.prepaid;

      return acc;
    },
    {
      total: 0,
      food: 0,
      transportation: 0,
      housing: 0,
      prepaid: 0,
      grandTotal: 0,
    }
  );

  // Calcola i totali dei rimborsi chilometrici
  const kmSummary = {
    totalPersonal: kmEntries
      .filter((entry) => !entry.isCompanyCar)
      .reduce((sum, entry) => sum + parseFloat(entry.totalKm || 0), 0),
    totalCompany: kmEntries
      .filter((entry) => entry.isCompanyCar)
      .reduce((sum, entry) => sum + parseFloat(entry.totalKm || 0), 0),
    totalPersonalAmount: kmEntries
      .filter((entry) => !entry.isCompanyCar)
      .reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0),
    totalCompanyAmount: kmEntries
      .filter((entry) => entry.isCompanyCar)
      .reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0),
    totalEntries: kmEntries.length,
  };

  const totalKm = kmSummary.totalPersonal + kmSummary.totalCompany;
  const totalKmAmount = kmSummary.totalPersonalAmount + kmSummary.totalCompanyAmount;

  // Calcola il totale complessivo (fatture + km)
  const grandTotal = totals.total + totalKmAmount;

  const handleDownload = async () => {
    try {
      // Load template
      const response = await fetch("/templates/Rimborso_Spese.docx");
      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.status}`);
      }

      const templateContent = await response.arrayBuffer();
      const zip = new PizZip(templateContent);

      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Format data for template
      const formattedInvoices = invoices.map((invoice) => ({
        date: invoice.date,
        client: cliente,
        activity: oggettoAttivita,
        description: invoice.invoice_title,
        payment: invoice.payment_method,
        amount: `€ ${parseFloat(
          String(invoice.amount).replace(",", ".")
        ).toFixed(2)}`,
        city: invoice.city,
        prepagata: invoice.prepagata ? "Sì" : "No", // Add prepagata field
        invoice: invoice.invoice === true || invoice.invoice === "true" ? "Sì" : "No", // Add fattura field
      }));

      // Format data for km entries
      const formattedKmEntries = kmEntries.map((entry) => ({
        date: entry.date || "-",
        carName: `${entry.carBrand.toUpperCase()} ${entry.carModel.toUpperCase()} (${entry.carEngine} cc)`,
        startCity: entry.startCity.toUpperCase(),
        waypoints: entry.waypoints && entry.waypoints.length > 0
          ? entry.waypoints.map(wp => wp.toUpperCase()).join(" | ")
          : "-",
        endCity: entry.endCity.toUpperCase(),
        km: entry.totalKm,
        carType: entry.isCompanyCar ? "Aziendale" : "Personale",
        amount: `€ ${parseFloat(entry.amount).toFixed(2)}`,
      }));

      // Create km summary data
      const kmSummaryData = [];
      
      if (kmSummary.totalPersonal > 0) {
        kmSummaryData.push({
          type: "Auto Personale",
          km: kmSummary.totalPersonal.toFixed(2),
          amount: `€ ${kmSummary.totalPersonalAmount.toFixed(2)}`,
        });
      }
      
      if (kmSummary.totalCompany > 0) {
        kmSummaryData.push({
          type: "Auto Aziendale",
          km: kmSummary.totalCompany.toFixed(2),
          amount: `€ ${kmSummary.totalCompanyAmount.toFixed(2)}`,
        });
      }

      // Render template with data
      doc.render({
        nome: nome,
        cognome: cognome,
        sede: sede,
        cliente: cliente,
        oggettoAttivita: oggettoAttivita,
        period: period,
        invoices: formattedInvoices,
        kmEntries: formattedKmEntries,
        kmSummary: kmSummaryData,
        kmTotal: `${totalKm.toFixed(2)}`,
        kmTotalAmount: `€ ${totalKmAmount.toFixed(2)}`,
        total: `€ ${totals.total.toFixed(2)}`,
        totfood: `€ ${totals.food.toFixed(2)}`,
        tottransp: `€ ${totals.transportation.toFixed(2)}`,
        tothousing: `€ ${totals.housing.toFixed(2)}`,
        prepaid: `€ ${totals.prepaid.toFixed(2)}`,
        grandTotal: `€ ${grandTotal.toFixed(2)}`,
        generationDate: new Date().toLocaleDateString("it-IT"),
      });

      // Generate and download the document
      const out = doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      saveAs(out, `${filename}.docx`);
    } catch (error) {
      console.error("Error generating document:", error);
    }
  };

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      <Box
        sx={{ bgcolor: "#0288d1", color: "white", p: 3, textAlign: "center" }}
      >
        <Typography variant="h4">Anteprima Word</Typography>
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 2,
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: 4 }}>
            {/* File Info */}
            <Box
              sx={{
                bgcolor: "#f9f9f9",
                border: "1px solid #eee",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
              }}
            >
              <DescriptionIcon sx={{ fontSize: 48, color: "#0288d1", mb: 1 }} />
              <Typography
                variant="h5"
                sx={{ color: "#0288d1", fontWeight: "bold" }}
              >
                {filename}.docx
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Documento Word pronto per il download
              </Typography>
            </Box>

            {/* Info Message */}
            <Box
              sx={{
                bgcolor: "#e3f2fd",
                p: 2,
                borderRadius: 2,
                mt: 3,
                display: "flex",
                alignItems: "center",
              }}
            >
              <InfoIcon sx={{ color: "#0288d1", mr: 1 }} />
              <Typography variant="body2">
                Il browser non può visualizzare l'anteprima diretta dei file
                Word.
                <br />
                Di seguito è riportato un riepilogo completo del contenuto.
              </Typography>
            </Box>

            {/* Document Summary */}
            <Box sx={{ mt: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "#0288d1",
                  borderBottom: "2px solid #eee",
                  pb: 1,
                  mb: 2,
                }}
              >
                Riepilogo Documento
              </Typography>

              {[
                { label: "Nome e Cognome", value: `${nome} ${cognome}` },
                { label: "Sede", value: sede },
                { label: "Cliente", value: cliente },
                { label: "Oggetto Attività", value: oggettoAttivita },
                { label: "Periodo", value: period },
                { label: "Numero Fatture", value: invoices.length },
                { label: "Numero Rimborsi Km", value: kmEntries.length },
              ].map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 1,
                  }}
                >
                  <Typography variant="body1" fontWeight="bold">
                    {item.label}:
                  </Typography>
                  <Typography variant="body1">{item.value}</Typography>
                </Box>
              ))}
            </Box>

            {/* Invoices Table */}
            {invoices.length > 0 && (
              <Box sx={{ mt: 4, overflowX: "auto" }}>
                <Typography variant="h6" sx={{ color: "#0288d1", mb: 2 }}>
                  Dettaglio Fatture e Scontrini
                </Typography>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "14px",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          backgroundColor: "#e3f2fd",
                          color: "#0288d1",
                          padding: "10px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Data
                      </th>
                      <th
                        style={{
                          backgroundColor: "#e3f2fd",
                          color: "#0288d1",
                          padding: "10px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Descrizione
                      </th>
                      <th
                        style={{
                          backgroundColor: "#e3f2fd",
                          color: "#0288d1",
                          padding: "10px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Importo
                      </th>
                      <th
                        style={{
                          backgroundColor: "#e3f2fd",
                          color: "#0288d1",
                          padding: "10px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Mod Pagamento
                      </th>
                      <th
                        style={{
                          backgroundColor: "#e3f2fd",
                          color: "#0288d1",
                          padding: "10px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Città
                      </th>
                      <th
                        style={{
                          backgroundColor: "#e3f2fd",
                          color: "#0288d1",
                          padding: "10px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Prepagata
                      </th>
                      <th
                        style={{
                          backgroundColor: "#e3f2fd",
                          color: "#0288d1",
                          padding: "10px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Fattura
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice, index) => (
                      <tr
                        key={index}
                        style={{
                          backgroundColor: index % 2 === 0 ? "#fff" : "#f2f2f2",
                        }}
                      >
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                          }}
                        >
                          {invoice.date}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                          }}
                        >
                          {invoice.invoice_title}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                          }}
                        >
                          €{" "}
                          {parseFloat(
                            String(invoice.amount).replace(",", ".")
                          ).toFixed(2)}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                          }}
                        >
                          {invoice.payment_method}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                          }}
                        >
                          {invoice.city}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                            textAlign: "center",
                          }}
                        >
                          {invoice.prepagata ? "Sì" : "No"}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                            textAlign: "center",
                          }}
                        >
                          {invoice.invoice === true || invoice.invoice === "true"
                            ? "Sì"
                            : "No"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Invoices Totals */}
                <Box
                  sx={{
                    mt: 3,
                    pt: 2,
                    borderTop: "2px solid #ddd",
                  }}
                >
                  {[
                    { label: "Totale Vitto", value: totals.food },
                    { label: "Totale Trasporto", value: totals.transportation },
                    { label: "Totale Alloggio", value: totals.housing },
                    { label: "Totale Prepagata", value: totals.prepaid },
                    { label: "Totale (escl. prepagata)", value: totals.total },
                  ].map((item, index) => (
                    <Typography
                      key={index}
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ my: 1 }}
                    >
                      {item.label}: € {item.value.toFixed(2)}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}

            {/* KM Reimbursements Table */}
            {kmEntries.length > 0 && (
              <Box sx={{ mt: 5, overflowX: "auto" }}>
                <Typography variant="h6" sx={{ color: "#0288d1", mb: 2 }}>
                  Dettaglio Rimborsi Chilometrici
                </Typography>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "14px",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          backgroundColor: "#e3f2fd",
                          color: "#0288d1",
                          padding: "10px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Data
                      </th>
                      <th
                        style={{
                          backgroundColor: "#e3f2fd",
                          color: "#0288d1",
                          padding: "10px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Veicolo
                      </th>
                      <th
                        style={{
                          backgroundColor: "#e3f2fd",
                          color: "#0288d1",
                          padding: "10px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Partenza
                      </th>
                      <th
                        style={{
                          backgroundColor: "#e3f2fd",
                          color: "#0288d1",
                          padding: "10px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Tappe
                      </th>
                      <th
                        style={{
                          backgroundColor: "#e3f2fd",
                          color: "#0288d1",
                          padding: "10px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Arrivo
                      </th>
                      <th
                        style={{
                          backgroundColor: "#e3f2fd",
                          color: "#0288d1",
                          padding: "10px",
                          textAlign: "center",
                          border: "1px solid #ddd",
                        }}
                      >
                        KM
                      </th>
                      <th
                        style={{
                          backgroundColor: "#e3f2fd",
                          color: "#0288d1",
                          padding: "10px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Tipo Auto
                      </th>
                      <th
                        style={{
                          backgroundColor: "#e3f2fd",
                          color: "#0288d1",
                          padding: "10px",
                          textAlign: "right",
                          border: "1px solid #ddd",
                        }}
                      >
                        Importo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {kmEntries.map((entry, index) => (
                      <tr
                        key={index}
                        style={{
                          backgroundColor: index % 2 === 0 ? "#fff" : "#f2f2f2",
                        }}
                      >
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                          }}
                        >
                          {entry.date || "-"}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                          }}
                        >
                          {`${entry.carBrand.toUpperCase()} ${entry.carModel.toUpperCase()} (${entry.carEngine} cc)`}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                          }}
                        >
                          {entry.startCity.toUpperCase()}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                          }}
                        >
                          {entry.waypoints && entry.waypoints.length > 0
                            ? entry.waypoints.map(wp => wp.toUpperCase()).join(" | ")
                            : "-"}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                          }}
                        >
                          {entry.endCity.toUpperCase()}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                            textAlign: "right",
                          }}
                        >
                          {entry.totalKm}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                          }}
                        >
                          {entry.isCompanyCar ? "Aziendale" : "Personale"}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                            textAlign: "right",
                          }}
                        >
                          € {parseFloat(entry.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* KM Totals */}
                <Box
                  sx={{
                    mt: 3,
                    pt: 2,
                    borderTop: "2px solid #ddd",
                  }}
                >
                  {kmSummary.totalPersonal > 0 && (
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ my: 1 }}>
                      Auto Personale: {kmSummary.totalPersonal.toFixed(2)} km - 
                      € {kmSummary.totalPersonalAmount.toFixed(2)}
                    </Typography>
                  )}
                  {kmSummary.totalCompany > 0 && (
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ my: 1 }}>
                      Auto Aziendale: {kmSummary.totalCompany.toFixed(2)} km - 
                      € {kmSummary.totalCompanyAmount.toFixed(2)}
                    </Typography>
                  )}
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ my: 1 }}
                  >
                    Totale Rimborsi Km: {totalKm.toFixed(2)} km - 
                    € {totalKmAmount.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Grand Total */}
            {(invoices.length > 0 || kmEntries.length > 0) && (
              <Box
                sx={{
                  mt: 4,
                  pt: 2,
                  borderTop: "2px solid #0288d1",
                  borderBottom: "2px solid #0288d1",
                  backgroundColor: "#f5f5f5",
                  p: 2,
                  textAlign: "center",
                }}
              >
                <Typography variant="h6" fontWeight="bold" color="#0288d1">
                  TOTALE COMPLESSIVO: € {grandTotal.toFixed(2)}
                </Typography>
              </Box>
            )}

            {/* Download Button */}
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  bgcolor: "#0288d1",
                  "&:hover": {
                    bgcolor: "#0277bd",
                  },
                }}
                onClick={handleDownload}
              >
                Scarica Word
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
