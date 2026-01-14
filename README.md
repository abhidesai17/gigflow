# GigFlow – Mini Freelance Marketplace

## 📌 Project Overview
GigFlow is a mini freelance marketplace platform where users can post jobs (gigs) and freelancers can bid on them.  
The application demonstrates a complete hiring workflow with proper authentication, authorization, and status management.

---

## 🛠 Tech Stack
- **Frontend:** React.js (Vite) + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB
- **State Management:** Redux Toolkit
- **Authentication:** JWT with HttpOnly Cookies

---

## ✨ Core Features
- User authentication (Signup, Login, Logout)
- Secure JWT-based authentication using HttpOnly cookies
- Create and browse open gigs
- Search gigs by title
- Submit bids on gigs
- View bids (only gig owner can view)
- Hire a freelancer:
  - Selected bid is marked as **hired**
  - Gig status changes to **assigned**
  - All other bids are automatically **rejected**
- Prevents multiple hiring for the same gig

---

## 🧠 Hire Logic Explanation
Once a client clicks the **Hire** button on a bid:
1. The system verifies user authentication.
2. Ensures the user is the owner of the gig.
3. Confirms the gig status is `open`.
4. Updates the selected bid to `hired`.
5. Updates the gig status to `assigned`.
6. Automatically updates all other bids for the same gig to `rejected`.
7. Prevents any further hiring or bidding on that gig.

This ensures correct business logic and data consistency.

---

## 🔐 Authentication Flow
- JWT token is generated on login
- Token is stored securely in an **HttpOnly cookie**
- Protected routes are enforced using authentication middleware
- Logout clears the authentication cookie

---

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` – Register user
- `POST /api/auth/login` – Login user
- `POST /api/auth/logout` – Logout user

### Gigs
- `GET /api/gigs` – Fetch all open gigs (supports search)
- `POST /api/gigs` – Create a new gig

### Bids
- `POST /api/bids` – Submit a bid
- `GET /api/bids/:gigId` – Fetch bids for a gig (owner only)
- `PATCH /api/bids/:bidId/hire` – Hire a freelancer

---

## ⚙️ Environment Variables

Create a `.env` file in the backend folder using the following example:

.env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

## ⚙️ Environment Variables

A `.env.example` file is included for reference.  
⚠️ The actual `.env` file is **not committed** to GitHub for security reasons.

---

## ▶️ How to Run Locally

### Backend
```bash
cd backend
npm install
npm run dev
Frontend
cd frontend
npm install
npm run dev
```

👤 Author
Abhishek Desai

