# 🛠️ Project Commands Reference

This guide lists the essential commands for developing, managing, and deploying the **Royal Class Events** platform.

---

## 🚀 Local Development

### Frontend (Next.js)
Start the local development server for the frontend application.
```bash
npm run dev
```

### Backend (Convex)
Start the Convex development server to sync your backend functions and schema in real-time.
```bash
npx convex dev
```

---

## 🏗️ Build & Production

### Create Production Build
Generate a production-ready build of the Next.js application.
```bash
npm run build
```

### Start Production Server
Run the built application in production mode.
```bash
npm start
```

---

## 🧠 Backend Management (Convex)

### Open Convex Dashboard
Access the web-based dashboard to manage data, view logs, and configure environment variables.
```bash
npx convex dashboard
```

### Deploy to Production
Push your local Convex functions and schema to the production environment.
```bash
npx convex deploy
```

### Import Data
Import data into your Convex tables from a JSON or CSV file.
```bash
npx convex import --table <table_name> <file_path>
```

---

## ☁️ Deployment (Cloudflare)

### Cloudflare Pages Preview
Preview your application locally using Wrangler (simulates the Cloudflare environment).
```bash
npx wrangler pages dev .next
```

### Deploy to Cloudflare Pages
Manually trigger a deployment to Cloudflare Pages.
```bash
npx wrangler pages deploy .next
```

---

## 🧹 Maintenance & Quality

### Linting
Run ESLint to check for code quality and style issues.
```bash
npm run lint
```

### Clean Next.js Cache
If you encounter mysterious build issues, clearing the `.next` folder can help.
```bash
rm -rf .next
```

---

> [!TIP]
> **Pro-Tip:** Always keep both `npm run dev` and `npx convex dev` running in separate terminals during development to ensure frontend and backend are perfectly synced. ⚡
