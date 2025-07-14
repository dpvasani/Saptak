# Installation Guide - Indian Classical Music Data Collection System

## System Requirements

### Minimum Requirements
- **Operating System**: Windows 10, macOS 10.14, or Ubuntu 18.04+
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Network**: Stable internet connection for web scraping and AI features

### Software Prerequisites
- **Node.js**: Version 16.0.0 or higher
- **MongoDB**: Version 4.4 or higher
- **Git**: Latest version
- **Code Editor**: VS Code recommended

## Step-by-Step Installation

### 1. Install Node.js

#### Windows/macOS
1. Visit [nodejs.org](https://nodejs.org/)
2. Download the LTS version
3. Run the installer and follow instructions
4. Verify installation:
```bash
node --version
npm --version
```

#### Ubuntu/Linux
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Install MongoDB

#### Windows
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Choose "Complete" installation
4. Install MongoDB as a service
5. Start MongoDB service

#### macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

#### Ubuntu/Linux
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 3. Clone the Repository

```bash
git clone https://github.com/your-username/indian-classical-music-system.git
cd indian-classical-music-system
```

### 4. Backend Setup

```bash
# Navigate to server directory
cd Server

# Install dependencies
npm install

# Create environment file
cp .env.development .env
```

### 5. Configure Environment Variables

Edit the `.env` file with your configuration:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/indian-classical-music

# AI API Keys (Optional but recommended)
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Security
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here

# Web Scraping Configuration
WHITELISTED_SITES=https://oceanofragas.com/,https://wikipedia.org/
```

### 6. Frontend Setup

```bash
# Navigate to client directory (from project root)
cd Client

# Install dependencies
npm install
```

### 7. Start the Application

#### Terminal 1 - Backend Server
```bash
cd Server
npm run dev
```

#### Terminal 2 - Frontend Development Server
```bash
cd Client
npm start
```

### 8. Verify Installation

1. Backend should be running on `http://localhost:5000`
2. Frontend should be running on `http://localhost:3000`
3. MongoDB should be accessible at `mongodb://localhost:27017`

## API Keys Setup (Optional)

### OpenAI API Key
1. Visit [platform.openai.com](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Add to `.env` file as `OPENAI_API_KEY`

### Google Gemini API Key
1. Visit [ai.google.dev](https://ai.google.dev/)
2. Sign in with Google account
3. Create a new project
4. Enable Gemini API
5. Generate API key
6. Add to `.env` file as `GEMINI_API_KEY`

## Database Setup

### Create Database
MongoDB will automatically create the database when first accessed. No manual setup required.

### Verify Database Connection
```bash
# Connect to MongoDB shell
mongosh

# List databases
show dbs

# Use your database
use indian-classical-music

# List collections (should be empty initially)
show collections
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Kill process on port 5000
npx kill-port 5000
```

#### MongoDB Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

#### Node Modules Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

#### Permission Issues (Linux/macOS)
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### Environment-Specific Issues

#### Windows
- Ensure Windows Defender doesn't block Node.js
- Run Command Prompt as Administrator if needed
- Use PowerShell for better compatibility

#### macOS
- Install Xcode Command Line Tools: `xcode-select --install`
- Use Homebrew for package management
- Check firewall settings for local development

#### Linux
- Ensure all required packages are installed
- Check firewall settings: `sudo ufw status`
- Verify user permissions for MongoDB data directory

## Development Tools (Optional)

### Recommended VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- MongoDB for VS Code
- Thunder Client (API testing)

### Database GUI Tools
- **MongoDB Compass** (Official GUI)
- **Robo 3T** (Lightweight GUI)
- **Studio 3T** (Advanced features)

## Production Deployment

### Environment Variables for Production
```bash
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db-url
PORT=80
```

### Build Commands
```bash
# Build frontend
cd Client
npm run build

# Start production server
cd Server
npm start
```

### Process Management (Linux)
```bash
# Install PM2
npm install -g pm2

# Start application with PM2
pm2 start server.js --name "indian-classical-music"

# Save PM2 configuration
pm2 save
pm2 startup
```

## Security Considerations

### API Keys
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate API keys regularly

### Database Security
- Enable MongoDB authentication in production
- Use strong passwords
- Configure firewall rules
- Enable SSL/TLS encryption

### Network Security
- Use HTTPS in production
- Configure CORS properly
- Implement rate limiting
- Use secure headers

## Performance Optimization

### Database Optimization
```javascript
// Create indexes for better performance
db.artists.createIndex({ "name.value": "text" })
db.raags.createIndex({ "name.value": "text" })
db.taals.createIndex({ "name.value": "text" })
```

### Frontend Optimization
- Enable gzip compression
- Optimize images and assets
- Use CDN for static files
- Implement caching strategies

### Backend Optimization
- Use connection pooling
- Implement caching (Redis)
- Optimize database queries
- Use clustering for multiple cores

## Backup and Recovery

### Database Backup
```bash
# Create backup
mongodump --db indian-classical-music --out /path/to/backup

# Restore backup
mongorestore --db indian-classical-music /path/to/backup/indian-classical-music
```

### Application Backup
- Backup source code regularly
- Version control with Git
- Backup environment configurations
- Document custom modifications

## Support and Resources

### Documentation
- [Node.js Documentation](https://nodejs.org/docs/)
- [React Documentation](https://reactjs.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)

### Community Support
- GitHub Issues for bug reports
- Stack Overflow for technical questions
- MongoDB Community Forums
- React Community Discord

### Professional Support
- MongoDB Atlas for managed database
- Vercel/Netlify for frontend hosting
- AWS/Google Cloud for full deployment
- Professional consulting services

---

**Note**: This installation guide assumes a development environment. For production deployment, additional security and performance considerations apply.