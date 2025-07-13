const OpenAI = require('openai');

class AIResearcher {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async researchArtist(name) {
    const prompt = `Research the Indian Classical Music artist "${name}" and provide detailed information with reliable sources. For each piece of information, include the source URL or reference where this information can be verified.

Please provide information in the following JSON format:
{
  "name": {
    "value": "${name}",
    "reference": "source_url_or_reference",
    "verified": false
  },
  "guru": {
    "value": "guru_name",
    "reference": "source_url_or_reference",
    "verified": false
  },
  "gharana": {
    "value": "gharana_name",
    "reference": "source_url_or_reference",
    "verified": false
  },
  "notableAchievements": {
    "value": "achievements_description",
    "reference": "source_url_or_reference",
    "verified": false
  },
  "disciples": {
    "value": "disciples_names",
    "reference": "source_url_or_reference",
    "verified": false
  }
}

Focus on accuracy and provide specific, verifiable sources for each field. If information is not available, leave the value empty but still provide a reference explaining why.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert researcher specializing in Indian Classical Music. Always provide accurate information with verifiable sources. When providing sources, prefer academic sources, official websites, and reputable music institutions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const response = completion.choices[0].message.content;
      return this.parseAIResponse(response);
    } catch (error) {
      console.error('Error in AI research:', error);
      throw new Error('Failed to research artist using AI');
    }
  }

  async researchRaag(name) {
    const prompt = `Research the Indian Classical Music raag "${name}" and provide detailed information with reliable sources. For each piece of information, include the source URL or reference where this information can be verified.

Please provide information in the following JSON format:
{
  "name": {
    "value": "${name}",
    "reference": "source_url_or_reference",
    "verified": false
  },
  "aroha": {
    "value": "ascending_notes",
    "reference": "source_url_or_reference",
    "verified": false
  },
  "avroha": {
    "value": "descending_notes",
    "reference": "source_url_or_reference",
    "verified": false
  },
  "chalan": {
    "value": "characteristic_phrases",
    "reference": "source_url_or_reference",
    "verified": false
  },
  "vadi": {
    "value": "vadi_note",
    "reference": "source_url_or_reference",
    "verified": false
  },
  "samvadi": {
    "value": "samvadi_note",
    "reference": "source_url_or_reference",
    "verified": false
  },
  "thaat": {
    "value": "parent_thaat",
    "reference": "source_url_or_reference",
    "verified": false
  },
  "rasBhaav": {
    "value": "emotional_content",
    "reference": "source_url_or_reference",
    "verified": false
  },
  "tanpuraTuning": {
    "value": "tuning_notes",
    "reference": "source_url_or_reference",
    "verified": false
  },
  "timeOfRendition": {
    "value": "time_period",
    "reference": "source_url_or_reference",
    "verified": false
  }
}

Focus on accuracy and provide specific, verifiable sources for each field.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert researcher specializing in Indian Classical Music raags. Always provide accurate information with verifiable sources from reputable music institutions, academic sources, and established music websites."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const response = completion.choices[0].message.content;
      return this.parseAIResponse(response);
    } catch (error) {
      console.error('Error in AI research:', error);
      throw new Error('Failed to research raag using AI');
    }
  }

  async researchTaal(name) {
    const prompt = `Research the Indian Classical Music taal "${name}" and provide detailed information with reliable sources. For each piece of information, include the source URL or reference where this information can be verified.

Please provide information in the following JSON format:
{
  "name": {
    "value": "${name}",
    "reference": "source_url_or_reference",
    "verified": false
  },
  "numberOfBeats": {
    "value": "number_of_matras",
    "reference": "source_url_or_reference",
    "verified": false
  },
  "divisions": {
    "value": "vibhag_structure",
    "reference": "source_url_or_reference",
    "verified": false
  },
  "taali": {
    "count": {
      "value": "number_of_taalis",
      "reference": "source_url_or_reference",
      "verified": false
    },
    "beatNumbers": {
      "value": "taali_beat_positions",
      "reference": "source_url_or_reference",
      "verified": false
    }
  },
  "khaali": {
    "count": {
      "value": "number_of_khaalis",
      "reference": "source_url_or_reference",
      "verified": false
    },
    "beatNumbers": {
      "value": "khaali_beat_positions",
      "reference": "source_url_or_reference",
      "verified": false
    }
  },
  "jaati": {
    "value": "jaati_classification",
    "reference": "source_url_or_reference",
    "verified": false
  }
}

Focus on accuracy and provide specific, verifiable sources for each field.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert researcher specializing in Indian Classical Music taals. Always provide accurate information with verifiable sources from reputable music institutions, academic sources, and established music websites."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const response = completion.choices[0].message.content;
      return this.parseAIResponse(response);
    } catch (error) {
      console.error('Error in AI research:', error);
      throw new Error('Failed to research taal using AI');
    }
  }

  parseAIResponse(response) {
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in AI response');
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI research results');
    }
  }
}

module.exports = new AIResearcher();