
module.exports = {
  productionSourceMap: false,
  pwa: {
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true,
    }
  },
  transpileDependencies: [
    'vuetify'
  ],
  
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    }
  }
}
