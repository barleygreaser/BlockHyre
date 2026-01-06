import { ListingStatus, DisplayStatus, ContextualListing } from '@/app/types/listing-types';

/**
 * Derives the user-facing DisplayStatus based on listing state
 * @param listing The listing with status and availability fields
 * @returns The user-friendly DisplayStatus string
 */
export function getDisplayStatus(listing: ContextualListing): DisplayStatus {
    // Priority: Booked status overrides everything
    if (listing.isBooked) {
        return 'Booked';
    }

    // Check administrative status
    switch (listing.status) {
        case 'draft':
            return 'Draft';
        case 'archived':
            return 'Archived';
        case 'active':
            // Active + unavailable = Paused
            return listing.is_available ? 'Active' : 'Paused';
        default:
            return 'Draft';
    }
}
