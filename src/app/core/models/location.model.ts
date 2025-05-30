export interface Locations {
    id: number;
    name: string;
    description: string;
    image: string;
    deleted: boolean;
    geoPosition: {
        createdAt: string;
        updatedAt: string;
        id: number;
        latitude: number;
        longitude: number;
        deleted: boolean
    }
}