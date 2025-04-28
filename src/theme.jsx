import React from "react"; // Removed createContext import
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { 
      main: "#1976d2", // Sky blue primary
      light: "#42a5f5", // Lighter blue
      dark: "#0d47a1"
    },
    secondary: { 
      main: "#2e7d32", // Keeping green for "Seleziona file"
      light: "#4caf50",
      dark: "#1b5e20"
    },
    error: { main: "#ff1744" },
    success: { main: "#00e676" },
    info: { main: "#0288d1" }, // Blue for "Carica Fattura"
    background: { default: "#e3f2fd" } // Light sky blue background
  },
  typography: {
    fontFamily: "Public Sans, sans-serif",
    fontSize: 14, 
    fontWeightBold: 600,
    h4: { fontSize: '1.25rem', '@media (min-width:600px)': { fontSize: '1.5rem' } },
    h6: { fontSize: '1rem' },
    body1: { fontSize: '0.875rem' },
    body2: { fontSize: '0.75rem' },
    caption: { fontSize: '0.75rem' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          cursor: "pointer",
          minHeight: "40px",
          fontSize: "0.75rem",
          padding: "6px 12px",
          position: "relative",
          "@media (min-width:600px)": {
            padding: '8px 16px',
            fontSize: '0.875rem',
          },
          "&::before": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "2px",
            backgroundColor: "inherit",
            filter: "brightness(1.2)",
            borderBottomLeftRadius: "4px",
            borderBottomRightRadius: "4px"
          },
          "&.MuiButton-contained": {
            "&.MuiButton-containedPrimary": {
              backgroundColor: "#1976d2",
              color: "#ffffff", // White text
              "&:hover": { backgroundColor: "#0d47a1" }
            },
            "&.MuiButton-containedSecondary": {
              backgroundColor: "#2e7d32",
              color: "#ffffff",
              "&:hover": { backgroundColor: "#1b5e20" },
              "&.Mui-disabled": {
                backgroundColor: "#9e9e9e",
                color: "#ffffff"
              }
            },
            "&.MuiButton-containedInfo": {
              backgroundColor: "#0288d1",
              color: "#ffffff",
              "&:hover": { backgroundColor: "#01579b" },
              "&.Mui-disabled": {
                backgroundColor: "#9e9e9e",
                color: "#ffffff"
              }
            },
            "&.MuiButton-containedError": {
              backgroundColor: "#ff1744",
              color: "#ffffff",
              "&:hover": { backgroundColor: "#d50000" },
              "&.Mui-disabled": {
                backgroundColor: "#9e9e9e",
                color: "#ffffff"
              }
            }
          },
          "&.MuiButton-outlined": {
            "&.MuiButton-outlinedPrimary": {
              borderColor: "#1976d2",
              color: "#1976d2",
              "&:hover": {
                borderColor: "#0d47a1",
                color: "#0d47a1"
              }
            }
          }
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: "6px",
          width: "32px",
          height: "32px",
          color: "#1976d2",
          "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.04)" }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          fontFamily: "Public Sans, sans-serif",
          fontSize: "14px",
          fontWeight: 600,
          color: "#c2c2c2",
          "& .MuiInputBase-root": { height: "40px" },
          "& .MuiInputLabel-root": {
            fontSize: "0.875rem", 
            transform: "translate(14px, 12px) scale(1)",
            "&.Mui-focused, &.MuiFormLabel-filled": {
              transform: "translate(14px, -9px) scale(0.75)"
            }
          },
          "& input": {
            padding: "8px 14px", 
            fontSize: "0.875rem"
          },
          "& input:-webkit-autofill": {
            fontFamily: "Public Sans, sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            WebkitBoxShadow: "0 0 0 100px white inset",
            WebkitTextFillColor: "#000000b0"
          },
          "& fieldset": { border: "1px dashed #0000001F" },
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "rgba(25, 118, 210, 0.23)" },
            "&:hover fieldset": { borderColor: "#1976d2" },
            "&.Mui-focused fieldset": { borderColor: "#1976d2" }
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 0 2px 0 rgba(170, 170, 170, 0.08), 0 12px 24px -4px rgba(170, 170, 170, 0.08)",
          padding: "12px",
          marginBottom: "24px",
          width: '100%',
          position: 'relative',
          paddingTop: '30px',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '30px',
            background: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 20' preserveAspectRatio='none'><path fill='%232196f3' d='M0,10 C30,0 70,20 100,15 L100,0 L0,0 Z'/></svg>\") 0% 0% / cover",
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px'
          },

          '&.MuiCard-solidBorder-gray': {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '30px',
              background: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 20' preserveAspectRatio='none'><path fill='%2390caf9' d='M0,10 C30,0 70,20 100,15 L100,0 L0,0 Z'/></svg>\") 0% 0% / cover",
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px'
            }
          },

          // Classe speciale per le card che devono usare il bordo classico
          '&.MuiCard-solidBorder': {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '30px',
              background: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 20' preserveAspectRatio='none'><path fill='%234fc3f7' d='M0,10 C30,0 70,20 100,15 L100,0 L0,0 Z'/></svg>\") 0% 0% / cover",            
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px'
            }
          }
        }
      }
    },
    MuiCardHeader: {
      styleOverrides: {
        root: { padding: "8px" },
        title: { fontSize: "1rem" }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "6px 8px",
          fontSize: "0.75rem"
        },
        head: { fontSize: "0.75rem", fontWeight: 600 }
      }
    },
    MuiDialogActions: {
      styleOverrides: {
        root: { display: "flex", justifyContent: "space-between", alignItems: "center" }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: "12px",
          backgroundColor: "white",
          color: "#000000b0",
          border: "1px dashed #0000001F"
        }
      }
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          minHeight: '100vh',
          backgroundColor: '#e3f2fd', // Sky blue background
        }
      }
    }
  }
});