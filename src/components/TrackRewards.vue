<template>
  <div>
    <v-btn
      outlined
      block
      class="my-0"
      :dark="nightmode"
      @click="expand = !expand"
    >
      {{ $t("app.trackRewards.exportRewardsDataForTaxes") }}
    </v-btn>

    <v-card
      style="position: absolute; z-index: 100"
      :dark="nightmode"
      class="mx-auto mb-2 trackrewards"
      outlined
      raised
      v-show="expand"
    >
      <v-card-text>
        <v-container v-show="expand" fluid>
          <h2>{{ $t("app.trackRewards.findYourStakingAddress") }}</h2>
          <p>{{ $t("app.trackRewards.youCanUseOurForm") }}</p>
          <v-responsive>
            <v-text-field
              class="pt-2"
              flat
              placeholder="addr1qyancz5tzq916qlz00xrwhv42ny0lscdfjxz2409e7qg9qqwhse7jpldnx5y0hg4j2wen85mfcc7aj3jfk26kfuhpm0stfnuex"
              outlined
              append-icon="mdi-magnify"
              @click:append="bech2cli"
              hide-details="auto"
              dense
              label="Address"
              :error-messages="bechErrors"
              v-model="bechAddress"
            >
            </v-text-field>
          </v-responsive>
        </v-container>
        <v-simple-table v-if="foundaddress != null" dense>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">
                  {{ $t("app.addressDetail.address") }}
                </th>
                <th class="text-right text-no-wrap">
                  {{ $t("global.stake") }} (₳)
                </th>
                <th class="text-right">{{ $t("global.epoch") }}</th>
                <th class="text-right">{{ $t("global.pool") }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-no-wrap">
                  {{ cliAddress | ellipsiscrypto }}
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs"
                        v-on="on"
                        icon
                        small
                        :to="{
                          name: 'address',
                          params: { address: cliAddress },
                        }"
                        color="primary"
                      >
                        <v-icon dense medium
                          >mdi-arrow-right-bold-circle</v-icon
                        >
                      </v-btn>
                    </template>
                    <span>{{ $t("global.addressDetails") }}</span>
                  </v-tooltip>
                </td>
                <td class="text-right">
                  {{
                    foundaddress.amount
                      | tosmallada
                      | numFormat("0,0.000a")
                      | zeronull
                  }}
                </td>
                <td class="text-right">{{ foundaddress.epoch }}</td>
                <td
                  class="text-right"
                  v-if="foundaddress.delegatedToTicker != null"
                >
                  {{ foundaddress.delegatedToTicker }}
                </td>
                <td
                  class="text-right"
                  v-if="
                    foundaddress.delegatedToTicker == null &&
                    foundaddress.delegatedTo != null
                  "
                >
                  {{ foundaddress.delegatedTo | ellipsis(16) }}
                  <v-btn
                    text
                    x-small
                    icon
                    v-clipboard="foundaddress.delegatedTo"
                  >
                    <v-icon x-small>mdi-content-copy</v-icon>
                  </v-btn>
                </td>
                <td v-else class="text-right"></td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn text @click="expand = !expand">{{ $t("global.close") }}</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
const Buffer = require("buffer/").Buffer;
let { bech32 } = require("bech32");
export default {
  data: () => ({
    expand: false,
    cliErrors: null,
    bechErrors: null,
    bechAddress: null,
    cliAddress: null,
    foundaddress: null,
  }),

  name: "trackRewards",
  props: ["nightmode"],
  computed: {
    genesis: function () {
      return this.$store.getters.getGenesis;
    },
    network: function () {
      return this.$store.getters.getNetwork;
    },
  },
  methods: {
    queryaddress: function (address) {
      var self = this;
      if (/[a-f0-9]{56}/gim.test(address)) {
        this.axios({
          method: "post",
          url: "https://api.pooltool.io/v1/queryaddress",
          data: {
            stake_key: address,
          },
          headers: {},
        }).then(function (response) {
          if (response.status == 200 && response.data.success) {
            self.foundaddress = response.data;
          } else {
            self.foundaddress = null;
            self.bechErrors =
              "Not a valid staking address.  We can only find keys that have been active in at least one epoch.  If this is a new key please wait until next epoch and try again.";
          }
        });
      }
    },
    bech2cli: function () {
      if (this.bechAddress == null || this.bechAddress == "") {
        this.cliErrors = "Please enter a valid address";
        return;
      }
      try {
        this.bechErrors = "";
        this.cliErrors = "";

        if (this.bechAddress && this.bechAddress.startsWith("addr")) {
          let output = bech32.decode(this.bechAddress, 256);
          this.cliAddress = Buffer.from(bech32.fromWords(output.words))
            .toString("hex")
            .slice(58, 128);
        } else if (this.bechAddress && this.bechAddress.startsWith("stake")) {
          let output = bech32.decode(this.bechAddress, 256);
          this.cliAddress = Buffer.from(bech32.fromWords(output.words))
            .toString("hex")
            .slice(2);
        } else {
          this.cliAddress = this.bechAddress;
        }

        this.queryaddress(this.cliAddress);
      } catch (e) {
        console.log("error");
        console.log(this.bechErrors);
        this.bechErrors = e.toString();
        this.cliAddress = "";
        this.foundaddress = null;
      }
    },
  },
};
</script>
