// src/app/core/models/service.model.ts
export interface ServiceBase {
  id: number;
  name: string;
  nettPrice: number;
  sellingPrice: number;
  imageUrl: string;
  startDate: string; // hoặc Date, tùy backend trả về
  endDate: string;   // hoặc Date
  deleted: boolean;
  serviceCategoryId?: number;
  serviceCategoryName?: string;
  serviceProviderId?: number;
  serviceProviderName?: string; // Đảm bảo có trường này
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceResponse {
  id: number;
  name: string;
  nettPrice: number;
  sellingPrice: number;
  imageUrl: string;
  startDate: string;
  endDate: string;
  deleted: boolean;
  categoryId: number;
  categoryName: string;
  providerId: number;
  providerName: string;
  createdAt: string;
  updatedAt: string;
  roomDetails?: Room;
  mealDetails?: Meal;
  transportDetails?: Transport;
}

export interface Room {
  id: number;
  capacity: number;
  availableQuantity: number;
  deleted: boolean;
  serviceId: number;
  facilities: string;
  createdAt: string;
  updatedAt: string;
}

export interface Meal {
  id: number;
  type: 'BREAKFAST' | 'LUNCH' | 'DINNER' | string;
  serviceId: number;
  deleted: boolean;
  mealDetail: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transport {
  id: number;
  seatCapacity: number;
  deleted: boolean;
  serviceId: number;
  createdAt: string;
  updatedAt: string;
}

// Interface mở rộng để thêm displayText
export interface RoomWithDisplay extends Room {
  displayText?: string;
}

export interface MealWithDisplay extends Meal {
  displayText?: string;
}

export interface TransportWithDisplay extends Transport {
  displayText?: string;
}

export interface TourDayService {
  id: number;
  // Thêm các thuộc tính khác nếu cần dựa trên TourDayServiceDTO từ backend
}