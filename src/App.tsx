import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Typography, Box, Alert, Snackbar } from '@mui/material';
import { NaturalLanguageInputAI } from './components/NaturalLanguageInputAI';
import { MatrixVisualizer } from './components/MatrixVisualizer';
import { MatrixInterconnector } from './components/MatrixInterconnector';
import { Matrix } from './types/GameTheory';
import { MatrixTransformations } from './utils/matrixTransformations';
import { AIMatrixParser } from './utils/aiMatrixParser';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

function App() {
  const [matrices, setMatrices] = useState<Matrix[]>([]);
  const [alert, setAlert] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleMatrixAdd = (newMatrix: Matrix) => {
    setMatrices([...matrices, newMatrix]);
    setAlert({ open: true, message: 'Matrix created successfully!', severity: 'success' });
  };

  const handleMatrixConnect = async (sourceId: string, _targetId: string, transformType: string) => {
    const sourceMatrix = matrices.find(m => m.id === sourceId);
    if (!sourceMatrix) return;

    try {
      let transformedMatrix: Matrix | Matrix[];

      if (process.env.REACT_APP_OPENAI_API_KEY) {
        transformedMatrix = await AIMatrixParser.generateConnectedMatrix(sourceMatrix, transformType);
      } else {
        switch (transformType) {
          case 'evolutionary':
            transformedMatrix = MatrixTransformations.evolutionary(sourceMatrix);
            break;
          case 'nash':
            transformedMatrix = MatrixTransformations.nashEquilibrium(sourceMatrix);
            break;
          case 'pareto':
            transformedMatrix = MatrixTransformations.paretoOptimal(sourceMatrix);
            break;
          case 'multi-universe':
            transformedMatrix = MatrixTransformations.multiUniverseBranch(sourceMatrix);
            break;
          default:
            transformedMatrix = MatrixTransformations.evolutionary(sourceMatrix);
        }
      }

      if (Array.isArray(transformedMatrix)) {
        setMatrices([...matrices, ...transformedMatrix]);
      } else {
        transformedMatrix.connectedTo = [sourceId];
        setMatrices([...matrices, transformedMatrix]);
      }

      setAlert({ open: true, message: 'Matrices connected successfully!', severity: 'success' });
    } catch (error) {
      setAlert({ open: true, message: 'Failed to connect matrices', severity: 'error' });
    }
  };

  const handleCellClick = (matrixId: string, row: number, col: number) => {
    console.log(`Clicked cell [${row}, ${col}] in matrix ${matrixId}`);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Universe Game Theory Simulator
          </Typography>
          <Typography variant="h6" color="text.secondary" align="center" paragraph>
            Create and connect game theory matrices using natural language
          </Typography>

          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: 300, maxWidth: { xs: '100%', md: 400 } }}>
              <NaturalLanguageInputAI onSubmit={handleMatrixAdd} existingMatrices={matrices} />
              {matrices.length > 1 && (
                <MatrixInterconnector 
                  matrices={matrices} 
                  onConnect={handleMatrixConnect}
                />
              )}
            </Box>

            <Box sx={{ flex: '2 1 500px', minWidth: 300 }}>
              <Box sx={{ maxHeight: '80vh', overflow: 'auto' }}>
                {matrices.length === 0 ? (
                  <Alert severity="info" sx={{ m: 2 }}>
                    No matrices created yet. Use the natural language input to create your first game matrix!
                  </Alert>
                ) : (
                  matrices.map((matrix) => (
                    <MatrixVisualizer
                      key={matrix.id}
                      matrix={matrix}
                      onCellClick={(row, col) => handleCellClick(matrix.id, row, col)}
                    />
                  ))
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>

      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert severity={alert.severity} onClose={() => setAlert({ ...alert, open: false })}>
          {alert.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
