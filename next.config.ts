import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const nextConfig: NextConfig = {
  /* LAN-IP zodat device-testen op de telefoon werkt — hoort bij
     `next dev --hostname 0.0.0.0` in package.json. */
  allowedDevOrigins: ['192.168.1.170'],
  images: {
    /* De homepage-hero rendert met quality={90}; naast de default 75
       moet die expliciet geconfigureerd zijn. */
    qualities: [75, 90],
  },
  turbopack: {
    root: fileURLToPath(new URL('.', import.meta.url)),
  },
};

export default nextConfig;
