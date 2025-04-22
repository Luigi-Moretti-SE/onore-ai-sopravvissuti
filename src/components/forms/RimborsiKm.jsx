import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MapIcon from "@mui/icons-material/Map";
import {
  Box,
  Button,
  Card,
  CardHeader,
  Collapse,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { KmTable } from "../KmTable"; // Import the new component

export const RimborsiKm = ({
  startCity,
  setStartCity,
  startAddress,
  setStartAddress,
  endCity,
  setEndCity,
  endAddress,
  setEndAddress,
  waypoints,
  setWaypoints,
  handleValidationMap,
  routeLoading,
  inputErrors,
  // Aggiungi i nuovi props
  carBrand,
  setCarBrand,
  carModel,
  setCarModel,
  carEngine,
  setCarEngine,
  // Nuovo campo data
  travelDate,
  setTravelDate,
  // Add new props for KmTable
  kmEntries,
  onDeleteKm,
  onEditKm,
  onCompanyCarToggle,
  calculateKmAmount,
}) => {
  // Stato per controllare l'espansione del componente
  const [expanded, setExpanded] = useState(true);

  // Toggle per espandere/comprimere il componente
  const handleExpandToggle = () => {
    setExpanded(!expanded);
  };

  // Funzioni per gestire i waypoints
  const addWaypoint = () => {
    setWaypoints([...waypoints, { city: "", address: "" }]);
  };

  const removeWaypoint = (index) => {
    const newWaypoints = [...waypoints];
    newWaypoints.splice(index, 1);
    setWaypoints(newWaypoints);
  };

  const updateWaypoint = (index, field, value) => {
    const newWaypoints = [...waypoints];
    newWaypoints[index] = { ...newWaypoints[index], [field]: value };
    setWaypoints(newWaypoints);
  };

  return (
    <Card
      className="MuiCard-solidBorder"
      sx={{
        boxShadow:
          "rgba(0, 0, 0, 0.1) 0px 4px 30px, rgba(255, 255, 255, 0.6) 0px 1px 1px inset",
        position: "relative",
        // Rimuovi borderTop e paddingTop perché sono già definiti nella classe
      }}
    >
      <CardHeader
        title="Rimborso Km"
        action={
          <IconButton
            onClick={handleExpandToggle}
            aria-expanded={expanded}
            aria-label="mostra/nascondi dettagli"
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
        sx={{
          opacity: 1,
          padding: "8px",
          marginBottom: expanded ? "8px" : "0",
          borderBottom: expanded
            ? "1px dashed rgba(194, 194, 194, 0.25)"
            : "none",
          transition: "opacity 500ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            {/* Sezione informazioni auto */}
            <Grid item size={12}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <DirectionsCarIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="subtitle1">
                  Informazioni Viaggio
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {/* Nuovo campo data */}
            <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                type="date"
                label="Data Viaggio *"
                value={travelDate}
                error={!!inputErrors?.travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                size="small"
                margin="dense"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                label="Marca *"
                value={carBrand}
                error={!!inputErrors?.carBrand}
                onChange={(e) => setCarBrand(e.target.value)}
                size="small"
                margin="dense"
              />
            </Grid>

            <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                label="Modello *"
                value={carModel}
                error={!!inputErrors?.carModel}
                onChange={(e) => setCarModel(e.target.value)}
                size="small"
                margin="dense"
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                label="Cilindrata (cc)"
                value={carEngine}
                error={!!inputErrors?.carEngine}
                onChange={(e) => setCarEngine(e.target.value)}
                size="small"
                margin="dense"
                type="number"
                slotProps={{
                  htmlInput: { min: 0 },
                }}
              />
            </Grid>

            {/* Divider per separare le sezioni */}
            <Grid item size={12}>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1, mb: 1 }}>
                <MapIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="subtitle1">Itinerario</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {/* Sezione partenza */}
            <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                label="Città di partenza *"
                value={startCity}
                onChange={(e) => setStartCity(e.target.value)}
                size="small"
                margin="dense"
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                label="Indirizzo di partenza *"
                value={startAddress}
                onChange={(e) => setStartAddress(e.target.value)}
                size="small"
                margin="dense"
              />
            </Grid>
            <Grid item size={12}>
              <Box>
                <Button
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={addWaypoint}
                  variant="text"
                  size="small"
                >
                  Aggiungi tappa
                </Button>
              </Box>
            </Grid>

            {waypoints.map((waypoint, index) => (
              <React.Fragment key={index}>
                <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    fullWidth
                    label={`Città tappa ${index + 1}`}
                    value={waypoint.city}
                    onChange={(e) =>
                      updateWaypoint(index, "city", e.target.value)
                    }
                    size="small"
                    margin="dense"
                  />
                </Grid>
                <Grid item size={{ xs: 11, sm: 5, md: 4 }}>
                  <TextField
                    fullWidth
                    label={`Indirizzo tappa ${index + 1}`}
                    value={waypoint.address}
                    onChange={(e) =>
                      updateWaypoint(index, "address", e.target.value)
                    }
                    size="small"
                    margin="dense"
                  />
                </Grid>
                <Grid
                  item
                  xs={1}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mt: 1,
                  }}
                >
                  <IconButton
                    color="error"
                    onClick={() => removeWaypoint(index)}
                    size="small"
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Grid>
              </React.Fragment>
            ))}

            <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                label="Città di arrivo *"
                value={endCity}
                onChange={(e) => setEndCity(e.target.value)}
                size="small"
                margin="dense"
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                label="Indirizzo di arrivo *"
                value={endAddress}
                onChange={(e) => setEndAddress(e.target.value)}
                size="small"
                margin="dense"
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              sx={{
                mt: 1,
                mb: 1,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<MapIcon />}
                onClick={handleValidationMap}
                disabled={routeLoading}
              >
                {routeLoading ? "Calcolo percorso..." : "Seleziona Percorso"}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Add the KmTable component */}
        <KmTable
          kms={kmEntries}
          onDeleteKm={onDeleteKm}
          onEditKm={onEditKm}
          onCompanyCarToggle={onCompanyCarToggle}
          calculateKmAmount={calculateKmAmount}
        />
      </Collapse>
    </Card>
  );
};
