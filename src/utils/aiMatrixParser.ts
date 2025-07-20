import OpenAI from 'openai';
import { Matrix } from '../types/GameTheory';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export class AIMatrixParser {
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  static async parseWithAI(prompt: string, context?: string): Promise<Matrix> {
    try {
      const systemPrompt = `You are a game theory expert. Parse natural language descriptions into game theory matrices.
      
      Return a JSON object with this structure:
      {
        "name": "Matrix name",
        "players": ["Player 1", "Player 2", ...], // Can be more than 2 players
        "strategies": [["Strategy1A", "Strategy1B"], ["Strategy2A", "Strategy2B"]], 
        "payoffs": [[[p1_payoff, p2_payoff, ...], [p1_payoff, p2_payoff, ...]], ...],
        "description": "Brief description of the game dynamics",
        "isMultiPlayer": true/false,
        "numGenerations": number (if evolutionary),
        "specialRules": {} // e.g., {"generation": 5, "rule": "post-scarcity"}
      }
      
      Context: ${context || 'general game theory'}
      
      For Dark Forest scenarios: emphasize hide/signal dynamics with mutual hiding as Nash equilibrium
      For Post-Scarcity: emphasize cooperation and innovation with high mutual benefits
      For Multi-Universe: consider branching possibilities and parallel outcomes
      
      Payoffs should be integers 0-10. Structure payoffs array as: payoffs[row][col] = [player1_payoff, player2_payoff]`;

      const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1000
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      
      return {
        id: this.generateId(),
        name: result.name || 'Generated Matrix',
        players: result.players || ['Player 1', 'Player 2'],
        strategies: result.strategies || [['Option A', 'Option B'], ['Option A', 'Option B']],
        payoffs: result.payoffs || [[[3, 3], [0, 5]], [[5, 0], [1, 1]]],
        description: result.description,
        sourcePrompt: prompt
      };
    } catch (error) {
      console.error('AI parsing failed:', error);
      throw new Error('Failed to parse with AI. Please check your API key.');
    }
  }

  static async generateConnectedMatrix(sourceMatrix: Matrix, transformationType: string): Promise<Matrix> {
    try {
      const prompt = `Given this game theory matrix:
      Name: ${sourceMatrix.name}
      Players: ${sourceMatrix.players.join(', ')}
      Strategies: ${JSON.stringify(sourceMatrix.strategies)}
      Current payoffs: ${JSON.stringify(sourceMatrix.payoffs)}
      
      Generate a new connected matrix that represents: ${transformationType}
      
      For evolutionary: show how strategies evolve over time
      For Nash equilibrium: emphasize stable strategies
      For Pareto optimal: highlight mutually beneficial outcomes
      For multi-universe: create an alternate reality version
      
      Return the same JSON structure with modified payoffs and updated name/description.`;

      const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a game theory expert. Transform the given matrix according to the specified transformation type.' },
          { role: 'user', content: prompt }
        ],
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        temperature: 0.8,
        max_tokens: 1000
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      
      return {
        id: this.generateId(),
        name: result.name || `${sourceMatrix.name} (Transformed)`,
        players: result.players || sourceMatrix.players,
        strategies: result.strategies || sourceMatrix.strategies,
        payoffs: result.payoffs || sourceMatrix.payoffs,
        description: result.description,
        connectedTo: [sourceMatrix.id]
      };
    } catch (error) {
      console.error('AI transformation failed:', error);
      throw new Error('Failed to generate connected matrix');
    }
  }

  static async suggestScenarios(existingMatrices: Matrix[]): Promise<string[]> {
    try {
      const matrixNames = existingMatrices.map(m => m.name).join(', ');
      
      const prompt = `Given these existing game theory matrices: ${matrixNames || 'none'}
      
      Suggest 3 interesting new game theory scenarios that would complement or connect to these.
      Focus on: Dark Forest theory, post-scarcity economics, multi-universe theories, climate cooperation, AI alignment, or other cosmic/civilizational challenges.
      
      Return a JSON array of 3 suggestion strings.`;

      const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a game theory expert. Suggest interesting scenarios.' },
          { role: 'user', content: prompt }
        ],
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        temperature: 0.9,
        max_tokens: 500
      });

      const result = JSON.parse(completion.choices[0].message.content || '{"suggestions":[]}');
      return result.suggestions || [];
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      return [];
    }
  }
}