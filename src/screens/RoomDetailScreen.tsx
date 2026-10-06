import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { DATES, ROOMS, SLOTS, USERS } from '../data';
import { useBookings, useCreateBooking } from '../api/queries';
import { useAppStore } from '../store';
import { requestNotificationPermission, scheduleBookingReminder } from '../notifications';
import { RootStackParamList } from '../types';
import { colors, radius, shadow, spacing, typography } from '../theme';

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

type SlotState = 'free' | 'mine' | 'taken';

const SLOT_CONFIG: Record<SlotState, {
  bg: string; fg: string; border: string;
  icon: keyof typeof Ionicons.glyphMap; label: (name?: string) => string;
}> = {
  free: {
    bg: colors.successBg, fg: colors.success, border: colors.successBorder,
    icon: 'checkmark-circle', label: () => 'Còn trống — Nhấn để đặt',
  },
  mine: {
    bg: colors.infoBg, fg: colors.info, border: colors.infoBorder,
    icon: 'person-circle', label: () => 'Bạn đã đặt',
  },
  taken: {
    bg: colors.dangerBg, fg: colors.danger, border: colors.dangerBorder,
    icon: 'lock-closed', label: (name) => `Đã đặt bởi ${name ?? ''}`,
  },
};

export default function RoomDetailScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'RoomDetail'>>();
  const room = ROOMS.find((r) => r.id === params?.roomId);

  const { data: bookings = [] } = useBookings();
  const currentUser = useAppStore((s) => s.currentUser);
  const currentUserId = currentUser?.id ?? '';
  const createBooking = useCreateBooking();

  const [date, setDate] = useState(DATES[0]);
  const [racing, setRacing] = useState(false);
  const nameOf = (uid: string) => USERS.find((u) => u.id === uid)?.name ?? uid;

  if (!room) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.warning} />
          <Text style={{ ...typography.h3, color: colors.textPrimary, marginTop: 12 }}>
            Không tìm thấy thông tin phòng học
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const bookedForDate = bookings.filter((b) => b.roomId === room.id && b.date === date);
  const freeCount = SLOTS.length - bookedForDate.length;

  const onPressSlot = (slot: string) => {
    Alert.alert(
      'Xác nhận đặt phòng',
      `${room.name}\n📅 ${date}  •  🕐 ${slot}`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Đặt ngay',
          onPress: async () => {
            await requestNotificationPermission();
            const notificationId = await scheduleBookingReminder({
              bookingId: 'pending',
              roomName: room.name,
              date,
              slot,
            });

            try {
              const res = await createBooking.mutateAsync({
                roomId: room.id,
                date,
                slot,
                userId: currentUserId,
                notificationId: notificationId ?? undefined,
              });

              if (!res.ok && notificationId) {
                // Hủy thông báo nếu đặt phòng thất bại
                const { cancelBookingReminder } = await import('../notifications');
                await cancelBookingReminder(notificationId);
              }

              Alert.alert(
                res.ok ? '✅ Đặt phòng thành công' : '❌ Không đặt được',
                res.ok
                  ? notificationId
                    ? 'Bạn sẽ được nhắc trước 15 phút.'
                    : 'Đặt phòng thành công!'
                  : res.message
              );
            } catch (err) {
              if (notificationId) {
                const { cancelBookingReminder } = await import('../notifications');
                await cancelBookingReminder(notificationId);
              }
              Alert.alert('❌ Lỗi hệ thống', 'Không thể kết nối đến cơ sở dữ liệu. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  const simulateRace = async () => {
    const slot = SLOTS.find((s) => !bookings.some((b) => b.roomId === room.id && b.date === date && b.slot === s));
    if (!slot) return Alert.alert('Hết khung giờ trống để demo');

    setRacing(true);
    const calls = USERS.map(
      (u) =>
        new Promise<string>((resolve) => {
          setTimeout(async () => {
            const res = await createBooking.mutateAsync({ roomId: room.id, date, slot, userId: u.id });
            resolve(`${u.name}: ${res.ok ? '✅ ĐẶT ĐƯỢC' : '❌ ' + res.message}`);
          }, Math.random() * 150);
        })
    );
    const results = await Promise.all(calls);
    setRacing(false);
    Alert.alert(`Cùng đặt ${slot}`, results.join('\n\n'));
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.hero}>
          <Image source={{ uri: room.image }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroOverlay} />

          {/* Room info overlay */}
          <View style={styles.heroContent}>
            <View style={styles.roomEmojiWrap}>
              <Text style={styles.roomEmoji}>{room.emoji}</Text>
            </View>
            <Text style={styles.roomName}>{room.name}</Text>
            <View style={styles.heroMeta}>
              <View style={styles.heroMetaChip}>
                <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroMetaText}>{room.building}</Text>
              </View>
              <View style={styles.heroMetaDot} />
              <View style={styles.heroMetaChip}>
                <Ionicons name="people-outline" size={13} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroMetaText}>{room.seats} chỗ</Text>
              </View>
              <View style={styles.heroMetaDot} />
              <View style={[styles.heroMetaChip, {
                backgroundColor: freeCount > 0 ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)',
              }]}>
                <View style={[styles.liveDot, { backgroundColor: freeCount > 0 ? colors.success : colors.danger }]} />
                <Text style={styles.heroMetaText}>{freeCount} trống</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {/* Date Section */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>CHỌN NGÀY</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {DATES.map((d, i) => {
              const { dayName, dayNum, month, isToday } = parseDateInfo(d, i);
              const active = date === d;
              return (
                <Pressable
                  key={d}
                  id={`detail-date-${i}`}
                  onPress={() => setDate(d)}
                  style={[styles.dateChip, active && styles.dateChipActive]}
                >
                  {isToday && !active && <View style={styles.todayDot} />}
                  <Text style={[styles.dateChipDay, active && styles.dateTextActive]}>{dayName}</Text>
                  <Text style={[styles.dateChipNum, active && styles.dateTextActive]}>{dayNum}</Text>
                  {!isToday && (
                    <Text style={[styles.dateChipMonth, active && styles.dateTextActiveLight]}>Th{month}</Text>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Slots Section */}
          <View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>KHUNG GIỜ</Text>
            <Text style={styles.sectionSub}>{freeCount}/{SLOTS.length} còn trống</Text>
          </View>

          {SLOTS.map((slot) => {
            const b = bookings.find((x) => x.roomId === room.id && x.date === date && x.slot === slot);
            const mine = b?.userId === currentUserId;
            const state: SlotState = !b ? 'free' : mine ? 'mine' : 'taken';
            const cfg = SLOT_CONFIG[state];

            return (
              <Pressable
                key={slot}
                id={`slot-${slot.replace(':', '-')}`}
                disabled={!!b || createBooking.isPending}
                onPress={() => onPressSlot(slot)}
                style={({ pressed }) => [
                  styles.slot,
                  { backgroundColor: cfg.bg, borderColor: cfg.border },
                  b && !mine && { opacity: 0.6 },
                  pressed && !b && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                ]}
              >
                <View style={[styles.slotIconWrap, { backgroundColor: `${cfg.fg}22` }]}>
                  <Ionicons name={cfg.icon} size={18} color={cfg.fg} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.slotTime, { color: cfg.fg }]}>{slot}</Text>
                  <Text style={[styles.slotLabel, { color: cfg.fg }]}>
                    {cfg.label(b ? nameOf(b.userId) : undefined)}
                  </Text>
                </View>
                {!b && <Ionicons name="chevron-forward" size={16} color={cfg.fg} />}
                {mine && (
                  <View style={styles.mineBadge}>
                    <Text style={styles.mineBadgeText}>Của bạn</Text>
                  </View>
                )}
              </Pressable>
            );
          })}

          {/* Race Simulation */}
          <Pressable
            id="race-simulation-btn"
            style={({ pressed }) => [styles.demoBtn, pressed && { opacity: 0.85 }]}
            onPress={simulateRace}
            disabled={racing}
          >
            {racing ? (
              <ActivityIndicator color={colors.onPrimary} size="small" />
            ) : (
              <>
                <View style={styles.demoIcon}>
                  <Ionicons name="flash" size={14} color={colors.onPrimary} />
                </View>
                <Text style={styles.demoText}>Giả lập 2 người cùng đặt</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  // Hero
  hero: { height: 260, position: 'relative' },
  heroImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(10,10,20,0.65)',
  },
  heroContent: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: spacing.lg, paddingBottom: spacing.xl,
  },
  roomEmojiWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.sm, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  roomEmoji: { fontSize: 22 },
  roomName: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: spacing.sm },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  heroMetaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.pill,
  },
  heroMetaText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  heroMetaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)' },
  liveDot: { width: 6, height: 6, borderRadius: 3 },

  // Body
  body: { padding: spacing.lg },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.md,
  },
  sectionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  sectionTitle: { ...typography.label, color: colors.textMuted, flex: 1 },
  sectionSub: { ...typography.micro, color: colors.textSecondary },

  // Date chips
  chipsRow: { gap: spacing.sm },
  dateChip: {
    paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', minWidth: 58,
  },
  dateChipActive: { backgroundColor: colors.primary, borderColor: colors.primary, ...shadow.glow },
  todayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.primary, marginBottom: 4 },
  dateChipDay: {
    fontSize: 10, fontWeight: '700', color: colors.textMuted,
    letterSpacing: 0.5, textAlign: 'center', lineHeight: 13,
  },
  dateChipNum: { fontSize: 20, fontWeight: '900', color: colors.textPrimary, marginTop: 2, lineHeight: 24 },
  dateChipMonth: { fontSize: 10, fontWeight: '600', color: colors.textMuted, marginTop: 1 },
  dateTextActive: { color: colors.onPrimary },
  dateTextActiveLight: { color: 'rgba(255,255,255,0.7)' },

  // Slots
  slot: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, borderRadius: radius.md,
    marginBottom: spacing.sm, borderWidth: 1,
  },
  slotIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  slotTime: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
  slotLabel: { fontSize: 12, fontWeight: '500' },
  mineBadge: {
    backgroundColor: colors.info, paddingVertical: 3, paddingHorizontal: 8,
    borderRadius: radius.pill,
  },
  mineBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  // Demo button
  demoBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginTop: spacing.xl,
    backgroundColor: colors.bgElevated,
    padding: 14, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    ...shadow.card,
  },
  demoIcon: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  demoText: { color: colors.textSecondary, fontWeight: '700', fontSize: 14 },
});