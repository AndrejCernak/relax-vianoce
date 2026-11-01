import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fonty pre PDF poukážku musia byť pribalené k webhooku na Verceli.
  outputFileTracingIncludes: {
    "/api/stripe-webhook": ["./assets/fonts/**/*"],
  },
  poweredByHeader: false,
};

export default nextConfig;
