export interface TourDetail {
    id: number;
    name: string;
    highlights: string;
    numberDays: number;
    numberNight: number;
    note: string;
    privacy: string;
    locations: Location[];
    tags: Tag[];
    departLocation: Location;
    tourSchedules: TourSchedule[];
    tourImages: TourImage[];
    otherTours: OtherTour[];
    tourDays: TourDay[];
  }

  export interface TourBookingData {
    id: number;
    name: string;
    numberDays: number;
    numberNight: number;
    privacy: string;
    departLocation: Location;
    tourSchedules: TourSchedule;
    tourImage: TourImage;
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
  
  export interface TourSchedule {
    scheduleId: number;
    startDate: string; // Consider using Date type if handling date conversion
    endDate: string;
    sellingPrice: number;
    minPax: number;
    maxPax: number;
    availableSeats: number;
    meetingLocation: string;
    departureTime: DepartureTime;
    extraHotelCost: number;
  }
  
  export interface DepartureTime {
    hour: number;
    minute: number;
    second: number;
    nano: number;
  }
  
  export interface TourImage {
    id: number;
    imageUrl: string;
  }
  
  export interface OtherTour {
    id: number;
    name: string;
    numberDays: number;
    numberNight: number;
    tags: Tag[];
    departLocation: Location;
    tourImages: TourImage[];
    priceFrom: number;
  }
  
  export interface TourDay {
    id: number;
    title: string;
    content: string;
    mealPlan: string;
  }
  