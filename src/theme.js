import React, { createContext } from 'react';
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { 
      main: "#b14e2d", // Dark custom orange
      light: "rgb(228, 106, 36)", // Lighter custom orange
      dark: "#8e3e23"
    },
    secondary: { 
      main: "#2e7d32", // Green for "Seleziona file"
      light: "#4caf50",
      dark: "#1b5e20"
    },
    error: { main: "#ff1744" },
    success: { main: "#00e676" },
    info: { main: "#0288d1" }, // Blue for "Carica Fattura"
    background: { default: "#f5f5f5" }
  },
  typography: {
    fontFamily: "Public Sans, sans-serif",
    fontSize: 14, // Reduced from 18
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
          minHeight: "40px", // Reduced from 60px
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
            height: "2px", // Reduced from 4px
            backgroundColor: "inherit",
            filter: "brightness(1.2)",
            borderBottomLeftRadius: "4px",
            borderBottomRightRadius: "4px"
          },
          "&.MuiButton-contained": {
            "&.MuiButton-containedPrimary": {
              backgroundColor: "#b14e2d",
              color: "#ffffff", // White text
              "&:hover": { backgroundColor: "#8e3e23" }
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
            // Updated block for contained info buttons (Scarica Word):
            "&.MuiButton-containedInfo": {
              backgroundColor: "#0288d1",
              color: "#ffffff",
              "&:hover": { backgroundColor: "#01579b" },
              "&.Mui-disabled": {
                backgroundColor: "#9e9e9e",
                color: "#ffffff"
              }
            },
            // Already existing block for error (Scarica PDF):
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
              borderColor: "#b14e2d",
              color: "#b14e2d",
              "&:hover": {
                borderColor: "#8e3e23",
                color: "#8e3e23"
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
          width: "32px", // Reduced from 40px
          height: "32px", // Reduced from 40px
          color: "#b14e2d",
          "&:hover": { backgroundColor: "rgba(177, 78, 45, 0.04)" }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          fontFamily: "Public Sans, sans-serif",
          fontSize: "14px", // Reduced from 18px
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
            "& fieldset": { borderColor: "rgba(177, 78, 45, 0.23)" },
            "&:hover fieldset": { borderColor: "#b14e2d" },
            "&.Mui-focused fieldset": { borderColor: "#b14e2d" }
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
            background: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 20' preserveAspectRatio='none'><path fill='%23dc3925' d='M0,10 C30,0 70,20 100,15 L100,0 L0,0 Z'/></svg>\") 0% 0% / cover",
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px'
          },

'&.MuiCard-solidBorder-gray': {
            //paddingTop: '12px',
            //borderTop: '6px solid #656463',
            '&::before': {
              content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '30px',
            background: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 20' preserveAspectRatio='none'><path fill='%23656463' d='M0,10 C30,0 70,20 100,15 L100,0 L0,0 Z'/></svg>\") 0% 0% / cover",
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px'
            }
          },

          // Classe speciale per le card che devono usare il bordo classico
          '&.MuiCard-solidBorder': {
            //paddingTop: '12px',
            //borderTop: '6px solid #656463',
            '&::before': {
              content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '30px',
            background: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 20' preserveAspectRatio='none'><path fill='%23e46a24' d='M0,10 C30,0 70,20 100,15 L100,0 L0,0 Z'/></svg>\") 0% 0% / cover",            
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
          backgroundColor: '#f9fafb',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 304 304' width='304' height='304'%3E%3Cpath fill='%23cccccc' fill-opacity='0.05' d='M44.1 224a5 5 0 1 1 0 2H0v-2h44.1zm160 48a5 5 0 1 1 0 2H82v-2h122.1zm57.8-46a5 5 0 1 1 0-2H304v2h-42.1zm0 16a5 5 0 1 1 0-2H304v2h-42.1zm6.2-114a5 5 0 1 1 0 2h-86.2a5 5 0 1 1 0-2h86.2zm-256-48a5 5 0 1 1 0 2H0v-2h12.1zm185.8 34a5 5 0 1 1 0-2h86.2a5 5 0 1 1 0 2h-86.2zM258 12.1a5 5 0 1 1-2 0V0h2v12.1zm-64 208a5 5 0 1 1-2 0v-54.2a5 5 0 1 1 2 0v54.2zm48-198.2V80h62v2h-64V21.9a5 5 0 1 1 2 0zm16 16V64h46v2h-48V37.9a5 5 0 1 1 2 0zm-128 96V208h16v12.1a5 5 0 1 1-2 0V210h-16v-76.1a5 5 0 1 1 2 0zm-5.9-21.9a5 5 0 1 1 0 2H114v48H85.9a5 5 0 1 1 0-2H112v-48h12.1zm-6.2 130a5 5 0 1 1 0-2H176v-74.1a5 5 0 1 1 2 0V242h-60.1zm-16-64a5 5 0 1 1 0-2H114v48h10.1a5 5 0 1 1 0 2H112v-48h-10.1zM66 284.1a5 5 0 1 1-2 0V274H50v30h-2v-32h18v12.1zM236.1 176a5 5 0 1 1 0 2H226v94h48v32h-2v-30h-48v-98h12.1zm25.8-30a5 5 0 1 1 0-2H274v44.1a5 5 0 1 1-2 0V146h-10.1zm-64 96a5 5 0 1 1 0-2H208v-80h16v-14h-42.1a5 5 0 1 1 0-2H226v18h-16v80h-12.1zm86.2-210a5 5 0 1 1 0 2H272V0h2v32h10.1zM98 101.9V146H53.9a5 5 0 1 1 0-2H96v-42.1a5 5 0 1 1 2 0zM53.9 34a5 5 0 1 1 0-2H80V0h2v34H53.9zm60.1 3.9V66H82v64H69.9a5 5 0 1 1 0-2H80V64h32V37.9a5 5 0 1 1 2 0zM101.9 82a5 5 0 1 1 0-2H128V37.9a5 5 0 1 1 2 0V82h-28.1zm16-64a5 5 0 1 1 0-2H146v44.1a5 5 0 1 1-2 0V18h-26.1zm102.2 270a5 5 0 1 1 0 2H98v14h-2v-16h124.1zM242 149.9V160h16v34h-16v62h48v48h-2v-46h-48v-66h16v-30h-16v-12.1a5 5 0 1 1 2 0zM53.9 18a5 5 0 1 1 0-2H64V2H48V0h18v18H53.9zm112 32a5 5 0 1 1 0-2H192V0h50v2h-48v48h-28.1zm-48-48a5 5 0 0 1-9.8-2h2.07a3 3 0 1 0 5.66 0H178v34h-18V21.9a5 5 0 1 1 2 0V32h14V2h-58.1zm0 96a5 5 0 1 1 0-2H137l32-32h39V21.9a5 5 0 1 1 2 0V66h-40.17l-32 32H117.9zm28.1 90.1a5 5 0 1 1-2 0v-76.51L175.59 80H224V21.9a5 5 0 1 1 2 0V82h-49.59L146 112.41v75.69zm16 32a5 5 0 1 1-2 0v-99.51L184.59 96H300.1a5 5 0 0 1 3.9-3.9v2.07a3 3 0 0 0 0 5.66v2.07a5 5 0 0 1-3.9-3.9H185.41L162 121.41v98.69zm-144-64a5 5 0 1 1-2 0v-3.51l48-48V48h32V0h2v50H66v55.41l-48 48v2.69zM50 53.9v43.51l-48 48V208h26.1a5 5 0 1 1 0 2H0v-65.41l48-48V53.9a5 5 0 1 1 2 0zm-16 16V89.41l-34 34v-2.82l32-32V69.9a5 5 0 1 1 2 0zM12.1 32a5 5 0 1 1 0 2H9.41L0 43.41V40.6L8.59 32h3.51zm265.8 18a5 5 0 1 1 0-2h18.69l7.41-7.41v2.82L297.41 50H277.9zm-16 160a5 5 0 1 1 0-2H288v-71.41l16-16v2.82l-14 14V210h-28.1zm-208 32a5 5 0 1 1 0-2H64v-22.59L40.59 194H21.9a5 5 0 1 1 0-2H41.41L66 216.59V242H53.9zm150.2 14a5 5 0 1 1 0 2H96v-56.6L56.6 162H37.9a5 5 0 1 1 0-2h19.5L98 200.6V256h106.1zm-150.2 2a5 5 0 1 1 0-2H80v-46.59L48.59 178H21.9a5 5 0 1 1 0-2H49.41L82 208.59V258H53.9zM34 39.8v1.61L9.41 66H0v-2h8.59L32 40.59V0h2v39.8zM2 300.1a5 5 0 0 1 3.9 3.9H3.83A3 3 0 0 0 0 302.17V256h18v48h-2v-46H2v42.1zM34 241v63h-2v-62H0v-2h34v1zM17 18H0v-2h16V0h2v18h-1zm273-2h14v2h-16V0h2v16zm-32 273v15h-2v-14h-14v14h-2v-16h18v1zM0 92.1A5.02 5.02 0 0 1 6 97a5 5 0 0 1-6 4.9v-2.07a3 3 0 1 0 0-5.66V92.1zM80 272h2v32h-2v-32zm37.9 32h-2.07a3 3 0 0 0-5.66 0h-2.07a5 5 0 0 1 9.8 0zM5.9 0A5.02 5.02 0 0 1 0 5.9V3.83A3 3 0 0 0 3.83 0H5.9zm294.2 0h2.07A3 3 0 0 0 304 3.83V5.9a5 5 0 0 1-3.9-5.9zm3.9 300.1v2.07a3 3 0 0 0-1.83 1.83h-2.07a5 5 0 0 1 3.9-3.9zM97 100a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-48 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 96a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-144a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-96 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm96 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-32 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM49 36a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-32 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM33 68a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 240a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm80-176a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm112 176a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 180a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 84a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center',
          backgroundSize: 'auto'
        },
        '#root': {
          minHeight: '100vh',
          backgroundColor: 'transparent'
        }
      }
    }
  }
});

export const ThemeContext = createContext({ theme });
export const ThemeProviderCustom = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};