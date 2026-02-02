# Campus Connect 🎓

A full-stack campus marketplace web application for JIITians to buy, sell, and offer services within the campus community.

## Features

✨ **User Authentication** - Login/Signup with college email
🛍️ **Marketplace** - Browse listings by category
📝 **Create Posts** - Sell products, offer services, or request items
👤 **User Profiles** - View user listings and ratings
🔍 **Search & Filter** - Find what you need quickly
📱 **Responsive Design** - Works on desktop and mobile

## Tech Stack

**Frontend:**
- HTML5
- CSS3 (Custom styling matching Figma design)
- Vanilla JavaScript

**Backend:**
- Node.js
- Express.js
- JSON file-based data storage

## Setup Instructions

### 1. Install Dependencies

```bash
cd campus-connect
npm install
```

### 2. Start the Server

```bash
npm start
```

The server will run on `http://localhost:3000`

### 3. Access the Application

Open your browser and go to: `http://localhost:3000`

**Demo Credentials:**
- Email: `demo@jiit.ac.in`
- Password: `demo123`

## Project Structure

```
campus-connect/
├── public/
│   ├── css/
│   │   └── style.css          # All styles
│   ├── js/
│   │   ├── login.js           # Login logic
│   │   ├── marketplace.js     # Marketplace logic
│   │   ├── detail.js          # Listing detail logic
│   │   ├── create-post.js     # Create post logic
│   │   └── profile.js         # Profile logic
│   ├── login.html             # Login page
│   ├── marketplace.html       # Marketplace page
│   ├── detail.html            # Listing detail page
│   ├── create-post.html       # Create post page
│   └── profile.html           # Profile page
├── server/
│   └── server.js              # Backend API server
├── data/
│   ├── users.json             # User data
│   └── listings.json          # Listing data
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/signup` - User registration

### Listings
- `GET /api/listings` - Get all listings (with optional category/search filters)
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create new listing

### Users
- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/listings` - Get user's listings

## Features Breakdown

### Pages

1. **Login Page** (`/login.html`)
   - Email/password authentication
   - Demo credentials option
   - Link to signup

2. **Marketplace** (`/marketplace.html`)
   - Category filtering (All, Books, Academic, Services, etc.)
   - Search functionality
   - Listing cards with seller info
   - FAB to create new post

3. **Listing Detail** (`/detail.html`)
   - Full listing information
   - Seller profile card
   - Safety tips
   - Contact seller button

4. **Create Post** (`/create-post.html`)
   - Multiple post types (Sell, Buy, Offer Service, Request, Rental)
   - Category selection
   - Image URL upload
   - Location and availability options

5. **Profile** (`/profile.html`)
   - User information
   - User's active listings
   - Quick actions
   - Logout option

## Customization

### Adding New Categories
Edit the category options in:
- `public/marketplace.html` (category tabs)
- `public/create-post.html` (category dropdown)

### Changing Colors
Update CSS variables in `public/css/style.css`:
```css
:root {
  --primary-green: #10b981;
  --primary-dark: #059669;
  /* ... other colors */
}
```

### Database Migration
Currently using JSON files for simplicity. To migrate to a real database:
1. Replace file operations in `server/server.js`
2. Use MongoDB, PostgreSQL, or MySQL
3. Update CRUD operations accordingly

## Future Enhancements

- 🔐 Proper authentication with JWT tokens
- 📧 Email verification
- 💬 Real-time messaging between buyers/sellers
- 📷 Image upload functionality
- ⭐ Rating and review system
- 🔔 Notifications
- 📊 Analytics dashboard
- 🗄️ Migrate to real database (MongoDB/PostgreSQL)

## Development Notes

- Data is stored in `/data` folder as JSON files
- Server resets data on restart if files are deleted
- No actual email sending (would need SMTP setup)
- Images use placeholder URLs (would need cloud storage like Cloudinary)

## Support

For issues or questions, please contact the development team.

---

**Built with ❤️ for the JIIT campus community**
