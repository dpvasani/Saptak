# Artist Search Flow Documentation

## Overview
This document traces the complete request-response flow when searching for an artist on the `/artists` route (`http://localhost:3000/artists`), including both AI search modes (Structured Mode and Summary Mode).

## Frontend Flow

### 1. Initial Page Load
**File:** `Client/src/pages/ArtistSearch.js`
- Component mounts with initial state
- Renders `DualModeSearchForm` component
- Sets up state variables for search results

### 2. User Input and Search Method Selection
**File:** `Client/src/components/DualModeSearchForm.js`

#### Search Method Selection:
- User can choose between:
  - **Web Scraping**: Traditional web scraping (no AI)
  - **AI Search**: AI-powered research with multiple modes

#### AI Search Modes:
When AI Search is selected, user can choose:
- **Option 1: Structured Mode** - Generates organized field data
- **Option 2: Summary Mode** - Generates research summary in markdown

#### AI Provider Selection:
**File:** `Client/src/components/AIModelSelector.js`
- User selects AI provider (Perplexity, OpenAI, Gemini)
- User selects specific model (sonar-pro, gpt-4, etc.)

### 3. Search Execution
**File:** `Client/src/components/DualModeSearchForm.js` → `handleSearch()`

#### For Web Scraping:
```javascript
await onStructuredSearch(searchQuery, false, '', '', null);
```

#### For AI Search:
```javascript
// Execute structured search if selected
if (useStructuredMode) {
  searchPromises.push(
    onStructuredSearch(searchQuery, true, structuredProvider, structuredModel, structuredModelData)
  );
}

// Execute "All About" search if selected
if (useAllAboutMode) {
  searchPromises.push(
    onAllAboutSearch(searchQuery, allAboutProvider, allAboutModel, allAboutModelData)
  );
}
```

### 4. API Service Calls
**File:** `Client/src/utils/api.js`

#### Structured Search API Call:
```javascript
searchArtist: (name, useAI = false, aiProvider = 'openai', aiModel = 'default') =>
  api.get(`/api/artists/search?name=${encodeURIComponent(name)}&useAI=${useAI}&aiProvider=${aiProvider}&aiModel=${aiModel}`)
```

#### Summary Mode API Call:
```javascript
getAllAboutArtist: (name, aiProvider = 'perplexity', aiModel = 'sonar-pro') =>
  api.get(`/api/artists/all-about?name=${encodeURIComponent(name)}&aiProvider=${aiProvider}&aiModel=${aiModel}`)
```

## Backend Flow

### 1. Route Handling
**File:** `Server/routes/artists.js`

#### Structured Search Route:
```javascript
router.get('/search', authenticateToken, searchLimiter, logUserActivity('search', 'artists'), validateSearch, asyncHandler(artistController.searchArtist));
```

#### Summary Mode Route:
```javascript
router.get('/all-about', authenticateToken, logUserActivity('search', 'artists'), validateSearch, asyncHandler(artistController.getAllAboutArtist));
```

### 2. Middleware Processing
**Files:** `Server/middleware/`

#### Authentication:
- `auth.js` - Verifies JWT token
- `rateLimiter.js` - Applies rate limiting
- `activityLogger.js` - Logs user activity
- `validation.js` - Validates search parameters

### 3. Controller Processing
**File:** `Server/controllers/artistController.js`

#### Structured Search Controller (`searchArtist`):
```javascript
exports.searchArtist = async (req, res) => {
  const { name, useAI, aiProvider, aiModel } = req.query;
  const userId = req.user?.userId;
  
  if (useAI === 'true') {
    // AI Research Path
    if (provider === 'perplexity') {
      data = await perplexityResearcher.researchArtist(name, model);
    } else if (provider === 'gemini') {
      data = await geminiResearcher.researchArtist(name, model);
    } else {
      data = await aiResearcher.researchArtist(name, model);
    }
  } else {
    // Web Scraping Path
    data = await scraperService.scrapeArtist(name);
  }
  
  // Create and save artist to database
  const artist = new Artist({
    ...data,
    createdBy: userId,
    modifiedBy: userId,
    searchMetadata: {
      searchMethod: useAI === 'true' ? 'ai' : 'web',
      aiProvider: useAI === 'true' ? (aiProvider || 'openai') : null,
      aiModel: useAI === 'true' ? (aiModel || 'default') : null,
      searchQuery: name,
      searchTimestamp: new Date()
    }
  });
  await artist.save();
  
  res.json(artist);
};
```

