export type ListingStatus = 'active' | 'draft' | 'archived';
export type DisplayStatus = 'Active' | 'Paused' | 'Draft' | 'Archived' | 'Booked';

export interface ContextualListing {
    id: string;
    title: string;
    status: ListingStatus;
    is_available: boolean;
    isBooked?: boolean;
}
