import { Locations } from "./location.model";

export interface ApiResponse<T> {
    status: number;
    code: number;
    message: string;
    data: PaginatedData<T>;
  }
  
  export interface PaginatedData<T> {
    page: number;
    size: number;
    total: number;
    items: T[];
  }
  
  export interface GeoPosition {
    id?: number;
    latitude: number;
    longitude: number;
  }
  
  export interface ServiceCategory {
    id?: number;
    categoryName: string;
    deleted?: boolean;
  }
  
  export interface ServiceProvider {
    id?: number;
    imageUrl?: string;
    name?: string;
    abbreviation?: string;
    website?: string;
    email?: string;
    star?: number;
    phone?: string;
    address?: string;
    deleted?: boolean;
    location?: Locations; // Thêm locationName
    geoPosition?: GeoPosition;
    serviceCategories?: ServiceCategory[];
  }