#### Summary Mode Controller (`getAllAboutArtist`):
```javascript
exports.getAllAboutArtist = async (req, res) => {
  const { name, aiProvider, aiModel } = req.query;
  const userId = req.user?.userId;
  
  const provider = aiProvider || 'perplexity';
  const model = aiModel || 'sonar-pro';
  
  let allAboutData;
  if (provider === 'perplexity') {
    allAboutData = await perplexityAllAboutService.getAllAboutArtist(name, model);
  } else if (provider === 'openai') {
    allAboutData = await aiResearcher.getAllAboutArtist(name, model);
  } else if (provider === 'gemini') {
    allAboutData = await geminiResearcher.getAllAboutArtist(name, model);
  }
  
  // Save to existing artist or create new one
  let existingArtist = await Artist.findOne({ 
    'name.value': { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
  });
  
  if (existingArtist) {
    // Update existing artist with All About data
    existingArtist.allAboutData = {
      answer: allAboutData.answer,
      images: allAboutData.images,
      sources: allAboutData.sources,
      citations: allAboutData.citations,
      relatedQuestions: allAboutData.relatedQuestions,
      searchQuery: allAboutData.metadata?.searchQuery,
      aiProvider: allAboutData.metadata?.aiProvider,
      aiModel: allAboutData.metadata?.aiModel
    };
    existingArtist.modifiedBy = userId;
    await existingArtist.save();
  } else {
    // Create new artist with All About data
    const newArtist = new Artist({
      name: { value: name, reference: 'Summary Mode Search', verified: false },
      // ... other fields with empty values
      allAboutData: { /* All About data */ },
      createdBy: userId,
      modifiedBy: userId
    });
    await newArtist.save();
  }
  
  res.json({
    success: true,
    data: allAboutData,
    mode: 'summary',
    searchQuery: name,
    provider: provider,
    model: model
  });
};
```

### 4. AI Service Processing

#### Structured Mode AI Service:
**File:** `Server/services/perplexityResearcher.js`

```javascript
async researchArtist(name) {
  const prompt = `I need you to conduct a comprehensive, multi-step research about the Indian Classical Music artist "${name}"...`;
  
  const response = await axios.post(this.baseURL, {
    model: this.model,
    messages: [
      {
        role: "system",
        content: "You are an expert Indian Classical Music researcher..."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.02,
    max_tokens: 3000
  }, {
    headers: {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  const responseText = response.data.choices[0].message.content;
  return this.parseAIResponse(responseText);
}
```

#### Summary Mode AI Service:
**File:** `Server/services/perplexityAllAboutService.js`

```javascript
async getAllAboutArtist(name, modelName = null) {
  const prompt = `Please provide comprehensive information about the Indian Classical Music artist "${name}"...`;
  const model = modelName || this.defaultModel;
  
  const response = await axios.post(this.baseURL, {
    model: model,
    messages: [
      {
        role: "system",
        content: "You are an expert researcher specializing in Indian Classical Music..."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.2,
    max_tokens: 4000,
    return_citations: true,
    return_images: true,
    return_related_questions: true
  }, {
    headers: {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  const result = response.data;
  const message = result.choices[0].message;
  
  return {
    name: { value: name, reference: 'Perplexity Summary Search', verified: false },
    answer: { value: message.content || '', reference: 'Perplexity AI Response', verified: false },
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
}
```

### 5. Database Operations
**File:** `Server/models/Artist.js`

