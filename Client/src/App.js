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
    
    // Simplified, faster prompt for structured data extraction
    const prompt = `Research the Indian Classical Music artist "${name}" and provide structured information in JSON format.

Find information about:
- Full name and basic details
- Primary guru/teacher
- Gharana/musical tradition
- Major awards and achievements
- Notable disciples/students
- Brief biographical summary

Provide the information in this exact JSON format:

{
  "name": {
    "value": "${name}",
    "reference": "Primary source URL",
    "verified": false
  },
  "guru": {
    "value": "Primary guru/teacher name with title (Ustad/Pandit)",
    "reference": "Source URL for guru information",
    "verified": false
  },
  "gharana": {
    "value": "Gharana name (e.g., 'Patiala Gharana', 'Kirana Gharana')",
    "reference": "Source URL for gharana information",
    "verified": false
  },
  "notableAchievements": {
    "value": "Major awards and achievements with years",
    "reference": "Source URL for achievements",
    "verified": false
  },
  "disciples": {
    "value": "Notable disciples/students or 'No specific disciples documented'",
    "reference": "Source URL for disciples information",
    "verified": false
  },
  "summary": {
    "value": "Brief biographical summary (150-200 words)",
    "reference": "Primary biographical source URL",
    "verified": false
  }
}

- **CLEAR EXPLANATIONS**: When information is not found, provide clear explanation in reference field
- **WORKING LINKS ONLY**: Double-check that all provided URLs are accessible and contain the mentioned information
`;

    try {
      const response = await axios.post(this.baseURL, {
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are an expert Indian Classical Music researcher and digital detective with advanced skills in:

RESEARCH EXPERTISE:
- Deep knowledge of Indian Classical Music traditions, lineages, and cultural context
- Advanced web research techniques for finding official artist information
- Social media intelligence for extracting biographical details
- Academic and institutional database navigation
- Cross-referencing and fact-verification across multiple sources
- Understanding of gharana systems, guru-shishya traditions, and musical lineages

SEARCH METHODOLOGY:
1. **Official Source Priority**: Always search for official websites, verified social media, artist biographies first
2. **Social Media Mining**: Extract valuable biographical information from Facebook, Instagram, Twitter, YouTube profiles and posts
3. **Institutional Deep Dive**: Thoroughly search music institutions, academies, universities, and cultural organizations
4. **Academic Cross-Reference**: Use scholarly articles, research papers, and academic publications for verification
5. **Contemporary Sources**: Include recent interviews, articles, and current biographical content
6. **Lineage Tracking**: Pay special attention to guru-shishya relationships and gharana affiliations
7. **Legacy Documentation**: Focus on finding information about disciples and teaching contributions

CRITICAL SUCCESS FACTORS:
- Conduct multi-step, systematic research as outlined in the user prompt
- Never skip the specific searches for gharana, guru, disciples, and achievements
- Use official websites and verified social media as primary sources when available
- Cross-verify information from multiple independent sources
- Return comprehensive, accurate information with working URLs
- If information is genuinely not available, clearly state this in the reference field

RESPONSE REQUIREMENTS:
- Return ONLY valid JSON without any additional text
- Use real, accessible URLs that can be verified
- Be precise with Indian music terminology and proper names
- Include titles (Ustad, Pandit) when mentioned in sources
- Focus on factual, verifiable biographical and musical information`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.02, // Extremely low temperature for maximum factual accuracy
        max_tokens: 2000, // Reduced tokens for faster response
        top_p: 0.9, // Slightly higher for better source diversity
        // Note: Perplexity doesn't support both frequency_penalty and presence_penalty together
        frequency_penalty: 0.1 // Reduce repetition only
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 second timeout for comprehensive research
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
    "reference":