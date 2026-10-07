# Running the Mobile App Against a Deployed Backend

This guide explains how to connect the ClientOS mobile app (Expo/React Native) to a live, deployed backend — instead of your local development machine.

---

## How the Mobile App Connects to the Backend

The mobile app uses a smart URL resolver in `mobile/src/api/axios.ts` that automatically picks the right backend address depending on how you're running the app:

| Environment | Auto-resolved URL |
|-------------|-------------------|
| Physical phone via Expo Go | Your machine's local IP (e.g., `192.168.1.x:5000`) |
| Android emulator | `http://10.0.2.2:5000/api` |
| iOS simulator | `http://localhost:5000/api` |
| **Production / Deployed backend** | Must be set manually (see below) |

---

## Option 1 — Run Against Your Local Backend (Default)

This is the default behaviour — no changes needed.

1. Start the backend on your machine:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the mobile app:
   ```bash
   cd mobile
   npm start
   ```

3. Open it on your phone via **Expo Go** — make sure your phone is on the **same Wi-Fi network** as your computer.

The app will automatically detect your machine's local IP and connect to your backend on port `5000`. You'll see a log line in the Expo console like:
```
[API] Resolved Expo Go Host IP: http://192.168.1.42:5000/api
```

---

## Option 2 — Run Against a Deployed Backend (Production)

If you've deployed the backend to a cloud service (e.g., Railway, Render, Heroku, AWS), follow these steps:

### Step 1 — Get your deployed backend URL

It will look something like:
```
https://clientos-api.railway.app
```
or
```
https://your-backend.onrender.com
```

### Step 2 — Update the fallback URL in the mobile app

Open `mobile/src/api/axios.ts` and find the `getBaseUrl()` function at the top. Update the final `return` statement at the bottom:

```typescript
// Before (local development):
return 'http://localhost:5000/api';

// After (deployed backend):
return 'https://your-deployed-backend.com/api';
```

The full function looks like this:

```typescript
const getBaseUrl = () => {
    try {
        const hostUri = Constants.expoConfig?.hostUri || ...;
        if (hostUri) {
            const hostIp = hostUri.split(':')[0];
            if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
                return `http://${hostIp}:5000/api`; // Local dev
            }
        }
    } catch (e) {}

    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:5000/api'; // Android emulator
    }
    
    // ⬇️ Change this to your deployed backend URL:
    return 'https://your-deployed-backend.com/api';
};
```

### Step 3 — Restart the Expo dev server

```bash
cd mobile
npm start -- --clear
```

The `--clear` flag clears the Metro bundler cache so your URL change takes effect immediately.

---

## Option 3 — Use an Environment-Based URL (Best Practice for Teams)

For cleaner configuration without editing source code, you can use `expo-constants` with an `app.config.js` file.

### Step 1 — Create `mobile/app.config.js`

```javascript
export default {
  name: "ClientOS",
  slug: "clientos",
  extra: {
    apiUrl: process.env.API_URL || "http://localhost:5000/api",
  },
};
```

### Step 2 — Read it in `axios.ts`

```typescript
import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  // ...
});
```

### Step 3 — Pass the URL when starting Expo

```bash
API_URL="https://your-deployed-backend.com/api" npm start
```

---

## Verifying the Connection

Once the mobile app is running, try logging in or registering. If the connection works:
- You'll land on the Dashboard screen
- Projects and tasks will load from the server

If the connection fails, you'll see a network error toast. Double-check:

1. The backend URL is correct (no trailing slash, `/api` at the end)
2. The deployed backend has CORS enabled (ClientOS already sets `origin: true` in Express)
3. Your deployed backend is actually running (visit `https://your-backend.com/health` in a browser — you should see `{ "status": "ok" }`)

---

## CORS Note

The backend is already configured to accept requests from **any origin**:

```typescript
// backend/src/index.ts
app.use(cors({
    origin: true,
    credentials: true,
}));
```

This means your mobile app can connect to the backend from any IP or domain without CORS issues. If you ever restrict this to specific origins in production, make sure to whitelist your Expo app's URL.

---

## Quick Reference

| Scenario | What to do |
|----------|------------|
| Local dev with physical phone | Just run `npm start` — auto-detects IP |
| Local dev with Android emulator | Default `10.0.2.2` works out of the box |
| Connecting to deployed backend | Update the `return` at bottom of `getBaseUrl()` in `axios.ts` |
| Team project with shared backend | Use `app.config.js` with `API_URL` env variable |
