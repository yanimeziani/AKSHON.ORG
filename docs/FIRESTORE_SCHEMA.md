# Firestore Database Schema

This document defines the Firestore collections and document structure for the AKSHON.ORG platform.

## Collections

### 1. `leads`
Stores lead information captured from the GetEdgeJourney modal.

**Document Structure:**
```typescript
{
  id: string; // Auto-generated
  email: string;
  tier: "Researcher" | "Arbitrageur";
  timestamp: Timestamp;
  source: string; // e.g., "landing-page", "pricing-page"
  status?: "pending" | "contacted" | "converted" | "declined";
  notes?: string;
}
```

**Indexes:**
- `timestamp` (descending)
- `tier` + `timestamp`
- `status` + `timestamp`

---

### 2. `payments`
Stores payment records for both Stripe and cryptocurrency payments.

**Document Structure:**
```typescript
{
  id: string; // Auto-generated
  email: string;
  tier: "Researcher" | "Arbitrageur";
  billingCycle: "monthly" | "annually";
  price: number; // Amount in USD
  timestamp: Timestamp;

  // Payment method specific fields
  paymentMethod: "stripe" | "crypto";

  // For Stripe payments
  stripeSessionId?: string;
  stripePaymentIntentId?: string;

  // For crypto payments
  txHash?: string;
  network?: "ethereum" | "polygon" | "bsc";
  walletAddress?: string;
  cryptoAmount?: number;
  cryptoCurrency?: string;

  // Status tracking
  status: "pending" | "completed" | "failed" | "refunded";
  verifiedAt?: Timestamp;

  // Metadata
  metadata?: Record<string, any>;
}
```

**Indexes:**
- `timestamp` (descending)
- `email` + `timestamp`
- `status` + `timestamp`
- `tier` + `timestamp`
- `txHash` (for crypto payment lookups)

---

### 3. `analytics`
Stores user analytics events for tracking user behavior.

**Document Structure:**
```typescript
{
  id: string; // Auto-generated
  type: "page_view" | "click" | "download" | "lead_capture_view" | "lead_capture_submit" | "payment_initiated" | "payment_completed";
  path: string;
  userId?: string;
  sessionId?: string;
  timestamp: Timestamp;
  metadata?: {
    referrer?: string;
    userAgent?: string;
    location?: string;
    [key: string]: any;
  };
}
```

**Indexes:**
- `timestamp` (descending)
- `type` + `timestamp`
- `userId` + `timestamp`
- `sessionId` + `timestamp`

---

### 4. `insights` (NEW)
Stores AI-generated synthesis insights for the dashboard.

**Document Structure:**
```typescript
{
  id: string; // Auto-generated
  title: string;
  description: string;
  category: "biology" | "physics" | "computer-science" | "chemistry" | "mathematics" | "interdisciplinary";
  tags: string[];
  impact: "high" | "medium" | "low";
  confidence: number; // 0-100
  sources: Array<{
    title: string;
    url?: string;
    arxivId?: string;
    authors?: string[];
  }>;
  publishedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  featured?: boolean;
  viewCount?: number;
}
```

**Indexes:**
- `publishedAt` (descending)
- `category` + `publishedAt`
- `impact` + `publishedAt`
- `featured` + `publishedAt`

---

### 5. `research_feed` (NEW)
Stores research papers and articles for the feed.

**Document Structure:**
```typescript
{
  id: string; // Auto-generated or arxivId
  title: string;
  authors: string[];
  abstract: string;
  category: string;
  arxivId?: string;
  doi?: string;
  pdfUrl?: string;
  publishedAt: Timestamp;
  submittedAt?: Timestamp;
  updatedAt?: Timestamp;
  tags: string[];
  citationCount?: number;
  fields: string[];
  summary?: string; // AI-generated summary
  relevanceScore?: number; // 0-100
  featured?: boolean;
}
```

**Indexes:**
- `publishedAt` (descending)
- `category` + `publishedAt`
- `tags` (array-contains)
- `featured` + `publishedAt`
- `relevanceScore` + `publishedAt`

---

### 6. `dataset_packs` (NEW)
Stores dataset pack information for the datasets page.

**Document Structure:**
```typescript
{
  id: string; // Auto-generated
  name: string;
  category: "finance" | "code" | "biology" | "systems" | "other";
  icon: string; // Lucide icon name
  description: string;
  fileCount: number;
  totalSize: number; // in bytes
  lastUpdated: Timestamp;
  downloadUrl?: string;
  gcpPath?: string;
  tags: string[];
  tier: "free" | "researcher" | "arbitrageur"; // Access level required
  format: string[]; // e.g., ["json", "csv", "parquet"]
  schemaUrl?: string;
  sampleDataUrl?: string;
  documentation?: string;
  featured?: boolean;
}
```

