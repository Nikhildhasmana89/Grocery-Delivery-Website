# 🛒 Freshkart – Grocery Delivery Website

**Live Demo:** https://freshkart-git-main-white-bot.vercel.app/

Freshkart is a full-stack grocery delivery website where users can browse grocery products, search for items, filter products by category, add products to their cart, place orders, and manage their orders. The application also provides separate functionality for Admin and Delivery Partners so the complete grocery delivery process can be managed from one platform.

The user starts by visiting the Freshkart website, where they can see different grocery products such as fruits and vegetables, dairy and eggs, bakery products, meat and seafood, snacks and beverages, pantry items, frozen foods, health and wellness products, baby care products, and household essentials. Users can search for products using the search bar and filter products according to their category. Each product contains information such as its name, price, unit, and image.

Users can add products to their cart, increase or decrease the quantity, remove products, and proceed to checkout. After placing an order, users can open the Manage Orders section to see their previous and current orders and check the status of their orders.

Freshkart also has an Admin Dashboard. Admins can manage products, users, orders, and delivery partners. The admin can add new products, update existing products, delete products, and manage product images. Product images are uploaded to Cloudinary, while the image URL and product information are stored in MongoDB. Admins can also assign orders to delivery partners so that the order can be delivered to the customer.

Delivery Partners have their own workflow where they can view the orders assigned to them, update the order status, and communicate with customers. The application uses Socket.IO for real-time communication, allowing customers and delivery partners to exchange messages without refreshing the page.

Freshkart also includes an AI-powered suggestion feature using the Gemini API. The AI Suggest feature can provide quick and context-aware reply suggestions inside the chat system. This helps users and delivery partners communicate more easily and quickly.

The application uses authentication and role-based access control (RBAC) to provide different permissions for Users, Admins, and Delivery Partners. JWT is used for authentication and protected areas of the application.

To improve performance, Freshkart uses product caching so that product information does not need to be fetched from MongoDB unnecessarily on every request. Products can be loaded from the cache after the initial request, making product browsing and category filtering faster.

The website also includes a Light/Dark Mode for the user-facing section. Users can switch between themes, and their selected theme is stored so that it remains after refreshing the website. The Admin Dashboard remains independent from the user theme.

Freshkart is built using modern full-stack technologies. The frontend uses Next.js, React, TypeScript, and Tailwind CSS. The backend uses Node.js, Express.js, and REST APIs. MongoDB with Mongoose is used as the database. Socket.IO is used for real-time communication, Cloudinary is used for product image storage, Gemini API is used for AI suggestions, and JWT is used for authentication.

The overall order process works like this:

User browses products → searches or filters products → adds products to cart → checkout → places order → Admin receives order → Admin assigns delivery partner → Delivery Partner receives order → Delivery Partner updates order status → User tracks the order and communicates with the delivery partner through real-time chat.

## 🛠️ Technologies Used

- Next.js
- React.js
- TypeScript
- Tailwind CSS
- Node.js
- Express.js
- MongoDB
- Mongoose
- REST API
- Socket.IO
- WebSockets
- JWT Authentication
- RBAC
- Cloudinary
- Gemini API
- Docker
- Postman

## 🚀 Main Features

- User registration and login
- JWT authentication
- Role-based access control
- Product browsing
- Product search
- Category filtering
- Shopping cart
- Checkout
- Order placement
- Order management
- Order status tracking
- User profile management
- Delivery address management
- Admin product management
- Admin user management
- Admin order management
- Delivery partner management
- Order assignment
- Real-time customer and delivery partner chat
- Gemini AI-powered chat suggestions
- Cloudinary product image management
- Product caching for better performance
- Light/Dark Mode
- Responsive design for desktop and mobile

## ⚙️ How to Run the Project

First clone the project and install the dependencies:

```bash
git clone https://github.com/Nikhildhasmana89/Grocery-Delivery-Website
cd freshkart
npm install
````

Create a `.env.local` file and add the required environment variables:

```env
MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

GEMINI_API_KEY=your_gemini_api_key
```

Then start the development server:

```bash
npm run dev
```

Open the application in your browser:

```text
http://localhost:3000
```

## 📌 Project Purpose

Freshkart was developed as a complete grocery delivery platform to demonstrate full-stack web development skills, including frontend development, backend APIs, database management, authentication, role-based access control, real-time communication, cloud image storage, AI integration, caching, and order management.



