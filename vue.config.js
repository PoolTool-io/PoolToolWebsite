
module.exports = {
  productionSourceMap: false,
  transpileDependencies: [
    'vuetify'
  ],

  devServer: {
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws',
    },
  },

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    }
  }
}
