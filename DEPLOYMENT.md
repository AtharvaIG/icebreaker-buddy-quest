
# Deployment Guide for Icebreaker Game

This guide will help you deploy both the frontend and backend of the Icebreaker game so anyone can play it online.

## Step 1: Deploy the Backend (Python Flask + Socket.IO)

### Option 1: Deploy to Render.com

1. Create an account on [Render](https://render.com/) if you don't have one
2. Click "New" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - Name: icebreaker-backend
   - Environment: Python
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `cd backend && gunicorn -k eventlet -w 1 app:app`
   - Add the following environment variables:
     - SECRET_KEY: (your secret key)
     - FRONTEND_URL: (your frontend URL, e.g., https://your-frontend-app.netlify.app)
     - DEBUG: false

### Option 2: Deploy to Heroku

1. Create an account on [Heroku](https://heroku.com/) if you don't have one
2. Install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
3. Log in to Heroku: `heroku login`
4. Create a new Heroku app: `heroku create icebreaker-backend`
5. Set up environment variables:
   ```
   heroku config:set SECRET_KEY=your-secret-key
   heroku config:set FRONTEND_URL=your-frontend-url
   heroku config:set DEBUG=False
   ```
6. Move the Procfile to the project root (or create one with `web: cd backend && gunicorn -k eventlet -w 1 app:app`)
7. Deploy your app:
   ```
   git add .
   git commit -m "Prepare for Heroku deployment"
   git push heroku main
   ```

## Step 2: Deploy the Frontend (React + Vite)

### Option 1: Deploy to Netlify

1. Create an account on [Netlify](https://netlify.com/) if you don't have one
2. Click "Add new site" > "Import an existing project"
3. Connect your GitHub repository
4. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add the following environment variable:
   - VITE_BACKEND_URL: (your backend URL, e.g., https://icebreaker-backend.onrender.com)
6. Click "Deploy site"

### Option 2: Deploy to Vercel

1. Create an account on [Vercel](https://vercel.com/) if you don't have one
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add the following environment variable:
   - VITE_BACKEND_URL: (your backend URL)
6. Click "Deploy"

## Step 3: Update Cors Settings (if needed)

If you experience any CORS issues after deployment, make sure:

1. Your backend's CORS settings are correctly configured with your frontend URL
2. Your frontend is using the correct backend URL

## Step 4: Test Your Deployment

1. Open your deployed frontend URL
2. Create a new room and share the room code with friends
3. They should be able to join using the room code and play together

## Troubleshooting

- **WebSocket Connection Issues**: Make sure your hosting provider supports WebSockets (Render and Heroku both do)
- **CORS Errors**: Double-check the CORS configuration and make sure the frontend URL in your backend environment variables is correct
- **Socket.IO Version Mismatch**: Ensure the Socket.IO versions on frontend and backend are compatible

