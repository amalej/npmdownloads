import {
  Card,
  CardActions,
  CardContent,
  Grid2,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { FaNpm } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import WebIcon from "@mui/icons-material/Web";
import { useEffect, useState } from "react";
import { getMinimalPacakgeInfo, MinimalPackageInfo } from "../api/npm-api";
import CircularProgress from "@mui/material/CircularProgress";
import { TPackageDownloadData } from "../types";
import { formatNumberToCurrency } from "../utils";

function CustomNpmPackageInfoCard(props: {
  downloadData: TPackageDownloadData;
}) {
  const [packageInfo, setPackageInfo] = useState<MinimalPackageInfo | null>(
    null
  );

  async function loadPackageInfo() {
    const _packageInfo = await getMinimalPacakgeInfo(
      props.downloadData.package
    );
    setPackageInfo(_packageInfo);
    console.log(_packageInfo);
  }

  useEffect(() => {
    loadPackageInfo();
  }, []);

  function cleanRepositoryUrl(url: string) {
    return url.replace(/^(.*?)(?=https:\/\/|$)/gm, "");
  }

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        border: `2.5px solid ${props.downloadData.color}`,
        width: "288px",
      }}
    >
      <CardContent>
        <Typography variant="h5" component="div">
          {props.downloadData.package}
        </Typography>
        <Typography
          variant="body2"
          style={{
            paddingTop: "1em",
          }}
        >
          {packageInfo === null ? (
            <CircularProgress />
          ) : (
            packageInfo.description
          )}
        </Typography>
        <br></br>
        <Grid2 container spacing={1} direction={"column"}>
          <Grid2
            container
            spacing={0.5}
            display={"flex"}
            justifyContent={"flex-start"}
            alignItems={"center"}
          >
            {packageInfo !== null && packageInfo.version ? (
              <>
                <Typography fontSize={"0.85em"}>Latest version:</Typography>
                <Typography fontSize={"0.85em"}>
                  v{packageInfo.version}
                </Typography>
              </>
            ) : (
              ""
            )}
          </Grid2>
          <Grid2
            container
            spacing={0.5}
            display={"flex"}
            justifyContent={"flex-start"}
            alignItems={"center"}
          >
            <Typography fontSize={"0.85em"}>
              Downloads for date range:
            </Typography>
            <Typography fontSize={"0.85em"}>
              {formatNumberToCurrency(
                props.downloadData.downloads.reduce(
                  (n, { downloads }) => n + downloads,
                  0
                )
              )}
            </Typography>
          </Grid2>
        </Grid2>
      </CardContent>
      <div style={{ flexGrow: 1 }} />
      {packageInfo === null ? (
        ""
      ) : (
        <CardActions
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "end",
          }}
        >
          <Tooltip title="NPM">
            <IconButton
              aria-label="delete"
              style={{ fontSize: "2.25em" }}
              onClick={() => {
                window.open(packageInfo.links.npm, "_blank");
              }}
            >
              <FaNpm fontSize="inherit" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Repository">
            <IconButton
              aria-label="delete"
              style={{ fontSize: "2.25em" }}
              onClick={() => {
                window.open(
                  cleanRepositoryUrl(packageInfo.links.repository),
                  "_blank"
                );
              }}
            >
              <FaGithub fontSize="inherit" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Homepage">
            <IconButton
              aria-label="delete"
              style={{ fontSize: "2.25em" }}
              onClick={() => {
                window.open(packageInfo.links.homepage, "_blank");
              }}
            >
              <WebIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </CardActions>
      )}
    </Card>
  );
}

interface PackageInfoCardsProps {
  npmDownloadData: TPackageDownloadData[];
}

function PackageInfoCards(props: PackageInfoCardsProps) {
  return (
    <Grid2
      container
      spacing={2}
      padding="1em"
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      {props.npmDownloadData.map((packageDownloadData) => {
        return (
          <CustomNpmPackageInfoCard
            downloadData={packageDownloadData}
            key={`key_npm-package-info_${packageDownloadData.package}`}
          />
        );
      })}
    </Grid2>
  );
}

export default PackageInfoCards;
