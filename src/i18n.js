import Vue from "vue"
import VueI18n from "vue-i18n"
import {
  getChoiceIndex,
  setDefaultChoiceIndexGet
} from "./util/i18n/choice-index-for-plural"
import dateTimeFormats from "@/locales/date-time-formats"
import numberFormats from "@/locales/number-formats"
Vue.use(VueI18n)


setDefaultChoiceIndexGet(VueI18n.prototype.getChoiceIndex)
VueI18n.prototype.getChoiceIndex = getChoiceIndex
const i18n = new VueI18n({
  locale: "en",
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || "en", //.replace('/&nbsp;/gi','')
  postTranslation: (str) => {return str},
  messages:{},
  formatFallbackMessages: true,
  silentFallbackWarn: true,
  silentTranslationWarn: true,
  dateTimeFormats,
  numberFormats,
})

export default i18n