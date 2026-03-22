# Fast Food Billing System - Backend API

A Node.js/Express backend API for a Fast Food Billing System with MySQL database integration.

## Features

- User authentication and registration
- Admin authentication
- Menu item management (CRUD operations)
- Shopping cart functionality
- Order management
- JWT-based authentication
- Password hashing with bcrypt
- MySQL database with prepared statements
- CORS enabled
- Error handling

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables

## Project Structure

```
backend/
├── config/
│   └── db.js              # Database configuration
├── controllers/
│   ├── authController.js  # Authentication logic
│   ├── itemController.js  # Item management
│   ├── cartController.js  # Cart operations
│   └── orderController.js # Order management
├── middleware/
│   └── auth.js            # Authentication middleware
├── routes/
│   ├── auth.js            # Auth routes
│   ├── items.js           # Item routes
│   ├── cart.js            # Cart routes
│   └── orders.js          # Order routes
├── .env                   # Environment variables
├── package.json           # Dependencies
├── server.js              # Main server file
└── README.md              # This file
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=fastfood_db
DB_PORT=3306

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Database Setup

Make sure your MySQL database `fastfood_db` exists with the following tables:

```sql
-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admins table
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Items table
CREATE TABLE items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart table
CREATE TABLE cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  grand_total DECIMAL(10,2) DEFAULT 0,
  status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);
```

### 4. Start the Server

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication

#### Register User
```http
POST /api/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "password123"
}
```

#### User Login
```http
POST /api/login
Content-Type: application/json

{
  "credential": "johndoe", // or email
  "password": "password123"
}
```

#### Admin Login
```http
POST /api/admin/login
Content-Type: application/json

{
  "credential": "admin",
  "password": "admin123"
}
```

### Items (Menu Management)

#### Get All Items
```http
GET /api/items
Authorization: Bearer <token>
```

#### Create Item (Admin Only)
```http
POST /api/items
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Classic Burger",
  "category": "Burgers",
  "price": 199.00,
  "image": "https://example.com/burger.jpg"
}
```

#### Update Item (Admin Only)
```http
PUT /api/items/1
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Deluxe Burger",
  "category": "Burgers",
  "price": 249.00,
  "image": "https://example.com/deluxe-burger.jpg"
}
```

#### Delete Item (Admin Only)
```http
DELETE /api/items/1
Authorization: Bearer <admin_token>
```

### Cart Management

#### Get User Cart
```http
GET /api/cart/1
Authorization: Bearer <token>
```

#### Add to Cart
```http
POST /api/cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": 1,
  "item_id": 1,
  "quantity": 2
}
```

#### Update Cart Item
```http
PUT /api/cart/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}
```

#### Remove from Cart
```http
DELETE /api/cart/1
Authorization: Bearer <token>
```

### Orders

#### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": 1,
  "items": [
    {
      "item_id": 1,
      "quantity": 2,
      "price": 199.00
    }
  ],
  "total": 398.00,
  "tax": 39.80,
  "discount": 0,
  "grand_total": 437.80
}
```

#### Get All Orders (Admin)
```http
GET /api/orders
Authorization: Bearer <admin_token>
```

#### Get User Orders
```http
GET /api/orders/user/1
Authorization: Bearer <token>
```

#### Update Order Status (Admin)
```http
PUT /api/orders/1
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "completed"
}
```

## Frontend Integration

### Authentication Example

```javascript
// Login
async function login(credential, password) {
  try {
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ credential, password })
    });

    const data = await response.json();

    if (data.success) {
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

// Make authenticated requests
async function makeAuthenticatedRequest(url, options = {}) {
  const token = localStorage.getItem('token');

  const defaultOptions = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  return fetch(url, { ...defaultOptions, ...options });
}

// Get items
async function getItems() {
  try {
    const response = await makeAuthenticatedRequest('http://localhost:5000/api/items');
    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Failed to fetch items:', error);
    throw error;
  }
}

// Add to cart
async function addToCart(userId, itemId, quantity) {
  try {
    const response = await makeAuthenticatedRequest('http://localhost:5000/api/cart', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, item_id: itemId, quantity })
    });

    const data = await response.json();

    if (data.success) {
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Failed to add to cart:', error);
    throw error;
  }
}

// Create order
async function createOrder(orderData) {
  try {
    const response = await makeAuthenticatedRequest('http://localhost:5000/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });

    const data = await response.json();

    if (data.success) {
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Failed to create order:', error);
    throw error;
  }
}
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Prepared statements to prevent SQL injection
- CORS enabled for cross-origin requests
- Input validation
- Admin role-based access control

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Environment Variables

- `DB_HOST` - MySQL host (default: localhost)
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - Database name (fastfood_db)
- `DB_PORT` - MySQL port (default: 3306)
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

## License

ISC