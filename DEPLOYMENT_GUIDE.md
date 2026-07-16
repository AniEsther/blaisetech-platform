# Deploying Blaisetech Global Resources Online

This covers taking the project from "running on my laptop" to "live on
the internet with a real domain." Written for someone who hasn't deployed
a full-stack app before — follow the sections in order.

You're deploying three separate pieces:
1. **The database** (MySQL) — needs to live somewhere permanent
2. **The backend** (Node/Express API) — needs a server to run on
3. **The frontend** (React, built into static files) — needs static hosting

---

## 1. Before you deploy — things to decide and fix

**A. File uploads won't survive on most hosting platforms.**
Right now, uploaded photos/receipts/CVs are saved to
`backend/uploads/` on disk. Most modern hosting platforms (Railway,
Render's free/starter tiers, etc.) wipe the local filesystem every time you
redeploy — meaning uploaded files vanish. Before going live for real, you
have two options:
  - **Easiest for a small/student project:** use a host with a persistent
    disk/volume you can attach (Render's "Disks" feature, or a small VPS).
    No code changes needed — just make sure `backend/uploads` is mounted
    on that persistent disk.
  - **More robust long-term:** switch file storage to a cloud service like
    Cloudinary (free tier, very easy) or AWS S3. This means changing
    `middleware/upload.js` to upload to that service instead of local disk.
    This is a worthwhile upgrade once the site has real users, but isn't
    required to launch.

**B. Get real values for every `.env` variable before deploying** — a
strong `JWT_SECRET`, your live MySQL credentials, and (if you're enabling
online payment) your **live** Paystack secret key, not the test one.

**C. Decide on a domain name** (optional but recommended) — e.g.
`blaisetechglobal.com`. You can buy one from Namecheap, GoDaddy, or
similar (~$10–15/year for a `.com`).

---

## 2. Deploy the database (MySQL)

You need a MySQL database that's reachable from the internet (your local
MySQL install only works while your laptop is on).

Recommended options, easiest first:
- **Railway** (railway.app) — one-click MySQL database, generous free
  tier, gives you a connection string immediately.
- **PlanetScale** or **Aiven** — managed MySQL with free tiers.
- **Render** — offers managed PostgreSQL but not MySQL directly; if you
  go with Render for hosting, pair it with Railway or Aiven for the
  database.

Steps (using Railway as the example):
1. Create a Railway account, click "New Project" → "Provision MySQL."
2. Once it's up, open the database's "Connect" tab — you'll see
   `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`.
3. Keep this tab open — you'll paste these into your backend's environment
   variables in the next step.

---

## 3. Deploy the backend (Node/Express API)

Recommended options, easiest first:
- **Railway** — can host the Node app in the same project as the database.
- **Render** — free/low-cost web service hosting, straightforward.

Steps (Railway example):
1. Push your `backend` folder to a GitHub repository (create one if you
   don't have one — GitHub Desktop is the easiest way if you're new to
   Git).
2. In Railway, "New Project" → "Deploy from GitHub repo" → select your repo.
   If your repo contains both `backend` and `frontend` folders, set the
   **Root Directory** to `backend` in Railway's settings so it knows where
   to build from.
3. Railway auto-detects it's a Node app and runs `npm install` then
   `npm start`. Confirm the **Start Command** is `npm start` and it's
   using `server.js`.
4. Go to the service's **Variables** tab and add every variable from your
   `.env` file — `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   (using the MySQL values from Step 2), `JWT_SECRET`, `JWT_EXPIRES_IN`,
   `PAYSTACK_SECRET_KEY`, and `PORT` (Railway usually sets this
   automatically — check their docs).
5. Deploy. Once live, Railway gives you a public URL like
   `https://blaisetech-backend-production.up.railway.app` — this is your
   API's base URL. Test it by visiting that URL in a browser; you should
   see `{"message":"Blaisetech Global Resources API is running."}`.

---

## 4. Deploy the frontend (React)

The frontend needs to be **built** into static HTML/CSS/JS files, then
hosted somewhere that serves static files.

Recommended options, easiest first:
- **Netlify** (netlify.com) — free tier, drag-and-drop or GitHub-connected
  deploys, very beginner-friendly.
- **Vercel** (vercel.com) — same idea, also excellent for React/Vite apps.

Steps (Netlify example, connected to GitHub):
1. Push your `frontend` folder to GitHub (same repo as the backend is
   fine, or a separate one).
2. In Netlify, "Add new site" → "Import an existing project" → connect
   your GitHub repo.
3. Set:
   - **Base directory:** `frontend` (if it's in the same repo as backend)
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
4. Add an environment variable: `VITE_PAYSTACK_PUBLIC_KEY` with your
   **live** Paystack public key.
5. **Important:** update `frontend/vite.config.js`'s proxy settings — that
   proxy only works during local development. For production, you need
   the frontend to call your real backend URL. The cleanest fix: change
   `frontend/src/api/axios.js`'s `baseURL` from `/api` to your deployed
   backend URL plus `/api`, e.g.:
   ```js
   const api = axios.create({
     baseURL: 'https://your-backend-url.up.railway.app/api',
   });
   ```
   Consider making this an environment variable
   (`VITE_API_BASE_URL`) so you don't hardcode it, following the same
   pattern as the Paystack key above.
6. Deploy. Netlify gives you a URL like `https://blaisetech.netlify.app`
   immediately — or connect your custom domain under Site Settings →
   Domain Management.

---

## 5. Connect your custom domain (optional)

Both Netlify and Railway let you add a custom domain under their
"Domain" settings — you'll add a couple of DNS records (usually a
`CNAME` or `A` record) at wherever you bought the domain (Namecheap,
GoDaddy, etc.). Each platform shows you exactly which records to add.
Typically:
- `www.yourdomain.com` → points to your Netlify frontend
- `api.yourdomain.com` → points to your Railway backend

---

## 6. Update CORS once you have real URLs

Right now, `backend/server.js` has `app.use(cors())` with no
restrictions, which allows requests from anywhere — fine for development,
but you should lock it down once you have a real frontend domain:

```js
app.use(cors({
  origin: 'https://yourdomain.com', // your live frontend URL
}));
```

---

## 7. Go live with Paystack

While developing, you used Paystack's **test** keys (`pk_test_...` /
`sk_test_...`) — payments made with those never move real money. To
accept real payments:
1. In your Paystack dashboard, complete their business verification
   process (required before you can go live).
