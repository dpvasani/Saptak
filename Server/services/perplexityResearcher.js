const axios = require('axios');

class PerplexityResearcher {
  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY;
    this.baseURL = 'https://api.perplexity.ai/chat/completions';
    // Use sonar-pro for better web search and accuracy
    this.model = 'sonar-pro'; // More accurate than sonar-reasoning
    this.fallbackModels = [
      'sonar-reasoning',
      'llama-3.1-sonar-large-128k-online',
      'llama-3.1-sonar-small-128k-online'
    ];
  }

  async researchArtist(name) {
    console.log('Starting Perplexity AI research for artist:', name);
    
    if (!this.apiKey || this.apiKey === 'your_perplexity_api_key_here') {
      throw new Error('Perplexity API key is not configured. Please add your API key to the .env file.');
    }
    
    // Enhanced prompt with specific search terms and source requirements
    const prompt = `Search for comprehensive information about the Indian Classical Music artist "${name}". Focus on finding information from these specific types of sources:

1. Wikipedia articles about the artist
2. Official music institution websites (Sangeet Natak Akademi, ITC Sangeet Research Academy)
3. Academic music journals and publications
4. Verified artist biographies from music organizations
5. Concert hall and festival websites with artist profiles

For the artist "${name}", provide ONLY factual, verifiable information in this exact JSON format:

{
  "name": {
    "value": "${name}",
    "reference": "Most authoritative source URL (prefer Wikipedia or official music institutions)",
    "verified": false
  },
  "guru": {
    "value": "Full name of the primary guru/teacher (if found, otherwise empty string)",
    "reference": "Specific URL where guru information is mentioned",
    "verified": false
  },
  "gharana": {
    "value": "Complete gharana name with 'Gharana' suffix (e.g., 'Kirana Gharana', 'Gwalior Gharana')",
    "reference": "URL specifically mentioning the gharana affiliation",
    "verified": false
  },
  "notableAchievements": {
    "value": "Major awards, honors, recognitions separated by commas (Padma awards, Sangeet Natak Akademi, Grammy, etc.)",
    "reference": "URL listing achievements or awards",
    "verified": false
  },
  "disciples": {
    "value": "Names of famous disciples/students separated by commas (if found, otherwise empty string)",
    "reference": "URL mentioning disciples or students",
    "verified": false
  }
}

CRITICAL REQUIREMENTS:
- Use ONLY information found in your web search results
- Provide REAL, working URLs as references
- If information is not found, use empty string for value but provide a reference explaining why
- Do NOT make up or assume information
- Prefer authoritative sources like Wikipedia, Sangeet Natak Akademi, ITC SRA
- Return ONLY the JSON object, no additional text or formatting`;

    try {
      const response = await axios.post(this.baseURL, {
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are a specialized researcher for Indian Classical Music. Your task is to find accurate, verifiable information about musicians from authoritative sources. 

SEARCH STRATEGY:
1. First search for the artist on Wikipedia
2. Look for official music institution websites
3. Check academic and scholarly sources
4. Verify information across multiple sources
5. Prioritize recent and authoritative sources

RESPONSE FORMAT:
- Return ONLY valid JSON
- Use real, working URLs
- Be precise with names and terminology
- If uncertain, leave fields empty rather than guessing
- Focus on factual, biographical information`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1, // Lower temperature for more factual responses
        max_tokens: 1500, // More tokens for detailed responses
        top_p: 0.9, // Focus on most likely tokens
        frequency_penalty: 0.1, // Reduce repetition
        presence_penalty: 0.1 // Encourage diverse information
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });

      console.log('Perplexity API response received');
      const responseText = response.data.choices[0].message.content;
      console.log('Raw Perplexity response:', responseText);
      return this.parseAIResponse(responseText);
    } catch (error) {
      console.error('Error in Perplexity research:', error);
      if (error.response) {
        console.error('Perplexity API error:', error.response.data);
        
        // Try fallback models if primary model fails
        if (error.response.status === 400 || error.response.data.error?.type === 'invalid_model') {
          console.log('Trying with fallback models...');
          return await this.researchWithFallbackModel(name, prompt);
        }
        
        throw new Error(`Perplexity API error: ${error.response.data.error?.message || error.message}`);
      }
      throw new Error('Failed to research artist using Perplexity AI: ' + error.message);
    }
  }

  async researchRaag(name) {
    console.log('Starting Perplexity AI research for raag:', name);
    
    if (!this.apiKey || this.apiKey === 'your_perplexity_api_key_here') {
      throw new Error('Perplexity API key is not configured. Please add your API key to the .env file.');
    }
    
    const prompt = `Search for detailed information about the Indian Classical Music raag "${name}". Look specifically for:

1. Wikipedia articles about the raag
2. Music theory websites and academic sources
3. Raga databases and music institution websites
4. Classical music learning platforms
5. Scholarly articles on Indian music theory

For raag "${name}", provide accurate musical information in this JSON format:

{
  "name": {
    "value": "${name}",
    "reference": "Most authoritative source URL",
    "verified": false
  },
  "aroha": {
    "value": "Ascending note sequence using sargam notation (Sa Re Ga Ma Pa Dha Ni Sa format)",
    "reference": "URL where aroha is specifically mentioned",
    "verified": false
  },
  "avroha": {
    "value": "Descending note sequence using sargam notation",
    "reference": "URL where avroha is specifically mentioned",
    "verified": false
  },
  "chalan": {
    "value": "Characteristic melodic phrases or pakad",
    "reference": "URL mentioning chalan or pakad",
    "verified": false
  },
  "vadi": {
    "value": "Most important note (Sa, Re, Ga, Ma, Pa, Dha, or Ni)",
    "reference": "URL mentioning vadi swara",
    "verified": false
  },
  "samvadi": {
    "value": "Second most important note (Sa, Re, Ga, Ma, Pa, Dha, or Ni)",
    "reference": "URL mentioning samvadi swara",
    "verified": false
  },
  "thaat": {
    "value": "Parent thaat name (e.g., Bilawal, Khamaj, Kafi, etc.)",
    "reference": "URL mentioning thaat classification",
    "verified": false
  },
  "rasBhaav": {
    "value": "Emotional content and mood (e.g., devotional, romantic, peaceful)",
    "reference": "URL discussing emotional aspects",
    "verified": false
  },
  "tanpuraTuning": {
    "value": "Tanpura tuning notes (e.g., Sa Pa Sa Sa)",
    "reference": "URL mentioning tanpura tuning",
    "verified": false
  },
  "timeOfRendition": {
    "value": "Traditional performance time (morning, evening, night, etc.)",
    "reference": "URL mentioning time of performance",
    "verified": false
  }
}

REQUIREMENTS:
- Use proper sargam notation (Sa Re Ga Ma Pa Dha Ni)
- Provide specific note names for vadi/samvadi
- Use standard thaat names
- Return only factual information found in sources
- Use real URLs as references`;

    try {
      const response = await axios.post(this.baseURL, {
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are an expert in Indian Classical Music theory and ragas. Search for accurate information about ragas from authoritative music sources. Focus on technical accuracy and use proper Indian music terminology. Verify information across multiple sources before including it.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1500,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      console.log('Perplexity API response received');
      const responseText = response.data.choices[0].message.content;
      console.log('Raw Perplexity response:', responseText);
      return this.parseAIResponse(responseText);
    } catch (error) {
      console.error('Error in Perplexity research:', error);
      if (error.response) {
        console.error('Perplexity API error:', error.response.data);
        
        if (error.response.status === 400 || error.response.data.error?.type === 'invalid_model') {
          console.log('Trying with fallback models...');
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
    
    const prompt = `Search for detailed information about the Indian Classical Music taal "${name}". Look for:

1. Wikipedia articles about the taal
2. Rhythm and percussion websites
3. Music theory and tabla learning resources
4. Academic sources on Indian rhythm systems
5. Classical music institution websites

For taal "${name}", provide accurate rhythmic information in this JSON format:

{
  "name": {
    "value": "${name}",
    "reference": "Most authoritative source URL",
    "verified": false
  },
  "numberOfBeats": {
    "value": "Total number of matras/beats (as a number, e.g., 16, 12, 10)",
    "reference": "URL mentioning beat count",
    "verified": false
  },
  "divisions": {
    "value": "Vibhag structure description (e.g., '4 vibhags of 4 beats each')",
    "reference": "URL describing vibhag structure",
    "verified": false
  },
  "taali": {
    "count": {
      "value": "Number of taali positions (as number)",
      "reference": "URL mentioning taali count",
      "verified": false
    },
    "beatNumbers": {
      "value": "Beat numbers where taali occurs (e.g., '1, 5, 13')",
      "reference": "URL showing taali positions",
      "verified": false
    }
  },
  "khaali": {
    "count": {
      "value": "Number of khaali positions (as number)",
      "reference": "URL mentioning khaali count",
      "verified": false
    },
    "beatNumbers": {
      "value": "Beat numbers where khaali occurs (e.g., '9')",
      "reference": "URL showing khaali positions",
      "verified": false
    }
  },
  "jaati": {
    "value": "Jaati classification (Chatusra, Tisra, Khanda, Misra, or Sankeerna)",
    "reference": "URL mentioning jaati",
    "verified": false
  }
}

REQUIREMENTS:
- Provide exact beat numbers and counts
- Use standard jaati terminology
- Ensure mathematical accuracy (taali + khaali should relate to total beats)
- Use real URLs as references`;

    try {
      const response = await axios.post(this.baseURL, {
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are an expert in Indian Classical Music rhythm and talas. Search for precise information about talas from authoritative sources. Focus on mathematical accuracy of beat structures and use proper terminology for Indian rhythm systems.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1500,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      console.log('Perplexity API response received');
      const responseText = response.data.choices[0].message.content;
      console.log('Raw Perplexity response:', responseText);
      return this.parseAIResponse(responseText);
    } catch (error) {
      console.error('Error in Perplexity research:', error);
      if (error.response) {
        console.error('Perplexity API error:', error.response.data);
        
        if (error.response.status === 400 || error.response.data.error?.type === 'invalid_model') {
          console.log('Trying with fallback models...');
          return await this.researchWithFallbackModel(name, prompt);
        }
        
        throw new Error(`Perplexity API error: ${error.response.data.error?.message || error.message}`);
      }
      throw new Error('Failed to research taal using Perplexity AI: ' + error.message);
    }
  }

  async researchWithFallbackModel(name, prompt) {
    for (const model of this.fallbackModels) {
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
          temperature: 0.1,
          max_tokens: 1500,
          top_p: 0.9
        }, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
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

  parseAIResponse(response) {
    try {
      // Clean the response to extract JSON
      let cleanResponse = response.trim();
      
      // Remove any thinking blocks that Perplexity might include
      cleanResponse = cleanResponse.replace(/<think>[\s\S]*?<\/think>/g, '');
      
      // Remove markdown code blocks if present
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Remove any extra text before or after JSON
      cleanResponse = cleanResponse.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
      
      // Find JSON object
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Convert arrays to strings for fields that expect strings
        this.normalizeDataTypes(parsed);
        
        // Validate and clean the data
        this.validateAndCleanData(parsed);
        
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

  normalizeDataTypes(data) {
    // Convert arrays to comma-separated strings for fields that expect strings
    const fieldsToNormalize = ['notableAchievements', 'disciples'];
    
    fieldsToNormalize.forEach(field => {
      if (data[field] && data[field].value && Array.isArray(data[field].value)) {
        data[field].value = data[field].value.join(', ');
      }
    });
    
    // Handle nested fields for taals
    if (data.taali) {
      if (data.taali.count && data.taali.count.value && Array.isArray(data.taali.count.value)) {
        data.taali.count.value = data.taali.count.value.join(', ');
      }
      if (data.taali.beatNumbers && data.taali.beatNumbers.value && Array.isArray(data.taali.beatNumbers.value)) {
        data.taali.beatNumbers.value = data.taali.beatNumbers.value.join(', ');
      }
    }
    
    if (data.khaali) {
      if (data.khaali.count && data.khaali.count.value && Array.isArray(data.khaali.count.value)) {
        data.khaali.count.value = data.khaali.count.value.join(', ');
      }
      if (data.khaali.beatNumbers && data.khaali.beatNumbers.value && Array.isArray(data.khaali.beatNumbers.value)) {
        data.khaali.beatNumbers.value = data.khaali.beatNumbers.value.join(', ');
      }
    }
  }

  validateAndCleanData(data) {
    // Ensure all required fields exist with proper structure
    const requiredFields = ['name', 'guru', 'gharana', 'notableAchievements', 'disciples'];
    
    requiredFields.forEach(field => {
      if (!data[field]) {
        data[field] = { value: '', reference: 'Information not found in search results', verified: false };
      } else {
        // Ensure each field has the required structure
        if (typeof data[field].value === 'undefined') data[field].value = '';
        if (typeof data[field].reference === 'undefined') data[field].reference = 'No reference provided';
        if (typeof data[field].verified === 'undefined') data[field].verified = false;
        
        // Convert verified to boolean if it's not already
        data[field].verified = Boolean(data[field].verified);
      }
    });

    // Special handling for taal nested fields
    if (data.taali) {
      if (!data.taali.count) data.taali.count = { value: '', reference: 'Information not found', verified: false };
      if (!data.taali.beatNumbers) data.taali.beatNumbers = { value: '', reference: 'Information not found', verified: false };
    }
    
    if (data.khaali) {
      if (!data.khaali.count) data.khaali.count = { value: '', reference: 'Information not found', verified: false };
      if (!data.khaali.beatNumbers) data.khaali.beatNumbers = { value: '', reference: 'Information not found', verified: false };
    }

    // Clean up URLs - ensure they're valid
    Object.keys(data).forEach(key => {
      if (data[key] && data[key].reference) {
        const ref = data[key].reference;
        // Basic URL validation and cleanup
        if (ref && !ref.startsWith('http') && !ref.includes('not found') && !ref.includes('Information not')) {
          data[key].reference = 'Invalid URL provided: ' + ref;
        }
      }
    });
  }
}

module.exports = new PerplexityResearcher();