import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { BUILDINGS, BuildingType } from '../constants/buildings';
import { useGameStore } from '../game/store';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function ShopSheet({ visible, onClose }: Props) {
  const coins = useGameStore(s => s.coins);
  const playerLevel = useGameStore(s => s.playerLevel);
  const selectBuildingType = useGameStore(s => s.selectBuildingType);
  const insets = useSafeAreaInsets();

  function handleSelect(type: BuildingType) {
    selectBuildingType(type);
    onClose();
  }

  const allBuildings = Object.values(BUILDINGS);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>Place a Building</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {allBuildings.map(def => {
            const locked = def.unlockLevel > playerLevel;
            const canAfford = !locked && coins >= def.baseCost;
            return (
              <Pressable
                key={def.id}
                style={[styles.item, (locked || !canAfford) && styles.itemDim]}
                onPress={() => !locked && canAfford && handleSelect(def.id)}
              >
                <Text style={styles.emoji}>{def.emoji}</Text>
                <View style={styles.info}>
                  <Text style={styles.name}>{def.name}</Text>
                  <Text style={styles.desc}>{def.description}</Text>
                  <Text style={styles.stat}>⚡ {def.baseCPS}/s base · max Lv{def.maxLevel}</Text>
                </View>
                <View>
                  {locked ? (
                    <Text style={styles.locked}>🔒 Lv{def.unlockLevel}</Text>
                  ) : (
                    <Text style={[styles.cost, !canAfford && styles.costRed]}>
                      🪙 {def.baseCost}
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#00000077' },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '65%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.textMuted,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 14,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  itemDim: { opacity: 0.45 },
  emoji: { fontSize: 30, width: 38, textAlign: 'center' },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  desc: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  stat: { fontSize: 11, color: COLORS.primary, marginTop: 4 },
  cost: { fontSize: 15, fontWeight: 'bold', color: COLORS.coin },
  costRed: { color: '#ff6b6b' },
  locked: { fontSize: 12, color: COLORS.textMuted },
});
