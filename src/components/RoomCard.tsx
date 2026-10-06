import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Room } from '../types';
import { colors, radius, shadow, spacing, typography } from '../theme';

type Props = { room: Room; freeSlots: number; onPress: (id: string) => void };

function RoomCardBase({ room, freeSlots, onPress }: Props) {
  const available = freeSlots > 0;

  return (
    <Pressable
      id={`room-card-${room.id}`}
      onPress={() => onPress(room.id)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {/* Room image */}
      <View style={styles.imageWrap}>
        <Image source={{ uri: room.image }} style={styles.photo} resizeMode="cover" />
        {/* Emoji badge */}
        <View style={styles.emojiBadge}>
          <Text style={styles.emoji}>{room.emoji}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{room.name}</Text>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={12} color={colors.textMuted} />
          <Text style={styles.metaText}>{room.building}</Text>
          <View style={styles.dot} />
          <Ionicons name="people-outline" size={12} color={colors.textMuted} />
          <Text style={styles.metaText}>{room.seats} chỗ</Text>
        </View>

        <View style={[styles.badge, {
          backgroundColor: available ? colors.successBg : colors.dangerBg,
          borderColor: available ? colors.successBorder : colors.dangerBorder,
        }]}>
          <View style={[styles.badgeDot, { backgroundColor: available ? colors.success : colors.danger }]} />
          <Text style={[styles.badgeText, { color: available ? colors.success : colors.danger }]}>
            {available ? `${freeSlots} khung trống` : 'Hết chỗ'}
          </Text>
        </View>
      </View>

      <View style={styles.arrowWrap}>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

export const RoomCard = React.memo(RoomCardBase);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
    borderColor: colors.glassBorderLight,
  },
  imageWrap: {
    position: 'relative',
    width: 72,
    height: 72,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  photo: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  emojiBadge: {
    position: 'absolute', bottom: 4, right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: radius.xs,
    padding: 2,
  },
  emoji: { fontSize: 12 },
  content: { flex: 1 },
  name: { ...typography.h3, color: colors.textPrimary, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  metaText: { ...typography.micro, color: colors.textMuted },
  dot: { width: 2, height: 2, borderRadius: 1, backgroundColor: colors.textMuted, marginHorizontal: 2 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  badgeDot: { width: 5, height: 5, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  arrowWrap: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.glass,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
});