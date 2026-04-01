# 🚀 Deployment Guide (Vercel & Render)

This guide will help you deploy the "Digital Heroes" platform to the cloud.

### Step 1: Frontend & Server Actions (Vercel)
**Vercel** is the best place to host your Next.js application. It will handle the design, the dashboard logic, and your Supabase connections automatically.

1. Create a **GitHub Repository** and push your code.
2. Go to [vercel.com](https://vercel.com) and click **"Add New" > "Project"**.
3. Import your repository.
4. **Environment Variables**:
   - In the "Environment Variables" section, add:
     - `NEXT_PUBLIC_SUPABASE_URL` (Your real URL)
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Your real Key)
5. Click **Deploy**.

### Step 2: Separate Backend (Render - Optional)
If you build a separate Node.js server later for advanced draw processing:
1. Go to [render.com](https://render.com).
2. Create a **New Web Service**.
3. Connect your repository.
4. Use `npm run start` as your start command.

### Step 3: Domain Connection
1. In Vercel Settings, go to **Domains**.
2. Add your domain (e.g., `digitalheroes.co.in`).
3. Follow the instructions to update your DNS records (A record or CNAME).

---

### 🛡️ Accessing the Admin Panel
Once deployed, you can access the admin section at:
**`https://your-domain.com/admin`**

I have also added a hidden "Admin Portal" link in your Profile Settings for testing.
