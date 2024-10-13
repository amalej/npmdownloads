export interface PackageDownloadCountForDay {
  day: string;
  downloads: number;
}

export interface PackageDownloadData {
  package: string;
  start: string;
  end: string;
  downloads: Array<PackageDownloadCountForDay>;
}

export async function getDownloads(
  packageName: string,
  startDate: Date,
  endDate: Date
): Promise<PackageDownloadData> {
  const startDateStr = startDate.toLocaleDateString("fr-CA");
  const endDateStr = endDate.toLocaleDateString("fr-CA");
  const packageDownloadData: PackageDownloadData = {
    start: startDateStr,
    end: endDateStr,
    package: packageName,
    downloads: [],
  };

  let responseBody;
  let _currrentEndDateStr = endDateStr;
  do {
    const res = await fetch(
      `https://api.npmjs.org/downloads/range/${startDateStr}:${_currrentEndDateStr}/${packageName}`
    );
    const text = await res.text();
    responseBody = JSON.parse(text) as PackageDownloadData;
    const _currrentEndDate = new Date(responseBody.start);
    _currrentEndDate.setDate(_currrentEndDate.getDate() - 1);
    _currrentEndDateStr = _currrentEndDate.toLocaleDateString("fr-CA");
    packageDownloadData.downloads.unshift(...responseBody.downloads);
  } while (responseBody.start !== startDateStr);

  return packageDownloadData;
}

export async function searchPackageNames(
  packageName: string
): Promise<string[]> {
  const packageNameArray: string[] = [];
  const res = await fetch(
    `https://registry.npmjs.org/-/v1/search?text=${packageName}`
  );
  const text = await res.text();
  const _packageArray = JSON.parse(text)["objects"];
  for (let packageData of _packageArray) {
    const packageName = packageData.package.name;
    if (typeof packageName === "string") packageNameArray.push(packageName);
  }
  return packageNameArray;
}
