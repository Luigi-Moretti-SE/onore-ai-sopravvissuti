import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";

export const KmEditDialog = ({
  open,
  km,
  onClose,
  onSave,
  calculateKmAmount,
}) => {
  const [kmData, setKmData] = useState({
    paymentMethod: "Elettronico",
    carBrand: "",
    carModel: "",
    carEngine: "",
    startCity: "",
    waypoints: [],
    endCity: "",
    totalKm: "",
    isCompanyCar: false,
    amount: "",
  });

  const paymentOptions = [
    { value: "Elettronico", label: "Elettronico" },
    { value: "Contanti", label: "Contanti" },
  ];

  useEffect(() => {
    if (km) {
      setKmData({
        paymentMethod: km.paymentMethod || "Elettronico",
        carBrand: km.carBrand || "",
        carModel: km.carModel || "",
        carEngine: km.carEngine || "",
        startCity: km.startCity || "",
        waypoints: km.waypoints || [],
        endCity: km.endCity || "",
        totalKm: km.totalKm || "",
        isCompanyCar: km.isCompanyCar || false,
        amount: km.amount || "",
        date: km.date || "",
        index: km.index,
      });
    }
  }, [km]);

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    setKmData({
      ...kmData,
      [name]: type === "checkbox" ? checked : value,
      amount: calculateKmAmount(
        name === "totalKm" ?  value : kmData.totalKm,
        name === "isCompanyCar" ? checked : kmData.isCompanyCar
      ),
    });
  };

  const handleSave = () => {
    onSave(kmData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Modifica Rimborso Chilometrico: {kmData.startCity} - {kmData.endCity}{" "}
        {kmData.waypoints && kmData.waypoints.length > 0
          ? `(${kmData.waypoints.join(", ")})`
          : ""}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="Marca Auto"
              name="carBrand"
              value={kmData.carBrand}
              onChange={handleChange}
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="Modello Auto"
              name="carModel"
              value={kmData.carModel}
              onChange={handleChange}
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="Cilindrata (cc)"
              name="carEngine"
              value={kmData.carEngine}
              onChange={handleChange}
              type="number"
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid size={12}>
            <Divider />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="KM Totali"
              name="totalKm"
              value={kmData.totalKm}
              onChange={handleChange}
              type="number"
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              select
              fullWidth
              label="Modalità Pagamento"
              name="paymentMethod"
              value={kmData.paymentMethod}
              onChange={handleChange}
              variant="outlined"
              size="small"
            >
              {paymentOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={kmData.isCompanyCar}
                  onChange={handleChange}
                  name="isCompanyCar"
                />
              }
              label="Auto Aziendale"
            />
          </Grid>

          <Grid size={12}>
            <Divider />
          </Grid>

          <Grid
            size={12}
            spacing={2}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Data"
                type="date"
                value={
                  kmData.date ? kmData.date.split("/").reverse().join("-") : ""
                }
                onChange={(e) => {
                  const htmlValue = e.target.value;
                  if (htmlValue) {
                    const [year, month, day] = htmlValue.split("-");
                    const formattedDate = `${day}/${month}/${year}`;
                    setKmData({ ...kmData, date: formattedDate });
                  } else {
                    setKmData({ ...kmData, date: "" });
                  }
                }}
                slotProps={{
                  input: {
                    shrink: true,
                  },
                }}
                size="small"
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Importo (€)"
                name="amount"
                value={kmData.amount}
                onChange={handleChange}
                type="number"
                variant="outlined"
                size="small"
                slotProps={{
                  input: {
                    readOnly: true,
                    sx: {
                      fontWeight: "bold",
                      "& input": { fontWeight: "bold" },
                    },
                  },
                }}
                sx={{
                  ml: 2,
                  "& .MuiInputLabel-root": {
                    fontWeight: "bold",
                  },
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Salva
        </Button>
      </DialogActions>
    </Dialog>
  );
};
