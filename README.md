# Silk Haus — Luxury Hair Dashboard & E-Commerce

This is the official client dashboard and storefront for Silk Haus, built with **Next.js 16 (App Router)**, **Supabase**, **Tailwind CSS**, and **Shadcn UI**.

## 🚀 Deployment Guide (Vercel)

This project is optimized for deployment on Vercel. 

### 1. Database Setup
Ensure your Supabase project is active and that your database schema is fully up to date. You can run the SQL script found in `supabase/schema.sql` in your Supabase SQL Editor.

### 2. Environment Variables
When deploying to Vercel, you must configure the following Environment Variables in the Vercel project settings (**Settings > Environment Variables**):

#### Supabase Database & Auth
- `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase Anon Key

#### Site Configuration
- `NEXT_PUBLIC_SITE_URL` = Your production domain (e.g., `https://silkhaus.com`)

#### Stripe (International Payments)
- `STRIPE_SECRET_KEY` = Your Stripe Secret Key (e.g., `sk_live_...`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = Your Stripe Publishable Key
- `STRIPE_WEBHOOK_SECRET` = Your Stripe Webhook Secret (obtained after adding a webhook endpoint pointing to `https://yourdomain.com/api/webhooks/stripe`)

#### Paystack (Nigeria/Africa Payments)
- `PAYSTACK_SECRET_KEY` = Your Paystack Secret Key (e.g., `sk_live_...`)
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` = Your Paystack Public Key

### 3. Deploying
1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/new).
3. Import your GitHub repository.
4. Input the environment variables listed above.
5. Click **Deploy**. Vercel will automatically detect Next.js and build the project successfully.

---
## Development

First, run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
