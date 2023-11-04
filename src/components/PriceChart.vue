<template>
  <v-card
    class="mt-5"
    elevation="2"
    outlined
    :dark="nightmode"
    :height="fullscreen ? '100%' : '100%'"
  >
    <div class="pt_form_title">Cardano Price</div>

    <v-card-text class="mt-10 mt-sm-0" style="height: 95%">
      <!-- TradingView Widget BEGIN -->
      <div class="tradingview-widget-container" style="height: 100%">
        <div id="tradingview_5a531" style="height: 100%"></div>
        <div class="tradingview-widget-copyright">
          <a
            href="https://www.tradingview.com/symbols/ADAUSDT/?exchange=BINANCE"
            rel="noopener"
            target="_blank"
          >
            <span class="blue-text">ADAUSDT Chart</span>
          </a>
          by TradingView
        </div>
        <!-- TradingView Widget END -->
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "PriceChart",
  props: ["ismobile", "nightmode"],
  data() {
    return {
      fullscreen: false,
    };
  },
  created() {
    let tradingViewLoaderScript = document.createElement("script");
    tradingViewLoaderScript.setAttribute(
      "src",
      "https://s3.tradingview.com/tv.js"
    );
    document.head.appendChild(tradingViewLoaderScript);

    this.loadScript("https://s3.tradingview.com/tv.js", this.initTradingView);
  },
  methods: {
    toggleFullscreen() {
      this.fullscreen = !this.fullscreen;
    },

    loadScript(url, callback) {
      let script = document.createElement("script");
      script.type = "text/javascript";
      if (script.readyState) {
        script.onreadystatechange = function () {
          if (
            script.readyState === "loaded" ||
            script.readyState === "complete"
          ) {
            script.onreadystatechange = null;
            callback();
          }
        };
      } else {
        script.onload = function () {
          callback();
        };
      }

      script.src = url;
      document.head.appendChild(script);
    },

    initTradingView() {
      let tradingViewScript = document.createElement("script");
      tradingViewScript.text =
        "new TradingView.widget(\n" +
        "        {\n" +
        '          "autosize": true,\n' +
        '          "symbol": "BINANCE:ADAUSDT",\n' +
        '          "interval": "D",\n' +
        '          "timezone": "Etc/UTC",\n' +
        '          "theme": "dark",\n' +
        '          "style": "1",\n' +
        '          "locale": "en",\n' +
        '          "toolbar_bg": "#f1f3f6",\n' +
        '          "enable_publishing": false,\n' +
        '          "withdateranges": true,\n' +
        '          "hide_side_toolbar": false,\n' +
        '          "allow_symbol_change": true,\n' +
        '          "details": true,\n' +
        '          "hotlist": true,\n' +
        '          "calendar": true,\n' +
        '          "container_id": "tradingview_5a531"\n' +
        "        }\n" +
        "    );";
      document.head.appendChild(tradingViewScript);
    },
  },
};
</script>

<style scoped>
</style>