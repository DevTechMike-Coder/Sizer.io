# Sizer.io — Institutional Risk OS & Position Sizing Terminal

<div align="center">

![Sizer.io Banner](https://img.shields.io/badge/SIZER.IO-Institutional%20Risk%20OS-2563eb?style=for-the-badge&logo=shield&logoColor=white)

[![Next.js](https://img.shields.io/badge/Next.js-16.3.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.9-2d3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Resend](https://img.shields.io/badge/Resend-Email_OTP-000000?style=flat-square&logo=resend)](https://resend.com/)

<p align="center">
  <strong>The high-precision risk management terminal designed for prop firm traders and professional market operators.</strong>
</p>

[Explore Features](#-features) • [Quick Start](#-quick-start) • [Environment Variables](#-environment-variables) • [API Reference](#-api-reference) • [Architecture](#-architecture)

</div>

---

## ⚡ Features

### 🧮 Precision Position Sizing & Risk Modeling
- **Multi-Asset Calculation**: Instant lot and contract sizing for Forex, Crypto, Indices, Commodities, and Equities.
- **Dynamic Invalidation & Stop Loss**: Precise calculation of dollar risk, pip/tick risk, lot multipliers, and Risk-to-Reward (R:R) ratios.
- **Prop Firm Guardrails**: Built-in maximum daily loss cap and trailing drawdown defense alerts to protect funded challenges.

### 🔐 Institutional Authentication & Verification
- **Multi-Factor OTP Email Verification**: Powered by **Resend** and signed stateless JWT challenges.
- **OAuth 2.0 Integration**: Seamless one-click login with Google and GitHub.
- **Secure Cookie Sessions**: HTTP-only, `SameSite=Lax` 30-day session cookies using `jose` HS256 JWT tokens.
- **Password Security**: Strong hashing with `bcryptjs` and automated protection against OAuth credential collision.

### 📊 Live Market Terminal & Charting
- **Interactive Technical Analysis**: Lightweight Charts with dynamic timeframe switches (1M, 5M, 15M, 1H, 4H, 1D).
- **TradingView Market Overviews**: Real-time ticker feeds, cryptocurrency market cap heatmaps, and symbol analytics.
- **Secure Quotes Proxy**: Low-latency backend proxy caching market quotes and masking upstream API credentials.

### 🎨 Institutional Design System
- **High-Contrast Royal Blue & Cyan Theme**: Curated palette built for maximum legibility and reduced eye strain during extended trading sessions.
- **Zero-Flash SSR Hydration**: Instant theme detection synchronized to operating system settings without layout or color flicker.
- **Interactive Visual Signal Hero**: Real-time animated breakout signal and live telemetry matrix.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Frontend Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS Tokens
- **Icons & UI Primitives**: [Lucide React](https://lucide.dev/), [Shadcn UI](https://ui.shadcn.com/) (`input-otp`, `dropdown-menu`, `select`)
- **Charts & Visuals**: [Lightweight Charts](https://tradingview.github.io/lightweight-charts/) & TradingView Widgets
- **Database & ORM**: [Prisma](https://www.prisma.io/) (SQLite for development / PostgreSQL for production)
- **Auth & Tokens**: [jose](https://github.com/panva/jose) (JWT) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Email Delivery**: [Resend](https://resend.com/) & [Nodemailer](https://nodemailer.com/)

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/DevTechMike-Coder/Sizer.io.git
cd Sizer.io
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:

```env
# Application & Database
DATABASE_URL="file:./dev.db"
JWT_SECRET="generate-a-secure-random-base64-secret"

# Email Verification (Resend)
RESEND_API_KEY="re_your_resend_api_key"
EMAIL_FROM="Sizer.io Security <onboarding@resend.dev>"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Market Data APIs
COINGECKO_API="your-coingecko-key"
NEXT_PUBLIC_TWELVEDATA_API_KEY="your-twelvedata-key"
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

| Variable | Required | Description |
| :--- | :---: | :--- |
| `JWT_SECRET` | **Yes** | 256-bit secret key used to sign and verify session tokens and OTP challenges. |
| `RESEND_API_KEY` | **Yes** | API key from Resend for live verification email delivery. |
| `EMAIL_FROM` | No | Verified sender address (defaults to `Sizer.io Security <onboarding@resend.dev>`). |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth 2.0 Web Client ID. |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth 2.0 Client Secret. |
| `GITHUB_CLIENT_ID` | Optional | GitHub OAuth App Client ID. |
| `GITHUB_CLIENT_SECRET` | Optional | GitHub OAuth App Client Secret. |
| `DATABASE_URL` | **Yes** | Connection string for SQLite or PostgreSQL via Prisma. |

---

## 📡 API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/signup` — Registers a new user, hashes password, seeds default risk profile, and emails a 6-digit OTP.
- `POST /api/auth/login` — Verifies user credentials and dispatches an OTP challenge to their email.
- `POST /api/auth/verify-otp` — Validates the 6-digit OTP code and issues a 30-day HTTP-only session cookie (`sizer_session_token`).
- `POST /api/auth/resend-otp` — Generates and emails a new verification code with a 30s rate-limit cooldown.
- `GET /api/auth/me` — Fetches authenticated user information and their associated institutional risk profile.
- `POST /api/auth/logout` — Destroys the active session cookie.
- `GET /api/auth/oauth/[provider]` — Initiates Google or GitHub OAuth handshake with CSRF state protection.
- `GET /api/auth/oauth/[provider]/callback` — Handles OAuth token exchange, profile creation, and OTP issuance.

### Risk Sizing & Trade Journal (`/api/sizer` & `/api/trades`)
- `POST /api/sizer/calculate` — Calculates position size, required lots, margin, dollar risk, and drawdown impact.
- `GET /api/trades` — Retrieves user trade setups and historical calculations.
- `POST /api/trades` — Saves a new trade calculation to the user's journal.
- `DELETE /api/trades/[id]` — Removes a saved trade setup.

### Market Data (`/api/market`)
- `GET /api/market/quotes?symbols=...` — Cached real-time proxy for asset quotes and price action.

---

## 🏛️ Architecture

```
├── app/
│   ├── api/                  # App Router REST Handlers (Auth, Sizer, Trades, Market)
│   ├── auth/                 # Login, Signup, and OTP Verification Pages
│   ├── market/               # Full-featured Live Market Terminal
│   ├── sizer/                # Institutional Risk & Position Sizing Workstation
│   ├── globals.css           # Design Tokens, Oklch Colors & Animations
│   └── layout.tsx            # ThemeProvider & Root Shell
├── components/
│   ├── auth/                 # AuthForm, AuthVisualHero
│   ├── landing/              # Hero, Features, Workstation Preview, Pricing, FAQ
│   ├── marketSummaryComp/    # TradingView Widgets & Technical Feeds
│   ├── sizer/                # PositionSizerWorkstation
│   ├── theme/                # ThemeProvider & System-Sync Toggle
│   └── ui/                   # Shadcn UI Primitives
├── lib/
│   ├── auth.ts               # Jose JWT, Bcrypt & OTP Verification Engine
│   ├── db.ts                 # Atomic Persistence Layer
│   ├── email.ts              # Resend & Nodemailer Email Dispatcher
│   └── prisma.ts             # Prisma Client Export
└── prisma/
    └── schema.prisma         # User, RiskProfile, and TradeSetup Schemas
```

---

## 🛡️ License & Risk Disclaimer

Distributed under the **MIT License**.

> **Financial Disclaimer:** Sizer.io is an educational and workflow tool for risk modeling and mathematical position sizing. It does not provide investment advice, brokerage services, or custody of client funds. Always trade responsibly.
