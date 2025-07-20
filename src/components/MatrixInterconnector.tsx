import React, { useState } from 'react';
import { Box, Paper, Typography, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Matrix } from '../types/GameTheory';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';

interface MatrixInterconnectorProps {
  matrices: Matrix[];
  onConnect: (sourceId: string, targetId: string, transformType: string) => void;
}

export const MatrixInterconnector: React.FC<MatrixInterconnectorProps> = ({ matrices, onConnect }) => {
  const [sourceMatrix, setSourceMatrix] = useState('');
  const [targetMatrix, setTargetMatrix] = useState('');
  const [transformType, setTransformType] = useState('evolutionary');

  const handleConnect = () => {
    if (sourceMatrix && targetMatrix && sourceMatrix !== targetMatrix) {
      onConnect(sourceMatrix, targetMatrix, transformType);
      setSourceMatrix('');
      setTargetMatrix('');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        Connect Matrices
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Source Matrix</InputLabel>
          <Select
            value={sourceMatrix}
            onChange={(e) => setSourceMatrix(e.target.value)}
            label="Source Matrix"
          >
            {matrices.map((matrix) => (
              <MenuItem key={matrix.id} value={matrix.id}>
                {matrix.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <ArrowForwardIcon />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Target Matrix</InputLabel>
          <Select
            value={targetMatrix}
            onChange={(e) => setTargetMatrix(e.target.value)}
            label="Target Matrix"
          >
            {matrices.map((matrix) => (
              <MenuItem 
                key={matrix.id} 
                value={matrix.id}
                disabled={matrix.id === sourceMatrix}
              >
                {matrix.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Transform</InputLabel>
          <Select
            value={transformType}
            onChange={(e) => setTransformType(e.target.value)}
            label="Transform"
          >
            <MenuItem value="evolutionary">Evolutionary</MenuItem>
            <MenuItem value="nash">Nash Equilibrium</MenuItem>
            <MenuItem value="pareto">Pareto Optimal</MenuItem>
            <MenuItem value="multi-universe">Multi-Universe</MenuItem>
          </Select>
        </FormControl>

        <Button 
          variant="contained" 
          onClick={handleConnect}
          disabled={!sourceMatrix || !targetMatrix || sourceMatrix === targetMatrix}
        >
          Connect
        </Button>
      </Box>
    </Paper>
  );
};