#!/bin/bash

# CharityOnMe Setup Script
echo "🚀 Setting up CharityOnMe Donation Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📋 Creating environment file..."
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo ""
    echo "🔧 IMPORTANT: You need to edit .env with your actual Stripe API keys!"
    echo ""
    echo "Required steps:"
    echo "1. Go to https://dashboard.stripe.com/apikeys"
    echo "2. Copy your Publishable key and Secret key"
    echo "3. Set up a webhook at https://dashboard.stripe.com/webhooks"
    echo "4. Edit the .env file with your actual keys"
    echo ""
else
    echo "⚠️  .env file already exists"
fi

# Check if required environment variables are set
if grep -q "your_.*_key_here" .env; then
    echo "⚠️  WARNING: Your .env file still contains placeholder values!"
    echo "   Please update with your actual Stripe API keys before running."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your Stripe API keys"
echo "2. Run: npm start"
echo "3. Visit: http://localhost:3000"
echo ""
echo "For detailed instructions, see README.md"