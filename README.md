﻿# SPD-E_COMMERCE



#  Full-Stack E-Commerce Platform

A responsive full-stack e-commerce web application built using the MERN stack. This project simulates a complete shopping experience with 30+ sample products, secure user registration, and real-time session-based interactions.

## 🚀 Features

- 30+ sample products for browsing and purchasing
- Secure user authentication with registration and login
- RESTful APIs managing 6 MongoDB collections:
  - `Users`, `Products`, `Categories`, `Orders`, `Carts`, `Reviews`
- Dynamic product management with full CRUD operations
- Session handling using Express.js for persistent user state
- Fully responsive design for all screen sizes

## 🛠 Tech Stack

- **Frontend:** HTML, CSS, JavaScript *(React if used)*
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** Sessions and cookies *(or JWT if applicable)*

## 📦 Installation & Setup

### Prerequisites
- Node.js and npm
- MongoDB (local or MongoDB Atlas)

### Steps

# 1. Clone the repo
git clone https://github.com/your-username/ecommerce-platform.git
cd ecommerce-platform

# 2. Install backend dependencies
cd backend
npm install

# 3. Set up environment variables
# Create a .env file with the following:
# MONGO_URI=your_mongodb_uri
# SESSION_SECRET=your_session_secret
# PORT=5000

# 4. Run the backend server
npm start

Optional: Frontend Setup

cd frontend
npm install
npm start

🧪 Example API Endpoints

Method	Endpoint	Description
POST	/api/register	User registration
POST	/api/login	User login
GET	/api/products	Get all products
POST	/api/products	Add a new product
PUT	/api/products/:id	Update a product
DELETE	/api/products/:id	Delete a product
GET	/api/cart	Get cart contents
POST	/api/orders	Place an order

📁 Folder Structure

ecommerce-platform/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── frontend/ (if applicable)
│   └── src/
├── README.md
└── package.json





