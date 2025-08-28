const axios = require('axios');
const AllAboutData = require('../models/AllAboutData');

class PerplexityAllAboutService {
  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY;
    this.baseURL = 'https://api.perplexity.ai/chat/completions';
    // Use sonar-pro for comprehensive "all about" responses
    this.defaultModel = 'sonar-pro';
    this.fallbackModels = [
      'sonar-deep-research',
      'sonar-reasoning-pro', 
      'sonar-reasoning',
      'r1-1776',
      'sonar',
      'gpt-4-turbo',
      'claude-3-sonnet',
      'gemini-1.5-pro'
    ];
  }

  async getAllAboutArtist(name, modelName = null) {
    console.log('Starting Perplexity Summary search for artist:', name);
    
    if (!this.apiKey || this.apiKey === 'your_perplexity_api_key_here') {
      throw new Error('Perplexity API key is not configured. Please add your API key to the .env file.');
    }

    // Enhanced prompt for comprehensive artist information
    const prompt = `Please provide comprehensive information about the Indian Classical Music artist "${name}". Include biographical details, musical background, achievements, and any relevant information about their contributions to Indian classical music.`;
    const model = modelName || this.defaultModel;
    console.log(`Using Perplexity model: ${model}`);

    try {
      const response = await axios.post(this.baseURL, {
        model: model,
        messages: [
          {
            role: "system",
            content: "You are an expert researcher specializing in Indian Classical Music. Provide comprehensive, accurate information about artists, including their background, training, achievements, and contributions to the field."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 4000,
        top_p: 0.9,
        return_citations: true,
        return_images: true,
        return_related_questions: true
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 second timeout for comprehensive search
      });

      console.log('Perplexity Summary API response received');
      
      const result = response.data;
      const message = result.choices[0].message;
      
      console.log('Full Perplexity API response structure:', JSON.stringify(result, null, 2));
      
      // Extract all available data from Perplexity response
      const allAboutData = {
        name: {
          value: name,
          reference: 'Perplexity Summary Search',
          verified: false
        },
        answer: {
          value: message.content || '',
          reference: 'Perplexity AI Response',
          verified: false
        },
        images: this.extractImages(result),
        sources: this.extractSources(result),
        citations: result.citations || [],
        relatedQuestions: result.related_questions || [],
        metadata: {
          timestamp: new Date(),
          searchQuery: name,
          aiProvider: 'perplexity',
          aiModel: model
        }
      };

      console.log('Perplexity Summary data extracted:', {
        answerLength: allAboutData.answer.value.length,
        imageCount: allAboutData.images.length,
        sourceCount: allAboutData.sources.length,
        citationCount: allAboutData.citations.length
      });

      return allAboutData;
    } catch (error) {
      console.error('Error in Perplexity Summary search:', error);
      if (error.response) {
        console.error('Perplexity API error:', error.response.data);
        throw new Error(`Perplexity Summary API error: ${error.response.data.error?.message || error.message}`);
      }
      throw new Error('Failed to get Summary information using Perplexity AI: ' + error.message);
    }
  }

  async getAllAboutRaag(name, modelName = null) {
    console.log('Starting Perplexity Summary search for raag:', name);
    
    if (!this.apiKey || this.apiKey === 'your_perplexity_api_key_here') {
      throw new Error('Perplexity API key is not configured. Please add your API key to the .env file.');
    }

    const prompt = `Please provide comprehensive information about the Indian Classical Music raag "${name}". Include details about its structure, characteristics, performance guidelines, and musical significance.`;
    const model = modelName || this.defaultModel;
    console.log(`Using Perplexity model: ${model}`);

    try {
      const response = await axios.post(this.baseURL, {
        model: model,
        messages: [
          {
            role: "system",
            content: "You are an expert in Indian Classical Music theory and ragas. Provide comprehensive, accurate information about ragas, including their musical structure, performance characteristics, and cultural significance."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 4000,
        top_p: 0.9,
        return_citations: true,
        return_images: true,
        return_related_questions: true
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      });

      const result = response.data;
      const message = result.choices[0].message;
      
      const allAboutData = {
        name: {
          value: name,
          reference: 'Perplexity Summary Search',
          verified: false
        },
        answer: {
          value: message.content || '',
          reference: 'Perplexity AI Response',
          verified: false
        },
        images: this.extractImages(result),
        sources: this.extractSources(result),
        citations: result.citations || [],
        relatedQuestions: result.related_questions || [],
        metadata: {
          timestamp: new Date(),
          searchQuery: name,
          aiProvider: 'perplexity',
          aiModel: model
        }
      };

      return allAboutData;
    } catch (error) {
      console.error('Error in Perplexity Summary raag search:', error);
      throw new Error('Failed to get Summary raag information: ' + error.message);
    }
  }

  async getAllAboutTaal(name, modelName = null) {
    console.log('Starting Perplexity Summary search for taal:', name);
    
    if (!this.apiKey || this.apiKey === 'your_perplexity_api_key_here') {
      throw new Error('Perplexity API key is not configured. Please add your API key to the .env file.');
    }

    const prompt = `Please provide comprehensive information about the Indian Classical Music taal "${name}". Include details about its rhythmic structure, beat patterns, and performance characteristics.`;
    const model = modelName || this.defaultModel;
    console.log(`Using Perplexity model: ${model}`);

    try {
      const response = await axios.post(this.baseURL, {
        model: model,
        messages: [
          {
            role: "system",
            content: "You are an expert in Indian Classical Music rhythm and talas. Provide comprehensive, accurate information about talas, including their rhythmic structure, beat patterns, and performance characteristics."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 4000,
        top_p: 0.9,
        return_citations: true,
        return_images: true,
        return_related_questions: true
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      });

      const result = response.data;
      const message = result.choices[0].message;
      
      const allAboutData = {
        name: {
          value: name,
          reference: 'Perplexity Summary Search',
          verified: false
        },
        answer: {
          value: message.content || '',
          reference: 'Perplexity AI Response',
          verified: false
        },
        images: this.extractImages(result),
        sources: this.extractSources(result),
        citations: result.citations || [],
        relatedQuestions: result.related_questions || [],
        metadata: {
          timestamp: new Date(),
          searchQuery: name,
          aiProvider: 'perplexity',
          aiModel: model
        }
      };

      return allAboutData;
    } catch (error) {
      console.error('Error in Perplexity Summary taal search:', error);
      throw new Error('Failed to get Summary taal information: ' + error.message);
    }
  }

  async saveAllAboutData(data) {
    try {
      const allAboutData = new AllAboutData(data);
      await allAboutData.save();
      return allAboutData;
    } catch (error) {
      console.error('Error saving Summary data:', error);
      throw new Error('Failed to save Summary data to database');
    }
  }

  async researchWithFallbackModel(name, prompt, category) {
    for (const model of this.fallbackModels) {
      try {
        console.log(`Trying fallback model: ${model}`);
        return await this[`getAllAbout${category.charAt(0).toUpperCase() + category.slice(0, -1)}`](name, model);
      } catch (fallbackError) {
        console.log(`Fallback model ${model} failed:`, fallbackError.message);
        continue;
      }
    }
    throw new Error('All Perplexity models failed. Please check your API access.');
  }

  extractImages(result) {
    const images = [];
    
    // Extract from various possible locations in Perplexity response
    if (result.images && Array.isArray(result.images)) {
      images.push(...result.images.map(img => ({ ...img, verified: false })));
    }
    
    if (result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.images) {
      images.push(...result.choices[0].message.images.map(img => ({ ...img, verified: false })));
    }
    
    if (result.multimedia && result.multimedia.images) {
      images.push(...result.multimedia.images.map(img => ({ ...img, verified: false })));
    }
    
    // Extract image URLs from citations if available
    if (result.citations) {
      result.citations.forEach(citation => {
        if (citation.image_url) {
          images.push({
            url: citation.image_url,
            title: citation.title || '',
            source: citation.url || '',
            description: citation.snippet || '',
            type: 'reference',
            verified: false
          });
        }
      });
    }
    
    // Remove duplicates based on URL
    const uniqueImages = images.filter((image, index, self) => 
      index === self.findIndex(img => img.url === image.url)
    );
    
    console.log(`Extracted ${uniqueImages.length} unique images`);
    return uniqueImages;
  }

  extractSources(result) {
    const sources = [];
    
    console.log('Extracting sources from result:', JSON.stringify(result, null, 2));
    
    // Extract from citations
    if (result.citations && Array.isArray(result.citations)) {
      console.log('Found citations:', result.citations.length);
      result.citations.forEach(citation => {
        sources.push({
          title: citation.title || 'Untitled Source',
          url: citation.url || '',
          snippet: citation.snippet || '',
          domain: this.extractDomain(citation.url),
          type: 'citation',
          verified: false
        });
      });
    } else {
      console.log('No citations found in result');
    }
    
    // Check for sources in the message content
    if (result.choices && result.choices[0] && result.choices[0].message) {
      const message = result.choices[0].message;
      
      // Check if message has sources property
      if (message.sources && Array.isArray(message.sources)) {
        console.log('Found sources in message:', message.sources.length);
        message.sources.forEach(source => {
          sources.push({
            title: source.title || source.name || 'Referenced Source',
            url: source.url || source.link || '',
            snippet: source.snippet || source.description || '',
            domain: this.extractDomain(source.url || source.link),
            type: 'message_source',
            verified: false
          });
        });
      }
      
      // Check for citations in message
      if (message.citations && Array.isArray(message.citations)) {
        console.log('Found citations in message:', message.citations.length);
        message.citations.forEach(citation => {
          sources.push({
            title: citation.title || citation.name || 'Message Citation',
            url: citation.url || citation.link || '',
            snippet: citation.snippet || citation.text || '',
            domain: this.extractDomain(citation.url || citation.link),
            type: 'message_citation',
            verified: false
          });
        });
      }
    }
    
    // Check for sources at the root level with different property names
    const possibleSourceKeys = ['sources', 'references', 'web_results', 'search_results'];
    possibleSourceKeys.forEach(key => {
      if (result[key] && Array.isArray(result[key])) {
        console.log(`Found ${key}:`, result[key].length);
        result[key].forEach(source => {
          sources.push({
            title: source.title || source.name || source.heading || 'Web Result',
            url: source.url || source.link || source.href || '',
            snippet: source.snippet || source.description || source.content || '',
            domain: this.extractDomain(source.url || source.link || source.href),
            type: key,
            verified: false
          });
        });
      }
    });
    
    // Extract from message content if it contains source references
    if (result.choices && result.choices[0] && result.choices[0].message) {
      const content = result.choices[0].message.content;
      const urlMatches = content.match(/https?:\/\/[^\s\)]+/g);
      
      if (urlMatches) {
        console.log('Found URLs in content:', urlMatches.length);
        urlMatches.forEach(url => {
          // Only add if not already in citations
          const exists = sources.some(source => source.url === url);
          if (!exists) {
            sources.push({
              title: 'Referenced in Answer',
              url: url,
              snippet: '',
              domain: this.extractDomain(url),
              type: 'reference',
              verified: false
            });
          }
        });
      } else {
        console.log('No URLs found in message content');
      }
    }
    
    console.log(`Extracted ${sources.length} sources`);
    console.log('Sources details:', sources.map(s => ({ title: s.title, domain: s.domain, type: s.type })));
    return sources;
  }

  extractDomain(url) {
    if (!url) return 'Unknown Domain';
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      console.log('Failed to extract domain from URL:', url);
      return 'Unknown Domain';
    }
  }
}

module.exports = new PerplexityAllAboutService();