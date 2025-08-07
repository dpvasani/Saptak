# Indian Classical Music Data Collection System Guide

## Base URL
```
http://localhost:5000/api
```

## Authentication
Currently, the API does not require authentication. All endpoints are publicly accessible.

## Rate Limiting

The API implements rate limiting to prevent abuse:

| Endpoint Type | Limit | Window | Headers |
|---------------|-------|--------|---------|
| General API | 100 requests | 15 minutes | `X-RateLimit-Limit`, `X-RateLimit-Remaining` |
| AI Research | 20 requests | 1 hour | `X-RateLimit-Limit`, `X-RateLimit-Remaining` |
| Web Scraping | 10 requests | 15 minutes | `X-RateLimit-Limit`, `X-RateLimit-Remaining` |
| Search Operations | 20 requests | 10 minutes | `X-RateLimit-Limit`, `X-RateLimit-Remaining` |
| Update Operations | 50 requests | 10 minutes | `X-RateLimit-Limit`, `X-RateLimit-Remaining` |

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

## Artists API

### Search Artist
Search for an artist using web scraping or AI research.

**Endpoint:** `GET /api/artists/search`

**Parameters:**
- `name` (required): Artist name to search
- `useAI` (optional): Use AI research (true/false, default: false)
- `aiProvider` (optional): AI provider (openai/gemini/perplexity, default: openai)

**Example Request:**
```bash
GET /api/artists/search?name=Zakir Hussain&useAI=true&aiProvider=perplexity
```

**Example Response:**
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "name": {
    "value": "Zakir Hussain",
    "reference": "https://en.wikipedia.org/wiki/Zakir_Hussain_(musician)",
    "verified": false
  },
  "guru": {
    "value": "Alla Rakha",
    "reference": "https://en.wikipedia.org/wiki/Alla_Rakha",
    "verified": false
  },
  "gharana": {
    "value": "Punjab Gharana",
    "reference": "https://en.wikipedia.org/wiki/Punjab_gharana",
    "verified": false
  },
  "notableAchievements": {
    "value": "Padma Shri, Padma Bhushan, Grammy Awards",
    "reference": "https://en.wikipedia.org/wiki/Zakir_Hussain_(musician)#Awards",
    "verified": false
  },
  "disciples": {
    "value": "Fazal Qureshi, Sabir Khan",
    "reference": "https://example.com/disciples",
    "verified": false
  },
  "createdAt": "2023-09-06T10:30:00.000Z",
  "updatedAt": "2023-09-06T10:30:00.000Z"
}
```

### Get All Artists
Retrieve all artists from the database.

**Endpoint:** `GET /api/artists`

**Example Response:**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": {
      "value": "Zakir Hussain",
      "reference": "https://en.wikipedia.org/wiki/Zakir_Hussain_(musician)",
      "verified": true
    },
    // ... other fields
  }
]
```

### Get Artist by ID
Retrieve a specific artist by their ID.

**Endpoint:** `GET /api/artists/:id`

**Parameters:**
- `id` (required): Artist ID

**Example Request:**
```bash
GET /api/artists/64f8a1b2c3d4e5f6a7b8c9d0
```

### Update Artist
Update artist information and verification status.

**Endpoint:** `PUT /api/artists/:id`

**Parameters:**
- `id` (required): Artist ID

**Request Body:**
```json
{
  "name": {
    "value": "Zakir Hussain",
    "reference": "https://en.wikipedia.org/wiki/Zakir_Hussain_(musician)",
    "verified": true
  },
  "guru": {
    "value": "Alla Rakha",
    "reference": "https://en.wikipedia.org/wiki/Alla_Rakha",
    "verified": true
  }
}
```

### Get Verified Artists
Retrieve artists with verified information.

**Endpoint:** `GET /api/artists/verified`

**Parameters:**
- `field` (optional): Filter by specific field (name, guru, gharana, notableAchievements, disciples)

**Example Request:**
```bash
GET /api/artists/verified?field=guru
```

### Get Unverified Artists
Retrieve artists with unverified information.

**Endpoint:** `GET /api/artists/unverified`

**Parameters:**
- `field` (optional): Filter by specific field

### Get Artist Statistics
Retrieve verification statistics for artists.

**Endpoint:** `GET /api/artists/stats`

**Example Response:**
```json
{
  "total": 150,
  "fullyVerified": 45,
  "partiallyVerified": 80,
  "unverified": 25,
  "fieldStats": {
    "name": 140,
    "guru": 120,
    "gharana": 110,
    "notableAchievements": 90,
    "disciples": 70
  },
  "percentages": {
    "fullyVerified": "30.00",
    "partiallyVerified": "53.33",
    "unverified": "16.67"
  }
}
```

