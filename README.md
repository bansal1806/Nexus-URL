# NexusURL 🛰️

NexusURL is a high-performance, distributed URL shortening infrastructure designed for massive scale and sub-50ms redirection latency. Built as a senior-level portfolio project to demonstrate mastery in systems design, distributed IDs, and edge computing.

## 🚀 "Master Level" Concepts Included

### 1. Distributed ID Generation (Snowflake)
Instead of relying on simple auto-incrementing database IDs, Nexus utilizes a custom **Snowflake ID Generator**.
- **Collision-Free**: Produces globally unique 64-bit IDs across multiple server instances.
- **Timestamp Sorted**: IDs are naturally ordered by time, improving database indexing and range query performance.
- **Bitwise Layout**: 41 bits for timestamp, 10 bits for machine ID, 12 bits for sequence.

### 2. High-Performance Hashing (Base62)
Numeric Snowflake IDs are encoded into **Base62 strings** (`0-9`, `a-z`, `A-Z`).
- **Short & Elegant**: Converts large numbers like `7429184712` into 6-character strings like `6kX9q1`.
- **URL Safe**: No special characters, ensuring compatibility across all platforms.

### 3. Edge Computing & Low Latency (Middleware)
Traditional redirectors query the DB on every request. Nexus uses **Vercel Edge Middleware**.
- **Cache-Aside Pattern**: Middleware first checks an **Upstash Redis** cache at the Edge.
- **Zero-Latency**: Cached redirects occur before the request even hits the main server, often in **< 50ms**.
- **Rewrite Logic**: On cache misses, a server-side "Resolver" updates the cache synchronously.

### 4. Database Optimization & Indexing
- **B-Tree Indexing**: The `shortCode` column is uniquely indexed, ensuring O(log n) lookups.
- **Aggregate Analytics**: Analytics are logged atomically to prevent race conditions during click count increments.
- **Prisma Client**: Utilizes a singleton pattern optimized for serverless environments.

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **State/Animations**: Framer Motion
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Cache**: Redis (Upstash)
- **Styling**: Tailwind CSS / Glassmorphism

## 📦 Getting Started

1. **Clone & Install**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Copy `.env.example` to `.env` and provide your Supabase and Upstash credentials.

3. **Database Push**:
   ```bash
   npx prisma db push
   ```

4. **Run**:
   ```bash
   npm run dev
   ```

---
*Created with ❤️ for senior developer portfolios.*
