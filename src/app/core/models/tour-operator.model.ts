export interface TourScheduleResponse {
    code: number;
    message: string;
    data: TourScheduleData;
  }
  
  export interface TourScheduleData {
    page: number;
    size: number;
    total: number;
    items: TourSchedule[];
  }
  
  export interface TourSchedule {
    scheduleId: number;
    startDate: string; 
    endDate: string; 
    status: string; 
    tourName: string;
    tourGuide?: string | null;
    operator?: string | null;
    maxPax: number;
    availableSeats: number;
  }
  