## Raags API

### Search Raag
Search for a raag using web scraping or AI research.

**Endpoint:** `GET /api/raags/search`

**Parameters:**
- `name` (required): Raag name to search
- `useAI` (optional): Use AI research (true/false, default: false)
- `aiProvider` (optional): AI provider (openai/gemini, default: openai)

**Example Response:**
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
  "name": {
    "value": "Yaman",
    "reference": "https://en.wikipedia.org/wiki/Yaman_(raga)",
    "verified": false
  },
  "aroha": {
    "value": "Sa Re Ga Ma# Pa Dha Ni Sa",
    "reference": "https://en.wikipedia.org/wiki/Yaman_(raga)",
    "verified": false
  },
  "avroha": {
    "value": "Sa Ni Dha Pa Ma# Ga Re Sa",
    "reference": "https://en.wikipedia.org/wiki/Yaman_(raga)",
    "verified": false
  },
  "chalan": {
    "value": "Ni Re Ga, Ma# Dha Ni, Sa",
    "reference": "https://en.wikipedia.org/wiki/Yaman_(raga)",
    "verified": false
  },
  "vadi": {
    "value": "Ga",
    "reference": "https://en.wikipedia.org/wiki/Yaman_(raga)",
    "verified": false
  },
  "samvadi": {
    "value": "Ni",
    "reference": "https://en.wikipedia.org/wiki/Yaman_(raga)",
    "verified": false
  },
  "thaat": {
    "value": "Kalyan",
    "reference": "https://en.wikipedia.org/wiki/Kalyan_thaat",
    "verified": false
  },
  "rasBhaav": {
    "value": "Peaceful, devotional",
    "reference": "https://en.wikipedia.org/wiki/Yaman_(raga)",
    "verified": false
  },
  "tanpuraTuning": {
    "value": "Sa Pa Sa Sa",
    "reference": "https://en.wikipedia.org/wiki/Yaman_(raga)",
    "verified": false
  },
  "timeOfRendition": {
    "value": "Evening",
    "reference": "https://en.wikipedia.org/wiki/Yaman_(raga)",
    "verified": false
  },
  "createdAt": "2023-09-06T10:30:00.000Z",
  "updatedAt": "2023-09-06T10:30:00.000Z"
}
```

### Other Raag Endpoints
- `GET /api/raags` - Get all raags
- `GET /api/raags/:id` - Get raag by ID
- `PUT /api/raags/:id` - Update raag
- `GET /api/raags/verified` - Get verified raags
- `GET /api/raags/unverified` - Get unverified raags
- `GET /api/raags/stats` - Get raag statistics

## Taals API

### Search Taal
Search for a taal using web scraping or AI research.

**Endpoint:** `GET /api/taals/search`

**Parameters:**
- `name` (required): Taal name to search
- `useAI` (optional): Use AI research (true/false, default: false)
- `aiProvider` (optional): AI provider (openai/gemini, default: openai)

**Example Response:**
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
  "name": {
    "value": "Teentaal",
    "reference": "https://en.wikipedia.org/wiki/Teentaal",
    "verified": false
  },
  "numberOfBeats": {
    "value": 16,
    "reference": "https://en.wikipedia.org/wiki/Teentaal",
    "verified": false
  },
  "divisions": {
    "value": "4 vibhags of 4 beats each",
    "reference": "https://en.wikipedia.org/wiki/Teentaal",
    "verified": false
  },
  "taali": {
    "count": {
      "value": 3,
      "reference": "https://en.wikipedia.org/wiki/Teentaal",
      "verified": false
    },
    "beatNumbers": {
      "value": "1, 5, 13",
      "reference": "https://en.wikipedia.org/wiki/Teentaal",
      "verified": false
    }
  },
  "khaali": {
    "count": {
      "value": 1,
      "reference": "https://en.wikipedia.org/wiki/Teentaal",
      "verified": false
    },
    "beatNumbers": {
      "value": "9",
      "reference": "https://en.wikipedia.org/wiki/Teentaal",
      "verified": false
    }
  },
  "jaati": {
    "value": "Chatusra",
    "reference": "https://en.wikipedia.org/wiki/Teentaal",
    "verified": false
  },
  "createdAt": "2023-09-06T10:30:00.000Z",
  "updatedAt": "2023-09-06T10:30:00.000Z"
}
```

