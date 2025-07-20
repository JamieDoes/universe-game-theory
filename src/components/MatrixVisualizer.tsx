import React from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Matrix } from '../types/GameTheory';

interface MatrixVisualizerProps {
  matrix: Matrix;
  onCellClick?: (row: number, col: number) => void;
}

export const MatrixVisualizer: React.FC<MatrixVisualizerProps> = ({ matrix, onCellClick }) => {
  const { players, strategies, payoffs, name, description } = matrix;

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>{name}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {description}
        </Typography>
      )}
      
      <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" colSpan={2} rowSpan={2}>
                {players[0]} \ {players[1]}
              </TableCell>
              <TableCell align="center" colSpan={strategies[1].length}>
                {players[1]}
              </TableCell>
            </TableRow>
            <TableRow>
              {strategies[1].map((strategy, idx) => (
                <TableCell key={idx} align="center">
                  {strategy}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {strategies[0].map((strategy, rowIdx) => (
              <TableRow key={rowIdx}>
                {rowIdx === 0 && (
                  <TableCell 
                    align="center" 
                    rowSpan={strategies[0].length}
                    sx={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                  >
                    {players[0]}
                  </TableCell>
                )}
                <TableCell align="center">{strategy}</TableCell>
                {payoffs[rowIdx].map((payoff, colIdx) => (
                  <TableCell 
                    key={colIdx} 
                    align="center"
                    onClick={() => onCellClick?.(rowIdx, colIdx)}
                    sx={{ 
                      cursor: onCellClick ? 'pointer' : 'default',
                      '&:hover': onCellClick ? { backgroundColor: 'action.hover' } : {}
                    }}
                  >
                    <Box>
                      <Typography variant="body2" color="primary">
                        {payoff[0]}
                      </Typography>
                      <Typography variant="body2" color="secondary">
                        {payoff[1]}
                      </Typography>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};