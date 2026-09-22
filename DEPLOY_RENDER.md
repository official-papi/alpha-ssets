# Hosting on Render (Step-by-Step Guide)

This guide walks you through deploying **Alpha Assets** (Next.js + Supabase) on [Render](https://render.com).

---

## 1. Push Latest Configuration to GitHub

Ensure all deployment configurations (`render.yaml`, `.node-version`, `package.json`) are committed and pushed:

```bash
git add .
git commit -m "Configure project for Render deployment"
git push origin main
```

---

## 2. Deploy on Render

### Method A: One-Click Blueprint (Recommended)

1. Log into your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** in the top navigation and select **Blueprint**.
3. Connect your GitHub repository (`official-papi/alpha-ssets`).
4. Render will detect [`render.yaml`](./render.yaml).
5. Fill in the required environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   *(Render will automatically generate `CRON_SECRET` and set `NODE_VERSION=22.12.0`)*.
6. Click **Apply**. Render will install dependencies, build the Next.js app, and start the service!

---

### Method B: Manual Web Service Setup

If you prefer configuring manually:

1. In Render Dashboard, click **New +** -> **Web Service**.
2. Select your GitHub repository (`official-papi/alpha-ssets`).
3. Configure the following settings:
   - **Name**: `alpha-assets` (or your preferred name)
   - **Language / Runtime**: `Node`
   - **Region**: Choose closest to you (e.g. `Oregon (US West)`, `Frankfurt (EU)`)
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: `Free` (or `Starter` for production without spin-down)

4. Under **Environment Variables**, click **Add Environment Variable** and enter:
   | Key | Value |
   | --- | --- |
   | `NODE_VERSION` | `22.12.0` |
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Public Key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase Service Role Secret Key |
   | `CRON_SECRET` | Any strong random string (e.g. `cron_xyz123`) |

5. Click **Deploy Web Service**.

---

## 3. Configure Automated Payouts Cron (`/api/cron/payouts`)

The project includes an automatic payout processor at `/api/cron/payouts` protected by `CRON_SECRET`.

To trigger it daily:

### Option 1: Free external cron scheduler (e.g. cron-job.org)
1. Create a free account on [cron-job.org](https://cron-job.org).
2. Create a new cron job:
   - **URL**: `https://<your-render-service>.onrender.com/api/cron/payouts`
   - **Schedule**: Every day at 00:00 UTC (or your preferred schedule)
   - **Headers**: Add `Authorization`: `Bearer <YOUR_CRON_SECRET>`

*(Bonus: Regular pinging also prevents Render Free tier from going into idle sleep).*

### Option 2: Render Cron Job (Render Dashboard)
1. In Render Dashboard, click **New +** -> **Cron Job**.
2. Command:
   ```bash
   curl -s -H "Authorization: Bearer $CRON_SECRET" https://<your-service>.onrender.com/api/cron/payouts
   ```
3. Schedule: `0 0 * * *` (daily midnight).