### Other Taal Endpoints
- `GET /api/taals` - Get all taals
- `GET /api/taals/:id` - Get taal by ID
- `PUT /api/taals/:id` - Update taal
- `GET /api/taals/verified` - Get verified taals
- `GET /api/taals/unverified` - Get unverified taals
- `GET /api/taals/stats` - Get taal statistics

## Dashboard API

### Get Dashboard Statistics
Retrieve overall system statistics.

**Endpoint:** `GET /api/dashboard/stats`

**Example Response:**
```json
{
  "overview": {
    "totalEntries": 450,
    "totalArtists": 150,
    "totalRaags": 200,
    "totalTaals": 100
  },
  "verification": {
    "artists": {
      "total": 150,
      "fullyVerified": 45,
      "partiallyVerified": 80,
      "unverified": 25,
      "verificationRate": "30.00"
    },
    "raags": {
      "total": 200,
      "fullyVerified": 60,
      "partiallyVerified": 100,
      "unverified": 40,
      "verificationRate": "30.00"
    },
    "taals": {
      "total": 100,
      "fullyVerified": 30,
      "partiallyVerified": 50,
      "unverified": 20,
      "verificationRate": "30.00"
    }
  },
  "recent": {
    "artists": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "Zakir Hussain",
        "createdAt": "2023-09-06T10:30:00.000Z",
        "verified": true
      }
    ],
    "raags": [],
    "taals": []
  }
}
```

### Get Pending Verification Items
Retrieve items that need verification.

**Endpoint:** `GET /api/dashboard/pending-verification`

**Parameters:**
- `category` (optional): Filter by category (artists, raags, taals)
- `limit` (optional): Number of items to return (default: 10)

**Example Request:**
```bash
GET /api/dashboard/pending-verification?category=artists&limit=5
```

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable - External service error |

## Common Error Responses

### Validation Error
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

### Rate Limit Error
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later.",
  "retryAfter": "15 minutes"
}
```

### AI Service Error
```json
{
  "success": false,
  "message": "AI Service Error: API key not configured"
}
```

## SDK Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 30000
});

// Search for an artist
async function searchArtist(name, useAI = false) {
  try {
    const response = await api.get('/artists/search', {
      params: { name, useAI }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching artist:', error.response.data);
    throw error;
  }
}

// Update artist verification
async function updateArtist(id, data) {
  try {
    const response = await api.put(`/artists/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating artist:', error.response.data);
    throw error;
  }
}
```

### Python
```python
import requests
import json

class IndianClassicalMusicAPI:
    def __init__(self, base_url="http://localhost:5000/api"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.timeout = 30
    
    def search_artist(self, name, use_ai=False, ai_provider="openai"):
        params = {
            "name": name,
            "useAI": str(use_ai).lower(),
            "aiProvider": ai_provider
        }
        response = self.session.get(f"{self.base_url}/artists/search", params=params)
        response.raise_for_status()
        return response.json()
    
    def update_artist(self, artist_id, data):
        response = self.session.put(f"{self.base_url}/artists/{artist_id}", json=data)
        response.raise_for_status()
        return response.json()
```

### cURL Examples

#### Search Artist with AI
```bash
curl -X GET "http://localhost:5000/api/artists/search?name=Ravi%20Shankar&useAI=true&aiProvider=openai" \
  -H "Content-Type: application/json"
```

#### Update Artist
```bash
curl -X PUT "http://localhost:5000/api/artists/64f8a1b2c3d4e5f6a7b8c9d0" \
  -H "Content-Type: application/json" \
  -d '{
    "name": {
      "value": "Zakir Hussain",
      "reference": "https://en.wikipedia.org/wiki/Zakir_Hussain_(musician)",
      "verified": true
    }
  }'
```

#### Get Dashboard Statistics
```bash
curl -X GET "http://localhost:5000/api/dashboard/stats" \
  -H "Content-Type: application/json"
```

## Postman Collection

A comprehensive Postman collection is available in the repository at `postman-collection.json`. Import this file into Postman to test all API endpoints with pre-configured requests and examples.

## WebSocket Support (Future)

The API is designed to support WebSocket connections for real-time updates in future versions:

```javascript
// Future WebSocket implementation
const socket = io('http://localhost:5000');

socket.on('verification-update', (data) => {
  console.log('Verification status updated:', data);
});

socket.on('new-entry', (data) => {
  console.log('New entry added:', data);
});
```

## Changelog

### Version 1.0.0
- Initial API release
- Basic CRUD operations for Artists, Raags, and Taals
- Web scraping and AI research integration
- Verification workflow endpoints
- Dashboard statistics
- Rate limiting implementation

---

**Note**: This API is designed for educational and research purposes. Ensure compliance with all applicable laws and website terms of service when using web scraping features.