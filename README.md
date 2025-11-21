# Coupon Management System - Backend

## Project Overview
This project implements a simple Coupon Management System for an e-commerce use case.  
It allows creating coupons with detailed eligibility rules, retrieving all coupons, and evaluating the best eligible coupon for a given user and cart.  
Coupons are stored **in-memory**, making it simple to run without a database.

---

## Tech Stack
- **Language:** JavaScript (Node.js)  
- **Framework:** Express.js  
- **Libraries:** CORS, Body-Parser (via express.json()), optionally Axios for frontend API calls  

---

## How to Run

### Prerequisites
- Node.js 18+  
- npm (Node Package Manager)  

### Setup Steps
1. Open terminal and navigate to backend folder:
```bash
Install dependencies:

bash
Copy code
npm install
Start the Coupon-Ui-server:

bash
Copy code
npm start
Server runs on: https://coupon-ui-backend.vercel.app/

API Endpoints
1. Create Coupon
POST /api/coupons
Body: JSON with coupon details (code, description, discountType, discountValue, maxDiscountAmount, startDate, endDate, usageLimitPerUser, eligibility)

2. List All Coupons
GET /api/coupons
Returns all stored coupons.

3. Get Best Coupon
POST /api/coupons/best
Body: JSON with user and cart objects
Returns the best eligible coupon based on eligibility rules and discount calculation.

Demo Login (Hardcoded User)
Email: hire-me@anshumat.org

Password: HireMe@2025!

This user is pre-seeded in the backend for testing purposes.

How to Run Tests
No automated tests implemented for this assignment.
You can test manually via Postman or frontend integration.

AI Usage Note
Used ChatGPT to assist in designing backend logic for eligibility rules, best-coupon selection, and API structure.

Prompts included: "Build a Node.js + Express backend for a coupon management system with eligibility rules and best coupon evaluation."

Notes for Reviewer
Coupons are stored in-memory; no database required.

Deterministic best-coupon selection: Highest discount → Earliest endDate → Lexicographically smallest code.

Ready to integrate with frontend React app.