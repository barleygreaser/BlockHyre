import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { useColorScheme } from '../useColorScheme';

export interface Review {
    id: string;
    author: string;
    initials: string;
    rating: number;
    text: string;
}

interface ReviewCardProps {
    review: Review;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={[styles.card, isDark && styles.cardDark]}>
            <View style={styles.header}>
                <View style={styles.authorContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.initials}>{review.initials}</Text>
                    </View>
                    <Text style={[styles.authorName, isDark && styles.authorNameDark]}>
                        {review.author}
                    </Text>
                </View>
                <View style={styles.ratingContainer}>
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            size={14}
                            color="#F59E0B"
                            fill={i < review.rating ? '#F59E0B' : 'transparent'}
                        />
                    ))}
                </View>
            </View>
            <Text style={[styles.reviewText, isDark && styles.reviewTextDark]}>
                {review.text}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        marginBottom: 12,
    },
    cardDark: {
        backgroundColor: '#1E293B',
        borderColor: '#334155',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#DBEAFE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    initials: {
        fontSize: 12,
        fontWeight: '700',
        color: '#2563EB',
    },
    authorName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#0F172A',
    },
    authorNameDark: {
        color: '#FFFFFF',
    },
    ratingContainer: {
        flexDirection: 'row',
        gap: 2,
    },
    reviewText: {
        fontSize: 13,
        lineHeight: 20,
        color: '#64748B',
        fontStyle: 'italic',
    },
    reviewTextDark: {
        color: '#94A3B8',
    },
});
