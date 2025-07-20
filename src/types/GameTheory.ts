export interface Matrix {
  id: string;
  name: string;
  players: string[];
  strategies: string[][];
  payoffs: number[][][];
  description?: string;
  sourcePrompt?: string;
  connectedTo?: string[];
}

export interface GameScenario {
  id: string;
  name: string;
  type: 'dark-forest' | 'post-scarcity' | 'multi-universe' | 'custom';
  matrices: Matrix[];
  evolutionRules?: EvolutionRule[];
}

export interface EvolutionRule {
  id: string;
  name: string;
  sourceMatrixId: string;
  targetMatrixId: string;
  transformFunction: (input: Matrix) => Matrix;
}

export interface NaturalLanguageInput {
  prompt: string;
  context?: 'dark-forest' | 'post-scarcity' | 'multi-universe';
}