const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiResearcher {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async researchArtist(name) {
    console.log('Starting Gemini AI research for artist:', name);
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      throw new Error('Gemini API key is not configured. Please add your API key to the .env file.');
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
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      console.log('Gemini API response received');
      console.log('Raw Gemini response:', text);
      return this.parseAIResponse(text);
    } catch (error) {
      console.error('Error in Gemini research:', error);
      throw new Error('Failed to research artist using Gemini AI: ' + error.message);
    }
  }

  async researchRaag(name) {
    console.log('Starting Gemini AI research for raag:', name);
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      throw new Error('Gemini API key is not configured. Please add your API key to the .env file.');
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
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      console.log('Gemini API response received');
      console.log('Raw Gemini response:', text);
      return this.parseAIResponse(text);
    } catch (error) {
      console.error('Error in Gemini research:', error);
      throw new Error('Failed to research raag using Gemini AI: ' + error.message);
    }
  }

  async researchTaal(name) {
    console.log('Starting Gemini AI research for taal:', name);
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      throw new Error('Gemini API key is not configured. Please add your API key to the .env file.');
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
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      console.log('Gemini API response received');
      console.log('Raw Gemini response:', text);
      return this.parseAIResponse(text);
    } catch (error) {
      console.error('Error in Gemini research:', error);
      throw new Error('Failed to research taal using Gemini AI: ' + error.message);
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
        console.log('Parsed Gemini response:', parsed);
        return parsed;
      }
      
      throw new Error('No valid JSON found in Gemini response');
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      console.error('Raw response:', response);
      throw new Error('Failed to parse Gemini research results: ' + error.message);
    }
  }
}

module.exports = new GeminiResearcher();