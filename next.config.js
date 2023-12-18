const { env } = require("process");

module.exports = {
  reactStrictMode: true,
  images: {
    domains: ["api.dicebear.com"],
    minimumCacheTTL: 31536000,
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
};
