import { ChartDataset } from "chart.js";
import { PackageDownloadData } from "../api/npm-api";

export type GroupDownloadsValue = "daily" | "weekly" | "monthly";

export interface TPackageDownloadData extends PackageDownloadData {
  color: string;
}

export interface NpmPackageChartData {
  labels: Array<string>;
  datasets: ChartDataset<"line">[];
}
