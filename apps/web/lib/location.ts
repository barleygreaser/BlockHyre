export interface Coordinates {
    latitude: number;
    longitude: number;
}

/**
 * Calculates the distance between two points on the Earth using the Haversine formula.
 * 
 * Formula:
 * $$d = 2R \cdot \arcsin \left( \sqrt{ \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos \phi_1 \cdot \cos \phi_2 \cdot \sin^2\left(\frac{\Delta\lambda}{2}\right) } \right)$$
 * 
 * @param start Coordinates of the starting point
 * @param end Coordinates of the destination point
 * @returns Distance in miles
 */
export function calculateDistance(start: Coordinates, end: Coordinates): number {
    const R = 3958.8; // Earth's radius in miles
    const dLat = toRadians(end.latitude - start.latitude);
    const dLon = toRadians(end.longitude - start.longitude);
    const lat1 = toRadians(start.latitude);
    const lat2 = toRadians(end.latitude);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Round to 1 decimal place
    return Math.round(R * c * 10) / 10;
}

function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}
