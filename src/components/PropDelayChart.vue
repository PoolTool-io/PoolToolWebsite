<template>
  <v-card
    v-if="propdata.labels.length > 1"
    elevation="2"
    outlined
    :dark="nightmode"
  >
    <v-card-title class="pt-1 pb-1 text-subtitle-1">
      {{ $t("app.networkHealth.propagationDelaysFor") }}
      {{ this.block | numFormat("0,0") }} <v-spacer></v-spacer>
      <span class="text-right"
        ><a
          style="text-decoration: none"
          :href="
            'https://s3-us-west-2.amazonaws.com/data.pooltool.io/blockdata/' +
            Math.floor(this.block / 1000) +
            '/C_' +
            this.hash +
            '.json'
          "
          ><v-icon>mdi-download</v-icon></a
        ></span
      >
    </v-card-title>

    <v-card-text>
      <bar-chart
        :width="chartScale"
        :height="chartScale * 0.8"
        class=""
        :chart-data="propdata"
        :chartOptions="propdelaysoptions"
      ></bar-chart>

      <div class="grid-container">
        <div class="text-right">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <div v-bind="attrs" v-on="on">
                {{ $t("global.propogation") }}
              </div>
            </template>
            <span>{{ $t("app.recentblocks.propDescription") }}</span>
          </v-tooltip>
        </div>
        <div class="">:</div>
        <div class="text-left">
          {{ (details.median / 1000) | numFormat("0.00") }}s
        </div>

        <div class="text-right" v-if="details.protocol_major > 0">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <div v-bind="attrs" v-on="on">
                {{ $t("global.protocol") }}
              </div>
            </template>
            <span>{{ $t("app.recentblocks.protoDescription") }}</span>
          </v-tooltip>
        </div>
        <div class="" v-if="details.protocol_major > 0">:</div>
        <div class="text-left" v-if="details.protocol_major > 0">
          v{{ details.protocol_major }}.{{ details.protocol_minor }}
        </div>

        <div class="text-right">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <div v-bind="attrs" v-on="on">
                {{ $t("app.networkHealth.nodesReporting") }}
              </div>
            </template>
            <span>{{ $t("app.recentblocks.reportsDescription") }}</span>
          </v-tooltip>
        </div>
        <div class="">:</div>
        <div class="text-left">
          {{ details.reporter_count | numFormat("0,0") }}
          <v-btn x-small icon @click="expandsubkey = !expandsubkey"
            ><v-icon x-small v-if="!expandsubkey">mdi-arrow-expand-down</v-icon>
            <v-icon x-small v-else>mdi-arrow-expand-up</v-icon>
          </v-btn>
        </div>

        <div
          style="grid-column-start: 1; grid-column-end: 4"
          class="text-center"
        >
          <v-simple-table v-if="expandsubkey" dense>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-center">
                    <v-btn
                      x-small
                      icon
                      @click="expandsubsubkey = !expandsubsubkey"
                      ><v-icon x-small v-if="!expandsubsubkey"
                        >mdi-arrow-expand-down</v-icon
                      ><v-icon x-small v-else
                        >mdi-arrow-expand-up</v-icon
                      ></v-btn
                    >Reporter Version
                  </th>
                  <th class="text-center">Qty</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in expandsubsubkey
                    ? details.reporter_versions.subsubkeys
                    : details.reporter_versions.subkeys"
                  :key="item[0]"
                >
                  <td class="text-center">{{ item[0] }}</td>
                  <td class="text-center">{{ item[1] }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </div>
      </div>
    </v-card-text>
  </v-card>
  <v-card v-else elevation="2" outlined :dark="nightmode" height="100%">
    No Data Collected
  </v-card>
</template>

<script>
export default {
  props: ["block", "hash", "nightmode"],
  components: {
    BarChart: () => import("./BarChart"),
  },
  data: function () {
    return {
      expandsubkey: false,
      details: {
        protocol_major: 0,
        protocol_minor: 0,
        reporter_count: 0,
        reporter_versions: {},
        median: 0,
      },
      propdata: {
        labels: [0],
        datasets: [
          {
            gradientColor: "green",
            data: [0],
          },
        ],
      },
      chartScale: 300,
      propdelaysoptions: {
        plugins: {
          datalabels: {
            display: false,
          },
          tooltip: {
            enabled: false,
          },
          legend: {
            display: false,
          },
        },

        responsive: false,
        maintainAspectRatio: true,
        scales: {
          yAxes: {
            grid: {
              borderColor: "#fff",
              drawBorder: true,
              tickColor: "#fff",
            },
            ticks: {
              color: "#fff",
              fontSize: 12,
              beginAtZero: true,
            },
            title: {
              display: true,
              color: "#fff",
              text: this.$t("app.networkHealth.nodesReporting"),
            },
          },

          xAxes: {
            ticks: {
              color: "#fff",
              beginAtZero: true,
            },
            grid: {
              borderColor: "#fff",
              drawBorder: true,
              tickColor: "#fff",
            },
            title: {
              display: true,
              color: "#fff",
              text: this.$t("app.networkHealth.msDelayFromSlotTime"),
            },
          },
        },
      },
    };
  },
  created() {
    var that = this;
    this.getJSON(
      "https://s3-us-west-2.amazonaws.com/data.pooltool.io/blockdata/" +
        Math.floor(this.block / 1000) +
        "/C_" +
        this.hash +
        ".json",
      function (err, thisdata) {
        var histogram = [[0], [0]];

        if (err !== null) {
          console.log("Something went wrong: " + err);
        } else {
          histogram = JSON.parse(thisdata.histogram);
        }
        that.propdata = {
          labels: histogram[1],
          datasets: [
            {
              gradientColor: "green",
              data: histogram[0],
            },
          ],
        };
        that.details["reporter_count"] = Object.keys(thisdata.rawtips).length;
        that.details["protocol_major"] = thisdata["protocol_major"];
        that.details["protocol_minor"] = thisdata["protocol_minor"];
        that.details["median"] = thisdata["median"];

        if (Object.hasOwn(thisdata, "reporter_versions")) {
          const regex = new RegExp(/^[\d]+\.[\d]+\.[\d]+:[a-f0-9]{5}$/);
          var subkeys = {};
          var subsubkeys = {};
          for (let [key, value] of Object.entries(
            thisdata["reporter_versions"]
          )) {
            key = key.replace(/,/gi, ".");
            if (regex.test(key)) {
              var subsubkey = key.split(":")[0];
              var presubkey = subsubkey.split(".");
              var subkey = presubkey[0] + "." + presubkey[1];

              if (typeof subkeys[subkey] == "undefined") {
                subkeys[subkey] = value;
              } else {
                subkeys[subkey] += value;
              }
              if (typeof subsubkeys[subsubkey] == "undefined") {
                subsubkeys[subsubkey] = value;
              } else {
                subsubkeys[subsubkey] += value;
              }
            }
          }
          that.details["reporter_versions"] = {
            subkeys: Object.entries(subkeys).sort(),
            subsubkeys: Object.entries(subsubkeys).sort(),
          };
        } else {
          that.details["reporter_versions"] = null;
        }
      }
    );
  },
};
</script>
<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: auto 10px auto;
  padding: 0px;
}
</style>
