const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

class ScraperService {
  constructor() {
    this.whitelistedSites = process.env.WHITELISTED_SITES.split(',');
  }

  async scrapeArtist(name) {
    const results = {
      name: { 
        value: name, 
        reference: `https://oceanofragas.com/artists/${name.toLowerCase().replace(/\s+/g, '-')}`, 
        verified: false 
      },
      guru: { value: '', reference: '', verified: false },
      gharana: { value: '', reference: '', verified: false },
      notableAchievements: { value: '', reference: '', verified: false },
      disciples: { value: '', reference: '', verified: false }
    };

    // Try whitelisted sites first
    for (const site of this.whitelistedSites) {
      try {
        const data = await this.scrapeFromSite(site, name, 'artist');
        if (data) {
          Object.assign(results, data);
          break;
        }
      } catch (error) {
        console.error(`Error scraping from ${site}:`, error);
      }
    }

    // If data is incomplete, try fallback sites
    if (!this.isDataComplete(results)) {
      const fallbackData = await this.scrapeFallback(name, 'artist');
      Object.assign(results, fallbackData);
    }

    return results;
  }

  async scrapeRaag(name) {
    const results = {
      name: { 
        value: name, 
        reference: `https://oceanofragas.com/raags/${name.toLowerCase().replace(/\s+/g, '-')}`, 
        verified: false 
      },
      aroha: { value: '', reference: '', verified: false },
      avroha: { value: '', reference: '', verified: false },
      chalan: { value: '', reference: '', verified: false },
      vadi: { value: '', reference: '', verified: false },
      samvadi: { value: '', reference: '', verified: false },
      thaat: { value: '', reference: '', verified: false },
      rasBhaav: { value: '', reference: '', verified: false },
      tanpuraTuning: { value: '', reference: '', verified: false },
      timeOfRendition: { value: '', reference: '', verified: false }
    };

    // Try whitelisted sites first
    for (const site of this.whitelistedSites) {
      try {
        const data = await this.scrapeFromSite(site, name, 'raag');
        if (data) {
          Object.assign(results, data);
          break;
        }
      } catch (error) {
        console.error(`Error scraping from ${site}:`, error);
      }
    }

    // If data is incomplete, try fallback sites
    if (!this.isDataComplete(results)) {
      const fallbackData = await this.scrapeFallback(name, 'raag');
      Object.assign(results, fallbackData);
    }

    return results;
  }

  async scrapeTaal(name) {
    const results = {
      name: { 
        value: name, 
        reference: `https://oceanofragas.com/taals/${name.toLowerCase().replace(/\s+/g, '-')}`, 
        verified: false 
      },
      numberOfBeats: { value: '', reference: '', verified: false },
      divisions: { value: '', reference: '', verified: false },
      taali: {
        count: { value: '', reference: '', verified: false },
        beatNumbers: { value: '', reference: '', verified: false }
      },
      khaali: {
        count: { value: '', reference: '', verified: false },
        beatNumbers: { value: '', reference: '', verified: false }
      },
      jaati: { value: '', reference: '', verified: false }
    };

    // Try whitelisted sites first
    for (const site of this.whitelistedSites) {
      try {
        const data = await this.scrapeFromSite(site, name, 'taal');
        if (data) {
          Object.assign(results, data);
          break;
        }
      } catch (error) {
        console.error(`Error scraping from ${site}:`, error);
      }
    }

    // If data is incomplete, try fallback sites
    if (!this.isDataComplete(results)) {
      const fallbackData = await this.scrapeFallback(name, 'taal');
      Object.assign(results, fallbackData);
    }

    return results;
  }

  async scrapeFromSite(site, name, type) {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    try {
      const page = await browser.newPage();
      const searchUrl = this.constructSearchUrl(site, name, type);
      await page.goto(searchUrl);
      const content = await page.content();
      const $ = cheerio.load(content);

      // Site-specific scraping logic
      switch (site) {
        case 'https://oceanofragas.com':
          return this.scrapeOceanOfRagas($, type);
        case 'https://swarraag.com':
          return this.scrapeSwarRaag($, type);
        // Add more site-specific scrapers
        default:
          return null;
      }
    } finally {
      await browser.close();
    }
  }

  async scrapeFallback(name, type) {
    // Implement fallback scraping logic (e.g., Wikipedia)
    return {};
  }

  isDataComplete(data) {
    // Check if essential fields are filled
    return Object.values(data).some(field => field.value && field.reference);
  }

  constructSearchUrl(site, name, type) {
    // Construct search URL based on site and type
    const searchName = name.toLowerCase().replace(/\s+/g, '-');
    return `${site}/${type}/${searchName}`;
  }

  // Site-specific scraping methods
  scrapeOceanOfRagas($, type) {
    // Implement Ocean of Ragas specific scraping
    return {};
  }

  scrapeSwarRaag($, type) {
    // Implement Swar Raag specific scraping
    return {};
  }
}

module.exports = new ScraperService(); 