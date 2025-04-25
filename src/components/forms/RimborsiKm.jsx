import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MapIcon from "@mui/icons-material/Map";
import PersonIcon from "@mui/icons-material/Person";
import InfoIcon from "@mui/icons-material/Info";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
  Box,
  Button,
  Card,
  CardHeader,
  Checkbox,
  Collapse,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useState, useEffect } from "react";

export const RimborsiKm = ({
  friends,
  updateFriendAddress,
  driver,
  setDriver,
  selectedFriends,
  setSelectedFriends,
  destinationAddress,
  setDestinationAddress,
  destinationFriend,
  setDestinationFriend,
  handleValidationMap,
  routeLoading,
  travelDate,
  setTravelDate,
  inputErrors,
  optimizeRoute,
  setOptimizeRoute,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [destinationType, setDestinationType] = useState(destinationFriend ? "friend" : "address");
  
  // Initialize available friends for pickup (filtering out the driver and destination friend)
  const [availableForPickup, setAvailableForPickup] = useState([]);
  
  // Update available friends whenever driver or destination friend changes
  useEffect(() => {
    // Filter out driver and destination friend from the available pickup options
    setAvailableForPickup(
      friends
        .filter(f => f.name !== driver && (destinationType !== "friend" || f.name !== destinationFriend))
        .map(f => f.name)
    );
    
    // If driver is part of selected friends, remove them
    if (driver && selectedFriends.includes(driver)) {
      setSelectedFriends(prev => prev.filter(name => name !== driver));
    }
    
    // If destination friend is part of selected friends, remove them
    if (destinationType === "friend" && destinationFriend && selectedFriends.includes(destinationFriend)) {
      setSelectedFriends(prev => prev.filter(name => name !== destinationFriend));
    }
  }, [driver, destinationFriend, destinationType, friends]);
  
  const handleExpandToggle = () => {
    setExpanded(!expanded);
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
    const newType = event.target.value;
    setDestinationType(newType);
    
    if (newType === "friend") {
      setDestinationAddress("");
    } else {
      setDestinationFriend("");
    }
  };
  
  return (
    <Card
      className="MuiCard-solidBorder"
      sx={{
        boxShadow:
          "rgba(0, 0, 0, 0.1) 0px 4px 30px, rgba(255, 255, 255, 0.6) 0px 1px 1px inset",
        position: "relative",
      }}
    >
      <CardHeader
        title="Trip Route Planner"
        action={
          <IconButton
            onClick={handleExpandToggle}
            aria-expanded={expanded}
            aria-label="show/hide details"
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
        sx={{
          opacity: 1,
          padding: "8px",
          backgroundColor: "#f9f9f9",
          borderBottom: "1px solid #e0e0e0",
        }}
      />

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{ padding: "16px" }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Trip Date"
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
            
            {/* Driver Section */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1, mb: 1 }}>
                <DirectionsCarIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="subtitle1">Driver Selection</Typography>
                <Tooltip title="Select who's driving and enter their address" arrow>
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small" error={!!inputErrors?.driver}>
                <InputLabel id="driver-select-label">Driver *</InputLabel>
                <Select
                  labelId="driver-select-label"
                  id="driver-select"
                  value={driver}
                  label="Driver *"
                  onChange={(e) => setDriver(e.target.value)}
                >
                  <MenuItem value=""><em>Select driver</em></MenuItem>
                  {friends.map((friend) => (
                    <MenuItem key={friend.name} value={friend.name}>
                      {friend.name}
                    </MenuItem>
                  ))}
                </Select>
                {!!inputErrors?.driver && (
                  <FormHelperText>{inputErrors.driver}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {driver && (
              <Grid item xs={12} sm={6} md={8}>
                <TextField
                  fullWidth
                  label={`${driver}'s Address *`}
                  value={friends.find(f => f.name === driver)?.address || ""}
                  onChange={(e) => updateFriendAddress(driver, e.target.value)}
                  error={!!inputErrors?.driverAddress}
                  helperText={inputErrors?.driverAddress}
                  size="small"
                  margin="dense"
                  placeholder="Enter full address with city"
                />
              </Grid>
            )}
            
            {/* Friend Selection Section */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1, mb: 1 }}>
                <PersonIcon sx={{ mr: 1, color: "secondary.main" }} />
                <Typography variant="subtitle1">Friends to Pick Up</Typography>
                <Tooltip title="Select which friends need a ride" arrow>
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl 
                component="fieldset" 
                variant="standard" 
                error={!!inputErrors?.friends}
                sx={{ width: '100%' }}
              >
                <FormLabel component="legend">Select friends to pick up *</FormLabel>
                <FormGroup sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', mt: 1 }}>
                  {availableForPickup.map((friendName) => {
                    const friend = friends.find(f => f.name === friendName);
                    return (
                      <FormControlLabel
                        key={friendName}
                        control={
                          <Checkbox 
                            checked={selectedFriends.includes(friendName)}
                            onChange={handleFriendSelection}
                            value={friendName}
                          />
                        }
                        label={
                          <Box>
                            {friendName}
                            {!friend.address && (
                              <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                                (address needed)
                              </Typography>
                            )}
                          </Box>
                        }
                        sx={{ width: { xs: '100%', sm: '50%', md: '33%' } }}
                      />
                    );
                  })}
                </FormGroup>
                {!!inputErrors?.friends && (
                  <FormHelperText>{inputErrors.friends}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {/* Display fields for selected friends' addresses */}
            {selectedFriends.length > 0 && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Addresses for Selected Friends
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedFriends.map((friendName) => (
                      <Grid item xs={12} sm={6} md={4} key={friendName}>
                        <TextField
                          fullWidth
                          label={`${friendName}'s Address *`}
                          value={friends.find(f => f.name === friendName)?.address || ""}
                          onChange={(e) => updateFriendAddress(friendName, e.target.value)}
                          error={inputErrors?.friendAddresses && inputErrors.friendAddresses.includes(friendName)}
                          size="small"
                          margin="dense"
                          placeholder="Enter full address with city"
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            )}
            
            {/* Destination Section */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "center", mt: 2, mb: 1 }}>
                <LocationOnIcon sx={{ mr: 1, color: "success.main" }} />
                <Typography variant="subtitle1">Destination</Typography>
                <Tooltip title="Select where everyone is going" arrow>
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl component="fieldset" error={!!inputErrors?.destination}>
                <FormLabel component="legend">Destination Type *</FormLabel>
                <RadioGroup
                  row
                  name="destination-type"
                  value={destinationType}
                  onChange={handleDestinationTypeChange}
                >
                  <FormControlLabel 
                    value="address" 
                    control={<Radio />} 
                    label="Custom Address" 
                  />
                  <FormControlLabel 
                    value="friend" 
                    control={<Radio />} 
                    label="Friend's Address" 
                  />
                </RadioGroup>
                {!!inputErrors?.destination && (
                  <FormHelperText>{inputErrors.destination}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {destinationType === "address" ? (
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Destination Address *"
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  error={!!inputErrors?.destination}
                  size="small"
                  margin="dense"
                  placeholder="Enter final destination address"
                />
              </Grid>
            ) : (
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small" error={!!inputErrors?.destination}>
                  <InputLabel id="destination-friend-label">Destination Friend *</InputLabel>
                  <Select
                    labelId="destination-friend-label"
                    value={destinationFriend}
                    label="Destination Friend *"
                    onChange={(e) => setDestinationFriend(e.target.value)}
                  >
                    <MenuItem value=""><em>Select friend</em></MenuItem>
                    {friends
                      .filter(f => f.name !== driver)
                      .map((friend) => (
                        <MenuItem 
                          key={friend.name} 
                          value={friend.name}
                          disabled={!friend.address}
                        >
                          {friend.name}
                          {!friend.address && " (address needed)"}
                        </MenuItem>
                      ))}
                  </Select>
                  {!!inputErrors?.destinationAddress && (
                    <FormHelperText>{inputErrors.destinationAddress}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}
            
            <Grid
              item
              xs={12}
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 3,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleValidationMap}
                disabled={routeLoading}
                sx={{ minWidth: 200 }}
                startIcon={<DirectionsCarIcon />}
              >
                {routeLoading ? "Calculating Route..." : "Find Best Pickup Order"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Card>
  );
};
