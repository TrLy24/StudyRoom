import React from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppStore } from '../store';
import { useBookings } from '../api/queries';
import { RootStackParamList } from '../types';
import { colors, radius, shadow, spacing, typography } from '../theme';

export default function ProfileScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const currentUser = useAppStore((s) => s.currentUser);
  const logout = useAppStore((s) => s.logout);
  const { data: bookings = [] } = useBookings();

  const myBookings = bookings.filter((b) => b.userId === currentUser?.id);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = myBookings.filter((b) => b.date >= today).length;

  const showAllBookings = () => {
    if (bookings.length === 0) return Alert.alert('Database trống', 'Chưa có booking nào.');
    const text = bookings.map((b) => `${b.roomId} • ${b.date} ${b.slot} • user:${b.userId}`).join('\n');
    Alert.alert(`Tất cả bookings (${bookings.length})`, text);
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất?', 'Bạn có chắc muốn đăng xuất không?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => { logout(); nav.replace('Login'); },
      },
    ]);
  };

  if (!currentUser) return null;

  const initials = currentUser.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Hồ sơ</Text>
        </View>

        {/* Profile Hero Card */}
        <View style={styles.heroCard}>
          {/* Background decoration */}
          <View style={styles.cardBg} />

          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {currentUser.avatar ? (
              <Image source={{ uri: currentUser.avatar }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            {currentUser.provider === 'google' && (
              <View style={styles.providerIcon}>
                <Ionicons name="logo-google" size={12} color={colors.onPrimary} />
              </View>
            )}
          </View>

          <Text style={styles.userName}>{currentUser.name}</Text>
          {currentUser.email && <Text style={styles.userEmail}>{currentUser.email}</Text>}

          {/* Provider badge */}
          <View style={[
            styles.providerBadge,
            currentUser.provider === 'google' ? styles.providerGoogle : styles.providerGuest,
          ]}>
            <Ionicons
              name={currentUser.provider === 'google' ? 'logo-google' : 'person-circle-outline'}
              size={11}
              color={currentUser.provider === 'google' ? colors.googleRed : colors.textMuted}
            />
            <Text style={[
              styles.providerBadgeText,
              { color: currentUser.provider === 'google' ? colors.textSecondary : colors.textMuted },
            ]}>
              {currentUser.provider === 'google' ? 'Google Account' : 'Tài khoản Demo'}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{myBookings.length}</Text>
              <Text style={styles.statLabel}>Tổng đặt</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.success }]}>{upcoming}</Text>
              <Text style={styles.statLabel}>Sắp tới</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {myBookings.length - upcoming}
              </Text>
              <Text style={styles.statLabel}>Đã dùng</Text>
            </View>
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CÀI ĐẶT & TÙY CHỌN</Text>

          <View style={styles.menuCard}>
            <MenuItem
              id="menu-notifications"
              icon="notifications-outline"
              label="Thông báo"
              value="Bật"
              color={colors.primary}
              onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              id="menu-language"
              icon="language-outline"
              label="Ngôn ngữ"
              value="Tiếng Việt"
              color={colors.info}
              onPress={() => Alert.alert('Ngôn ngữ', 'Tính năng đang phát triển')}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              id="menu-theme"
              icon="moon-outline"
              label="Giao diện"
              value="Tối"
              color={colors.accent}
              onPress={() => Alert.alert('Giao diện', 'Tính năng đang phát triển')}
            />
          </View>
        </View>

        {/* Developer Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DEVELOPER</Text>
          <Pressable
            id="debug-db-btn"
            style={({ pressed }) => [styles.debugBtn, pressed && { opacity: 0.7 }]}
            onPress={showAllBookings}
          >
            <View style={styles.debugIconWrap}>
              <Ionicons name="server-outline" size={16} color={colors.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.debugTitle}>Xem toàn bộ Database</Text>
              <Text style={styles.debugSub}>SQLite local storage</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{bookings.length}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </Pressable>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <Pressable
            id="logout-btn"
            style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.8 }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.danger} />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </Pressable>
        </View>

        <Text style={styles.version}>StudyRoom v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({
  id, icon, label, value, color, onPress,
}: {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      id={id}
      style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
      onPress={onPress}
    >
      <View style={[styles.menuIconWrap, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuValue}>{value}</Text>
      <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, marginBottom: spacing.lg },
  title: { ...typography.h1, color: colors.textPrimary },

  // Hero Card
  heroCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1, borderColor: colors.glassBorderLight,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    ...shadow.card,
  },
  cardBg: {
    position: 'absolute', top: -40, right: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: colors.primaryGlow,
  },

  // Avatar
  avatarContainer: { position: 'relative', marginBottom: spacing.md },
  avatarImg: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: colors.primary },
  avatarFallback: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primaryGlow,
    borderWidth: 2, borderColor: 'rgba(99,102,241,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: { fontSize: 28, fontWeight: '800', color: colors.primary },
  providerIcon: {
    position: 'absolute', bottom: 2, right: 2,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.googleRed,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.bgCard,
  },

  userName: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 2 },
  userEmail: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm },

  providerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 5, paddingHorizontal: 12, borderRadius: radius.pill,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  providerGoogle: { backgroundColor: 'rgba(234,67,53,0.08)', borderColor: 'rgba(234,67,53,0.2)' },
  providerGuest: { backgroundColor: colors.glass, borderColor: colors.border },
  providerBadgeText: { fontSize: 11, fontWeight: '600' },

  // Stats
  statsRow: {
    flexDirection: 'row', width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  statValue: { fontSize: 22, fontWeight: '900', color: colors.textPrimary },
  statLabel: { ...typography.micro, color: colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.border, marginVertical: spacing.sm },

  // Section
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionLabel: { ...typography.label, color: colors.textMuted, marginBottom: spacing.sm },

  // Menu
  menuCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md,
  },
  menuIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  menuValue: { ...typography.caption, color: colors.textMuted },
  menuDivider: { height: 1, backgroundColor: colors.border, marginLeft: 58 },

  // Debug
  debugBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.bgCard,
    padding: spacing.md, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    ...shadow.card,
  },
  debugIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.warningBg,
    alignItems: 'center', justifyContent: 'center',
  },
  debugTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  debugSub: { ...typography.micro, color: colors.textMuted, marginTop: 1 },
  countBadge: {
    backgroundColor: colors.bgElevated,
    paddingVertical: 3, paddingHorizontal: 8,
    borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border,
    marginRight: 4,
  },
  countText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },

  // Logout
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.dangerBg,
    padding: 14, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.dangerBorder,
  },
  logoutText: { color: colors.danger, fontWeight: '700', fontSize: 15 },

  version: { ...typography.micro, color: colors.textMuted, textAlign: 'center' },
});