2. Switch to your **live** keys (`pk_live_...` / `sk_live_...`).
3. Update `PAYSTACK_SECRET_KEY` on your backend host and
   `VITE_PAYSTACK_PUBLIC_KEY` on your frontend host with the live values.
4. Do a real, small test transaction yourself before announcing the shop
   is live.

---

## 8. A simple pre-launch checklist

- [ ] Database deployed and reachable
- [ ] Backend deployed, `.env` variables all set with real values
- [ ] `npm run seed` run once against the **production** database (creates
      your admin login and starter services — do this via Railway's
      console/shell feature, not your local machine)
- [ ] Frontend deployed, pointing at the real backend URL
- [ ] File uploads tested — confirm a photo you upload is still there
      after a redeploy
- [ ] CORS locked to your real domain
- [ ] Paystack switched to live keys, one real test payment made
- [ ] Default admin password (`Admin@12345`) changed
- [ ] Custom domain connected (if using one)

---

## 9. Ongoing costs to expect

- Domain name: ~$10–15/year
- Database + backend hosting: many platforms have a free tier sufficient
  for a small business site; expect $5–20/month once traffic grows
  past free-tier limits
- Frontend hosting: usually free on Netlify/Vercel for a site this size
- Paystack: no monthly fee, they take a small percentage per transaction

This is enough to get a real, working version of the site live. If you
run into a specific error during any of these steps, share the exact
error message and I can help you troubleshoot it.
