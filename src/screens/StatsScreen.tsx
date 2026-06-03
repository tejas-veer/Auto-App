import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { BUILDINGS, cpsForBuilding } from '../constants/buildings';
import { useGameStore } from '../game/store';

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Math.floor(n).toString();
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardIcon}>{icon}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );
}

export function StatsScreen() {
  const coins = useGameStore(s => s.coins);
  const gems = useGameStore(s => s.gems);
  const playerLevel = useGameStore(s => s.playerLevel);
  const placedBuildings = useGameStore(s => s.placedBuildings);
  const totalCPS = useGameStore(s => s.totalCPS);
  const restaurantRating = useGameStore(s => s.restaurantRating);
  const insets = useSafeAreaInsets();

  const cps = totalCPS();
  const rating = restaurantRating();
  const filledStars = Math.floor(rating);
  const stars = '★'.repeat(filledStars) + '☆'.repeat(5 - filledStars);
  const uniqueTypes = new Set(placedBuildings.map(b => b.type)).size;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 24,
      }}
    >
      <Text style={styles.heading}>Restaurant Stats</Text>

      <View style={styles.ratingCard}>
        <Text style={styles.ratingStars}>{stars}</Text>
        <Text style={styles.ratingValue}>{rating.toFixed(1)} / 5.0</Text>
        <Text style={styles.ratingSubtitle}>Restaurant Rating</Text>
      </View>

      <View style={styles.grid}>
        <StatCard icon="🪙" label="Coins" value={formatNum(Math.floor(coins))} />
        <StatCard icon="💎" label="Gems" value={gems.toString()} />
        <StatCard icon="⚡" label="Per Second" value={`+${cps.toFixed(2)}/s`} />
        <StatCard icon="🏗️" label="Buildings" value={placedBuildings.length.toString()} />
        <StatCard icon="🎨" label="Unique Types" value={`${uniqueTypes} / 7`} />
        <StatCard icon="⭐" label="Player Level" value={playerLevel.toString()} />
      </View>

      <Text style={styles.sectionTitle}>Placed Buildings</Text>

      {placedBuildings.length === 0 ? (
        <Text style={styles.empty}>No buildings placed yet. Go build your restaurant!</Text>
      ) : (
        placedBuildings.map(b => {
          const def = BUILDINGS[b.type];
          const bCPS = cpsForBuilding(b.type, b.level);
          return (
            <View key={b.id} style={styles.buildingRow}>
              <Text style={styles.buildingEmoji}>{def.emoji}</Text>
              <View style={styles.buildingInfo}>
                <Text style={styles.buildingName}>{def.name}</Text>
                <Text style={styles.buildingPos}>({b.col}, {b.row})</Text>
              </View>
              <Text style={styles.buildingLevel}>Lv {b.level}</Text>
              <Text style={styles.buildingCPS}>+{bCPS.toFixed(2)}/s</Text>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  ratingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '55',
  },
  ratingStars: { fontSize: 40, color: COLORS.primary, letterSpacing: 4 },
  ratingValue: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginTop: 8 },
  ratingSubtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    width: '44%',
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    gap: 4,
  },
  cardIcon: { fontSize: 28 },
  cardValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  cardLabel: { fontSize: 11, color: COLORS.textMuted },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  empty: { color: COLORS.textMuted, textAlign: 'center', padding: 24, fontSize: 14 },
  buildingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.surfaceLight,
  },
  buildingEmoji: { fontSize: 24, width: 32, textAlign: 'center' },
  buildingInfo: { flex: 1 },
  buildingName: { fontSize: 14, color: COLORS.text },
  buildingPos: { fontSize: 10, color: COLORS.textMuted },
  buildingLevel: { fontSize: 12, fontWeight: 'bold', color: COLORS.primary, width: 36 },
  buildingCPS: { fontSize: 12, color: COLORS.textMuted, width: 64, textAlign: 'right' },
});
