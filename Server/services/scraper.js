const webSearchService = require('./webSearchService');

class ScraperService {
  constructor() {
    // Use the new web search service instead of puppeteer
    this.webSearchEnabled = true;
  }

  async scrapeArtist(name) {
    console.log(`Web search requested for artist: ${name}`);
    
    if (this.webSearchEnabled) {
      try {
        const results = await webSearchService.searchArtist(name);
        console.log('Web search completed successfully for artist:', name);
        return results;
      } catch (error) {
        console.error('Web search failed for artist:', error);
        return this.getEmptyArtistData(name);
      }
    }
    
    return this.getEmptyArtistData(name);
  }

  async scrapeRaag(name) {
    console.log(`Web search requested for raag: ${name}`);
    
    if (this.webSearchEnabled) {
      try {
        const results = await webSearchService.searchRaag(name);
        console.log('Web search completed successfully for raag:', name);
        return results;
      } catch (error) {
        console.error('Web search failed for raag:', error);
        return this.getEmptyRaagData(name);
      }
    }
    
    return this.getEmptyRaagData(name);
  }

  async scrapeTaal(name) {
    console.log(`Web search requested for taal: ${name}`);
    
    if (this.webSearchEnabled) {
      try {
        const results = await webSearchService.searchTaal(name);
        console.log('Web search completed successfully for taal:', name);
        return results;
      } catch (error) {
        console.error('Web search failed for taal:', error);
        return this.getEmptyTaalData(name);
      }
    }
    
    return this.getEmptyTaalData(name);
  }

  // Fallback methods for when web search fails
  getEmptyArtistData(name) {
    return {
      name: { 
        value: name, 
        reference: 'Web search attempted but failed - please try AI research instead', 
        verified: false 
      },
      guru: { 
        value: '', 
        reference: 'Web search failed - use AI research for better results', 
        verified: false 
      },
      gharana: { 
        value: '', 
        reference: 'Web search failed - use AI research for better results', 
        verified: false 
      },
      notableAchievements: { 
        value: '', 
        reference: 'Web search failed - use AI research for better results', 
        verified: false 
      },
      disciples: { 
        value: '', 
        reference: 'Web search failed - use AI research for better results', 
        verified: false 
      },
      summary: { 
        value: '', 
        reference: 'Web search failed - use AI research for better results', 
        verified: false 
      }
    };
  }

  getEmptyRaagData(name) {
    return {
      name: { 
        value: name, 
        reference: 'Web search attempted but failed - please try AI research instead', 
        verified: false 
      },
      aroha: { 
        value: '', 
        reference: 'Web search failed - use AI research for better results', 
        verified: false 
      },
      avroha: { 
        value: '', 
        reference: 'Web search failed - use AI research for better results', 
        verified: false 
      },
      chalan: { 
        value: '', 
        reference: 'Web search failed - use AI research for better results', 
        verified: false 
      },
      vadi: { 
        value: '', 
        reference: 'Web search failed - use AI research for better results', 
        verified: false 
      },
      samvadi: { 
        value: '', 
        reference: 'Web search failed - use AI research for better results', 
        verified: false 
      },
      thaat: { 
        value: '', 
        reference: 'Web search failed - use AI research for better results', 
        verified: false 
      },
      rasBhaav: { 
        value: '', 
        reference: 'Web search failed - use AI research for better results', 
        verified: false 
      },
      tanpuraTuning: { 
        value: '', 
        reference: 'Web search failed - use AI research for better results', 
        verified: false 
      },
      timeOfRendition: { 
        value: '', 
        reference: 'Web search failed - use AI research for better results', 
        verified: false 
      }
    };
  }

  getEmptyTaalData(name) {
    return {
      name: { 
        value: name, 
        reference: 'Web search attempted but failed - please try AI research instead', 
        verified: false 
      },
      numberOfBeats: { 
        value: '', 
        reference: 'Web search failed - use AI research for better results', 
        verified: false 
      },
      divisions: { 
        value: '', 
        reference: 'Web search failed - use AI research for better results', 
        verified: false 
      },
      taali: {
        count: { 
          value: '', 
          reference: 'Web search failed - use AI research for better results', 
          verified: false 
        },
        beatNumbers: { 
          value: '', 
          reference: 'Web search failed - use AI research for better results', 
          verified: false 
        }
      },
      khaali: {
        count: { 
          value: '', 
          reference: 'Web search failed - use AI research for better results', 
          verified: false 
        },
        beatNumbers: { 
          value: '', 
          reference: 'Web search failed - use AI research for better results', 
          verified: false 
        }
      },
      jaati: { 
        value: '', 
        reference: 'Web search failed - use AI research for better results', 
        verified: false 
      }
    };
  }
}

module.exports = new ScraperService();