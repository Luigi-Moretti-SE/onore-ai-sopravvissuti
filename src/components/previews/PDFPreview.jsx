import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { Box, Button, Container, Typography } from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import React, { useEffect, useState } from "react";
import logo from "../../assets/Keytech.png";

export const PDFPreview = () => {
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    document.title = "PDF Preview - Keytech";
    loadLogoAndGeneratePDF();

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
    // eslint-disable-next-line
  }, []);

  const loadLogoAndGeneratePDF = async () => {
    try {
      const img = new Image();
      img.crossOrigin = "Anonymous";

      const logoData = await new Promise((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = reject;
        img.src = logo;
      });

      const data = JSON.parse(sessionStorage.getItem("pdfPreviewData") || "{}");
      const doc = await generatePDF(data, logoData);

      const pdfBlob = doc.output("blob");
      const file = new File([pdfBlob], `${data.filename}.pdf`, {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const generatePDF = async (data, logoData) => {
    const {
      period,
      kmEntries = [], // Ottieni i dati dei rimborsi km
    } = data;

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
    const totalKmAmount =
      kmSummary.totalPersonalAmount + kmSummary.totalCompanyAmount;

    // const MOTIVE_TRANSLATIONS = {
    //   food: "Vitto",
    //   transportation: "Trasporto",
    //   housing: "Alloggio",
    // };

    const doc = new jsPDF("p", "mm", "a4");

    if (logoData) {
      const pageWidth = doc.internal.pageSize.width;
      const logoWidth = 80;
      const logoHeight = 12;
      const xPosition = (pageWidth - logoWidth) / 2;
      doc.addImage(logoData, "PNG", xPosition, 15, logoWidth, logoHeight);
    }

    doc.setFont("helvetica");
    doc.setFontSize(16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    
    // Gestisce il periodo quando non è specificato
    let displayPeriod = period;
    if (!displayPeriod) {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };
      
      displayPeriod = `${formatDate(firstDay)} - ${formatDate(lastDay)}`;
    }
    
    doc.text(`Periodo ${displayPeriod}`, doc.internal.pageSize.width / 2, 40, {
      align: "center",
    });

    const pageWidth = doc.internal.pageSize.width;
    const tableWidth1 = 175;
    const leftMargin1 = (pageWidth - tableWidth1) / 2; // Calculate left margin to center

    // // Aggiungi la condizione per verificare se ci sono fatture
    // if (invoices && invoices.length > 0) {
    //   // Tabella fatture
    //   doc.setFontSize(14);
    //   doc.setFont("helvetica", "bold");
    //   doc.text("Riepilogo Fatture e Scontrini", pageWidth / 2, 55, {
    //     align: "center",
    //   });
    //   doc.setFont("helvetica", "normal");

    //   autoTable(doc, {
    //     startY: 60,
    //     head: [
    //       [
    //         "Data",
    //         "Cliente",
    //         "Oggetto Attività",
    //         "Descrizione",
    //         "Pagamento",
    //         "Importo",
    //         "Città",
    //         "Prepagata",
    //         "Fattura",
    //       ],
    //     ],
    //     body: invoices.map((invoice) => [
    //       invoice.date,
    //       cliente,
    //       oggettoAttivita,
    //       `${invoice.invoice_title} - ${
    //         MOTIVE_TRANSLATIONS[invoice.motive] || invoice.motive
    //       }`,
    //       invoice.payment_method,
    //       `€ ${parseFloat(String(invoice.amount).replace(",", ".")).toFixed(2)}`,
    //       invoice.city,
    //       invoice.prepagata ? "Sì" : "No",
    //       invoice.invoice === true || invoice.invoice === "true" ? "Sì" : "No",
    //     ]),
    //     theme: "grid",
    //     styles: {
    //       fontSize: 8,
    //       cellPadding: 2,
    //       lineColor: [128, 128, 128],
    //       textColor: [0, 0, 0],
    //       lineWidth: 0.5,
    //     },
    //     headStyles: {
    //       fillColor: [227, 242, 253],
    //       textColor: [0, 0, 0],
    //       fontSize: 8,
    //       fontStyle: "bold",
    //       halign: "left",
    //     },
    //     columnStyles: {
    //       0: { cellWidth: 18 },
    //       1: { cellWidth: 21 },
    //       2: { cellWidth: 22 },
    //       3: { cellWidth: 36 },
    //       4: { cellWidth: 19 },
    //       5: { cellWidth: 15, halign: "right" },
    //       6: { cellWidth: 18 },
    //       7: { cellWidth: 18, halign: "center" },
    //       8: { cellWidth: 14, halign: "center" },
    //     },
    //     margin: { left: leftMargin1 },
    //   });

    //   const totalsData = [
    //     ["Totale Trasporto:", `€ ${totals.transportation.toFixed(2)}`],
    //     ["Totale Alloggio:", `€ ${totals.housing.toFixed(2)}`],
    //     ["Totale Vitto:", `€ ${totals.food.toFixed(2)}`],
    //     ["Totale Prepagata:", `€ ${totals.prepaid.toFixed(2)}`],
    //     [
    //       {
    //         content: "Totale (escl. prepagata):",
    //         styles: { fillColor: [200, 200, 200] },
    //       },
    //       {
    //         content: `€ ${totals.total.toFixed(2)}`,
    //         styles: { fillColor: [200, 200, 200], fontStyle: "bold" },
    //       },
    //     ],
    //   ];

    //   // Tabella totali fatture
    //   const tableWidth2 = 80;
    //   const leftMargin2 = (pageWidth - tableWidth2) / 2;

    //   autoTable(doc, {
    //     startY: doc.lastAutoTable.finalY + 10,
    //     body: totalsData,
    //     theme: "grid",
    //     styles: {
    //       fontSize: 10,
    //       cellPadding: 2,
    //       lineColor: [128, 128, 128],
    //       lineWidth: 0.5,
    //       textColor: [0, 0, 0],
    //     },
    //     columnStyles: {
    //       0: {
    //         cellWidth: 45,
    //         fontStyle: "bold",
    //       },
    //       1: {
    //         cellWidth: 25,
    //         halign: "right",
    //       },
    //     },
    //     margin: { left: leftMargin2 },
    //   });
    // }

    // Aggiungi la tabella dei rimborsi km se ci sono voci
    if (kmEntries && kmEntries.length > 0) {
      // Determina il punto di partenza in base alla presenza di fatture
      const startY = 50; 
      // invoices && invoices.length > 0 
      //   ? doc.lastAutoTable.finalY + 25 
      //   : 55;
      
      // Intestazione sezione rimborsi km
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(
        "Riepilogo Rimborsi Chilometrici",
        pageWidth / 2,
        startY,
        { align: "center" }
      );
      doc.setFont("helvetica", "normal");
    
      // Tabella dettaglio rimborsi km
      autoTable(doc, {
        startY: startY + 5,
        head: [
          [
            "Data",
            "Veicolo",
            "Partenza",
            "Tappe",
            "Arrivo",
            "KM",
            "Tipo Auto",
            "Importo (€)",
          ],
        ],
        body: kmEntries.map((entry) => [
          entry.date || "-",
          `${entry.carBrand.toUpperCase()} ${entry.carModel.toUpperCase()} (${
            entry.carEngine
          } cc)`,
          entry.startCity.toUpperCase(),
          entry.waypoints && entry.waypoints.length > 0
            ? entry.waypoints.map((wp) => wp.toUpperCase()).join(" | ")
            : "-",
          entry.endCity.toUpperCase(),
          entry.totalKm,
          entry.isCompanyCar ? "Aziendale" : "Personale",
          `€ ${parseFloat(entry.amount).toFixed(2)}`,
        ]),
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 2,
          lineColor: [128, 128, 128],
          textColor: [0, 0, 0],
          lineWidth: 0.5,
        },
        headStyles: {
          fillColor: [227, 242, 253],
          textColor: [0, 0, 0],
          fontSize: 8,
          fontStyle: "bold",
          halign: "left",
        },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 22 },
          2: { cellWidth: 23 },
          3: { cellWidth: 36 },
          4: { cellWidth: 23 },
          5: { cellWidth: 15, halign: "right" },
          6: { cellWidth: 18 },
          7: { cellWidth: 18, halign: "center" },
          //8: { cellWidth: 14, halign: "center" },
        },
        margin: { left: leftMargin1 },
      });
    
      // Tabella riassuntiva rimborsi km
      let kmTotalsData = [];
    
      // Aggiungi riga per auto personale solo se esistono rimborsi di tipo personale
      if (kmSummary.totalPersonal > 0) {
        kmTotalsData.push([
          "Auto Personale:",
          `${kmSummary.totalPersonal.toFixed(2)} km`,
          `€ ${kmSummary.totalPersonalAmount.toFixed(2)}`,
        ]);
      }
    
      // Aggiungi riga per auto aziendale solo se esistono rimborsi di tipo aziendale
      if (kmSummary.totalCompany > 0) {
        kmTotalsData.push([
          "Auto Aziendale:",
          `${kmSummary.totalCompany.toFixed(2)} km`,
          `€ ${kmSummary.totalCompanyAmount.toFixed(2)}`,
        ]);
      }
    
      // Aggiungi la riga del totale (sempre presente)
      kmTotalsData.push([
        {
          content: "TOTALE:",
          styles: { fillColor: [200, 200, 200] },
        },
        {
          content: `${totalKm.toFixed(2)} km`,
          styles: { fillColor: [200, 200, 200], fontStyle: "bold" },
        },
        {
          content: `€ ${totalKmAmount.toFixed(2)}`,
          styles: { fillColor: [200, 200, 200], fontStyle: "bold" },
        },
      ]);
    
      const tableWidth3 = 100;
      const leftMargin3 = (pageWidth - tableWidth3) / 2;
    
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        body: kmTotalsData,
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 2,
          lineColor: [128, 128, 128],
          lineWidth: 0.5,
          textColor: [0, 0, 0],
        },
        columnStyles: {
          0: {
            cellWidth: 40,
            fontStyle: "bold",
          },
          1: {
            cellWidth: 30,
            halign: "right",
          },
          2: {
            cellWidth: 30,
            halign: "right",
          },
        },
        margin: { left: leftMargin3 },
      });
    
      // Tabella riepilogo totali complessivi
      const grandTotal = totalKmAmount; // + totals.total ;
      const tableWidth4 = 120;
      const leftMargin4 = (pageWidth - tableWidth4) / 2;
    
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        body: [
          [
            {
              content: "TOTALE COMPLESSIVO:",
              styles: {
                fillColor: [230, 230, 230],
                fontSize: 12,
                fontStyle: "bold",
              },
            },
            {
              content: `€ ${grandTotal.toFixed(2)}`,
              styles: {
                fillColor: [230, 230, 230],
                fontSize: 12,
                fontStyle: "bold",
              },
            },
          ],
        ],
        theme: "grid",
        styles: {
          lineColor: [128, 128, 128],
          lineWidth: 0.5,
          textColor: [0, 0, 0],
        },
        columnStyles: {
          0: {
            cellWidth: 80,
          },
          1: {
            cellWidth: 40,
            halign: "right",
          },
        },
        margin: { left: leftMargin4 },
      });
    }

    return doc;
  };

  if (!pdfUrl) {
    return (
      <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh" }}>
        <Box
          sx={{ bgcolor: "#d32f2f", color: "white", p: 3, textAlign: "center" }}
        >
          <Typography variant="h4">Anteprima PDF</Typography>
        </Box>
        <Container sx={{ py: 4, textAlign: "center" }}>
          <Typography>Generazione PDF in corso...</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      <Box
        sx={{ bgcolor: "#d32f2f", color: "white", p: 3, textAlign: "center" }}
      >
        <Typography variant="h4">Anteprima PDF</Typography>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 2,
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: 4 }}>
            <Box
              sx={{
                bgcolor: "#f9f9f9",
                border: "1px solid #eee",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                mb: 3,
              }}
            >
              <PictureAsPdfIcon
                sx={{ fontSize: 48, color: "#d32f2f", mb: 1 }}
              />
              <Typography
                variant="h5"
                sx={{ color: "#d32f2f", fontWeight: "bold" }}
              >
                {
                  JSON.parse(sessionStorage.getItem("pdfPreviewData") || "{}")
                    .filename
                }
                .pdf
              </Typography>
              <Button
                variant="contained"
                color="error"
                startIcon={<DownloadIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  mt: 2,
                }}
                onClick={() => {
                  const data = JSON.parse(
                    sessionStorage.getItem("pdfPreviewData") || "{}"
                  );
                  const link = document.createElement("a");
                  link.href = pdfUrl;
                  link.download = `${data.filename}.pdf`;
                  link.click();
                }}
              >
                Scarica PDF
              </Button>
            </Box>

            <Box sx={{ textAlign: "center", mb: 3 }}></Box>

            <Box
              sx={{
                width: "100%",
                height: "800px",
                border: "1px solid #eee",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <iframe
                src={`${pdfUrl}#toolbar=0`}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                title="PDF Preview"
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
