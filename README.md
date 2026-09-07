
# HustleHub+: Backend API (Part 1)

## System overview

HustleHub+ is a gig-economy platform that connects people who need work done with
people who do it: think freelance bookings, not a job board. The long-term product
(see the project's architecture diagram) covers browsing and managing gigs, bookings,
and income/tax tracking on top of a React frontend.

**This repository is the Part 1 submission**, scoped to the foundation everything
else depends on: an Express.js backend that lets a person register an account, log
in, and fetch their own profile, with passwords hashed, sessions handled as signed
JWTs instead of server-side state, all input validated before it reaches business
logic, and errors returned as clean, predictable JSON instead of stack traces or
generic server crashes.

> **Current storage note:** the target architecture is MongoDB via Mongoose. As of
> Part 1, users are held in a plain in-memory array
> ([`data/users.js`](data/users.js)); there is no `config/db.js` or `models/User.js`
> yet, and no persistence across restarts. This is expected for this milestone; do
> not assume MongoDB is wired up.

## Intended users

The API models three roles via the `role` field on a user (see
[`controllers/authController.js`](controllers/authController.js)):

| Role | Who they are | What they're for |
|---|---|---|
| `client` | Someone who wants work done | Books/hires freelancers for gigs (default role if none is given at registration) |
| `freelancer` | Someone offering a service | Lists and manages gigs, gets booked by clients |
| `admin` | Platform operator | Oversight/management of the platform itself |

Part 1 only implements account creation, login, and profile lookup for these roles;
gig browsing, bookings, and role-specific permissions on other endpoints are future
work, not part of this submission.

## Backend structure

```
HustleHub+/
├── api/                        # The Express application (this project)
│   ├── index.js                # App bootstrap: middleware wiring, HTTP/HTTPS server
│   ├── routes/
│   │   └── authRoutes.js       # Maps /api/auth/* paths to controller functions
│   ├── controllers/
│   │   └── authController.js   # register / login / getMe business logic
│   ├── middleware/
│   │   ├── verifyToken.js      # Decodes & validates the JWT on protected routes
│   │   ├── validation.js       # Rejects bad register/login input before it's trusted
│   │   ├── errorHandler.js     # Turns any thrown Error into clean JSON + status code
│   │   └── notFound.js         # Catch-all for unmatched routes
│   └── data/
│       └── users.js            # In-memory user store (Part 1 stand-in for MongoDB)
└── postman/
    └── HustleHub-API.postman_collection.json
```

**Request flow** for, say, `POST /api/auth/register`:

1. Request hits `index.js` → `helmet()` (security headers) → `express.json()` (body
   parsing).
2. `middleware/validation.js` checks the input is well-formed and rejects it early if
   not (see [Security decisions](#security-decisions) below).
3. `routes/authRoutes.js` routes the (now-validated) request to
   `controllers/authController.js`.
4. `authController.js` hashes the password, checks `data/users.js` for a duplicate
   email, and stores the new user.
5. Any error thrown at any step (validation, duplicate email, etc.) is caught by
   Express and forwarded to `middleware/errorHandler.js`, which is the only place
   that ever writes to the response in a failure case.

`GET /api/auth/me` follows the same shape, except `middleware/verifyToken.js` sits in
front of the controller instead of `validation.js`; it decodes the JWT from the
`Authorization` header and attaches the user's identity to the request before the
controller runs.

## Security decisions

### Password hashing

Passwords are never stored in plaintext. `authController.js` hashes every password
with **bcrypt** (`SALT_ROUNDS = 10`) before it touches `data/users.js`, and bcrypt
generates and embeds a unique salt per password automatically, so two users with the
same password get different stored hashes, and the same plaintext can't be reversed
from a stolen hash without brute-forcing it (deliberately expensive, tunable via the
salt round count) (OWASP Foundation, n.d.b). The hash is also stripped from every API response: `register`,
`login`, and `me` all return only `id`, `name`, `email`, `role`; verified live during
this project that `passwordHash` never leaves the server.

### Token-based authentication

Login issues a **JWT** rather than creating a server-side session, so the API stays
stateless; no session store to manage or leak (Jones, Bradley and Sakimura, 2015). Two deliberate choices worth calling
out:

- The token payload is minimal (`{ id, role }` only); a stolen token exposes an ID
  and a role, not a name or email.
- Tokens expire (`JWT_EXPIRES_IN`, e.g. `1h`); a leaked token has a limited window
  of usefulness rather than working forever.

`middleware/verifyToken.js` is the single gatekeeper for protected routes: it
requires an `Authorization: Bearer <token>` header, verifies the signature against
`JWT_SECRET`, and rejects anything missing, malformed, or expired with a `401`,
never a partial/ambiguous response.

### Input validation

`middleware/validation.js` runs **before** any request reaches `authController.js`,
on the principle that a backend should never trust client-supplied input by default
(OWASP Foundation, n.d.a). It enforces: required fields, a valid email shape, a minimum password strength (8+
characters with upper/lower-case, a digit, and a special character), and a role
restricted to a known set (`client`/`freelancer`/`admin`, rejecting e.g.
`"superadmin"`). Rejected input never reaches the user store or the password hasher;
it's turned into a specific, correctly-status-coded error by
`middleware/errorHandler.js` instead of a generic crash.

### Why HTTPS matters

Every request to this API (registration, login, and the JWT sent on every
subsequent authenticated call) carries credentials or tokens that must not be
readable by anyone else on the network path. Plain HTTP sends all of that in clear
text, meaning a password or a valid session token could be captured in transit
(e.g. on shared/public networks) without the user ever knowing. HTTPS (TLS)
encrypts the connection so that isn't possible (Cloudflare, n.d.).

`index.js` supports HTTPS via the `USE_HTTPS` env var (see [Setup](#setup) below);
when set, it loads a certificate/key pair and serves over `https.createServer(...)`
instead of plain `http`. **Honesty note:** `USE_HTTPS` defaults to `false`, and this
copy of the repo does not include an actual `certs/` directory or certificate files;
provisioning those and enabling `USE_HTTPS=true` for any real deployment is expected,
not optional, before this API handles real user data.

### Other hardening already in place

- `helmet()` sets standard security-related HTTP headers on every response (npm, n.d.).
- `app.disable('x-powered-by')` stops the server from advertising it's running
  Express, reducing fingerprinting for an attacker.

## Team split

| Person | Responsibility | Key files |
|---|---|---|
| Person 1 | Skeleton, HTTPS, DB/config setup | [`index.js`](index.js) (app bootstrap + HTTP/HTTPS server) |
| Person 2 (Khensani) | User model & auth logic | [`controllers/authController.js`](controllers/authController.js), [`routes/authRoutes.js`](routes/authRoutes.js), [`middleware/verifyToken.js`](middleware/verifyToken.js), [`data/users.js`](data/users.js) |
| Person 3 | Middleware, testing, docs | [`middleware/validation.js`](middleware/validation.js), [`middleware/errorHandler.js`](middleware/errorHandler.js), [`middleware/notFound.js`](middleware/notFound.js), [`../postman/`](../postman), this README |

By convention on this project, `authController.js`, `authRoutes.js`, and
`verifyToken.js` are not modified by anyone outside Person 2; new behavior (like
validation) is wired in from `index.js` instead, alongside those files rather than
inside them.

## Setup

**Prerequisites:** Node.js and npm.

```bash
cd HustleHub+/api
npm install
cp .env.example .env
```

Fill in `.env`:

| Key | Required | Example | Notes |
|---|---|---|---|
| `PORT` | No | `4000` | Defaults to `4000` if unset |
| `USE_HTTPS` | No | `false` | Set to `true` to serve over HTTPS |
| `SSL_KEY_PATH` | Only if `USE_HTTPS=true` | `./certs/key.pem` | Path to a local private key |
| `SSL_CERT_PATH` | Only if `USE_HTTPS=true` | `./certs/cert.pem` | Path to a local certificate |
| `JWT_SECRET` | Yes | a long random string | Login fails with `JWT secret is not configured` if this is unset |
| `JWT_EXPIRES_IN` | Yes | `1h` | Passed directly to `jsonwebtoken`'s `expiresIn` |

Run it:

```bash
npm start
```

This runs `node index.js` (see `scripts.start` in [`package.json`](package.json)),
which starts an HTTP server on `PORT`, or an HTTPS server if `USE_HTTPS=true`.

## API reference

| Method | Path | Auth required | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | None | Create a new user account |
| `POST` | `/api/auth/login` | None | Authenticate and receive a JWT |
| `GET` | `/api/auth/me` | Bearer JWT | Get the authenticated user's own profile |

### `POST /api/auth/register`

Request:

```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "password": "Str0ng!Pass1",
  "role": "freelancer"
}
```

`role` is optional (defaults to `client`) and, if provided, must be one of
`client`, `freelancer`, `admin`.

Response (`201 Created`):

```json
{
  "id": 1,
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "role": "freelancer"
}
```

### `POST /api/auth/login`

Request:

```json
{
  "email": "jane.doe@example.com",
  "password": "Str0ng!Pass1"
}
```

Response (`200 OK`):

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### `GET /api/auth/me`

Request header:

```
Authorization: Bearer <token from /login>
```

Response (`200 OK`):

```json
{
  "id": 1,
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "role": "freelancer"
}
```

## Error response format

All errors (thrown as plain `Error()` objects from controllers/middleware, and
auto-forwarded by Express 5 (OpenJS Foundation, n.d.)) are caught by
[`middleware/errorHandler.js`](middleware/errorHandler.js). The client always gets
clean JSON, never a stack trace:

```json
{ "error": "<message>" }
```

The status code is chosen from the error message via a single, extensible mapping:

| Error message contains | Status |
|---|---|
| `required` | 400 |
| `must be ...` (role/email/password validation) | 400 |
| `already registered` | 409 |
| `Invalid email or password` | 401 |
| `No token provided` | 401 |
| `Invalid or expired token` | 401 |
| `not found` | 404 |
| `not configured` (e.g. missing `JWT_SECRET`) | 500 |
| *(anything unmatched)* | 500 |

Unmatched routes are handled separately by
[`middleware/notFound.js`](middleware/notFound.js), returning `404`:

```json
{ "error": "Not found" }
```

Full error detail (including the stack trace) is logged server-side via
`console.error`, never sent to the client.

## Postman collection

A ready-to-import collection lives at
[`../postman/HustleHub-API.postman_collection.json`](../postman/HustleHub-API.postman_collection.json),
covering all three endpoints' success and failure cases.

**Import:** Postman → **Import** → select the file (or drag it in).

**Run it:**

1. Start the API (`npm start`).
2. In Postman, open the collection and confirm the `baseUrl` variable matches your
   server (defaults to `http://localhost:4000`).
3. Run requests top-to-bottom within the **Success** folder first, then **Failure**;
   a few failure cases (duplicate email, wrong password) reuse the account created by
   **Success → Register - valid input** via the `{{registeredEmail}}` collection
   variable. Easiest is **Run collection** (top-right) to execute everything in order
   in one go.
4. `Login - valid credentials` saves its JWT into `{{authToken}}`, which
   `Get Me - valid Bearer token` sends automatically; no manual copy-pasting.

Alternatively, run it headlessly with [Newman](https://www.npmjs.com/package/newman):

```bash
npx newman run ../postman/HustleHub-API.postman_collection.json
```

## Screenshots

Evidence of the endpoints and error handling running end to end, via the Postman
collection above (Postman, n.d.). Files live in [`screenshots/`](screenshots/).

`GET /health`
<img width="975" height="496" alt="image" src="https://github.com/user-attachments/assets/8bd75f6d-76e0-4158-ae3a-0ed584ee22ae" />
*Figure 1: Health check endpoint returning `200 OK`, confirming the server is running.*

`POST /api/auth/register` with an incomplete body.
<img width="1032" height="520" alt="image" src="https://github.com/user-attachments/assets/e372f0ef-38f2-40ae-8b12-01cece1889d0" />
*Figure 2: Registration rejected with `400 Bad Request` when required fields are missing.*

`POST /api/auth/register` with valid input, returning `201 Created`.
<img width="1010" height="517" alt="image" src="https://github.com/user-attachments/assets/cfc72579-e661-45d4-a29c-8fe805038c22" />
*Figure 3: Successful registration returning the new user's `id`, `name`, `email`, and `role`.*

`POST /api/auth/register` against an email that's already registered.
<img width="975" height="512" alt="image" src="https://github.com/user-attachments/assets/6026a390-6437-470c-b189-9d1f5c9e2fa1" />

*Figure 4: Duplicate registration attempt rejected with `400 Bad Request` and a clean error message.*

`POST /api/auth/login` with valid credentials, returning a JWT.
<img width="906" height="472" alt="image" src="https://github.com/user-attachments/assets/481a28be-7ab1-43f3-8389-c9d16a69c30d" />

*Figure 5: Successful login returning a signed JWT.*

`POST /api/auth/login` with the wrong password.
<img width="975" height="495" alt="image" src="https://github.com/user-attachments/assets/ae5ebdb6-11c2-4601-b3e0-a00446a1f26f" />

*Figure 6: Login rejected with `400 Bad Request` for an incorrect password.*

`GET /api/auth/me` with a valid token, returning the user's profile.
<img width="975" height="418" alt="image" src="https://github.com/user-attachments/assets/42ef28e5-2ecb-478e-bb1e-a0af4b21b16e" />

*Figure 7: Protected route returning the authenticated user's profile when a valid Bearer token is supplied.*

`GET /api/auth/me` with no `Authorization` header.
<img width="975" height="412" alt="image" src="https://github.com/user-attachments/assets/239ee397-8660-4fb5-87ac-6c994fc71c40" />

*Figure 8: Protected route rejected with `400 Bad Request` when no token is provided.*

## References

Cloudflare, n.d. *What is HTTPS?* [online] Available at:
https://www.cloudflare.com/learning/ssl/what-is-https/ [Accessed 7 September 2026].

Jones, M., Bradley, J. and Sakimura, N., 2015. *RFC 7519: JSON Web Token (JWT)*.
[online] Internet Engineering Task Force. Available at:
https://datatracker.ietf.org/doc/html/rfc7519 [Accessed 7 September 2026].

npm, n.d. *helmet*. [online] Available at: https://www.npmjs.com/package/helmet
[Accessed 7 September 2026].

OpenJS Foundation, n.d. *Error Handling - Express.js 5.x*. [online] Available at:
https://expressjs.com/en/5x/guide/error-handling/ [Accessed 7 September 2026].

OWASP Foundation, n.d.a. *Input Validation Cheat Sheet*. [online] Available at:
https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
[Accessed 7 September 2026].

OWASP Foundation, n.d.b. *Password Storage Cheat Sheet*. [online] Available at:
https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
[Accessed 7 September 2026].

Postman, n.d. *Test your API functionality*. [online] Available at:
https://learning.postman.com/docs/collections/running-collections/running-collections-overview/
[Accessed 7 September 2026].
