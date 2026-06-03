import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { BUILDINGS } from '../constants/buildings';
import { useGameStore } from '../game/store';

export function ShopScreen() {
  const coins = useGameStore(s => s.coins);
  const playerLevel = useGameStore(s => s.playerLevel);
  const insets = useSafeAreaInsets();
  const allBuildings = Object.values(BUILDINGS);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.heading}>Building Catalog</Text>
      <FlatList
        data={allBuildings}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const locked = item.unlockLevel > playerLevel;
          const canAfford = !locked && coins >= item.baseCost;
          return (
            <View style={[styles.card, locked && styles.cardLocked]}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <View style={styles.info}>
                <View style={styles.row}>
                  <Text style={styles.name}>{item.name}</Text>
                  {locked && (
                    <View style={styles.lockBadge}>
                      <Text style={styles.lockText}>🔒 Level {item.unlockLevel}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.desc}>{item.description}</Text>
                <View style={styles.row}>
                  <Text style={styles.stat}>⚡ {item.baseCPS}/s</Text>
                  <Text style={styles.stat}>Max Lv {item.maxLevel}</Text>
                  <Text style={styles.stat}>×{item.upgradeMultiplier} per level</Text>
                </View>
              </View>
              <View style={styles.priceCol}>
                {locked ? (
                  <Text style={styles.lockedPrice}>—</Text>
                ) : (
                  <Text style={[styles.price, !canAfford && styles.priceRed]}>
                    🪙{'\n'}{item.baseCost.toLocaleString()}
                  </Text>
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    paddingVertical: 16,
  },
  list: { padding: 12, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.primary + '33',
  },
  cardLocked: { opacity: 0.5 },
  emoji: { fontSize: 36, width: 44, textAlign: 'center' },
  info: { flex: 1, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  name: { fontSize: 15, fontWeight: 'bold', color: COLORS.text },
  lockBadge: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  lockText: { fontSize: 10, color: COLORS.textMuted },
  desc: { fontSize: 12, color: COLORS.textMuted },
  stat: { fontSize: 11, color: COLORS.primary },
  priceCol: { alignItems: 'center', minWidth: 50 },
  price: { fontSize: 14, fontWeight: 'bold', color: COLORS.coin, textAlign: 'center' },
  priceRed: { color: '#ff6b6b' },
  lockedPrice: { color: COLORS.textMuted, fontSize: 14 },
});
