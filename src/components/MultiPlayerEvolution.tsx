import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Slider, Chip, LinearProgress, Alert } from '@mui/material';
import { Matrix } from '../types/GameTheory';
import { PlayArrow as PlayArrowIcon, Pause as PauseIcon } from '@mui/icons-material';

interface EvolutionState {
  generation: number;
  universes: UniverseState[];
  cooperationLevel: number;
  dominantStrategy: string;
}

interface UniverseState {
  id: string;
  name: string;
  civilizations: Civilization[];
  payoffMatrix: number[][][];
  isPostScarcity: boolean;
}

interface Civilization {
  id: string;
  name: string;
  strategy: 'Hide' | 'Signal' | 'Cooperate';
  fitness: number;
}

interface MultiPlayerEvolutionProps {
  initialMatrix?: Matrix;
  numCivilizations: number;
  numUniverses: number;
  postScarcityGen: number;
}

export const MultiPlayerEvolution: React.FC<MultiPlayerEvolutionProps> = ({
  numCivilizations = 4,
  numUniverses = 3,
  postScarcityGen = 5
}) => {
  const [evolution, setEvolution] = useState<EvolutionState[]>([]);
  const [currentGen, setCurrentGen] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1000);

  const initializeUniverses = (): UniverseState[] => {
    const universes: UniverseState[] = [];
    
    for (let u = 0; u < numUniverses; u++) {
      const civilizations: Civilization[] = [];
      
      for (let c = 0; c < numCivilizations; c++) {
        civilizations.push({
          id: `civ-${c}`,
          name: `Civilization ${String.fromCharCode(65 + c)}`,
          strategy: 'Hide',
          fitness: 1
        });
      }
      
      universes.push({
        id: `universe-${u}`,
        name: `Universe ${u + 1}`,
        civilizations,
        payoffMatrix: generateDarkForestPayoffs(numCivilizations),
        isPostScarcity: false
      });
    }
    
    return universes;
  };

  const generateDarkForestPayoffs = (n: number): number[][][] => {
    // Simplified payoff structure for n-player game
    const strategies = ['Hide', 'Signal', 'Cooperate'];
    const payoffs: number[][][] = [];
    
    // Dark Forest payoffs: Hide dominates
    return [
      [[1, 1, 1, 1]], // All hide: safe but limited
      [[0, 3, 2, 2]], // One signals: risky for signaler
      [[0, 0, 4, 4]]  // Cooperation: currently penalized
    ];
  };

  const generatePostScarcityPayoffs = (n: number): number[][][] => {
    // Post-scarcity: Cooperation becomes optimal
    return [
      [[2, 2, 2, 2]], // All hide: ok but missing opportunities
      [[3, 3, 3, 3]], // Signal: better with abundance
      [[5, 5, 5, 5]]  // Cooperate: optimal in post-scarcity
    ];
  };

  const evolveGeneration = (universes: UniverseState[], generation: number): UniverseState[] => {
    return universes.map(universe => {
      const newUniverse = { ...universe };
      
      // Switch to post-scarcity at specified generation
      if (generation >= postScarcityGen && !universe.isPostScarcity) {
        newUniverse.isPostScarcity = true;
        newUniverse.payoffMatrix = generatePostScarcityPayoffs(numCivilizations);
      }
      
      // Evolve strategies based on fitness
      newUniverse.civilizations = universe.civilizations.map(civ => {
        const strategies: Array<'Hide' | 'Signal' | 'Cooperate'> = ['Hide', 'Signal', 'Cooperate'];
        const fitness: number[] = strategies.map(strat => {
          // Calculate fitness for each strategy
          if (universe.isPostScarcity) {
            return strat === 'Cooperate' ? 5 : strat === 'Signal' ? 3 : 2;
          } else {
            return strat === 'Hide' ? 3 : strat === 'Signal' ? 1 : 0;
          }
        });
        
        // Probabilistic strategy selection based on fitness
        const totalFitness = fitness.reduce((a: number, b: number) => a + b, 0);
        const rand = Math.random() * totalFitness;
        let cumulative = 0;
        
        for (let i = 0; i < strategies.length; i++) {
          cumulative += fitness[i];
          if (rand < cumulative) {
            return { ...civ, strategy: strategies[i], fitness: fitness[i] };
          }
        }
        
        return civ;
      });
      
      return newUniverse;
    });
  };

  const calculateCooperationLevel = (universes: UniverseState[]): number => {
    let totalCooperating = 0;
    let totalCivs = 0;
    
    universes.forEach(universe => {
      universe.civilizations.forEach(civ => {
        if (civ.strategy === 'Cooperate') totalCooperating++;
        totalCivs++;
      });
    });
    
    return (totalCooperating / totalCivs) * 100;
  };

  const getDominantStrategy = (universes: UniverseState[]): string => {
    const strategyCounts = { Hide: 0, Signal: 0, Cooperate: 0 };
    
    universes.forEach(universe => {
      universe.civilizations.forEach(civ => {
        strategyCounts[civ.strategy]++;
      });
    });
    
    return Object.entries(strategyCounts)
      .sort(([, a], [, b]) => b - a)[0][0];
  };

  const runEvolution = () => {
    if (evolution.length === 0) {
      const initialUniverses = initializeUniverses();
      setEvolution([{
        generation: 0,
        universes: initialUniverses,
        cooperationLevel: calculateCooperationLevel(initialUniverses),
        dominantStrategy: getDominantStrategy(initialUniverses)
      }]);
    }
    
    setIsRunning(true);
  };

  useEffect(() => {
    if (isRunning && currentGen < 10) {
      const timer = setTimeout(() => {
        const lastState = evolution[evolution.length - 1];
        const newUniverses = evolveGeneration(lastState.universes, currentGen + 1);
        
        const newState: EvolutionState = {
          generation: currentGen + 1,
          universes: newUniverses,
          cooperationLevel: calculateCooperationLevel(newUniverses),
          dominantStrategy: getDominantStrategy(newUniverses)
        };
        
        setEvolution([...evolution, newState]);
        setCurrentGen(currentGen + 1);
      }, speed);
      
      return () => clearTimeout(timer);
    } else if (currentGen >= 10) {
      setIsRunning(false);
    }
  }, [isRunning, currentGen, evolution, speed]);

  const currentState = evolution[currentGen];

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        Multi-Universe Evolution Simulator
      </Typography>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {numCivilizations} civilizations × {numUniverses} parallel universes
      </Typography>
      
      <Box sx={{ my: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={isRunning ? <PauseIcon /> : <PlayArrowIcon />}
            onClick={() => isRunning ? setIsRunning(false) : runEvolution()}
          >
            {isRunning ? 'Pause' : 'Start Evolution'}
          </Button>
          
          <Chip 
            label={`Generation ${currentGen}`} 
            color="primary" 
          />
          
          {currentGen >= postScarcityGen && (
            <Chip 
              label="Post-Scarcity Active" 
              color="success" 
            />
          )}
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2">Evolution Speed</Typography>
          <Slider
            value={speed}
            onChange={(_, v) => setSpeed(v as number)}
            min={100}
            max={2000}
            step={100}
            marks
            valueLabelDisplay="auto"
            valueLabelFormat={v => `${v}ms`}
          />
        </Box>
        
        <LinearProgress 
          variant="determinate" 
          value={currentGen * 10} 
          sx={{ mb: 2 }}
        />
      </Box>
      
      {currentState && (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cooperation Level: {currentState.cooperationLevel.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Dominant Strategy: {currentState.dominantStrategy}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {currentState.universes.map(universe => (
              <Paper key={universe.id} variant="outlined" sx={{ p: 2, flex: 1, minWidth: 200 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {universe.name}
                </Typography>
                {universe.isPostScarcity && (
                  <Chip label="Post-Scarcity" size="small" color="success" sx={{ mb: 1 }} />
                )}
                {universe.civilizations.map(civ => (
                  <Box key={civ.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{civ.name}:</Typography>
                    <Chip 
                      label={civ.strategy} 
                      size="small" 
                      color={
                        civ.strategy === 'Cooperate' ? 'success' : 
                        civ.strategy === 'Signal' ? 'warning' : 
                        'default'
                      }
                    />
                  </Box>
                ))}
              </Paper>
            ))}
          </Box>
          
          {currentGen === 10 && (
            <Alert severity="info" sx={{ mt: 3 }}>
              Evolution complete! Cooperation emerged at {currentState.cooperationLevel.toFixed(1)}% 
              after introducing post-scarcity technology at generation {postScarcityGen}.
            </Alert>
          )}
        </>
      )}
    </Paper>
  );
};