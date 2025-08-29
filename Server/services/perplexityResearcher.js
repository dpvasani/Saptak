const axios = require('axios');

class PerplexityResearcher {
  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY;
    this.baseURL = 'https://api.perplexity.ai/chat/completions';
    // Use sonar-pro for faster, reliable research
    this.model = 'sonar-pro'; // Fast and comprehensive
    this.fallbackModels = [
      'sonar', // Lightweight for quick responses
      'sonar-reasoning-pro', // Advanced reasoning for complex queries
      'sonar-reasoning', // Fast reasoning for general tasks
      'r1-1776', // Specialized for factuality and precision
      // Third-party models for fallback
      'gpt-4-turbo', // OpenAI GPT-4 Turbo
      'claude-3-sonnet', // Anthropic Claude 3
      'gemini-1.5-pro', // Google Gemini 1.5 Pro
    ];
  }

  async researchArtist(name) {
    console.log('Starting Perplexity AI research for artist:', name);
    
    if (!this.apiKey || this.apiKey === 'your_perplexity_api_key_here') {
      throw new Error('Perplexity API key is not configured. Please add your API key to the .env file.');
    }
    
    // Ultra-simplified prompt for fastest processing
    const prompt = `Find basic information about Indian Classical Music artist "${name}":

Return JSON with: name, guru, gharana, achievements, disciples, summary.

{
  "name": {
    "value": "${name}",
    "reference": "Source URL",
    "verified": false
  },
  "guru": {
    "value": "Guru name with title",
    "reference": "Source URL",
    "verified": false
  },
  "gharana": {
    "value": "Gharana name",
    "reference": "Source URL",
    "verified": false
  },
  "notableAchievements": {
    "value": "Awards and achievements",
    "reference": "Source URL",
    "verified": false
  },
  "disciples": {
    "value": "Notable disciples or 'None documented'",
    "reference": "Source URL",
    "verified": false
  },
  "summary": {
    "value": "Brief summary (100-150 words)",
    "reference": "Source URL",
    "verified": false
  }
}`;

    try {
      const response = await axios.post(this.baseURL, {
        model: 'sonar', // Use fastest model for Option 1
        messages: [
          {
            role: "system",
            content: "You are an expert Indian Classical Music researcher. Find basic information about artists quickly and return only valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1500, // Reduced for faster processing
        top_p: 0.9
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 90000 // 90 second timeout
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
          return await this.researchWithFallbackModel(name, prompt, 'artist');
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
    
    const prompt = `Conduct comprehensive research about the Indian Classical Music raag "${name}". Search systematically through these sources:

**STEP 1: Primary Musical Sources**
- Search Wikipedia for detailed "${name}" raag article
- Look for "${name}" in specialized raga databases and music theory websites
- Check classical music learning platforms and educational resources
- Find "${name}" in music institution websites (Sangeet Natak Akademi, ITC SRA)

**STEP 2: Academic and Scholarly Sources**
- Search academic musicology papers mentioning "${name}"
- Look for university music department resources and course materials
- Check scholarly articles on Indian music theory featuring "${name}"
- Find research publications and dissertations about "${name}"

**STEP 3: Practical Music Sources**
- Search for "${name}" in tabla/sitar/vocal learning websites
- Look for "${name}" performance guides and tutorials
- Check music teacher resources and instructional materials
- Find "${name}" in concert programs and performance notes

**STEP 4: Specific Technical Information**
For AROHA/AVROHA: Search for:
- "${name} aroha avroha notes"
- "${name} scale ascending descending"
- "${name} swaras sequence"

For THAAT: Search for:
- "${name} thaat parent scale"
- "${name} belongs to thaat"
- "${name} classification"

For VADI/SAMVADI: Search for:
- "${name} vadi samvadi notes"
- "${name} important notes"
- "${name} dominant subdominant"

Provide accurate musical information in this JSON format:

{
  "name": {
    "value": "${name}",
    "reference": "Most authoritative source URL",
    "verified": false
  },
  "aroha": {
    "value": "Complete ascending note sequence using proper sargam notation (Sa Re Ga Ma Pa Dha Ni Sa format with komal/tivra markings)",
    "reference": "Specific URL where aroha/ascending scale is clearly mentioned",
    "verified": false
  },
  "avroha": {
    "value": "Complete descending note sequence using proper sargam notation with komal/tivra markings",
    "reference": "Specific URL where avroha/descending scale is clearly mentioned",
    "verified": false
  },
  "chalan": {
    "value": "Characteristic melodic phrases, pakad, or typical note movements that define the raag",
    "reference": "URL mentioning chalan, pakad, or characteristic phrases",
    "verified": false
  },
  "vadi": {
    "value": "Most important/dominant note (Sa, Re, Ga, Ma, Pa, Dha, or Ni with komal/tivra if applicable)",
    "reference": "URL specifically mentioning vadi swara or dominant note",
    "verified": false
  },
  "samvadi": {
    "value": "Second most important note (Sa, Re, Ga, Ma, Pa, Dha, or Ni with komal/tivra if applicable)",
    "reference": "URL specifically mentioning samvadi swara or subdominant note",
    "verified": false
  },
  "thaat": {
    "value": "Parent thaat/scale name (e.g., Bilawal, Khamaj, Kafi, Kalyan, Bhairav, etc.)",
    "reference": "URL specifically mentioning thaat classification or parent scale",
    "verified": false
  },
  "rasBhaav": {
    "value": "Emotional content, mood, and aesthetic expression (e.g., devotional, romantic, peaceful, heroic, melancholic)",
    "reference": "URL discussing emotional aspects, mood, or aesthetic qualities",
    "verified": false
  },
  "tanpuraTuning": {
    "value": "Recommended tanpura tuning notes (e.g., Sa Pa Sa Sa, Sa Ma Sa Sa)",
    "reference": "URL mentioning tanpura tuning or drone notes",
    "verified": false
  },
  "timeOfRendition": {
    "value": "Traditional time of performance with specific periods (early morning, late morning, afternoon, evening, night, late night)",
    "reference": "URL mentioning traditional performance time or time theory",
    "verified": false
  }
}

REQUIREMENTS:
- Conduct systematic multi-step research as outlined above
- Use proper sargam notation with komal (♭) and tivra (♯) markings when applicable
- Provide specific note names for vadi/samvadi with proper notation
- Use standard, recognized thaat names from Indian music theory
- Include detailed aroha/avroha sequences as found in authoritative sources
- Return only verified musical information found in your comprehensive search
- Use real, accessible URLs as references that can be verified`;

    try {
      const response = await axios.post(this.baseURL, {
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are an expert Indian Classical Music theorist and raga researcher with comprehensive knowledge of:

MUSICAL EXPERTISE:
- Deep understanding of raga theory, thaat system, and melodic structures
- Expertise in sargam notation, swara relationships, and musical scales
- Knowledge of traditional performance practices and time theory
- Understanding of emotional aesthetics (rasa-bhava) in Indian music
- Familiarity with both Hindustani and Carnatic traditions

RESEARCH METHODOLOGY:
1. **Technical Source Priority**: Focus on music theory websites, academic papers, and educational resources
2. **Cross-Reference Verification**: Verify technical details across multiple authoritative sources
3. **Notation Accuracy**: Ensure proper sargam notation with correct komal/tivra markings
4. **Traditional Knowledge**: Include traditional performance practices and cultural context
5. **Contemporary Resources**: Use modern learning platforms and digital music resources

CRITICAL REQUIREMENTS:
- Conduct thorough multi-step research as specified in the user prompt
- Pay special attention to technical musical details (aroha, avroha, vadi, samvadi)
- Use proper Indian music terminology and notation systems
- Verify information across multiple independent musical sources
- Include both theoretical and practical aspects of the raga
- Return comprehensive, technically accurate information with working URLs`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.02,
        max_tokens: 3000,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.2
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 45000
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
          return await this.researchWithFallbackModel(name, prompt, 'raag');
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
    
    const prompt = `Conduct comprehensive research about the Indian Classical Music taal "${name}". Search systematically through these sources:

**STEP 1: Primary Rhythm Sources**
- Search Wikipedia for detailed "${name}" taal article
- Look for "${name}" in tabla learning websites and percussion resources
- Check rhythm and taal databases, music theory websites
- Find "${name}" in classical music institution websites

**STEP 2: Educational and Academic Sources**
- Search academic papers on Indian rhythm systems mentioning "${name}"
- Look for music conservatory and university resources about "${name}"
- Check scholarly articles on taal theory and rhythmic systems
- Find research publications about Indian percussion and rhythm

**STEP 3: Practical Learning Sources**
- Search tabla tutorial websites and learning platforms for "${name}"
- Look for "${name}" in music teacher resources and instructional materials
- Check percussion method books and educational content
- Find "${name}" in concert programs and performance guides

**STEP 4: Specific Technical Information**
For BEAT STRUCTURE: Search for:
- "${name} beats matras structure"
- "${name} rhythm pattern"
- "${name} time signature"

For TAALI/KHAALI: Search for:
- "${name} taali khaali positions"
- "${name} clap wave pattern"
- "${name} beat emphasis"

For DIVISIONS: Search for:
- "${name} vibhag divisions"
- "${name} sections structure"
- "${name} rhythmic grouping"

Provide accurate rhythmic information in this JSON format:

{
  "name": {
    "value": "${name}",
    "reference": "Most authoritative source URL",
    "verified": false
  },
  "numberOfBeats": {
    "value": "Total number of matras/beats as a number (e.g., 16, 12, 10, 14, 7)",
    "reference": "URL specifically mentioning the total beat count or matra structure",
    "verified": false
  },
  "divisions": {
    "value": "Complete vibhag/section structure description (e.g., '4 vibhags of 4 beats each', '3 vibhags: 4+2+2')",
    "reference": "URL describing vibhag structure or rhythmic divisions",
    "verified": false
  },
  "taali": {
    "count": {
      "value": "Number of taali (clap) positions as a number",
      "reference": "URL mentioning taali count or clap positions",
      "verified": false
    },
    "beatNumbers": {
      "value": "Specific beat numbers where taali/claps occur (e.g., '1, 5, 13' or '1, 4, 7')",
      "reference": "URL showing exact taali positions or clap beats",
      "verified": false
    }
  },
  "khaali": {
    "count": {
      "value": "Number of khaali (wave) positions as a number",
      "reference": "URL mentioning khaali count or wave positions",
      "verified": false
    },
    "beatNumbers": {
      "value": "Specific beat numbers where khaali/waves occur (e.g., '9' or '5, 9')",
      "reference": "URL showing exact khaali positions or wave beats",
      "verified": false
    }
  },
  "jaati": {
    "value": "Jaati classification based on subdivision (Chatusra, Tisra, Khanda, Misra, or Sankeerna)",
    "reference": "URL mentioning jaati classification or rhythmic subdivision",
    "verified": false
  }
}

REQUIREMENTS:
- Conduct systematic multi-step research as outlined above
- Provide exact beat numbers, counts, and mathematical relationships
- Use standard jaati terminology from Indian rhythm theory
- Ensure mathematical accuracy (taali + khaali positions should align with total beats)
- Include complete vibhag structure with proper divisions
- Return only verified rhythmic information found in your comprehensive search
- Use real, accessible URLs as references that can be verified`;

    try {
      const response = await axios.post(this.baseURL, {
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are an expert Indian Classical Music rhythmist and taal researcher with comprehensive knowledge of:

RHYTHMIC EXPERTISE:
- Deep understanding of taal theory, matra systems, and rhythmic structures
- Expertise in taali-khaali patterns, vibhag divisions, and beat mathematics
- Knowledge of jaati classifications and rhythmic subdivisions
- Understanding of tabla, pakhawaj, and other percussion traditions
- Familiarity with both theoretical and practical aspects of Indian rhythm

RESEARCH METHODOLOGY:
1. **Percussion Source Priority**: Focus on tabla websites, rhythm learning platforms, and percussion resources
2. **Mathematical Verification**: Ensure all beat counts, divisions, and patterns are mathematically accurate
3. **Pattern Analysis**: Verify taali-khaali patterns across multiple authoritative sources
4. **Traditional Knowledge**: Include traditional performance practices and cultural context
5. **Educational Resources**: Use modern learning platforms and digital rhythm resources

CRITICAL REQUIREMENTS:
- Conduct thorough multi-step research as specified in the user prompt
- Pay special attention to mathematical accuracy of beat structures
- Verify taali-khaali patterns and vibhag divisions across multiple sources
- Use proper Indian rhythm terminology and classification systems
- Include both theoretical framework and practical performance aspects
- Return comprehensive, mathematically accurate information with working URLs`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.02,
        max_tokens: 3000,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.2
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 45000
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
          return await this.researchWithFallbackModel(name, prompt, 'taal');
        }
        
        throw new Error(`Perplexity API error: ${error.response.data.error?.message || error.message}`);
      }
      throw new Error('Failed to research taal using Perplexity AI: ' + error.message);
    }
  }

  async researchWithFallbackModel(name, prompt, type) {
    for (const model of this.fallbackModels) {
      try {
        console.log(`Trying fallback model: ${model}`);
        const response = await axios.post(this.baseURL, {
          model: model,
          messages: [
            {
              role: "system",
              content: `You are an expert researcher specializing in Indian Classical Music ${type} research. Your expertise includes:
- Deep knowledge of Indian Classical Music traditions
- Access to academic and institutional sources
- Ability to verify information across multiple sources
- Understanding of proper musicological terminology
Always provide accurate information with verifiable sources. Return only valid JSON without any additional text or formatting.`
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.02,
          max_tokens: 2000,
          top_p: 0.9
        }, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        });

        console.log(`Fallback model ${model} worked!`);
        const responseText = response.data.choices[0].message.content;
        return this.parseAIResponse(responseText);
      } catch (fallbackError) {
        console.log(`Fallback model ${model} failed:`, fallbackError.response?.data?.error?.message);
        continue;
      }
    }

    throw new Error('All Perplexity models failed. Please check your API access and model availability.');
  }

  parseAIResponse(response) {
    try {
      // Clean the response to extract JSON
      let cleanResponse = response.trim();
      
      // Remove any thinking blocks that Perplexity might include
      cleanResponse = cleanResponse.replace(/<think>[\s\S]*?<\/think>/g, '');
      
      // Remove markdown code blocks if present
      cleanResponse = cleanResponse.replace(/``\`json\n?/g, '').replace(/```\n?/g, '');
      
      // More aggressive cleaning to handle various response formats
      cleanResponse = cleanResponse.replace(/^[^{]*/, '').replace(/[^}]*$/s, '');
      
      // Handle cases where there might be explanatory text after JSON
      const jsonEndIndex = cleanResponse.lastIndexOf('}');
      if (jsonEndIndex !== -1) {
        cleanResponse = cleanResponse.substring(0, jsonEndIndex + 1);
      }
      
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
    const requiredFields = ['name'];
    const optionalFields = ['guru', 'gharana', 'notableAchievements', 'disciples', 'aroha', 'avroha', 'chalan', 'vadi', 'samvadi', 'thaat', 'rasBhaav', 'tanpuraTuning', 'timeOfRendition', 'numberOfBeats', 'divisions', 'jaati'];
    
    requiredFields.forEach(field => {
      if (!data[field]) {
        data[field] = { value: '', reference: 'Required field - information not found in comprehensive search', verified: false };
      } else {
        // Ensure each field has the required structure
        if (typeof data[field].value === 'undefined') data[field].value = '';
        if (typeof data[field].reference === 'undefined') data[field].reference = 'Source reference not provided';
        if (typeof data[field].verified === 'undefined') data[field].verified = false;
        
        // Convert verified to boolean if it's not already
        data[field].verified = Boolean(data[field].verified);
        
        // Clean and format references
        data[field].reference = this.cleanReference(data[field].reference);
      }
    });
    
    // Handle optional fields
    optionalFields.forEach(field => {
      if (data[field]) {
        if (typeof data[field].value === 'undefined') data[field].value = '';
        if (typeof data[field].reference === 'undefined') data[field].reference = 'Information found but source not specified';
        if (typeof data[field].verified === 'undefined') data[field].verified = false;
        data[field].verified = Boolean(data[field].verified);
        
        // Clean and format references
        data[field].reference = this.cleanReference(data[field].reference);
      }
    });

    // Special handling for taal nested fields
    if (data.taali) {
      if (!data.taali.count) data.taali.count = { value: '', reference: 'Information not found', verified: false };
      if (!data.taali.beatNumbers) data.taali.beatNumbers = { value: '', reference: 'Information not found', verified: false };
      
      // Clean references for nested fields
      data.taali.count.reference = this.cleanReference(data.taali.count.reference);
      data.taali.beatNumbers.reference = this.cleanReference(data.taali.beatNumbers.reference);
    }
    
    if (data.khaali) {
      if (!data.khaali.count) data.khaali.count = { value: '', reference: 'Information not found', verified: false };
      if (!data.khaali.beatNumbers) data.khaali.beatNumbers = { value: '', reference: 'Information not found', verified: false };
      
      // Clean references for nested fields
      data.khaali.count.reference = this.cleanReference(data.khaali.count.reference);
      data.khaali.beatNumbers.reference = this.cleanReference(data.khaali.beatNumbers.reference);
    }
  }

  cleanReference(reference) {
    if (!reference) return 'No source provided';
    
    // Handle multiple URLs separated by various delimiters
    const urlSeparators = ['; ', ' | ', ', ', ' ; ', ' , '];
    let cleanRef = reference;
    
    // Check if it contains multiple URLs
    let hasMultipleUrls = false;
    for (const separator of urlSeparators) {
      if (cleanRef.includes(separator)) {
        hasMultipleUrls = true;
        break;
      }
    }
    
    if (hasMultipleUrls) {
      // Split and clean multiple URLs
      let urls = cleanRef;
      for (const separator of urlSeparators) {
        urls = urls.split(separator).join(' | ');
      }
      
      // Clean each URL
      const urlList = urls.split(' | ').map(url => {
        const trimmedUrl = url.trim();
        
        // Remove parenthetical descriptions
        const cleanUrl = trimmedUrl.replace(/\s*\([^)]*\)\s*/g, '').trim();
        
        // Validate URL format
        if (this.isValidUrl(cleanUrl)) {
          return cleanUrl;
        } else if (cleanUrl.includes('.com') || cleanUrl.includes('.org') || cleanUrl.includes('.edu') || cleanUrl.includes('wikipedia')) {
          return `Invalid URL format: ${cleanUrl}`;
        } else {
          return `Non-URL reference: ${cleanUrl}`;
        }
      }).filter(url => url.length > 0);
      
      return urlList.join(' | ');
    } else {
      // Single reference
      const trimmedRef = cleanRef.trim();
      
      // Remove parenthetical descriptions
      const cleanSingleRef = trimmedRef.replace(/\s*\([^)]*\)\s*/g, '').trim();
      
      // Validate single URL
      if (this.isValidUrl(cleanSingleRef)) {
        return cleanSingleRef;
      } else if (cleanSingleRef.includes('.com') || cleanSingleRef.includes('.org') || cleanSingleRef.includes('.edu') || cleanSingleRef.includes('wikipedia')) {
        return `Invalid URL format: ${cleanSingleRef}`;
      } else if (cleanSingleRef.includes('not found') || cleanSingleRef.includes('Information not') || cleanSingleRef.includes('No authoritative')) {
        return cleanSingleRef; // Keep explanatory messages as-is
      } else {
        return `Non-URL reference: ${cleanSingleRef}`;
      }
    }
  }
  
  isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }
}

module.exports = new PerplexityResearcher();