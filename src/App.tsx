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
import { getRandomRgb } from "./utils";
import { useDidMountEffect } from "./custom-hooks";
import dayjs from "dayjs";
import { GroupDownloadsValue, TPackageDownloadData } from "./types";
import DownloadGraph from "./components/DownloadGraph";

const TYPING_SEARCH_BUFFER = 1000;

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
                    slotProps={{ textField: { size: "small" } }}
                  />
                </Grid2>
                <Grid2 size={{ xs: 6 }}>
                  <DatePicker
                    label="End Date"
                    onChange={(value) => setEndDate(value?.toDate() || null)}
                    value={endDate ? dayjs(endDate) : endDate}
                    slotProps={{ textField: { size: "small" } }}
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
                size="sm"
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
                      size="small"
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
                    size="small"
                  />
                }
                label="Fill Graph"
              />
            </Stack>
          </Grid2>
        </Grid2>
      </LocalizationProvider>
      <DownloadGraph
        key="download-graph"
        npmDownloadData={npmDownloadData}
        isGraphFillChecked={isGraphFillChecked}
        groupDownloadsBy={groupDownloadsBy}
      ></DownloadGraph>
    </div>
  );
}

export default App;
