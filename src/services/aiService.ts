import { AIRecommendation, ChartData, Asset } from '../types';

class AIService {
  private async callOpenAI(prompt: string): Promise<string> {
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!apiKey || apiKey === 'your_openai_api_key') {
        // Return mock response for demo
        return this.getMockAIResponse();
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 200,
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error('OpenAI API failed');

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      return this.getMockAIResponse();
    }
  }

  private getMockAIResponse(): string {
    const actions = ['BUY', 'SELL', 'HOLD'];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const confidence = Math.floor(Math.random() * 40) + 60; // 60-100%
    
    const reasons = {
      BUY: [
        'Strong bullish momentum detected with moving average crossover',
        'Technical indicators suggest upward price movement',
        'Volume surge indicates buying pressure',
        'Support level holding strong with bounce potential'
      ],
      SELL: [
        'Resistance level reached with bearish divergence',
        'Overbought conditions suggest price correction',
        'Breaking below key support levels',
        'Technical indicators showing selling pressure'
      ],
      HOLD: [
        'Sideways consolidation pattern observed',
        'Mixed signals from technical indicators',
        'Waiting for clearer directional bias',
        'Market uncertainty suggests caution'
      ]
    };

    const reasoning = reasons[action as keyof typeof reasons];
    const randomReason = reasoning[Math.floor(Math.random() * reasoning.length)];

    return JSON.stringify({
      action,
      confidence,
      reasoning: randomReason
    });
  }

  async getRecommendation(asset: Asset, priceData: ChartData[]): Promise<AIRecommendation> {
    const prompt = `
      Analyze the following price data for ${asset.name} (${asset.symbol}) - ${asset.type}:
      
      Recent prices: ${priceData.slice(-10).map(d => d.price.toFixed(2)).join(', ')}
      
      Based on this data, provide a trading recommendation in JSON format:
      {
        "action": "BUY|SELL|HOLD",
        "confidence": number (60-100),
        "reasoning": "brief explanation"
      }
      
      Consider technical analysis patterns, trends, and market conditions for ${asset.type} assets.
    `;

    try {
      const response = await this.callOpenAI(prompt);
      const parsed = JSON.parse(response);
      
      return {
        symbol: asset.symbol,
        action: parsed.action,
        confidence: parsed.confidence,
        reasoning: parsed.reasoning,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      
      // Fallback to mock recommendation
      const mockResponse = JSON.parse(this.getMockAIResponse());
      return {
        symbol: asset.symbol,
        action: mockResponse.action,
        confidence: mockResponse.confidence,
        reasoning: mockResponse.reasoning,
        timestamp: Date.now()
      };
    }
  }
}

export const aiService = new AIService();