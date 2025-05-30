export interface PublicLocationSimpleDTO {
  id?: number;
  name: string;
}

export interface TourDayServiceProcessDTO {
  id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
}

export interface TourDayProcessDTO {
  id: number;
  title: string;
  description: string;
  dayNumber: number;
}

export interface TourImageDTO {
  id?: number;
  url: string;
}

export interface Tour {
  id: number;
  name: string;
  tourType: string;
  createdAt: string;
  tourStatus: string;
}

export interface TourDetail {
  id: number;
  name: string;
  highlights: string;
  numberDays: number;
  numberNights: number;
  note: string;
  tourType: string;
  tourStatus: string;
  departLocation: PublicLocationSimpleDTO;
  privacy: string;
  createdBy: string;
  tourImages: TourImageDTO[];
  tourDays: TourDayProcessDTO[];
}

export interface TourDayDetail {
  id: number;
  dayNumber: number;
  title: string;
  content: string;
  mealPlan: string;
  deleted: boolean;
  location: PublicLocationSimpleDTO;
  tourDayServices: TourDayServiceProcessDTO[];
}

export interface PagingDTO<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

export interface GeneralResponse<T> {
  code: number;
  message: string;
  data: T;
}

export enum TourStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export const TourStatusDisplay: { [key: string]: string } = {
  PENDING: 'Đang chờ xử lý',
  APPROVED: 'Đã phê duyệt',
  REJECTED: 'Đã từ chối',
};