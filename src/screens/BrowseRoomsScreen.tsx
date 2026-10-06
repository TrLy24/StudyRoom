import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DATES, ROOMS, SLOTS } from '../data';
import { useBookings } from '../api/queries';
import { RoomCard } from '../components/RoomCard';
import FilterModal, { Filters } from '../components/FilterModal';
import { useAppStore } from '../store';
import { RootStackParamList } from '../types';
import { colors, radius, shadow, spacing, typography } from '../theme';

const CARD_HEIGHT = 104;

const VI_WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function parseDateInfo(d: string, idx: number) {
  const date = new Date(d);
  return {
    dayName: idx === 0 ? 'Hôm\nnay' : VI_WEEKDAYS[date.getDay()],
    dayNum: date.getDate(),
    month: date.getMonth() + 1,
    isToday: idx === 0,
  };
}

export default function BrowseRoomsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: bookings = [], isLoading } = useBookings();
  const currentUser = useAppStore((s) => s.currentUser);

  const [query, setQuery] = useState('');
  const [date, setDate] = useState(DATES[0]);
  const [filters, setFilters] = useState<Filters>({ building: 'all', minSeats: 0, onlyFree: false });
  const [filterOpen, setFilterOpen] = useState(false);

  const searchAnim = useRef(new Animated.Value(1)).current;

  const activeFilterCount =
    (filters.building !== 'all' ? 1 : 0) + (filters.minSeats > 0 ? 1 : 0) + (filters.onlyFree ? 1 : 0);

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ROOMS.map((room) => {
      const taken = bookings.filter((b) => b.roomId === room.id && b.date === date).length;
      return { room, freeSlots: SLOTS.length - taken };
    }).filter(({ room, freeSlots }) => {
      if (q && !room.name.toLowerCase().includes(q)) return false;
      if (filters.building !== 'all' && room.building !== filters.building) return false;
      if (room.seats < filters.minSeats) return false;
      if (filters.onlyFree && freeSlots === 0) return false;
      return true;
    });
  }, [query, filters, date, bookings]);

  const openRoom = useCallback((roomId: string) => nav.navigate('RoomDetail', { roomId }), [nav]);
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({ length: CARD_HEIGHT, offset: CARD_HEIGHT * index, index }),
    []
  );

  // Stats
  const totalFree = data.filter((d) => d.freeSlots > 0).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào, {currentUser?.name?.split(' ')[0] ?? 'bạn'} 👋</Text>
          <Text style={styles.title}>Tìm phòng học</Text>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.statBadge}>
            <Text style={styles.statNum}>{totalFree}</Text>
            <Text style={styles.statLabel}>Còn trống</Text>
          </View>
        </View>
      </View>

      {/* Search + Filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            id="room-search-input"
            style={styles.searchInput}
            placeholder="Tìm theo tên phòng..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            clearButtonMode="while-editing"
          />
        </View>
        <Pressable
          id="filter-btn"
          style={({ pressed }) => [styles.filterBtn, pressed && { opacity: 0.8 }]}
          onPress={() => setFilterOpen(true)}
        >
          <Ionicons name="options" size={18} color={colors.onPrimary} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Date selector — Calendar Strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateRow}
      >
        {DATES.map((d, i) => {
          const { dayName, dayNum, month, isToday } = parseDateInfo(d, i);
          const active = date === d;
          return (
            <Pressable
              key={d}
              id={`date-chip-${i}`}
              onPress={() => setDate(d)}
              style={[styles.dateChip, active && styles.dateChipActive]}
            >
              {/* Today indicator dot */}
              {isToday && !active && <View style={styles.todayDot} />}
              <Text style={[styles.dateDayName, active && styles.dateTextActive]}>
                {dayName}
              </Text>
              <Text style={[styles.dateNum, active && styles.dateTextActive]}>
                {dayNum}
              </Text>
              {!isToday && (
                <Text style={[styles.dateMonth, active && styles.dateTextActiveLight]}>
                  Th{month}
                </Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Results summary */}
      <View style={styles.resultRow}>
        <View style={styles.resultDot} />
        <Text style={styles.resultText}>{data.length} phòng phù hợp</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.room.id}
          renderItem={({ item }) => (
            <RoomCard room={item.room} freeSlots={item.freeSlots} onPress={openRoom} />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}>
                <Ionicons name="search-outline" size={32} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>Không tìm thấy phòng</Text>
              <Text style={styles.emptySubtitle}>Thử điều chỉnh bộ lọc</Text>
            </View>
          }
          getItemLayout={getItemLayout}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={5}
          removeClippedSubviews
        />
      )}

      <FilterModal
        visible={filterOpen}
        filters={filters}
        onApply={(f) => { setFilters(f); setFilterOpen(false); }}
        onClose={() => setFilterOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, marginBottom: spacing.lg,
  },
  greeting: { ...typography.caption, color: colors.textMuted, marginBottom: 2 },
  title: { ...typography.h1, color: colors.textPrimary },
  headerStats: {},
  statBadge: {
    backgroundColor: colors.primaryGlow,
    borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)',
    borderRadius: radius.lg,
    paddingVertical: 6, paddingHorizontal: 14,
    alignItems: 'center',
  },
  statNum: { fontSize: 20, fontWeight: '900', color: colors.primary, lineHeight: 24 },
  statLabel: { fontSize: 10, fontWeight: '600', color: colors.primaryLight },

  // Search
  searchRow: {
    flexDirection: 'row', gap: spacing.sm,
    paddingHorizontal: spacing.lg, marginBottom: spacing.lg,
  },
  searchWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md,
    ...shadow.card,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: colors.textPrimary },
  filterBtn: {
    width: 48, height: 48,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
    ...shadow.glow,
  },
  filterBadge: {
    position: 'absolute', top: -5, right: -5,
    backgroundColor: colors.warning,
    borderRadius: radius.pill, minWidth: 18, height: 18,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3, borderWidth: 2, borderColor: colors.bg,
  },
  filterBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  // Dates — Calendar Strip
  dateRow: { paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.lg, paddingVertical: 4 },
  dateChip: {
    paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center',
    minWidth: 58,
    position: 'relative',
    overflow: 'visible',
  },
  dateChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadow.glow,
  },
  todayDot: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: colors.primary,
    marginBottom: 4,
  },
  dateDayName: {
    fontSize: 10, fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    textAlign: 'center',
    lineHeight: 13,
  },
  dateNum: {
    fontSize: 20, fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 2, lineHeight: 24,
  },
  dateMonth: {
    fontSize: 10, fontWeight: '600',
    color: colors.textMuted,
    marginTop: 1,
  },
  dateTextActive: { color: colors.onPrimary },
  dateTextActiveLight: { color: 'rgba(255,255,255,0.7)' },

  // Results
  resultRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: spacing.lg, marginBottom: spacing.sm,
  },
  resultDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  resultText: { ...typography.caption, color: colors.textSecondary },

  // List
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },

  // Loading
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { ...typography.caption, color: colors.textMuted },

  // Empty
  emptyWrap: { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { ...typography.h3, color: colors.textSecondary },
  emptySubtitle: { ...typography.caption, color: colors.textMuted },
});