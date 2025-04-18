import { Box, Card, CardHeader, Grid, TextField } from "@mui/material";
import React from "react";

export const DatiGenerali = ({
  cliente,
  setCliente,
  oggettoAttivita,
  setOggettoAttivita,
  cognome,
  setCognome,
  nome,
  setNome,
  sede,
  setSede,
  inputErrors,
}) => {
  return (
    <Card
      sx={{
        boxShadow:
          "rgba(0, 0, 0, 0.1) 0px 4px 30px, rgba(255, 255, 255, 0.6) 0px 1px 1px inset",
      }}
    >
      <CardHeader
        title="Dati Generali"
        sx={{
          opacity: 1,
          padding: "8px",
          marginBottom: "8px",
          borderBottom: "1px dashed rgba(194, 194, 194, 0.25)",
          transition: "opacity 500ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              fullWidth
              required
              error={!!inputErrors?.cliente}
              helperText={
                inputErrors?.cliente ? `Manca: ${inputErrors?.cliente}` : ""
              }
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Oggetto Attività"
              value={oggettoAttivita}
              onChange={(e) => setOggettoAttivita(e.target.value)}
              fullWidth
              required
              error={!!inputErrors?.oggettoAttivita}
              helperText={
                inputErrors?.oggettoAttivita
                  ? `Manca: ${inputErrors?.oggettoAttivita}`
                  : ""
              }
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              label="Cognome"
              value={cognome}
              onChange={(e) => setCognome(e.target.value)}
              fullWidth
              required
              error={!!inputErrors?.cognome}
              helperText={
                inputErrors?.cognome ? `Manca: ${inputErrors?.cognome}` : ""
              }
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              label="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              fullWidth
              required
              error={!!inputErrors?.nome}
              helperText={
                inputErrors?.nome ? `Manca: ${inputErrors?.nome}` : ""
              }
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              label="Sede"
              value={sede}
              onChange={(e) => setSede(e.target.value)}
              fullWidth
              required
              error={!!inputErrors?.sede}
              helperText={
                inputErrors?.sede ? `Manca: ${inputErrors?.sede}` : ""
              }
            />
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
};
