export interface User {
    id: number;
    fullName: string;
    username: string;
    password: string;
    email: string;
    gender: boolean;
    phone: string;
    address: string;
    avatarImage: string;
    roleNames: [string];
    deleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}