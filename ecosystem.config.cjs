module.exports = {
  apps: [
    {
      name: "amp-balance-cron",
      script: "bun",
      args: "run ./scripts/fetch-amp-balance.mjs",
      cron_restart: "17 * * * *", // 17 is the new meme
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      env: {
        NODE_ENV: "production",
        AMP_COOKIE: process.env.AMP_COOKIE || "",
        DATABASE_URL: process.env.DATABASE_URL || "",
      },
    },
  ],
};
