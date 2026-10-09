# HustleHub+

HustleHub+ is a MERN freelance marketplace for clients and freelancers. Part 2 connects the React client to the Express API and MongoDB: users can register and sign in, freelancers publish gigs, clients book them, and income is tracked.

## Table of Contents

- [Video Demo](#video-demo)
- [Features](#features)
- [How the marketplace works](#how-the-marketplace-works)
- [Architecture](#architecture)
- [Requirements](#requirements)
- [Setup](#setup)
  - [1. Configure and start the API](#1-configure-and-start-the-api)
  - [2. Configure and start the React client](#2-configure-and-start-the-react-client)
  - [3. Use the application](#3-use-the-application)
- [Application Screenshots](#application-screenshots)
- [API summary](#api-summary)
  - [RBAC matrix](#rbac-matrix)
- [Testing](#testing)
  - [Frontend](#frontend)
  - [Backend API with Postman and Newman](#backend-api-with-postman-and-newman)
- [Security notes](#security-notes)

## Video Demo
[Watch the HustleHub+ demonstration video](https://www.youtube.com/watch?v=lKeUEDBZFq4)

## Features

- Registration and login with bcrypt password hashing and JWT authentication.
- Client and freelancer roles; admin accounts are created through the seed configuration and cannot self-register.
- Public gig browsing and freelancer-only gig creation, editing, and deletion. The API checks ownership before changes.
- Client-only bookings, with booking and transaction records created together.
- Role-aware booking lists and allowed status changes. Cancellations create a refund record.
- Freelancer income totals calculated from payment and refund transactions.
- Category-matched local artwork is assigned to new gigs and shown for older gigs without an image; freelancers can preview it while creating or editing a listing.
- Input validation and trimming, safe JSON errors, Helmet security headers and CSP, and API, login, registration, and booking rate limits.
- Responsive React interface, inline API error messages, session-scoped JWT storage, and automated frontend rendering/search tests.

Payments are simulated. No card or bank details are collected. Tax estimates, Docker, CI/CD, monitoring, and extended security features are listed in the Part 3 assessment and are not implemented in this Part 2 build.

## How the marketplace works

- A **freelancer** publishes a service listing (gig), then manages bookings for that service and sees income recorded from completed/active payment transactions.
- A **client** browses those services, books one, and sees the booking and simulated payment under **My Bookings**.
- In this Part 2 build, clients do not publish gigs or advertise jobs. The app is a service marketplace: freelancers offer work and clients hire them.

## Architecture

<img width="1652" height="902" alt="image" src="https://github.com/user-attachments/assets/844dade8-7091-45a6-a94e-701697b79939" />


## Requirements

- Node.js 20.19 or newer and npm.
- A MongoDB Atlas database or another MongoDB replica set. Booking and transaction writes use a MongoDB transaction, which requires replica-set support; a standalone local MongoDB server is not sufficient.
- The API's npm install includes Newman for the Postman collections.

## Setup

### 1. Configure and start the API

```powershell
cd api
npm install
Copy-Item .env.example .env
```

Set `MONGO_URI` to your database connection string and `JWT_SECRET` to a private random secret of at least 32 bytes. Keep `.env` private and out of Git. Set `CLIENT_ORIGIN=http://localhost:5173` for local development.

For local HTTPS (recommended for the Part 1 security requirement), create a development certificate and use it in `.env`:

```powershell
npm run certs
```

Set `USE_HTTPS=true`, `SSL_KEY_PATH=./certs/key.pem`, and `SSL_CERT_PATH=./certs/cert.pem`. The self-signed certificate is for local development only; trust it in your browser/Postman before using the API.

Start the API:

```powershell
npm start
```

The API listens on port 4000 by default. Check `http://localhost:4000/health` (or `https://localhost:4000/health` when HTTPS is enabled).

Optional: create sample users, gigs, bookings and transaction records for a walkthrough:

```powershell
npm run seed
```

Seeded users use the password printed by the seed script. The default demo password is intended only for a local demo; set `SEED_DEMO_PASSWORD` in `.env` before seeding if you want a different password.

### 2. Configure and start the React client

In another terminal:

```powershell
cd client
npm install
Copy-Item .env.example .env
npm run dev
```

The Vite client is at `http://localhost:5173`. `VITE_API_URL` defaults to `http://localhost:4000`; set it to `https://localhost:4000` if the API is running with HTTPS. Restart Vite after changing environment variables.

### 3. Use the application

1. Register as a client or freelancer, then sign in.
2. As a freelancer, publish a gig and open the dashboard to see gigs, bookings, and income.
3. As a client, browse gigs, open a listing, confirm the simulated booking, and view the booking and payment transaction under **My Bookings**.
4. A freelancer can confirm or complete their own bookings. A client or freelancer can cancel an eligible booking; cancellation adds a refund transaction.

## Application Screenshots

The screenshots below show the main HustleHub+ user flows for Part 2.

###  Launch Page
All type of users are able to see the launch page

<img width="959" height="416" alt="image" src="https://github.com/user-attachments/assets/fe7c47be-ecd3-461f-97c5-a289d7ee468e" />


### Login and registration

Users can create an account or log in to access the application.

**Registration page**

<img width="959" height="413" alt="image" src="https://github.com/user-attachments/assets/eea30adf-8206-4626-86aa-6d96b4872cdf" />

**Login Page**

<img width="959" height="413" alt="image" src="https://github.com/user-attachments/assets/914bd38e-81ee-4a9f-9e20-3e01d66e230f" />


### Freelancer dashboard

Freelancers can view their listings and bookings, track income, and manage their gigs.

<img width="959" height="415" alt="image" src="https://github.com/user-attachments/assets/997adf88-1c70-4fd4-acad-026874e9cdf4" />


### Create and manage a gig

Freelancers can create a gig with a title, description, price, and category, then view or update their own listings.

<img width="896" height="401" alt="image" src="https://github.com/user-attachments/assets/c1a519df-1be4-4396-a0b3-e0f2773a9bf3" />


### Browse available gigs

Clients can browse available freelancer gigs and view details before booking.

<img width="498" height="412" alt="image" src="https://github.com/user-attachments/assets/28a33749-3110-4b2a-95f6-3d04e1cf8a0d" />


### Booking confirmation

Clients can initiate a booking. Payments are simulated; no real payment details are collected.

<img width="485" height="317" alt="image" src="https://github.com/user-attachments/assets/78d5d29a-7cab-4c36-8965-74e3f0bb8d30" />


### Bookings and transactions

Clients and freelancers can view their related bookings. Each booking creates an associated transaction record.

<img width="482" height="301" alt="image" src="https://github.com/user-attachments/assets/9458f9c3-a80d-42fd-b771-731796c5fa56" />


### Freelancer income

Freelancers can review income recorded from bookings associated with their gigs.

<img width="921" height="404" alt="image" src="https://github.com/user-attachments/assets/c8bc8e54-bfa3-424c-a0e0-0987d654a93c" />


## API summary

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a client or freelancer |
| `POST` | `/api/auth/login` | Public | Sign in and receive a JWT |
| `GET` | `/api/auth/me` | JWT | Current account profile |
| `GET` | `/api/gigs` | Public | Browse listings |
| `GET` | `/api/gigs/:id` | Public | View one listing |
| `POST` | `/api/gigs` | Freelancer JWT | Create a listing |
| `PUT` / `DELETE` | `/api/gigs/:id` | Owner freelancer JWT (admin may moderate) | Update or delete a listing |
| `POST` | `/api/bookings` | Client JWT | Book a gig; creates a payment transaction |
| `GET` | `/api/bookings` | Client or freelancer JWT | List bookings involving the current user |
| `PUT` | `/api/bookings/:id/status` | Client or freelancer JWT | Change status when permitted by the booking workflow |
| `GET` | `/api/transactions` | Client or freelancer JWT | List the current user's transactions |
| `GET` | `/api/transactions/income` | Freelancer JWT | Payment, refund, and net income totals |

Protected requests use `Authorization: Bearer <token>`. The server obtains account roles and record ownership from MongoDB, not request fields. Self-registration accepts only `client` and `freelancer` roles.

### RBAC matrix

| Endpoint/action | Guest | Client | Freelancer | Admin |
|---|---|---|---|---|
| Register / sign in | Allowed | Allowed | Allowed | Sign in only; admin is seeded |
| View profile | Denied | Own profile | Own profile | Own profile |
| Browse/view gigs | Allowed | Allowed | Allowed | Allowed |
| Create gig | Denied | Denied | Allowed | Denied |
| Update/delete gig | Denied | Denied | Own gigs only | Any gig for moderation |
| Create booking | Denied | Allowed | Denied | Denied |
| List bookings | Denied | Own client bookings | Bookings on own gigs | Denied |
| Change booking status | Denied | Own booking, permitted transitions | Booking on own gig, permitted transitions | Denied |
| List transactions | Denied | Own transactions | Own transactions | Denied |
| View income | Denied | Denied | Own income | Denied |


## Testing

### Frontend

```powershell
cd client
npm test
npm run build
```

The Vitest suite checks that marketplace listings render and that search filters listings.

Category artwork mapping and image-load fallbacks are covered by `gigArtwork.test.js` and `GigArtwork.test.jsx`.

#### Image example of Newman test running:
Ran the frontend automated tests with Vitest. All three test files passed, with 14 tests passing and zero failures. They check gig artwork data, the GigArtwork component, and the Browse page.

<img width="660" height="306" alt="image" src="https://github.com/user-attachments/assets/71a63bd6-d04a-4d1b-8b33-c5d2eb6b2c9e" />


### Backend API with Postman and Newman

Start the API and configure its database first. From `api/`:

```powershell
npm test
npm run test:rbac
```

The first collection covers successful and invalid auth, gigs, bookings, transactions, income, security headers, and rate limits. It deliberately exhausts the general API rate limit in its final request to verify rate-limiting protection.

#### First Postman collection: RBAC, ownership, and validation collection

- **Collection:** HustleHub+ API - Part 2 RBAC, ownership and validation denials
- **Runner:** Postman Collection Runner (not Newman)
- **Result:** 274 passed, 0 failed, 0 skipped
- **Iterations:** 1
- **Duration:** 8.414 seconds
- **Evidence:** <img width="701" height="403" alt="image" src="https://github.com/user-attachments/assets/d700d36a-7966-4f66-a593-3b12cf1b104e" />


#### Second Postman collection HustleHub+ API - Part 2 full flow

- **Collection:** HustleHub+ API - Part 2 full flow
- **Runner:** Postman Collection Runner (not Newman)
- **Result:** 175 passed, 0 failed, 0 skipped
- **Evidence:** <img width="698" height="404" alt="image" src="https://github.com/user-attachments/assets/9d6f0e9c-a2d5-4f6c-afc8-348d366ab44a" />

This is a successful Part 2 full flow collection run in Postman.

Clean test accounts created by the collections with:

```powershell
node test-models.js --cleanup
```

Mongoose model validation checks can be run with `npm run test:models`; they create temporary test records unless run with `--cleanup`.

Category artwork mappings can be checked without a database using `npm run test:artwork`.


## Security notes

- Passwords are stored as bcrypt hashes; login errors do not reveal whether an email exists.
- JWTs expire after the configured duration and are kept in browser session storage. They are sent only as Bearer headers and cleared on sign-out.
- Validation accepts plain strings/numbers for relevant inputs, trims text, caps lengths, checks ObjectId values, and whitelists editable gig fields. The API does not render user text as HTML.
- `verifyToken`, database-backed role checks, and reusable ownership rules protect sensitive actions and records.
- Booking/payment creation and cancellation/refund creation use database transactions so related records stay consistent.
- Helmet applies a restrictive CSP to the JSON API, along with anti-framing, referrer, and content-type headers. Rate limits cover the API generally and apply stricter thresholds to login, registration, and booking endpoints.
- Secrets and certificates are environment/local files and must not be committed. HTTPS certificates created by `npm run certs` are self-signed development certificates, not production certificates.
