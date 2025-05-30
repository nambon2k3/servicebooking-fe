export interface Blog {
    id: number;
    thumbnailImageUrl: string;
    title: string;
    description: string;
    content: string;
    author: {id: number; fullName: string, avatarImage:string, email: string};
    tags: { id: number; name: string }[];
    deleted: boolean;
    selected: boolean;
    createdAt: Date;
}

export interface BlogResponse {
    id: number;
    thumbnailImageUrl: string;
    title: string;
    description: string;
    content: string;
    author: {id: number; fullName: string, avatarImage:string, email: string};
    tags: { id: number; name: string }[];
    deleted: boolean;
    selected: boolean;
    createdAt: Date;
}