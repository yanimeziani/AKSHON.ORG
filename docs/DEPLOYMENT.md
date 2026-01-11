# AKSHON.ORG Deployment Guide

This guide provides step-by-step instructions for deploying the AKSHON.ORG platform to production on Vercel with full Firebase backend integration.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Firebase Configuration](#firebase-configuration)
4. [Stripe Configuration](#stripe-configuration)
5. [Blockchain Verification Setup](#blockchain-verification-setup)
6. [Vercel Deployment](#vercel-deployment)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Post-Deployment](#post-deployment)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [x] Node.js 20+ installed
- [x] Firebase project created
- [x] Stripe account (for payments)
- [x] Vercel account
- [x] GitHub repository access
- [x] GCP account (for research corpus storage)
- [x] Blockchain explorer API keys (Etherscan, BaseScan, ArbScan, PolygonScan)

---

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yanimeziani/AKSHON.ORG.git
cd AKSHON.ORG
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Now edit `.env.local` with your actual credentials.

---

## Firebase Configuration

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow the setup wizard
4. Enable Authentication (Email/Password and Google OAuth)
5. Create a Firestore Database
6. Enable Cloud Storage

### 2. Get Firebase Credentials

1. In Firebase Console, go to Project Settings
2. Scroll to "Your apps" section
3. Click the web icon `</>`
4. Register your app (name it "AKSHON Web")
5. Copy the config values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Set Up Firestore Collections

Follow the schema defined in `docs/FIRESTORE_SCHEMA.md` to create the following collections:

- `leads` - Lead capture data
- `payments` - Payment records
- `analytics` - User analytics
- `insights` - AI synthesis insights
- `research_feed` - Research papers
- `dataset_packs` - Dataset information
- `users` - User profiles
- `audit_logs` - Security audit logs

### 4. Configure Firestore Security Rules

```bash
firebase deploy --only firestore:rules
```

Use the rules provided in `docs/FIRESTORE_SCHEMA.md`.

### 5. Configure Firebase Authentication

1. Go to Authentication > Sign-in method
2. Enable Email/Password
3. Enable Google OAuth
4. Add authorized domains (your production domain)

---

## Stripe Configuration

### 1. Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to Developers > API keys
3. Copy your **Publishable key** and **Secret key**

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

⚠️ **Important:** Use test keys for development, live keys for production.

### 2. Configure Webhooks (Optional)

If you want to receive Stripe webhook events:

1. Go to Developers > Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events to listen to
4. Copy the webhook signing secret

---

## Blockchain Verification Setup

To enable real crypto payment verification, obtain API keys from blockchain explorers:

### 1. Etherscan (for Ethereum Mainnet)

1. Go to [Etherscan](https://etherscan.io/)
2. Sign up and go to "My API Keys"
3. Create a new API key

```env
NEXT_PUBLIC_ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 2. BaseScan (for Base Network)

1. Go to [BaseScan](https://basescan.org/)
2. Sign up and get API key

```env
NEXT_PUBLIC_BASESCAN_API_KEY=your_basescan_api_key
```

### 3. ArbScan (for Arbitrum)

1. Go to [ArbScan](https://arbiscan.io/)
2. Sign up and get API key

```env
NEXT_PUBLIC_ARBISCAN_API_KEY=your_arbiscan_api_key
```

### 4. PolygonScan (for Polygon)

1. Go to [PolygonScan](https://polygonscan.com/)
2. Sign up and get API key

```env
NEXT_PUBLIC_POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

---

## Vercel Deployment

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Link Project to Vercel

```bash
vercel link
```

Follow the prompts to link your project.

### 3. Set Environment Variables in Vercel

You can set environment variables via:

**Option A: Vercel Dashboard**

1. Go to your project in Vercel Dashboard
2. Navigate to Settings > Environment Variables
3. Add all variables from `.env.example`

**Option B: Vercel CLI**

```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
# ... repeat for all variables
```

**Option C: Using the provided vercel.json**

The `vercel.json` file is pre-configured to pull environment variables from Vercel secrets. Make sure to set up secrets:

```bash
vercel secrets add firebase-api-key "your_value"
vercel secrets add firebase-auth-domain "your_value"
# ... etc.
```

### 4. Deploy to Production

```bash
vercel --prod
```

Or push to the `main` branch and let GitHub Actions handle deployment automatically.

---

## CI/CD Pipeline

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically:

1. Lints code
2. Builds the application
3. Deploys preview for PRs and `claude/*` branches
4. Deploys to production for `main`/`master` branches

### Setting Up GitHub Secrets

Add the following secrets to your GitHub repository:

1. Go to Settings > Secrets and variables > Actions
2. Add the following secrets:

```
VERCEL_TOKEN - Your Vercel token (get from Vercel Account Settings)
VERCEL_ORG_ID - Your Vercel organization ID
VERCEL_PROJECT_ID - Your Vercel project ID
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_BASE_URL
GCP_PROJECT_ID
GCP_BUCKET_NAME
```

### Getting Vercel Token

```bash
vercel login
vercel token create
```

### Getting Vercel IDs

```bash
vercel project ls
# Copy your project ID

vercel teams ls
# Copy your org ID
```

---

## Post-Deployment

### 1. Verify Deployment

After deployment, verify:

- [x] Homepage loads correctly
- [x] Firebase authentication works
- [x] Dashboard displays data
- [x] Stripe checkout works
- [x] Crypto payment verification works
- [x] Dataset page loads
- [x] Admin dashboard accessible (restricted)

### 2. Populate Firestore Data

To populate your Firestore with initial data:

1. Use the Firebase Console to manually add documents
2. Run seed scripts (if created)
3. Import data from JSON files

Example: Add sample insights to `insights` collection:

```javascript
{
  title: "AlphaFold 3 Convergence",
  description: "Predicted structural anomalies in protein folding...",
  category: "biology",
  tags: ["protein-folding", "AI", "drug-discovery"],
  impact: "high",
  confidence: 98,
  sources: [
    {
      title: "Isomorphic Labs",
      url: "https://isomorphiclabs.com"
    }
  ],
  publishedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  featured: true
}
```

### 3. Set Up Admin Access

Update the admin email in your environment variables or directly in the code:

```env
ADMIN_EMAIL=your-admin-email@example.com
```

Or update `app/admin/page.tsx` to use the environment variable instead of hardcoded email.

### 4. Configure DNS (Optional)

If using a custom domain:

1. Add domain in Vercel Dashboard
2. Update DNS records at your domain registrar
3. Update `NEXT_PUBLIC_BASE_URL` environment variable

### 5. Enable Analytics

Firebase Analytics is already integrated. To view analytics:

1. Go to Firebase Console > Analytics
2. View user engagement, page views, and custom events

---

## Troubleshooting

### Build Fails on Vercel

**Error:** "Missing required Firebase environment variables"

**Solution:** Ensure all Firebase env vars are set in Vercel dashboard

---

### Authentication Not Working

**Error:** "Firebase: Error (auth/invalid-api-key)"

**Solution:**
- Check that `NEXT_PUBLIC_FIREBASE_API_KEY` is correct
- Ensure the domain is added to Firebase authorized domains

---

### Stripe Payments Failing

**Error:** "Invalid API key provided"

**Solution:**
- Verify `STRIPE_SECRET_KEY` is set correctly
- Ensure you're using live keys in production (not test keys)

---

### Crypto Verification Not Working

**Error:** "No API key configured for {network}"

**Solution:**
- Add blockchain explorer API keys to environment variables
- Verify the API keys are valid

---

### Empty Dashboard Data

**Issue:** Dashboard shows "No insights available"

**Solution:**
- Populate Firestore with data (see Post-Deployment section)
- Check Firestore security rules allow reads
- Verify API routes are working: `/api/synthesis`, `/api/feed`

---

## Security Checklist

Before going to production:

- [x] All environment variables use production values (not test/dummy data)
- [x] Firebase security rules are properly configured
- [x] Stripe webhook endpoint is secured (if using webhooks)
- [x] GCP service account has minimal required permissions
- [x] Admin dashboard is restricted to authorized emails only
- [x] HTTPS is enforced (Vercel does this automatically)
- [x] CSP headers are configured (already in `next.config.ts`)

---

## Performance Optimization

### Caching

The API routes already implement proper caching:
- Server-side rendering for static pages
- `no-store` cache for dynamic data (dashboard, datasets)

### Database Indexing

Ensure Firestore indexes are created for:
- `insights` collection: `publishedAt` (descending)
- `research_feed` collection: `publishedAt` (descending)
- `dataset_packs` collection: `lastUpdated` (descending)
- `payments` collection: `timestamp` (descending)

Firebase will prompt you to create indexes when needed via the console.

---

## Monitoring

### Vercel Analytics

Enable Vercel Analytics in the dashboard for:
- Page load times
- User sessions
- Geographic distribution
- Real User Monitoring (RUM)

### Firebase Monitoring

Use Firebase Performance Monitoring:
- Network request latency
- App startup time
- Screen rendering performance

### Error Tracking

Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- Datadog for infrastructure monitoring

---

## Backup Strategy

### Firestore Backups

1. Enable automated backups in Firebase Console
2. Export data regularly:

```bash
firebase firestore:export gs://your-bucket/backups
```

### Environment Variables Backup

Keep a secure backup of all environment variables in a password manager or secure vault.

---

## Rollback Procedure

If deployment fails:

1. **Vercel Dashboard:**
   - Go to Deployments
   - Find previous working deployment
   - Click "Promote to Production"

2. **Via CLI:**
```bash
vercel rollback
```

3. **Via Git:**
```bash
git revert <commit-hash>
git push origin main
```

---

## Support

For issues or questions:

- GitHub Issues: [https://github.com/yanimeziani/AKSHON.ORG/issues](https://github.com/yanimeziani/AKSHON.ORG/issues)
- Firebase Support: [https://firebase.google.com/support](https://firebase.google.com/support)
- Vercel Support: [https://vercel.com/support](https://vercel.com/support)

---

## Next Steps

After successful deployment:

1. Monitor application performance
2. Set up alerts for errors and downtime
3. Implement email notifications for payments
4. Add more features as needed
5. Scale infrastructure based on usage

---

**Last Updated:** 2026-01-11
**Version:** 1.0.0
