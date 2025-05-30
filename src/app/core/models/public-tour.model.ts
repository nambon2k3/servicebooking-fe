import { Locations } from "./location.model";  

  export interface Pagination {
    page: number;
    size: number;
    total: number;
  }
  
  export interface Tag {
    id: number;
    name: string;
  }
  
  export interface TourImage {
    id: number;
    imageUrl: string;
  }
  
  export interface Tour {
    id: number;
    name: string;
    numberDays: number;
    numberNight: number;
    tags: Tag[];
    departLocation: Locations;
    tourImages: TourImage[];
    priceFrom: number;
    tourSchedules: TourSchedule[];
  }

  export interface TourSchedule {
    scheduleId: number;
    startDate: string;
  }
  