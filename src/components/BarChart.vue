<script>
import { Bar } from "vue-chartjs/legacy";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ChartDataLabels
);

export default {
  extends: Bar,
  props: {
    width: {
      type: Number,
      default: 400,
    },
    height: {
      type: Number,
      default: 400,
    },
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
    chartOptions: {
      type: Object,
      default: null,
    },
  },
  watch: {
    height: {
      handler() {
        console.log("redraw chart");
        this.drawChart();
      },
    },
  },
  mounted() {
    this.drawChart();
  },
  methods: {
    drawChart: function () {
      // charts gradient
      this.gradient = this.$refs.canvas
        .getContext("2d")
        .createLinearGradient(0, 0, 0, 450);
      this.gradient1 = this.$refs.canvas
        .getContext("2d")
        .createLinearGradient(0, 0, 0, 450);
      this.gradient2 = this.$refs.canvas
        .getContext("2d")
        .createLinearGradient(0, 0, 0, 450);
      this.gradient3 = this.$refs.canvas
        .getContext("2d")
        .createLinearGradient(0, 0, 0, 450);
      this.gradient4 = this.$refs.canvas
        .getContext("2d")
        .createLinearGradient(0, 0, 0, 450);
      this.gradient5 = this.$refs.canvas
        .getContext("2d")
        .createLinearGradient(0, 0, 0, 450);

      this.gradient.addColorStop(0, "rgba(166, 221, 95, 0.5)");
      this.gradient.addColorStop(1, "rgba(166, 221, 95, 0)");

      this.gradient1.addColorStop(0, "#A0FE6A");
      this.gradient1.addColorStop(0.5, "rgba(160, 254, 106, 0.6)");
      this.gradient1.addColorStop(1, "rgba(160, 254, 106, 0.2)");

      this.gradient2.addColorStop(0, "#ED5FEE");
      this.gradient2.addColorStop(0.01, "#E85EEE");
      this.gradient2.addColorStop(0.5, "#A231BA");
      this.gradient2.addColorStop(1, "#6C00A5");

      this.gradient3.addColorStop(0, "#03B3DA");
      this.gradient3.addColorStop(0.5, "rgba(3, 179, 218, 0.6)");
      this.gradient3.addColorStop(1, "rgba(3, 179, 218, 0.2)");

      this.gradient4.addColorStop(0, "#F6815D");
      this.gradient4.addColorStop(0.5, "rgba(254, 107, 111, 0.74)");
      this.gradient4.addColorStop(1, "rgba(253, 71, 123, 0.32)");

      this.gradient5.addColorStop(0, "#1E88E5");
      this.gradient5.addColorStop(0.5, "rgba(30, 136, 229, 0.6)");
      this.gradient5.addColorStop(1, "rgba(30, 136, 229, 0.2)");

      this.renderChart(
        {
          labels: this.chartData.labels,
          datasets: this.chartData.datasets.map((item) => {
            return {
              backgroundColor: this.getGradient(item),
              ...item,
            };
          }),
        },
        this.chartOptions
      );
    },
    getGradient: function (dataset) {
      const gradients = [
        this.gradient,
        this.gradient1,
        this.gradient2,
        this.gradient3,
        this.gradient4,
        this.gradient5,
      ];

      if (dataset) {
        switch (dataset.gradientColor) {
          case "lightGreen":
            return this.gradient;
          case "green":
            return this.gradient1;
          case "purple":
            return this.gradient2;
          case "cean":
            return this.gradient3;
          case "red":
            return this.gradient4;
          case "blue":
            return this.gradient5;
          default:
            return gradients[Math.floor(Math.random() * gradients.length)];
        }
      }
    },
  },
};
</script>
