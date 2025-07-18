const axios = require('axios');

class PerplexityResearcher {
  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY;
    this.baseURL = 'https://api.perplexity.ai/chat/completions';
    this.model = 'sonar-reasoning'; // Default model with web search capabilities
  }

  async researchArtist(name) {
    console.log('Starting Perplexity AI research for artist:', name);
    
    if (!this.apiKey || this.apiKey === 'your_perplexity_api_key_here') {
      throw new Error('Perplexity API key is not configured. Please add your API key to the .env file.');
    }
    
    const prompt = `Research the Indian Classical Music artist "${name}" and provide detailed, accurate information with reliable sources. For each piece of information, include a specific source URL or reference where this information can be verified.

Please provide information in the following JSON format:
{
  "name": {
    "value": "${name}",
    "reference": "Wikipedia or other reliable source URL",
    "verified": false
  },
  "guru": {
    "value": "Name of the guru/teacher",
    "reference": "Specific source URL or book reference",
    "verified": false
  },
  "gharana": {
    "value": "Name of the gharana/school",
    "reference": "Specific source URL or academic reference",
    "verified": false
  },
  "notableAchievements": {
    "value": "List of major achievements, awards, recognitions",
    "reference": "Source URL for achievements",
    "verified": false
  },
  "disciples": {
    "value": "Names of notable disciples/students",
    "reference": "Source URL or reference for disciples",
    "verified": false
  }
}

Important: 
- Provide actual, verifiable information only
- Use real source URLs (Wikipedia, official websites, music institutions)
- If information is not available, set value to empty string but provide a reference explaining why
- Focus on accuracy over completeness
- Return only valid JSON without any additional text or formatting`;

    try {
      const response = await axios.post(this.baseURL, {
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are an expert researcher specializing in Indian Classical Music. Always provide accurate information with verifiable sources. Prefer Wikipedia, official artist websites, music institution websites, and academic sources. Return only valid JSON without any additional text or formatting."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1000
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Perplexity API response received');
      const responseText = response.data.choices[0].message.content;
      console.log('Raw Perplexity response:', responseText);
      return this.parseAIResponse(responseText);
    } catch (error) {
      console.error('Error in Perplexity research:', error);
      if (error.response) {
        console.error('Perplexity API error:', error.response.data);
        
        // If it's a model error, try with a fallback model
        if (error.response.data.error?.type === 'invalid_model') {
          console.log('Trying with fallback model...');
          return await this.researchWithFallbackModel(name, prompt);
        }
        
        throw new Error(`Perplexity API error: ${error.response.data.error?.message || error.message}`);
      }
      throw new Error('Failed to research artist using Perplexity AI: ' + error.message);
    }
  }

  async researchWithFallbackModel(name, prompt) {
    const fallbackModels = [
      'mixtral-8x7b-instruct',
      'llama-3.1-70b-instruct',
      'codellama-34b-instruct'
    ];

    for (const model of fallbackModels) {
      try {
        console.log(`Trying fallback model: ${model}`);
        const response = await axios.post(this.baseURL, {
          model: model,
          messages: [
            {
              role: "system",
              content: "You are an expert researcher specializing in Indian Classical Music. Always provide accurate information with verifiable sources. Return only valid JSON without any additional text or formatting."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: 1000
        }, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        console.log(`Fallback model ${model} worked!`);
        const responseText = response.data.choices[0].message.content;
        return this.parseAIResponse(responseText);
      } catch (fallbackError) {
        console.log(`Fallback model ${model} failed:`, fallbackError.response?.data?.error?.message);
        continue;
      }
    }

    throw new Error('All Perplexity models failed. Please check the Perplexity API documentation for available models.');
  }

  async researchRaag(name) {
    console.log('Starting Perplexity AI research for raag:', name);
    
    if (!this.apiKey || this.apiKey === 'your_perplexity_api_key_here') {
      throw new Error('Perplexity API key is not configured. Please add your API key to the .env file.');
    }
    
    const prompt = `Research the Indian Classical Music raag "${name}" and provide detailed, accurate information with reliable sources.

Please provide information in the following JSON format:
{
  "name": {
    "value": "${name}",
    "reference": "Wikipedia or reliable music source URL",
    "verified": false
  },
  "aroha": {
    "value": "Ascending note sequence (e.g., Sa Re Ga Ma Pa Dha Ni Sa)",
    "reference": "Specific source URL",
    "verified": false
  },
  "avroha": {
    "value": "Descending note sequence",
    "reference": "Specific source URL",
    "verified": false
  },
  "chalan": {
    "value": "Characteristic melodic phrases",
    "reference": "Source URL or music reference",
    "verified": false
  },
  "vadi": {
    "value": "Most important note (e.g., Pa, Ma, etc.)",
    "reference": "Source URL",
    "verified": false
  },
  "samvadi": {
    "value": "Second most important note",
    "reference": "Source URL",
    "verified": false
  },
  "thaat": {
    "value": "Parent scale/thaat name",
    "reference": "Source URL",
    "verified": false
  },
  "rasBhaav": {
    "value": "Emotional content and mood",
    "reference": "Source URL",
    "verified": false
  },
  "tanpuraTuning": {
    "value": "Tanpura tuning notes",
    "reference": "Source URL",
    "verified": false
  },
  "timeOfRendition": {
    "value": "Traditional time of performance",
    "reference": "Source URL",
    "verified": false
  }
}

Important: Provide accurate musical information with real sources. Return only valid JSON without additional text.`;

    try {
      const response = await axios.post(this.baseURL, {
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are an expert in Indian Classical Music raags. Provide accurate information with verifiable sources. Return only valid JSON without additional text."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1000
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Perplexity API response received');
      const responseText = response.data.choices[0].message.content;
      console.log('Raw Perplexity response:', responseText);
      return this.parseAIResponse(responseText);
    } catch (error) {
      console.error('Error in Perplexity research:', error);
      if (error.response) {
        console.error('Perplexity API error:', error.response.data);
        
        if (error.response.data.error?.type === 'invalid_model') {
          console.log('Trying with fallback model...');
          return await this.researchWithFallbackModel(name, prompt);
        }
        
        throw new Error(`Perplexity API error: ${error.response.data.error?.message || error.message}`);
      }
      throw new Error('Failed to research raag using Perplexity AI: ' + error.message);
    }
  }

  async researchTaal(name) {
    console.log('Starting Perplexity AI research for taal:', name);
    
    if (!this.apiKey || this.apiKey === 'your_perplexity_api_key_here') {
      throw new Error('Perplexity API key is not configured. Please add your API key to the .env file.');
    }
    
    const prompt = `Research the Indian Classical Music taal "${name}" and provide detailed, accurate information with reliable sources.

Please provide information in the following JSON format:
{
  "name": {
    "value": "${name}",
    "reference": "Wikipedia or reliable music source URL",
    "verified": false
  },
  "numberOfBeats": {
    "value": "Number of matras/beats (as number)",
    "reference": "Source URL",
    "verified": false
  },
  "divisions": {
    "value": "Vibhag structure description",
    "reference": "Source URL",
    "verified": false
  },
  "taali": {
    "count": {
      "value": "Number of taali positions",
      "reference": "Source URL",
      "verified": false
    },
    "beatNumbers": {
      "value": "Beat numbers where taali occurs",
      "reference": "Source URL",
      "verified": false
    }
  },
  "khaali": {
    "count": {
      "value": "Number of khaali positions",
      "reference": "Source URL",
      "verified": false
    },
    "beatNumbers": {
      "value": "Beat numbers where khaali occurs",
      "reference": "Source URL",
      "verified": false
    }
  },
  "jaati": {
    "value": "Jaati classification (e.g., Chatusra, Tisra, etc.)",
    "reference": "Source URL",
    "verified": false
  }
}

Important: Provide accurate rhythmic information with real sources. Return only valid JSON without additional text.`;

    try {
      const response = await axios.post(this.baseURL, {
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are an expert in Indian Classical Music taals. Provide accurate rhythmic information with verifiable sources. Return only valid JSON without additional text."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1000
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Perplexity API response received');
      const responseText = response.data.choices[0].message.content;
      console.log('Raw Perplexity response:', responseText);
      return this.parseAIResponse(responseText);
    } catch (error) {
      console.error('Error in Perplexity research:', error);
      if (error.response) {
        console.error('Perplexity API error:', error.response.data);
        
        if (error.response.data.error?.type === 'invalid_model') {
          console.log('Trying with fallback model...');
          return await this.researchWithFallbackModel(name, prompt);
        }
        
        throw new Error(`Perplexity API error: ${error.response.data.error?.message || error.message}`);
      }
      throw new Error('Failed to research taal using Perplexity AI: ' + error.message);
    }
  }

  parseAIResponse(response) {
    try {
      // Clean the response to extract JSON
      let cleanResponse = response.trim();
      
      // Remove markdown code blocks if present
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Find JSON object
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('Parsed Perplexity response:', parsed);
        return parsed;
      }
      
      throw new Error('No valid JSON found in Perplexity response');
    } catch (error) {
      console.error('Error parsing Perplexity response:', error);
      console.error('Raw response:', response);
      throw new Error('Failed to parse Perplexity research results: ' + error.message);
    }
  }
}

module.exports = new PerplexityResearcher();