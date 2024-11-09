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

export interface PackageData {
  npm: NpmPackageData;
}

export interface NpmPackageData {
  _id: string;
  name: string;
  "dist-tags": {
    latest: string;
  };
  time: {
    [key: string]: string;
  };
  homepage: string;
  repository: {
    url: string;
    type: string;
  };
}

export async function getPackageData(
  packageName: string
): Promise<PackageData> {
  const npmRes = await fetch(`https://registry.npmjs.org/${packageName}`);
  const npmResText = await npmRes.text();
  const npmResTextObj = JSON.parse(npmResText);

  const packageData = {
    npm: {
      _id: npmResTextObj._id,
      name: npmResTextObj.name,
      "dist-tags": npmResTextObj["dist-tags"],
      time: npmResTextObj.time,
      homepage: npmResTextObj.homepage,
      repository: npmResTextObj.repository,
    },
  };

  return packageData;
}

export interface MinimalPackageInfo {
  packageName: string;
  description: string;
  version: string;
  links: {
    npm: string;
    homepage: string;
    repository: string;
  };
}

export async function getMinimalPacakgeInfo(
  packageName: string
): Promise<MinimalPackageInfo> {
  // fetching using the search endpoint is not ideal, but it returns a smaller payload.
  const res = await fetch(
    `https://registry.npmjs.org/-/v1/search?text=${packageName}&size=1`
  );

  const text = await res.text();
  const packageInfo = JSON.parse(text)["objects"][0];

  await new Promise((res, rej) => setTimeout(res, 5999));

  return {
    packageName: packageInfo.package.name,
    description: packageInfo.package.description,
    version: packageInfo.package.version,
    links: {
      npm: packageInfo.package.links.npm,
      homepage: packageInfo.package.links.homepage,
      repository: packageInfo.package.links.repository,
    },
  };
}
