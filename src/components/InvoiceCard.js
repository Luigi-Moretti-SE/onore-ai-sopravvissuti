import { CheckCircleOutline as CheckCircleOutlineIcon } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpIcon from "@mui/icons-material/Help";
import {
  Box,
  Button,
  Card,
  CardHeader,
  Checkbox,
  CircularProgress,
  Collapse,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

const MOTIVE_TRANSLATIONS = {
  food: "Vitto",
  transportation: "Trasporto",
  housing: "Alloggio",
};

export const InvoiceCard = ({
  fatture,
  handleEditInvoice,
  handleDeleteInvoice,
  handlePrepagataToggle,
  handleFatturaToggle,
  uploadSuccess,
  isDragActive,
  selectedFiles,
  uploadError,
  isLoading,
  uploadedCount,
  isMobile,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  handleFilesChange,
  handleUploadFattura,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
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
        title="Fatture e Scontrini"
        action={
          <IconButton
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="mostra dettagli"
            sx={{
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s",
            }}
          >
            <ExpandMoreIcon />
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {!isMobile && (
                <Box
                  sx={{
                    border: "2px dashed",
                    borderRadius: "4px",
                    p: 2,
                    textAlign: "center",
                    flex: 1,
                    backgroundColor: (() => {
                      if (uploadSuccess) return "rgba(46, 125, 50, 0.1)";
                      if (isDragActive) return "rgba(25, 118, 210, 0.08)";
                      if (selectedFiles.length > 0)
                        return "rgba(25, 118, 210, 0.04)";
                      return "transparent";
                    })(),
                    borderColor: (() => {
                      if (uploadSuccess) return "#2e7d32";
                      if (uploadError) return "#d32f2f";
                      if (isDragActive) return "#1976d2";
                      if (selectedFiles.length > 0) return "#1976d2";
                      return "#ccc";
                    })(),
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(25, 118, 210, 0.04)",
                      borderColor: "#1976d2",
                    },
                  }}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        selectedFiles.length > 0
                          ? "primary.main"
                          : "text.secondary",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                    }}
                  >
                    {selectedFiles.length > 0 ? (
                      <>
                        <CheckCircleOutlineIcon color="primary" />
                        {`${selectedFiles.length} ${
                          selectedFiles.length === 1
                            ? "file selezionato"
                            : "files selezionati"
                        }`}
                      </>
                    ) : isDragActive ? (
                      "Rilascia qui i file"
                    ) : (
                      "Seleziona File o trascina qui"
                    )}
                  </Typography>
                </Box>
              )}

              <Button
                variant="outlined"
                component="label"
                sx={{
                  borderColor:
                    selectedFiles.length > 0 ? "primary.main" : undefined,
                  backgroundColor:
                    selectedFiles.length > 0
                      ? "rgba(25, 118, 210, 0.04)"
                      : undefined,
                }}
              >
                Seleziona File
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  multiple
                  hidden
                  onChange={handleFilesChange}
                />
              </Button>

              <Button
                variant="contained"
                color={uploadSuccess ? "success" : "info"}
                onClick={handleUploadFattura}
                disabled={isLoading}
                sx={{ minWidth: 120 }}
              >
                {isLoading ? "Caricamento..." : "Carica Fattura"}
              </Button>
            </Box>

            {isMobile && selectedFiles.length > 0 && (
              <Typography variant="body2" sx={{ textAlign: "center" }}>
                {`${selectedFiles.length} ${
                  selectedFiles.length === 1
                    ? "file selezionato"
                    : "files selezionati"
                }`}
              </Typography>
            )}

            <Box sx={{ minHeight: "24px" }}>
              {isLoading && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" color="text.secondary">
                    Caricamento in corso: {uploadedCount}/{selectedFiles.length}{" "}
                    file
                  </Typography>
                </Box>
              )}
              {uploadSuccess && (
                <Typography
                  variant="body2"
                  color="success.main"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  ✓ Caricamento completato con successo
                </Typography>
              )}
              {uploadError && (
                <Typography
                  variant="body2"
                  color="error"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  ⚠️ {uploadError}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Ora</TableCell>
                <TableCell>Titolo Fattura</TableCell>
                <TableCell>Importo</TableCell>
                <TableCell>Metodo di Pagamento</TableCell>
                <TableCell>Città</TableCell>
                <TableCell>Motivo</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Typography variant="inherit" display="inline">
                      Prepagata
                    </Typography>
                    <Tooltip
                      title="Le spese prepagate NON saranno rimborsate"
                      arrow
                      placement="top"
                    >
                      <HelpIcon
                        sx={{
                          fontSize: 16,
                          color: "#e46a24",
                          cursor: "help",
                        }}
                      />
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Typography variant="inherit" display="inline">
                      Fattura
                    </Typography>
                    <Tooltip
                      title="Solo fatture (non ricevute fiscali) intestate all'azienda o alla risorsa"
                      arrow
                      placement="top"
                    >
                      <HelpIcon
                        sx={{
                          fontSize: 16,
                          color: "#e46a24",
                          cursor: "help",
                        }}
                      />
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fatture.map((file, index) => (
                <TableRow
                  key={index}
                  hover
                  sx={{
                    cursor: "pointer",
                    borderRadius: "8px",
                  }}
                >
                  <TableCell>{file.date}</TableCell>
                  <TableCell>{file.time || "00:00"}</TableCell>
                  <TableCell>
                    <Stack spacing={1}>
                      <Typography variant="body2" noWrap>
                        {file.invoice_title}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="left">
                    <Stack direction="row" spacing={1}>
                      <Typography variant="body2" noWrap>
                        {(() => {
                          const amount = String(file.amount)
                            .replace("€", "")
                            .trim();
                          const cleanAmount = amount.replace(",", ".");
                          return parseFloat(cleanAmount).toFixed(2);
                        })()}{" "}
                        €
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{file.payment_method}</TableCell>
                  <TableCell>{file.city}</TableCell>
                  <TableCell>
                    {MOTIVE_TRANSLATIONS[file.motive] || file.motive}
                  </TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={file.prepagata || false}
                      onChange={() => handlePrepagataToggle(index)}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={file.invoice === true || file.invoice === "true"}
                      onChange={() => handleFatturaToggle(index)}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditInvoice(index)}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="#1f1f1f"
                      >
                        <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                      </svg>
                    </IconButton>
                    <IconButton onClick={() => handleDeleteInvoice(index)}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="#1f1f1f"
                      >
                        <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                      </svg>
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Collapse>

      {!expanded && fatture.length > 0 && (
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {fatture.length}{" "}
            {fatture.length === 1 ? "fattura/scontrino" : "fatture/scontrini"}{" "}
            caricati
          </Typography>
        </Box>
      )}
    </Card>
  );
};
