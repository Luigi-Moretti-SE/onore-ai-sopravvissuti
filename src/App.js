import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
  Box,
  Button,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import React, { useState } from "react";
import logo from "./assets/Keytech.png";
import { MapDialog } from "./components/dialogs/MapDialog";
import { RimborsiKm } from "./components/forms/RimborsiKm";
import { SummaryCard } from "./components/SummaryCard";
import { theme } from "./theme";

const MAX_WIDTH = "1200px";

const MONTHS = [
  "GENNAIO",
  "FEBBRAIO",
  "MARZO",
  "APRILE",
  "MAGGIO",
  "GIUGNO",
  "LUGLIO",
  "AGOSTO",
  "SETTEMBRE",
  "OTTOBRE",
  "NOVEMBRE",
  "DICEMBRE",
];

function App() {
  const themeM = useTheme();
  const isMobile = useMediaQuery(themeM.breakpoints.down("sm"));

  const [isLoading, setIsLoading] = useState(false);
  const [inputErrors, setInputErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });
  const [mapDialogOpen, setMapDialogOpen] = useState(false);

  const [startCity, setStartCity] = useState("");
  const [startAddress, setStartAddress] = useState("");
  const [endCity, setEndCity] = useState("");
  const [endAddress, setEndAddress] = useState("");
  const [waypoints, setWaypoints] = useState([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [routePreference, setRoutePreference] = useState("recommended");

  const [carBrand, setCarBrand] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carEngine, setCarEngine] = useState("");

  const [kmEntries, setKmEntries] = useState([]);
  const [deleteKmDialogOpen, setDeleteKmDialogOpen] = useState(false);
  const [kmToDelete, setKmToDelete] = useState(null);

  const [travelDate, setTravelDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });

  const validateInputsMap = () => {
    const errors = {};
    if (!travelDate) errors.travelDate = "Data Viaggio";
    return errors;
  };

  const showMessage = (message, severity = "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (_event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleValidationMap = async () => {
    const errors = validateInputsMap();
    if (Object.keys(errors).length > 0) {
      setInputErrors(errors);
      showMessage(
        "Impossibile generare Mappa, parametri mancanti: " +
          Object.values(errors).join(", "),
        "error"
      );
      return;
    }
    setInputErrors({});
    handleSelectRoute();
  };

  const handlePreview = async (type) => {
    try {
      const getMonthName = (date) => {
        return MONTHS[date.getMonth()];
      };

      let month;
      let period = "";

      if (kmEntries.length > 0) {
        const kmDates = kmEntries
          .filter(entry => entry.date)
          .map(entry => {
            const parts = entry.date.split("/");
            return new Date(parts[2], parts[1] - 1, parts[0]);
          });
        
        if (kmDates.length > 0) {
          kmDates.sort((a, b) => b - a);
          const lastDate = kmDates[0];
          
          const firstDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), 1);
          const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 0);
          
          const formatDate = (date) => {
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
          };
          
          period = `${formatDate(firstDay)} - ${formatDate(lastDay)}`;
          month = getMonthName(firstDay);
        } else {
          const now = new Date();
          month = getMonthName(now);
        }
      } else {
        const now = new Date();
        month = getMonthName(now);
      }

      const previewData = {
        cliente: "Cliente",
        oggettoAttivita: "Rimborso Chilometrico",
        cognome: "Cognome",
        nome: "Nome",
        sede: "Sede",
        kmEntries,
        filename: `RIMBORSO_KM_COGNOME_${month}_2025`,
        period: period,
      };

      if (type === "Excel") {
        sessionStorage.setItem("excelPreviewData", JSON.stringify(previewData));
        window.open("/excel-preview", "_blank");
      }
      if (type === "Word") {
        sessionStorage.setItem("wordPreviewData", JSON.stringify(previewData));
        window.open("/word-preview", "_blank");
      }
      if (type === "PDF") {
        sessionStorage.setItem("pdfPreviewData", JSON.stringify(previewData));
        window.open("/pdf-preview", "_blank");
      }
    } catch (error) {
      console.error(error);
      showMessage("Errore nella generazione dell'anteprima " + type, "error");
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const handleMapClose = () => {
    setMapDialogOpen(false);
  };

  const handleSelectRoute = async () => {
    if (!startCity || !startAddress || !endCity || !endAddress) {
      showMessage("Inserisci città e indirizzo di partenza e arrivo", "error");
      return;
    }

    setRouteLoading(true);

    try {
      const cities = [
        `${startCity}, ${startAddress}`,
        ...waypoints.map((wp) => `${wp.city}, ${wp.address}`),
        `${endCity}, ${endAddress}`,
      ];

      const response = await fetch(
        "https://cors.awskeytech.com/https://maps.awskeytech.com/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cities: cities,
            mode: "driving",
            preference: routePreference,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.error && data.invalid_cities) {
          const errorMessage = `${data.error}: ${data.invalid_cities.join(
            ", "
          )}`;
          showMessage(errorMessage, "error");
          throw new Error(errorMessage);
        }

        throw new Error(`Errore nella richiesta: ${response.status}`);
      }

      setRouteData(data);
      setMapDialogOpen(true);
      showMessage("Percorso calcolato con successo", "success");
    } catch (error) {
      console.error("Errore nel calcolo del percorso:", error);
      if (!error.message.includes("Impossibile trovare le coordinate")) {
        showMessage(
          `Errore nel calcolo del percorso: ${error.message}`,
          "error"
        );
      }
    } finally {
      setRouteLoading(false);
    }
  };

  const handlePreferenceChange = async (event) => {
    const newPreference = event.target.value;
    setRoutePreference(newPreference);

    if (mapDialogOpen && startCity && endCity) {
      setRouteLoading(true);

      try {
        const cities = [
          `${startCity}, ${startAddress}`,
          ...waypoints.map((wp) => `${wp.city}, ${wp.address}`),
          `${endCity}, ${endAddress}`,
        ];

        const response = await fetch(
          "https://cors.awskeytech.com/https://maps.awskeytech.com/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              cities: cities,
              mode: "driving",
              preference: newPreference,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 400 && data.error && data.invalid_cities) {
            const errorMessage = `${data.error}: ${data.invalid_cities.join(
              ", "
            )}`;
            showMessage(errorMessage, "error");
            throw new Error(errorMessage);
          }
          throw new Error(`Errore nella richiesta: ${response.status}`);
        }

        setRouteData(data);
        showMessage("Percorso ricalcolato con successo", "success");
      } catch (error) {
        console.error("Errore nel calcolo del percorso:", error);
        if (!error.message.includes("Impossibile trovare le coordinate")) {
          showMessage(
            `Errore nel calcolo del percorso: ${error.message}`,
            "error"
          );
        }
      } finally {
        setRouteLoading(false);
      }
    }
  };

  const handleAddRoute = (newKmEntry) => {
    setKmEntries([...kmEntries, newKmEntry]);
    showMessage("Percorso aggiunto alla tabella", "success");
  };

  const handleEditKm = (updatedKm) => {
    setKmEntries((prevEntries) => {
      const newEntries = [...prevEntries];
      newEntries[updatedKm.index] = {
        ...updatedKm,
      };
      delete newEntries[updatedKm.index].index;
      return newEntries;
    });
    showMessage("Rimborso chilometrico aggiornato", "success");
  };

  const handleDeleteKm = (index) => {
    setKmToDelete(index);
    setDeleteKmDialogOpen(true);
  };

  const confirmDeleteKm = () => {
    setKmEntries((prevEntries) => {
      const newEntries = [...prevEntries];
      newEntries.splice(kmToDelete, 1);
      return newEntries;
    });
    setDeleteKmDialogOpen(false);
    showMessage("Rimborso chilometrico eliminato", "success");
  };

  const handleCompanyCarToggle = (index) => {
    setKmEntries((prevEntries) => {
      const newEntries = [...prevEntries];
      newEntries[index] = {
        ...newEntries[index],
        isCompanyCar: !newEntries[index].isCompanyCar,
        amount: calculateKmAmount(
          newEntries[index].totalKm,
          !newEntries[index].isCompanyCar
        ),
      };
      return newEntries;
    });
  };

  const handleConfirmRoute = (confirmedRouteData) => {
    const formattedDate = travelDate ? 
      travelDate.split('-').reverse().join('/') : 
      new Date().toLocaleDateString('it-IT');
    
    const newKmEntry = {
      carBrand,
      carModel,
      carEngine,
      startCity,
      endCity,
      waypoints: waypoints.map((wp) => wp.city),
      totalKm: confirmedRouteData.distance_km,
      amount: calculateKmAmount(confirmedRouteData.distance_km, false),
      isCompanyCar: false,
      paymentMethod: "Elettronico",
      routePreference,
      date: formattedDate,
      userName: "Nome",
      userSurname: "Cognome"
    };

    handleAddRoute(newKmEntry);
    showMessage("Percorso aggiunto alla tabella dei rimborsi", "success");
  };

  const calculateKmAmount = (km, isCompanyCar) => {
    const distance = parseFloat(km);
    if (!isCompanyCar) return (distance * 0.4).toFixed(2);
    else {
      return (distance * 0.2).toFixed(2);
    }
  };

  const handleReset = () => {
    setKmEntries([]);
    showMessage("Percorsi svuotati", "success");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          p: 3,
          minHeight: "100vh",
          backgroundColor: "transparent",
        }}
      >
        <Paper
          sx={{
            width: "100%",
            maxWidth: MAX_WIDTH,
            p: 2,
            mb: 2,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: { xs: 2, sm: 0 },
          }}
          elevation={1}
        >
          <Box sx={{ flexGrow: { xs: 0, sm: 1 } }}>
            <img alt="Logo" src={logo} style={{ height: 32 }} />
          </Box>
          <Box sx={{ flexGrow: { xs: 0, sm: 1 } }}>
            <Typography
              variant="h5"
              sx={{
                color: "#656463",
                fontFamily: '"Conthrax SemiBold", sans-serif',
                fontWeight: "bold",
                textAlign: { xs: "center", sm: "left" },
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
              }}
            >
              Rimborso KM
            </Typography>
          </Box>
        </Paper>

        <Box
          sx={{
            width: "100%",
            maxWidth: MAX_WIDTH,
          }}
        >
          <Grid
            container
            spacing={1}
            sx={{
              width: "100%",
              pt: 2,
              margin: 0,
            }}
          >
            <Grid size={12} sx={{ mt: 2, mb: 2 }}>
              <RimborsiKm
                startCity={startCity}
                setStartCity={setStartCity}
                startAddress={startAddress}
                setStartAddress={setStartAddress}
                endCity={endCity}
                setEndCity={setEndCity}
                endAddress={endAddress}
                setEndAddress={setEndAddress}
                waypoints={waypoints}
                setWaypoints={setWaypoints}
                handleValidationMap={handleValidationMap}
                routeLoading={routeLoading}
                carBrand={carBrand}
                setCarBrand={setCarBrand}
                carModel={carModel}
                setCarModel={setCarModel}
                carEngine={carEngine}
                setCarEngine={setCarEngine}
                inputErrors={inputErrors}
                kmEntries={kmEntries}
                onDeleteKm={handleDeleteKm}
                onEditKm={handleEditKm}
                onCompanyCarToggle={handleCompanyCarToggle}
                onAddRoute={handleAddRoute}
                routeData={routeData}
                calculateKmAmount={calculateKmAmount}
                travelDate={travelDate}
                setTravelDate={setTravelDate}
              />
            </Grid>

            <Grid size={12}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Box sx={{ flex: 1, maxWidth: "100%" }}>
                  <SummaryCard kmEntries={kmEntries} />
                </Box>
              </Box>
            </Grid>

            <Grid size={12} sx={{ pb: 4, display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button variant="outlined" color="error" onClick={handleReset}>
                Svuota Percorsi
              </Button>
            </Grid>
          </Grid>
        </Box>

        <MapDialog
          open={mapDialogOpen}
          onClose={handleMapClose}
          routeData={routeData}
          routeLoading={routeLoading}
          routePreference={routePreference}
          handlePreferenceChange={handlePreferenceChange}
          formatDuration={formatDuration}
          onConfirm={handleConfirmRoute}
        />

        <Dialog
          open={deleteKmDialogOpen}
          onClose={() => setDeleteKmDialogOpen(false)}
          aria-labelledby="delete-km-dialog-title"
          aria-describedby="delete-km-dialog-description"
        >
          <DialogTitle id="delete-km-dialog-title">
            {"Conferma eliminazione"}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ py: 1 }}>
              <Typography variant="body1">
                Sei sicuro di voler eliminare questo rimborso chilometrico?
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteKmDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={confirmDeleteKm} color="error" autoFocus>
              Elimina
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            severity={snackbar.severity}
            action={
              <IconButton
                size="small"
                onClick={handleCloseSnackbar}
                sx={{
                  color:
                    snackbar.severity === "success"
                      ? theme.palette.success.main
                      : "inherit",
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "& .MuiAlert-icon": {
                color:
                  snackbar.severity === "success"
                    ? theme.palette.success.main
                    : "inherit",
              },
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            backgroundColor: "rgb(245, 245, 245)",
            padding: "8px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(0, 0, 0, 0.1)",
            zIndex: 10,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography 
              variant="body2" 
              sx={{ 
                display: "flex", 
                alignItems: "center",
                color: "text.secondary",
                fontSize: "0.70rem"
              }}
            >
             Developed by&nbsp;<b>© Keytech</b>&nbsp;Web Team
            </Typography>
          </Box>
          <Typography 
            variant="body2" 
            sx={{ 
              color: "text.secondary",
              fontSize: "0.70rem"
            }}
          >
            Powered by <b>Keytech AI</b>
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
