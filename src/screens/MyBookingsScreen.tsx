import React from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ROOMS } from '../data';
import { useBookings, useCancelBooking } from '../api/queries';
import { useAppStore } from '../store';
import { colors, radius, shadow, spacing, typography } from '../theme';

function formatDate(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' });
}

export default function MyBookingsScreen() {
  const { data: bookings = [], isLoading } = useBookings();
  const currentUser = useAppStore((s) => s.currentUser);
  const currentUserId = currentUser?.id ?? '';
  const cancelBooking = useCancelBooking();

  const mine = bookings
    .filter((b) => b.userId === currentUserId)
    .sort((a, b) => (a.date + a.slot).localeCompare(b.date + b.slot));

  const upcoming = mine.filter((b) => b.date >= new Date().toISOString().slice(0, 10));
  const past = mine.filter((b) => b.date < new Date().toISOString().slice(0, 10));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Lịch đặt phòng</Text>
        <Text style={styles.subtitle}>của {currentUser?.name?.split(' ')[0] ?? 'bạn'}</Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatCard icon="calendar" label="Tổng đặt" value={mine.length} color={colors.primary} />
        <StatCard icon="time" label="Sắp tới" value={upcoming.length} color={colors.success} />
        <StatCard icon="checkmark-done" label="Đã qua" value={past.length} color={colors.textMuted} />
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={mine}
          keyExtractor={(b) => b.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}>
                <Ionicons name="calendar-outline" size={36} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>Chưa có lịch đặt nào</Text>
              <Text style={styles.emptySubtitle}>Hãy đặt phòng học đầu tiên của bạn!</Text>
            </View>
          }
          renderItem={({ item }) => {
            const room = ROOMS.find((r) => r.id === item.roomId) ?? {
              id: item.roomId,
              name: 'Phòng học',
              building: 'Khu tự học',
              seats: 0,
              emoji: '🏛️',
              image: '',
            };
            const isPast = item.date < new Date().toISOString().slice(0, 10);
            return (
              <View style={[styles.card, isPast && styles.cardPast]}>
                <View style={styles.cardLeft}>
                  {/* Time indicator */}
                  <View style={[styles.timeBar, { backgroundColor: isPast ? colors.textMuted : colors.primary }]} />

                  {/* Icon */}
                  <View style={[styles.iconWrap, {
                    backgroundColor: isPast ? colors.bgElevated : colors.primaryGlow,
                    borderColor: isPast ? colors.border : 'rgba(99,102,241,0.3)',
                  }]}>
                    <Ionicons name="business" size={20} color={isPast ? colors.textMuted : colors.primary} />
                  </View>
                </View>

                <View style={styles.cardContent}>
                  <Text style={[styles.roomName, isPast && { color: colors.textSecondary }]} numberOfLines={1}>
                    {room.name}
                  </Text>
                  <Text style={styles.building}>{room.building}</Text>
                  <View style={styles.metaRow}>
                    <View style={styles.metaChip}>
                      <Ionicons name="calendar-outline" size={11} color={colors.textMuted} />
                      <Text style={styles.metaText}>{formatDate(item.date)}</Text>
                    </View>
                    <View style={styles.metaDot} />
                    <View style={styles.metaChip}>
                      <Ionicons name="time-outline" size={11} color={colors.textMuted} />
                      <Text style={styles.metaText}>{item.slot}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  {isPast ? (
                    <View style={styles.pastBadge}>
                      <Text style={styles.pastBadgeText}>Đã qua</Text>
                    </View>
                  ) : (
                    <Pressable
                      id={`cancel-booking-${item.id}`}
                      hitSlop={8}
                      style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.7 }]}
                      onPress={() =>
                        Alert.alert('Huỷ đặt phòng?', `${room.name}\n${item.date} • ${item.slot}`, [
                          { text: 'Không', style: 'cancel' },
                          { text: 'Huỷ phòng', style: 'destructive', onPress: () => cancelBooking.mutate(item.id) },
                        ])
                      }
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.danger} />
                    </Pressable>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

function StatCard({
  icon, label, value, color,
}: {
  icon: keyof typeof Ionicons.glyphMap; label: string; value: number; color: string;
}) {
  return (
    <View style={statStyles.card}>
      <View style={[statStyles.icon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1, alignItems: 'center', gap: 4,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  icon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 22, fontWeight: '900' },
  label: { ...typography.micro, color: colors.textMuted },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, marginBottom: spacing.lg },
  title: { ...typography.h1, color: colors.textPrimary },
  subtitle: { ...typography.caption, color: colors.textMuted, marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.lg },

  listContent: { paddingHorizontal: spacing.lg, paddingBottom: 40 },

  // Card
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.card,
  },
  cardPast: { opacity: 0.65 },
  cardLeft: { flexDirection: 'row', alignItems: 'stretch' },
  timeBar: { width: 3, alignSelf: 'stretch', borderTopLeftRadius: radius.lg, borderBottomLeftRadius: radius.lg },
  iconWrap: {
    width: 50, height: 50, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
    margin: spacing.md, borderWidth: 1,
  },
  cardContent: { flex: 1, paddingVertical: spacing.md },
  roomName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  building: { ...typography.micro, color: colors.textMuted, marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { ...typography.micro, color: colors.textMuted },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.border, marginHorizontal: 5 },

  cardActions: { paddingRight: spacing.md, alignItems: 'center', justifyContent: 'center' },
  cancelBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: colors.dangerBg, borderWidth: 1, borderColor: colors.dangerBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  pastBadge: {
    backgroundColor: colors.bgElevated, paddingVertical: 4, paddingHorizontal: 8,
    borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border,
  },
  pastBadgeText: { ...typography.micro, color: colors.textMuted },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { ...typography.caption, color: colors.textMuted },
  emptyWrap: { alignItems: 'center', marginTop: 80, gap: 10 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  emptyTitle: { ...typography.h3, color: colors.textSecondary },
  emptySubtitle: { ...typography.caption, color: colors.textMuted },
});