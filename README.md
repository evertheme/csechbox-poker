# csechbox-poker

Next.js front end with a separate Socket.IO game server (`server/`) and Supabase for authentication and data. Node **24+** and npm **10+** are required (see root `package.json` `engines`).

## Local development

**Web app** (from the repository root):

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The main UI lives under `src/app/`.

**Socket.IO server** (in another terminal):

```bash
cd server
npm install
npm run dev
```

Copy environment variables from `.env.example` (root) and `server/.env.example`; point `NEXT_PUBLIC_SOCKET_URL` at your local server (default `http://localhost:3001`). The server reads **`CLIENT_URL`** (not `CLIENT_ORIGIN`) for CORS—set it to your app origin, e.g. `http://localhost:3000`.

## Deployment overview

| Piece | Host | Role |
|--------|------|------|
| Database & auth | [Supabase](https://supabase.com/) | Postgres, auth, RLS |
| Next.js app | [Vercel](https://vercel.com/) | Web UI and API routes |
| Socket.IO server | [Railway](https://railway.app/) | Long-lived WebSocket / HTTP server |

Deploy **Railway first** (or at least have a stable public URL for the socket service), then set `NEXT_PUBLIC_SOCKET_URL` on Vercel to that URL.

---

## 1. Supabase

1. Create a project in the [Supabase dashboard](https://supabase.com/dashboard).
2. Apply migrations from `supabase/migrations/` (Supabase CLI `db push`, or run the SQL in the SQL editor).
3. **Authentication → URL configuration:** set **Site URL** and **Redirect URLs** to your production app URL (e.g. `https://<project>.vercel.app`) and any preview URLs you use.
4. **Project Settings → API:** copy **Project URL** and the **anon public** key for Vercel env vars below.

---

## 2. Vercel (Next.js)

1. Import this Git repository in [Vercel](https://vercel.com/new).
2. Use the **default** Next.js settings: root directory = repository root, install `npm install`, build `npm run`, output automatic.
3. Vercel will use the `engines` field in `package.json` for Node 24+.

### Environment variables (Production)

| Name | Description |
|------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `NEXT_PUBLIC_SOCKET_URL` | Public origin of the Railway socket service, e.g. `https://<your-service>.up.railway.app` |
| `NEXT_PUBLIC_APP_URL` | Optional; your canonical site URL if you use it elsewhere |

### Server Actions origin

`next.config.ts` sets `experimental.serverActions.allowedOrigins`. For production, **add your Vercel hostname** (e.g. `your-app.vercel.app`) to that list so Server Actions are not blocked. Keep `localhost:3000` for local development.

---

## 3. Railway (Socket.IO server)

1. In Railway, **New Project → Deploy from GitHub** and select this repository.
2. Add a **service** for the game server. Set **Root Directory** to `server` so Railway runs installs and builds inside `server/`.
3. **Build command:** `npm ci && npm run build`  
4. **Start command:** `npm start` (runs `node dist/index.js` after TypeScript compile).

### Environment variables (Railway)

| Name | Description |
|------|-------------|
| `NODE_ENV` | `production` |
| `PORT` | Railway usually injects this; the server uses `process.env.PORT` (see `server/src/index.ts`). |
| `CLIENT_URL` | **Exact** browser origin of your Vercel app, e.g. `https://<project>.vercel.app`. Used for Express and Socket.IO CORS. Must match what users type in the address bar (no trailing slash mismatch). |

Railway will assign a public HTTPS URL; put that origin (no path) into Vercel’s `NEXT_PUBLIC_SOCKET_URL`.

### Health check

The server exposes `GET /health` for uptime checks if you enable them in Railway.

---

## Verification

- [ ] Supabase migrations applied and auth redirect URLs include your Vercel URL.
- [ ] Vercel build succeeds; `NEXT_PUBLIC_SOCKET_URL` equals the Railway service URL.
- [ ] Railway `CLIENT_URL` equals the Vercel site URL.
- [ ] Production hostname added to `serverActions.allowedOrigins` in `next.config.ts`.
- [ ] Sign-in and real-time game features work end to end.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Next.js deployment](https://vercel.com/docs/frameworks/nextjs)
- [Railway Node deployment](https://docs.railway.app/guides/nodejs)
