@echo off
echo 🚀 MediChain+ Vercel Deployment
echo ======================================

echo.
echo Step 1: Deploy Backend
echo ----------------------
cd backend
call vercel --prod
echo.
echo ⚠️  IMPORTANT: After deployment, add environment variables in Vercel Dashboard:
echo    MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, etc.
echo.
cd ..

echo.
echo Step 2: Deploy Frontend  
echo -----------------------
cd frontend
call vercel --prod
echo.
echo ⚠️  IMPORTANT: Set VITE_BACKEND_URL in Vercel Dashboard with your backend URL
echo.
cd ..

echo.
echo Step 3: Deploy Admin Panel
echo --------------------------
cd admin
call vercel --prod
echo.
echo ⚠️  IMPORTANT: Set VITE_BACKEND_URL in Vercel Dashboard with your backend URL
echo.
cd ..

echo.
echo ✅ Deployment commands completed!
echo Check your Vercel dashboard for live URLs
pause

