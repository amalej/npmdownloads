import { Line } from "react-chartjs-2";
import {
  Chart,
  Filler,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  ChartDataset,
} from "chart.js";
import { TPackageDownloadData, GroupDownloadsValue } from "../types";
import {
  groupNpmDownloadsPerWeek,
  createRgbaFromRgb,
  formatYyyyMmDdToDate,
} from "../utils";

Chart.register(Filler);
Chart.register(CategoryScale);
Chart.register(LinearScale);
Chart.register(PointElement);
Chart.register(LineElement);
Chart.register(Legend);
Chart.register(Tooltip);

interface NpmPackageChartData {
  labels: Array<string>;
  datasets: ChartDataset<"line">[];
}

interface DownloadGraphProps {
  npmDownloadData: TPackageDownloadData[];
  groupDownloadsBy: GroupDownloadsValue;
  isGraphFillChecked: boolean;
}

const GRAPH_DATASET_STYLE: Omit<ChartDataset<"line">, "data"> = {
  pointStyle: "circle",
  pointRadius: 0,
  pointHoverRadius: 5,
};

export default function DownloadGraph(props: DownloadGraphProps) {
  const getChartData = () => {
    const labels: string[] = [];
    let _npmDownloadChartData: NpmPackageChartData = {
      labels: [],
      datasets: [],
    };

    for (let downloadData of props.npmDownloadData) {
      const datas: number[] = [];
      switch (props.groupDownloadsBy) {
        case "weekly":
          for (let downloads of groupNpmDownloadsPerWeek(
            downloadData.downloads
          )) {
            if (_npmDownloadChartData.labels.length === 0) {
              const label = `${formatYyyyMmDdToDate(
                downloads.start
              )} to ${formatYyyyMmDdToDate(downloads.end)}`;
              labels.push(label);
            }
            datas.push(downloads.downloads);
          }
          break;
        case "daily":
        default:
          for (let downloads of downloadData.downloads) {
            if (_npmDownloadChartData.labels.length === 0) {
              labels.push(downloads.day);
            }
            datas.push(downloads.downloads);
          }
          break;
      }

      if (_npmDownloadChartData.labels.length === 0) {
        _npmDownloadChartData.labels = [...labels];
      }
      _npmDownloadChartData.datasets.push({
        label: downloadData.package,
        data: datas,
        borderColor: downloadData.color,
        backgroundColor: createRgbaFromRgb(downloadData.color, 0.25),
        fill: props.isGraphFillChecked,
        ...GRAPH_DATASET_STYLE,
      });
    }
    return _npmDownloadChartData;
  };

  return (
    <Line
      style={{
        padding: "1em",
      }}
      options={{
        interaction: {
          intersect: false,
          mode: "index",
        },
        hover: {
          mode: "index",
        },
        scales: {
          y: {
            ticks: {
              font: {
                size: 14,
              },
            },
            beginAtZero: true,
          },
        },
        elements: {
          line: {
            tension: 0.4, // smooth lines
          },
        },
        plugins: {
          legend: {
            position: "top" as const,
            labels: {
              font: {
                size: 14,
                family: "Verdana, sans-serif",
                weight: "lighter",
              },
            },
          },
          tooltip: {
            mode: "index",
            intersect: false,
            bodyFont: {
              size: 16,
            },
            titleFont: {
              size: 16,
            },
          },
        },
      }}
      data={{ ...getChartData() }}
    ></Line>
  );
}