#### Artist Schema:
```javascript
const artistSchema = new mongoose.Schema({
  // Basic Information
  name: { value: String, reference: String, verified: Boolean },
  guru: { value: String, reference: String, verified: Boolean },
  gharana: { value: String, reference: String, verified: Boolean },
  notableAchievements: { value: String, reference: String, verified: Boolean },
  disciples: { value: String, reference: String, verified: Boolean },
  summary: { value: String, reference: String, verified: Boolean },
  
  // All About Data
  allAboutData: {
    answer: { value: String, reference: String, verified: Boolean },
    images: [{ url: String, title: String, description: String, source: String, verified: Boolean }],
    sources: [{ title: String, url: String, snippet: String, domain: String, type: String, verified: Boolean }],
    citations: [{ title: String, url: String, snippet: String, verified: Boolean }],
    relatedQuestions: [String],
    searchQuery: String,
    aiProvider: String,
    aiModel: String
  },
  
  // User Tracking
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Search Metadata
  searchMetadata: {
    searchMethod: { type: String, enum: ['web', 'ai'], required: true },
    aiProvider: String,
    aiModel: String,
    searchQuery: String,
    searchTimestamp: { type: Date, default: Date.now },
    responseTime: Number
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

## Response Flow

### 1. Backend Response
- Controller returns JSON response with artist data
- For Structured Mode: Returns complete artist object with field data
- For Summary Mode: Returns All About data with answer, images, sources

### 2. Frontend Response Handling
**File:** `Client/src/pages/ArtistSearch.js`

#### Structured Search Response:
```javascript
const debouncedStructuredSearch = debounce(async (query, aiEnabled, provider, model, modelData) => {
  setLoading(true);
  try {
    const response = await apiService.searchArtist(query, aiEnabled, provider, model);
    setArtist(response.data);
    toast.success(`Artist data ${aiEnabled ? `researched using ${modelData?.name || model}` : 'scraped from web'} successfully`);
  } catch (error) {
    toast.error(error.response?.data?.message || 'Error searching for artist');
  } finally {
    setLoading(false);
  }
}, 1000);
```

#### Summary Mode Response:
```javascript
const handleAllAboutSearch = async (query, provider, model, modelData) => {
  setLoading(true);
  try {
    const response = await apiService.getAllAboutArtist(query, provider, model);
    setAllAboutData(response.data.data);
    toast.success(`Summary Mode search completed using ${modelData?.name || model}`);
  } catch (error) {
    toast.error(error.response?.data?.message || 'Error in Summary Mode search');
  } finally {
    setLoading(false);
  }
};
```

### 3. Frontend Display

#### Structured Mode Display:
**File:** `Client/src/pages/ArtistSearch.js`
- Renders artist fields (name, guru, gharana, etc.)
- Shows verification status for each field
- Provides edit and verification functionality
- Displays progress bar for verification percentage

#### Summary Mode Display:
**File:** `Client/src/components/AllAboutDisplay.js`
- Renders markdown content from AI response
- Displays images with source links
- Shows sources with visit links
- Provides edit and verification functionality

## Complete Flow Summary

### 1. User Journey:
1. User navigates to `http://localhost:3000/artists`
2. User enters artist name in search input
3. User selects AI Search method
4. User chooses both Structured Mode and Summary Mode
5. User selects AI provider (Perplexity) and model (sonar-pro)
6. User clicks "Search Artist" button

### 2. Frontend Processing:
1. `DualModeSearchForm` validates selections
2. `apiService` makes two parallel API calls:
   - Structured search: `GET /api/artists/search`
   - Summary search: `GET /api/artists/all-about`

### 3. Backend Processing:
1. Routes handle requests with middleware (auth, rate limiting, validation)
2. Controllers process requests and call appropriate AI services
3. AI services make external API calls to Perplexity
4. AI services parse responses and format data
5. Controllers save data to MongoDB database
6. Controllers return formatted responses

### 4. Database Operations:
1. For Structured Mode: Creates new artist record or updates existing
2. For Summary Mode: Updates existing artist or creates new one with All About data
3. Stores search metadata, user tracking, and timestamps

### 5. Response Display:
1. Frontend receives responses and updates state
2. Structured Mode displays organized field data with verification UI
3. Summary Mode displays markdown content, images, and sources
4. Both modes provide edit and verification capabilities

## Key Files Involved

### Frontend:
- `Client/src/pages/ArtistSearch.js` - Main search page
- `Client/src/components/DualModeSearchForm.js` - Search form component
- `Client/src/components/AIModelSelector.js` - AI provider/model selector
- `Client/src/components/AllAboutDisplay.js` - Summary mode display
- `Client/src/utils/api.js` - API service methods

### Backend:
- `Server/routes/artists.js` - Route definitions
- `Server/controllers/artistController.js` - Request handling
- `Server/services/perplexityResearcher.js` - Structured mode AI service
- `Server/services/perplexityAllAboutService.js` - Summary mode AI service
- `Server/models/Artist.js` - Database schema
- `Server/middleware/` - Authentication, validation, rate limiting

### External APIs:
- Perplexity AI API - For AI-powered research
- MongoDB - For data storage

This flow ensures a complete, robust search experience with both structured data and comprehensive summaries, all while maintaining data integrity and user tracking.
