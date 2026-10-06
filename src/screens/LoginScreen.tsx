import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppStore } from '../store';
import {
  useGoogleAuth,
  fetchGoogleProfile,
  IS_GOOGLE_CONFIGURED,
  showGoogleSetupAlert,
} from '../auth/google';
import { RootStackParamList } from '../types';
import { colors, radius, shadow, spacing, typography } from '../theme';

export default function LoginScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const login = useAppStore((s) => s.login);
  const [request, response, promptAsync] = useGoogleAuth();
  const [loading, setLoading] = React.useState(false);
  const [googleError, setGoogleError] = React.useState<string | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoScale, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 2400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (!response) return;

    if (response.type === 'success') {
      const accessToken = response.authentication?.accessToken;
      if (!accessToken) return;
      setLoading(true);
      setGoogleError(null);
      fetchGoogleProfile(accessToken)
        .then((profile) => {
          login({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            avatar: profile.picture,
            provider: 'google',
          });
          nav.replace('Tabs');
        })
        .catch((err) => {
          setGoogleError('Không thể lấy thông tin tài khoản Google.');
          Alert.alert('Lỗi đăng nhập', 'Không thể lấy thông tin từ Google. Vui lòng thử lại.');
        })
        .finally(() => setLoading(false));
    } else if (response.type === 'error') {
      const msg = response.error?.message ?? 'Đã xảy ra lỗi';
      setGoogleError(msg);
      Alert.alert('Lỗi Google OAuth', msg);
    }
  }, [response]);

  const handleGooglePress = () => {
    if (!IS_GOOGLE_CONFIGURED) {
      showGoogleSetupAlert();
      return;
    }
    if (request) promptAsync();
  };

  const loginAsGuest = (name: string, id: string) => {
    login({ id, name, provider: 'guest' });
    nav.replace('Tabs');
  };

  return (
    <View style={styles.root}>
      {/* Background blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />
      <View style={styles.blob3} />

      <SafeAreaView style={styles.safe}>
        {/* Hero */}
        <View style={styles.hero}>
          <Animated.View style={[styles.glowRing, { transform: [{ scale: pulseAnim }] }]} />
          <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoScale }] }]}>
            <Ionicons name="library" size={40} color={colors.primary} />
          </Animated.View>

          <Animated.View
            style={[styles.titleBlock, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            <Text style={styles.appName}>StudyRoom</Text>
            <Text style={styles.tagline}>Đặt phòng học & lab campus{'\n'}dễ dàng, nhanh chóng</Text>
          </Animated.View>

          <Animated.View style={[styles.pillsRow, { opacity: fadeAnim }]}>
            <FeaturePill icon="flash" label="Tức thì" />
            <FeaturePill icon="shield-checkmark" label="An toàn" />
            <FeaturePill icon="notifications" label="Nhắc nhở" />
          </Animated.View>
        </View>

        {/* Auth Card */}
        <Animated.View
          style={[styles.authCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <Text style={styles.cardTitle}>Chào mừng trở lại 👋</Text>
          <Text style={styles.cardSub}>Đăng nhập để đặt phòng học</Text>

          {/* Google Button */}
          <Pressable
            id="google-login-btn"
            style={({ pressed }) => [
              styles.googleBtn,
              pressed && { opacity: 0.82, transform: [{ scale: 0.98 }] },
              !IS_GOOGLE_CONFIGURED && styles.googleBtnDisabled,
            ]}
            onPress={handleGooglePress}
          >
            {loading ? (
              <ActivityIndicator color={colors.textPrimary} size="small" />
            ) : (
              <>
                {/* Google G icon */}
                <View style={styles.googleIconCircle}>
                  <Ionicons name="logo-google" size={17} color={colors.googleRed} />
                </View>
                <Text style={styles.googleBtnText}>Đăng nhập với Google</Text>
                {!IS_GOOGLE_CONFIGURED && (
                  <View style={styles.setupBadge}>
                    <Text style={styles.setupBadgeText}>Cần cấu hình</Text>
                  </View>
                )}
              </>
            )}
          </Pressable>

          {/* Info banner khi chưa cấu hình */}
          {!IS_GOOGLE_CONFIGURED && (
            <Pressable style={styles.infoBanner} onPress={showGoogleSetupAlert}>
              <Ionicons name="information-circle" size={15} color={colors.warning} />
              <Text style={styles.infoBannerText}>
                Google OAuth chưa được cấu hình. Nhấn để xem hướng dẫn.
              </Text>
            </Pressable>
          )}

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>hoặc tiếp tục với demo</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Guest Buttons */}
          <View style={styles.guestRow}>
            <GuestButton
              id="guest-nam-btn"
              initial="N"
              name="Nam"
              role="Demo A"
              color={colors.primary}
              onPress={() => loginAsGuest('Nam (Demo A)', 'u1')}
            />
            <GuestButton
              id="guest-lan-btn"
              initial="L"
              name="Lan"
              role="Demo B"
              color={colors.accent}
              onPress={() => loginAsGuest('Lan (Demo B)', 'u2')}
            />
          </View>

          <Text style={styles.terms}>
            Bằng cách đăng nhập, bạn đồng ý với{' '}
            <Text style={{ color: colors.primary }}>Điều khoản sử dụng</Text>
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

function FeaturePill({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.pill}>
      <Ionicons name={icon} size={12} color={colors.primaryLight} />
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

function GuestButton({
  id, initial, name, role, color, onPress,
}: {
  id: string; initial: string; name: string; role: string; color: string; onPress: () => void;
}) {
  return (
    <Pressable
      id={id}
      style={({ pressed }) => [
        styles.guestBtn,
        pressed && { opacity: 0.78, transform: [{ scale: 0.97 }] },
      ]}
      onPress={onPress}
    >
      <View style={[styles.guestAvatar, { backgroundColor: `${color}20`, borderColor: `${color}40` }]}>
        <Text style={[styles.guestAvatarText, { color }]}>{initial}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.guestName}>{name}</Text>
        <Text style={styles.guestRole}>{role}</Text>
      </View>
      <View style={[styles.guestArrow, { backgroundColor: `${color}18` }]}>
        <Ionicons name="arrow-forward" size={13} color={color} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },

  // Background blobs
  blob1: {
    position: 'absolute', top: -80, left: -80,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(99,102,241,0.14)',
  },
  blob2: {
    position: 'absolute', top: 120, right: -100,
    width: 250, height: 250, borderRadius: 125,
    backgroundColor: 'rgba(244,114,182,0.09)',
  },
  blob3: {
    position: 'absolute', bottom: 220, left: -60,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(99,102,241,0.07)',
  },

  // Hero
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  glowRing: {
    position: 'absolute',
    width: 136, height: 136, borderRadius: 68,
    backgroundColor: 'rgba(99,102,241,0.10)',
    borderWidth: 1, borderColor: 'rgba(99,102,241,0.22)',
  },
  logoWrap: {
    width: 88, height: 88, borderRadius: 28,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1, borderColor: colors.glassBorderLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.xl,
    ...shadow.glow,
  },
  titleBlock: { alignItems: 'center' },
  appName: {
    fontSize: 36, fontWeight: '900', color: colors.textPrimary,
    letterSpacing: -1, textAlign: 'center',
  },
  tagline: {
    fontSize: 14, color: colors.textSecondary, textAlign: 'center',
    marginTop: spacing.sm, lineHeight: 22,
  },
  pillsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 6, paddingHorizontal: 12,
    backgroundColor: colors.primaryGlow,
    borderRadius: radius.pill,
    borderWidth: 1, borderColor: 'rgba(99,102,241,0.25)',
  },
  pillText: { fontSize: 12, fontWeight: '600', color: colors.primaryLight },

  // Auth Card
  authCard: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.xl,
    paddingBottom: 44,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.glassBorder,
    ...shadow.floating,
  },
  cardTitle: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  cardSub: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xl },

  // Google button
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    backgroundColor: colors.surfaceHigh,
    paddingVertical: 15, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.glassBorderLight,
    ...shadow.card,
  },
  googleBtnDisabled: {
    borderColor: colors.border,
    opacity: 0.75,
  },
  googleIconCircle: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: 'rgba(234,67,53,0.10)',
    borderWidth: 1, borderColor: 'rgba(234,67,53,0.20)',
    alignItems: 'center', justifyContent: 'center',
  },
  googleBtnText: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  setupBadge: {
    backgroundColor: colors.warningBg,
    borderRadius: radius.pill,
    paddingVertical: 2, paddingHorizontal: 8,
    borderWidth: 1, borderColor: 'rgba(251,146,60,0.3)',
  },
  setupBadgeText: { fontSize: 10, fontWeight: '700', color: colors.warning },

  // Info banner
  infoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: spacing.sm,
    backgroundColor: colors.warningBg,
    borderRadius: radius.md, padding: spacing.sm,
    borderWidth: 1, borderColor: 'rgba(251,146,60,0.2)',
  },
  infoBannerText: { flex: 1, fontSize: 12, color: colors.warning, fontWeight: '500', lineHeight: 17 },

  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: 11, fontWeight: '600', color: colors.textMuted, marginHorizontal: 10, letterSpacing: 0.3 },

  // Guest buttons
  guestRow: { gap: spacing.sm },
  guestBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface,
    paddingVertical: 12, paddingHorizontal: spacing.md,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
  },
  guestAvatar: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  guestAvatarText: { fontSize: 16, fontWeight: '800' },
  guestName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  guestRole: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  guestArrow: {
    width: 30, height: 30, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },

  terms: {
    fontSize: 11, fontWeight: '500', color: colors.textMuted,
    textAlign: 'center', marginTop: spacing.xl, lineHeight: 17,
  },
});