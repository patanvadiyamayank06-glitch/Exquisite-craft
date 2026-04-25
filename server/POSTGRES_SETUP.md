# PostgreSQL Migration Guide (Neon)

This project has been migrated from MongoDB to PostgreSQL using Neon.

## Setup Instructions

### 1. Create a Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Sign up or log in
3. Create a new project
4. Copy your connection string (it looks like: `postgresql://username:password@host/database?sslmode=require`)

### 2. Configure Environment Variables

Update your `server/.env` file with your Neon connection string:

```env
PORT=5000
DATABASE_URL=your_neon_connection_string_here
JWT_SECRET=dev_secret_change_me
```

### 3. Install Dependencies

```bash
cd server
npm install
```

### 4. Start the Server

The database tables will be created automatically when you start the server:

```bash
npm start
```

### 5. Create Admin User (Optional)

```bash
node src/seed/createAdmin.js
```

This creates an admin user:
- Email: `admin@exquisitecraft.com`
- Password: `admin123`

## Database Schema

The following tables are created automatically:

- **users** - User accounts with authentication
- **products** - Product catalog
- **reviews** - Product reviews
- **cart_items** - Shopping cart items
- **orders** - Customer orders
- **order_items** - Items in each order
- **wishlist_items** - User wishlist

## Migration Changes

- Replaced `mongoose` with `pg` (node-postgres)
- Changed from document-based to relational database
- Updated all models to use SQL queries
- Maintained the same API endpoints and functionality
- Auto-incrementing IDs instead of MongoDB ObjectIds
- Foreign key relationships for data integrity

## Notes

- All timestamps are handled by PostgreSQL (`created_at`, `updated_at`)
- SSL is enabled by default for Neon connections
- Connection pooling is configured automatically
