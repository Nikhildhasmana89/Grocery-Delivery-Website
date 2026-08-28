# 🛒 Freshkart – Full-Stack Grocery Delivery Platform

Freshkart is a full-stack grocery delivery platform built to provide a complete online grocery shopping and delivery experience. Users can browse grocery products, search and filter products, add products to their cart, place orders, manage their orders, communicate with delivery partners in real time, and receive AI-powered chat suggestions.

The platform is designed with three main roles: **User, Admin, and Delivery Partner**. Each role has its own functionality and permissions using authentication and Role-Based Access Control (RBAC).

The user-facing website provides grocery products across categories such as Fruits & Vegetables, Dairy & Eggs, Bakery & Bread, Meat & Seafood, Snacks & Beverages, Pantry & Staples, Frozen Foods, Health & Wellness, Baby Care, and Household Essentials. Users can search products by name or category, filter products, view product details, add products to their cart, update quantities, remove products, checkout, and place orders.

After placing an order, users can access the Manage Orders section to view their orders and track their current status. The Admin Dashboard allows administrators to manage products, users, orders, and delivery partners. Admins can add, update, and delete products, manage product images, view orders, and assign orders to delivery partners.

Delivery Partners have a dedicated workflow where they can view assigned orders and update the order status as the delivery progresses. Users and delivery partners can communicate through a real-time chat system.

Freshkart uses a **separate Socket Server with Socket.IO** for real-time communication. The Socket Server independently handles socket connections and real-time messaging between users and delivery partners. This allows messages to be delivered instantly without refreshing the website.

The real-time communication flow works like this:

```text
User
  │
  │ Socket Connection
  ▼
Dedicated Socket Server
  │
  │ Socket.IO
  ▼
Delivery Partner
````

Freshkart also integrates the **Gemini API** to provide an AI-powered "AI Suggest" feature inside the chat system. The AI analyzes the conversation context and provides useful quick-reply suggestions, allowing users and delivery partners to respond faster.

Product images are managed using **Cloudinary**. When a product image is uploaded, the image is stored on Cloudinary and its URL is saved with the product information in MongoDB. This allows the frontend and Admin Dashboard to display the same product images using the stored Cloudinary URL.

The application uses **MongoDB and Mongoose** for storing users, products, carts, orders, and other application data. Authentication is implemented using **Auth.js/JWT-based authentication**, while RBAC is used to control access between Users, Admins, and Delivery Partners.

Freshkart also integrates **Google authentication** for user login and uses **Stripe** for payment-related functionality and webhook handling.

To improve performance, Freshkart uses product caching to reduce unnecessary database requests. Product data can be loaded into the cache and reused for product browsing, searching, and category filtering instead of repeatedly requesting the same data from MongoDB.

The user section also supports **Light and Dark Mode**. Users can switch between themes and their selected preference is stored locally. The theme applies only to the user-facing section and does not change the Admin Dashboard.

The complete Freshkart order workflow is:

```text
                    USER
                      │
                      ▼
              Browse Products
                      │
                      ▼
              Search / Filter
                      │
                      ▼
                 Add to Cart
                      │
                      ▼
                  Checkout
                      │
                      ▼
                Place Order
                      │
                      ▼
                    ADMIN
                      │
                      ▼
             Manage New Order
                      │
                      ▼
          Assign Delivery Partner
                      │
                      ▼
              DELIVERY PARTNER
                      │
                      ▼
             Receive Assignment
                      │
                      ▼
            Update Order Status
                      │
                      ▼
                    USER
                      │
             ┌────────┴────────┐
             ▼                 ▼
        Track Order       Real-Time Chat
                               │
                               ▼
                       Socket Server
                               │
                               ▼
                       Socket.IO
