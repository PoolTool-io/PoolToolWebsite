<script>
import { Line } from "vue-chartjs/legacy";
import "chartjs-adapter-date-fns";
import { Chart, BarController } from "chart.js";

Chart.register(BarController);
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  Filler,
  TimeScale,
  CategoryScale,
  PointElement,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement
);

export default {
  extends: Line,
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
    chartChanged: {},
  },

  mounted() {
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
    this.gradient6 = this.$refs.canvas
      .getContext("2d")
      .createLinearGradient(0, 0, 0, 150);

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

    this.gradient6.addColorStop(0, "rgba(160, 254, 106, 0.6)");
    this.gradient6.addColorStop(1, "rgba(160, 254, 106, 0)");

    this.renderChart(
      {
        labels: this.chartData.labels,
        datasets: this.chartData.datasets.map((item) => {
          return {
            pointRadius: 0,
            fill: true,
            tension: 0,
            backgroundColor: this.getGradient(item),
            ...item,
          };
        }),
      },
      this.options
    );

    if (this.chartChanged) {
      this.chartChanged.$on("balanceChartChange", this.rerender);
    }
  },

  methods: {
    getGradient: function (dataset) {
      const gradients = [
        this.gradient,
        this.gradient1,
        this.gradient2,
        this.gradient3,
        this.gradient4,
        this.gradient5,
        this.gradient6,
      ];

      if (dataset) {
        switch (dataset.gradientColor) {
          case "lightGreen":
            return this.gradient;
          case "lightGreen2":
            return this.gradient6;
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
    rerender: function () {
      this.renderChart(
        {
          labels: this.chartData.labels,
          datasets: this.chartData.datasets.map((item) => {
            return {
              pointRadius: 0,
              fill: true,
              tension: 0,
              backgroundColor: this.getGradient(item),

              ...item,
            };
          }),
        },
        this.options
      );
    },
  },
};
</script>
