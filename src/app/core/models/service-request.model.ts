// Cấu trúc chung cho API response
export interface GeneralResponse<T> {
  code: number;
  message: string;
  data: T;
}

// Cấu trúc phân trang
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

// Enum trạng thái từ backend
export enum TourBookingServiceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NOT_ORDERED = 'NOT_ORDERED',
  SUCCESS = 'SUCCESS',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  AVAILABLE = 'AVAILABLE',
  CHECKING = 'CHECKING',
  CHANGE_REQUEST = 'CHANGE_REQUEST',
  ADD_REQUEST = 'ADD_REQUEST',
  CANCEL_REQUEST = 'CANCEL_REQUEST',
  REJECTED_BY_OPERATOR = 'REJECTED_BY_OPERATOR',
  CANCELLED = 'CANCELLED',
  CHANGED = 'CHANGED',
  PENDING_CANCEL_REQUEST = 'PENDING_CANCEL_REQUEST',
  APPROVE_CANCEL_REQUEST = 'APPROVE_CANCEL_REQUEST',
}

// Enum trạng thái hiển thị trên giao diện
export enum TourBookingServiceStatusDisplay {
  PENDING = 'Chờ duyệt',
  APPROVED = 'Chấp thuận',
  REJECTED = 'Bị từ chối',
  CANCELLED = 'Bị hủy',
  NOT_ORDERED = 'Chưa đặt dịch vụ',
  SUCCESS = 'Đặt thành công',
  NOT_AVAILABLE = 'Không khả dụng',
  AVAILABLE = 'Khả dụng',
  CHECKING = 'Đang kiểm tra',
  CHANGE_REQUEST = 'Yêu cầu thay đổi',
  ADD_REQUEST = 'Yêu cầu thêm dịch vụ',
  CANCEL_REQUEST = 'Yêu cầu hủy (chưa order)',
  REJECTED_BY_OPERATOR = 'Điều hành từ chối',
  CHANGED = 'Đã thay đổi',
  PENDING_CANCEL_REQUEST = 'Yêu cầu hủy (pending)',
  APPROVE_CANCEL_REQUEST = 'Yêu cầu hủy (đã đặt)',
}

// DTO cho danh sách request
export interface ServiceProviderBookingServiceDTO {
  id: number;
  serviceName: string;
  currentQuantity: number;
  requestedQuantity: number;
  requestDate: string;
  reason: string;
  status: string;
}

// DTO cho chi tiết request
export interface ChangeServiceDetailDTO {
  tourBookingServiceId: number;
  tourName: string;
  tourType: string;
  startDate: string;
  endDate: string;
  dayNumber: number;
  bookingCode: string;
  status: string;
  reason: string;
  proposer: string;
  updatedAt: string;
  serviceName: string;
  nettPrice: number;
  currentQuantity: number;
  requestQuantity: number;
  totalPrice: number;
  items?: ServiceRequestItem[]; // Đổi thành tùy chọn để khớp với dữ liệu thực tế
}

// Model frontend cho danh sách
export interface TourBookingService {
  id: number;
  serviceName: string;
  currentQuantity: number;
  requestedQuantity: number;
  requestDate: string;
  reason: string;
  status: string;
  tourName?: string;
  tourType?: string;
  proposer?: string;
  startDate?: string;
  endDate?: string;
  dayNumber?: number;
  bookingCode?: string;
  updatedAt?: string;
  nettPrice?: number;
  totalPrice?: number;
}

// Model frontend cho chi tiết
export interface ServiceRequestDetail {
  tourBookingServiceId: number;
  bookingCode: string;
  proposer: string;
  serviceName: string;
  tourName: string;
  tourType: string;
  startDate: string;
  endDate: string;
  dayNumber: number;
  updatedAt: string;
  nettPrice: number;
  currentQuantity: number;
  requestQuantity: number;
  totalPrice: number;
  items?: ServiceRequestItem[]; // Đổi thành tùy chọn để khớp với dữ liệu thực tế
  reason: string;
  status: string;
}

export interface ServiceRequestItem {
  order: number;
  requestContent: string;
  unitPrice: number;
  quantity: number;
  total: number;
}