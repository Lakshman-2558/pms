#!/bin/bash

echo "🚀 MediChain+ Vercel Deployment Script"
echo "======================================"

# Install Vercel CLI if not installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy Backend
echo ""
echo "🔧 Deploying Backend..."
cd backend
vercel --prod --yes
BACKEND_URL=$(vercel ls | grep backend | head -1 | awk '{print $2}' || echo "")
echo "Backend URL: $BACKEND_URL"
cd ..

# Deploy Frontend
echo ""
echo "🎨 Deploying Frontend..."
cd frontend
vercel --prod --yes
FRONTEND_URL=$(vercel ls | grep frontend | head -1 | awk '{print $2}' || echo "")
echo "Frontend URL: $FRONTEND_URL"
cd ..

# Deploy Admin
echo ""
echo "⚙️ Deploying Admin Panel..."
cd admin
vercel --prod --yes
ADMIN_URL=$(vercel ls | grep admin | head -1 | awk '{print $2}' || echo "")
echo "Admin URL: $ADMIN_URL"
cd ..

echo ""
echo "✅ Deployment Complete!"
echo "Backend: $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"
echo "Admin: $ADMIN_URL"

