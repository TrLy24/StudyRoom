import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BUILDINGS } from '../data';
import { colors, radius, shadow, spacing, typography } from '../theme';

export type Filters = { building: string; minSeats: number; onlyFree: boolean };

type Props = {
  visible: boolean;
  filters: Filters;
  onApply: (f: Filters) => void;
  onClose: () => void;
};

const SEAT_OPTIONS = [
  { value: 0, label: 'Mọi cỡ' },
  { value: 10, label: '≥ 10' },
  { value: 30, label: '≥ 30' },
  { value: 50, label: '≥ 50' },
];

export default function FilterModal({ visible, filters, onApply, onClose }: Props) {
  const [draft, setDraft] = React.useState<Filters>(filters);

  React.useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible, filters]);

  const reset = () => setDraft({ building: 'all', minSeats: 0, onlyFree: false });
  const activeCount =
    (draft.building !== 'all' ? 1 : 0) +
    (draft.minSeats > 0 ? 1 : 0) +
    (draft.onlyFree ? 1 : 0);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* Sheet */}
      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Bộ lọc</Text>
            {activeCount > 0 && (
              <Text style={styles.activeCountText}>{activeCount} bộ lọc đang bật</Text>
            )}
          </View>
          <Pressable
            id="filter-reset-btn"
            onPress={reset}
            hitSlop={8}
            style={styles.resetBtn}
          >
            <Ionicons name="refresh" size={14} color={colors.primary} />
            <Text style={styles.resetText}>Đặt lại</Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          {/* Building filter */}
          <FilterSection icon="business-outline" title="TÒA NHÀ">
            <View style={styles.chipsRow}>
              <Chip
                label="Tất cả"
                active={draft.building === 'all'}
                onPress={() => setDraft({ ...draft, building: 'all' })}
              />
              {BUILDINGS.map((b) => (
                <Chip
                  key={b} label={b}
                  active={draft.building === b}
                  onPress={() => setDraft({ ...draft, building: b })}
                />
              ))}
            </View>
          </FilterSection>

          {/* Seats filter */}
          <FilterSection icon="people-outline" title="SỐ CHỖ TỐI THIỂU">
            <View style={styles.chipsRow}>
              {SEAT_OPTIONS.map(({ value, label }) => (
                <Chip
                  key={value} label={label}
                  active={draft.minSeats === value}
                  onPress={() => setDraft({ ...draft, minSeats: value })}
                />
              ))}
            </View>
          </FilterSection>

          {/* Availability toggle */}
          <FilterSection icon="checkmark-circle-outline" title="TÌNH TRẠNG">
            <Pressable
              id="only-free-toggle"
              style={[styles.toggle, draft.onlyFree && styles.toggleActive]}
              onPress={() => setDraft({ ...draft, onlyFree: !draft.onlyFree })}
            >
              <View style={[styles.toggleIcon, { backgroundColor: draft.onlyFree ? 'rgba(34,197,94,0.2)' : colors.bgElevated }]}>
                <Ionicons name="leaf-outline" size={16} color={draft.onlyFree ? colors.success : colors.textMuted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.toggleTitle, draft.onlyFree && { color: colors.textPrimary }]}>
                  Chỉ hiện phòng còn trống
                </Text>
                <Text style={styles.toggleSub}>Ẩn phòng đã kín lịch</Text>
              </View>
              {/* Custom checkbox */}
              <View style={[styles.checkbox, draft.onlyFree && styles.checkboxActive]}>
                {draft.onlyFree && <Ionicons name="checkmark" size={12} color={colors.onPrimary} />}
              </View>
            </Pressable>
          </FilterSection>
        </ScrollView>

        {/* Apply button */}
        <Pressable
          id="filter-apply-btn"
          style={({ pressed }) => [styles.applyBtn, pressed && { opacity: 0.85 }]}
          onPress={() => onApply(draft)}
        >
          <Text style={styles.applyText}>
            Áp dụng{activeCount > 0 ? ` (${activeCount})` : ''}
          </Text>
          <Ionicons name="checkmark" size={18} color={colors.onPrimary} />
        </Pressable>
      </View>
    </Modal>
  );
}

function FilterSection({
  icon, title, children,
}: {
  icon: keyof typeof Ionicons.glyphMap; title: string; children: React.ReactNode;
}) {
  return (
    <View style={sectionStyles.wrap}>
      <View style={sectionStyles.header}>
        <Ionicons name={icon} size={14} color={colors.primary} />
        <Text style={sectionStyles.title}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  title: { ...typography.label, color: colors.textMuted },
});

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[chipStyles.chip, active && chipStyles.active]}
    >
      {active && <Ionicons name="checkmark-circle" size={12} color={colors.onPrimary} />}
      <Text style={[chipStyles.text, active && chipStyles.activeText]}>{label}</Text>
    </Pressable>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border,
  },
  active: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  activeText: { color: colors.onPrimary },
});

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl,
    padding: spacing.xl, paddingTop: spacing.md,
    maxHeight: '80%',
    borderWidth: 1, borderBottomWidth: 0, borderColor: colors.glassBorderLight,
    ...shadow.floating,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center', marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  title: { ...typography.h2, color: colors.textPrimary },
  activeCountText: { ...typography.micro, color: colors.primary, marginTop: 3 },
  resetBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 6, paddingHorizontal: 10,
    backgroundColor: colors.primaryGlow,
    borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(99,102,241,0.25)',
  },
  resetText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  scroll: { marginBottom: spacing.lg },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },

  // Toggle
  toggle: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  toggleActive: {
    borderColor: colors.success,
    backgroundColor: 'rgba(34,197,94,0.05)',
  },
  toggleIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  toggleTitle: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  toggleSub: { ...typography.micro, color: colors.textMuted, marginTop: 1 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: colors.border,
    backgroundColor: colors.bgCard,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: colors.success, borderColor: colors.success },

  // Apply
  applyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary,
    padding: 16, borderRadius: radius.lg,
    ...shadow.glow,
  },
  applyText: { color: colors.onPrimary, fontWeight: '800', fontSize: 15 },
});