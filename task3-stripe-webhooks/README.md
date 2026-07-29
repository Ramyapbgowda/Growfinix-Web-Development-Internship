# Growfinix — Task 3: Stripe Payment Gateway with Webhooks

## Project Overview

This project implements a Stripe Payment Gateway with Webhooks using React, Node.js, and the Stripe API. It provides a secure payment flow where users can complete payments through Stripe Checkout, and the backend automatically verifies successful payments using Stripe Webhooks.

---

## Tech Stack

- Frontend: React (Vite)
- Backend: Node.js + Express
- Payment Gateway: Stripe API
- Webhooks: Stripe Webhooks

---

## Features

- Secure Stripe Checkout integration
- Payment processing using Stripe Test Mode
- Webhook verification for successful payments
- Payment success confirmation page
- Backend event logging
- Clean and responsive user interface

---

## Project Structure

```
task3-stripe-webhooks/
│
├── backend/
├── frontend/
├── screenshots/
└── README.md
```

---

## Setup Instructions

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Add the following values to the `.env` file:

- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET

---

### Start Stripe Webhook Listener

```bash
stripe login
stripe listen --forward-to localhost:5002/api/webhook
```

Copy the generated `whsec_...` key into your `.env` file and restart the backend.

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```
http://localhost:3000
```

Use Stripe Test Card:

```
4242 4242 4242 4242
Any future expiry date
Any 3-digit CVC
```

---

## How It Works

1. User clicks **Pay with Card**.
2. Backend creates a Stripe Checkout Session.
3. Stripe securely processes the payment.
4. Stripe sends a webhook event to the backend.
5. Backend verifies the payment and updates the payment status.
6. User is redirected to the Payment Success page.

---

## Screenshots

Include screenshots of:

- Payment Page
- Stripe Checkout Page
- Payment Success Page
- Backend Terminal
- Stripe Webhook Logs

---

## Demo Video

Record a short demo showing:

- Application running
- Payment using Stripe Test Card
- Successful payment confirmation
- Backend webhook logs

---

## Author

**P B Ramya**

Growfinix Web Development Internship
