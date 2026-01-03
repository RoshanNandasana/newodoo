# Deployment Guide - HRMS Application

## Frontend (Already Deployed ✅)
**URL:** https://hrmanagement-mu-five.vercel.app/login
**Platform:** Vercel

## Backend Deployment on Render

### Step 1: Prepare MongoDB Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (if you don't have one)
3. Click "Connect" → "Connect your application"
4. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   ```
5. Replace `<username>`, `<password>`, and `<database>` with your actual credentials
6. **Important:** Go to "Network Access" → Add IP Address → Allow Access from Anywhere (`0.0.0.0/0`)

### Step 2: Deploy on Render

1. **Go to [Render.com](https://render.com/)** and sign in with GitHub

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect GitHub repository: `RoshanNandasana/newodoo`
   - Click "Connect"

3. **Configure Service:**
   ```
   Name: hrms-backend
   Region: Oregon (US West) or closest to you
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

4. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable" and add these:

   | Key | Value |
   |-----|-------|
   | `PORT` | `5000` |
   | `NODE_ENV` | `production` |
   | `FRONTEND_URL` | `https://hrmanagement-mu-five.vercel.app` |
   | `MONGODB_URI` | `your_mongodb_connection_string_from_step1` |
   | `JWT_SECRET` | `your_random_secure_string_here` |

   **For JWT_SECRET**, use a strong random string (minimum 32 characters). Example:
   ```
   hrms_jwt_secret_2026_production_change_this_to_random_string
   ```

5. **Click "Create Web Service"**
   - Wait 3-5 minutes for deployment
   - Render will automatically detect Node.js and install dependencies

6. **Copy Your Backend URL**
   - After deployment, copy the URL (e.g., `https://hrms-backend-xxxx.onrender.com`)

### Step 3: Update Frontend Environment Variable

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `hrmanagement-mu-five`
3. Go to "Settings" → "Environment Variables"
4. Update or add:
   ```
   Name: REACT_APP_API_URL
   Value: https://your-backend-url.onrender.com/api
   ```
5. Click "Save"
6. Go to "Deployments" → Click "..." on latest deployment → "Redeploy"

### Step 4: Create Admin User

After backend is deployed, create an admin user using the script:

1. In Render dashboard, go to your service
2. Click "Shell" (top right)
3. Run:
   ```bash
   cd backend
   node createAdmin.js
   ```
   Or use the provided credentials in your database.

### Step 5: Test Your Application

1. Visit: `https://hrmanagement-mu-five.vercel.app/login`
2. Login with admin credentials
3. Test all features

## 🔍 Troubleshooting

### Backend not responding
- Check Render logs: Dashboard → Your Service → Logs
- Verify environment variables are set correctly
- Ensure MongoDB IP whitelist includes `0.0.0.0/0`

### CORS errors
- Verify `FRONTEND_URL` in backend environment variables matches exactly
- Check browser console for specific error messages

### Database connection failed
- Verify MongoDB connection string format
- Check MongoDB Atlas network access settings
- Ensure database user has read/write permissions

### Frontend not connecting to backend
- Verify `REACT_APP_API_URL` in Vercel is correct
- Backend URL should end with `/api`
- Redeploy frontend after changing environment variables

## 📝 Important Notes

- **Free Tier Limitation:** Render free tier spins down after 15 minutes of inactivity
- **First Request:** May take 30-60 seconds to wake up the service
- **Environment Variables:** Never commit `.env` files to GitHub
- **MongoDB:** Use MongoDB Atlas (free tier M0) for production
- **Security:** Change JWT_SECRET to a strong random value

## 🔗 Quick Links

- Frontend: https://hrmanagement-mu-five.vercel.app/login
- Backend: (Add after deployment)
- GitHub Repo: https://github.com/RoshanNandasana/newodoo
- Render Dashboard: https://dashboard.render.com/
- Vercel Dashboard: https://vercel.com/dashboard

## 📧 Admin Credentials

After running `createAdmin.js`, you'll get credentials. Keep them secure!

Default from database:
- Email: admin@example.com (if already created)
- Password: (as set during creation)