```

## 🚀 Main Features

### User

* User registration and login
* Google authentication
* Secure authentication
* Role-Based Access Control
* Browse grocery products
* Search products
* Category filtering
* Product details
* Add products to cart
* Increase/decrease product quantity
* Remove products from cart
* Checkout
* Place orders
* Manage Orders
* View order details
* Track order status
* Manage user profile
* Manage delivery addresses
* Real-time chat with delivery partners
* AI-powered chat suggestions
* Light/Dark Mode
* Responsive UI

### Admin

* Admin authentication
* Admin Dashboard
* Product management
* Add products
* Update products
* Delete products
* Product image management
* User management
* Order management
* Delivery partner management
* Assign orders to delivery partners
* Monitor order status

### Delivery Partner

* Delivery partner authentication
* View assigned orders
* Manage assigned deliveries
* Update order status
* Communicate with customers
* Real-time chat
* AI-powered quick suggestions

### AI

* Gemini API integration
* AI Suggest feature
* Context-aware suggestions
* Quick reply generation
* Integrated directly into the chat system

### Real-Time Communication

* Dedicated Socket Server
* Socket.IO
* WebSocket-based communication
* Real-time customer/delivery partner chat
* Instant message delivery
* No page refresh required

### Product Management

* Product categories
* Product search
* Product filtering
* Product caching
* Cloudinary image storage
* MongoDB product storage

### Payment

* Stripe integration
* Stripe webhook support
* Secure payment-related backend handling

---

## 🛠️ Technologies Used

```text
Frontend
├── Next.js
├── React.js
├── TypeScript
└── Tailwind CSS

Backend
├── Node.js
├── Express.js
├── REST APIs
└── Mongoose

Database
└── MongoDB

Authentication
├── Auth.js
├── JWT
├── Google OAuth
└── RBAC

Real-Time Communication
├── Socket.IO
├── WebSockets
└── Dedicated Socket Server

AI
└── Google Gemini API

Images
└── Cloudinary

Payments
└── Stripe

DevOps
├── Docker
└── Docker Compose

Development / Testing
├── Git
├── GitHub
└── Postman
```


---

# 🔐 Environment Variables

Create the required environment files before running Freshkart.

**Never commit your real `.env` values to GitHub.**

The project uses the following environment variables:

```env
# MongoDB
MONGODB_URL=your_mongodb_connection_string

# Authentication
AUTH_SECRET=your_auth_secret
AUTH_URL=http://localhost:3000

# Google Authentication
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_URL=your_cloudinary_url

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Application
NEXT_BASE_URL=http://localhost:3000

# Socket Server
NEXT_PUBLIC_SOCKET_SERVER=your_socket_server_url
NEXT_PUBLIC_SOCKET_URL=your_socket_server_url

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

Use the **exact variable names required by the current project configuration**.

For production, replace the localhost URLs with the deployed frontend and Socket Server URLs.

For example:

```env
AUTH_URL=https://your-production-domain.com

NEXT_BASE_URL=https://your-production-domain.com

NEXT_PUBLIC_SOCKET_URL=https://your-socket-server-domain.com
```

---

# 🐳 Docker

Freshkart supports Docker for containerized development and deployment.

Docker helps keep the application environment consistent across different machines.

If Docker Compose is configured in the project, start the application using:

```bash
docker compose up --build
```

To run the containers in the background:

```bash
docker compose up -d --build
```

To stop the containers:

```bash
docker compose down
```

To rebuild the containers:

```bash
docker compose build --no-cache
```

If the project uses a standalone Dockerfile, build the image using:

```bash
docker build -t freshkart .
```

Then run it using:

```bash
docker run -p 3000:3000 freshkart
```

Make sure all required environment variables are configured before starting the containers.

---

# ⚙️ Local Development

Clone the repository:

```bash
git clone https://github.com/Nikhildhasmana89/Grocery-Delivery-Website
```

Navigate to the project:

```bash
cd freshkart
```

Install dependencies:

```bash
npm install
```

Create the required environment file:

```text
.env.local
```

Add your environment variables and then start the application:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:3000
```

If the Socket Server runs separately, start the Socket Server using its configured development command.

---

# 🔌 Socket Server

Freshkart uses a dedicated Socket Server instead of handling all real-time communication directly inside the main application.

The Socket Server is responsible for:

* Creating Socket.IO connections
* Managing connected users
* Managing delivery partner connections
* Sending messages in real time
* Receiving messages
* Handling chat events
* Supporting customer/delivery partner communication

The architecture is:

```text
                    Frontend
                       │
                       │
                Socket Connection
                       │
                       ▼
              ┌─────────────────┐
              │  Socket Server  │
              │   Socket.IO     │
              └────────┬────────┘
                       │
                Real-Time Events
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
           User          Delivery Partner
```

This separation allows the real-time communication system to operate independently from the main REST API.

---

# 🤖 Gemini AI Integration

Freshkart integrates Google's Gemini API into the chat system.

The **AI Suggest** feature generates useful quick replies based on the current conversation.

Example:

```text
Customer:
"Where is my order?"

AI Suggestions:

