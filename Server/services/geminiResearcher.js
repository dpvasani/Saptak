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
    
    // Multi-step enhanced prompt for comprehensive artist research
    const prompt = `I need you to conduct a comprehensive, multi-step research about the Indian Classical Music artist "${name}". Please search systematically through these sources in order:

**STEP 1: Official Artist Presence**
- Search for "${name}" official website, biography page, or artist profile
- Look for "${name}" social media profiles (Facebook, Instagram, Twitter, YouTube)
- Check "${name}" artist pages on music platforms and streaming services
- Find "${name}" profiles on concert hall and festival websites
- Search for "${name}" comprehensive biography or detailed artist profile
- Look for "${name}" birth details, full name, and personal background

**STEP 2: Institutional and Academic Sources**
- Search Wikipedia for "${name}" detailed biography
- Check Sangeet Natak Akademi, ITC Sangeet Research Academy databases
- Look for "${name}" in university music department faculty/alumni pages
- Search academic papers, journals, and musicology publications mentioning "${name}"
- Check cultural institution archives and music organization websites
- Find detailed biographical articles and interviews about "${name}"
- Search for "${name}" career timeline and major milestones

**STEP 3: Specific Information Hunting**
For GHARANA: Search specifically for:
- "${name} gharana tradition"
- "${name} musical lineage"
- "${name} school of music"
- "${name} musical heritage"

For GURU/TEACHER: Search for:
- "${name} guru teacher"
- "${name} trained under"
- "${name} student of"
- "${name} learned from"
- "${name} musical education"

For DISCIPLES/STUDENTS: Search for:
- "${name} disciples students"
- "${name} taught"
- "students of ${name}"
- "${name} musical legacy"
- "${name} proteges"

For ACHIEVEMENTS: Search for:
- "${name} awards honors"
- "${name} Padma Shri Padma Bhushan"
- "${name} Sangeet Natak Akademi award"
- "${name} Grammy recognition"
- "${name} national international awards"
- "${name} major performances collaborations"
- "${name} concert tours festivals"
- "${name} recordings albums discography"

For COMPREHENSIVE BIOGRAPHY: Search for:
- "${name} full biography life story"
- "${name} birth date birthplace family background"
- "${name} career timeline major milestones"
- "${name} contributions to Indian classical music"
- "${name} cultural significance global impact"
- "${name} detailed artist profile comprehensive overview"

**STEP 4: Cross-Reference and Verify**
- Cross-check information from multiple sources
- Prioritize official websites and verified social media accounts
- Use academic and institutional sources for verification
- Include recent interviews, articles, and biographical content

After conducting this comprehensive research, provide the information in this exact JSON format:

Please provide information in the following JSON format:
{
  "name": {
    "value": "${name}",
    "reference": "Primary source URL - verify this link works and is accessible",
    "verified": false
  },
  "guru": {
    "value": "Complete name of primary guru/teacher with titles (Ustad/Pandit if applicable) - if multiple gurus, list primary one",
    "reference": "Primary source URL | Secondary source URL (if multiple sources found) - ensure URLs are working and accessible",
    "verified": false
  },
  "gharana": {
    "value": "Complete gharana name with proper suffix (e.g., 'Punjab Gharana', 'Kirana Gharana', 'Gwalior Gharana') - be specific about the tradition",
    "reference": "Primary source URL | Secondary source URL (if multiple sources confirm) - verify links work",
    "verified": false
  },
  "notableAchievements": {
    "value": "Comprehensive list of major awards with years: Padma Shri (year), Padma Bhushan (year), Grammy Awards (years), Sangeet Natak Akademi (year), etc.",
    "reference": "Awards source URL | Official recognition URL | Wikipedia URL (if multiple sources list different awards) - ensure all links are accessible",
    "verified": false
  },
  "disciples": {
    "value": "Names of notable disciples/students with instruments: Name 1 (tabla), Name 2 (percussion), etc. - if no specific disciples found, state 'No specific disciples documented in available sources'",
    "reference": "Teaching source URL | Student mention URL | Interview URL (if multiple sources mention students) - if no disciples found, state 'No authoritative sources found listing specific disciples'",
    "verified": false
  },
  "summary": {
    "value": "Comprehensive biographical summary (200-300 words) covering: Full name & birth details, primary profession/role, guru/teacher lineage, gharana/style/school, notable achievements & awards, major performances/collaborations, disciples/students, and cultural significance. Include background, lineage details, achievements, contributions to the art form, and global impact.",
    "reference": "Primary biographical source URL",
    "verified": false
  }
}

CRITICAL REQUIREMENTS:
- **URL VALIDATION**: Test each URL before including - ensure they are accessible and working
- **REFERENCE FORMATTING**: Use format "Primary URL | Secondary URL | Third URL" for multiple sources
- **LINK VERIFICATION**: Only include URLs that actually contain the mentioned information
- **SOURCE QUALITY**: Prioritize official websites, verified social media, Wikipedia, academic institutions
- **BROKEN LINK HANDLING**: If a source seems relevant but link is broken, note as "Source found but link inaccessible: [description]"
- **NO FABRICATION**: If information is not found in accessible sources, clearly state this in the reference
- Conduct thorough multi-step research as outlined above
- **MULTIPLE SOURCE VERIFICATION**: When multiple sources confirm the same information, list them separated by " | "
- **CLEAR EXPLANATIONS**: When information is not found, provide clear explanation in reference field
- **WORKING LINKS ONLY**: Double-check that all provided URLs are accessible and contain the mentioned information`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      console.log('Gemini API response received');
      console.log('Raw Gemini response:', text);
      return this.parseAIResponse(text);
    } catch (error) {
      console.error('Error in Gemini research:', error);
      if (error.response) {
        console.error('Gemini API error:', error.response.data);
        throw new Error(`Gemini API error: ${error.response.data.error?.message || error.message}`);
      }
      throw new Error('Failed to research artist using Gemini AI: ' + error.message);
    }
  }

  async researchRaag(name) {
    console.log('Starting Gemini AI research for raag:', name);
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      throw new Error('Gemini API key is not configured. Please add your API key to the .env file.');
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

Please provide information in the following JSON format:
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
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      console.log('Gemini API response received');
      console.log('Raw Gemini response:', text);
      return this.parseAIResponse(text);
    } catch (error) {
      console.error('Error in Gemini research:', error);
      if (error.response) {
        console.error('Gemini API error:', error.response.data);
        throw new Error(`Gemini API error: ${error.response.data.error?.message || error.message}`);
      }
      throw new Error('Failed to research raag using Gemini AI: ' + error.message);
    }
  }

  async researchTaal(name) {
    console.log('Starting Gemini AI research for taal:', name);
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      throw new Error('Gemini API key is not configured. Please add your API key to the .env file.');
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

Please provide information in the following JSON format:
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
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      console.log('Gemini API response received');
      console.log('Raw Gemini response:', text);
      return this.parseAIResponse(text);
    } catch (error) {
      console.error('Error in Gemini research:', error);
      if (error.response) {
        console.error('Gemini API error:', error.response.data);
        throw new Error(`Gemini API error: ${error.response.data.error?.message || error.message}`);
      }
      throw new Error('Failed to research taal using Gemini AI: ' + error.message);
    }
  }

  parseAIResponse(response) {
    try {
      // Clean the response to extract JSON
      let cleanResponse = response.trim();
      
      // Remove any thinking blocks that might be included
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
    const requiredFields = ['name'];
    const optionalFields = [
      'guru', 'gharana', 'notableAchievements', 'disciples', 'summary',
      'aroha', 'avroha', 'chalan', 'vadi', 'samvadi', 'thaat', 'rasBhaav',
      'tanpuraTuning', 'timeOfRendition', 'numberOfBeats', 'divisions', 'jaati'
    ];

    requiredFields.forEach(field => {
      if (!data[field]) {
        data[field] = { value: '', reference: 'Required field - information not found in comprehensive search', verified: false };
      } else {
        if (typeof data[field].value === 'undefined') data[field].value = '';
        if (typeof data[field].reference === 'undefined') data[field].reference = 'Source reference not provided';
        if (typeof data[field].verified === 'undefined') data[field].verified = false;
        data[field].verified = Boolean(data[field].verified);
        data[field].reference = this.cleanReference(data[field].reference);
      }
    });

    optionalFields.forEach(field => {
      if (data[field]) {
        if (typeof data[field].value === 'undefined') data[field].value = '';
        if (typeof data[field].reference === 'undefined') data[field].reference = 'Information found but source not specified';
        if (typeof data[field].verified === 'undefined') data[field].verified = false;
        data[field].verified = Boolean(data[field].verified);
        data[field].reference = this.cleanReference(data[field].reference);
      }
    });

    if (data.taali) {
      if (!data.taali.count) data.taali.count = { value: '', reference: 'Information not found', verified: false };
      if (!data.taali.beatNumbers) data.taali.beatNumbers = { value: '', reference: 'Information not found', verified: false };
      data.taali.count.reference = this.cleanReference(data.taali.count.reference);
      data.taali.beatNumbers.reference = this.cleanReference(data.taali.beatNumbers.reference);
    }

    if (data.khaali) {
      if (!data.khaali.count) data.khaali.count = { value: '', reference: 'Information not found', verified: false };
      if (!data.khaali.beatNumbers) data.khaali.beatNumbers = { value: '', reference: 'Information not found', verified: false };
      data.khaali.count.reference = this.cleanReference(data.khaali.count.reference);
      data.khaali.beatNumbers.reference = this.cleanReference(data.khaali.beatNumbers.reference);
    }
  }

  cleanReference(reference) {
    if (!reference) return 'No source provided';

    const urlSeparators = ['; ', ' | ', ', ', ' ; ', ' , '];
    let cleanRef = reference;

    let hasMultipleUrls = false;
    for (const separator of urlSeparators) {
      if (cleanRef.includes(separator)) {
        hasMultipleUrls = true;
        break;
      }
    }

    if (hasMultipleUrls) {
      let urls = cleanRef;
      for (const separator of urlSeparators) {
        urls = urls.split(separator).join(' | ');
      }

      const urlList = urls.split(' | ').map(url => {
        const trimmedUrl = url.trim();
        const cleanUrl = trimmedUrl.replace(/\s*\([^)]*\)\s*/g, '').trim();
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
      const trimmedRef = cleanRef.trim();
      const cleanSingleRef = trimmedRef.replace(/\s*\([^)]*\)\s*/g, '').trim();
      if (this.isValidUrl(cleanSingleRef)) {
        return cleanSingleRef;
      } else if (cleanSingleRef.includes('.com') || cleanSingleRef.includes('.org') || cleanSingleRef.includes('.edu') || cleanSingleRef.includes('wikipedia')) {
        return `Invalid URL format: ${cleanSingleRef}`;
      } else if (cleanSingleRef.includes('not found') || cleanSingleRef.includes('Information not') || cleanSingleRef.includes('No authoritative')) {
        return cleanSingleRef;
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

module.exports = new GeminiResearcher();