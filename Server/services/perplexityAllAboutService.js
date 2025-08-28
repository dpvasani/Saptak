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
        images: this.extractImages(result) || [],
        sources: this.extractSources(result) || [],
        citations: this.extractCitations(result) || [],
        relatedQuestions: this.extractRelatedQuestions(result) || [],
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
    
    console.log('Extracting sources from result structure...');
    console.log('Result keys:', Object.keys(result));
    console.log('Citations available:', !!result.citations);
    console.log('Choices available:', !!result.choices);
    
    // Extract from citations with proper validation
    if (result.citations) {
      console.log('Found citations:', result.citations);
      console.log('Citations type:', typeof result.citations);
      
      // Handle stringified citations
      let citationsData = result.citations;
      if (typeof citationsData === 'string') {
        try {
          citationsData = JSON.parse(citationsData);
          console.log('Successfully parsed stringified citations');
        } catch (parseError) {
          console.log('Failed to parse citations string, treating as single URL');
          if (citationsData.startsWith('http')) {
            sources.push({
              title: 'Citation Reference',
              url: citationsData,
              snippet: '',
              domain: this.extractDomain(citationsData),
              type: 'citation',
              verified: false
            });
          }
          citationsData = [];
        }
      }
      
      if (Array.isArray(citationsData)) {
        citationsData.forEach((citation, index) => {
          if (citation && typeof citation === 'object' && citation.url) {
            sources.push({
              title: citation.title || `Citation ${index + 1}`,
              url: citation.url,
              snippet: citation.snippet || '',
              domain: this.extractDomain(citation.url),
              type: 'citation',
              verified: false
            });
          }
        });
      }
    }
    
    // Extract from search_results (this is where the real URLs are)
    if (result.search_results && Array.isArray(result.search_results)) {
      console.log('Found search_results:', result.search_results.length);
      
      // Handle stringified search_results
      let searchResultsData = result.search_results;
      if (typeof searchResultsData === 'string') {
        try {
          searchResultsData = JSON.parse(searchResultsData);
          console.log('Successfully parsed stringified search_results');
        } catch (parseError) {
          console.log('Failed to parse search_results string');
          searchResultsData = [];
        }
      }
      
      if (Array.isArray(searchResultsData)) {
        searchResultsData.forEach((searchResult, index) => {
          console.log(`Search result ${index}:`, searchResult);
          const sourceUrl = String(searchResult.url || searchResult.link || searchResult.href || '').trim();
          console.log(`Search result URL: ${sourceUrl}`);
          
          if (sourceUrl && sourceUrl !== '' && !sourceUrl.includes('function') && this.isValidUrl(sourceUrl)) {
            sources.push({
              title: String(searchResult.title || searchResult.name || `Search Result ${index + 1}`).trim(),
              url: sourceUrl,
              snippet: String(searchResult.snippet || searchResult.description || searchResult.text || '').trim(),
              domain: this.extractDomain(sourceUrl),
              type: 'search_result',
              verified: false
            });
          }
        });
      }
    }
    
    // Extract from web_results if available (fallback)
    if (result.web_results && Array.isArray(result.web_results)) {
      console.log('Found web_results:', result.web_results.length);
      
      // Handle stringified web_results
      let webResultsData = result.web_results;
      if (typeof webResultsData === 'string') {
        try {
          webResultsData = JSON.parse(webResultsData);
          console.log('Successfully parsed stringified web_results');
        } catch (parseError) {
          console.log('Failed to parse web_results string');
          webResultsData = [];
        }
      }
      
      if (Array.isArray(webResultsData)) {
        webResultsData.forEach((webResult, index) => {
          console.log(`Web result ${index}:`, webResult);
          const sourceUrl = String(webResult.url || webResult.link || webResult.href || '').trim();
          console.log(`Web result URL: ${sourceUrl}`);
          
          if (sourceUrl && sourceUrl !== '' && !sourceUrl.includes('function') && this.isValidUrl(sourceUrl)) {
            sources.push({
              title: String(webResult.title || webResult.name || `Web Result ${index + 1}`).trim(),
              url: sourceUrl,
              snippet: String(webResult.snippet || webResult.description || webResult.text || '').trim(),
              domain: this.extractDomain(sourceUrl),
              type: 'web_result',
              verified: false
            });
          }
        });
      }
    }
    
    // Check for sources in the message content
    if (result.choices && result.choices[0] && result.choices[0].message) {
      const message = result.choices[0].message;
      console.log('Message keys:', Object.keys(message));
      
      // Check if message has sources property
      if (message.sources && Array.isArray(message.sources)) {
        console.log('Found sources in message:', message.sources.length);
        message.sources.forEach((source, index) => {
          const sourceUrl = String(source.url || source.link || source.href || '').trim();
          
          if (sourceUrl && sourceUrl !== '' && this.isValidUrl(sourceUrl)) {
            sources.push({
              title: String(source.title || source.name || `Message Source ${index + 1}`).trim(),
              url: sourceUrl,
              snippet: String(source.snippet || source.description || source.text || '').trim(),
              domain: this.extractDomain(sourceUrl),
              type: 'message_source',
              verified: false
            });
          }
        });
      }
      
      // Check for citations in message
      if (message.citations && Array.isArray(message.citations)) {
        console.log('Found citations in message:', message.citations.length);
        message.citations.forEach((citation, index) => {
          const sourceUrl = String(citation.url || citation.link || citation.href || '').trim();
          
          if (sourceUrl && sourceUrl !== '' && this.isValidUrl(sourceUrl)) {
            sources.push({
              title: String(citation.title || citation.name || `Message Citation ${index + 1}`).trim(),
              url: sourceUrl,
              snippet: String(citation.snippet || citation.text || citation.description || '').trim(),
              domain: this.extractDomain(sourceUrl),
              type: 'message_citation',
              verified: false
            });
          }
        });
      }
    }
    
    // Check for sources at the root level with different property names
    const possibleSourceKeys = ['sources', 'references', 'search_results', 'related_sources'];
    possibleSourceKeys.forEach(key => {
      if (result[key] && Array.isArray(result[key])) {
        console.log(`Found ${key}:`, result[key].length);
        result[key].forEach((source, index) => {
          const sourceUrl = String(source.url || source.link || source.href || '').trim();
          
          if (sourceUrl && sourceUrl !== '' && this.isValidUrl(sourceUrl)) {
            sources.push({
              title: String(source.title || source.name || source.heading || `${key} ${index + 1}`).trim(),
              url: sourceUrl,
              snippet: String(source.snippet || source.description || source.content || source.text || '').trim(),
              domain: this.extractDomain(sourceUrl),
              type: key,
              verified: false
            });
          }
        });
      }
    });
    
    // Extract from message content if it contains source references
    if (result.choices && result.choices[0] && result.choices[0].message) {
      const content = result.choices[0].message.content;
      const urlMatches = String(content || '').match(/https?:\/\/[^\s\)]+/g);
      
      if (urlMatches) {
        console.log('Found URLs in content:', urlMatches.length);
        urlMatches.forEach((url, index) => {
          // Only add if not already in citations
          const cleanUrl = String(url).trim();
          const exists = sources.some(source => source.url === cleanUrl);
          if (!exists && this.isValidUrl(cleanUrl)) {
            sources.push({
              title: `Referenced URL ${index + 1}`,
              url: cleanUrl,
              snippet: '',
              domain: this.extractDomain(cleanUrl),
              type: 'reference',
              verified: false
            });
          }
        });
      } else {
        console.log('No URLs found in message content');
      }
    }
    
    // Filter out sources with empty URLs to prevent broken links
    const validSources = sources.filter(source => {
      const hasValidUrl = source.url && String(source.url).trim() !== '' && this.isValidUrl(source.url);
      if (!hasValidUrl) {
        console.log('Filtering out source with empty URL:', source.title);
      }
      return hasValidUrl;
    });
    
    // Remove duplicates based on URL
    const uniqueSources = validSources.filter((source, index, self) => 
      index === self.findIndex(s => s.url === source.url)
    );
    
    console.log(`Extracted ${uniqueSources.length} unique valid sources out of ${sources.length} total`);
    console.log('Valid sources details:', uniqueSources.map(s => ({ 
      title: s.title, 
      domain: s.domain, 
      type: s.type,
      hasUrl: !!s.url,
      url: s.url
    })));
    
    return uniqueSources;
  }

  extractCitations(result) {
    const citations = [];
    
    // Handle citations from various locations
    if (result.citations) {
      let citationsData = result.citations;
      
      // Handle stringified citations
      if (typeof citationsData === 'string') {
        try {
          citationsData = JSON.parse(citationsData);
        } catch (parseError) {
          console.log('Failed to parse citations string');
          if (citationsData.startsWith('http') && this.isValidUrl(citationsData)) {
            return [{
              title: 'Citation Reference',
              url: citationsData,
              snippet: '',
              verified: false
            }];
          }
          return [];
        }
      }
      
      if (Array.isArray(citationsData)) {
        citationsData.forEach((citation, index) => {
          if (citation && typeof citation === 'object') {
            const url = String(citation.url || citation.link || citation.href || '').trim();
            if (url && this.isValidUrl(url)) {
              citations.push({
                title: String(citation.title || citation.name || `Citation ${index + 1}`).trim(),
                url: url,
                snippet: String(citation.snippet || citation.text || citation.description || '').trim(),
                verified: false
              });
            }
          }
        });
      }
    }
    
    return citations;
  }

  extractRelatedQuestions(result) {
    let questions = result.related_questions || [];
    
    // Handle stringified related questions
    if (typeof questions === 'string') {
      try {
        questions = JSON.parse(questions);
      } catch (parseError) {
        console.log('Failed to parse related questions string');
        return [];
      }
    }
    
    // Ensure it's an array of strings
    if (Array.isArray(questions)) {
      return questions.filter(q => typeof q === 'string' && q.trim().length > 0);
    }
    
    return [];
  }
  isValidUrl(string) {
    if (!string || typeof string !== 'string') return false;
    try {
      const url = new URL(string.trim());
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (error) {
      return false;
    }
  }

  extractDomain(url) {
    if (!url || typeof url !== 'string') return 'Unknown Domain';
    
    const cleanUrl = url.trim();
    if (!cleanUrl) return 'Unknown Domain';
    
    try {
      const urlObj = new URL(cleanUrl);
      return urlObj.hostname;
    } catch (error) {
      console.log('Failed to extract domain from URL:', cleanUrl, 'Error:', error.message);
      return 'Unknown Domain';
    }
  }
}

module.exports = new PerplexityAllAboutService();