import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Maktabi mobile (Capacitor) configuration.
 *
 * Two ways to ship the mobile app:
 *
 *  1. LIVE-WRAP (recommended for this app — supports all dynamic routes):
 *     Set CAP_SERVER_URL to your deployed web app, e.g.
 *       CAP_SERVER_URL=https://app.maktabi.com npx cap sync
 *     For testing on a physical device on your LAN, point it at your dev PC:
 *       CAP_SERVER_URL=http://192.168.1.20:9000 npx cap sync
 *     The native shell then loads the full Next.js app (every module works,
 *     including /litigation/[id] etc.), talking to the backend as usual.
 *
 *  2. STATIC BUNDLE (offline shell): run `NEXT_STATIC_EXPORT=true next build`
 *     to produce `out/`, then `npx cap sync`. Requires the dynamic detail
 *     routes to be refactored to query params (see MOBILE_LAUNCH.md).
 */
const serverUrl = process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: "com.maktabi.app",
  appName: "Maktabi",
  webDir: "out",
  ...(serverUrl
    ? {
        server: {
          url: serverUrl,
          cleartext: serverUrl.startsWith("http://"), // allow http only for LAN testing
          androidScheme: serverUrl.startsWith("https://") ? "https" : "http",
        },
      }
    : {
        server: { androidScheme: "https" },
      }),
  backgroundColor: "#0f1f3d",
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#1e3a5f",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
    },
  },
};

export default config;
