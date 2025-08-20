# Deployment Guide

This guide provides professional deployment instructions for the Sangeet Restaurant website.

## Production Deployment

### Frontend Deployment (Netlify)

1. **Connect Repository**
   - Go to [Netlify](https://netlify.com)
   - Sign up/Login with GitHub
   - Click "New site from Git"
   - Select your repository

2. **Configure Build Settings**
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`

3. **Set Environment Variables**
   In Netlify dashboard → Site settings → Environment variables:
   ```
   REACT_APP_API_URL=https://sangeet-restaurant-api.onrender.com/api
   REACT_APP_SOCKET_URL=https://sangeet-restaurant-api.onrender.com
   ```

4. **Deploy**
   - Click "Deploy site"
   - Wait for build completion
   - Test the deployment

### Backend Deployment (Render)

1. **Connect Repository**
   - Go to [Render](https://render.com)
   - Sign up/Login with GitHub
   - Click "New Web Service"
   - Select your repository

2. **Configure Service**
   - **Name**: `sangeet-restaurant-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`

3. **Set Environment Variables**
   ```
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_secure_jwt_secret
   PORT=5001
   CLIENT_URL=https://your-frontend-url.netlify.app
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment
   - Test the API endpoints

## Environment Configuration

### Development
- Copy `frontend/env.example` to `frontend/.env`
- Copy `backend/env.example` to `backend/.env`
- Update with local development values

### Production
- Set environment variables in deployment platform dashboards
- Never commit `.env` files to version control
- Use secure, unique values for production

## Security Best Practices

1. **Environment Variables**
   - Use strong, unique secrets
   - Rotate secrets regularly
   - Never expose in client-side code

2. **Database Security**
   - Use connection pooling
   - Enable SSL connections
   - Regular backups

3. **API Security**
   - Enable CORS properly
   - Use HTTPS in production
   - Implement rate limiting

## Monitoring & Maintenance

1. **Health Checks**
   - Monitor API endpoints
   - Set up uptime monitoring
   - Configure error alerts

2. **Performance**
   - Monitor response times
   - Optimize database queries
   - Use CDN for static assets

3. **Updates**
   - Regular dependency updates
   - Security patches
   - Feature deployments

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify Node.js version
   - Review build logs

2. **API Connection Issues**
   - Verify CORS configuration
   - Check environment variables
   - Test API endpoints directly

3. **Database Issues**
   - Verify connection string
   - Check database permissions
   - Review migration scripts

### Support

For deployment issues:
1. Check platform documentation
2. Review build/deployment logs
3. Test locally first
4. Contact platform support if needed
