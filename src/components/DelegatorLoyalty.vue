<template>
  <span v-if="showscore" class="d-flex align-center justify-space-around">
    <span v-if="loyaltyscore != 'TBD'"> {{ loyaltyscore | fpercent }} </span
    ><span v-else>{{ loyaltyscore }}</span>
    <v-menu
      v-if="loyaltyscore != 'TBD'"
      v-model="popover"
      :close-on-content-click="false"
      :nudge-width="200"
      left
      offset-x
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn color="indigo" icon dark v-bind="attrs" v-on="on">
          <v-icon>mdi-chart-pie</v-icon>
        </v-btn>
      </template>

      <v-card :dark="true" class="modalform">
        <v-btn color="white" class="closebtn" icon @click="popover = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <pie-chart
          :width="chartScale"
          :height="chartScale"
          class=""
          :chart-data="loyaltyData"
          datakey="main"
          :options="loyaltypieoptions"
        />
      </v-card>
    </v-menu>
  </span>
</template>
<script>
import colors from "@/mixins/colors";
import numeral from "numeral";
import PieChart from "@/components/PieChart";
export default {
  props: ["stake_key", "pool_id", "dlpackage"],
  components: {
    PieChart,
  },
  mixins: [colors],
  data() {
    return {
      pieDataSelector: "epochs",
      chartScale: 300,
      popover: false,
      showscore: true,
      loyaltypackage: {},
    };
  },
  computed: {
    loyaltyData: function () {
      var stakevals = [];
      var datalabels = [];
      let dataarray = [];
      if (
        typeof this.dlpackage != "undefined" &&
        typeof this.dlpackage.pool_ids_staked != "undefined"
      ) {
        for (let [key, value] of Object.entries(
          this.dlpackage.pool_ids_staked
        )) {
          value["pool_id"] = key;

          dataarray.push(value);
        }

        dataarray.sort(
          (x, y) => y[this.pieDataSelector] - x[this.pieDataSelector]
        );
        dataarray.forEach((value) => {
          stakevals.push(parseInt(value[this.pieDataSelector]));
          datalabels.push(value.ticker == "" ? value.pool_id : value.ticker);
        });
      }
      return {
        mytitle: "",
        labels: datalabels,
        datasets: [
          {
            data: stakevals,
            backgroundColor: this.backgroundColors,
            borderColor: this.borderColors,
          },
        ],
      };
    },
    loyaltypieoptions: function () {
      return {
        animation: {
          duration: 0, // general animation time
        },
        segmentShowStroke: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context) => {
                let sum = 0;
                let dataArr = context.dataset.data;

                dataArr.map((data) => {
                  if (data != null && !isNaN(data)) {
                    sum += data;
                  }
                });
                var shortLabel = context.label.substring(0, 20);

                if (context.label.length != shortLabel.length) {
                  shortLabel = shortLabel + "...";
                }
                if (
                  this.pieDataSelector == "amount" ||
                  this.pieDataSelector == "rewards"
                ) {
                  var ttvalue =
                    " ₳" + numeral(context.raw / 1e6).format("0,0.0a");
                } else {
                  ttvalue = context.raw;
                }

                let percentage = ((context.raw * 100) / sum).toFixed(0) + "%";
                return shortLabel + "\n" + percentage + " (" + ttvalue + ")";
              },
            },
          },
          datalabels: {
            borderWidth: 1,
            borderColor: "grey",
            backgroundColor: "rgba(255, 255, 255, .8)",
            borderRadius: 5,
            padding: {
              bottom: 1,
              top: 4,
            },
            formatter: (value, ctx) => {
              let sum = 0;
              let dataArr = ctx.chart.data.datasets[0].data;
              dataArr.map((data) => {
                if (data != null && !isNaN(data)) {
                  sum += data;
                }
              });
              let percentage = ((value * 100) / sum).toFixed(0) + "%";
              var shortLabel = "";

              shortLabel = ctx.chart.data.labels[ctx.dataIndex].substring(
                0,
                20
              );
              if (
                ctx.chart.data.labels[ctx.dataIndex].length != shortLabel.length
              ) {
                shortLabel = shortLabel + "...";
              }
              if (
                this.pieDataSelector == "amount" ||
                this.pieDataSelector == "rewards"
              ) {
                var ttvalue = " ₳" + numeral(value / 1e6).format("0,0.0a");
              } else {
                ttvalue = value;
              }

              if ((value * 100) / sum > 10) {
                return percentage + " (" + ttvalue + ")\n" + shortLabel;
              }
              return null;
            },
          },
        },

        legend: {
          display: false,
          labels: {
            fontColor: "grey",
            fontSize: 12,
          },
        },
        aspectRatio: 1,
        responsive: true,
        maintainAspectRatio: true,
      };
    },
    loyaltyscore: function () {
      if (
        typeof this.genesis.epoch != "undefined" &&
        typeof this.dlpackage != "undefined" &&
        typeof this.dlpackage.pool_ids_staked != "undefined" &&
        typeof this.dlpackage.pool_ids_staked[this.pool_id] != "undefined"
      ) {
        return this.dlpackage.pool_ids_staked[this.pool_id].lifetime_loyalty;
      } else {
        return "TBD";
      }
    },
    refetch_watch_stake_key: function () {
      return this.stake_key;
    },
    genesis: function () {
      return this.$store.getters.getGenesis;
    },
  },
};
</script>
<style scoped>
.closebtn {
  position: absolute;
  top: 2px;
  right: 2px;
}
.pie_options {
  width: 100%;
  bottom: 0px;
  left: 0px;
  font-weight: bold;
  position: absolute;
  margin: 0px;
}
.sub_toggle_pie_options {
  bottom: 18px;

  width: inherit;
  position: absolute;
  flex-direction: column;
}
</style>