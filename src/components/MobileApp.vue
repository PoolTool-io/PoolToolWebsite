<template>
  <div>
    <v-btn
      outlined
      block
      class="my-0"
      :dark="nightmode"
      @click="expand = !expand"
    >
      {{ $t("app.getTheMobileApp") }}
    </v-btn>
    <v-card
      style="position: absolute; z-index: 100"
      :dark="nightmode"
      v-show="expand"
      class="mx-auto mb-2 pooltoolbot"
      outlined
      raised
    >
      <v-card-text>
        <v-container v-show="expand" fluid>
          <h2>
            {{ $t("app.mobile.poolToolMobile") }}
          </h2>
          <v-row dense align="center" justify="center">
            <v-col class="col-xs-12 col-sm-6 col-md-6" align="center"
              ><a
                target="_blank"
                href="https://play.google.com/store/apps/details?id=com.pegasus.tool&amp;pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
                ><img
                  width="200"
                  alt="Get it on Google Play"
                  src="google-play-badge.png" /></a
            ></v-col>
            <v-col class="col-xs-12 col-sm-6 col-md-6" align="center"
              ><a
                target="_blank"
                href="https://apps.apple.com/us/app/pegasus-tool/id1495556387"
                ><img
                  width="176"
                  alt="Download on the app store"
                  src="download-on-the-app-store-badge.png" /></a
            ></v-col>
          </v-row>
          <v-row dense align="center" justify="center">
            <v-col class="col-sm-12 col-md-6" align="center" justify="center">
              <v-img
                max-width="250"
                alt="PoolTool Promo"
                src="https://pooltool.io/pooltool-promo-t.png"
              ></v-img>
            </v-col>
            <v-col class="pt-10 col-sm-12 col-md-6">
              <p>
                Explore Cardano! Track pools and get notified to take action!
              </p>
              <p>
                The free PoolTool app was created for the community to be able
                to search, sort and filter hundreds of pools on the Cardano
                network. ADA holders can use it to look for the most desirable
                pools and see details and historical data about all of them.
                Delegators can track the pools' progress by adding them to the
                list of favourite pools and subscribing to performance and
                saturation alerts so action can be taken when a pool is no
                longer desirable.
              </p>
              <p>
                Additionally the app presents useful metrics of the network so
                users get a better idea of the general state and evolution of
                the Cardano blockchain over time.
              </p>

              <div class="footer-col footer">
                <ul class="list-unstyled">
                  <li>
                    <v-icon>mdi-check</v-icon>
                    <span class="pl-2"
                      ><strong>Search, sort</strong> and
                      <strong>filter</strong> hundreds of pools</span
                    >
                  </li>
                  <li>
                    <v-icon>mdi-check</v-icon>
                    <span class="pl-2"
                      >Set your <strong>favourite</strong> pools</span
                    >
                  </li>
                  <li>
                    <v-icon>mdi-check</v-icon>
                    <span class="pl-2"
                      >See <strong>details</strong> and
                      <strong>historical data</strong> of all the available
                      pools</span
                    >
                  </li>
                  <li>
                    <v-icon>mdi-check</v-icon>
                    <span class="pl-2"
                      >Subscribe to <strong>performance</strong> and
                      <strong>saturation alerts</strong></span
                    >
                  </li>
                  <li>
                    <v-icon>mdi-check</v-icon>
                    <span class="pl-2"
                      >Follow the <strong>evolution</strong> of the
                      <strong>Cardano blockchain</strong></span
                    >
                  </li>
                </ul>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn text @click="expand = !expand">{{ $t("global.close") }}</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
export default {
  data: () => ({
    expand: false,
  }),
  props: ["nightmode"],
  methods: {},
};
</script>
