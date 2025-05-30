// src/app/core/models/api-response.model.ts
export interface ApiResponse<T> {
    status: number;
    code: number;
    message: string;
    data: PaginatedData<T> | T; // Hỗ trợ cả PaginatedData và T trực tiếp
}

export interface PaginatedData<T> {
    page: number;
    size: number;
    total: number;
    items: T[];
}