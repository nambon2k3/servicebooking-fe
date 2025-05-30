export interface ApiResponse {
  code: number;
  message: string;
  data: {
    topTourOfYear: Tour;
    trendingTours: Tour[];
    newBlogs: Blog[];
    recommendedActivities: Activity[];
    recommendedLocations: Location[];
  };
}

export interface Tour {
  id: number;
  name: string;
  numberDays: number;
  numberNight: number;
  tags: Tag[];
  departLocation: Location;
  tourSchedules: TourSchedule[];
  tourImages: TourImage[];
  priceFrom: number;
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
  departureTime: Time;
  extraHotelCost: number;
}

export interface Time {
  hour: number;
  minute: number;
  second: number;
  nano: number;
}

export interface Location {
  id: number;
  name: string;
  description: string;
  image: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface TourImage {
  id: number;
  imageUrl: string;
}

export interface Blog {
  id: number;
  thumbnailImageUrl: string;
  title: string;
  description: string;
  content: string;
  author: Author;
  tags: Tag[];
  deleted: boolean;
  createdAt: string;
}

export interface Author {
  id: number;
  fullName: string;
  avatarImage: string;
  email: string;
}

export interface Activity {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  pricePerPerson: number;
  geoPosition: GeoPosition;
  location: Location;
  activityCategory: ActivityCategory;
  deleted: boolean;
}

export interface GeoPosition {
  id: number;
  latitude: number;
  longitude: number;
}

export interface ActivityCategory {
  id: number;
  name: string;
  deleted: boolean;
}