**Indexes:**
- `category` + `lastUpdated`
- `tier` + `lastUpdated`
- `featured` + `lastUpdated`
- `tags` (array-contains)

---

### 7. `users`
Stores user profile and subscription information.

**Document Structure:**
```typescript
{
  id: string; // Firebase Auth UID
  email: string;
  displayName?: string;
  photoURL?: string;
  tier: "free" | "Researcher" | "Arbitrageur";
  subscriptionStatus: "active" | "inactive" | "trial" | "expired";
  subscriptionStartDate?: Timestamp;
  subscriptionEndDate?: Timestamp;
  billingCycle?: "monthly" | "annually";

  // Payment history reference
  paymentIds: string[]; // References to payment documents

  // Access tracking
  lastLoginAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Usage stats
  apiCallsThisMonth?: number;
  downloadCount?: number;

  // Preferences
  preferences?: {
    emailNotifications?: boolean;
    categories?: string[];
    [key: string]: any;
  };

  // Admin flag
  isAdmin?: boolean;
}
```

**Indexes:**
- `email` (unique)
- `tier` + `updatedAt`
- `subscriptionStatus` + `subscriptionEndDate`

---

### 8. `audit_logs` (NEW)
Stores security and access audit logs.

**Document Structure:**
```typescript
{
  id: string; // Auto-generated
  userId?: string;
  action: "login" | "logout" | "download" | "api_access" | "honeypot_triggered" | "unauthorized_access";
  resource?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Timestamp;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
  severity: "info" | "warning" | "critical";
}
```

**Indexes:**
- `timestamp` (descending)
- `userId` + `timestamp`
- `action` + `timestamp`
- `severity` + `timestamp`

---

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isSignedIn() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // Leads collection - write only for new leads
    match /leads/{leadId} {
      allow read: if isAdmin();
      allow create: if true; // Anyone can create a lead
      allow update, delete: if isAdmin();
    }

    // Payments collection
    match /payments/{paymentId} {
      allow read: if isAdmin() || (isSignedIn() && resource.data.email == request.auth.token.email);
      allow create: if isSignedIn();
      allow update: if isAdmin();
      allow delete: if false; // Never delete payments
    }

    // Analytics collection
    match /analytics/{eventId} {
      allow read: if isAdmin();
      allow create: if true; // Anyone can track analytics
      allow update, delete: if isAdmin();
    }

    // Insights collection
    match /insights/{insightId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }

    // Research feed collection
    match /research_feed/{paperId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }

    // Dataset packs collection
    match /dataset_packs/{packId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }

    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }

    // Audit logs collection
    match /audit_logs/{logId} {
      allow read: if isAdmin();
      allow create: if true; // System can create logs
      allow update, delete: if false; // Logs are immutable
    }
  }
}
```

---

## Data Migration Guide

### Step 1: Set up Firestore collections
Run the Firebase console and create the collections listed above.

### Step 2: Populate initial data
Use the provided scripts to populate initial data:
- `/scripts/seed-insights.ts` - Seed AI insights
- `/scripts/seed-research-feed.ts` - Seed research papers from arXiv
- `/scripts/seed-datasets.ts` - Seed dataset packs

### Step 3: Configure indexes
Deploy the indexes defined above using Firebase CLI:
```bash
firebase deploy --only firestore:indexes
```

### Step 4: Deploy security rules
```bash
firebase deploy --only firestore:rules
```

---

## API Integration Points

### Frontend → Firestore
- Dashboard: Read from `insights` and `research_feed`
- Datasets page: Read from `dataset_packs`
- Admin page: Read from `leads`, `payments`, `analytics`
- User profile: Read/write to `users`

### Backend → Firestore
- `/api/synthesis`: Read from `insights` collection
- `/api/feed`: Read from `research_feed` collection
- `/api/datasets`: Read from `dataset_packs` collection
- Payment webhooks: Write to `payments` collection
- Auth hooks: Write to `users` collection

---

## Monitoring & Optimization

1. **Query Optimization**: Use composite indexes for common query patterns
2. **Data Retention**: Archive old analytics data older than 90 days
3. **Cost Monitoring**: Track read/write operations
4. **Real-time Listeners**: Limit to essential collections only
5. **Caching**: Implement client-side caching for static data (insights, research feed)
