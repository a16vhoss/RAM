# How to Build the RAM Mobile App

## Prerequisites
1.  **Xcode** (install from Mac App Store) - Required for iOS
2.  **CocoaPods** (`sudo gem install cocoapods`) - Sometimes needed
3.  **Capacitor** (already installed in project)

## Configuration
Ensure your `.env.local` or `.env.production` has:
```bash
NEXT_PUBLIC_API_URL=https://ram-weld-zeta.vercel.app
```
This is critical so the app knows where to send API requests (since it runs on `localhost` on the phone).

### 3. Build the Static Export
We have created a helper script to build the mobile version. This script temporarily handles the necessary file adjustments (hiding API routes and middleware) to ensure a successful static export.

```bash
npm run build:mobile
```

This command will:
1. Temporarily move `app/api` and `middleware.js` to avoid build errors.
2. Run `next build` with `APP_ENV=mobile`.
3. Restore the files after the build.


## 2. Sync with Capacitor
Copy the `out` folder to the native projects.
```bash
npx cap sync
```

## 3. Build for iOS
Open the project in Xcode.
```bash
npx cap open ios
```
1.  In Xcode, select your Team (Personal Team is fine for testing).
2.  Select your connected iPhone or a Simulator.
3.  Press **Play** (Run).

## 4. Build for Android
(If you want Android support later)
```bash
npx cap add android
npx cap open android
```

## Important Notes
- **API Calls**: All API calls go to `https://ram-weld-zeta.vercel.app`.
- **Authentication**: Usage of cookies for sessions might need "Third-party cookies" enabled or specific Capacitor cookie configuration if using `httpOnly` cookies. The current auth uses `jose` and cookies. Capacitor's `CapacitorHttp` or default fetch usually handles cookies correctly for the same domain, but here we are cross-domain (`localhost` -> `vercel.app`).
    - **Fix for Auth**: If cookies don't stick, we might need to verify `Access-Control-Allow-Credentials` headers on Vercel.
