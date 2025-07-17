# Indian Classical Music Data Collection System

## Project Overview

A comprehensive web application for automated collection, verification, and management of Indian Classical Music metadata. The system combines web scraping, AI-powered research, and human verification workflows to create a centralized repository of verified musical information.

## 🎵 Features

### Core Functionality
- **Multi-Source Data Collection**: Automated scraping from 10+ specialized websites
- **AI-Powered Research**: Integration with OpenAI GPT-3.5 and Google Gemini
- **Verification Workflows**: Field-by-field verification with bulk operations
- **Real-Time Dashboard**: Comprehensive analytics and progress tracking
- **Responsive Design**: Modern UI with Tailwind CSS

### Data Categories
- **Artists**: Guru, Gharana, Achievements, Disciples
- **Raags**: Aroha, Avroha, Thaat, Vadi, Samvadi, Time of Rendition
- **Taals**: Beats, Divisions, Taali/Khaali positions, Jaati

## 🚀 Technology Stack

### Frontend
- **React.js 18.2.0** - Component-based UI
- **Tailwind CSS 3.3.3** - Utility-first styling
- **React Router 6.15.0** - Client-side routing
- **Axios 1.5.0** - HTTP client
- **React Toastify 9.1.3** - Notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js 4.18.2** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose 7.5.0** - ODM
- **OpenAI 5.9.0** - AI integration
- **Cheerio 1.0.0** - Web scraping

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- OpenAI API key (optional)
- Google Gemini API key (optional)

## 🛠️ Installation

### Backend Setup
```bash
# Clone repository
git clone <repository-url>
cd indian-classical-music-system

# Install backend dependencies
cd Server
npm install

# Configure environment
cp .env.development .env
# Edit .env with your configuration

# Start MongoDB
mongod

# Start backend server
npm run dev
```

### Frontend Setup
```bash
# Install frontend dependencies
cd Client
npm install

# Start development server
npm start
```

## 🔧 Configuration

### Environment Variables (.env)
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/indian-classical-music
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
PERPLEXITY_API_KEY=your_perplexity_api_key_here
NODE_ENV=development
```

## 📚 API Documentation

### Artist Endpoints
- `GET /api/artists/search` - Search artists
- `GET /api/artists` - Get all artists
- `GET /api/artists/:id` - Get specific artist
- `PUT /api/artists/:id` - Update artist
- `GET /api/artists/verified` - Get verified artists
- `GET /api/artists/stats` - Get statistics

### Raag Endpoints
- `GET /api/raags/search` - Search raags
- `GET /api/raags` - Get all raags
- `GET /api/raags/:id` - Get specific raag
- `PUT /api/raags/:id` - Update raag
- `GET /api/raags/verified` - Get verified raags
- `GET /api/raags/stats` - Get statistics

### Taal Endpoints
- `GET /api/taals/search` - Search taals
- `GET /api/taals` - Get all taals
- `GET /api/taals/:id` - Get specific taal
- `PUT /api/taals/:id` - Update taal
- `GET /api/taals/verified` - Get verified taals
- `GET /api/taals/stats` - Get statistics

## 🎯 Usage

### Search Operations
1. Navigate to Artists/Raags/Taals pages
2. Enter search term
3. Choose between Web Search or AI Research
4. Review and verify collected data

### Verification Workflow
1. Access verification pages from dashboard
2. Review individual fields
3. Use bulk operations for efficiency
4. Track progress with visual indicators

### Dashboard Analytics
- View overall statistics
- Monitor verification progress
- Track recent activity
- Analyze data quality

## ⚡ Rate Limiting

| Operation | Limit | Window |
|-----------|-------|--------|
| General API | 100 requests | 15 minutes |
| AI Research | 20 requests | 1 hour |
| Web Scraping | 10 requests | 15 minutes |
| Search | 20 requests | 10 minutes |
| Updates | 50 requests | 10 minutes |

## 🚫 Limitations

### Technical Constraints
- Cannot access closed/proprietary databases
- Limited by external website rate limits
- AI models have knowledge cutoff dates
- Dynamic content scraping limitations

### Data Quality
- Depends on source reliability
- Requires human verification
- May have incomplete information
- Subject to transliteration variations

### Legal Considerations
- Must comply with website terms of service
- Respects robots.txt files
- Fair use of scraped content
- Proper source attribution required

## 🔮 Future Enhancements

- Machine learning for data quality assessment
- Audio sample integration
- Mobile application development
- Multilingual support
- Advanced relationship mapping
- Real-time collaborative editing

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Indian Classical Music community for domain knowledge
- Open source contributors
- Wikipedia and other data sources
- OpenAI and Google for AI capabilities

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact: [your-email@example.com]
- Documentation: [project-documentation-url]

---

**Note**: This system is designed for educational and research purposes. Please ensure compliance with all applicable laws and website terms of service when using web scraping features.