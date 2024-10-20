import { PackageDownloadCountForDay } from "../api/npm-api";

export interface DownloadPerWeek {
  start: string;
  end: string;
  downloads: number;
  days: number;
}

export function groupNpmDownloadsPerWeek(
  npmDownloadsArray: PackageDownloadCountForDay[]
): DownloadPerWeek[] {
  const weeklyDownload = [];

  let weekDownload = {
    start: "",
    end: "",
    downloads: 0,
    days: 0,
  };
  for (let i = 0; i < npmDownloadsArray.length; i++) {
    const downloadData = npmDownloadsArray[i];
    const day = new Date(downloadData.day).getDay();
    if (weekDownload.start === "") {
      weekDownload.start = downloadData.day;
    }

    weekDownload.downloads += downloadData.downloads;
    weekDownload.days += 1;
    if (day === 6 || i === npmDownloadsArray.length - 1) {
      weekDownload.end = downloadData.day;
      weeklyDownload.push(weekDownload);
      weekDownload = {
        start: "",
        end: "",
        downloads: 0,
        days: 0,
      };
    }
  }

  return weeklyDownload;
}

export function getRandomRgb() {
  const rand = () => 75 + Math.floor(Math.random() * 106);
  const rgb = `rgb(${rand()},${rand()},${rand()})`;
  return rgb;
}

export function createRgbaFromRgb(rgb: string, alpha: number) {
  if (alpha > 1 || alpha < 0) {
    throw Error("Value of alhpa is out of range. Valid range is 0 - 1.0");
  }
  return rgb.replace("rgb", "rgba").replace(")", `, ${alpha})`);
}

export function formatYyyyMmDdToDate(yyyymmdd: string) {
  const [yyyy, mm, dd] = yyyymmdd.split("-");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return `${months[parseInt(mm) - 1]}-${dd}-${yyyy}`;
}
