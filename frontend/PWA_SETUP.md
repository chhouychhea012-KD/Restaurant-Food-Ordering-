# Golden Land Restaurant PWA Setup

The frontend is configured as a Progressive Web App.

## Local PWA Test

Service workers are disabled during `npm run dev` so local development stays fresh.

Use this flow to test install/offline behavior:

```powershell
cd C:\Users\User\Desktop\Restaurant-Food-Ordering-\frontend
npm run build
npm run preview
```

Open the preview URL, usually:

```text
http://localhost:4173
```

In Chrome DevTools:

- Open `Application`.
- Check `Manifest`.
- Check `Service Workers`.
- Use Lighthouse and choose `Progressive Web App`.

## Production PWA Release

Production must use HTTPS. The current domain is ready:

```text
https://goldenlandrestaurant.store
```

After deployment, open the website in Chrome or Android Chrome and use the browser install button.

## Capacitor Phase 2

Capacitor is prepared with:

```text
capacitor.config.ts
```

When you are ready to create native Android/iOS projects:

```powershell
cd C:\Users\User\Desktop\Restaurant-Food-Ordering-\frontend
npm install @capacitor/android
npm run cap:sync
npx cap add android
npm run cap:open:android
```

For iOS, use macOS with Xcode:

```bash
npm install @capacitor/ios
npm run cap:sync
npx cap add ios
npm run cap:open:ios
```

Always run this after frontend changes before building native apps:

```powershell
npm run cap:sync
```
