# Keel — One Dashboard for Your Entire Shop

---

## The Problem

Running a small retail business today means juggling multiple tools:

- A notebook or spreadsheet for inventory
- WhatsApp for customer orders
- Instagram and TikTok for marketing
- A separate website builder (if you have one at all)
- Cash and mobile money for payments

None of these tools talk to each other. You can't see your stock levels while logging a sale. You can't publish a product to your website from your inventory list. You have no single place to check if your business is doing well today.

## The Solution: Keel

Keel is a **mobile-friendly dashboard** that brings everything into one place. From any phone or computer, you can manage your entire retail operation:

- **Inventory** — Add products, track stock levels, get low-stock alerts
- **Sales** — Log sales with one tap, stock deducts automatically, print receipts
- **Dashboard** — See today's sales, top products, slow-moving stock at a glance
- **Social Media** — Schedule Instagram and TikTok posts, track engagement
- **Website** — Publish products to your public website with one click, manage banners and business info
- **Bots** — Coming soon: WhatsApp and Telegram bots for automated customer replies and order updates

## What It Does Now (Working Features)

**Dashboard**
- Daily sales KPI (today's revenue, items sold)
- Low stock alerts at a glance
- Weekly sales chart (view by day/week/month)
- Top 4 best-selling products
- Slow-moving stock report (products with low sales in 30 days)
- Website analytics (page views, traffic sources)

**Inventory**
- Add, edit, and delete products
- Stock adjust with reason tracking (+/- with notes like "restock" or "damaged")
- Full stock movement history log
- Status badges: In Stock, Low Stock, Critical
- Search by product name or category

**Sales**
- Log sales against any product
- Auto-deduct stock on sale
- Payment methods: Cash, M-Pesa, Bank
- Instant receipt modal (shows store name, items, total)
- Search by product or payment method

**Social Media**
- Schedule Instagram and TikTok posts
- Character counter when writing captions
- Track likes, comments, and reach

**Website (Public-Facing)**
- **Listings** — Publish products and services with prices, images, specs
- **Banners** — Hero, Sale, Info, and Alert banners with drag ordering
- **Business Info** — Set opening hours per day (displayed on your website)
- **Gallery** — Showcase product images

**Settings**
- Store name, phone, WhatsApp, address
- Business category (General, Clothing, Electronics, Electricals)
- Currency symbol (KSh, $, TSh, etc.)
- Default payment method
- Low stock threshold
- Dark/Light theme
- Business hours per day
- Custom receipt footer message
- Data export (download everything as JSON)

**Multi-Shop Support**
One account can manage multiple shops. All data is kept separate for each shop.

## Coming Soon

- **WhatsApp Bot** — Automate customer enquiries, send order updates, notify low stock alerts
- **Telegram Bot** — Daily sales reports, stock alerts, manage your shop from Telegram
- **Authentication** — Proper login system (currently placeholder)
- **More payment integrations**

## Who It's For

Keel is built for **small-to-medium retail businesses in East Africa**, especially Kenya:

- Clothing shops (with size and color variants)
- Electronics shops (with storage and color variants)
- Electricals shops
- General retail stores
- Multi-shop owners who want unified management

The system is pre-configured with Kenyan Shilling (KSh) and M-Pesa payments — but works with any currency and payment method.

## Technical Overview (Simple Version)

- **Works on any device** — Phone, tablet, or computer, no app installation needed
- **Your data is safe** — Stored securely on Supabase (PostgreSQL database)
- **Fast** — Built with modern web technology (React)
- **You own your data** — Full export available anytime
- **Hosted on Vercel** — Reliable global hosting

## Current Status

Keel is **pre-1.0 (v0.0.0)** — fully functional with all core features working, but still early-stage. The app has:
- 0 lint errors, 0 warnings
- All 11 pages rendering and functional
- Live Supabase database backing all features
- M-Pesa payment integration configured

## Why Your Support Matters

This project needs support to reach the shop owners who need it most. Your contribution would go toward:

| Item | Purpose |
|------|---------|
| **Hosting costs** | Vercel Pro + Supabase Pro for reliable service |
| **WhatsApp Business API** | Monthly fee for the WhatsApp bot feature |
| **Domain & branding** | Custom domain, email, professional branding |
| **Marketing** | Reaching shop owners in Kenya and East Africa |
| **Development time** | Building the remaining features (bots, auth, etc.) |

## Try It

Keel is live and running. Request access to try the demo — see your products in the dashboard, log a test sale, and explore the website builder. No commitment, no payment.

---

*Built with React, Supabase, and Tailwind CSS. Hosted on Vercel.*
