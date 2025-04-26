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
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  Switch,
  Typography,
  useMediaQuery,
  useTheme,
  ImageList,
  ImageListItem,
  Fade,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import React, { useState, useEffect } from "react";
import { MapDialog } from "./components/dialogs/MapDialog";
import { RimborsiKm } from "./components/forms/RimborsiKm";
import { theme } from "./theme";

const MAX_WIDTH = "1200px";

// Define the list of friends
const FRIENDS = [
  { name: "Mattosky", address: "" },
  { name: "Nino", address: "" },
  { name: "Giorgia", address: "" },
  { name: "Mati (mamma)", address: "" },
  { name: "Mati (papa)", address: "" },
  { name: "Noemi", address: "" },
  { name: "Luigi", address: "" },
  { name: "Laura", address: "" },
  { name: "Rocco", address: "" },
];

function App() {
  const [inputErrors, setInputErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  
  // Slideshow state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [
    "/Media (2).jpg",
    "/Media (3).jpg"
  ];

  // Slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds
    
    return () => clearInterval(interval);
  }, [images.length]);

  const [friends, setFriends] = useState(FRIENDS);
  const [driver, setDriver] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [destinationFriend, setDestinationFriend] = useState("");
  
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [waypoints, setWaypoints] = useState([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [routePreference, setRoutePreference] = useState("recommended");
  const [optimizeRoute, setOptimizeRoute] = useState(true);
  
  const [travelDate, setTravelDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
  });

  // Update friend address
  const updateFriendAddress = (friendName, address) => {
    setFriends(prevFriends => 
      prevFriends.map(friend => 
        friend.name === friendName ? { ...friend, address } : friend
      )
    );
  };

  const validateInputs = () => {
    const errors = {};
    if (!driver) errors.driver = "Driver is required";
    if (selectedFriends.length === 0) errors.friends = "Select at least one friend";
    if (!destinationAddress && !destinationFriend) errors.destination = "Destination is required";
    
    // Check if driver has address
    const driverFriend = friends.find(f => f.name === driver);
    if (driverFriend && !driverFriend.address) {
      errors.driverAddress = "Driver's address is required";
    }
    
    // Check if selected friends have addresses
    const missingAddresses = selectedFriends.filter(name => {
      const friend = friends.find(f => f.name === name);
      return friend && !friend.address;
    });
    
    if (missingAddresses.length > 0) {
      errors.friendAddresses = `Missing addresses for: ${missingAddresses.join(', ')}`;
    }
    
    // If destination is a friend, check if they have an address
    if (destinationFriend) {
      const destFriend = friends.find(f => f.name === destinationFriend);
      if (destFriend && !destFriend.address) {
        errors.destinationAddress = "Destination friend's address is required";
      }
    }
    
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
    const errors = validateInputs();
    if (Object.keys(errors).length > 0) {
      setInputErrors(errors);
      showMessage(
        "Cannot generate route: " +
          Object.values(errors).join(", "),
        "error"
      );
      return;
    }
    
    setInputErrors({});
    handleSelectRoute();
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
    if (!driver || selectedFriends.length === 0 || (!destinationAddress && !destinationFriend)) {
      showMessage("Please select driver, friends to pick up, and destination", "error");
      return;
    }
    
    const driverFriend = friends.find(f => f.name === driver);
    if (!driverFriend.address) {
      showMessage("Driver's address is required", "error");
      return;
    }
    
    setRouteLoading(true);

    try {
      // Start with driver's location
      const cities = [`${driverFriend.address}`];
      const friendNames = [driver];
      
      // Add friends to pick up
      for (const friendName of selectedFriends) {
        const friend = friends.find(f => f.name === friendName);
        if (friend && friend.address) {
          cities.push(`${friend.address}`);
          friendNames.push(friendName);
        }
      }
      
      // Add destination
      if (destinationFriend) {
        const destFriend = friends.find(f => f.name === destinationFriend);
        if (destFriend && destFriend.address) {
          cities.push(`${destFriend.address}`);
          friendNames.push(destinationFriend);
        }
      } else if (destinationAddress) {
        cities.push(`${destinationAddress}`);
        friendNames.push("Destination");
      }

      const response = await fetch(
        "http://localhost:8000/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cities: cities,
            mode: "driving",
            preference: routePreference,
            optimize: optimizeRoute,
            friends: friendNames
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

        throw new Error(`Error in request: ${response.status}`);
      }

      setRouteData(data);
      setMapDialogOpen(true);
      showMessage("Route calculated successfully", "success");
    } catch (error) {
      console.error("Error calculating route:", error);
      if (!error.message.includes("Cannot find coordinates")) {
        showMessage(
          `Error calculating route: ${error.message}`,
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

    if (mapDialogOpen) {
      setRouteLoading(true);

      try {
        // Start with driver's location
        const driverFriend = friends.find(f => f.name === driver);
        const cities = [`${driverFriend.address}`];
        const friendNames = [driver];
        
        // Add friends to pick up
        for (const friendName of selectedFriends) {
          const friend = friends.find(f => f.name === friendName);
          if (friend && friend.address) {
            cities.push(`${friend.address}`);
            friendNames.push(friendName);
          }
        }
        
        // Add destination
        if (destinationFriend) {
          const destFriend = friends.find(f => f.name === destinationFriend);
          if (destFriend && destFriend.address) {
            cities.push(`${destFriend.address}`);
            friendNames.push(destinationFriend);
          }
        } else if (destinationAddress) {
          cities.push(`${destinationAddress}`);
          friendNames.push("Destination");
        }

        const response = await fetch(
          "http://localhost:8000/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              cities: cities,
              mode: "driving",
              preference: newPreference,
              optimize: optimizeRoute,
              friends: friendNames
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
          throw new Error(`Error in request: ${response.status}`);
        }

        setRouteData(data);
        showMessage("Route recalculated successfully", "success");
      } catch (error) {
        console.error("Error calculating route:", error);
        if (!error.message.includes("Cannot find coordinates")) {
          showMessage(
            `Error calculating route: ${error.message}`,
            "error"
          );
        }
      } finally {
        setRouteLoading(false);
      }
    }
  };

  const handleConfirmRoute = (confirmedRouteData) => {
    showMessage("Route confirmed!", "success");
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
              Onore ai Sopravvissuti
            </Typography>
          </Box>
        </Paper>

        {/* Image Slideshow */}
        <Box 
          sx={{ 
            width: "100%", 
            maxWidth: MAX_WIDTH,
            mb: 2,
            height: { xs: '200px', sm: '300px', md: '400px' },
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 2,
            boxShadow: 3
          }}
        >
          {images.map((img, index) => (
            <Fade 
              key={index} 
              in={currentImageIndex === index} 
              timeout={800}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                display: currentImageIndex === index ? 'block' : 'none'
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${img})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            </Fade>
          ))}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              p: 2,
              textAlign: 'center'
            }}
          >
            <Typography variant="h6">Onore ai Sopravvissuti</Typography>
            <Typography variant="body2">April 25, 2025</Typography>
          </Box>
        </Box>

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
            <Grid item xs={12} sx={{ mt: 2, mb: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Onore ai Sopravvissuti
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Commemorate our survivors by planning an efficient route to pick everyone up! 
                    Select who's driving, who needs to be picked up, and let the optimizer calculate the best
                    pickup order to honor their memory.
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={optimizeRoute}
                        onChange={(e) => setOptimizeRoute(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Optimize pickup order"
                  />
                </Paper>
              </Box>
              <RimborsiKm
                friends={friends}
                updateFriendAddress={updateFriendAddress}
                driver={driver}
                setDriver={setDriver}
                selectedFriends={selectedFriends}
                setSelectedFriends={setSelectedFriends}
                destinationAddress={destinationAddress}
                setDestinationAddress={setDestinationAddress}
                destinationFriend={destinationFriend}
                setDestinationFriend={setDestinationFriend}
                handleValidationMap={handleValidationMap}
                routeLoading={routeLoading}
                travelDate={travelDate}
                setTravelDate={setTravelDate}
                inputErrors={inputErrors}
                optimizeRoute={optimizeRoute}
                setOptimizeRoute={setOptimizeRoute}
              />
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
          optimizeRoute={optimizeRoute}
        />

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
            padding: { xs: "8px", sm: "8px 16px" },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            borderTop: "1px solid rgba(0, 0, 0, 0.1)",
            zIndex: 10,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", width: { xs: "100%", sm: "auto" } }}>
            <Typography
              variant="body2"
              sx={{
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
                fontSize: "0.70rem",
              }}
            >
              Onore ai Sopravvissuti &nbsp;-&nbsp; April 25, 2025
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontSize: "0.70rem",
              mt: { xs: 1, sm: 0 },
              width: { xs: "100%", sm: "auto" },
              textAlign: { xs: "left", sm: "right" },
            }}
          >
            Made for Mattosky, Nino, Giorgia, Mati, Noemi, Luigi, Laura, and Rocco
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
