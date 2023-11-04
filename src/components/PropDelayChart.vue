<template>
  <v-card
    v-if="propdata.labels.length > 1"
    elevation="2"
    outlined
    :dark="nightmode"
    height="100%"
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
      }
    );
  },
};
</script>
