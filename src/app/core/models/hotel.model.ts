import { Locations } from "./location.model";

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: ApiData<T>;
}

export interface ApiData<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

export interface Hotel {
  id: number;
  imageUrl: string;
  name: string;
  abbreviation: string;
  website: string;
  email: string;
  star: number;
  phone: string;
  address: string;
  location: Locations;
  geoPosition: GeoPosition;
  minRoomPrice: number;
}

export interface LocationDetail {
  id: number;
  name: string;
  description: string;
  image: string;
  geoPosition: GeoPosition;
}

export interface GeoPosition {
  id: number;
  latitude: number;
  longitude: number;
}
