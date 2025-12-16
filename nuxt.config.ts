// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  app: {
    head: {
      title: "HQ Amp account balance",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          hid: "description",
          name: "description",
          content: "HQ Amp account balance",
        },
      ],
      link: [
        { rel: "icon", type: "image/png", href: "/favicon.png" }
      ],
    },
    htmlAttrs: {
      lang: "en",
    },
  },
});
