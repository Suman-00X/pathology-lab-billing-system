#!/bin/bash

echo "🏥 Pathology Lab Billing Software Setup"
echo "======================================"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher first."
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. Please install MongoDB first."
    echo "   Visit: https://docs.mongodb.com/manual/installation/"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"
echo

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

# Create .env file for server if it doesn't exist
if [ ! -f "server/.env" ]; then
    echo "⚙️  Creating server/.env file..."
    
    # Generate a more secure random JWT secret for development
    JWT_SECRET="pathology-lab-$(date +%s)-$(openssl rand -hex 16 2>/dev/null || echo "fallback-secret-change-in-production")"
    
    cat > server/.env << EOL
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/pathology_lab_billing

# Security Configuration (IMPORTANT: Change this in production!)
JWT_SECRET=$JWT_SECRET

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# CORS Configuration
CLIENT_URL=http://localhost:3000
EOL
    echo "✅ Created server/.env file with random JWT secret"
    echo "⚠️  Remember to change JWT_SECRET to a secure value in production!"
fi

# Create uploads directory
mkdir -p server/uploads/logos

echo
echo "🎉 Installation completed successfully!"
echo

# Run environment check
echo "🔍 Running environment configuration check..."
npm run check-env

echo
echo "📋 Next steps:"
echo "   1. Make sure MongoDB is running: mongod"
echo "   2. Start the application: npm run dev"
echo "   3. Open your browser to: http://localhost:3000"
echo
echo "🔧 Additional commands:"
echo "   - Check environment: npm run check-env"
echo "   - Install dependencies: npm run install-all"
echo
echo "📖 For detailed instructions, see README.md" 