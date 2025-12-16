
# RESTO

🍽️ QR Restaurant Hybrid Service App A modern, full-stack restaurant management system that combines digital ordering with traditional service. Customers scan QR codes to access digital menus and place orders, while staff manages operations through real-time dashboards.

## Screenshots

![1](https://github.com/shivadasari88/RESTO/blob/2d3fcd3de91d691a4694e07b37f82bc901884214/Screenshot%202025-12-16%20211845.png)


![2](https://github.com/shivadasari88/RESTO/blob/2d3fcd3de91d691a4694e07b37f82bc901884214/Screenshot%202025-12-16%20212037.png)

![3](https://github.com/shivadasari88/RESTO/blob/2d3fcd3de91d691a4694e07b37f82bc901884214/Screenshot%202025-12-16%20212104.png)

![4](https://github.com/shivadasari88/RESTO/blob/2d3fcd3de91d691a4694e07b37f82bc901884214/Screenshot%202025-12-16%20212116.png)

![5](https://github.com/shivadasari88/RESTO/blob/2d3fcd3de91d691a4694e07b37f82bc901884214/Screenshot%202025-12-16%20212139.png)

![6](https://github.com/shivadasari88/RESTO/blob/2d3fcd3de91d691a4694e07b37f82bc901884214/Screenshot%202025-12-16%20212153.png)

![7](https://github.com/shivadasari88/RESTO/blob/2d3fcd3de91d691a4694e07b37f82bc901884214/Screenshot%202025-12-16%20212251.png)

![8](https://github.com/shivadasari88/RESTO/blob/2d3fcd3de91d691a4694e07b37f82bc901884214/Screenshot%202025-12-16%20212331.png)

![9](https://github.com/shivadasari88/RESTO/blob/2d3fcd3de91d691a4694e07b37f82bc901884214/Screenshot%202025-12-16%20212426.png)

## Key Features

**👥 Multi-Role System**

 - Customers: QR code scanning, digital menu, order placement, real-time tracking.
 - Admin: Menu management, analytics, user management, revenue reports.
 - Kitchen Staff: Live order queue, status updates, preparation tracking.
 - Runners: Order delivery tracking, status management.


**🔧 Technical Features**

 - Real-time updates with Socket.IO
- QR code integration for table-specific menus
- Payment integration with PhonePe
- Role-based access control (RBAC)
- JWT authentication with secure sessions
- Responsive design for all devices

**🛠️ Tech Stack Frontend React 18 with Vite**

- Tailwind CSS for styling
- Axios for API calls
- React Router for navigation
- Context API for state management
- Backend Node.js with Express.js
- Socket.IO for real-time communication
- JWT for authentication
- MongoDB Atlas for database
- Mongoose ODM
- Deployment AWS EC2 Ubuntu instance
- PM2 process management
- MongoDB Atlas cloud database


## Usage/Examples

```javascript
## project Structure


RESTO/ 
├── backend/ 
│ ├── controllers/ # Route controllers 
│ ├── models/ # MongoDB models 
│ ├── routes/ # API routes 
│ ├── middleware/ # Auth, CORS, etc. 
│ ├── socket/ # Socket.IO configuration 
│ └── index.js # Server entry point 
├── frontend/ 
│ ├── src/ 
│ │ ├── components/ # React components 
│ │ ├── pages/ # Page components 
│ │ ├── context/ # React context 
│ │ ├── api/ # API services 
│ │ └── utils/ # Helper functions 
│ └── package.json 
└── README.md
```


## 🗄️ Database Schema Collections 

```bash
  
Users: {_id, name, email, passwordHash, role, isActive}

Tables: {_id, tableNumber, qrCode, status}

MenuItems: {_id, name, description, price, category, availability}

Orders: {_id, tableId, items[], status, total, createdAt}

Payments: {_id, orderId, amount, status, transactionId}
```


## Installation

Clone repository

```bash
  git clone https://github.com/shivadasari88/RESTO.git cd RESTO
```

Setup backend

```bash
  cd backend npm install start index.js "
```

Setup frontend

```bash
  cd ../frontend npm install start "npm run dev" 
```
    
