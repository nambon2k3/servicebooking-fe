export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELED = 'CANCELED',
  SUCCESS = 'SUCCESS',
  COMPLETED = 'COMPLETED'
}

export interface ServiceBooking {
  id: number;
  bookingCode: string;
  userId: number;
  userName: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: Date | string;
}