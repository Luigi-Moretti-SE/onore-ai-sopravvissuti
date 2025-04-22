import CloseIcon from '@mui/icons-material/Close';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    MenuItem,
    Paper,
    Select,
    Typography
} from '@mui/material';
import React from 'react';
import Maps from '../maps/Maps';

export const MapDialog = ({
  open,
  onClose,
  routeData,
  routeLoading,
  routePreference,
  handlePreferenceChange,
  formatDuration,
  onConfirm // New prop to handle confirmation
}) => {
  // Function to handle both confirming the route and closing the dialog
  const handleConfirm = () => {
    if (routeData) {
      onConfirm(routeData);
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            height: { xs: "auto", sm: "90vh" },
            position: "relative",
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      <DialogTitle>
        Percorso di Viaggio
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
            zIndex: 2,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Contenitore per le info mobili - visibile solo su mobile */}
      <Box
        sx={{
          display: { xs: "flex", sm: "none" },
          flexDirection: "column",
          p: 2,
          gap: 2,
        }}
      >
        {/* Riquadro Origine e Destinazione (mobile) */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            borderRadius: 2,
          }}
        >
          {routeData && (
            <>
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                color="primary"
                gutterBottom
              >
                Origine e Destinazione
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Partenza:</strong>{" "}
                {routeData?.cities ? routeData.cities[0].toUpperCase() : ""}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Arrivo:</strong>{" "}
                {routeData?.cities
                  ? routeData.cities[routeData.cities.length - 1].toUpperCase()
                  : ""}
              </Typography>

              {routeData?.cities && routeData.cities.length > 2 && (
                <>
                  <Typography variant="body2" gutterBottom>
                    <strong>Tappe intermedie:</strong>
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mt: 0, mb: 1 }}>
                    {routeData?.cities.slice(1, -1).map((city, index) => (
                      <Typography
                        component="li"
                        key={index}
                        variant="body2"
                      >
                        {city.toUpperCase()}
                      </Typography>
                    ))}
                  </Box>
                </>
              )}

              <Divider sx={{ my: 1.5 }} />
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                color="primary"
                gutterBottom
              >
                Informazioni Percorso
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Distanza:</strong> {routeData?.distance_km} km
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Durata:</strong>{" "}
                {formatDuration(routeData?.duration_min)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Modalità:</strong>{" "}
                {routeData?.mode === "driving"
                  ? "In auto"
                  : routeData?.mode === "walking"
                  ? "A piedi"
                  : routeData?.mode}
              </Typography>
            </>
          )}
        </Paper>

        {/* Riquadro Tipo di percorso (mobile) */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            color="primary"
            gutterBottom
          >
            Tipo di percorso
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              labelId="route-preference-label-mobile"
              id="route-preference-mobile"
              value={routePreference}
              onChange={handlePreferenceChange}
              disabled={routeLoading}
            >
              <MenuItem value="recommended">Raccomandato</MenuItem>
              <MenuItem value="shortest">Più breve</MenuItem>
              <MenuItem value="fastest">Più veloce</MenuItem>
            </Select>
          </FormControl>
          {routeLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 1 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </Paper>
        
        {/* Pulsante Conferma percorso (mobile) */}
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleConfirm} // Changed to new handler
          fullWidth
          disabled={routeLoading}
          sx={{ mt: 1 }}
        >
          Conferma percorso
        </Button>
      </Box>

      <DialogContent
        sx={{
          position: "relative",
          p: 0,
          flex: 1,
          height: { xs: "70vh", sm: "auto" },
          minHeight: { xs: "70vh", sm: "auto" },
        }}
      >
        {/* Pannello in basso a sinistra per la preferenza di percorso (desktop) */}
        <Paper
          elevation={8}
          sx={{
            position: "absolute",
            bottom: 16,
            left: 16,
            zIndex: 999,
            width: "250px",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            p: 2,
            borderRadius: 2,
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
            display: { xs: "none", sm: "block" },
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            color="primary"
            gutterBottom
          >
            Tipo di percorso
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              labelId="route-preference-label"
              id="route-preference"
              value={routePreference}
              onChange={handlePreferenceChange}
              disabled={routeLoading}
            >
              <MenuItem value="recommended">Raccomandato</MenuItem>
              <MenuItem value="shortest">Più breve</MenuItem>
              <MenuItem value="fastest">Più veloce</MenuItem>
            </Select>
          </FormControl>
          {routeLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 1 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </Paper>

        {/* Collegamenti esterni in alto a sinistra (desktop) */}
        {routeData?.map_urls && (
          <Paper
            elevation={4}
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              zIndex: 999,
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              p: 1.5,
              borderRadius: 2,
              display: { xs: "none", sm: "block" },
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              color="primary"
              gutterBottom
              sx={{ fontSize: "0.85rem" }}
            >
              Collegamenti esterni
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {routeData?.map_urls?.google_maps && (
                <Button
                  size="small"
                  href={routeData?.map_urls?.google_maps}
                  target="_blank"
                  sx={{
                    minWidth: "40px",
                    paddingLeft: 1,
                    paddingRight: 1,
                    backgroundImage: "url(/google-maps.svg)",
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                />
              )}
              {routeData?.map_urls?.facilmap && (
                <Button
                  size="small"
                  href={routeData?.map_urls?.facilmap}
                  target="_blank"
                  sx={{
                    backgroundImage: "url(/Openstreetmap_logo.svg)",
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                />
              )}
            </Box>
          </Paper>
        )}

        {/* Mappa a schermo intero */}
        <Box
          sx={{
            height: "100%",
            width: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <Maps mapData={routeData} />
        </Box>

        {/* Collegamenti esterni in basso a sinistra (mobile) */}
        {routeData?.map_urls && (
          <Paper
            elevation={4}
            sx={{
              position: "absolute",
              bottom: 16,
              left: 16,
              zIndex: 999,
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              p: 1.5,
              borderRadius: 2,
              display: { xs: "block", sm: "none" },
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              color="primary"
              gutterBottom
              sx={{ fontSize: "0.85rem" }}
            >
              Collegamenti esterni
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {routeData?.map_urls?.google_maps && (
                <Button
                  size="small"
                  href={routeData?.map_urls?.google_maps}
                  target="_blank"
                  sx={{
                    minWidth: "40px",
                    paddingLeft: 1,
                    paddingRight: 1,
                    backgroundImage: "url(/google-maps.svg)",
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                />
              )}
              {routeData?.map_urls?.facilmap && (
                <Button
                  size="small"
                  href={routeData?.map_urls?.facilmap}
                  target="_blank"
                  sx={{
                    backgroundImage: "url(/Openstreetmap_logo.svg)",
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                />
              )}
            </Box>
          </Paper>
        )}

        {/* Dettagli del viaggio in alto a destra (desktop) */}
        <Paper
          elevation={8}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 999,
            width: "350px",
            maxWidth: "90%",
            maxHeight: "70%",
            overflowY: "auto",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            p: 2,
            borderRadius: 2,
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
            display: { xs: "none", sm: "block" },
          }}
        >
          {routeData && (
            <>
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                color="primary"
                gutterBottom
              >
                Origine e Destinazione
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Partenza:</strong>{" "}
                {routeData?.cities ? routeData.cities[0].toUpperCase() : ""}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Arrivo:</strong>{" "}
                {routeData?.cities
                  ? routeData.cities[routeData.cities.length - 1].toUpperCase()
                  : ""}
              </Typography>

              {routeData?.cities && routeData.cities.length > 2 && (
                <>
                  <Typography variant="body2" gutterBottom>
                    <strong>Tappe intermedie:</strong>
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mt: 0, mb: 1 }}>
                    {routeData?.cities.slice(1, -1).map((city, index) => (
                      <Typography
                        component="li"
                        key={index}
                        variant="body2"
                      >
                        {city.toUpperCase()}
                      </Typography>
                    ))}
                  </Box>
                </>
              )}

              <Divider sx={{ my: 1.5 }} />
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                color="primary"
                gutterBottom
              >
                Informazioni Percorso
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Distanza:</strong> {routeData?.distance_km} km
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Durata:</strong>{" "}
                {formatDuration(routeData?.duration_min)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Modalità:</strong>{" "}
                {routeData?.mode === "driving"
                  ? "In auto"
                  : routeData?.mode === "walking"
                  ? "A piedi"
                  : routeData?.mode}
              </Typography>
              
              {/* Pulsante Conferma percorso nel pannello info */}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleConfirm} // Changed to new handler
                  disabled={routeLoading}
                  fullWidth
                >
                  Conferma percorso
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </DialogContent>
    </Dialog>
  );
};