import { Matrix } from '../types/GameTheory';

export class MatrixParser {
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  static parseNaturalLanguage(prompt: string): Matrix {
    const lowercasePrompt = prompt.toLowerCase();
    
    if (lowercasePrompt.includes('dark forest') || lowercasePrompt.includes('hide') || lowercasePrompt.includes('signal')) {
      return this.createDarkForestMatrix();
    }
    
    if (lowercasePrompt.includes('cooperate') || lowercasePrompt.includes('defect') || lowercasePrompt.includes('prisoner')) {
      return this.createPrisonersDilemmaMatrix();
    }
    
    if (lowercasePrompt.includes('post-scarcity') || lowercasePrompt.includes('abundance')) {
      return this.createPostScarcityMatrix();
    }
    
    const players = this.extractPlayers(prompt);
    const strategies = this.extractStrategies(prompt);
    const payoffs = this.generateDefaultPayoffs(players.length, strategies.length);
    
    return {
      id: this.generateId(),
      name: this.extractName(prompt),
      players,
      strategies: strategies.map(s => [s]),
      payoffs,
      sourcePrompt: prompt
    };
  }

  private static createDarkForestMatrix(): Matrix {
    return {
      id: this.generateId(),
      name: 'Dark Forest Dilemma',
      players: ['Civilization A', 'Civilization B'],
      strategies: [['Signal', 'Hide'], ['Signal', 'Hide']],
      payoffs: [
        [[3, 3], [0, 5]],
        [[5, 0], [1, 1]]
      ],
      description: 'Nash equilibrium at mutual hiding, explaining Fermi silence'
    };
  }

  private static createPrisonersDilemmaMatrix(): Matrix {
    return {
      id: this.generateId(),
      name: 'Prisoner\'s Dilemma',
      players: ['Player 1', 'Player 2'],
      strategies: [['Cooperate', 'Defect'], ['Cooperate', 'Defect']],
      payoffs: [
        [[3, 3], [0, 5]],
        [[5, 0], [1, 1]]
      ]
    };
  }

  private static createPostScarcityMatrix(): Matrix {
    return {
      id: this.generateId(),
      name: 'Post-Scarcity Cooperation',
      players: ['Community A', 'Community B'],
      strategies: [['Share', 'Hoard', 'Innovate'], ['Share', 'Hoard', 'Innovate']],
      payoffs: [
        [[5, 5], [2, 3], [6, 4]],
        [[3, 2], [1, 1], [3, 2]],
        [[4, 6], [2, 3], [7, 7]]
      ],
      description: 'Cooperation and innovation dominate in abundance scenarios'
    };
  }

  private static extractPlayers(prompt: string): string[] {
    const playerPatterns = [
      /(\w+)\s+(?:vs|versus|against)\s+(\w+)/i,
      /between\s+(\w+)\s+and\s+(\w+)/i,
      /players?:\s*([^,]+),\s*([^,]+)/i
    ];
    
    for (const pattern of playerPatterns) {
      const match = prompt.match(pattern);
      if (match) {
        return [match[1], match[2]];
      }
    }
    
    return ['Player 1', 'Player 2'];
  }

  private static extractStrategies(prompt: string): string[] {
    const strategyPatterns = [
      /strategies?:\s*([^,]+(?:,\s*[^,]+)*)/i,
      /choices?:\s*([^,]+(?:,\s*[^,]+)*)/i,
      /options?:\s*([^,]+(?:,\s*[^,]+)*)/i
    ];
    
    for (const pattern of strategyPatterns) {
      const match = prompt.match(pattern);
      if (match) {
        return match[1].split(',').map(s => s.trim());
      }
    }
    
    return ['Strategy A', 'Strategy B'];
  }

  private static extractName(prompt: string): string {
    const nameMatch = prompt.match(/(?:game|matrix|scenario)(?:\s+called|\s+named)?\s*:?\s*"?([^"]+)"?/i);
    if (nameMatch) {
      return nameMatch[1].trim();
    }
    
    const firstWords = prompt.split(' ').slice(0, 3).join(' ');
    return firstWords.length > 30 ? firstWords.substring(0, 30) + '...' : firstWords;
  }

  private static generateDefaultPayoffs(numPlayers: number, numStrategies: number): number[][][] {
    const payoffs: number[][][] = [];
    
    for (let i = 0; i < numStrategies; i++) {
      const row: number[][] = [];
      for (let j = 0; j < numStrategies; j++) {
        const payoff: number[] = [];
        for (let p = 0; p < numPlayers; p++) {
          payoff.push(Math.floor(Math.random() * 10));
        }
        row.push(payoff);
      }
      payoffs.push(row);
    }
    
    return payoffs;
  }
}