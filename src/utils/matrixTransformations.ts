import { Matrix } from '../types/GameTheory';

export class MatrixTransformations {
  static evolutionary(source: Matrix, iterations: number = 100): Matrix {
    const newMatrix = { ...source };
    const payoffs = JSON.parse(JSON.stringify(source.payoffs));
    
    for (let iter = 0; iter < iterations; iter++) {
      for (let i = 0; i < payoffs.length; i++) {
        for (let j = 0; j < payoffs[i].length; j++) {
          const neighbors = this.getNeighborPayoffs(payoffs, i, j);
          const avgNeighbor = neighbors.reduce((sum, n) => sum + n, 0) / neighbors.length;
          
          payoffs[i][j] = payoffs[i][j].map((p: number, idx: number) => {
            const evolution = (avgNeighbor - p) * 0.1;
            return Math.round((p + evolution) * 10) / 10;
          });
        }
      }
    }
    
    return {
      ...newMatrix,
      id: this.generateId(),
      name: `${source.name} (Evolved)`,
      payoffs,
      description: `Evolutionary transformation after ${iterations} iterations`
    };
  }

  static nashEquilibrium(source: Matrix): Matrix {
    const nashPayoffs = JSON.parse(JSON.stringify(source.payoffs));
    const { bestResponses } = this.findBestResponses(source.payoffs);
    
    for (let i = 0; i < nashPayoffs.length; i++) {
      for (let j = 0; j < nashPayoffs[i].length; j++) {
        if (!bestResponses[0].includes(i) || !bestResponses[1].includes(j)) {
          nashPayoffs[i][j] = nashPayoffs[i][j].map((p: number) => p * 0.5);
        } else {
          nashPayoffs[i][j] = nashPayoffs[i][j].map((p: number) => p * 1.5);
        }
      }
    }
    
    return {
      ...source,
      id: this.generateId(),
      name: `${source.name} (Nash Equilibrium)`,
      payoffs: nashPayoffs,
      description: 'Nash equilibrium strategies highlighted'
    };
  }

  static paretoOptimal(source: Matrix): Matrix {
    const paretoPayoffs = JSON.parse(JSON.stringify(source.payoffs));
    const paretoOutcomes = this.findParetoOptimal(source.payoffs);
    
    for (let i = 0; i < paretoPayoffs.length; i++) {
      for (let j = 0; j < paretoPayoffs[i].length; j++) {
        const isPareto = paretoOutcomes.some(([r, c]) => r === i && c === j);
        if (isPareto) {
          paretoPayoffs[i][j] = paretoPayoffs[i][j].map((p: number) => p * 1.3);
        }
      }
    }
    
    return {
      ...source,
      id: this.generateId(),
      name: `${source.name} (Pareto Optimal)`,
      payoffs: paretoPayoffs,
      description: 'Pareto optimal outcomes emphasized'
    };
  }

  static multiUniverseBranch(source: Matrix): Matrix[] {
    const branches: Matrix[] = [];
    
    const optimisticBranch = {
      ...source,
      id: this.generateId(),
      name: `${source.name} (Optimistic Universe)`,
      payoffs: source.payoffs.map(row => 
        row.map(cell => 
          cell.map(p => Math.min(10, p * 1.5))
        )
      ),
      description: 'Optimistic universe branch - cooperation enhanced'
    };
    
    const pessimisticBranch = {
      ...source,
      id: this.generateId(),
      name: `${source.name} (Pessimistic Universe)`,
      payoffs: source.payoffs.map(row => 
        row.map(cell => 
          cell.map(p => Math.max(0, p * 0.7))
        )
      ),
      description: 'Pessimistic universe branch - conflict enhanced'
    };
    
    branches.push(optimisticBranch, pessimisticBranch);
    return branches;
  }

  private static getNeighborPayoffs(payoffs: number[][][], row: number, col: number): number[] {
    const neighbors: number[] = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      
      if (newRow >= 0 && newRow < payoffs.length && 
          newCol >= 0 && newCol < payoffs[0].length) {
        neighbors.push(...payoffs[newRow][newCol]);
      }
    }
    
    return neighbors;
  }

  private static findBestResponses(payoffs: number[][][]): { bestResponses: number[][] } {
    const bestResponses: number[][] = [[], []];
    
    for (let col = 0; col < payoffs[0].length; col++) {
      let maxPayoff = -Infinity;
      let bestRow = 0;
      
      for (let row = 0; row < payoffs.length; row++) {
        if (payoffs[row][col][0] > maxPayoff) {
          maxPayoff = payoffs[row][col][0];
          bestRow = row;
        }
      }
      bestResponses[0].push(bestRow);
    }
    
    for (let row = 0; row < payoffs.length; row++) {
      let maxPayoff = -Infinity;
      let bestCol = 0;
      
      for (let col = 0; col < payoffs[0].length; col++) {
        if (payoffs[row][col][1] > maxPayoff) {
          maxPayoff = payoffs[row][col][1];
          bestCol = col;
        }
      }
      bestResponses[1].push(bestCol);
    }
    
    return { bestResponses };
  }

  private static findParetoOptimal(payoffs: number[][][]): [number, number][] {
    const outcomes: [number, number][] = [];
    
    for (let i = 0; i < payoffs.length; i++) {
      for (let j = 0; j < payoffs[i].length; j++) {
        let isPareto = true;
        
        for (let k = 0; k < payoffs.length; k++) {
          for (let l = 0; l < payoffs[k].length; l++) {
            if (i === k && j === l) continue;
            
            if (payoffs[k][l][0] >= payoffs[i][j][0] && 
                payoffs[k][l][1] >= payoffs[i][j][1] &&
                (payoffs[k][l][0] > payoffs[i][j][0] || 
                 payoffs[k][l][1] > payoffs[i][j][1])) {
              isPareto = false;
              break;
            }
          }
          if (!isPareto) break;
        }
        
        if (isPareto) {
          outcomes.push([i, j]);
        }
      }
    }
    
    return outcomes;
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}