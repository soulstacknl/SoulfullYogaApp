// Building blocks for the laptop admin portal (web only, see app/portal/_layout.tsx).
// Layout uses React Native views; form controls are plain DOM elements so the
// browser's own select, date and search inputs can be used.
import type { CSSProperties, ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { colors, fonts, styleMeta } from '@/constants/theme';
import type { ClassStyle } from '@/constants/theme';
import type { Occupancy } from '@/lib/schedule';
import { cardValidity } from '@/data/users';

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <View style={s.ph}>
      <View style={{ flexShrink: 1 }}>
        <Text style={s.h1}>{title}</Text>
        {subtitle ? <Text style={s.muted}>{subtitle}</Text> : null}
      </View>
      {children ? <View style={s.row}>{children}</View> : null}
    </View>
  );
}

export function Card({ title, note, children, style }: { title?: string; note?: string; children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[s.card, style]}>
      {title ? (
        <View style={s.cardHead}>
          <Text style={s.h2}>{title}</Text>
          {note ? <Text style={s.small}>{note}</Text> : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

type BtnTone = 'default' | 'primary' | 'teal' | 'ink' | 'ghost';
export function Btn({ label, onPress, tone = 'default', small, disabled }: { label: string; onPress?: () => void; tone?: BtnTone; small?: boolean; disabled?: boolean }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ hovered }: { hovered?: boolean }) => [s.btn, small && s.btnSm, btnTones[tone].box, hovered && !disabled && tone === 'default' && { borderColor: colors.ink }, disabled && { opacity: 0.45 }]}>
      <Text style={[s.btnText, small && { fontSize: 12.5 }, { color: btnTones[tone].color }]}>{label}</Text>
    </Pressable>
  );
}
const btnTones: Record<BtnTone, { box: ViewStyle; color: string }> = {
  default: { box: {}, color: colors.ink },
  primary: { box: { backgroundColor: colors.rani, borderColor: colors.rani }, color: '#fff' },
  teal: { box: { backgroundColor: colors.teal, borderColor: colors.teal }, color: '#fff' },
  ink: { box: { backgroundColor: colors.ink, borderColor: colors.ink }, color: '#fff' },
  ghost: { box: { backgroundColor: 'transparent', borderColor: colors.rani }, color: colors.rani },
};

