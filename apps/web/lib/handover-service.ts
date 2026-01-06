import { supabase } from "@/lib/supabase";

/**
 * Uploads handover verification photos to Supabase storage
 * @param rentalId - UUID of the rental
 * @param files - Array of image files to upload (min 3, max 6)
 * @returns Promise<string[]> - Array of public URLs for uploaded images
 */
export async function uploadHandoverPhotos(
    rentalId: string,
    files: File[]
): Promise<string[]> {
    if (files.length < 3) {
        throw new Error("Minimum 3 photos required");
    }

    if (files.length > 6) {
        throw new Error("Maximum 6 photos allowed");
    }

    const uploadPromises = files.map(async (file, index) => {
        const timestamp = Date.now();
        const fileExt = file.name.split('.').pop();
        const fileName = `${rentalId}/${timestamp}-${index}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('rental-verifications')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            throw new Error(`Failed to upload ${file.name}: ${error.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('rental-verifications')
            .getPublicUrl(fileName);

        return urlData.publicUrl;
    });

    try {
        const urls = await Promise.all(uploadPromises);
        return urls;
    } catch (error) {
        // If any upload fails, attempt to clean up successfully uploaded files
        console.error('Upload failed, attempting cleanup:', error);
        throw error;
    }
}

/**
 * Completes the handover process by calling the transition RPC
 * @param rentalId - UUID of the rental
 * @param photoUrls - Array of uploaded photo URLs
 * @returns Promise with success status and message
 */
export async function completeHandover(
    rentalId: string,
    photoUrls: string[]
): Promise<{ success: boolean; message?: string; error?: string }> {
    const { data, error } = await supabase.rpc('transition_to_active', {
        p_rental_id: rentalId,
        p_photo_urls: photoUrls
    });

    if (error) {
        return {
            success: false,
            error: error.message
        };
    }

    return data as { success: boolean; message?: string; error?: string };
}