→ "Your order is on the way."
→ "I will check the delivery status."
→ "Please wait a few minutes."
```

The AI functionality is designed to assist communication rather than replace the normal chat system.

---

# 🖼️ Cloudinary Image Management

Freshkart uses Cloudinary to store product images.

The image flow is:

```text
Admin
  ↓
Upload Product Image
  ↓
Cloudinary
  ↓
Cloudinary Image URL
  ↓
MongoDB
  ↓
Freshkart Frontend
```

MongoDB stores the product information and image URL, while Cloudinary handles image storage and delivery.

---

# 💳 Stripe Integration

Stripe is used for payment-related functionality.

The application includes:

```text
Stripe Secret Key
Stripe Webhook Secret
```

Stripe webhooks allow the backend to securely receive payment-related events from Stripe.

Never expose the Stripe secret key or webhook secret on the frontend.

---

# 🔎 Search and Category Filtering

Freshkart provides product search and category filtering.

Users can search using:

```text
Product Name
Category
Partial Text
Case-insensitive Text
```

For example:

```text
Search: apple

Results:
Apple
Green Apple
Apple Juice
```

Users can also select categories such as:

```text
All Items
Fruits & Veggies
Dairy & Eggs
Bakery & Bread
Meat & Seafood
Snacks & Drinks
Pantry & Staples
Frozen Foods
Health & Care
Baby Care
Household Essentials
```

---

# ⚡ Product Caching

Freshkart uses caching to improve product loading performance.

Instead of repeatedly requesting the same product information from MongoDB:

```text
First Request
     ↓
MongoDB
     ↓
Product Cache
     ↓
Frontend
```

Later requests can reuse cached product data:

```text
Frontend
     ↓
Product Cache
     ↓
Products
```

This helps reduce unnecessary database requests and improves the browsing experience.

---

# 🔐 Authentication & RBAC

Freshkart uses authentication and Role-Based Access Control to separate permissions.

The main roles are:

```text
User
Admin
Delivery Partner
```

### User

```text
Browse Products
Cart
Checkout
Orders
Profile
Chat
```

### Admin

```text
Products
Users
Orders
Delivery Partners
Order Assignment
```

### Delivery Partner

```text
Assigned Orders
Order Status
Customer Chat
```

This prevents users from accessing functionality that belongs to Admins or Delivery Partners.

---

# 🛒 Cart and Order Flow

The shopping workflow is:

```text
Browse Products
      ↓
View Product
      ↓
Add to Cart
      ↓
Update Quantity
      ↓
Review Cart
      ↓
Checkout
      ↓
Payment
      ↓
Order Created
      ↓
Admin
      ↓
Delivery Partner Assignment
      ↓
Delivery
      ↓
Order Completed
```

---

# 📦 Order Status

Orders can move through different stages depending on the application's workflow:

```text
Pending
   ↓
Confirmed
   ↓
Assigned
   ↓
Out for Delivery
   ↓
Delivered
```

The Admin and Delivery Partner can update the appropriate order status, which can then be displayed to the user.

---

# 🌗 User Theme

The user-facing Freshkart application supports:

```text
Dark Mode
Light Mode
```

The theme preference is saved locally so the selected mode can remain after refreshing or navigating through the user section.

The theme applies only to:

```text
User Section
```

and does not modify:

```text
Admin Dashboard
```

# 🚀 Deployment

The frontend is deployed and available here:

**Live Website:**

https://freshkart-six.vercel.app/register


The project can also be deployed using Docker for containerized services such as the backend and Socket Server.

Production deployment requires the appropriate production environment variables for:

```text
MongoDB
Authentication
Google OAuth
Cloudinary
Stripe
Socket Server
Gemini API
```

# 🎯 Project Purpose

Freshkart was developed as a complete full-stack grocery delivery platform to demonstrate practical experience in modern web development.

The project combines:

```text
Frontend Development
        +
Backend Development
        +
MongoDB
        +
REST APIs
        +
Authentication
        +
RBAC
        +
Google OAuth
        +
Cloudinary
        +
Stripe
        +
Gemini AI
        +
Socket.IO
        +
Dedicated Socket Server
        +
Product Caching
        +
Docker
        +
Real-Time Communication
```

Freshkart demonstrates the complete lifecycle of an e-commerce grocery application, from browsing products and placing an order to admin management, delivery assignment, real-time customer communication, AI-assisted chat, payment processing, and order completion.
