# Technical Documentation
## Blaisetech Global Resources — Integrated Service Management Platform

---

## 1. Project Overview

A full-stack web platform for Blaisetech Global Resources, an electrical
engineering and technology company. It replaces manual processes (phone
calls, paper quotes, spreadsheets) with a single system covering:

- A public marketing website (Home, Services, Portfolio, About, Contact, Careers)
- Customer service booking, quotation, invoicing, and online/receipt payment
- An online shop for electrical/solar products with cart, checkout, and payment
- An admin back office covering every operational area of the business
- A technician workflow for job assignment and reporting
- Emergency service request handling
- A recruitment portal with CV upload

**Three user roles:** `customer`, `admin`, `technician` — each with a
separate dashboard and permission set.

---

## 2. Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 18 (Vite) | SPA, client-side routing via `react-router-dom` |
| Frontend styling | Plain CSS (`index.css`) | CSS custom properties for theming, no framework |
| HTTP client | Axios | Single shared instance with auth interceptor |
| Backend | Node.js + Express 4 | REST API |
| ORM | Sequelize 6 | Maps JS models to MySQL tables, handles migrations via `sync` |
| Database | MySQL | Relational; see ER overview below |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` | Stateless auth, password hashing |
| File uploads | Multer | Local disk storage (`backend/uploads/`) |
| Payments | Paystack | Inline JS checkout (frontend) + server-side transaction verification (backend) |

---

## 3. Repository Structure

```
blaisetech-platform/
├── backend/
│   ├── config/
│   │   └── db.js                 # Sequelize connection setup
│   ├── models/                   # One file per DB table + index.js (associations)
│   ├── controllers/              # Business logic, one file per feature area
│   ├── routes/                   # Express routers, map URLs to controllers
│   ├── middleware/
│   │   ├── auth.js               # JWT verification (protect) + role gating (restrictTo)
│   │   ├── upload.js             # Multer disk storage config
│   │   └── errorHandler.js       # Central error → JSON response handler
│   ├── utils/
│   │   ├── generateToken.js      # Signs JWTs
│   │   ├── paystack.js           # Server-side Paystack transaction verification
│   │   └── seed.js               # Starter data script (npm run seed)
│   ├── uploads/                  # Uploaded files served at /uploads/*
│   ├── server.js                 # App entry point — wires up all routes
│   └── package.json
└── frontend/
    └── src/
        ├── pages/                # One file per route/page
        ├── components/           # Shared UI: Navbar, Footer, Icons, forms, etc.
        ├── context/
        │   └── AuthContext.jsx   # Global logged-in-user state
        ├── api/
        │   └── axios.js          # Shared HTTP client, attaches JWT to every request
        ├── App.jsx                # Route definitions
        ├── main.jsx                # React entry point
        └── index.css               # All styling
