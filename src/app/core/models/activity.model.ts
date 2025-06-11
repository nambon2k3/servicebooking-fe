export interface Activity {
  id: number; // Changed to number to match Long (or keep string if you prefer to convert)
  activityName: string; // Match BE naming
  sellingPrice: number; // Match BE naming
  imageUrl: string;
  categoryName: string; // Match BE naming
  address: string; // Match BE naming
  providerName: string; // Match BE naming
  providerEmail: string;
  providerPhone: string;
  providerWebsite: string;
  locationName: string;
}