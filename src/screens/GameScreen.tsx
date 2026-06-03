import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HUD } from '../components/HUD';
import { IsometricGrid } from '../components/IsometricGrid';
import { ShopSheet } from '../components/ShopSheet';
import { UpgradeModal } from '../components/UpgradeModal';
import { COLORS } from '../constants/theme';
import { BUILDINGS } from '../constants/buildings';
import { useGameStore, PlacedBuilding } from '../game/store';

export function GameScreen() {
  const selectedBuildingType = useGameStore(s => s.selectedBuildingType);
  const placedBuildings = useGameStore(s => s.placedBuildings);
  const selectBuildingType = useGameStore(s => s.selectBuildingType);
  const placeBuilding = useGameStore(s => s.placeBuilding);
  const tick = useGameStore(s => s.tick);
  const saveGame = useGameStore(s => s.saveGame);
  const loadGame = useGameStore(s => s.loadGame);
  const applyOfflineEarnings = useGameStore(s => s.applyOfflineEarnings);

  const [shopVisible, setShopVisible] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<PlacedBuilding | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const init = async () => {
      await loadGame();
      await applyOfflineEarnings();
    };
    init();

    const tickInterval = setInterval(tick, 100);
    const saveInterval = setInterval(saveGame, 30_000);

    return () => {
      clearInterval(tickInterval);
      clearInterval(saveInterval);
      saveGame();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleTilePress(col: number, row: number) {
    if (!selectedBuildingType) {
      setShopVisible(true);
      return;
    }
    placeBuilding(col, row);
  }

  function handleBuildingPress(id: string) {
    const b = placedBuildings.find(b => b.id === id) ?? null;
    setSelectedBuilding(b);
  }

  return (
    <View style={styles.container}>
      <HUD />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <IsometricGrid
            placedBuildings={placedBuildings}
            selectedType={selectedBuildingType}
            onTilePress={handleTilePress}
            onBuildingPress={handleBuildingPress}
          />
        </ScrollView>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        {selectedBuildingType ? (
          <View style={styles.placeMode}>
            <Text style={styles.placeModeText}>
              {BUILDINGS[selectedBuildingType].emoji}{' '}
              Tap an empty tile to place {BUILDINGS[selectedBuildingType].name}
            </Text>
            <Pressable style={styles.cancelBtn} onPress={() => selectBuildingType(null)}>
              <Text style={styles.cancelText}>✕</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.shopBtn} onPress={() => setShopVisible(true)}>
            <Text style={styles.shopBtnText}>🏪  Place Building</Text>
          </Pressable>
        )}
      </View>

      <ShopSheet visible={shopVisible} onClose={() => setShopVisible(false)} />

      <UpgradeModal
        building={selectedBuilding}
        onClose={() => setSelectedBuilding(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { alignItems: 'center', paddingVertical: 16 },
  bottomBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.primary + '44',
    padding: 12,
  },
  shopBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  shopBtnText: { fontSize: 17, fontWeight: 'bold', color: '#1a0a00' },
  placeMode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  placeModeText: { flex: 1, color: COLORS.text, fontSize: 13, lineHeight: 18 },
  cancelBtn: {
    backgroundColor: COLORS.accent + 'bb',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { color: COLORS.text, fontWeight: 'bold', fontSize: 16 },
});
