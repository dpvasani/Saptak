const axios = require('axios');
const cheerio = require('cheerio');

class WebSearchService {
  constructor() {
    this.searchEngines = {
      google: 'https://www.google.com/search?q=',
      bing: 'https://www.bing.com/search?q=',
      duckduckgo: 'https://duckduckgo.com/html/?q='
    };
    
    this.musicSources = [
      'wikipedia.org',
      'britannica.com',
      'allmusic.com',
      'musicbrainz.org',
      'last.fm',
      'discogs.com',
      'rateyourmusic.com',
      'musictheory.net',
      'classicalmusic.about.com',
      'indianclassicalmusic.com',
      'hindustanimusic.com',
      'carnaticmusic.com',
      'ragajournal.com',
      'sangeetpedia.com'
    ];

    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    };
  }

  async searchArtist(name) {
    console.log(`Starting comprehensive web search for artist: ${name}`);
    
    try {
      const searchResults = await this.performMultiSourceSearch(`"${name}" Indian classical music artist guru gharana`);
      const artistData = await this.extractArtistData(name, searchResults);
      
      return {
        name: {
          value: name,
          reference: artistData.sources.name || 'Web search results',
          verified: false
        },
        guru: {
          value: artistData.guru || '',
          reference: artistData.sources.guru || 'Multiple web sources',
          verified: false
        },
        gharana: {
          value: artistData.gharana || '',
          reference: artistData.sources.gharana || 'Multiple web sources',
          verified: false
        },
        notableAchievements: {
          value: artistData.achievements || '',
          reference: artistData.sources.achievements || 'Multiple web sources',
          verified: false
        },
        disciples: {
          value: artistData.disciples || '',
          reference: artistData.sources.disciples || 'Multiple web sources',
          verified: false
        }
      };
    } catch (error) {
      console.error('Error in web search for artist:', error);
      return this.getEmptyArtistData(name);
    }
  }

  async searchRaag(name) {
    console.log(`Starting comprehensive web search for raag: ${name}`);
    
    try {
      const searchResults = await this.performMultiSourceSearch(`"${name}" raag raga aroha avroha thaat vadi samvadi`);
      const raagData = await this.extractRaagData(name, searchResults);
      
      return {
        name: {
          value: name,
          reference: raagData.sources.name || 'Web search results',
          verified: false
        },
        aroha: {
          value: raagData.aroha || '',
          reference: raagData.sources.aroha || 'Multiple web sources',
          verified: false
        },
        avroha: {
          value: raagData.avroha || '',
          reference: raagData.sources.avroha || 'Multiple web sources',
          verified: false
        },
        chalan: {
          value: raagData.chalan || '',
          reference: raagData.sources.chalan || 'Multiple web sources',
          verified: false
        },
        vadi: {
          value: raagData.vadi || '',
          reference: raagData.sources.vadi || 'Multiple web sources',
          verified: false
        },
        samvadi: {
          value: raagData.samvadi || '',
          reference: raagData.sources.samvadi || 'Multiple web sources',
          verified: false
        },
        thaat: {
          value: raagData.thaat || '',
          reference: raagData.sources.thaat || 'Multiple web sources',
          verified: false
        },
        rasBhaav: {
          value: raagData.rasBhaav || '',
          reference: raagData.sources.rasBhaav || 'Multiple web sources',
          verified: false
        },
        tanpuraTuning: {
          value: raagData.tanpuraTuning || '',
          reference: raagData.sources.tanpuraTuning || 'Multiple web sources',
          verified: false
        },
        timeOfRendition: {
          value: raagData.timeOfRendition || '',
          reference: raagData.sources.timeOfRendition || 'Multiple web sources',
          verified: false
        }
      };
    } catch (error) {
      console.error('Error in web search for raag:', error);
      return this.getEmptyRaagData(name);
    }
  }

  async searchTaal(name) {
    console.log(`Starting comprehensive web search for taal: ${name}`);
    
    try {
      const searchResults = await this.performMultiSourceSearch(`"${name}" taal tal rhythm beats matras taali khaali`);
      const taalData = await this.extractTaalData(name, searchResults);
      
      return {
        name: {
          value: name,
          reference: taalData.sources.name || 'Web search results',
          verified: false
        },
        numberOfBeats: {
          value: taalData.numberOfBeats || '',
          reference: taalData.sources.numberOfBeats || 'Multiple web sources',
          verified: false
        },
        divisions: {
          value: taalData.divisions || '',
          reference: taalData.sources.divisions || 'Multiple web sources',
          verified: false
        },
        taali: {
          count: {
            value: taalData.taaliCount || '',
            reference: taalData.sources.taaliCount || 'Multiple web sources',
            verified: false
          },
          beatNumbers: {
            value: taalData.taaliBeatNumbers || '',
            reference: taalData.sources.taaliBeatNumbers || 'Multiple web sources',
            verified: false
          }
        },
        khaali: {
          count: {
            value: taalData.khaaliCount || '',
            reference: taalData.sources.khaaliCount || 'Multiple web sources',
            verified: false
          },
          beatNumbers: {
            value: taalData.khaaliBeatNumbers || '',
            reference: taalData.sources.khaaliBeatNumbers || 'Multiple web sources',
            verified: false
          }
        },
        jaati: {
          value: taalData.jaati || '',
          reference: taalData.sources.jaati || 'Multiple web sources',
          verified: false
        }
      };
    } catch (error) {
      console.error('Error in web search for taal:', error);
      return this.getEmptyTaalData(name);
    }
  }

  async performMultiSourceSearch(query) {
    const results = [];
    
    try {
      // Search Wikipedia first (most reliable)
      const wikipediaResults = await this.searchWikipedia(query);
      results.push(...wikipediaResults);
      
      // Search other music sources
      const musicResults = await this.searchMusicSources(query);
      results.push(...musicResults);
      
      // If we don't have enough results, try general web search
      if (results.length < 3) {
        const webResults = await this.performGeneralWebSearch(query);
        results.push(...webResults);
      }
      
      return results;
    } catch (error) {
      console.error('Error in multi-source search:', error);
      return [];
    }
  }

  async searchWikipedia(query) {
    try {
      const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl, { 
        headers: this.headers,
        timeout: 10000 
      });
      
      if (response.data && response.data.extract) {
        return [{
          title: response.data.title,
          url: response.data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
          content: response.data.extract,
          source: 'Wikipedia'
        }];
      }
    } catch (error) {
      console.log('Wikipedia search failed, trying alternative approach');
    }
    
    // Alternative Wikipedia search
    try {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=3&format=json`;
      const response = await axios.get(searchUrl, { 
        headers: this.headers,
        timeout: 10000 
      });
      
      if (response.data && response.data[1] && response.data[1].length > 0) {
        return response.data[1].map((title, index) => ({
          title: title,
          url: response.data[3][index],
          content: response.data[2][index],
          source: 'Wikipedia'
        }));
      }
    } catch (error) {
      console.error('Wikipedia alternative search failed:', error);
    }
    
    return [];
  }

  async searchMusicSources(query) {
    const results = [];
    
    for (const source of this.musicSources.slice(0, 3)) { // Limit to first 3 sources
      try {
        const searchUrl = `https://www.google.com/search?q=site:${source} ${encodeURIComponent(query)}`;
        const response = await axios.get(searchUrl, { 
          headers: this.headers,
          timeout: 8000 
        });
        
        const $ = cheerio.load(response.data);
        const searchResults = [];
        
        $('div.g').each((i, element) => {
          if (i >= 2) return false; // Limit to 2 results per source
          
          const title = $(element).find('h3').text();
          const url = $(element).find('a').attr('href');
          const snippet = $(element).find('.VwiC3b').text() || $(element).find('.s3v9rd').text();
          
          if (title && url && snippet) {
            searchResults.push({
              title,
              url: url.startsWith('/url?q=') ? decodeURIComponent(url.split('/url?q=')[1].split('&')[0]) : url,
              content: snippet,
              source: source
            });
          }
        });
        
        results.push(...searchResults);
        
        // Add delay to avoid being blocked
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(`Search failed for ${source}:`, error.message);
      }
    }
    
    return results;
  }

  async performGeneralWebSearch(query) {
    try {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query + ' Indian classical music')}`;
      const response = await axios.get(searchUrl, { 
        headers: this.headers,
        timeout: 10000 
      });
      
      const $ = cheerio.load(response.data);
      const results = [];
      
      $('div.g').each((i, element) => {
        if (i >= 5) return false; // Limit to 5 results
        
        const title = $(element).find('h3').text();
        const url = $(element).find('a').attr('href');
        const snippet = $(element).find('.VwiC3b').text() || $(element).find('.s3v9rd').text();
        
        if (title && url && snippet) {
          results.push({
            title,
            url: url.startsWith('/url?q=') ? decodeURIComponent(url.split('/url?q=')[1].split('&')[0]) : url,
            content: snippet,
            source: 'Google Search'
          });
        }
      });
      
      return results;
    } catch (error) {
      console.error('General web search failed:', error);
      return [];
    }
  }

  async extractArtistData(name, searchResults) {
    const data = {
      guru: '',
      gharana: '',
      achievements: '',
      disciples: '',
      sources: {}
    };
    
    for (const result of searchResults) {
      const content = result.content.toLowerCase();
      
      // Extract guru information
      if (!data.guru && (content.includes('guru') || content.includes('teacher') || content.includes('trained under'))) {
        const guruMatch = this.extractGuruInfo(result.content);
        if (guruMatch) {
          data.guru = guruMatch;
          data.sources.guru = result.url;
        }
      }
      
      // Extract gharana information
      if (!data.gharana && content.includes('gharana')) {
        const gharanaMatch = this.extractGharanaInfo(result.content);
        if (gharanaMatch) {
          data.gharana = gharanaMatch;
          data.sources.gharana = result.url;
        }
      }
      
      // Extract achievements
      if (!data.achievements && (content.includes('award') || content.includes('honor') || content.includes('recognition'))) {
        const achievementsMatch = this.extractAchievements(result.content);
        if (achievementsMatch) {
          data.achievements = achievementsMatch;
          data.sources.achievements = result.url;
        }
      }
      
      // Extract disciples
      if (!data.disciples && (content.includes('disciple') || content.includes('student') || content.includes('taught'))) {
        const disciplesMatch = this.extractDisciples(result.content);
        if (disciplesMatch) {
          data.disciples = disciplesMatch;
          data.sources.disciples = result.url;
        }
      }
    }
    
    return data;
  }

  async extractRaagData(name, searchResults) {
    const data = {
      aroha: '',
      avroha: '',
      chalan: '',
      vadi: '',
      samvadi: '',
      thaat: '',
      rasBhaav: '',
      tanpuraTuning: '',
      timeOfRendition: '',
      sources: {}
    };
    
    for (const result of searchResults) {
      const content = result.content;
      
      // Extract aroha/avroha
      if (!data.aroha && content.toLowerCase().includes('aroha')) {
        data.aroha = this.extractMusicalSequence(content, 'aroha');
        data.sources.aroha = result.url;
      }
      
      if (!data.avroha && content.toLowerCase().includes('avroha')) {
        data.avroha = this.extractMusicalSequence(content, 'avroha');
        data.sources.avroha = result.url;
      }
      
      // Extract thaat
      if (!data.thaat && content.toLowerCase().includes('thaat')) {
        data.thaat = this.extractThaat(content);
        data.sources.thaat = result.url;
      }
      
      // Extract vadi/samvadi
      if (!data.vadi && content.toLowerCase().includes('vadi')) {
        data.vadi = this.extractVadiSamvadi(content, 'vadi');
        data.sources.vadi = result.url;
      }
      
      if (!data.samvadi && content.toLowerCase().includes('samvadi')) {
        data.samvadi = this.extractVadiSamvadi(content, 'samvadi');
        data.sources.samvadi = result.url;
      }
      
      // Extract time of rendition
      if (!data.timeOfRendition && (content.toLowerCase().includes('time') || content.toLowerCase().includes('morning') || content.toLowerCase().includes('evening'))) {
        data.timeOfRendition = this.extractTimeOfRendition(content);
        data.sources.timeOfRendition = result.url;
      }
    }
    
    return data;
  }

  async extractTaalData(name, searchResults) {
    const data = {
      numberOfBeats: '',
      divisions: '',
      taaliCount: '',
      taaliBeatNumbers: '',
      khaaliCount: '',
      khaaliBeatNumbers: '',
      jaati: '',
      sources: {}
    };
    
    for (const result of searchResults) {
      const content = result.content;
      
      // Extract number of beats
      if (!data.numberOfBeats && (content.includes('beats') || content.includes('matras'))) {
        data.numberOfBeats = this.extractBeats(content);
        data.sources.numberOfBeats = result.url;
      }
      
      // Extract taali information
      if (!data.taaliCount && content.toLowerCase().includes('taali')) {
        const taaliInfo = this.extractTaaliKhaali(content, 'taali');
        data.taaliCount = taaliInfo.count;
        data.taaliBeatNumbers = taaliInfo.beatNumbers;
        data.sources.taaliCount = result.url;
        data.sources.taaliBeatNumbers = result.url;
      }
      
      // Extract khaali information
      if (!data.khaaliCount && content.toLowerCase().includes('khaali')) {
        const khaaliInfo = this.extractTaaliKhaali(content, 'khaali');
        data.khaaliCount = khaaliInfo.count;
        data.khaaliBeatNumbers = khaaliInfo.beatNumbers;
        data.sources.khaaliCount = result.url;
        data.sources.khaaliBeatNumbers = result.url;
      }
    }
    
    return data;
  }

  // Helper methods for data extraction
  extractGuruInfo(content) {
    const patterns = [
      /guru[:\s]+([^.]+)/i,
      /trained under[:\s]+([^.]+)/i,
      /student of[:\s]+([^.]+)/i,
      /disciple of[:\s]+([^.]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return match[1].trim().split(',')[0];
      }
    }
    return '';
  }

  extractGharanaInfo(content) {
    const match = content.match(/([^.\s]+)\s+gharana/i);
    return match ? match[1].trim() + ' Gharana' : '';
  }

  extractAchievements(content) {
    const achievements = [];
    const patterns = [
      /padma\s+\w+/gi,
      /grammy\s+award/gi,
      /sangeet\s+natak\s+akademi/gi,
      /bharat\s+ratna/gi
    ];
    
    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        achievements.push(...matches);
      }
    });
    
    return achievements.join(', ');
  }

  extractDisciples(content) {
    // This is a simplified extraction - in reality, this would be more complex
    const match = content.match(/disciples?[:\s]+([^.]+)/i);
    return match ? match[1].trim() : '';
  }

  extractMusicalSequence(content, type) {
    const pattern = new RegExp(`${type}[:\\s]+([^.]+)`, 'i');
    const match = content.match(pattern);
    return match ? match[1].trim() : '';
  }

  extractThaat(content) {
    const match = content.match(/(\w+)\s+thaat/i);
    return match ? match[1].trim() + ' Thaat' : '';
  }

  extractVadiSamvadi(content, type) {
    const pattern = new RegExp(`${type}[:\\s]+(\\w+)`, 'i');
    const match = content.match(pattern);
    return match ? match[1].trim() : '';
  }

  extractTimeOfRendition(content) {
    const timePatterns = [
      /morning/i,
      /evening/i,
      /night/i,
      /dawn/i,
      /dusk/i,
      /afternoon/i
    ];
    
    for (const pattern of timePatterns) {
      if (pattern.test(content)) {
        return content.match(pattern)[0];
      }
    }
    return '';
  }

  extractBeats(content) {
    const match = content.match(/(\d+)\s+(beats|matras)/i);
    return match ? match[1] : '';
  }

  extractTaaliKhaali(content, type) {
    const result = { count: '', beatNumbers: '' };
    
    const countMatch = content.match(new RegExp(`(\\d+)\\s+${type}`, 'i'));
    if (countMatch) {
      result.count = countMatch[1];
    }
    
    const beatMatch = content.match(new RegExp(`${type}[^\\d]*(\\d+(?:,\\s*\\d+)*)`, 'i'));
    if (beatMatch) {
      result.beatNumbers = beatMatch[1];
    }
    
    return result;
  }

  // Empty data fallbacks
  getEmptyArtistData(name) {
    return {
      name: { value: name, reference: 'Web search attempted but no reliable data found', verified: false },
      guru: { value: '', reference: 'No reliable information found in web search', verified: false },
      gharana: { value: '', reference: 'No reliable information found in web search', verified: false },
      notableAchievements: { value: '', reference: 'No reliable information found in web search', verified: false },
      disciples: { value: '', reference: 'No reliable information found in web search', verified: false }
    };
  }

  getEmptyRaagData(name) {
    return {
      name: { value: name, reference: 'Web search attempted but no reliable data found', verified: false },
      aroha: { value: '', reference: 'No reliable information found in web search', verified: false },
      avroha: { value: '', reference: 'No reliable information found in web search', verified: false },
      chalan: { value: '', reference: 'No reliable information found in web search', verified: false },
      vadi: { value: '', reference: 'No reliable information found in web search', verified: false },
      samvadi: { value: '', reference: 'No reliable information found in web search', verified: false },
      thaat: { value: '', reference: 'No reliable information found in web search', verified: false },
      rasBhaav: { value: '', reference: 'No reliable information found in web search', verified: false },
      tanpuraTuning: { value: '', reference: 'No reliable information found in web search', verified: false },
      timeOfRendition: { value: '', reference: 'No reliable information found in web search', verified: false }
    };
  }

  getEmptyTaalData(name) {
    return {
      name: { value: name, reference: 'Web search attempted but no reliable data found', verified: false },
      numberOfBeats: { value: '', reference: 'No reliable information found in web search', verified: false },
      divisions: { value: '', reference: 'No reliable information found in web search', verified: false },
      taali: {
        count: { value: '', reference: 'No reliable information found in web search', verified: false },
        beatNumbers: { value: '', reference: 'No reliable information found in web search', verified: false }
      },
      khaali: {
        count: { value: '', reference: 'No reliable information found in web search', verified: false },
        beatNumbers: { value: '', reference: 'No reliable information found in web search', verified: false }
      },
      jaati: { value: '', reference: 'No reliable information found in web search', verified: false }
    };
  }
}

module.exports = new WebSearchService();