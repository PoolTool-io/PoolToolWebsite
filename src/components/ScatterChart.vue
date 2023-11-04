<script>
import { Scatter } from "vue-chartjs/legacy";
import "chartjs-adapter-date-fns";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  PointElement,
  LinearScale,
  TimeScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  PointElement,
  LinearScale,
  TimeScale,
  ChartDataLabels
);

export default {
  extends: Scatter,
  props: ["options", "chart-data"],
  mounted() {
    this.renderChart(this.chartData, this.options);
  },
};
</script>
