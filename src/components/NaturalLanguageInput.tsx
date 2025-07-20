import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography, Chip } from '@mui/material';
import { NaturalLanguageInput as NLInput } from '../types/GameTheory';

interface NaturalLanguageInputProps {
  onSubmit: (input: NLInput) => void;
}

export const NaturalLanguageInput: React.FC<NaturalLanguageInputProps> = ({ onSubmit }) => {
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState<'dark-forest' | 'post-scarcity' | 'multi-universe' | undefined>();

  const examples = [
    'Create a Dark Forest game between Earth and Alien civilizations with strategies: Signal, Hide, Attack',
    'Model post-scarcity cooperation between communities with options: Share Resources, Innovate, Isolate',
    'Design a multi-universe game where universes can: Merge, Diverge, Communicate, Isolate',
    'Build a climate action game: Countries A vs B, strategies: Reduce Emissions, Continue Polluting, Invest in Tech'
  ];

  const handleSubmit = () => {
    if (prompt.trim()) {
      onSubmit({ prompt, context });
      setPrompt('');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        Natural Language Matrix Generator
      </Typography>
      
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
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Chip
          label="Dark Forest"
          onClick={() => setContext('dark-forest')}
          color={context === 'dark-forest' ? 'primary' : 'default'}
          clickable
        />
        <Chip
          label="Post-Scarcity"
          onClick={() => setContext('post-scarcity')}
          color={context === 'post-scarcity' ? 'primary' : 'default'}
          clickable
        />
        <Chip
          label="Multi-Universe"
          onClick={() => setContext('multi-universe')}
          color={context === 'multi-universe' ? 'primary' : 'default'}
          clickable
        />
      </Box>

      <Button 
        variant="contained" 
        onClick={handleSubmit}
        disabled={!prompt.trim()}
        fullWidth
      >
        Generate Matrix
      </Button>

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