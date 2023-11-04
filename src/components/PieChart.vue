<script>
import { Pie } from "vue-chartjs/legacy";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  ChartDataLabels
);
export default {
  extends: Pie,
  props: {
    title: {
      type: String,
      default: null,
    },
    options: {
      type: Object,
      default: null,
    },
  },
  mounted() {
    this.renderChart(
      {
        labels: this.chartData.labels,
        datasets: this.chartData.datasets.map((item) => {
          return {
            pointRadius: 0,
            fill: true,
            tension: 0,
            borderColor: "rgba(255, 255, 255, 0.05);",
            // backgroundColor: this.getGradient(item),
            ...item,
          };
        }),
      },
      this.options
    );

    // // this.chartData is created in the mixin.
    // // If you want to pass options please create a local options object
    // this.renderChart(this.chartData, this.options)
  },
};
</script>
