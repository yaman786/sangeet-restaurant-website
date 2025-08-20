# Sangeet Restaurant Website

A modern restaurant management system with online ordering, QR code menus, and real-time order tracking.

## Features

- **QR Code Menu System** - Customers can scan QR codes to view menus
- **Online Ordering** - Real-time order placement and tracking
- **Admin Dashboard** - Complete restaurant management interface
- **Kitchen Display** - Real-time order updates for kitchen staff
- **Reservation System** - Table booking and management
- **Review System** - Customer feedback and ratings

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Socket.IO
- **Backend**: Node.js, Express.js, PostgreSQL
- **Deployment**: Netlify (Frontend), Render (Backend)

## Environment Variables

### Frontend (.env)
```env
REACT_APP_API_URL=https://sangeet-restaurant-api.onrender.com/api
REACT_APP_SOCKET_URL=https://sangeet-restaurant-api.onrender.com
```

### Backend (.env)
```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
PORT=5001
```

## Deployment

### Frontend (Netlify)
1. Connect your GitHub repository to Netlify
2. Set build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `build`
3. Set environment variables in Netlify dashboard
4. Deploy

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Set environment variables in Render dashboard
5. Deploy

## Development

### Frontend
```bash
cd frontend
npm install
npm start
```

### Backend
```bash
cd backend
npm install
npm start
```

## API Documentation

The API is documented with the following endpoints:
- `/api/menu` - Menu management
- `/api/orders` - Order management
- `/api/tables` - Table and QR code management
- `/api/reservations` - Reservation system
- `/api/auth` - Authentication
- `/api/reviews` - Review system

## License

This project is proprietary software for Sangeet Restaurant. 