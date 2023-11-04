<template>
  <a
    style="text-decoration: none"
    target="_blank"
    :href="
      'https://s3-us-west-2.amazonaws.com/data.pooltool.io/blockdata/' +
      Math.floor(this.block / 1000) +
      '/F_' +
      this.hash +
      '.png'
    "
  >
    <bar-chart
      style="display: inline-block"
      :width="chartScale"
      :height="chartScale * 0.8"
      class=""
      :chartData="propdata"
      :chartOptions="propdelaysoptions"
    ></bar-chart>
  </a>
</template>

<script>
// import ChartDataLabels from "chartjs-plugin-datalabels";
// import ChartWatermark from "chartjs-plugin-watermark";
export default {
  props: ["block", "hash", "nightmode", "histogram"],
  components: {
    BarChart: () => import("./BarChart"),
  },
  computed: {
    propdata: function () {
      return {
        labels: this.histogram[1],
        datasets: [
          {
            gradientColor: "green",
            data: this.histogram[0],
          },
        ],
      };
    },
  },
  data: function () {
    return {
      chartScale: 200,
      propdelaysoptions: {
        scales: {
          yAxes: {
            min: 0,
            grid: {
              borderColor: "#fff",
              drawBorder: true,
              tickColor: "#fff",
            },

            ticks: {
              beginAtZero: true,
              color: "#fff",
              fontSize: 12,
            },
          },
          xAxes: {
            grid: {
              borderColor: "#fff",
              drawBorder: true,
            },
            ticks: {
              beginAtZero: true,
              color: "#fff",

              fontSize: 12,
              callback: function (value) {
                return (this.getLabelForValue(value) / 1000).toPrecision(2);
              },
            },
          },
        },
        plugins: {
          tooltip: {
            enabled: false,
          },
          datalabels: {
            display: false,
          },
          legend: {
            display: false,
          },
        },

        responsive: false,
        maintainAspectRatio: true,
      },
    };
  },
};
</script>
