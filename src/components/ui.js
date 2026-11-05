import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius } from '../theme';

export function Screen({ children, scroll = true, style, contentStyle }) {
  const body = scroll ? (
    <ScrollView contentContainerStyle={[styles.content, contentStyle]} keyboardShouldPersistTaps="handled">{children}</ScrollView>
  ) : (
    <View style={[styles.content, { flex: 1 }, contentStyle]}>{children}</View>
  );
  return <SafeAreaView style={[styles.screen, style]} edges={['top', 'left', 'right']}>{body}</SafeAreaView>;
}

export const Title = ({ children, style }) => <Text style={[styles.title, style]}>{children}</Text>;
export const Body = ({ children, style }) => <Text style={[styles.body, style]}>{children}</Text>;
export const Muted = ({ children, style }) => <Text style={[styles.muted, style]}>{children}</Text>;

export function BackHeader({ title, onBack }) {
  return (
    <View style={styles.backRow}>
      <TouchableOpacity onPress={onBack} hitSlop={10}><Text style={styles.back}>‹ Back</Text></TouchableOpacity>
      {title ? <Text style={styles.headerTitle}>{title}</Text> : null}
    </View>
  );
}

export function Card({ children, style, tint }) {
  return <View style={[styles.card, tint && { backgroundColor: tint }, style]}>{children}</View>;
}

export function Button({ title, onPress, kind = 'primary', disabled, loading, style }) {
  const bg = kind === 'primary' ? colors.primary : kind === 'danger' ? colors.danger : kind === 'secondary' ? colors.pale : 'transparent';
  const fg = kind === 'primary' || kind === 'danger' ? colors.white : colors.dark;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.btn, { backgroundColor: bg, opacity: disabled ? 0.5 : 1 }, style]}
    >
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.btnText, { color: fg }]}>{title}</Text>}
    </TouchableOpacity>
  );
}

export function Field({ label, style, ...props }) {
  return (
    <View style={{ marginBottom: 12 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput placeholderTextColor={colors.gray} style={[styles.input, props.editable === false && { opacity: 0.6 }, style]} {...props} />
    </View>
  );
}

export function ProgressBar({ value }) {
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${Math.max(0, Math.min(1, value)) * 100}%` }]} />
    </View>
  );
}

export function ErrorText({ children }) {
  return children ? <Text style={styles.error}>{children}</Text> : null;
}

export function ModalSheet({ visible, onClose, title, children }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {title ? <Text style={styles.sheetTitle}>{title}</Text> : null}
          {children}
        </View>
      </View>
    </Modal>
  );
}

export function OfflineBanner({ online, pending }) {
  if (online && !pending) return null;
  return (
    <View style={styles.banner}>
      <Text style={styles.bannerText}>
        {online ? `Syncing ${pending} session${pending === 1 ? '' : 's'}…` : `Offline — ${pending ? pending + ' session(s) will sync later' : 'your data is saved on this phone'}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '700', color: colors.dark, marginBottom: 6 },
  body: { fontSize: 15, color: colors.text },
  muted: { fontSize: 13, color: colors.gray },
  backRow: { marginBottom: 14 },
  back: { color: colors.primary, fontSize: 15, marginBottom: 6 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.dark },
  card: { backgroundColor: colors.white, borderRadius: radius.card, padding: 16, marginBottom: 12 },
  btn: { borderRadius: radius.button, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  btnText: { fontSize: 16, fontWeight: '600' },
  label: { fontSize: 13, color: colors.gray, marginBottom: 4 },
  input: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.lavender, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.text },
  barTrack: { height: 10, backgroundColor: colors.pale, borderRadius: 6, overflow: 'hidden', marginTop: 8 },
  barFill: { height: 10, backgroundColor: colors.primary, borderRadius: 6 },
  error: { color: colors.danger, fontSize: 13, marginVertical: 6 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 24 },
  sheet: { backgroundColor: colors.white, borderRadius: 18, padding: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.dark, marginBottom: 12 },
  banner: { backgroundColor: colors.petalButter, borderRadius: 12, padding: 10, marginBottom: 12 },
  bannerText: { color: colors.text, fontSize: 13, textAlign: 'center' },
});
