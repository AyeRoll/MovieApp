
export const getLicenseLevel = (watchedCount: number, reviewedCount: number): LicenseLevel => {
    let licenseLevel: LicenseLevel;
  if (watchedCount < 5 || reviewedCount < 3){
    licenseLevel = "Amateur";
  }
  else if ((watchedCount > 4 && watchedCount <16) || (reviewedCount > 2 && reviewedCount < 11)){
    licenseLevel = "Dabbler";
  }
  else {
    licenseLevel = "Connoisseur";
  }
  return  licenseLevel;
};

export const formatLicenseTitle = (licenseLevel: LicenseLevel) => {
  return `License: ${licenseLevel}`;
}