```

---

## 4. Data Model (Database Schema)

All tables use Sequelize's automatic `id` (auto-increment primary key),
`createdAt`, and `updatedAt` columns in addition to what's listed below.

### User
The single table for all three roles.
| Field | Type | Notes |
|---|---|---|
| fullName, email (unique), phone | string | |
| password | string | bcrypt hash |
| role | enum: customer, admin, technician | |
| homeAddress, specialization | string | technician profile fields |
| resetPasswordToken, resetPasswordExpires | string, date | shared by password-reset AND technician-invite flows |
| accountSetupComplete | boolean | false for an invited technician until they set their own password |

### Service
Catalog of services offered (electrical installation, solar, etc.) — shown publicly, referenced by Bookings and Quotations.

### Booking
A customer's service request. Fields include `faultDescription`,
`additionalNotes`, `urgencyLevel` (normal/urgent), `preferredDate`,
`preferredTime`, `contactPhone`, `address`, `imageUrl`, and fulfillment
`status` (pending → confirmed → in_progress → completed / cancelled).
**A Quotation is auto-created the moment a Booking is created** (see §6.1).

### Quotation
Linked to a Booking. `amount`, `documentUrl` (optional attached quote
document), `status` (draft → approved / rejected — "sent" also exists in
the schema but the admin UI no longer uses it as an intermediate step; see
§6.1). Setting status to `approved` auto-creates an Invoice.

### Invoice
Auto-created when a Quotation is approved. `totalAmount`, `amountPaid`,
`receiptUrl`, `status` (unpaid → pending_confirmation → paid).

### EmergencyRequest
Priority fault reports. `description`, `location`, `contactPhone`,
`status` (pending → dispatched → resolved).

### Project
Portfolio entries shown publicly. `title`, `description`, `imageUrl`, `clientName`, `completedDate`.

### Review
Star rating (1–5) + comment, optionally linked to a Booking.

### Job / Application
`Job`: a vacancy listing (`title`, `description`, `location`,
`employmentType`, `isOpen`). `Application`: a candidate's submission
(`fullName`, `email`, `phone`, `cvUrl`, `coverLetter`), linked to a `Job`.

### Task
Admin-to-technician work assignment. `technicianId`, optional `bookingId`,
`title`, `instructions`, `dueDate`, `status` (assigned → in_progress →
completed), `report` (technician's write-up).

### Product
Inventory/shop item. `name`, `description`, `price`, `stockQuantity`, `category`, `imageUrl`.

### Order / OrderItem
`Order`: a customer's product purchase. `deliveryAddress`, `contactPhone`,
`preferredDeliveryDate`, `notes`, `totalAmount`, fulfillment `status`
(pending → confirmed → shipped → delivered / cancelled), and **payment**
tracked separately via `paymentMethod` (online / receipt_upload),
`paymentStatus` (unpaid → pending_confirmation → paid), `receiptUrl`,
`paystackReference`. `OrderItem`: one product line per order (`productId`,
`quantity`, `unitPrice` — price is snapshotted at order time so later
price changes don't rewrite history).

### ContactMessage
Public message/review box on the Contact page. `name`, `email` (optional), `message`, `rating` (optional, 1–5). No account required to submit.

### Key relationships
```
User 1---N Booking, Quotation, Invoice, EmergencyRequest, Review, Order, Task(as technician)
Service 1---N Booking, Quotation
Booking 1---1 Quotation, 1---1 Review, 1---N Task
Quotation 1---1 Invoice
Job 1---N Application
Order 1---N OrderItem N---1 Product
```

---

## 5. Authentication & Authorization

- **JWT-based, stateless.** On login/register, the backend signs a token
  containing `{ id, role, email, fullName }`, expiring per `JWT_EXPIRES_IN`
  (default 7 days).
- **Frontend storage:** the token is kept in `localStorage` and attached
  to every API request by `frontend/src/api/axios.js`'s request
  interceptor (`Authorization: Bearer <token>`).
- **Backend enforcement:** `middleware/auth.js` exports two functions:
  - `protect` — verifies the JWT is present and valid, attaches the
    decoded payload to `req.user`.
  - `restrictTo(...roles)` — used after `protect`; rejects the request
    with 403 if `req.user.role` isn't in the allowed list.
- **Passwords** are never stored in plain text — `bcryptjs` hashes with a
  salt round of 10 before saving, and the hash is excluded from any API
  response that returns a user object.
- **Technician onboarding** doesn't use a normal password-based creation.
  See §6.4.

---

## 6. Key Workflows

### 6.1 Booking → Quotation → Invoice → Payment

This is the core money-flow of the platform, and was deliberately
designed to minimize manual steps for both customer and admin:

1. **Customer books a service** (`POST /api/bookings`). The backend
   immediately creates a linked `Quotation` in `draft` status with
   `amount: 0` — the customer doesn't have to separately "request" a
   quote.
2. **Admin reviews it** (Admin Dashboard → Quotations tab), enters an
   amount, optionally attaches a document (multipart upload), and clicks
   **Send Quotation**. This is a single action that sets the amount and
   `status: 'approved'` in one request (`PATCH /api/quotations/:id`).
3. **Backend auto-creates the Invoice** the moment a quotation's status
   becomes `approved` (see `quotationController.updateQuotation` — it
   checks `!wasApproved && quotation.status === 'approved'` to avoid
   duplicate invoices, and re-syncs the invoice total if an admin revises
   an already-approved quote before it's paid).
4. **Customer pays** via receipt upload, surfaced on their dashboard's
   "My Invoices & Payments" tab: `PATCH /api/invoices/:id/submit-payment`
   (multipart, sets `status: 'pending_confirmation'`), then an admin
   manually confirms via `PATCH /api/invoices/:id`.
   *(Note: online payment via Paystack is implemented for shop Orders —
   see §6.3 — and follows the same server-side-verification pattern;
   wiring the identical flow onto Invoices is a natural next step using
   the same `utils/paystack.js` helper.)*

### 6.2 Emergency Requests
Simpler, single-stage flow: customer submits (`POST /api/emergency`),
admin updates status through pending → dispatched → resolved. No
quotation/invoice involved (these are typically handled off-platform for
speed, given the "emergency" nature).

### 6.3 Shop Orders → Payment → Delivery
1. Customer adds products to cart (client-side state only) and checks out
   (`POST /api/orders`) — stock is decremented and the order total
   calculated **inside a database transaction** (`sequelize.transaction`)
   so a race condition between two customers can't oversell stock.
2. Order starts `paymentStatus: 'unpaid'`. Customer chooses:
   - **Pay online (Paystack):** frontend opens the Paystack inline
     checkout popup (`window.PaystackPop.setup(...)`, loaded via
     `<script src="https://js.paystack.co/v1/inline.js">` in
     `index.html`). On success, the frontend calls
     `POST /api/orders/:id/verify-payment` with the returned reference.
     **The backend re-verifies this server-to-server** with Paystack's
     `/transaction/verify/:reference` endpoint using the secret key
     (`utils/paystack.js`) — the frontend's "success" callback is never
     trusted on its own, since it could be spoofed. The backend also
     checks the verified amount matches the order total before marking
     it paid.
   - **Upload a receipt:** `PATCH /api/orders/:id/submit-receipt`
     (multipart) sets `paymentStatus: 'pending_confirmation'`; admin
     confirms via `PATCH /api/orders/:id/confirm-payment`.
3. Once `paymentStatus` is `paid`, the customer sees a delivery estimate
   ("3–5 business days"). Fulfillment (`status` field: confirmed →
   shipped → delivered) is tracked separately by the admin and is
   independent of payment status.

### 6.4 Technician Onboarding (invite, not admin-set password)
1. Admin submits name/email/phone only (`POST /api/admin/technicians`).
2. Backend creates the `User` with `role: 'technician'`,
   `accountSetupComplete: false`, a random **unusable** placeholder
   password hash, and a hashed invite token (reusing the same
   `resetPasswordToken`/`resetPasswordExpires` fields as the forgot-password
   flow, valid 3 days).
3. Admin shares the resulting setup link with the technician (currently
   shown on-screen since no email service is wired up yet — see §8).
4. Technician opens `/set-password/:token` (`CompleteInvite.jsx`), which
   calls `GET /api/auth/invite/:token` to validate the token and greet
   them by name, then `POST /api/auth/complete-invite` with their chosen
   password plus `homeAddress`/`specialization`/`phone`. This sets
   `accountSetupComplete: true` and logs them in immediately.
5. `authController.login` rejects login attempts where
   `accountSetupComplete` is still `false`, so an invited technician can't
   accidentally log in before finishing setup.

### 6.5 Technician Task Assignment
Admin assigns a `Task` to a technician (optionally linked to a `Booking`)
via the Technicians tab. The technician sees it on `/technician`
(`TechnicianDashboard.jsx`), updates status as they work, and submits a
free-text `report` when marking it complete — visible to admin
immediately.

---

## 7. API Reference

Base URL: `http://localhost:5000/api` in development. All endpoints
return JSON. Endpoints marked 🔒 require `Authorization: Bearer <token>`;
the role required is noted in parentheses.

