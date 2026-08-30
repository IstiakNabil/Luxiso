# Deploying Loomino to Render (free tier)

This covers: pushing your code to GitHub, then deploying the database,
backend, and frontend on Render — all on free plans.

---

## Part 1 — Push to GitHub

Run these on **your own machine**, in a terminal, from inside each
project folder.

### If your one repo should hold BOTH backend and frontend (a monorepo)

Put both folders as subfolders of one parent directory, then:

```bash
cd path/to/parent-folder      # the folder containing both loomino-backend and loomino-frontend
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### If you want backend and frontend as SEPARATE repos

Create a second empty repo on GitHub, then run this twice (once per
folder), substituting the matching repo URL each time:

```bash
cd path/to/loomino-backend/loomino
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_BACKEND_REPO.git
git push -u origin main
```

```bash
cd path/to/loomino-frontend/loomino-frontend
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_FRONTEND_REPO.git
git push -u origin main
```

**Before you do this**, double check `.gitignore` exists in both
folders (the backend didn't have one until this pass — it's included
in the zip). Without it you'd commit `venv/`, `node_modules/`,
`__pycache__/`, and any local `.env` file containing real secrets.

If `git push` asks for a password and rejects it: GitHub no longer
accepts account passwords for this. Use a
[Personal Access Token](https://github.com/settings/tokens) as the
password instead, or set up SSH keys.

---

## Part 2 — Create the free Postgres database

1. [render.com](https://render.com) → sign up (GitHub login is easiest)
2. **New → PostgreSQL**
3. Name it anything (e.g. `loomino-db`), choose the **Free** plan
4. Once created, open it and copy these values from the **Connections**
   tab — you'll need them in Part 3:
   - Hostname
   - Port
   - Database
   - Username
   - Password

**Free-tier limit worth knowing now**: Render's free Postgres expires
30 days after creation and is deleted. Fine for a short client test;
you'll need to recreate it (or upgrade) for anything longer-running.

---

## Part 3 — Deploy the backend

1. **New → Web Service** → connect your GitHub account → pick the
   backend repo (or the monorepo, then set **Root Directory** to
   `loomino-backend/loomino`)
2. **Runtime**: Docker (it'll auto-detect the `Dockerfile` in this zip)
3. **Instance Type**: Free
4. Under **Environment**, add these variables:

   | Key | Value |
   |---|---|
   | `SECRET_KEY` | generate one — see below |
   | `DEBUG` | `False` |
   | `ALLOWED_HOSTS` | `your-backend-name.onrender.com` |
   | `CORS_ALLOWED_ORIGINS` | `https://your-frontend-name.onrender.com` |
   | `CSRF_TRUSTED_ORIGINS` | `https://your-backend-name.onrender.com` |
   | `DB_NAME` | from Part 2 |
   | `DB_USER` | from Part 2 |
   | `DB_PASSWORD` | from Part 2 |
   | `DB_HOST` | from Part 2 |
   | `DB_PORT` | from Part 2 |
   | `EMAIL_HOST_USER` | a real email address (see note below) |
   | `EMAIL_HOST_PASSWORD` | its app password |

   You won't know the exact `.onrender.com` name until Render assigns
   it on first deploy — deploy once, see the URL, then come back and
   fix `ALLOWED_HOSTS`/`CSRF_TRUSTED_ORIGINS` to match exactly, then
   redeploy. This is normal and only needed once.

   **Generate `SECRET_KEY`** by running this once, anywhere with Python:
   ```
   python -c "import secrets; print(secrets.token_urlsafe(50))"
   ```

   **Email**: for a real Gmail account, turn on 2-Step Verification,
   then create an [App Password](https://myaccount.google.com/apppasswords)
   — use that, not your normal Gmail password.

5. Click **Create Web Service**. Render builds the Docker image (this
   runs `collectstatic` automatically — already wired into the
   Dockerfile) and starts it.
6. Once live, open the **Shell** tab on the service and run:
   ```
   python manage.py createsuperuser
   ```
   This is your first admin account — the one that can approve
   everyone else via `/django-admin/` (Django's admin is at that path,
   not `/admin/`, on purpose — `/admin/` is where the React app's own
   admin panel lives, and the two can't share a path).

**Free-tier limits worth knowing:**
- The service spins down after 15 minutes idle. The next request
  after that takes ~30–50 seconds to wake up — the client's first
  click after a break will feel slow. This is normal on the free tier.
- **Uploaded files (product images, CMS banners, receipts) are
  wiped on every redeploy or restart.** The disk is ephemeral. Fine
  for a quick demo; if the client needs uploads to persist across
  redeploys, that needs external storage (e.g. Cloudflare R2) added
  later — flag it if this becomes a real problem during testing.

---

## Part 4 — Deploy the frontend

1. **New → Static Site** → same repo (or monorepo with **Root
   Directory** set to `loomino-frontend/loomino-frontend`)
2. **Build Command**: `npm run build`
3. **Publish Directory**: `dist`
4. Add one environment variable:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://your-backend-name.onrender.com/api` |

5. Create the site. Once it's live, copy its `.onrender.com` URL and
   go back to the backend's `CORS_ALLOWED_ORIGINS` env var to make
   sure it matches exactly, then redeploy the backend if you changed it.

Static sites on Render don't spin down and don't cold-start — only
the backend does.

---

## Part 5 — Verify

1. Open the frontend URL — the storefront should load
2. `/admin/login` — log in with the superuser you created
3. `/admin/register` — try creating a second admin account, confirm
   it can't log in yet
4. Open `https://your-backend-name.onrender.com/django-admin/`, log
   in with the superuser, find the pending user under **Accounts →
   Users**, check **Staff status**, save
5. Confirm that second account can now log into `/admin/login`

---

## Known limitations of this free setup

- Backend cold-starts after 15 min idle (~30–50s first request)
- Free Postgres expires after 30 days
- Uploaded media doesn't survive a backend redeploy/restart
- No custom domain on free static sites (you get a `.onrender.com`
  URL) — fine for client testing, not for a final production URL

None of these block testing the actual app; they're the tradeoffs of
"free." When this moves past testing, the Docker Compose + VPS setup
also included in this zip is the path to something more permanent.
