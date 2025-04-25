import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ThemeProvider, CssBaseline, Box, Typography, Button, Paper, FormControl, InputLabel, MenuItem, Select, FormHelperText, TextField, Checkbox, FormGroup, FormControlLabel, Grid, Switch, Radio, RadioGroup, Snackbar, Alert, IconButton, CircularProgress } from "@mui/material";
import { theme } from "./theme";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CloseIcon from "@mui/icons-material/Close";

// Dialog component for showing the route
const RouteDialog = ({ open, onClose, routeData, formatDuration }) => {
  if (!open || !routeData) return null;
  
  // Function to create a Google Maps URL with the correct order of addresses
  const createGoogleMapsUrl = () => {
    if (!routeData || !routeData.cities || routeData.cities.length < 2) {
      return "";
    }
    
    // Start building the URL
    let url = "https://www.google.com/maps/dir/?api=1";
    
    // Add origin (first address)
    url += `&origin=${encodeURIComponent(routeData.cities[0])}`;
    
    // Add destination (last address)
    url += `&destination=${encodeURIComponent(routeData.cities[routeData.cities.length - 1])}`;
    
    // Add waypoints (addresses in between)
    if (routeData.cities.length > 2) {
      const waypoints = routeData.cities.slice(1, -1);
      url += `&waypoints=${waypoints.map(address => encodeURIComponent(address)).join('|')}`;
    }
    
    // Add travel mode
    url += "&travelmode=driving";
    
    return url;
  };
  
  return (
    <Box 
      sx={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <Paper 
        sx={{ 
          width: '90%', 
          maxWidth: '800px', 
          maxHeight: '90vh',
          p: 3,
          overflowY: 'auto' 
        }}
        onClick={e => e.stopPropagation()}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">Percorso Ottimizzato</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Dettagli Percorso</Typography>
          <Typography><strong>Distanza Totale:</strong> {routeData.distance_km} km</Typography>
          <Typography><strong>Durata Stimata:</strong> {formatDuration(routeData.duration_min)}</Typography>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Ordine di Raccolta</Typography>
          {routeData.cities && routeData.cities.map((city, index) => (
            <Paper 
              key={index} 
              sx={{ 
                p: 2, 
                mb: 1, 
                backgroundColor: index === 0 ? 'rgba(25, 118, 210, 0.1)' : 
                                index === routeData.cities.length - 1 ? 'rgba(76, 175, 80, 0.1)' : 
                                'rgba(0, 0, 0, 0.03)' 
              }}
            >
              <Typography variant="subtitle1">{index + 1}. {routeData.friends[index]}</Typography>
              <Typography variant="body2" color="text.secondary">{city}</Typography>
            </Paper>
          ))}

        </Box>
        
        <Button 
          variant="outlined" 
          href={createGoogleMapsUrl()}
          target="_blank"
          fullWidth
        >
          Apri in Google Maps
        </Button>
      </Paper>
    </Box>
  );
};

// Friends Trip Planner App
export const FriendsTripPlanner = () => {
  // Define the list of friends with their addresses
  const [friends, setFriends] = useState([
    { name: "Mattosky", address: "Via Nadir Quinto, 42, 00127 Roma RM" },
    { name: "Nino", address: "Largo Dino Battaglia, 5, 00127 Roma RM" },
    { name: "Giorgia", address: "Viale Cherubino Malpeli, 89, 00128 Roma RM" },
    { name: "Mati (mamma)", address: "Via Enrico Giachino, 31, 00144 Roma RM" },
    { name: "Mati (papà)", address: "Via Filippo de Grenet, 69, 00128 Roma RM" },
    { name: "Noemi", address: "Via Vitaliano Rotellini, 65, 00128 Roma RM" },
    { name: "Luigi", address: "Viale dell'Astronomia, 21, 00144 Roma RM" },
    { name: "Laura", address: "Via Fiume Giallo, 354, 00144 Roma RM" },
    { name: "Rocco", address: "Viale Camillo Sabatini, 150, 00144 Roma RM" },
  ]);
  
  const [driver, setDriver] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [destinationType, setDestinationType] = useState("address");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [destinationFriend, setDestinationFriend] = useState("");
  const [optimizeRoute, setOptimizeRoute] = useState(true);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });
  
  // Update friend address
  const updateFriendAddress = (friendName, address) => {
    setFriends(prevFriends => 
      prevFriends.map(friend => 
        friend.name === friendName ? { ...friend, address } : friend
      )
    );
  };
  
  const handleDriverChange = (event) => {
    setDriver(event.target.value);
  };
  
  const handleFriendSelection = (event) => {
    const friendName = event.target.value;
    if (event.target.checked) {
      setSelectedFriends(prev => [...prev, friendName]);
    } else {
      setSelectedFriends(prev => prev.filter(name => name !== friendName));
    }
  };
  
  const handleDestinationTypeChange = (event) => {
    setDestinationType(event.target.value);
    
    // Clear the other destination type
    if (event.target.value === "address") {
      setDestinationFriend("");
    } else {
      setDestinationAddress("");
    }
  };
  
  const showMessage = (message, severity = "error") => {
    setSnackbar({ open: true, message, severity });
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };
  
  const validateInputs = () => {
    if (!driver) {
      showMessage("Seleziona un guidatore");
      return false;
    }
    
    const driverFriend = friends.find(f => f.name === driver);
    if (!driverFriend.address) {
      showMessage("Inserisci l'indirizzo del guidatore");
      return false;
    }
    
    if (selectedFriends.length === 0) {
      showMessage("Seleziona almeno un amico da raccogliere");
      return false;
    }
    
    // Check if all selected friends have addresses
    const missingAddresses = selectedFriends.filter(name => {
      const friend = friends.find(f => f.name === name);
      return !friend.address;
    });
    
    if (missingAddresses.length > 0) {
      showMessage(`Inserisci gli indirizzi per: ${missingAddresses.join(", ")}`);
      return false;
    }
    
    // Check destination
    if (destinationType === "address" && !destinationAddress) {
      showMessage("Inserisci un indirizzo di destinazione");
      return false;
    }
    
    if (destinationType === "friend" && !destinationFriend) {
      showMessage("Seleziona un amico come destinazione");
      return false;
    }
    
    if (destinationType === "friend") {
      const destFriend = friends.find(f => f.name === destinationFriend);
      if (!destFriend.address) {
        showMessage(`Inserisci un indirizzo per ${destinationFriend}`);
        return false;
      }
    }
    
    return true;
  };
  
  // API endpoint - use environment variables or detect environment
  const getApiEndpoint = () => {
    // For local development
    if (window.location.hostname === 'localhost') {
      return "http://localhost:8000/";
    } 
    // For production deployment - using your Render backend URL
    else {
      return "https://onore-ai-sopravvissuti-backend.onrender.com/";
    }
  };
  
  const handleCalculateRoute = async () => {
    if (!validateInputs()) return;
    
    setRouteLoading(true);
    
    try {
      // Start with driver's location
      const driverFriend = friends.find(f => f.name === driver);
      const cities = [`${driverFriend.address}`];
      const friendNames = [driver];
      
      // Add friends to pick up
      for (const friendName of selectedFriends) {
        const friend = friends.find(f => f.name === friendName);
        cities.push(`${friend.address}`);
        friendNames.push(friendName);
      }
      
      // Add destination
      if (destinationType === "friend") {
        const destFriend = friends.find(f => f.name === destinationFriend);
        cities.push(`${destFriend.address}`);
        friendNames.push(destinationFriend);
      } else {
        cities.push(`${destinationAddress}`);
        friendNames.push("Destinazione");
      }
      
      const response = await fetch(getApiEndpoint(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cities: cities,
          mode: "driving",
          preference: "recommended",
          optimize: optimizeRoute,
          friends: friendNames
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Impossibile calcolare il percorso");
      }
      
      setRouteData(data);
      setDialogOpen(true);
      showMessage("Percorso calcolato con successo!", "success");
    } catch (error) {
      console.error("Errore nel calcolo del percorso:", error);
      showMessage(error.message || "Impossibile calcolare il percorso");
    } finally {
      setRouteLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 3, maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <Paper
          sx={{
            p: 2,
            mb: 3,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: { xs: 2, sm: 0 },
          }}
          elevation={1}
        >
          <Box sx={{ flexGrow: { xs: 0, sm: 1 } }}>
            {/* Logo removed */}
          </Box>
          <Box sx={{ flexGrow: { xs: 0, sm: 1 } }}>
            <Typography
              variant="h5"
              sx={{
                color: "#656463",
                fontFamily: '"Roboto, sans-serif',
                fontWeight: "bold",
                textAlign: "center",
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
              }}
            >
              Onore ai Sopravvissuti
            </Typography>
          </Box>
        </Paper>
        
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Pianifica il tuo percorso
          </Typography>
          <Typography variant="body1" paragraph>
            Seleziona chi guida, chi deve essere raccolto e dove state andando.
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={optimizeRoute}
                onChange={(e) => setOptimizeRoute(e.target.checked)}
                color="primary"
              />
            }
            label="Ottimizza ordine di raccolta (risparmia tempo e carburante)"
          />
          
          {/* Driver selection */}
          <Box sx={{ mb: 4, mt: 3 }}>
            <Typography variant="h6" gutterBottom>Guidatore</Typography>
            <FormControl fullWidth>
              <InputLabel id="driver-select-label">Seleziona l'astemio della serata</InputLabel>
              <Select
                labelId="driver-select-label"
                value={driver}
                label="Seleziona Guidatore"
                onChange={handleDriverChange}
              >
                <MenuItem value=""><em>Seleziona guidatore</em></MenuItem>
                {friends.map((friend) => (
                  <MenuItem 
                    key={friend.name} 
                    value={friend.name}
                    disabled={friend.name === "Laura"} // Disable Laura as a driver
                  >
                    {friend.name}
                    {friend.name === "Laura" && (
                      <Typography 
                        component="span" 
                        variant="caption" 
                        sx={{ 
                          ml: 1, 
                          color: 'text.secondary',
                          fontStyle: 'italic',
                          fontSize: '0.7rem'
                        }}
                      >
                        (Coming Soon)
                      </Typography>
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {driver && (
              <TextField
                fullWidth
                label={`Indirizzo di ${driver}`}
                value={friends.find(f => f.name === driver)?.address || ""}
                onChange={(e) => updateFriendAddress(driver, e.target.value)}
                margin="normal"
                placeholder="Inserisci indirizzo completo con città"
              />
            )}
          </Box>
          
          {/* Friends selection */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>Sopravvissuti da Raccogliere</Typography>
            <FormGroup sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
              {friends
                .filter(f => f.name !== driver && (destinationType !== "friend" || f.name !== destinationFriend))
                .map((friend) => (
                  <FormControlLabel
                    key={friend.name}
                    control={
                      <Checkbox 
                        checked={selectedFriends.includes(friend.name)}
                        onChange={handleFriendSelection}
                        value={friend.name}
                      />
                    }
                    label={friend.name}
                    sx={{ width: { xs: '100%', sm: '50%', md: '33%' } }}
                  />
                ))
              }
            </FormGroup>
            
            {selectedFriends.length > 0 && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {selectedFriends.map((friendName) => (
                  <Grid item xs={12} sm={6} md={4} key={friendName}>
                    <TextField
                      fullWidth
                      label={`Indirizzo di ${friendName}`}
                      value={friends.find(f => f.name === friendName)?.address || ""}
                      onChange={(e) => updateFriendAddress(friendName, e.target.value)}
                      margin="normal"
                      placeholder={`Inserisci indirizzo completo con città`}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
          
          {/* Destination */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>Destinazione</Typography>
            
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <RadioGroup 
                row 
                value={destinationType} 
                onChange={handleDestinationTypeChange}
              >
                <FormControlLabel value="address" control={<Radio />} label="Indirizzo Personalizzato" />
                <FormControlLabel value="friend" control={<Radio />} label="Indirizzo di un Amico" />
              </RadioGroup>
            </FormControl>
            
            {destinationType === "address" ? (
              <TextField
                fullWidth
                label="Indirizzo di Destinazione"
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                margin="normal"
                placeholder="Inserisci indirizzo completo di destinazione con città"
              />
            ) : (
              <FormControl fullWidth margin="normal">
                <InputLabel id="destination-friend-label">Seleziona Amico Destinazione</InputLabel>
                <Select
                  labelId="destination-friend-label"
                  value={destinationFriend}
                  label="Seleziona Amico Destinazione"
                  onChange={(e) => setDestinationFriend(e.target.value)}
                >
                  <MenuItem value=""><em>Seleziona amico</em></MenuItem>
                  {friends
                    .filter(f => f.name !== driver && !selectedFriends.includes(f.name))
                    .map((friend) => (
                      <MenuItem 
                        key={friend.name} 
                        value={friend.name}
                        disabled={!friend.address}
                      >
                        {friend.name}
                        {!friend.address && " (indirizzo necessario)"}
                      </MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            )}
          </Box>
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button 
              variant="contained" 
              size="large"
              onClick={handleCalculateRoute}
              disabled={routeLoading}
              startIcon={routeLoading ? <CircularProgress size={20} color="inherit" /> : <DirectionsCarIcon />}
              sx={{ minWidth: 220 }}
            >
              {routeLoading ? "Calcolo in corso..." : "Trova Miglior Percorso"}
            </Button>
          </Box>
        </Paper>
      </Box>
      
      {/* Route Result Dialog */}
      <RouteDialog 
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        routeData={routeData}
        formatDuration={formatDuration}
      />
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={handleCloseSnackbar}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Footer */}
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
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontSize: "0.70rem",
          }}
        >
          Pianificatore Viaggi Amici &nbsp;-&nbsp; 25 Aprile 2025
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontSize: "0.70rem",
          }}
        >
          Creato per Mattosky, Nino, Giorgia, Mati, Noemi, Luigi, Laura e Rocco
        </Typography>
      </Box>
    </ThemeProvider>
  );
};

// Only render directly if this file is the entry point
if (import.meta.env.DEV) {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <React.StrictMode>
      <FriendsTripPlanner />
    </React.StrictMode>
  );
}