### Auth (`/auth`)
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | /register | Public | Create a customer account |
| POST | /login | Public | Log in, returns JWT |
| GET | /me | 🔒 any | Get the current logged-in user |
| POST | /forgot-password | Public | Generate a password reset token |
| POST | /reset-password | Public | Reset password using a token |
| GET | /invite/:token | Public | Validate a technician invite token |
| POST | /complete-invite | Public | Technician sets password + profile details |

### Admin (`/admin`)
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | /summary | 🔒 admin | Dashboard overview stats |
| POST | /technicians | 🔒 admin | Invite a new technician |
| GET | /technicians | 🔒 admin | List all technicians |

### Services (`/services`)
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | / | Public | List all services |
| GET | /:id | Public | Get one service |
| POST | / | 🔒 admin | Create a service |
| PUT | /:id | 🔒 admin | Edit a service (name/price/etc.) |
| DELETE | /:id | 🔒 admin | Delete a service |

### Bookings (`/bookings`)
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | / | 🔒 customer | Submit a booking (multipart: `image`) |
| GET | /my | 🔒 customer | Customer's own bookings |
| GET | / | 🔒 admin | All bookings |
| PATCH | /:id/status | 🔒 admin | Update fulfillment status |

### Quotations (`/quotations`)
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | /my | 🔒 customer | Customer's own quotations |
| GET | / | 🔒 admin | All quotations |
| PATCH | /:id | 🔒 admin | Set amount/status, attach document (multipart: `document`) |

