// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@sidebase/nuxt-auth'],
  css: ['~/assets/css/tailwind.css'],
  devServer: {
    port: 3002
  },
  auth: {
    baseURL: process.env.AUTH_ORIGIN || 'http://localhost:3002',
    provider: {
      type: 'authjs'
    }
  },
  runtimeConfig: {
    auth: {
      secret: process.env.AUTH_SECRET
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    },
    public: {
      superadminEmail: process.env.SUPERADMIN_EMAIL
    }
  }
})
