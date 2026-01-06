"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import * as turf from '@turf/turf';
import "mapbox-gl/dist/mapbox-gl.css";

interface NeighborhoodMapProps {
    latitude: number;
    longitude: number;
    radiusMiles?: number;
    neighborhoodName?: string;
}

export function NeighborhoodMap({
    latitude,
    longitude,
    radiusMiles = 2.0,
    neighborhoodName
}: NeighborhoodMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!mapContainer.current) return;
        if (map.current) return;

        const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

        if (!token) {
            setError('Mapbox access token is missing');
            return;
        }

        try {
            mapboxgl.accessToken = token;

            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [longitude, latitude],
                zoom: 12,
                interactive: false,
                attributionControl: false
            });

            map.current.on('load', () => {
                if (!map.current) return;

                // Create a circle polygon using Turf.js
                const center = turf.point([longitude, latitude]);
                const radius = radiusMiles; // miles
                const options = { steps: 64, units: 'miles' as const };
                const circle = turf.circle(center, radius, options);

                // Add the circle as a fill layer
                map.current.addSource('radius-area', {
                    type: 'geojson',
                    data: circle
                });

                map.current.addLayer({
                    id: 'radius-fill',
                    type: 'fill',
                    source: 'radius-area',
                    paint: {
                        'fill-color': '#ff6b35',
                        'fill-opacity': 0.15
                    }
                });

                map.current.addLayer({
                    id: 'radius-outline',
                    type: 'line',
                    source: 'radius-area',
                    paint: {
                        'line-color': '#ff6b35',
                        'line-width': 3,
                        'line-opacity': 0.8
                    }
                });

                // Fit map to show the entire circle
                const bounds = turf.bbox(circle);
                map.current.fitBounds(bounds as [number, number, number, number], {
                    padding: 20
                });
            });

            map.current.on('error', (e) => {
                console.error('Mapbox error:', e);
                setError('Failed to load map');
            });

        } catch (err) {
            console.error('Error initializing map:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        }

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, [latitude, longitude, radiusMiles]);

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-red-50 rounded-lg">
                <p className="text-xs text-red-600 p-2 text-center">{error}</p>
            </div>
        );
    }

    return (
        <div
            ref={mapContainer}
            className="w-full h-full rounded-lg overflow-hidden"
            style={{ minHeight: '160px' }}
        />
    );
}
