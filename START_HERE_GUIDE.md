# Blaisetech Global Resources Platform — Step-by-Step Guide

Written for someone who does **not** already know how to code. Follow the
steps in order. Don't skip ahead — each step depends on the one before it.

---

## 1. What you're getting

Two folders:

- **backend/** — the "engine." Handles logins, bookings, quotations,
  invoices, emergency requests, reviews, and job applications. Talks to the
  database. Built with Node.js, Express, and MySQL (Sequelize).
- **frontend/** — the actual website people see and click on: Home,
  Services, Portfolio, Emergency form, Careers, customer dashboard, and
  admin dashboard. Built with React.

They run as two separate programs on your computer (or server) that talk to
each other over the network.

```
blaisetech-platform/
├── backend/
│   ├── config/db.js            → connects to MySQL
│   ├── models/                 → one file per database table
│   ├── controllers/            → the actual logic for each feature
│   ├── routes/                 → the URLs the frontend calls
│   ├── middleware/              → login checks, file upload handling
│   ├── utils/seed.js           → fills the database with starter data
│   └── server.js               → starts everything
└── frontend/
    └── src/
        ├── pages/               → one file per website page
        ├── components/          → reusable pieces (navbar, footer, icons)
        ├── context/AuthContext.jsx → keeps track of who's logged in
        └── api/axios.js         → talks to the backend
```

---

## 2. Install the tools you need (one-time setup)

You only do this once on your computer.

1. **Node.js** (runs the backend and builds the frontend)
   - Go to https://nodejs.org and download the **LTS** version.
   - Install it like any normal program (keep clicking Next).
   - To check it worked, open a terminal (search "Command Prompt" on
     Windows, or "Terminal" on Mac) and type:
     ```
     node -v
     npm -v
     ```
     You should see version numbers, not an error.

2. **MySQL** (the database)
   - Download MySQL Community Server: https://dev.mysql.com/downloads/mysql/
   - During installation, it will ask you to set a **root password** —
     write it down somewhere safe, you'll need it in Step 4.
   - Also install **MySQL Workbench** if offered — it gives you a visual
     way to look at your database later (optional but helpful).

3. **A code editor** (to view/edit files — not required to run the project,
   but useful)
   - Download VS Code: https://code.visualstudio.com

---

## 3. Unzip the project

Unzip the file you downloaded from this chat. You'll get a folder called
`blaisetech-platform` with `backend` and `frontend` inside it. Put it
somewhere easy to find, like your Desktop.

---

## 4. Set up the database

1. Open MySQL Workbench (or the MySQL command line).
2. Log in with the root password you set during installation.
3. Run this one command to create an empty database:
   ```sql
   CREATE DATABASE blaisetech_db;
   ```
   That's it — you don't need to create any tables by hand. The backend
   creates all the tables automatically the first time it runs.

---

## 5. Configure the backend

1. Open the `backend` folder.
2. Find the file named `.env.example`. Make a **copy** of it and rename the
   copy to exactly `.env` (no ".example" at the end).
3. Open `.env` in your code editor and fill in your real values:
   ```
   DB_PASSWORD=your_mysql_root_password_here
   JWT_SECRET=any_long_random_sentence_you_make_up
   ```
   `JWT_SECRET` can be anything — it's just used to sign login tokens
   securely. Something like `blaisetech-secret-key-2026-change-me` is fine
   to start with.

---

## 6. Install and run the backend

1. Open a terminal **inside the `backend` folder**. (In VS Code: right-click
   the `backend` folder → "Open in Integrated Terminal". Or in Command
   Prompt, use `cd path\to\blaisetech-platform\backend`.)
2. Install the backend's dependencies:
   ```
   npm install
   ```
   This downloads everything listed in `package.json`. It may take a
   minute.
3. Fill the database with starter data (a default admin account, sample
   services, one sample portfolio project, one sample job listing):
   ```
   npm run seed
   ```
   You should see messages ending in "🎉 Seeding complete." It will print
   a default admin login:
   ```
   email: admin@blaisetech.com
   password: Admin@12345
   ```
   **Change this password after your first login** (there's no
   "change password" screen built yet — see Section 9 for how to extend
   the project with one, or just update it directly in the database for
   now).
4. Start the backend:
   ```
   npm run dev
   ```
   You should see:
   ```
   ✅ Connected to MySQL database.
   🚀 Server running at http://localhost:5000
   ```
   Leave this terminal window open — closing it stops the backend.

---

## 7. Install and run the frontend

1. Open a **second, separate terminal window** — inside the `frontend`
   folder this time.
2. Install its dependencies:
   ```
   npm install
   ```
3. Start it:
   ```
   npm run dev
   ```
   You'll see something like:
   ```
   VITE ready
   ➜  Local:   http://localhost:5173/
   ```
4. Open that address (`http://localhost:5173`) in your web browser. You
   should see the Blaisetech homepage.

**Both terminals need to stay running at the same time** — one for the
backend (port 5000), one for the frontend (port 5173). The frontend calls
the backend automatically in the background.

---

## 8. Try it out

- **As a visitor:** browse Home, Services, Portfolio, About, Contact,
  Careers, and Emergency.
- **As a customer:** click "Sign Up," create an account, then go to "My
  Dashboard" to book a service, request a quotation, and see your
  bookings/invoices.
- **As the admin:** log out, log back in with `admin@blaisetech.com` /
  `Admin@12345`, then click "Admin Dashboard" to see the overview stats,
  manage bookings, quotations, emergency requests, and add new services.

---

## 9. What's built vs. what you can add next

**Fully working now:**
Website with real copy, service booking, quotation requests, customer
dashboard, admin dashboard with live stats, emergency request form, review
system (API-ready — see note below), portfolio, careers/recruitment with
CV upload, login/register with secure password hashing and JWT sessions,
image/CV uploads.

**Present in the backend API but not yet wired to a page (quick to add
later, following the same pattern as the pages that already exist):**
- A page where a logged-in customer can leave a star review for a
  completed booking (the backend route `POST /api/reviews` is ready).
- Admin screens for portfolio project uploads and job listing management
  (backend routes are ready: `POST /api/projects`, `POST /api/jobs`).
- A "download invoice as PDF" button — right now invoices display in the
  dashboard as a table; turning that into a downloadable PDF is a good
  next feature.
- Photo placeholders on the Home/Portfolio/About pages — swap the dashed
  boxes for your own real project photos whenever you have them (just
  replace the `<PhotoPlaceholder />` component with a real `<img>` tag).

---

## 10. Common problems

**"Cannot connect to database" when starting the backend**
→ Check `.env`: is `DB_PASSWORD` correct? Is MySQL actually running?
  (On Windows, check the "Services" app for "MySQL80" running.)

**"Port 5000 already in use"**
→ Something else is using that port. Either close it, or change `PORT` in
  `.env` to something like `5001` (and update `vite.config.js`'s proxy
  lines to match).

**Frontend loads but shows no services/data**
→ Make sure the backend terminal is still running and shows no errors, and
  that you ran `npm run seed` at least once.

**"npm install" fails**
→ Make sure you're inside the right folder (`backend` or `frontend`) when
  you run it — check with the `dir` (Windows) or `ls` (Mac) command first.

---

## 12. What's new in this update

**1. Forgot / Reset Password** — "Forgot your password?" link on the Login
page. Since no email service is connected yet, the reset link is shown
directly on screen for testing (clearly marked "Developer note"). Before
you launch for real, wire up an email provider (e.g. Nodemailer with Gmail
or a service like SendGrid) in `authController.js`'s `forgotPassword`
function and remove the on-screen `devResetToken`.

**2 & 3. Admin can now edit/delete services, with proper styling** —
Admin Dashboard → **Services** tab. Click **Edit** on any row to change its
name, category, price, or description inline, then **Save**. **Delete**
removes it. The whole section now sits in a styled card instead of a
squeezed inline form.

**4. Sending quotations & invoices** — Admin Dashboard → **Quotations &
Invoices** tab: set a price, then change status to **"Send to customer"**
— it appears in their dashboard immediately. Once they've agreed and you
mark it **Approved**, a **Generate Invoice** button appears — click it to
create a billable invoice the customer can see under "My Invoices."

**5. Elaborate "Book a Service" form** — now asks for urgency level,
detailed fault description, additional notes, preferred time slot,
contact phone, address, and an optional photo — all in a clearer layout.

**6. Updating a service's hardcoded starter price** — don't edit the seed
file (it only runs once, on an empty database). Instead: log in as admin →
**Services** tab → **Edit** the service → change the price → **Save**. The
new price goes live immediately everywhere it's shown.

**7. Emergency page login prompt** — now a properly styled card with clear
buttons instead of plain inline text links.

**8. Technician Dashboard** — a third role alongside customer/admin.
  - Admin creates technician logins: Admin Dashboard → **Technicians** tab
    → "Create a Technician Account." Share the email/password with them.
  - Admin assigns jobs: same tab → "Assign a Task" (optionally linked to a
    specific customer booking).
  - Technicians log in and see **My Tasks** in the navbar → update status
    as they work, and submit a written report when done. Admin sees every
    report in the Technicians tab.

**9. Inventory / online product ordering** — a fourth type of thing
customers can get, alongside services:
  - Admin Dashboard → **Inventory** tab: add products with price, stock,
    category, and photo. Edit price/stock inline.
  - Customers: **Shop** page (public browsing) or the "Shop Products" /
    "My Orders" tabs in their dashboard to actually add to cart and order.
  - Admin Dashboard → **Orders** tab: track and update order status
    (pending → confirmed → shipped → delivered).

**10. Uploading real photos** — two different places use photos:
  - **Portfolio projects** and **Inventory products**: these upload
    *through the app itself*. Admin Dashboard → **Portfolio** tab (or
    **Inventory** tab) → fill the form → attach a photo file → submit. It's
    saved to the server and shown automatically. No file editing required.
  - **Home / About page decorative photos**: these are currently dashed
    "Add project photo here" placeholder boxes (the `<PhotoPlaceholder />`
    component) because the project didn't include specific licensed images.
    To swap one in: put your image file in `frontend/public/images/`
    (create that folder), then in the relevant page file (e.g.
    `src/pages/Home.jsx`), replace `<PhotoPlaceholder label="..." />` with
    `<img src="/images/your-file.jpg" alt="..." style={{ width: '100%', borderRadius: 10 }} />`.

**11. Career applications not showing in admin — this is now fixed.** The
backend was always saving applications correctly, but the Admin Dashboard
had no screen to view them. Admin Dashboard → **Careers** tab → click
**View Applications** on any job listing to see every applicant, their
cover letter, and a **Download CV** link.

---

**Important — since the database structure changed** (new columns and new
tables), stop the backend if it's running, then restart it with
`npm run dev` from the `backend` folder. The line
`sequelize.sync({ alter: true })` in `server.js` will automatically add the
new tables/columns to your existing database — you don't need to recreate
it from scratch, and your existing data is kept.

---

## 14. Second round of updates

**Login page + password visibility** — Login/Register/Reset/technician
setup pages now share a centered card design, and every password field has
an eye icon to reveal what you typed.

**Color scheme** — the dark grey used in the navbar, footer, table headers,
and the shop's sticky cart bar is now dark red (matching the burgundy
theme) instead of near-black grey.

**Quotation workflow changed — customers no longer request quotations.**
The moment a customer submits a booking, a quotation record opens
automatically behind the scenes (they just see "you'll receive a quotation
soon"). Admin Dashboard → **Quotations** tab now lists every one of these,
where you set the amount, can attach a document (PDF or image of a formal
quote), and move it through Draft → Send to Customer → Approved. **The
moment you mark one Approved, an invoice is created automatically** — no
separate "Generate Invoice" click needed anymore.

**Payments** — Admin Dashboard has a new **Payments** tab listing every
invoice. On the customer side, Dashboard → **My Invoices & Payments** lets
them upload a receipt image/PDF and mark it as paid, which flips the
invoice to "pending confirmation." Admin clicks **Confirm Payment** on the
Payments tab once they've checked the receipt.

**Technician self-onboarding** — Admin Dashboard → **Technicians** tab is
now "Invite a Technician" (just name, email, phone — no password field).
It generates a setup link (shown on-screen since no email service is wired
up yet — same pattern as the forgot-password dev link). Share that link
with the technician; they open it, create their own password, and fill in
their home address and specialization themselves.

**Order details** — the Shop checkout now also asks for contact phone,
preferred delivery date, and delivery notes, not just an address. Admin's
**Orders** tab shows all of it.

**Shop page copy** — rewritten with a stronger hero message, four trust/
value cards, and clearer calls to action for logged-out visitors.

**Footer** — redesigned into a four-column layout with a gradient
background, an accent top bar, a proper link list, and a social icon row
(the social links are placeholders — point them at your real pages when
you have them, in `src/components/Footer.jsx`).

**Contact page message/review box** — anyone can now leave a name, optional
email, optional star rating, and a message from the Contact page, with no
account required. Admin Dashboard → **Messages** tab shows everything
submitted.

**Restart reminder:** this update changed the database schema again (new
columns on Users/Quotations/Invoices/Orders, plus a new Messages table).
Just restart the backend (`npm run dev`) — `sequelize.sync({ alter: true })`
updates your existing database automatically and keeps your data.

---

## 16. Third round of updates

**Book a Service (customer) & Quotations (admin) — restyled.** The booking
form is now grouped into clear sections (Job Details, Schedule, Contact &
Location) with small labeled headers. The admin Quotations tab is now a
list of clean cards — one per quotation — instead of a cramped inline form.

**Quotation → Invoice is now a single step.** Admin enters the amount,
optionally attaches a document, and clicks **Send Quotation** — that's it.
It's immediately delivered to the customer as an invoice awaiting payment;
there's no more separate "approve" or "send" stage. A **Reject Request**
button is still there for jobs you can't take on, and **Update & Resend**
lets you revise the amount on an already-sent quotation (it keeps the
customer's invoice in sync automatically, as long as they haven't paid yet).

**"View document" / "view receipt" links restyled** — these are now
proper little buttons with a document/receipt icon, in both the customer
dashboard (My Quotations, My Invoices) and the admin dashboard
(Quotations, Payments, Careers → CV downloads), instead of bare text
links.

**Admin Orders tab redesigned** — was a cramped 8-column table; it's now a
card per order, with the item list, totals, delivery details, and status
dropdown laid out clearly.

**Contact page centering fixed** — the "Leave a Message or a Review" section
was left-aligned instead of centered; it's now properly centered on the
page.

---

## 17. Moving this online (when you're ready to launch for real)

This is now covered by its own dedicated file — see `DEPLOYMENT_GUIDE.md`
in this same folder for the full step-by-step walkthrough (hosting the
database, backend, and frontend; connecting a domain; going live with
Paystack).

For the full technical picture of how the whole system fits together
(architecture, database schema, every API endpoint, key workflows), see
`TECHNICAL_DOCUMENTATION.md`.

---

## 18. Fourth round of updates — bug fixes

**Inventory going below zero — fixed.** This was a real concurrency bug:
two customers checking out the same product at almost the same moment
could both pass the "is there enough stock" check before either had
saved their purchase, so both succeeded even if only one should have.
Product stock is now locked while an order is being placed, so this can't
happen. Cancelling an order also now automatically restocks it.

**Email notifications — added.** The admin now gets an email whenever a
customer books a service, submits an emergency request, places a product
order, uploads a payment receipt (for either an order or a service
invoice), pays online, applies for a job, or sends a Contact page message.
To turn this on, fill in the `SMTP_*` variables and
`ADMIN_NOTIFICATION_EMAIL` in `backend/.env` — instructions are in the
`.env.example` comments (a free Gmail account with an "app password"
works fine to start). Until you fill those in, notifications are just
logged to the backend's console instead of failing anything.

**"Pay Online" added to My Invoices & Payments.** It sits right next to
the existing receipt upload.

**Online payment shows "coming soon" for now.** Both the Orders and
Invoices "Pay Online" buttons currently show a message that online
payment isn't available yet, rather than opening a real checkout — this
is intentional until a real Paystack account is connected (see
`frontend/src/config.js`'s `ONLINE_PAYMENTS_ENABLED` flag — flip it to
`true` once you've set up `PAYSTACK_SECRET_KEY` and
`VITE_PAYSTACK_PUBLIC_KEY` for real). Receipt upload works normally in
the meantime.

**Job applications — you can now edit and delete them.** Admin Dashboard
→ Careers → expand a job's applications → each one now has a status
dropdown (submitted/reviewed/shortlisted/rejected) and a Delete button.

**Cancelled orders can no longer be paid for.** If you cancel a customer's
order, they'll see a notice instead of payment buttons, and the backend
also rejects any payment attempt on a cancelled order directly.

**Portfolio — you can now edit entries, and uploaded photos actually show
up.** Admin Dashboard → Portfolio → each project card has an Edit button
now (including replacing the photo). The bigger issue — uploaded photos
never appearing on the public Portfolio page — was a real bug (the page
was always showing the placeholder graphic regardless of whether a photo
existed) and is now fixed.

**Technicians — you can now revoke a technician's access.** Rather than
deleting their account (which would break their task/report history),
Admin Dashboard → Technicians now has a full roster with a **Revoke
Access** button per technician. This takes effect immediately — even if
they're already logged in with a valid session, they're locked out on
their very next action, not just their next login attempt. **Restore
Access** brings them back if needed.

**Restart reminder:** this update changed the database schema again
(`isActive` on Users, `status` on Applications, plus the order payment
fields from the previous round if you hadn't restarted since then). Just
restart the backend (`npm run dev`) — it updates your existing database
automatically and keeps your data.

---

## 19. Fifth round of updates

**Job listings — full editing added.** Admin Dashboard → Careers → each
job now has an **Edit** button (title, description, requirements,
location, type), not just the old Open/Close toggle. Job postings also
gained an optional **Requirements** field, shown to applicants on the
public Careers page.

**Job applications — status + delete already there, now paired with full
job editing above.**

**Technician — resend a missed activation link.** If a technician never
finished setting up their account (or lost the link), Admin Dashboard →
Technicians → their row now has a **Resend Invite** button — it
invalidates the old link and generates a fresh one. There's also an
**Edit** button to fix a typo'd email/phone/name before resending.

**Fixed: rejected quotations were disappearing permanently.** The admin
Quotations tab was filtering out any quotation once rejected, with no way
to revive it. All quotations now stay visible regardless of status, so a
rejected one can still be priced and sent later if circumstances change.

**Fixed: payment could still be confirmed on a cancelled order.** Closed
a gap where `PATCH /api/orders/:id/confirm-payment` didn't check whether
the order had been cancelled first.

**Added: notification when a technician completes a task.** Rounds out
the "notify admin of activity" request from before — the admin now also
gets an email when a technician marks a task complete and submits their
report.

**Form spacing/styling fixed across the whole site.** Labels were sitting
right on top of their input fields, and file upload inputs looked plain
and cramped. Every form now has proper breathing room between the label,
the field, and the next field, and file inputs have a styled "drop zone"
look instead of the bare browser default.

**Adding a real photo to the About page (or the Home page's decorative
spots)** — these aren't uploaded through the admin dashboard, since
they're fixed marketing content rather than admin-managed data (Portfolio
projects and Inventory products *are* uploaded through the dashboard
already). To swap one in:
1. Drop your image file into `frontend/public/images/` (a README is in
   there with more detail).
2. Open the relevant page — e.g. `frontend/src/pages/About.jsx` — find
   the line `<PhotoPlaceholder ... />`, and replace it with:
   ```jsx
   <img src="/images/your-file.jpg" alt="Our team" style={{ width: '100%', borderRadius: 10 }} />
   ```
That's it — no backend or database involved for these particular spots.