### Invoices (`/invoices`)
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | /my | 🔒 customer | Customer's own invoices |
| GET | / | 🔒 admin | All invoices |
| PATCH | /:id/submit-payment | 🔒 customer | Upload receipt (multipart: `receipt`) |
| PATCH | /:id | 🔒 admin | Confirm payment / adjust amount paid |

### Emergency (`/emergency`)
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | / | 🔒 customer | Submit an emergency request |
| GET | / | 🔒 admin | All emergency requests |
| PATCH | /:id/status | 🔒 admin | Update status |

### Reviews (`/reviews`)
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | / | Public | All reviews (shown as testimonials) |
| POST | / | 🔒 customer | Submit a review |
| DELETE | /:id | 🔒 admin | Remove a review |

### Projects (`/projects`) — Portfolio
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | / | Public | List portfolio projects |
| POST | / | 🔒 admin | Add a project (multipart: `image`) |
| DELETE | /:id | 🔒 admin | Remove a project |

### Jobs (`/jobs`) — Recruitment
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | / | Public | Open job listings |
| GET | /all | 🔒 admin | All listings (incl. closed) |
| POST | / | 🔒 admin | Post a job |
| PATCH | /:id | 🔒 admin | Update a job (e.g. close it) |
| POST | /:id/apply | Public | Apply (multipart: `cv`) |
| GET | /:id/applications | 🔒 admin | View applicants for a job |

### Tasks (`/tasks`) — Technician assignment
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | / | 🔒 admin | Assign a task to a technician |
| GET | / | 🔒 admin | All tasks |
| GET | /my | 🔒 technician | Technician's own tasks |
| PATCH | /:id | 🔒 admin, technician | Update status / submit report |

### Products (`/products`) — Inventory
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | / | Public | List products |
| POST | / | 🔒 admin | Add a product (multipart: `image`) |
| PUT | /:id | 🔒 admin | Edit a product |
| DELETE | /:id | 🔒 admin | Delete a product |

