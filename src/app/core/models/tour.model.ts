import { User } from "./user.model";

export interface Tour {
  id: number;
  tourName: string;
  startDate: string;
  slot: number;
  Operator: User;
  status: string;
  TourGuide: User;
}

export interface TourHOB {
  id: number;
  name: string;
  highlights: string;
  numberDays: number;
  numberNight: number;
  note: string;
  privacy: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  markUpPercent: number;
  tourType: string;
  tourStatus: string;
}

export interface TourDetailHOB {
  id: number;
  name: string;
  highlights: string;
  numberDays: number;
  numberNight: number;
  note: string;
  privacy: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  locations: Location[];
  tags: Tag[];
  departLocation: Location;
  tourSchedules: TourSchedule[];
  tourImages: TourImage[];
  tourDays: TourDay[];
}

export interface Location {
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

export interface Tag {
  id: number;
  name: string;
}

export interface TourSchedule {
  scheduleId: number;
  startDate: string;
  endDate: string;
  sellingPrice: number;
  minPax: number;
  maxPax: number;
  availableSeats: number;
  meetingLocation: string;
  departureTime: TimeObject;
  extraHotelCost: number;
}

export interface TimeObject {
  hour: number;
  minute: number;
  second: number;
  nano: number;
}

export interface TourImage {
  id: number;
  imageUrl: string;
}

export interface TourDay {
  id: number;
  title: string;
  dayNumber: number;
  deleted: boolean;
  content: string;
  mealPlan: string;
  serviceCategories: string[];
}
