const axios = require('axios');

class PerplexityAllAboutService {
  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY;
    this.baseURL = 'https://api.perplexity.ai/chat/completions';
    // Use sonar-pro for comprehensive "all about" responses
    this.model = 'sonar-pro';
  }

  async getAllAboutArtist(name) {
    console.log('Starting Perplexity "All About" search for artist:', name);
    
    if (!this.apiKey || this.apiKey === 'your_perplexity_api_key_here') {
      throw new Error('Perplexity API key is not configured. Please add your API key to the .env file.');
    }

    // Simple, direct prompt that mimics typing "all about {artist name}" in Perplexity.ai
    const prompt = `all about ${name}`;

    try {
      const response = await axios.post(this.baseURL, {
        model: this.model,
        messages: [
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
        return_related_questions: true,
        search_domain_filter: ["perplexity.ai"],
        search_recency_filter: "month"
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 second timeout for comprehensive search
      });

      console.log('Perplexity "All About" API response received');
      
      const result = response.data;
      const message = result.choices[0].message;
      
      // Extract all available data from Perplexity response
      const allAboutData = {
        answer: message.content || '',
        images: this.extractImages(result),
        sources: this.extractSources(result),
        citations: result.citations || [],
        relatedQuestions: result.related_questions || [],
        metadata: {
          model: this.model,
          searchQuery: prompt,
          timestamp: new Date().toISOString(),
          responseTime: result.usage?.total_tokens || 0
        }
      };

      console.log('Perplexity "All About" data extracted:', {
        answerLength: allAboutData.answer.length,
        imageCount: allAboutData.images.length,
        sourceCount: allAboutData.sources.length,
        citationCount: allAboutData.citations.length
      });

      return allAboutData;
    } catch (error) {
      console.error('Error in Perplexity "All About" search:', error);
      if (error.response) {
        console.error('Perplexity API error:', error.response.data);
        throw new Error(`Perplexity "All About" API error: ${error.response.data.error?.message || error.message}`);
      }
      throw new Error('Failed to get "All About" information using Perplexity AI: ' + error.message);
    }
  }

  async getAllAboutRaag(name) {
    console.log('Starting Perplexity "All About" search for raag:', name);
    
    if (!this.apiKey || this.apiKey === 'your_perplexity_api_key_here') {
      throw new Error('Perplexity API key is not configured. Please add your API key to the .env file.');
    }

    const prompt = `all about ${name} raag`;

    try {
      const response = await axios.post(this.baseURL, {
        model: this.model,
        messages: [
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
      
      return {
        answer: message.content || '',
        images: this.extractImages(result),
        sources: this.extractSources(result),
        citations: result.citations || [],
        relatedQuestions: result.related_questions || [],
        metadata: {
          model: this.model,
          searchQuery: prompt,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error in Perplexity "All About" raag search:', error);
      throw new Error('Failed to get "All About" raag information: ' + error.message);
    }
  }

  async getAllAboutTaal(name) {
    console.log('Starting Perplexity "All About" search for taal:', name);
    
    if (!this.apiKey || this.apiKey === 'your_perplexity_api_key_here') {
      throw new Error('Perplexity API key is not configured. Please add your API key to the .env file.');
    }

    const prompt = `all about ${name} taal`;

    try {
      const response = await axios.post(this.baseURL, {
        model: this.model,
        messages: [
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
      
      return {
        answer: message.content || '',
        images: this.extractImages(result),
        sources: this.extractSources(result),
        citations: result.citations || [],
        relatedQuestions: result.related_questions || [],
        metadata: {
          model: this.model,
          searchQuery: prompt,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error in Perplexity "All About" taal search:', error);
      throw new Error('Failed to get "All About" taal information: ' + error.message);
    }
  }

  extractImages(result) {
    const images = [];
    
    // Extract from various possible locations in Perplexity response
    if (result.images && Array.isArray(result.images)) {
      images.push(...result.images);
    }
    
    if (result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.images) {
      images.push(...result.choices[0].message.images);
    }
    
    if (result.multimedia && result.multimedia.images) {
      images.push(...result.multimedia.images);
    }
    
    // Extract image URLs from citations if available
    if (result.citations) {
      result.citations.forEach(citation => {
        if (citation.image_url) {
          images.push({
            url: citation.image_url,
            title: citation.title || '',
            source: citation.url || '',
            description: citation.snippet || ''
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
    
    // Extract from citations
    if (result.citations && Array.isArray(result.citations)) {
      result.citations.forEach(citation => {
        sources.push({
          title: citation.title || 'Untitled Source',
          url: citation.url || '',
          snippet: citation.snippet || '',
          domain: this.extractDomain(citation.url),
          type: 'citation'
        });
      });
    }
    
    // Extract from message content if it contains source references
    if (result.choices && result.choices[0] && result.choices[0].message) {
      const content = result.choices[0].message.content;
      const urlMatches = content.match(/https?:\/\/[^\s\)]+/g);
      
      if (urlMatches) {
        urlMatches.forEach(url => {
          // Only add if not already in citations
          const exists = sources.some(source => source.url === url);
          if (!exists) {
            sources.push({
              title: 'Referenced in Answer',
              url: url,
              snippet: '',
              domain: this.extractDomain(url),
              type: 'reference'
            });
          }
        });
      }
    }
    
    // Extract from related sources if available
    if (result.related_sources && Array.isArray(result.related_sources)) {
      result.related_sources.forEach(source => {
        sources.push({
          title: source.title || 'Related Source',
          url: source.url || '',
          snippet: source.description || '',
          domain: this.extractDomain(source.url),
          type: 'related'
        });
      });
    }
    
    console.log(`Extracted ${sources.length} sources`);
    return sources;
  }

  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      return 'Unknown Domain';
    }
  }
}

module.exports = new PerplexityAllAboutService();