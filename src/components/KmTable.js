import React, { useState } from "react";
import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useTheme } from "@mui/material/styles";
import { KmEditDialog } from "./dialogs/KmEditDialog";

export const KmTable = ({
  kms = [],
  onDeleteKm,
  onEditKm,
  calculateKmAmount,
  onCompanyCarToggle,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [editingKm, setEditingKm] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEditKm = (index) => {
    setEditingKm({ ...kms[index], index });
    setEditDialogOpen(true);
  };

  const handleSaveKm = (updatedKm) => {
    if (onEditKm) {
      onEditKm(updatedKm);
    }
    setEditDialogOpen(false);
  };

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Divider sx={{ mb: 2 }} />

      {kms.length > 0 ? (
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Partenza</TableCell>
                {!isMobile && <TableCell>Tappe</TableCell>}
                <TableCell>Destinazione</TableCell>
                <TableCell>KM</TableCell>
                <TableCell>Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {kms.map((km, index) => (
                <TableRow key={index} hover>
                  <TableCell>{km.date || "-"}</TableCell>
                  <TableCell>{km.startCity}</TableCell>
                  {!isMobile && (
                    <TableCell>
                      {km.waypoints ? km.waypoints.join(" | ") : ""}
                    </TableCell>
                  )}
                  <TableCell>{km.endCity}</TableCell>
                  <TableCell>{km.totalKm}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex" }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditKm(index)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onDeleteKm(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Nessun rimborso chilometrico aggiunto
          </Typography>
        </Box>
      )}
      
      {editingKm && (
        <KmEditDialog
          calculateKmAmount={calculateKmAmount}
          open={editDialogOpen}
          km={editingKm}
          onClose={() => setEditDialogOpen(false)}
          onSave={handleSaveKm}
        />
      )}
    </Box>
  );
};