export function IconBtn({ label, onPress, danger, active, title }: { label: string; onPress: () => void; danger?: boolean; active?: boolean; title?: string }) {
  return (
    <Pressable onPress={onPress} accessibilityLabel={title} style={[s.iconBtn, active && { backgroundColor: colors.teal, borderColor: colors.teal }]}>
      <Text style={[s.btnText, { color: active ? '#fff' : danger ? colors.rani : colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

export type TagTone = 'teal' | 'ink' | 'pending' | 'muted' | 'rani';
const tagTones: Record<TagTone, { backgroundColor: string; color: string }> = {
  teal: { backgroundColor: '#EAF3EE', color: colors.teal },
  ink: { backgroundColor: '#E9EEDF', color: colors.ink },
  pending: { backgroundColor: '#FCF1DE', color: '#9A6512' },
  muted: { backgroundColor: '#EFE8DC', color: colors.mutedText },
  rani: { backgroundColor: '#FBE7EE', color: colors.rani },
};
export function Pill({ label, tone }: { label: string; tone: TagTone }) {
  return <Text style={[s.tag, tagTones[tone]]}>{label}</Text>;
}

// "geldig t/m 8 maart 2027" or "Vervallen": strip cards last 4 months after the last +.
export function ValidityPill({ validUntil, today }: { validUntil: string | null; today: string }) {
  const v = cardValidity(validUntil, today);
  if (!v) return null;
  return v.expired ? <Pill label={`Vervallen · t/m ${v.date}`} tone="rani" /> : <Pill label={`geldig t/m ${v.date}`} tone="teal" />;
}

export function StyleDot({ style }: { style: ClassStyle }) {
  return (
    <View style={[s.dot, { backgroundColor: styleMeta[style].color }]}>
      <Text style={s.dotText}>{styleMeta[style].dotLabel}</Text>
    </View>
  );
}

// Occupancy bar; the count is always shown as text too (not colour alone).
// Track is a light step of the fill colour: teal, marigold from 80%, rani when full.
export function Meter({ occupancy }: { occupancy: Occupancy }) {
  const { booked, capacity } = occupancy;
  const full = booked >= capacity;
  const pct = capacity ? Math.min(100, Math.round((100 * booked) / capacity)) : 100;
  const [track, fill] = full ? ['#F5D6E1', colors.rani] : pct >= 80 ? ['#F8E7C8', colors.marigold] : ['#DCEBE6', colors.teal];
  return (
    <View style={s.meter} accessibilityLabel={`${booked} van ${capacity} plekken bezet`}>
      <View style={[s.track, { backgroundColor: track }]}>
        <View style={[s.fill, { width: `${pct}%`, backgroundColor: fill }]} />
      </View>
      <Text style={s.meterNum}>{full ? 'Vol' : `${booked}/${capacity}`}</Text>
    </View>
  );
}

export function Row({ children, onPress, dim }: { children: ReactNode; onPress?: () => void; dim?: boolean }) {
  const style = ({ hovered }: { hovered?: boolean }) => [s.listRow, dim && { opacity: 0.6 }, hovered && onPress && { backgroundColor: '#FBF7EF' }];
  return onPress ? <Pressable onPress={onPress} style={style}>{children}</Pressable> : <View style={style({})}>{children}</View>;
}

export function Meta({ title, detail }: { title: string; detail?: string }) {
  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      <Text style={s.nm}>{title}</Text>
      {detail ? <Text style={s.dt}>{detail}</Text> : null}
    </View>
  );
}

export function KV({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={s.kv}>
      <Text style={s.body}>{label}</Text>
      {typeof children === 'string' || typeof children === 'number' ? <Text style={s.nm}>{children}</Text> : children}
    </View>
  );
}

export function Empty({ text }: { text: string }) {
  return <Text style={s.empty}>{text}</Text>;
}

export function Note({ text, style }: { text: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={style}>
      <Text style={s.note}>{text}</Text>
    </View>
  );
}

export function Preview({ text, tone = 'pending' }: { text: string; tone?: 'pending' | 'teal' }) {
  return <Text style={[s.preview, tone === 'teal' && { backgroundColor: '#EAF3EE', color: colors.teal }]}>{text}</Text>;
}

export function ErrorText({ text }: { text: string | null }) {
  return text ? <Text style={s.err}>{text}</Text> : null;
}

// Segmented control, e.g. Groepsles / Extra les / Vakantie.
export function Segmented<T extends string>({ options, value, onChange }: { options: [T, string][]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={s.seg}>
      {options.map(([v, label]) => (
        <Pressable key={v} onPress={() => onChange(v)} style={[s.segItem, v === value && s.segOn]}>
          <Text style={[s.segText, v === value && { color: colors.ink }]}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, active && { backgroundColor: colors.ink, borderColor: colors.ink }]}>
      <Text style={[s.btnText, { fontSize: 12.5, color: active ? colors.ivory : colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

/* ── Form controls (DOM) ─────────────────────────────────────────────── */

const inputStyle: CSSProperties = {
  border: `1px solid ${colors.sand}`,
  borderRadius: 10,
  padding: '8px 10px',
  background: '#fff',
  fontFamily: fonts.body,
  fontSize: 13.5,
  color: colors.ink,
  minWidth: 0,
};

export function Field({ label, children, style }: { label: string; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ gap: 5, flexGrow: 1, flexBasis: 200 }, style]}>
      <Text style={s.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

export function Select({ value, options, onChange, highlight, style }: { value: string; options: [string, string][]; onChange: (v: string) => void; highlight?: boolean; style?: CSSProperties }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle, ...(highlight ? { borderColor: colors.ink, background: '#E9EEDF', fontFamily: fonts.bodySemiBold } : null), ...style }}>
      {options.map(([v, label]) => (
        <option key={v} value={v}>
          {label}
        </option>
      ))}
    </select>
  );
}

export function Input({ value, onChange, type = 'text', placeholder, min, style, onEnter }: { value: string; onChange: (v: string) => void; type?: 'text' | 'date' | 'time' | 'number' | 'search' | 'email' | 'password'; placeholder?: string; min?: string; style?: CSSProperties; onEnter?: () => void }) {
  return (
    <input
      type={type}
      value={value}
      min={min}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onEnter ? (e) => e.key === 'Enter' && onEnter() : undefined}
      style={{ ...inputStyle, ...style }}
    />
  );
}

/* ── Overlays ────────────────────────────────────────────────────────── */

// Side panel sliding in from the right, with a dark header.
export function Drawer({ eyebrow, title, subtitle, onClose, children }: { eyebrow: string; title: string; subtitle: string; onClose: () => void; children: ReactNode }) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.scrimWrap}>
        <Pressable style={s.scrim} onPress={onClose} accessibilityLabel="Sluiten" />
        <View style={s.drawer}>
          <View style={s.drawerHead}>
            <Pressable onPress={onClose} style={s.drawerX} accessibilityLabel="Sluiten">
              <Text style={{ color: '#fff', fontSize: 20 }}>✕</Text>
            </Pressable>
            <Text style={s.eyebrow}>{eyebrow}</Text>
            <Text style={s.drawerTitle}>{title}</Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 13, color: '#CFE0D4' }}>{subtitle}</Text>
          </View>
          <View style={{ flex: 1, overflow: 'scroll' as 'hidden' }}>
            <View style={s.drawerBody}>{children}</View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export const portalStyles = StyleSheet.create({
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, alignItems: 'flex-start' },
  col: { flexGrow: 1, flexBasis: 420, minWidth: 0, gap: 18 },
  form: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 },
  full: { flexBasis: '100%' },
});

export const s = StyleSheet.create({
  ph: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 22 },
  h1: { fontFamily: fonts.display, fontSize: 28, color: colors.ink },
  h2: { fontFamily: fonts.displayItalic, fontSize: 16, color: colors.rani },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  body: { fontFamily: fonts.body, fontSize: 14, color: colors.ink },
  muted: { fontFamily: fonts.body, fontSize: 14, color: colors.mutedText, marginTop: 2 },
  small: { fontFamily: fonts.body, fontSize: 12.5, color: colors.mutedText },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.sand, borderRadius: 16, paddingVertical: 18, paddingHorizontal: 20 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 12 },
  btn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.sand, backgroundColor: colors.card, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14 },
  btnSm: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8 },
  btnText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.ink },
  iconBtn: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: colors.sand, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  tag: { alignSelf: 'center', fontFamily: fonts.bodySemiBold, fontSize: 11.5, borderRadius: 20, overflow: 'hidden', paddingVertical: 2, paddingHorizontal: 9 },
  dot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  dotText: { fontFamily: fonts.bodyBold, fontSize: 9.5, color: '#fff' },
  meter: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  track: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden', minWidth: 40 },
  fill: { height: '100%', borderRadius: 4 },
  meterNum: { fontFamily: fonts.bodySemiBold, fontSize: 12.5, color: colors.ink, minWidth: 40, textAlign: 'right' },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, borderTopWidth: 1, borderTopColor: '#F1EADC' },
  nm: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.ink },
  dt: { fontFamily: fonts.body, fontSize: 12.5, color: colors.mutedText, marginTop: 1 },
  kv: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, gap: 12 },
  empty: { fontFamily: fonts.body, fontSize: 14, color: colors.mutedText, paddingVertical: 18, textAlign: 'center' },
  note: { fontFamily: fonts.body, fontSize: 12.5, color: colors.mutedText, lineHeight: 19 },
  preview: { backgroundColor: '#FCF1DE', color: '#6B4A0C', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, fontFamily: fonts.body, fontSize: 13, lineHeight: 19, overflow: 'hidden' },
  err: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.rani },
  seg: { flexDirection: 'row', flexWrap: 'wrap', alignSelf: 'flex-start', backgroundColor: '#EFE6D6', borderRadius: 10, padding: 3, marginBottom: 14 },
  segItem: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  segOn: { backgroundColor: '#fff', shadowColor: '#12261A', shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  segText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.mutedText },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: colors.sand, backgroundColor: '#fff' },
  fieldLabel: { fontFamily: fonts.bodySemiBold, fontSize: 12.5, color: colors.ink },
  scrimWrap: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end' },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(18,38,26,0.35)' },
  drawer: { width: 480, maxWidth: '100%', height: '100%', backgroundColor: colors.ivory, shadowColor: '#10241A', shadowOpacity: 0.18, shadowRadius: 40, shadowOffset: { width: -12, height: 0 } },
  drawerHead: { backgroundColor: colors.ink, paddingTop: 22, paddingBottom: 18, paddingHorizontal: 24 },
  drawerX: { position: 'absolute', top: 14, right: 18, zIndex: 1, padding: 4 },
  eyebrow: { fontFamily: fonts.bodySemiBold, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: colors.marigold },
  drawerTitle: { fontFamily: fonts.display, fontSize: 24, color: colors.ivory, marginTop: 4, marginBottom: 2 },
  drawerBody: { paddingTop: 20, paddingHorizontal: 24, paddingBottom: 40, gap: 16 },
});
