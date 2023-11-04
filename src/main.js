import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import IdleVue from "idle-vue";
import i18n from "./i18n";
import VuePreferences from "vue-preferences";
import numeral from "numeral";
import numFormat from "vue-filter-number-format";
import PerfectScrollbar from 'vue2-perfect-scrollbar';
import VueSanitize from "vue-sanitize";
import axios from "axios";
import VueAxios from "vue-axios";
import "./registerServiceWorker";
import VueClipboards from "vue-clipboards";
import { rtdbPlugin } from "vuefire";
import 'vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css';
// STYLES
import "./styles/main.scss";
import { dateFilter } from "vue-date-fns";
import parseISO  from "date-fns/parseISO"
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import VueFullscreen from 'vue-fullscreen'
Vue.filter("date", dateFilter);
Vue.filter("parseISO", parseISO);
Vue.filter("formatDistanceToNow",formatDistanceToNow);
Vue.use(VueFullscreen)

import { store } from './store'
import router from './router'



import JsonCSV from 'vue-json-csv'
import './registerServiceWorker'

Vue.component('downloadCsv', JsonCSV)

Vue.filter("tosmallada", function(value) {
  if (value !== null) {
    if (value !== "" && value !== " ") {
      if (parseInt(value) != 0) {
        return parseInt(value) / 1000000;
      } else {
        return 0;
      }
    } else {
      return null;
    }
  } else {
    return null;
  }
});

Vue.use(VueAxios, axios);
Vue.use(rtdbPlugin);
Vue.filter("ellipsiscrypto", function(item, qty = 16) {
  if (item != null) {
    if (item.length > qty) {
      return (
        item.substring(0, Math.floor(qty / 2)) +
        " ... " +
        item.substring(item.length - Math.floor(qty / 2))
      );
    } else {
      return item;
    }
  } else {
    return "";
  }
});
Vue.filter("ellipsis", function(item, qty = 16) {
  if (item != null) {
    if(item.length>16) {
      return item.substring(0, qty) + "...";
    }else{
      return item
    }
    
  } else {
    return "";
  }
});
Vue.use(VueSanitize, {
  allowedTags: ["a"],
  allowedAttributes: {
    a: ["href", "target"],
  },
});
Vue.filter("zeronull", function(value) {
  if (value == "0.0") {
    return null;
  } else {
    return value;
  }
});
Vue.use(VueClipboards);
Vue.filter("numFormat", numFormat(numeral));
Vue.filter("toada", function(value) {
  if (value !== null) {
    if (value !== "" && value !== " ") {
      if (parseInt(value) != 0) {
        value = parseInt(value) / 1000000;
        if (value < 1) {
          return value.toFixed(6);
        } else {
          return Math.floor(value);
        }
      } else {
        return 0;
      }
    } else {
      return null;
    }
  } else {
    return null;
  }
});
Vue.filter("fpercent", function(value) {
  if (value !== null) {
    if (value !== 0) {
      const rp = parseFloat(value) * 100;
      return rp.toFixed(2) + "%";
    } else {
      return "0.00%";
    }
  } else {
    return null;
  }
});
Vue.config.productionTip = false
Vue.use(VuePreferences);
Vue.use(PerfectScrollbar);

Vue.use(IdleVue, {
  store,
  idleTime: 1800000, //30 minutes.. 60000, //3600000, // 1 hour
  startAtIdle: false,
});

Vue.mixin({
  methods: {
    getJSON: function(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.responseType = "json";
      xhr.onload = function() {
        var status = xhr.status;
        if (status === 200) {
          callback(null, xhr.response);
        } else {
          callback(status, xhr.response);
        }
      };
      xhr.send();
    },
  },
});

new Vue({
  vuetify,
  store,
  router,
  i18n,
  render: h => h(App)
}).$mount('#app')
