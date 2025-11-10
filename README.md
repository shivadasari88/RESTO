🍽️ QR Restaurant Hybrid Service App
A modern, full-stack restaurant management system that combines digital ordering with traditional service. Customers scan QR codes to access digital menus and place orders, while staff manages operations through real-time dashboards.


✨ Features
👥 Multi-Role System

Customers: QR code scanning, digital menu, order placement, real-time tracking.

Admin: Menu management, analytics, user management, revenue reports.

Kitchen Staff: Live order queue, status updates, preparation tracking.

Runners: Order delivery tracking, status management.

🔧 Technical Features

Real-time updates with Socket.IO

QR code integration for table-specific menus

Payment integration with PhonePe

Role-based access control (RBAC)

JWT authentication with secure sessions

Responsive design for all devices

🛠️ Tech Stack
Frontend
React 18 with Vite

Tailwind CSS for styling

Axios for API calls

React Router for navigation

Context API for state management

Backend
Node.js with Express.js

Socket.IO for real-time communication

JWT for authentication

MongoDB Atlas for database

Mongoose ODM

Deployment
AWS EC2 Ubuntu instance

PM2 process management

MongoDB Atlas cloud database

NGINX reverse proxy (optional)


📁 Project Structure
text
RESTO/
├── backend/
│   ├── controllers/     # Route controllers
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth, CORS, etc.
│   ├── socket/          # Socket.IO configuration
│   └── index.js         # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── api/         # API services
│   │   └── utils/       # Helper functions
│   └── package.json
└── README.md


🗄️ Database Schema
Collections
Users: {_id, name, email, passwordHash, role, isActive}

Tables: {_id, tableNumber, qrCode, status}

MenuItems: {_id, name, description, price, category, availability}

Orders: {_id, tableId, items[], status, total, createdAt}

Payments: {_id, orderId, amount, status, transactionId}



🔌 API Endpoints
Authentication
POST /api/auth/login - User login

POST /api/auth/register - User registration

GET /api/auth/me - Get current user

Menu Management
GET /api/menu - Get all menu items

POST /api/menu - Create menu item (Admin)

PUT /api/menu/:id - Update menu item (Admin)

DELETE /api/menu/:id - Delete menu item (Admin)



Orders
POST /api/orders - Create new order

GET /api/orders - Get all orders (Staff)

GET /api/orders/table/:tableId - Get table orders

PUT /api/orders/:id/status - Update order status


Real-time Events (Socket.IO)
orderPlaced - Notify kitchen of new order

orderStatusUpdated - Update all clients on status change

orderReady - Notify runners

orderDelivered - Complete order cycle



🚀 Installation & Setup
Prerequisites
Node.js (v16 or higher)

MongoDB Atlas account

AWS EC2 instance (for deployment)

Backend Setup
bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configurations
nano .env

# Start development server
npm run dev

# Or start with PM2
pm2 start index.js --name "resto-backend"
Frontend Setup
bash
cd frontend
npm install

# Create .env file
echo "VITE_BACKEND_URL=http://your-ec2-ip:5000" > .env

# Start development server
npm run dev

# Build for production
npm run build
Environment Variables
Backend (.env)
env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
CLIENT_URL=http://your-frontend-url:3000
SESSION_SECRET=your_session_secret
PHONEPE_MERCHANT_ID=your_phonepe_merchant_id
PHONEPE_SALT_KEY=your_phonepe_salt_key
Frontend (.env)
env
VITE_BACKEND_URL=http://your-ec2-ip:5000
🎯 Usage
For Customers
Scan QR code on table

Browse digital menu

Add items to cart

Place order

Track order status in real-time

Make payment

For Staff
Login with role-based credentials

Access respective dashboard

Manage orders in real-time

Update order status

View analytics and reports

🚀 Deployment
AWS EC2 Deployment
bash
# Connect to EC2 instance
ssh -i "your-key.pem" ubuntu@your-ec2-ip

# Clone repository
git clone https://github.com/shivadasari88/RESTO.git
cd RESTO

# Setup backend
cd backend
npm install
pm2 start index.js --name "resto-backend"

# Setup frontend  
cd ../frontend
npm install
npm run build
pm2 start "npm run dev" --name "resto-frontend"

# Save PM2 configuration
pm2 save
pm2 startup
Security Group Configuration
Allow inbound traffic on:

Port 3000 (Frontend)

Port 5000 (Backend API)

Port 22 (SSH)

🤝 Contributing
Fork the project

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📝 License
This project is licensed under the MIT License - see the LICENSE.md file for details.

👥 Authors
Your Name - GitHub Profile

🙏 Acknowledgments
React community for excellent documentation

MongoDB Atlas for free tier database

AWS for EC2 free tier

Socket.IO for real-time capabilities

📞 Support
For support, email your-email@example.com or create an issue in the repository.

⭐ Star this repo if you found it helpful!

