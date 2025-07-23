#!/bin/bash

echo "🔧 Setting up Development Environment"
echo "===================================="

# Create server .env file if it doesn't exist
if [ ! -f "server/.env" ]; then
    echo "📝 Creating server/.env file..."
    cat > server/.env << EOL
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/pathology_lab_billing

# Security Configuration (IMPORTANT: Change this in production!)
JWT_SECRET=pathology-lab-dev-secret-change-in-production

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# CORS Configuration
CLIENT_URL=http://localhost:3000
EOL
    echo "✅ Created server/.env file"
else
    echo "✅ server/.env file already exists"
fi

# Create uploads directory if it doesn't exist
mkdir -p server/uploads/logos

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure MongoDB is running on localhost:27017"
echo "2. Start the server: npm run server"
echo "3. Start the client: npm run client"
echo "4. Or run both: npm run dev"
echo ""
echo "🌐 Server will run on: http://localhost:5000"
echo "🌐 Client will run on: http://localhost:3000" 