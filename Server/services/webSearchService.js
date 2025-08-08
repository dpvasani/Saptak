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
      // Artist official websites and high-priority sources
      'ravishankar.org',
      'zakirhussain.com',
      'panditjasraj.com',
      'ustadrashidkhan.com',
      'panditshivkumar.com',
      'sangeetnatak.gov.in',
      'itcsra.org',
      'darbarfestival.com',
      'spicmacay.org',
      // Social media platforms
      'facebook.com',
      'instagram.com',
      'twitter.com',
      'youtube.com',
      'linkedin.com',
      // General music sources
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
      'sangeetpedia.com',
      'classicalmusic.about.com',
      'musictheory.net'
    ];

    // Priority sources for artist searches (checked first)
    this.artistPrioritySources = [
      'wikipedia.org',
      'sangeetnatak.gov.in',
      'itcsra.org',
      'darbarfestival.com',
      'spicmacay.org',
      'britannica.com'
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
      // First, try to find official artist website
      const officialWebsiteResults = await this.searchOfficialArtistWebsite(name);
      
      // Search for social media profiles
      const socialMediaResults = await this.searchSocialMediaProfiles(name);
      
      // Then perform multi-source search with priority sources
      const searchResults = await this.performPrioritySearch(`"${name}" Indian classical music artist guru gharana`);
      
      // Combine results with official website taking priority
      const combinedResults = [...officialWebsiteResults, ...socialMediaResults, ...searchResults];
      
      const artistData = await this.extractArtistData(name, searchResults);
      
      // If we don't have enough data, try to get general summary
      if (!artistData.guru && !artistData.gharana && !artistData.achievements) {
        const summaryData = await this.getGeneralSummary(name, combinedResults);
        Object.assign(artistData, summaryData);
      }
      
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

  async searchOfficialArtistWebsite(artistName) {
    console.log(`Searching for official website of artist: ${artistName}`);
    
    try {
      // Search for official artist website
      const officialSiteQuery = `"${artistName}" site:*.com OR site:*.org OR site:*.in "official website" OR "biography" OR "about"`;
      const officialResults = await this.performTargetedWebSearch(officialSiteQuery, 3);
      
      // Filter results that are likely to be official websites
      const filteredResults = officialResults.filter(result => {
        const url = result.url.toLowerCase();
        const content = result.content.toLowerCase();
        const artistNameLower = artistName.toLowerCase();
        
        // Check if URL contains artist name or if content strongly suggests it's an official site
        const hasArtistInUrl = url.includes(artistNameLower.replace(/\s+/g, ''));
        const hasOfficialIndicators = content.includes('official') || 
                                    content.includes('biography') || 
                                    content.includes('about ' + artistNameLower) ||
                                    url.includes('official') ||
                                    url.includes('bio');
        
        return hasArtistInUrl || hasOfficialIndicators;
      });
      
      console.log(`Found ${filteredResults.length} potential official website results`);
      return filteredResults;
    } catch (error) {
      console.error('Error searching for official artist website:', error);
      return [];
    }
  }

  async performPrioritySearch(query) {
    const results = [];
    
    try {
      // Search priority sources first
      console.log('Searching priority sources...');
      for (const source of this.artistPrioritySources.slice(0, 4)) {
        try {
          const sourceResults = await this.searchSpecificSource(source, query, 2);
          results.push(...sourceResults);
          
          // Add delay to avoid being blocked
          await new Promise(resolve => setTimeout(resolve, 800));
        } catch (error) {
          console.log(`Priority search failed for ${source}:`, error.message);
        }
      }
      
      // If we don't have enough results, search other sources
      if (results.length < 5) {
        console.log('Searching additional sources...');
        const additionalResults = await this.searchMusicSources(query);
        results.push(...additionalResults);
      }
      
      return results;
    } catch (error) {
      console.error('Error in priority search:', error);
      return results;
    }
  }

  async searchSpecificSource(source, query, maxResults = 2) {
    try {
      const searchUrl = `https://www.google.com/search?q=site:${source} ${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl, { 
        headers: this.headers,
        timeout: 8000 
      });
      
      const $ = cheerio.load(response.data);
      const results = [];
      
      $('div.g').each((i, element) => {
        if (i >= maxResults) return false;
        
        const title = $(element).find('h3').text();
        const url = $(element).find('a').attr('href');
        const snippet = $(element).find('.VwiC3b').text() || $(element).find('.s3v9rd').text();
        
        if (title && url && snippet) {
          results.push({
            title,
            url: url.startsWith('/url?q=') ? decodeURIComponent(url.split('/url?q=')[1].split('&')[0]) : url,
            content: snippet,
            source: source,
            priority: true // Mark as priority source
          });
        }
      });
      
      return results;
    } catch (error) {
      console.log(`Specific source search failed for ${source}:`, error.message);
      return [];
    }
  }

  async performTargetedWebSearch(query, maxResults = 5) {
    try {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl, { 
        headers: this.headers,
        timeout: 10000 
      });
      
      const $ = cheerio.load(response.data);
      const results = [];
      
      $('div.g').each((i, element) => {
        if (i >= maxResults) return false;
        
        const title = $(element).find('h3').text();
        const url = $(element).find('a').attr('href');
        const snippet = $(element).find('.VwiC3b').text() || $(element).find('.s3v9rd').text();
        
        if (title && url && snippet) {
          results.push({
            title,
            url: url.startsWith('/url?q=') ? decodeURIComponent(url.split('/url?q=')[1].split('&')[0]) : url,
            content: snippet,
            source: 'Targeted Search'
          });
        }
      });
      
      return results;
    } catch (error) {
      console.error('Targeted web search failed:', error);
      return [];
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
  async searchSocialMediaProfiles(artistName) {
    console.log(`Searching for social media profiles of artist: ${artistName}`);
    
    const socialPlatforms = [
      { platform: 'facebook', query: `site:facebook.com "${artistName}" Indian classical music` },
      { platform: 'instagram', query: `site:instagram.com "${artistName}" classical music` },
      { platform: 'youtube', query: `site:youtube.com "${artistName}" Indian classical` },
      { platform: 'twitter', query: `site:twitter.com "${artistName}" classical music` }
    ];
    
    const results = [];
    
    for (const { platform, query } of socialPlatforms) {
      try {
        const platformResults = await this.performTargetedWebSearch(query, 2);
        results.push(...platformResults.map(result => ({
          ...result,
          platform,
          socialMedia: true
        })));
        
        // Add delay to avoid being blocked
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(`Social media search failed for ${platform}:`, error.message);
      }
    }
    
    console.log(`Found ${results.length} social media results`);
    return results;
  }

  async getGeneralSummary(artistName, availableResults) {
    console.log(`Getting general summary for artist: ${artistName}`);
    
    const summaryData = {
      guru: '',
      gharana: '',
      achievements: '',
      disciples: '',
      sources: {}
    };
    
    // Extract any available information from all sources
    for (const result of availableResults) {
      const content = result.content.toLowerCase();
      const originalContent = result.content;
      
      // Try to extract any biographical information
      if (!summaryData.guru) {
        const bioInfo = this.extractBiographicalInfo(originalContent, 'guru');
        if (bioInfo) {
          summaryData.guru = bioInfo;
          summaryData.sources.guru = result.url;
        }
      }
      
      if (!summaryData.gharana) {
        const bioInfo = this.extractBiographicalInfo(originalContent, 'gharana');
        if (bioInfo) {
          summaryData.gharana = bioInfo;
          summaryData.sources.gharana = result.url;
        }
      }
      
      if (!summaryData.achievements) {
        const bioInfo = this.extractBiographicalInfo(originalContent, 'achievements');
        if (bioInfo) {
          summaryData.achievements = bioInfo;
          summaryData.sources.achievements = result.url;
        }
      }
      
      // Extract from social media descriptions
      if (result.socialMedia && !summaryData.achievements) {
        const socialInfo = this.extractSocialMediaInfo(originalContent);
        if (socialInfo) {
          summaryData.achievements = socialInfo;
          summaryData.sources.achievements = result.url;
        }
      }
    }
    
    return summaryData;
  }

  extractBiographicalInfo(content, type) {
    const patterns = {
      guru: [
        /trained under ([^.,]+)/i,
        /student of ([^.,]+)/i,
        /disciple of ([^.,]+)/i,
        /learned from ([^.,]+)/i,
        /mentored by ([^.,]+)/i
      ],
      gharana: [
        /([^.\s,]+)\s+gharana/i,
        /belongs to ([^.,]+) tradition/i,
        /from the ([^.,]+) school/i
      ],
      achievements: [
        /(padma\s+\w+[^.]*)/gi,
        /(grammy[^.]*)/gi,
        /(sangeet\s+natak\s+akademi[^.]*)/gi,
        /(national\s+award[^.]*)/gi
      ]
    };
    
    const typePatterns = patterns[type] || [];
    
    for (const pattern of typePatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return '';
  }

  extractSocialMediaInfo(content) {
    // Extract key information from social media profiles
    const patterns = [
      /classical\s+music\s+artist/i,
      /tabla\s+player/i,
      /sitar\s+player/i,
      /vocalist/i,
      /musician/i,
      /performer/i
    ];
    
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        return content.substring(0, 200) + '...'; // Return first 200 chars as summary
      }
    }
    
    return '';
  }

  async extractArtistData(name, searchResults) {
    const data = {
      guru: '',
      gharana: '',
      achievements: '',
      disciples: '',
      sources: {}
    };
    
    // Sort results to prioritize official websites and priority sources
    const sortedResults = searchResults.sort((a, b) => {
      // Official websites first
      if (a.source === 'Targeted Search' && b.source !== 'Targeted Search') return -1;
      if (b.source === 'Targeted Search' && a.source !== 'Targeted Search') return 1;
      
      // Priority sources next
      if (a.priority && !b.priority) return -1;
      if (b.priority && !a.priority) return 1;
      
      // Wikipedia gets high priority
      if (a.source === 'Wikipedia' && b.source !== 'Wikipedia') return -1;
      if (b.source === 'Wikipedia' && a.source !== 'Wikipedia') return 1;
      
      return 0;
    });
    
    for (const result of sortedResults) {
      const content = result.content.toLowerCase();
      
      // Extract guru information
      if (!data.guru && (content.includes('guru') || content.includes('teacher') || content.includes('trained under'))) {
        const guruMatch = this.extractGuruInfo(result.content);
        if (guruMatch) {
          data.guru = guruMatch;
          data.sources.guru = result.url;
          console.log(`Found guru info from ${result.source}: ${guruMatch}`);
        }
      }
      
      // Extract gharana information
      if (!data.gharana && content.includes('gharana')) {
        const gharanaMatch = this.extractGharanaInfo(result.content);
        if (gharanaMatch) {
          data.gharana = gharanaMatch;
          data.sources.gharana = result.url;
          console.log(`Found gharana info from ${result.source}: ${gharanaMatch}`);
        }
      }
      
      // Extract achievements
      if (!data.achievements && (content.includes('award') || content.includes('honor') || content.includes('recognition'))) {
        const achievementsMatch = this.extractAchievements(result.content);
        if (achievementsMatch) {
          data.achievements = achievementsMatch;
          data.sources.achievements = result.url;
          console.log(`Found achievements from ${result.source}: ${achievementsMatch}`);
        }
      }
      
      // Extract disciples
      if (!data.disciples && (content.includes('disciple') || content.includes('student') || content.includes('taught'))) {
        const disciplesMatch = this.extractDisciples(result.content);
        if (disciplesMatch) {
          data.disciples = disciplesMatch;
          data.sources.disciples = result.url;
          console.log(`Found disciples from ${result.source}: ${disciplesMatch}`);
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
      /teacher[:\s]+([^.]+)/i,
      /trained under[:\s]+([^.]+)/i,
      /student of[:\s]+([^.]+)/i,
      /disciple of[:\s]+([^.]+)/i,
      /learned from[:\s]+([^.]+)/i,
      /studied under[:\s]+([^.]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        // Clean up the extracted guru name
        let guruName = match[1].trim().split(',')[0].split('.')[0];
        // Remove common prefixes/suffixes
        guruName = guruName.replace(/^(ustad|pandit|pt\.?|sri|shri)\s+/i, '');
        guruName = guruName.replace(/\s+(sahib|ji|saheb)$/i, '');
        return guruName.trim();
      }
    }
    return '';
  }

  extractGharanaInfo(content) {
    const patterns = [
      /([^.\s,]+)\s+gharana/i,
      /gharana[:\s]+([^.,]+)/i,
      /belongs to the ([^.,]+) gharana/i,
      /from the ([^.,]+) gharana/i
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        let gharanaName = match[1].trim();
        // Ensure it ends with 'Gharana' if not already
        if (!gharanaName.toLowerCase().includes('gharana')) {
          gharanaName += ' Gharana';
        }
        return gharanaName;
      }
    }
    return '';
  }

  extractAchievements(content) {
    const achievements = [];
    const patterns = [
      /padma\s+\w+/gi,
      /bharat\s+ratna/gi,
      /grammy\s+award/gi,
      /sangeet\s+natak\s+akademi/gi,
      /national\s+award/gi,
      /fellowship/gi,
      /doctorate/gi,
      /honorary\s+degree/gi
    ];
    
    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        achievements.push(...matches);
      }
    });
    
    // Remove duplicates and clean up
    const uniqueAchievements = [...new Set(achievements.map(a => a.trim()))];
    return uniqueAchievements.join(', ');
  }

  extractDisciples(content) {
    const patterns = [
      /disciples?[:\s]+([^.]+)/i,
      /students?[:\s]+([^.]+)/i,
      /taught[:\s]+([^.]+)/i,
      /notable students include[:\s]+([^.]+)/i,
      /among his students are[:\s]+([^.]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        let disciples = match[1].trim();
        // Clean up common endings
        disciples = disciples.replace(/\s+(and many others|among others|etc\.?)$/i, '');
        return disciples;
      }
    }
    return '';
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