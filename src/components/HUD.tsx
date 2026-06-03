import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { useGameStore } from '../game/store';

function formatCoins(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Math.floor(n).toString();
}

export function HUD() {
  const coins = useGameStore(s => s.coins);
  const gems = useGameStore(s => s.gems);
  const totalCPS = useGameStore(s => s.totalCPS);
  const restaurantRating = useGameStore(s => s.restaurantRating);
  const insets = useSafeAreaInsets();

  const cps = totalCPS();
  const rating = restaurantRating();
  const filledStars = Math.floor(rating);
  const stars = '★'.repeat(filledStars) + '☆'.repeat(5 - filledStars);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.left}>
        <Text style={styles.coins}>🪙 {formatCoins(coins)}</Text>
        <Text style={styles.cps}>+{cps.toFixed(1)}/s</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.gems}>💎 {gems}</Text>
        <Text style={styles.rating}>{stars}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary + '44',
  },
  left: { gap: 2 },
  right: { alignItems: 'flex-end', gap: 2 },
  coins: { fontSize: 22, fontWeight: 'bold', color: COLORS.coin },
  cps: { fontSize: 12, color: COLORS.textMuted },
  gems: { fontSize: 16, color: COLORS.gem },
  rating: { fontSize: 14, color: COLORS.primary, letterSpacing: 2 },
});
