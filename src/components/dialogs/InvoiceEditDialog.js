import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material';
import React, { useEffect, useState } from 'react';

export const InvoiceEditDialog = ({ open, invoice, onClose, onSave }) => {
  const [editedInvoice, setEditedInvoice] = useState(null);

  useEffect(() => {
    if (invoice) {
      setEditedInvoice({...invoice});
    }
  }, [invoice]);

  const handleChange = (field, value) => {
    setEditedInvoice(prev => ({ ...prev, [field]: value }));
  };

  if (!invoice || !editedInvoice) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Modifica Fattura</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField 
            label="Data" 
            value={editedInvoice.date || ''} 
            onChange={(e) => handleChange('date', e.target.value)} 
            fullWidth 
          />
          <TextField 
            label="Titolo" 
            value={editedInvoice.invoice_title || ''} 
            onChange={(e) => handleChange('invoice_title', e.target.value)} 
            fullWidth 
          />
          <TextField 
            label="Importo" 
            value={editedInvoice.amount || ''} 
            onChange={(e) => handleChange('amount', e.target.value)} 
            fullWidth 
          />
          <TextField 
            label="Metodo di Pagamento" 
            value={editedInvoice.payment_method || ''} 
            onChange={(e) => handleChange('payment_method', e.target.value)} 
            fullWidth 
          />
          <TextField 
            label="Città" 
            value={editedInvoice.city || ''} 
            onChange={(e) => handleChange('city', e.target.value)} 
            fullWidth 
          />
          <FormControl fullWidth>
            <InputLabel id="motive-select-label">Motivo</InputLabel>
            <Select
              labelId="motive-select-label"
              id="motive-select"
              value={editedInvoice.motive || ''}
              label="Motivo"
              onChange={(e) => handleChange('motive', e.target.value)}
            >
              <MenuItem value="food">Vitto</MenuItem>
              <MenuItem value="transportation">Trasporto</MenuItem>
              <MenuItem value="housing">Alloggio</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>
        <Button onClick={() => onSave(editedInvoice)} variant="contained" color="primary">Salva</Button>
      </DialogActions>
    </Dialog>
  );
};