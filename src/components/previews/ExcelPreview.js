/* eslint-disable no-template-curly-in-string */
import DownloadIcon from "@mui/icons-material/Download";
import InfoIcon from "@mui/icons-material/Info";
import TableChartIcon from "@mui/icons-material/TableChart";
import { Alert, Box, Button, Container, Typography } from "@mui/material";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import React, { useEffect, useState } from "react";

export const ExcelPreview = () => {
  useEffect(() => {
    document.title = "Excel Preview - Keytech";
  }, []);

  const data = JSON.parse(sessionStorage.getItem("excelPreviewData") || "{}");
  const {
    filename,
    cliente,
    cognome,
    nome,
    sede,
    oggettoAttivita,
    period,
    fatture: unsortedInvoices = [],
    kmEntries = [], // Extract km entries from session data
  } = data;

  const [periodInit, periodFinal] = period
    ? period.split("-").map((p) => p.trim())
    : ["", ""];

  const invoices = [...unsortedInvoices].sort((a, b) => {
    const dateA = a.date.split("/").reverse().join("-");
    const dateB = b.date.split("/").reverse().join("-");
    return new Date(dateA) - new Date(dateB);
  });

  const totals = invoices.reduce(
    (acc, invoice) => {
      let amountParsed = parseFloat(
        String(invoice.amount).replace(",", ".") || 0
      );

      // Check if the invoice is prepaid
      if (invoice.prepagata) {
        acc.prepaid += parseFloat(amountParsed || 0);
      } else {
        acc.total += parseFloat(amountParsed || 0);
        switch (invoice.motive) {
          case "food":
            acc.food += parseFloat(amountParsed || 0);
            break;
          case "transportation":
            acc.transportation += parseFloat(amountParsed || 0);
            break;
          case "housing":
            acc.housing += parseFloat(amountParsed || 0);
            break;
          default:
            break;
        }
      }

      // Calculate grand total (including prepaid expenses)
      acc.grandTotal = acc.total + acc.prepaid;

      return acc;
    },
    {
      total: 0,
      food: 0,
      transportation: 0,
      housing: 0,
      prepaid: 0,
      grandTotal: 0,
    }
  );

  // Calculate KM reimbursement totals
  const kmSummary = {
    totalPersonal: kmEntries
      .filter((entry) => !entry.isCompanyCar)
      .reduce((sum, entry) => sum + parseFloat(entry.totalKm || 0), 0),
    totalCompany: kmEntries
      .filter((entry) => entry.isCompanyCar)
      .reduce((sum, entry) => sum + parseFloat(entry.totalKm || 0), 0),
    totalPersonalAmount: kmEntries
      .filter((entry) => !entry.isCompanyCar)
      .reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0),
    totalCompanyAmount: kmEntries
      .filter((entry) => entry.isCompanyCar)
      .reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0),
    totalEntries: kmEntries.length,
  };

  const totalKm = kmSummary.totalPersonal + kmSummary.totalCompany;
  const totalKmAmount =
    kmSummary.totalPersonalAmount + kmSummary.totalCompanyAmount;

  // Add state for tracking generation process
  const [isGenerating, setIsGenerating] = useState(false);

  // Add state for button style
  const [buttonStyle, setButtonStyle] = useState({
    backgroundColor: "#2e7d32",
    textContent: "Scarica Excel",
    disabled: false,
  });

  // Update the handleDownload function to include KM entries
  const handleDownload = async () => {
    // Set generating state to true at the beginning
    setIsGenerating(true);

    try {
      const formattedInvoices = invoices.map((invoice) => ({
        date: invoice.date,
        description: invoice.invoice_title,
        amount: parseFloat(String(invoice.amount).replace(",", ".")).toFixed(2),
        payment: invoice.payment_method,
        city: invoice.city,
        motive: invoice.motive,
        prepagata: invoice.prepagata || false,
        invoice: invoice.invoice === true || invoice.invoice === "true",
      }));

      // Separate invoices into three categories:
      // 1. Regular (not prepagata and not invoice)
      // 2. Prepagata invoices
      // 3. Invoices for FATTURE VS KEYTECH RISORSA sheet
      const regularInvoices = formattedInvoices.filter(
        (invoice) => !invoice.prepagata && !invoice.invoice
      );
      const prepagataInvoices = formattedInvoices.filter(
        (invoice) => invoice.prepagata
      );
      const fattureInvoices = formattedInvoices.filter(
        (invoice) => invoice.invoice && !invoice.prepagata
      );

      // Fetch the template file
      const response = await fetch("/templates/Rimborso_Spese.xlsx");
      const arrayBuffer = await response.arrayBuffer();

      // Load the Excel workbook template
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);

      // Get specific worksheets by name
      const totaliSheet = workbook.getWorksheet("TOTALI");
      const kmSheet = workbook.getWorksheet("RIMBORSI CHILOMETRICI");
      const prepagateSheet = workbook.getWorksheet(
        "SPESE PREPAGATE DA KEYTECH"
      );
      const fattureSheet = workbook.getWorksheet("FATTURE VS KEYTECH RISORSA");
      const speseSheet = workbook.getWorksheet("SPESE VARIE RISORSA");

      if (
        !totaliSheet ||
        !speseSheet ||
        !kmSheet ||
        !fattureSheet ||
        !prepagateSheet
      ) {
        console.error("Fogli richiesti non trovati nel template");
        return;
      }

      // Helper functions for finding and updating cells
      const findCellWithValue = (worksheet, searchValue) => {
        let foundCell = null;
        worksheet.eachRow((row, rowNumber) => {
          row.eachCell((cell, colNumber) => {
            if (cell.value && cell.value.toString().includes(searchValue)) {
              foundCell = { row: rowNumber, col: colNumber };
            }
          });
        });
        return foundCell;
      };

      const updateCell = (worksheet, identifier, value) => {
        const cell = findCellWithValue(worksheet, identifier);
        if (cell) {
          const targetCell = worksheet.getCell(cell.row, cell.col);
          targetCell.value = value;
          // Preserve number formatting if needed
          if (typeof value === "number") {
            targetCell.numFmt = "#,##0.00€";
          }
        } else {
          console.warn(`Cella con identificatore "${identifier}" non trovata`);
        }
      };

      // Update headers in all sheets
      updateCell(totaliSheet, "${nome}", nome);
      updateCell(totaliSheet, "${cognome}", cognome);
      updateCell(totaliSheet, "${sede}", sede);
      updateCell(totaliSheet, "${periodInit}", periodInit);
      updateCell(totaliSheet, "${periodFinal}", periodFinal);

      updateCell(kmSheet, "${nome}", nome);
      updateCell(kmSheet, "${cognome}", cognome);
      updateCell(kmSheet, "${sede}", sede);
      updateCell(kmSheet, "${periodInit}", periodInit);
      updateCell(kmSheet, "${periodFinal}", periodFinal);

      updateCell(fattureSheet, "${nome}", nome);
      updateCell(fattureSheet, "${cognome}", cognome);
      updateCell(fattureSheet, "${sede}", sede);
      updateCell(fattureSheet, "${periodInit}", periodInit);
      updateCell(fattureSheet, "${periodFinal}", periodFinal);

      updateCell(prepagateSheet, "${nome}", nome);
      updateCell(prepagateSheet, "${cognome}", cognome);
      updateCell(prepagateSheet, "${sede}", sede);
      updateCell(prepagateSheet, "${periodInit}", periodInit);
      updateCell(prepagateSheet, "${periodFinal}", periodFinal);

      updateCell(speseSheet, "${nome}", nome);
      updateCell(speseSheet, "${cognome}", cognome);
      updateCell(speseSheet, "${sede}", sede);
      updateCell(speseSheet, "${periodInit}", periodInit);
      updateCell(speseSheet, "${periodFinal}", periodFinal);

      // PROCESS REGULAR INVOICES (SPESE VARIE RISORSA sheet)
      // Find the starting row for invoices in SPESE VARIE RISORSA sheet
      const invoicesStartRow = 12;

      // Save row 12 formatting to use as template for invoice rows
      const templateRow = speseSheet.getRow(invoicesStartRow);
      const templateRowHeight = templateRow.height;
      const templateRowFormat = {
        font: templateRow.getCell(1).font
          ? JSON.parse(JSON.stringify(templateRow.getCell(1).font))
          : undefined,
        fill: templateRow.getCell(1).fill
          ? JSON.parse(JSON.stringify(templateRow.getCell(1).fill))
          : undefined,
        border: templateRow.getCell(1).border
          ? JSON.parse(JSON.stringify(templateRow.getCell(1).border))
          : undefined,
        numFmt: templateRow.getCell(1).numFmt,
        alignment: templateRow.getCell(1).alignment
          ? JSON.parse(JSON.stringify(templateRow.getCell(1).alignment))
          : undefined,
      };

      // Save the content of row 13 to preserve it
      const row13 = speseSheet.getRow(13);
      const row13Height = row13.height;
      const row13Content = [];
      row13.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        row13Content[colNumber] = {
          value: cell.value,
          style: {
            font: cell.font ? JSON.parse(JSON.stringify(cell.font)) : undefined,
            fill: cell.fill ? JSON.parse(JSON.stringify(cell.fill)) : undefined,
            border: cell.border
              ? JSON.parse(JSON.stringify(cell.border))
              : undefined,
            numFmt: cell.numFmt,
            alignment: cell.alignment
              ? JSON.parse(JSON.stringify(cell.alignment))
              : undefined,
          },
        };
      });

      // Add regular invoices to SPESE VARIE RISORSA sheet
      regularInvoices.forEach((invoice, index) => {
        const currentRow = speseSheet.getRow(invoicesStartRow + index);

        // Set row height to match template row
        currentRow.height = templateRowHeight;

        // Set cell values
        currentRow.getCell(1).value = invoice.date;
        currentRow.getCell(2).value = cliente;
        currentRow.getCell(3).value = oggettoAttivita;
        currentRow.getCell(4).value = invoice.description;
        currentRow.getCell(5).value = invoice.payment;

        // Ensure the amount is numeric with correct formatting
        const amount = parseFloat(invoice.amount);
        currentRow.getCell(6).value = amount;

        // Apply template formatting to all cells
        [1, 2, 3, 4, 5, 6].forEach((col) => {
          const cell = currentRow.getCell(col);

          // Crea una copia pulita del formato del template, ma assicurati che non ci sia il bold e il fill
          // Preserva solo le proprietà di font che vogliamo mantenere
          cell.font = {
            name: templateRowFormat.font ? templateRowFormat.font.name : "Arial",
            size: templateRowFormat.font ? templateRowFormat.font.size : 11,
            bold: false  // Forza il grassetto a essere disattivato
          };
          
          // Imposta un fill vuoto o trasparente (nessun riempimento)
          cell.fill = {
            type: "pattern",
            pattern: "none"  // Nessun pattern = nessun riempimento
          };
          
          // Mantieni i bordi e l'allineamento dal template
          cell.border = templateRowFormat.border;
          cell.alignment = templateRowFormat.alignment;

          // Override specific formats for special columns
          if (col === 6) {
            cell.numFmt = "#,##0.00€";
            // If needed, adjust alignment to right for amount column
            if (cell.alignment) {
              cell.alignment.horizontal = "right";
            } else {
              cell.alignment = { horizontal: "right", vertical: "middle" };
            }
          }
        });

        currentRow.commit();
      });

      // Calculate the new position of row 13 for regular invoices
      const newRow13Position = invoicesStartRow + regularInvoices.length;

      // Insert the original row 13 at the end of the regular invoices
      const finalRow = speseSheet.getRow(newRow13Position);
      finalRow.height = row13Height;

      // Copy all cells from the original row 13
      row13Content.forEach((cellContent, colNumber) => {
        if (cellContent && colNumber > 0) {
          const cell = finalRow.getCell(colNumber);

          // For column F, update the formula to sum all invoice rows
          if (colNumber === 6) {
            // Create a new formula that sums all invoice rows
            const newSumFormula =
              regularInvoices.length > 0
                ? `SUM(F${invoicesStartRow}:F${newRow13Position - 1})`
                : 0; // If no regular invoices, set to 0

            if (typeof newSumFormula === "number") {
              cell.value = newSumFormula;
            } else {
              cell.value = { formula: newSumFormula };
            }
            cell.numFmt = "#,##0.00€";

            // Make column 6 (amount total) bold
            cell.font = {
              name: "Arial",
              size: 11,
              bold: true,
            };
            cell.border = {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" },
            };
          } else {
            if (colNumber < 6) {
              // For all other cells, keep the original value
              cell.value = cellContent.value;

              // Apply light gray background to columns 1-5
              // cell.fill = {
              //   type: "pattern",
              //   pattern: "solid",
              //   fgColor: { argb: "FFE0E0E0" }, // Light gray color
              // };
            }
          }
        }
      });
      finalRow.commit();

      // PROCESS PREPAGATA INVOICES (SPESE PREPAGATE DA KEYTECH sheet)
      // Find the starting row for invoices in SPESE PREPAGATE DA KEYTECH sheet
      const prepagateStartRow = 12;

      // Save row 12 formatting from prepagate sheet to use as template
      const prepagateTemplateRow = prepagateSheet.getRow(prepagateStartRow);
      const prepagateTemplateRowHeight = prepagateTemplateRow.height;
      const prepagateTemplateRowFormat = {
        font: prepagateTemplateRow.getCell(1).font
          ? JSON.parse(JSON.stringify(prepagateTemplateRow.getCell(1).font))
          : undefined,
        fill: prepagateTemplateRow.getCell(1).fill
          ? JSON.parse(JSON.stringify(prepagateTemplateRow.getCell(1).fill))
          : undefined,
        border: prepagateTemplateRow.getCell(1).border
          ? JSON.parse(JSON.stringify(prepagateTemplateRow.getCell(1).border))
          : undefined,
        numFmt: prepagateTemplateRow.getCell(1).numFmt,
        alignment: prepagateTemplateRow.getCell(1).alignment
          ? JSON.parse(
              JSON.stringify(prepagateTemplateRow.getCell(1).alignment)
            )
          : undefined,
      };

      // Save the content of row 13 from prepagate sheet to preserve it
      const prepagateRow13 = prepagateSheet.getRow(13);
      const prepagateRow13Height = prepagateRow13.height;
      const prepagateRow13Content = [];
      prepagateRow13.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        prepagateRow13Content[colNumber] = {
          value: cell.value,
          style: {
            font: cell.font ? JSON.parse(JSON.stringify(cell.font)) : undefined,
            fill: cell.fill ? JSON.parse(JSON.stringify(cell.fill)) : undefined,
            border: cell.border
              ? JSON.parse(JSON.stringify(cell.border))
              : undefined,
            numFmt: cell.numFmt,
            alignment: cell.alignment
              ? JSON.parse(JSON.stringify(cell.alignment))
              : undefined,
          },
        };
      });

      // Add prepagata invoices to SPESE PREPAGATE DA KEYTECH sheet
      prepagataInvoices.forEach((invoice, index) => {
        const currentRow = prepagateSheet.getRow(prepagateStartRow + index);

        // Set row height to match template row
        currentRow.height = prepagateTemplateRowHeight;

        // Set cell values
        currentRow.getCell(1).value = invoice.date;
        currentRow.getCell(2).value = cliente;
        currentRow.getCell(3).value = oggettoAttivita;
        currentRow.getCell(4).value = invoice.description;
        currentRow.getCell(5).value = invoice.payment;

        // Ensure the amount is numeric with correct formatting
        const amount = parseFloat(invoice.amount);
        currentRow.getCell(6).value = amount;

        // Apply template formatting to all cells
        [1, 2, 3, 4, 5, 6].forEach((col) => {
          const cell = currentRow.getCell(col);

          // Apply template formatting
          cell.font = prepagateTemplateRowFormat.font;
          cell.fill = prepagateTemplateRowFormat.fill;
          cell.border = prepagateTemplateRowFormat.border;
          cell.alignment = prepagateTemplateRowFormat.alignment;

          // Override specific formats for special columns
          if (col === 6) {
            cell.numFmt = "#,##0.00€";
            // If needed, adjust alignment to right for amount column
            if (cell.alignment) {
              cell.alignment.horizontal = "right";
            } else {
              cell.alignment = { horizontal: "right", vertical: "middle" };
            }
          }
        });

        currentRow.commit();
      });

      // Calculate the new position of row 13 for prepagata invoices
      const newPrepagateRow13Position =
        prepagateStartRow + prepagataInvoices.length;

      // Insert the original row 13 at the end of the prepagata invoices
      const finalPrepagateRow = prepagateSheet.getRow(
        newPrepagateRow13Position
      );
      finalPrepagateRow.height = prepagateRow13Height;

      // Fix styling issues in the final row of prepagata invoices
      prepagateRow13Content.forEach((cellContent, colNumber) => {
        if (cellContent && colNumber > 0) {
          const cell = finalPrepagateRow.getCell(colNumber);

          // For column F, update the formula to sum all prepagata invoice rows
          if (colNumber === 6) {
            // Create a new formula that sums all prepagata invoice rows
            const newSumFormula =
              prepagataInvoices.length > 0
                ? `SUM(F${prepagateStartRow}:F${newPrepagateRow13Position - 1})`
                : 0; // If no prepagata invoices, set to 0

            if (typeof newSumFormula === "number") {
              cell.value = newSumFormula;
            } else {
              cell.value = { formula: newSumFormula };
            }
            cell.numFmt = "#,##0.00€";

            // Make column 6 (amount total) bold
            cell.font = {
              name: "Arial",
              size: 11,
              bold: true,
            };

            cell.border = {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" },
            };
          } else {
            if (colNumber < 6) {
              cell.value = cellContent.value;

              // Apply light gray background to columns 1-5
              // cell.fill = {
              //   type: "pattern",
              //   pattern: "solid",
              //   fgColor: { argb: "FFE0E0E0" }, // Light gray color
              // };
            }
          }
        }
      });
      finalPrepagateRow.commit();

      // PROCESS INVOICES FOR FATTURE VS KEYTECH RISORSA SHEET
      // Find the starting row for invoices in FATTURE VS KEYTECH RISORSA sheet
      const fattureStartRow = 12;

      // Save row 12 formatting from fatture sheet to use as template
      const fattureTemplateRow = fattureSheet.getRow(fattureStartRow);
      const fattureTemplateRowHeight = fattureTemplateRow.height;
      const fattureTemplateRowFormat = {
        font: fattureTemplateRow.getCell(1).font
          ? JSON.parse(JSON.stringify(fattureTemplateRow.getCell(1).font))
          : undefined,
        fill: fattureTemplateRow.getCell(1).fill
          ? JSON.parse(JSON.stringify(fattureTemplateRow.getCell(1).fill))
          : undefined,
        border: fattureTemplateRow.getCell(1).border
          ? JSON.parse(JSON.stringify(fattureTemplateRow.getCell(1).border))
          : undefined,
        numFmt: fattureTemplateRow.getCell(1).numFmt,
        alignment: fattureTemplateRow.getCell(1).alignment
          ? JSON.parse(JSON.stringify(fattureTemplateRow.getCell(1).alignment))
          : undefined,
      };

      // Save the content of row 13 from fatture sheet to preserve it
      const fattureRow13 = fattureSheet.getRow(13);
      const fattureRow13Height = fattureRow13.height;
      const fattureRow13Content = [];
      fattureRow13.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        fattureRow13Content[colNumber] = {
          value: cell.value,
          style: {
            font: cell.font ? JSON.parse(JSON.stringify(cell.font)) : undefined,
            fill: cell.fill ? JSON.parse(JSON.stringify(cell.fill)) : undefined,
            border: cell.border
              ? JSON.parse(JSON.stringify(cell.border))
              : undefined,
            numFmt: cell.numFmt,
            alignment: cell.alignment
              ? JSON.parse(JSON.stringify(cell.alignment))
              : undefined,
          },
        };
      });

      // Add invoices to FATTURE VS KEYTECH RISORSA sheet
      fattureInvoices.forEach((invoice, index) => {
        const currentRow = fattureSheet.getRow(fattureStartRow + index);

        // Set row height to match template row
        currentRow.height = fattureTemplateRowHeight;

        // Set cell values
        currentRow.getCell(1).value = invoice.date;
        currentRow.getCell(2).value = cliente;
        currentRow.getCell(3).value = oggettoAttivita;
        currentRow.getCell(4).value = invoice.description;
        currentRow.getCell(5).value = invoice.payment;

        // Ensure the amount is numeric with correct formatting
        const amount = parseFloat(invoice.amount);
        currentRow.getCell(6).value = amount;

        // Apply template formatting to all cells
        [1, 2, 3, 4, 5, 6].forEach((col) => {
          const cell = currentRow.getCell(col);

          // Apply template formatting
          cell.font = fattureTemplateRowFormat.font;
          cell.fill = fattureTemplateRowFormat.fill;
          cell.border = fattureTemplateRowFormat.border;
          cell.alignment = fattureTemplateRowFormat.alignment;

          // Override specific formats for special columns
          if (col === 6) {
            cell.numFmt = "#,##0.00€";
            // If needed, adjust alignment to right for amount column
            if (cell.alignment) {
              cell.alignment.horizontal = "right";
            } else {
              cell.alignment = { horizontal: "right", vertical: "middle" };
            }
          }
        });

        currentRow.commit();
      });

      // Calculate the new position of row 13 for fatture invoices
      const newFattureRow13Position = fattureStartRow + fattureInvoices.length;

      // Insert the original row 13 at the end of the fatture invoices
      const finalFattureRow = fattureSheet.getRow(newFattureRow13Position);
      finalFattureRow.height = fattureRow13Height;

      // Copy all cells from the original row 13
      fattureRow13Content.forEach((cellContent, colNumber) => {
        if (cellContent && colNumber > 0) {
          const cell = finalFattureRow.getCell(colNumber);

          // For column F, update the formula to sum all fatture invoice rows
          if (colNumber === 6) {
            // Create a new formula that sums all fatture invoice rows
            const newSumFormula =
              fattureInvoices.length > 0
                ? `SUM(F${fattureStartRow}:F${newFattureRow13Position - 1})`
                : 0; // If no fatture invoices, set to 0

            if (typeof newSumFormula === "number") {
              cell.value = newSumFormula;
            } else {
              cell.value = { formula: newSumFormula };
            }
            cell.numFmt = "#,##0.00€";

            // Make column 6 (amount total) bold
            cell.font = {
              name: "Arial",
              size: 11,
              bold: true,
            };

            cell.border = {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" },
            };
          } else {
            if (colNumber < 6) {
              // For all other cells, keep the original value
              cell.value = cellContent.value;

              // Apply light gray background to columns 1-5
              // cell.fill = {
              //   type: "pattern",
              //   pattern: "solid",
              //   fgColor: { argb: "FFE0E0E0" }, // Light gray color
              // };
            }
          }
        }
      });
      finalFattureRow.commit();

      // PROCESS KM ENTRIES (RIMBORSI CHILOMETRICI sheet)
      // Find the starting row for km entries
      const kmStartRow = 12;

      // Save row 12 formatting from km sheet to use as template
      const kmTemplateRow = kmSheet.getRow(kmStartRow);
      const kmTemplateRowHeight = kmTemplateRow.height;
      const kmTemplateRowFormat = {
        font: kmTemplateRow.getCell(1).font
          ? JSON.parse(JSON.stringify(kmTemplateRow.getCell(1).font))
          : undefined,
        fill: kmTemplateRow.getCell(1).fill
          ? JSON.parse(JSON.stringify(kmTemplateRow.getCell(1).fill))
          : undefined,
        border: kmTemplateRow.getCell(1).border
          ? JSON.parse(JSON.stringify(kmTemplateRow.getCell(1).border))
          : undefined,
        numFmt: kmTemplateRow.getCell(1).numFmt,
        alignment: kmTemplateRow.getCell(1).alignment
          ? JSON.parse(JSON.stringify(kmTemplateRow.getCell(1).alignment))
          : undefined,
      };

      // Save the content of row 13 from km sheet to preserve it
      const kmRow13 = kmSheet.getRow(13);
      const kmRow13Height = kmRow13.height;
      const kmRow13Content = [];
      kmRow13.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        kmRow13Content[colNumber] = {
          value: cell.value,
          style: {
            font: cell.font ? JSON.parse(JSON.stringify(cell.font)) : undefined,
            fill: cell.fill ? JSON.parse(JSON.stringify(cell.fill)) : undefined,
            border: cell.border
              ? JSON.parse(JSON.stringify(cell.border))
              : undefined,
            numFmt: cell.numFmt,
            alignment: cell.alignment
              ? JSON.parse(JSON.stringify(cell.alignment))
              : undefined,
          },
        };
      });

      // Add km entries to RIMBORSI CHILOMETRICI sheet
      kmEntries.forEach((entry, index) => {
        const currentRow = kmSheet.getRow(kmStartRow + index);

        // Set row height to match template row
        currentRow.height = kmTemplateRowHeight;

        // Set cell values
        currentRow.getCell(1).value = entry.date || ""; // Date
        currentRow.getCell(2).value = cliente; // Cliente
        currentRow.getCell(3).value = oggettoAttivita; // Oggetto Attività

        // Costruisci descrizione con partenza, tappe e arrivo
        //let routeDescription = `${entry.startCity.toUpperCase()}`;

        //if (entry.waypoints && entry.waypoints.length > 0) {
        let waypointsExcel = `${entry.waypoints
          .map((wp) => wp.toUpperCase())
          .join(" > ")}`;
        //}

        //routeDescription += ` > ${entry.endCity.toUpperCase()}`;
        //currentRow.getCell(5).value = routeDescription;  // Descrizione percorso

        // Informazioni veicolo
        //const carInfo = `${entry.carBrand.toUpperCase()} ${entry.carModel.toUpperCase()} (${entry.carEngine} cc)`;
        currentRow.getCell(4).value = entry.isCompanyCar
          ? "Auto Aziendale"
          : "Auto Personale"; // Tipo auto
        currentRow.getCell(5).value = "Elettronico";
        currentRow.getCell(6).value = entry.carBrand.toUpperCase();
        currentRow.getCell(7).value = entry.carModel.toUpperCase();
        currentRow.getCell(8).value = entry.carEngine;

        // KM e importo
        currentRow.getCell(9).value = entry.startCity.toUpperCase(); // Partenza
        currentRow.getCell(10).value = waypointsExcel; // Tappe
        currentRow.getCell(11).value = entry.endCity.toUpperCase(); // Arrivo

        const km = parseFloat(entry.totalKm);
        currentRow.getCell(12).value = km; // KM
        const amount = parseFloat(entry.amount);
        currentRow.getCell(13).value = amount; // Importo

        // Apply template formatting to all cells
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].forEach((col) => {
          const cell = currentRow.getCell(col);

          // Apply template formatting
          cell.font = kmTemplateRowFormat.font;
          cell.fill = kmTemplateRowFormat.fill;
          cell.border = kmTemplateRowFormat.border;
          cell.alignment = kmTemplateRowFormat.alignment;

          // Override specific formats for special columns
          if (col === 12) {
            // KM column
            if (cell.alignment) {
              cell.alignment.horizontal = "right";
            } else {
              cell.alignment = { horizontal: "right", vertical: "middle" };
            }
          } else if (col === 13) {
            // Amount column
            cell.numFmt = "#,##0.00€";
            if (cell.alignment) {
              cell.alignment.horizontal = "right";
            } else {
              cell.alignment = { horizontal: "right", vertical: "middle" };
            }
          }
        });

        currentRow.commit();
      });

      // Calculate the new position of row 13 for km entries
      const newKmRow13Position = kmStartRow + kmEntries.length;

      // Insert the original row 13 at the end of the km entries
      const finalKmRow = kmSheet.getRow(newKmRow13Position);
      finalKmRow.height = kmRow13Height;

      // Copy all cells from the original row 13 of km sheet
      kmRow13Content.forEach((cellContent, colNumber) => {
        if (cellContent && colNumber > 0) {
          const cell = finalKmRow.getCell(colNumber);

          if (colNumber === 12) {
            // For column F (KM), update to sum all km rows
            const newSumFormula =
              kmEntries.length > 0
                ? `SUM(L${kmStartRow}:L${newKmRow13Position - 1})`
                : 0;

            if (typeof newSumFormula === "number") {
              cell.value = newSumFormula;
            } else {
              cell.value = { formula: newSumFormula };
            }

            // Make column 6 (km total) bold
            cell.font = {
              name: "Arial",
              size: 11,
              bold: true,
            };
            cell.border = {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" },
            };

            // Right align
            if (cell.alignment) {
              cell.alignment.horizontal = "right";
            } else {
              cell.alignment = { horizontal: "right", vertical: "middle" };
            }
          } else if (colNumber === 13) {
            // For column G (amount), update to sum all amount rows
            const newSumFormula =
              kmEntries.length > 0
                ? `SUM(M${kmStartRow}:M${newKmRow13Position - 1})`
                : 0;

            if (typeof newSumFormula === "number") {
              cell.value = newSumFormula;
            } else {
              cell.value = { formula: newSumFormula };
            }
            cell.numFmt = "#,##0.00€";

            // Make column 7 (amount total) bold
            cell.font = {
              name: "Arial",
              size: 11,
              bold: true,
            };
            cell.border = {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" },
            };

            // Right align
            if (cell.alignment) {
              cell.alignment.horizontal = "right";
            } else {
              cell.alignment = { horizontal: "right", vertical: "middle" };
            }
          } else if (colNumber < 6) {
            // For other cells, keep the original value
            cell.value = cellContent.value;

            // Apply light gray background
            // cell.fill = {
            //   type: "pattern",
            //   pattern: "solid",
            //   fgColor: { argb: "FFE0E0E0" },
            // };
          }
        }
      });
      finalKmRow.commit();

      // Update formula in cell D12 of TOTALI sheet for regular expenses
      const cellD12 = totaliSheet.getCell("D12");
      if (cellD12 && cellD12.value && cellD12.value.formula) {
        if (cellD12.value.formula.includes("'SPESE VARIE RISORSA'!F13")) {
          const newFormula = cellD12.value.formula.replace(
            /'SPESE VARIE RISORSA'!F13/g,
            `'SPESE VARIE RISORSA'!F${newRow13Position}`
          );
          cellD12.value = { formula: newFormula };
        } else {
          console.warn(
            "La formula nella cella D12 non è quella attesa. Controlla il template."
          );
        }
      }

      // Update formula in cell D18 of TOTALI sheet for the prepagate sum
      const cellD18 = totaliSheet.getCell("D18");
      if (cellD18 && cellD18.value && cellD18.value.formula) {
        if (
          cellD18.value.formula.includes("'SPESE PREPAGATE DA KEYTECH'!F13")
        ) {
          const newFormula = cellD18.value.formula.replace(
            /'SPESE PREPAGATE DA KEYTECH'!F13/g,
            `'SPESE PREPAGATE DA KEYTECH'!F${newPrepagateRow13Position}`
          );
          cellD18.value = { formula: newFormula };
        } else {
          console.warn(
            "La formula nella cella D18 non è quella attesa. Controlla il template."
          );
        }
      }

      // Update formula in cell D14 of TOTALI sheet for the fatture sum
      const cellD14 = totaliSheet.getCell("D14");
      if (cellD14 && cellD14.value && cellD14.value.formula) {
        if (
          cellD14.value.formula.includes("'FATTURE VS KEYTECH RISORSA'!F13")
        ) {
          const newFormula = cellD14.value.formula.replace(
            /'FATTURE VS KEYTECH RISORSA'!F13/g,
            `'FATTURE VS KEYTECH RISORSA'!F${newFattureRow13Position}`
          );
          cellD14.value = { formula: newFormula };
        } else {
          console.warn(
            "La formula nella cella D14 non è quella attesa. Controlla il template."
          );
        }
      }

      // Update formula in cell D10 of TOTALI sheet for the km reimbursements
      const cellD10 = totaliSheet.getCell("D13");
      if (cellD10 && cellD10.value && cellD10.value.formula) {
        if (cellD10.value.formula.includes("'RIMBORSI CHILOMETRICI'!M13")) {
          const newFormula = cellD10.value.formula.replace(
            /'RIMBORSI CHILOMETRICI'!M13/g,
            `'RIMBORSI CHILOMETRICI'!M${newKmRow13Position}`
          );
          cellD10.value = { formula: newFormula };
        } else {
          console.warn(
            "La formula nella cella D10 non è quella attesa. Controlla il template."
          );
        }
      }

      // Generate Excel file and download it
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `${filename}.xlsx`);
    } catch (error) {
      console.error("Error generating Excel document:", error);
    } finally {
      // Reset generating state regardless of success or error
      setIsGenerating(false);
      setButtonStyle({
        backgroundColor: "#2e7d32",
        textContent: "Scarica Excel",
        disabled: false,
      });
    }
  };

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      <Box
        sx={{ bgcolor: "#2e7d32", color: "white", p: 3, textAlign: "center" }}
      >
        <Typography variant="h4">Anteprima Excel</Typography>
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 2,
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: 4 }}>
            {/* File Info */}
            <Box
              sx={{
                bgcolor: "#f9f9f9",
                border: "1px solid #eee",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
              }}
            >
              <TableChartIcon sx={{ fontSize: 48, color: "#2e7d32", mb: 1 }} />
              <Typography
                variant="h5"
                sx={{ color: "#2e7d32", fontWeight: "bold" }}
              >
                {filename}.xlsx
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Foglio di calcolo Excel pronto per il download
              </Typography>
            </Box>

            {/* Info Message */}
            <Box
              sx={{
                bgcolor: "#e8f5e9",
                p: 2,
                borderRadius: 2,
                mt: 3,
                display: "flex",
                alignItems: "center",
              }}
            >
              <InfoIcon sx={{ color: "#2e7d32", mr: 1 }} />
              <Typography variant="body2">
                Il browser non può visualizzare l'anteprima diretta dei file
                Excel.
                <br />
                Di seguito è riportato un riepilogo completo del contenuto.
              </Typography>
            </Box>

            {/* Document Summary */}
            <Box sx={{ mt: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "#2e7d32",
                  borderBottom: "2px solid #eee",
                  pb: 1,
                  mb: 2,
                }}
              >
                Riepilogo Documento
              </Typography>

              {/* Summary Items */}
              {[
                { label: "Nome e Cognome", value: `${nome} ${cognome}` },
                { label: "Sede", value: sede },
                { label: "Cliente", value: cliente },
                { label: "Oggetto Attività", value: oggettoAttivita },
                { label: "Periodo", value: period },
                { label: "Numero Fatture", value: invoices.length },
                { label: "Numero Rimborsi Km", value: kmEntries.length },
              ].map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 1,
                  }}
                >
                  <Typography variant="body1" fontWeight="bold">
                    {item.label}:
                  </Typography>
                  <Typography variant="body1">{item.value}</Typography>
                </Box>
              ))}
            </Box>

            {/* Invoices Table */}
            {invoices.length > 0 && (
              <Box sx={{ mt: 4, overflowX: "auto" }}>
                <Typography variant="h6" sx={{ color: "#2e7d32", mb: 2 }}>
                  Dettaglio Fatture
                </Typography>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "14px",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          backgroundColor: "#e8f5e9",
                          color: "#2e7d32",
                          padding: "10px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Data
                      </th>
                      <th
                        style={{
                          backgroundColor: "#e8f5e9",
                          color: "#2e7d32",
                          padding: "10px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Descrizione
                      </th>
                      <th
                        style={{
                          backgroundColor: "#e8f5e9",
                          color: "#2e7d32",
                          padding: "10px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Importo
                      </th>
                      <th
                        style={{
                          backgroundColor: "#e8f5e9",
                          color: "#2e7d32",
                          padding: "10px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Mod Pagamento
                      </th>
                      <th
                        style={{
                          backgroundColor: "#e8f5e9",
                          color: "#2e7d32",
                          padding: "10px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Città
                      </th>
                      <th
                        style={{
                          backgroundColor: "#e8f5e9",
                          color: "#2e7d32",
                          padding: "10px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Prepagata
                      </th>
                      <th
                        style={{
                          backgroundColor: "#e8f5e9",
                          color: "#2e7d32",
                          padding: "10px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Fattura
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice, index) => (
                      <tr
                        key={index}
                        style={{
                          backgroundColor: index % 2 === 0 ? "#fff" : "#f2f2f2",
                        }}
                      >
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                          }}
                        >
                          {invoice.date}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                          }}
                        >
                          {invoice.invoice_title}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                          }}
                        >
                          €{" "}
                          {parseFloat(
                            String(invoice.amount).replace(",", ".")
                          ).toFixed(2)}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                          }}
                        >
                          {invoice.payment_method}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                          }}
                        >
                          {invoice.city}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                          }}
                        >
                          {invoice.prepagata ? "Sì" : "No"}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                          }}
                        >
                          {invoice.invoice === true ||
                          invoice.invoice === "true"
                            ? "Sì"
                            : "No"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Invoices Totals */}
                <Box
                  sx={{
                    mt: 3,
                    pt: 2,
                    borderTop: "2px solid #ddd",
                  }}
                >
                  {[
                    { label: "Totale Vitto", value: totals.food },
                    { label: "Totale Trasporto", value: totals.transportation },
                    { label: "Totale Alloggio", value: totals.housing },
                    { label: "Totale Prepagata", value: totals.prepaid },
                    { label: "Totale (escl. Prepagata)", value: totals.total },
                  ].map((item, index) => (
                    <Typography
                      key={index}
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ my: 1 }}
                    >
                      {item.label}: € {item.value.toFixed(2)}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}

            {/* KM Entries Table */}
            {kmEntries.length > 0 && (
              <Box sx={{ mt: 4, overflowX: "auto" }}>
                <Typography variant="h6" sx={{ color: "#2e7d32", mb: 2 }}>
                  Dettaglio Rimborsi Chilometrici
                </Typography>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "14px",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          backgroundColor: "#e8f5e9",
                          color: "#2e7d32",
                          padding: "10px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Data
                      </th>
                      <th
                        style={{
                          backgroundColor: "#e8f5e9",
                          color: "#2e7d32",
                          padding: "10px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Veicolo
                      </th>
                      <th
                        style={{
                          backgroundColor: "#e8f5e9",
                          color: "#2e7d32",
                          padding: "10px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Partenza
                      </th>
                      <th
                        style={{
                          backgroundColor: "#e8f5e9",
                          color: "#2e7d32",
                          padding: "10px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Destinazione
                      </th>
                      <th
                        style={{
                          backgroundColor: "#e8f5e9",
                          color: "#2e7d32",
                          padding: "10px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        KM
                      </th>
                      <th
                        style={{
                          backgroundColor: "#e8f5e9",
                          color: "#2e7d32",
                          padding: "10px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Tipo Auto
                      </th>
                      <th
                        style={{
                          backgroundColor: "#e8f5e9",
                          color: "#2e7d32",
                          padding: "10px",
                          textAlign: "right",
                          border: "1px solid #ddd",
                        }}
                      >
                        Importo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {kmEntries.map((entry, index) => (
                      <tr
                        key={index}
                        style={{
                          backgroundColor: index % 2 === 0 ? "#fff" : "#f2f2f2",
                        }}
                      >
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                          }}
                        >
                          {entry.date || "-"}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                          }}
                        >
                          {`${entry.carBrand} ${entry.carModel} (${entry.carEngine} cc)`}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                          }}
                        >
                          {entry.startCity}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                          }}
                        >
                          {entry.endCity}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                            textAlign: "right",
                          }}
                        >
                          {parseFloat(entry.totalKm).toFixed(2)}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                          }}
                        >
                          {entry.isCompanyCar ? "Aziendale" : "Personale"}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                            textAlign: "right",
                          }}
                        >
                          € {parseFloat(entry.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* KM Totals */}
                <Box
                  sx={{
                    mt: 3,
                    pt: 2,
                    borderTop: "2px solid #ddd",
                  }}
                >
                  {kmSummary.totalPersonal > 0 && (
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ my: 1 }}
                    >
                      Totale Auto Personale:{" "}
                      {kmSummary.totalPersonal.toFixed(2)} km - €{" "}
                      {kmSummary.totalPersonalAmount.toFixed(2)}
                    </Typography>
                  )}
                  {kmSummary.totalCompany > 0 && (
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ my: 1 }}
                    >
                      Totale Auto Aziendale: {kmSummary.totalCompany.toFixed(2)}{" "}
                      km - € {kmSummary.totalCompanyAmount.toFixed(2)}
                    </Typography>
                  )}
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ my: 1 }}
                  >
                    Totale Rimborsi Km: {totalKm.toFixed(2)} km - €{" "}
                    {totalKmAmount.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Grand Total */}
            {(invoices.length > 0 || kmEntries.length > 0) && (
              <Box
                sx={{
                  mt: 4,
                  pt: 2,
                  borderTop: "2px solid #2e7d32",
                  borderBottom: "2px solid #2e7d32",
                  backgroundColor: "#f5f5f5",
                  p: 2,
                  textAlign: "center",
                }}
              >
                <Typography variant="h6" fontWeight="bold" color="#2e7d32">
                  TOTALE COMPLESSIVO: €{" "}
                  {(totals.total + totalKmAmount).toFixed(2)}
                </Typography>
              </Box>
            )}

            {/* Download Button */}
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<DownloadIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  bgcolor: buttonStyle.backgroundColor,
                  "&:hover": {
                    bgcolor: buttonStyle.disabled ? "#9e9e9e" : "#1b5e20",
                  },
                  transition: "background-color 0.1s ease",
                }}
                onClick={() => {
                  // Aggiorna immediatamente lo stile del pulsante
                  setButtonStyle({
                    backgroundColor: "#9e9e9e",
                    textContent: "Generazione in corso...",
                    disabled: true,
                  });

                  // Piccolo ritardo per garantire l'aggiornamento dell'UI
                  setTimeout(() => {
                    handleDownload();
                  }, 50);
                }}
                disabled={buttonStyle.disabled}
              >
                {buttonStyle.textContent}
              </Button>

              {/* Add alert message */}
              {isGenerating && (
                <Alert
                  severity="info"
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "center",
                    maxWidth: "400px",
                    margin: "16px auto 0",
                  }}
                >
                  La generazione del file richiede 30 secondi, attendere
                  prego...
                </Alert>
              )}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
