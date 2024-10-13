import "./App.css";
import {
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  Grid2,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { SyntheticEvent, useEffect, useState } from "react";
import Autocomplete from "@mui/joy/Autocomplete";
import {
  getDownloads,
  PackageDownloadData,
  searchPackageNames,
} from "./api/npm-api";
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
import {
  createRgbaFromRgb,
  getRandomRgb,
  groupNpmDownloadsPerWeek,
} from "./utils";
import { useDidMountEffect } from "./custom-hooks";
import dayjs from "dayjs";

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

const TYPING_SEARCH_BUFFER = 1000;
type GroupDownloadsValue = "daily" | "weekly" | "monthly";

interface TPackageDownloadData extends PackageDownloadData {
  color: string;
}

function App() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [searchInput, setSearchInput] = useState<string>("");
  const [npmPackageNames, setNpmPackageNames] = useState<string[]>([]);
  const [selectedNpmPackages, setSelectedNpmPackages] = useState<string[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [typingSearchBuffer, setTypingSearchBuffer] =
    useState<NodeJS.Timeout | null>(null);
  const [npmDownloadData, setNpmDownloadData] = useState<
    TPackageDownloadData[]
  >([]);
  const [groupDownloadsBy, setGroupDownloadsBy] =
    useState<GroupDownloadsValue>("daily");
  const [isGraphFillChecked, setIsGraphFillChecked] = useState<boolean>(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const _startDate = urlParams.get("startDate");
    const _endDate = urlParams.get("endDate");
    const _selectedNpmPackages = urlParams.get("selectedNpmPackages");
    const _groupDownloadsBy = urlParams.get("groupDownloadsBy");
    const _isGraphFillChecked = urlParams.get("isGraphFillChecked");

    if (_startDate) {
      setStartDate(new Date(_startDate));
    }
    if (_endDate) {
      setEndDate(new Date(_endDate));
    }
    if (_selectedNpmPackages) {
      setSelectedNpmPackages(_selectedNpmPackages.split(","));
    }
    if (_groupDownloadsBy) {
      if (_groupDownloadsBy === "weekly")
        setGroupDownloadsBy(_groupDownloadsBy);
    }
    if (_isGraphFillChecked) {
      setIsGraphFillChecked(_isGraphFillChecked === "true");
    }
  }, []);

  // Automatically updates the graph when a change happens.
  useDidMountEffect(() => {
    getPackageDownloads();
  }, [startDate, endDate, selectedNpmPackages]);

  // Update the url.
  useDidMountEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    if (startDate !== null) {
      const dateStr = startDate.toLocaleDateString("fr-CA");
      queryParams.set("startDate", dateStr);
    } else {
      queryParams.delete("startDate");
    }
    if (endDate !== null) {
      const dateStr = endDate.toLocaleDateString("fr-CA");
      queryParams.set("endDate", dateStr);
    } else {
      queryParams.delete("endDate");
    }
    if (selectedNpmPackages.length !== 0) {
      const selectedNpmPackagesStr = selectedNpmPackages.join(",");
      queryParams.set("selectedNpmPackages", selectedNpmPackagesStr);
    } else {
      queryParams.delete("selectedNpmPackages");
    }
    if (groupDownloadsBy !== "daily") {
      queryParams.set("groupDownloadsBy", groupDownloadsBy);
    } else {
      queryParams.delete("groupDownloadsBy");
    }
    if (isGraphFillChecked === true) {
      queryParams.set("isGraphFillChecked", `${isGraphFillChecked}`);
    } else {
      queryParams.delete("isGraphFillChecked");
    }

    window.history.replaceState(null, "", "?" + queryParams.toString());
  }, [
    startDate,
    endDate,
    selectedNpmPackages,
    groupDownloadsBy,
    isGraphFillChecked,
  ]);

  async function getPackageDownloads() {
    if (startDate === null) {
    } else if (endDate === null) {
    } else {
      const downloadsRequests: Promise<PackageDownloadData>[] = [];
      for (let packageName of selectedNpmPackages) {
        const req = getDownloads(packageName, startDate, endDate);
        downloadsRequests.push(req);
      }
      const allRes = await Promise.all(downloadsRequests);
      const _npmDownloadData: TPackageDownloadData[] = [];
      for (let downloadData of allRes) {
        _npmDownloadData.push({
          ...downloadData,
          color: getRandomRgb(),
        });
      }
      setNpmDownloadData(_npmDownloadData);
    }
  }

  async function searchPackageName(packageName: string) {
    setNpmPackageNames([...selectedNpmPackages]);
    const packageNames = await searchPackageNames(packageName);
    const filteredPackageNames = packageNames.filter(
      (name) => !selectedNpmPackages.includes(name)
    );
    setNpmPackageNames([...selectedNpmPackages, ...filteredPackageNames]);
    setIsSearchLoading(false);
  }

  const handlePackageNameInputChange = (_: SyntheticEvent, value: string) => {
    if (typingSearchBuffer !== null) {
      clearTimeout(typingSearchBuffer);
    }

    setTypingSearchBuffer(
      setTimeout(async () => {
        searchPackageName(value);
      }, TYPING_SEARCH_BUFFER)
    );

    setIsSearchLoading(true);
    setSearchInput(value);
  };

  const handleSelectedPackagesChange = (
    _: SyntheticEvent<Element, Event>,
    value: string[]
  ) => {
    setSelectedNpmPackages([...value]);
    setNpmPackageNames([...value]);
    setIsSearchLoading(false);
  };

  const handleSelectedNpmPackageDelete = (packageName: string) => {
    const _npmPackageNames = [...selectedNpmPackages].filter(
      (_packageName) => _packageName !== packageName
    );
    setSelectedNpmPackages([..._npmPackageNames]);
  };

  const getChartData = () => {
    const labels: string[] = [];
    let _npmDownloadChartData: NpmPackageChartData = {
      labels: [],
      datasets: [],
    };

    for (let downloadData of npmDownloadData) {
      const datas: number[] = [];
      switch (groupDownloadsBy) {
        case "weekly":
          for (let downloads of groupNpmDownloadsPerWeek(
            downloadData.downloads
          )) {
            if (_npmDownloadChartData.labels.length === 0) {
              const label = `${downloads.start} - ${downloads.end}`;
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
        backgroundColor: createRgbaFromRgb(downloadData.color, 0.125),
        fill: isGraphFillChecked,
      });
    }
    return _npmDownloadChartData;
  };

  return (
    <div className="App">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Grid2 container width="512px">
          <Grid2 sx={{ margin: "1em" }}>
            <Stack spacing={2}>
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 6 }}>
                  <DatePicker
                    label="Start Date"
                    onChange={(value) => setStartDate(value?.toDate() || null)}
                    value={startDate ? dayjs(startDate) : null}
                  />
                </Grid2>
                <Grid2 size={{ xs: 6 }}>
                  <DatePicker
                    label="End Date"
                    onChange={(value) => setEndDate(value?.toDate() || null)}
                    value={endDate ? dayjs(endDate) : endDate}
                  />
                </Grid2>
              </Grid2>
              <Autocomplete
                multiple
                renderTags={(value: readonly string[]) =>
                  value.map((option: string, index: number) => (
                    <Chip
                      key={index}
                      label={option}
                      sx={{ fontSize: "1em", margin: "0.25em 0.15em" }}
                      onDelete={() => handleSelectedNpmPackageDelete(option)}
                    />
                  ))
                }
                options={npmPackageNames}
                getOptionLabel={(option) => option}
                onInputChange={handlePackageNameInputChange}
                onChange={handleSelectedPackagesChange}
                loading={isSearchLoading}
                noOptionsText={
                  searchInput.length === 0
                    ? "Enter package name..."
                    : isSearchLoading === false
                    ? "No matching package"
                    : "Error"
                }
                filterSelectedOptions={true}
                style={{
                  minHeight: "3.5em",
                }}
                value={selectedNpmPackages}
              />
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: "grow" }}>
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">
                      Group by
                    </InputLabel>
                    <Select
                      label="Group by"
                      onChange={(event) =>
                        setGroupDownloadsBy(
                          event.target.value as GroupDownloadsValue
                        )
                      }
                      value={groupDownloadsBy}
                    >
                      <MenuItem value={"daily"}>Daily downloads</MenuItem>
                      <MenuItem value={"weekly"}>Weekly downloads</MenuItem>
                      {/* <MenuItem value={"monthly"}>Monthly downloads</MenuItem> */}
                    </Select>
                  </FormControl>
                </Grid2>
              </Grid2>
              <FormControlLabel
                control={
                  <Checkbox
                    value={isGraphFillChecked}
                    onChange={() => setIsGraphFillChecked(!isGraphFillChecked)}
                  />
                }
                label="Fill Graph"
              />
              {/* <Button variant="contained" onClick={getPackageDownloads}>
                Get Downloads
              </Button> */}
            </Stack>
          </Grid2>
        </Grid2>
      </LocalizationProvider>
      <Line
        style={{
          padding: "2em",
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
            },
            title: {
              display: true,
              text: "Chart.js Line Chart",
            },
            tooltip: {
              mode: "index",
              intersect: false,
            },
          },
        }}
        data={{ ...getChartData() }}
      ></Line>
    </div>
  );
}

export default App;
