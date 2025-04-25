import CloseIcon from "@mui/icons-material/Close";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PersonIcon from "@mui/icons-material/Person";
import PlaceIcon from "@mui/icons-material/Place";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import React from "react";
import { Maps } from "../maps/Maps";

export const MapDialog = ({
  open,
  onClose,
  routeData,
  routeLoading,
  routePreference,
  handlePreferenceChange,
  formatDuration,
  onConfirm,
  optimizeRoute,
}) => {
  const preferenceOptions = [
    { value: "recommended", label: "Consigliato" },
    { value: "fastest", label: "Più veloce" },
    { value: "shortest", label: "Più breve" },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          height: "90vh",
          maxHeight: "90vh",
          position: "relative",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
        }}
      >
        <Typography variant="h6" component="div">
          {optimizeRoute ? "Optimized Route" : "Trip Route"} 
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControl
            variant="outlined"
            size="small"
            sx={{ minWidth: "150px" }}
          >
            <Select
              value={routePreference}
              onChange={handlePreferenceChange}
              displayEmpty
              inputProps={{ "aria-label": "Without label" }}
            >
              {preferenceOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {routeLoading && (
        <LinearProgress sx={{ position: "absolute", top: 0, left: 0, right: 0 }} />
      )}

      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          height: "calc(90vh - 130px)",
        }}
      >
        {/* Sidebar with route details */}
        <Paper
          sx={{
            width: { xs: "100%", sm: "320px" },
            height: { xs: "auto", sm: "100%" },
            overflow: "auto",
            p: 2,
            borderRadius: 0,
            boxShadow: "none",
            borderRight: "1px solid rgba(0, 0, 0, 0.12)",
          }}
          elevation={0}
        >
          {routeLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                p: 4,
              }}
            >
              <Typography>Calculating best route...</Typography>
            </Box>
          ) : (
            <>
              {routeData && (
                <>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="primary"
                    gutterBottom
                  >
                    {optimizeRoute ? "Optimized Pickup Order" : "Pickup Order"}
                  </Typography>

                  {/* Driver */}
                  {routeData.friends && routeData.friends.length > 0 && (
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2,
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: 'rgba(25, 118, 210, 0.1)'
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          bgcolor: 'primary.main',
                          width: 36, 
                          height: 36
                        }}
                      >
                        <DirectionsCarIcon sx={{ fontSize: 20 }} />
                      </Avatar>
                      <Box sx={{ ml: 1.5 }}>
                        <Typography variant="subtitle2">
                          {routeData.friends[0]}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Driver
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ mb: 2 }}>
                    {/* Friends to pickup */}
                    {routeData.cities && routeData.cities.map((city, index) => {
                      // Skip the first (driver) and last (destination)
                      if (index === 0 || index === routeData.cities.length - 1) return null;
                      
                      return (
                        <Box 
                          key={index} 
                          sx={{ 
                            display: 'flex', 
                            mb: 1,
                            position: 'relative'
                          }}
                        >
                          {/* Vertical timeline connector */}
                          <Box sx={{ 
                            position: 'absolute', 
                            left: 18, 
                            top: 0, 
                            bottom: 0, 
                            width: 2, 
                            backgroundColor: 'rgba(0, 0, 0, 0.12)',
                            zIndex: 0
                          }} />
                          
                          {/* Friend pickup point */}
                          <Box sx={{ 
                            display: 'flex', 
                            p: 1.5,
                            borderRadius: 2,
                            backgroundColor: 'rgba(156, 39, 176, 0.08)',
                            position: 'relative',
                            zIndex: 1,
                            width: '100%'
                          }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: 'secondary.main',
                                width: 36, 
                                height: 36
                              }}
                            >
                              {index}
                            </Avatar>
                            <Box sx={{ ml: 1.5 }}>
                              <Typography variant="subtitle2">
                                {routeData.friends[index]}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {city.split(',')[0]}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      );
                    })}
                    
                    {/* Destination */}
                    {routeData.cities && routeData.cities.length > 0 && (
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mt: 1,
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: 'rgba(76, 175, 80, 0.1)'
                        }}
                      >
                        <Avatar 
                          sx={{ 
                            bgcolor: 'success.main',
                            width: 36, 
                            height: 36
                          }}
                        >
                          <PlaceIcon sx={{ fontSize: 20 }} />
                        </Avatar>
                        <Box sx={{ ml: 1.5 }}>
                          {routeData.friends && routeData.friends.length > 0 && (
                            <Typography variant="subtitle2">
                              {routeData.friends[routeData.friends.length - 1]}
                            </Typography>
                          )}
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ display: 'block' }}
                          >
                            Final Destination
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    color="primary"
                    gutterBottom
                  >
                    Trip Information
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Total Distance:</strong> {routeData?.distance_km} km
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Estimated Duration:</strong>{" "}
                    {formatDuration(routeData?.duration_min)}
                  </Typography>
                  <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <strong>Transportation:</strong>{" "}
                    <DirectionsCarIcon fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5 }} /> 
                    Driving
                  </Typography>
                  {routeData.optimized && (
                    <Chip 
                      label="Route Optimized" 
                      color="success" 
                      variant="outlined" 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  )}
                </>
              )}
            </>
          )}
        </Paper>

        {/* Map container */}
        <Box
          sx={{
            flex: 1,
            position: "relative",
            height: { xs: "50vh", sm: "100%" },
          }}
        >
          <Maps mapData={routeData} />
        </Box>

        {/* External links */}
        {routeData?.map_urls && (
          <Paper
            elevation={4}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 999,
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              p: 1.5,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              color="primary"
              gutterBottom
              sx={{ fontSize: "0.85rem" }}
            >
              External Maps
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {routeData?.map_urls?.google_maps && (
                <Button
                  size="small"
                  variant="outlined"
                  href={routeData?.map_urls?.google_maps}
                  target="_blank"
                >
                  Google Maps
                </Button>
              )}
            </Box>
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Button onClick={onClose} variant="outlined">
          Back
        </Button>
        <Button
          onClick={() => onConfirm(routeData)}
          variant="contained"
          color="primary"
          disabled={routeLoading}
        >
          Confirm Route
        </Button>
      </DialogActions>
    </Dialog>
  );
};