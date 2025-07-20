import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Paper, Typography, Chip, CircularProgress, Alert } from '@mui/material';
import { Matrix } from '../types/GameTheory';
import { AIMatrixParser } from '../utils/aiMatrixParser';
import { MatrixParser } from '../utils/matrixParser';

interface NaturalLanguageInputAIProps {
  onSubmit: (matrix: Matrix) => void;
  existingMatrices: Matrix[];
}

export const NaturalLanguageInputAI: React.FC<NaturalLanguageInputAIProps> = ({ onSubmit, existingMatrices }) => {
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState<'dark-forest' | 'post-scarcity' | 'multi-universe' | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [useAI, setUseAI] = useState(true);

  useEffect(() => {
    if (useAI && process.env.REACT_APP_OPENAI_API_KEY) {
      AIMatrixParser.suggestScenarios(existingMatrices).then(setSuggestions);
    }
  }, [existingMatrices, useAI]);

  const examples = [
    'Create a Dark Forest game between Earth and Alien civilizations with strategies: Signal, Hide, Attack',
    'Model post-scarcity cooperation between communities with options: Share Resources, Innovate, Isolate',
    'Design a multi-universe game where universes can: Merge, Diverge, Communicate, Isolate',
    'Build a climate action game: Countries A vs B, strategies: Reduce Emissions, Continue Polluting, Invest in Tech'
  ];

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      let newMatrix: Matrix;
      
      if (useAI && process.env.REACT_APP_OPENAI_API_KEY) {
        newMatrix = await AIMatrixParser.parseWithAI(prompt, context);
      } else {
        newMatrix = MatrixParser.parseNaturalLanguage(prompt);
      }
      
      onSubmit(newMatrix);
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse input');
    } finally {
      setLoading(false);
    }
  };

  const hasAPIKey = !!process.env.REACT_APP_OPENAI_API_KEY;

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Natural Language Matrix Generator
        </Typography>
        {hasAPIKey && (
          <Chip
            label={useAI ? "AI Mode" : "Basic Mode"}
            onClick={() => setUseAI(!useAI)}
            color={useAI ? "primary" : "default"}
            clickable
          />
        )}
      </Box>

      {!hasAPIKey && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Add REACT_APP_OPENAI_API_KEY to .env for AI-powered parsing
        </Alert>
      )}
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Describe your game scenario in natural language:
        </Typography>
        
        <TextField
          fullWidth
          multiline
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your game theory scenario..."
          variant="outlined"
          sx={{ mt: 1 }}
          disabled={loading}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Chip
          label="Dark Forest"
          onClick={() => setContext('dark-forest')}
          color={context === 'dark-forest' ? 'primary' : 'default'}
          clickable
          disabled={loading}
        />
        <Chip
          label="Post-Scarcity"
          onClick={() => setContext('post-scarcity')}
          color={context === 'post-scarcity' ? 'primary' : 'default'}
          clickable
          disabled={loading}
        />
        <Chip
          label="Multi-Universe"
          onClick={() => setContext('multi-universe')}
          color={context === 'multi-universe' ? 'primary' : 'default'}
          clickable
          disabled={loading}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button 
        variant="contained" 
        onClick={handleSubmit}
        disabled={!prompt.trim() || loading}
        fullWidth
      >
        {loading ? <CircularProgress size={24} /> : 'Generate Matrix'}
      </Button>

      {useAI && suggestions.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            AI Suggestions:
          </Typography>
          {suggestions.map((suggestion, idx) => (
            <Typography 
              key={idx}
              variant="body2" 
              color="primary"
              sx={{ 
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' },
                mb: 0.5
              }}
              onClick={() => setPrompt(suggestion)}
            >
              • {suggestion}
            </Typography>
          ))}
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Example prompts:
        </Typography>
        {examples.map((example, idx) => (
          <Typography 
            key={idx}
            variant="body2" 
            color="text.secondary"
            sx={{ 
              cursor: 'pointer',
              '&:hover': { color: 'primary.main' },
              mb: 0.5
            }}
            onClick={() => setPrompt(example)}
          >
            • {example}
          </Typography>
        ))}
      </Box>
    </Paper>
  );
};