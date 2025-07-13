# Indian Classical Music API - Testing Guide

## Postman Collection

This repository includes a comprehensive Postman collection for testing the Indian Classical Music backend API.

### Setup Instructions

1. **Import the Collection**:
   - Open Postman
   - Click "Import" button
   - Select the `postman-collection.json` file
   - The collection will be imported with all endpoints

2. **Set Environment Variables**:
   - The collection uses a variable `{{baseUrl}}` set to `http://localhost:5000`
   - You can modify this in the collection variables if your server runs on a different port

3. **Configure OpenAI API Key**:
   - Add your OpenAI API key to the `.env` file
   - Replace `your_openai_api_key_here` with your actual API key

### Available Endpoints

#### Artists API
- **Search Artist (Web Scraping)**: `GET /api/artists/search?name=Zakir Hussain&useAI=false`
- **Search Artist (AI Research)**: `GET /api/artists/search?name=Ravi Shankar&useAI=true`
- **Get All Artists**: `GET /api/artists`
- **Get Artist by ID**: `GET /api/artists/{id}`
- **Update Artist**: `PUT /api/artists/{id}`

#### Raags API
- **Search Raag (Web Scraping)**: `GET /api/raags/search?name=Yaman&useAI=false`
- **Search Raag (AI Research)**: `GET /api/raags/search?name=Bhairav&useAI=true`
- **Get All Raags**: `GET /api/raags`
- **Get Raag by ID**: `GET /api/raags/{id}`
- **Update Raag**: `PUT /api/raags/{id}`

#### Taals API
- **Search Taal (Web Scraping)**: `GET /api/taals/search?name=Teentaal&useAI=false`
- **Search Taal (AI Research)**: `GET /api/taals/search?name=Jhaptaal&useAI=true`
- **Get All Taals**: `GET /api/taals`
- **Get Taal by ID**: `GET /api/taals/{id}`
- **Update Taal**: `PUT /api/taals/{id}`

### Testing Workflow

1. **Start with Search Endpoints**:
   - Test both AI and non-AI search for each entity type
   - Note the returned IDs for further testing

2. **Test CRUD Operations**:
   - Use the IDs from search results to test GET by ID
   - Test UPDATE endpoints with sample data

3. **Verify Data Structure**:
   - Each field should have `value`, `reference`, and `verified` properties
   - Sources should be included for AI research results

### Sample Test Data

The collection includes realistic test data for:
- **Artists**: Zakir Hussain, Ravi Shankar
- **Raags**: Yaman, Bhairav
- **Taals**: Teentaal, Jhaptaal

### Expected Responses

#### Successful Search Response
```json
{
  "_id": "...",
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
  // ... other fields
}
```

#### Error Response
```json
{
  "message": "Error description"
}
```

### Troubleshooting

1. **AI Research Not Working**:
   - Verify OpenAI API key is correctly set in `.env`
   - Check server logs for detailed error messages

2. **Database Connection Issues**:
   - Ensure MongoDB is running and connection string is correct

3. **CORS Issues**:
   - The server includes CORS middleware for cross-origin requests

### Notes

- AI research requires a valid OpenAI API key and internet connection
- Web scraping mode returns empty data with explanatory messages
- All endpoints include proper error handling and validation