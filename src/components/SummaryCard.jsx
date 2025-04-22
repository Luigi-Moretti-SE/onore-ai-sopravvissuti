import {
  Box,
  Card,
  CardHeader,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";

export const SummaryCard = ({ summary, kmEntries = [] }) => {
  // Calcola il totale dei chilometri per auto aziendale e personale
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
  const totalAmount =
    kmSummary.totalPersonalAmount + kmSummary.totalCompanyAmount;

  // Aggiungi una logica per raggruppare i rimborsi km per data
  const kmByDate = React.useMemo(() => {
    const grouped = {};

    kmEntries.forEach((entry) => {
      const date = entry.date || "Data non specificata";
      if (!grouped[date]) {
        grouped[date] = {
          count: 0,
          totalPersonalKm: 0,
          totalCompanyKm: 0,
          totalPersonalAmount: 0,
          totalCompanyAmount: 0,
        };
      }

      grouped[date].count++;

      if (entry.isCompanyCar) {
        grouped[date].totalCompanyKm += parseFloat(entry.totalKm || 0);
        grouped[date].totalCompanyAmount += parseFloat(entry.amount || 0);
      } else {
        grouped[date].totalPersonalKm += parseFloat(entry.totalKm || 0);
        grouped[date].totalPersonalAmount += parseFloat(entry.amount || 0);
      }
    });

    // Converti in array e ordina per data
    return Object.entries(grouped)
      .map(([date, data]) => ({
        date,
        ...data,
        totalKm: data.totalPersonalKm + data.totalCompanyKm,
        totalAmount: data.totalPersonalAmount + data.totalCompanyAmount,
      }))
      .sort((a, b) => {
        // Gestisci il caso "Data non specificata"
        if (a.date === "Data non specificata") return 1;
        if (b.date === "Data non specificata") return -1;

        // Ordina per data (formato italiano DD/MM/YYYY)
        const [dayA, monthA, yearA] = a.date.split("/").map(Number);
        const [dayB, monthB, yearB] = b.date.split("/").map(Number);

        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);

        return dateA - dateB;
      });
  }, [kmEntries]);

  return (
    <Card
      className="MuiCard-solidBorder-gray"
      sx={{
        boxShadow:
          "rgba(0, 0, 0, 0.1) 0px 4px 30px, rgba(255, 255, 255, 0.6) 0px 1px 1px inset",
      }}
    >
      <CardHeader
        title="Riepilogo"
        sx={{
          opacity: 1,
          padding: "8px",
          marginBottom: "8px",
          borderBottom: "1px dashed rgba(194, 194, 194, 0.25)",
          transition: "opacity 500ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />

      {/* Nuova sezione Riepilogo Rimborsi Km */}
      <Box sx={{ mt: 2 }}>
        <Typography
          variant="subtitle1"
          sx={{ px: 2, py: 1, fontWeight: "bold" }}
        >
          Rimborsi Chilometrici
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Numero Rimborsi</TableCell>
                <TableCell>Km Auto Personale</TableCell>
                <TableCell>Km Auto Aziendale</TableCell>
                <TableCell>Totale Km</TableCell>
                <TableCell>Importo (€)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {kmEntries.length > 0 ? (
                <>
                  {kmByDate.map((item, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell>{item.totalPersonalKm.toFixed(2)}</TableCell>
                      <TableCell>{item.totalCompanyKm.toFixed(2)}</TableCell>
                      <TableCell>{item.totalKm.toFixed(2)}</TableCell>
                      <TableCell>{item.totalAmount.toFixed(2)} €</TableCell>
                    </TableRow>
                  ))}
                  <TableRow hover sx={{ fontWeight: "bold" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>TOTALE</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {kmSummary.totalEntries}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {kmSummary.totalPersonal.toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {kmSummary.totalCompany.toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {totalKm.toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {totalAmount.toFixed(2)} €
                    </TableCell>
                  </TableRow>
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Nessun rimborso chilometrico disponibile
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Card>
  );
};