### Orders (`/orders`) — Shop checkout & payment
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | / | 🔒 customer | Place an order |
| GET | /my | 🔒 customer | Customer's own orders |
| GET | / | 🔒 admin | All orders |
| PATCH | /:id/status | 🔒 admin | Update fulfillment status |
| POST | /:id/verify-payment | 🔒 customer | Verify a Paystack payment (body: `{ reference }`) |
| PATCH | /:id/submit-receipt | 🔒 customer | Upload receipt (multipart: `receipt`) |
| PATCH | /:id/confirm-payment | 🔒 admin | Confirm a receipt-based payment |

### Messages (`/messages`) — Contact page box
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | / | Public | Submit a message/review |
| GET | / | 🔒 admin | View all submitted messages |

---

## 8. Frontend Architecture

- **Routing:** `react-router-dom`, all routes defined in `App.jsx`.
  Role-gated pages are wrapped in `<ProtectedRoute role="...">`, which
  redirects to `/login` if unauthenticated or to `/` if the logged-in
  user's role doesn't match.
- **Global auth state:** `AuthContext` (`context/AuthContext.jsx`) loads
  the current user via `GET /api/auth/me` on mount if a token exists, and
  exposes `login`, `register`, `logout` to the whole app via `useAuth()`.
- **API calls:** every page calls the shared `api` instance
  (`api/axios.js`) directly with `api.get('/services')` etc. — no
  separate service layer; this keeps the codebase simple and readable for
  a project this size.
- **File uploads:** any form with a file input builds a `FormData` object
  and posts with `Content-Type: multipart/form-data`.
- **Styling:** a single `index.css` using CSS custom properties (`:root`
  variables) for the color theme (burgundy/grey/white/black), so the
  whole palette can be changed from one place. No CSS framework —
  utility classes are hand-written (`.card`, `.panel-card`, `.btn-primary`,
  `.data-table`, `.badge`, etc.) and reused across pages.
- **Icons:** `components/Icons.jsx` — small original inline SVGs (no
  external icon library, avoids licensing questions); every icon
  component forwards props (`className`, `style`) onto the underlying
  `<svg>`.

---

## 9. Known Limitations / Suggested Next Steps

These are deliberate simplifications appropriate for the project's current
stage — noted here so they're easy to pick up later:

1. **No real email sending yet.** Password-reset links and technician
   invite links are returned directly in the API response
   (`devResetToken` / `devInviteToken`) and shown on-screen, clearly
   marked as a developer/testing shortcut. Before real users rely on
   these flows, wire up an email provider (Nodemailer + Gmail/SendGrid/etc.)
   in `authController.js` (`forgotPassword`) and `adminController.js`
   (`inviteTechnician`), and stop returning the token in the response.
2. **Local disk file storage.** Uploaded files live in `backend/uploads/`
   on whatever server the backend runs on — this doesn't survive
   redeploys on most hosting platforms. See `DEPLOYMENT_GUIDE.md` §1A for
   options (persistent volume vs. cloud storage like Cloudinary/S3).
3. **Online payment is implemented for Orders, not yet for Invoices.**
   The same verified-payment pattern (`utils/paystack.js`) could be
   reused to let customers pay service invoices online too, rather than
   only via receipt upload.
4. **No automated tests.** Given the project's scope and timeline, testing
   was manual (syntax-checked and logic-reviewed). Adding a test suite
   (Jest for backend controllers, React Testing Library for frontend)
   would be a natural next step for a production-grade version.
5. **CORS is fully open** (`app.use(cors())` with no restriction) — fine
   for development, should be locked to your real frontend domain before
   launch (see `DEPLOYMENT_GUIDE.md` §6).

---

## 10. Environment Variables Reference

**Backend (`backend/.env`):**
| Variable | Purpose |
|---|---|
| PORT | Port the Express server listens on |
| DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME | MySQL connection |
| JWT_SECRET | Signing key for login tokens — must be long and random |
| JWT_EXPIRES_IN | How long a login session lasts (e.g. `7d`) |
| PAYSTACK_SECRET_KEY | Server-side key used to verify online payments |

