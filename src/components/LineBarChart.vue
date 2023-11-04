<template>
  <LineChartGenerator :chartOptions="options" :chartData="cdata" />
</template>

<script>
import { Line as LineChartGenerator } from "vue-chartjs/legacy";
import { BarController } from "chart.js";

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  LinearScale,
  CategoryScale,
  PointElement,
} from "chart.js";

ChartJS.register(BarController);

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  LinearScale,
  CategoryScale,
  PointElement
);

export default {
  name: "LineBarChart",
  components: {
    LineChartGenerator,
  },
  props: {
    title1: {
      type: String,
      default: "",
    },
    title2: {
      type: String,
      default: "",
    },
    options: {
      type: Object,
      default: null,
    },
    cdata: {
      type: Object,
      default: null,
    },
    chartChanged: {},
  },

  data() {
    return {};
  },
};
</script>
