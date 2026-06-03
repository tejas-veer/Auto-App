import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import {
  BUILDINGS,
  cpsForBuilding,
  upgradeCostForBuilding,
} from '../constants/buildings';
import { PlacedBuilding, useGameStore } from '../game/store';

interface Props {
  building: PlacedBuilding | null;
  onClose: () => void;
}

export function UpgradeModal({ building, onClose }: Props) {
  const coins = useGameStore(s => s.coins);
  const upgradeBuilding = useGameStore(s => s.upgradeBuilding);
  const insets = useSafeAreaInsets();

  if (!building) return null;

  const def = BUILDINGS[building.type];
  const isMaxLevel = building.level >= def.maxLevel;
  const cost = upgradeCostForBuilding(building.type, building.level);
  const canAfford = coins >= cost;
  const currentCPS = cpsForBuilding(building.type, building.level);
  const nextCPS = cpsForBuilding(building.type, building.level + 1);
  const levelFraction = building.level / def.maxLevel;

  function handleUpgrade() {
    const ok = upgradeBuilding(building!.id);
    if (ok) onClose();
  }

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.card, { marginBottom: insets.bottom + 24 }]}>
        <Text style={styles.emoji}>{def.emoji}</Text>
        <Text style={styles.name}>{def.name}</Text>
        <Text style={styles.desc}>{def.description}</Text>

        {/* Level progress bar */}
        <View style={styles.levelRow}>
          <Text style={styles.levelText}>Level {building.level}</Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${levelFraction * 100}%` as any }]} />
          </View>
          <Text style={styles.levelText}>Max {def.maxLevel}</Text>
        </View>

        {/* CPS info */}
        {!isMaxLevel && (
          <View style={styles.cpsRow}>
            <Text style={styles.cpsOld}>⚡ {currentCPS.toFixed(2)}/s</Text>
            <Text style={styles.arrow}> → </Text>
            <Text style={styles.cpsNew}>⚡ {nextCPS.toFixed(2)}/s</Text>
          </View>
        )}

        {isMaxLevel ? (
          <View style={styles.maxBadge}>
            <Text style={styles.maxText}>✨ MAX LEVEL</Text>
          </View>
        ) : (
          <Pressable
            style={[styles.upgradeBtn, !canAfford && styles.upgradeBtnDisabled]}
            onPress={handleUpgrade}
            disabled={!canAfford}
          >
            <Text style={styles.upgradeBtnText}>
              Upgrade — 🪙 {cost.toLocaleString()}
            </Text>
          </Pressable>
        )}

        <Pressable style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Close</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000088',
  },
  card: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.primary + '55',
  },
  emoji: { fontSize: 48 },
  name: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  desc: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center' },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    marginTop: 4,
  },
  levelText: { fontSize: 12, color: COLORS.textMuted, width: 50, textAlign: 'center' },
  progressBg: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  cpsRow: { flexDirection: 'row', alignItems: 'center' },
  cpsOld: { fontSize: 14, color: COLORS.textMuted },
  arrow: { fontSize: 14, color: COLORS.textMuted },
  cpsNew: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },
  upgradeBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  upgradeBtnDisabled: { backgroundColor: COLORS.surfaceLight },
  upgradeBtnText: { fontSize: 16, fontWeight: 'bold', color: '#1a0a00' },
  maxBadge: {
    backgroundColor: COLORS.primary + '33',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  maxText: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary },
  closeBtn: { paddingVertical: 8 },
  closeBtnText: { fontSize: 14, color: COLORS.textMuted },
});
