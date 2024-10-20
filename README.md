# Npm Downloads

A site to get metrics on the number of downloads for an NPM library. Visit the site at https://npmdownloads.web.app

## Queries

| Name                | Value               | Kind      | Notes                                                          |
| ------------------- | ------------------- | --------- | -------------------------------------------------------------- |
| selectedNpmPackages | string              | **Query** | NPM packages to search                                         |
| startDate           | `yyyy-mm-dd`        | **Query** | how many results should be returned (default 20, max 250)      |
| endDate             | `yyyy-mm-dd`        | **Query** | offset to return results from                                  |
| groupDownloadsBy    | `weekly` or `daily` | **Query** | how much of an effect should quality have on search results    |
| isGraphFillChecked  | boolean             | **Query** | how much of an effect should popularity have on search results |

### Query example

https://npmdownloads.web.app/?startDate=2024-06-02&endDate=2024-10-19&groupDownloadsBy=weekly&selectedNpmPackages=firebase%2Cfirebase-tools
