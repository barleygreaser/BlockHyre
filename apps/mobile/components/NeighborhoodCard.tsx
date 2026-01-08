import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { MapPin, CheckCircle, Info } from 'lucide-react-native';
import Svg, { Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg';

interface NeighborhoodCardProps {
    neighborhoodName?: string;
    radiusMiles?: number;
    isVerified?: boolean;
}

export default function NeighborhoodCard({
    neighborhoodName = "Woodstock, GA",
    radiusMiles = 2.0,
    isVerified = true
}: NeighborhoodCardProps) {

    // Simple decorative map background
    const MapVisualization = () => (
        <View style={styles.mapContainer}>
            <View style={styles.mapBackground}>
                {/* Abstract Map Roads */}
                <Svg height="100%" width="100%" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
                    <Defs>
                        <RadialGradient id="grad" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%" gradientUnits="userSpaceOnUse">
                            <Stop offset="0%" stopColor="rgba(255, 103, 0, 0.1)" stopOpacity="1" />
                            <Stop offset="100%" stopColor="rgba(255, 103, 0, 0)" stopOpacity="0" />
                        </RadialGradient>
                    </Defs>

                    {/* Background Grid/Roads */}
                    <Path d="M0 40 Q 50 20 100 40 T 200 40" stroke="#E2E8F0" strokeWidth="3" fill="none" />
                    <Path d="M40 0 Q 60 50 40 120" stroke="#E2E8F0" strokeWidth="3" fill="none" />
                    <Path d="M160 0 Q 140 50 160 120" stroke="#E2E8F0" strokeWidth="3" fill="none" />
                    <Path d="M0 90 L 200 80" stroke="#E2E8F0" strokeWidth="2" fill="none" />
                    <Path d="M80 0 L 120 120" stroke="#E2E8F0" strokeWidth="2" fill="none" />

                    {/* Radius Circle */}
                    <Circle cx="100" cy="60" r="35" fill="url(#grad)" stroke="rgba(255, 103, 0, 0.3)" strokeWidth="1" strokeDasharray="4 2" />
                    <Circle cx="100" cy="60" r="4" fill="#FF6700" />
                </Svg>
            </View>

            {/* Overlay Tag */}
            <View style={styles.mapOverlay}>
                <MapPin size={12} color="#FFFFFF" strokeWidth={3} />
                <Text style={styles.mapOverlayText}>Pilot Zone</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <MapPin size={20} color="#FF6700" />
                    <Text style={styles.title}>My Neighborhood</Text>
                </View>
                <Text style={styles.description}>Your verified zone for renting and listing tools.</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.infoSection}>
                    <Text style={styles.neighborhoodName}>{neighborhoodName}</Text>
                    <Text style={styles.radiusText}>{neighborhoodName} • {radiusMiles} mi Radius</Text>

                    <View style={styles.verifiedBadge}>
                        <CheckCircle size={14} color="#15803d" />
                        <Text style={styles.verifiedText}>Verified Resident</Text>
                        <Text style={styles.sinceText}>Since Dec 2025</Text>
                    </View>

                    <View style={styles.infoBox}>
                        <Text style={styles.infoBoxText}>
                            You can view and rent listings from neighbors within the <Text style={styles.boldText}>{neighborhoodName || "local"}</Text> pilot zone.
                        </Text>
                    </View>
                </View>

                <MapVisualization />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12, // Matched with Menu Group
        padding: 20,
        // Removed heavy shadow to match "outline" style of menus, or kept minimal
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#E5E7EB', // Matched with Menu Group
    },
    header: {
        marginBottom: 16,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        fontFamily: 'System', // Use default font or custom if available
    },
    description: {
        fontSize: 13,
        color: '#64748B',
    },
    content: {
        gap: 16,
    },
    infoSection: {
        gap: 8,
    },
    neighborhoodName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0F172A',
        // Example Serif font if available, else system
    },
    radiusText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#DCFCE7', // Green-100
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#BBF7D0',
        marginBottom: 4,
    },
    verifiedText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#15803d', // Green-700
    },
    sinceText: {
        fontSize: 11,
        color: '#94A3B8',
        marginLeft: 4,
    },
    infoBox: {
        backgroundColor: '#FFF7ED', // Orange-50
        borderColor: '#FFEDD5', // Orange-100
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
    },
    infoBoxText: {
        fontSize: 13,
        color: '#334155', // Slate-700
        lineHeight: 18,
    },
    boldText: {
        fontWeight: '700',
    },

    // Map Styles
    mapContainer: {
        height: 140,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        position: 'relative',
        backgroundColor: '#F8FAFC',
    },
    mapBackground: {
        flex: 1,
    },
    mapOverlay: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: '#1E293B',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    mapOverlayText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
});