**Frontend (`frontend/.env`):**
| Variable | Purpose |
|---|---|
| VITE_PAYSTACK_PUBLIC_KEY | Public key used by the Paystack checkout popup (safe to expose client-side) |

---

## 11. Running the Project

See `START_HERE_GUIDE.md` for full step-by-step setup instructions
(installing Node/MySQL, configuring `.env`, seeding starter data, and
running both the backend and frontend in development). See
`DEPLOYMENT_GUIDE.md` for taking it live.

---

## 12. Change Log — Bug Fixes & Additions

**Inventory going negative (fixed).** `orderController.createOrder` now
locks each product row (`lock: t.LOCK.UPDATE`) inside its database
transaction while checking and decrementing stock. Previously, two
near-simultaneous orders for the same product could both read the stock
count before either had saved its decrement, letting both succeed even
when only one should — this is what let `stockQuantity` go negative.
`productController` also now rejects any attempt (via the admin's manual
edit) to set stock below zero. As a related fix, cancelling an order now
automatically restocks the products it had reserved
(`orderController.updateOrderStatus`), so cancelled orders don't
permanently "lose" inventory.

**Email notifications (added).** `utils/email.js` wraps Nodemailer with a
safe fallback (logs to console instead of throwing if SMTP isn't
configured yet — see `.env.example`). The admin is notified by email on:
new bookings, new emergency requests, new product orders, a payment
receipt uploaded (for either an invoice or an order), an online payment
completed, a new job application, and a new contact message.

**"Pay Online" on Invoices (added).** The customer's "My Invoices &
Payments" tab now has a Pay Online button alongside the existing receipt
upload, matching the Shop's payment options. See §next point for why it
currently shows a "coming soon" message.

**Online payment now shows "coming soon" by default.** A new
`frontend/src/config.js` exports `ONLINE_PAYMENTS_ENABLED` (currently
`false`). While disabled, clicking any "Pay Online" button (Orders or
Invoices) shows a message telling the customer online payment isn't
available yet and to use the receipt upload instead — rather than opening
a Paystack popup that isn't backed by real, configured keys. All the
Paystack integration code from §6.3 is still fully in place; flip that one
flag to `true` once real Paystack keys are set up.

**Job applications — edit/delete (added).** New endpoints:
`PATCH /api/jobs/:jobId/applications/:appId` (admin sets a status —
submitted/reviewed/shortlisted/rejected) and
`DELETE /api/jobs/:jobId/applications/:appId`. Surfaced in the admin
Careers tab alongside the existing CV download.

**Cancelled orders can no longer be paid (fixed).** Both
`submitOrderReceipt` and `verifyOnlinePayment` in `orderController` now
reject the request with a clear message if `order.status === 'cancelled'`.
The customer's Orders tab also stops showing payment options for a
cancelled order and instead shows a notice.

**Portfolio — edit + the image bug (fixed).** `projectController` gained
an `updateProject` function (`PUT /api/projects/:id`, multipart, so the
photo can be replaced), and the admin Portfolio tab now has an Edit mode
per project. Separately — and this was the actual cause of "uploaded
photos don't show on the public page" — `pages/Portfolio.jsx` was
unconditionally rendering the placeholder graphic instead of checking
whether `project.imageUrl` existed; this is fixed to show the real photo
when one has been uploaded.

**Technician deactivation (added).** Rather than a hard delete (which
would orphan their task history), `User` gained an `isActive` field.
`PATCH /api/admin/technicians/:id/deactivate` (and `/reactivate`) flips
it. Critically, `middleware/auth.js`'s `protect` function now looks the
user up fresh on every request and checks `isActive` — not just at
login — so revoking access takes effect immediately, even for a
technician who already has a valid, unexpired login token.

