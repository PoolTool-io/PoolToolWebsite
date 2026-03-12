
module.exports = {
  productionSourceMap: false,
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
