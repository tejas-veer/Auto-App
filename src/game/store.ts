import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BuildingType,
  BUILDINGS,
  cpsForBuilding,
  upgradeCostForBuilding,
} from '../constants/buildings';

export interface PlacedBuilding {
  id: string;
  type: BuildingType;
  col: number;
  row: number;
  level: number;
}

export interface GameState {
  coins: number;
  gems: number;
  playerLevel: number;
  placedBuildings: PlacedBuilding[];
  selectedBuildingType: BuildingType | null;

  totalCPS: () => number;
  restaurantRating: () => number;

  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  selectBuildingType: (type: BuildingType | null) => void;
  placeBuilding: (col: number, row: number) => boolean;
  upgradeBuilding: (id: string) => boolean;
  tick: () => void;
  saveGame: () => Promise<void>;
  loadGame: () => Promise<void>;
  applyOfflineEarnings: () => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  coins: 100,
  gems: 10,
  playerLevel: 1,
  placedBuildings: [],
  selectedBuildingType: null,

  totalCPS: () => {
    const { placedBuildings, restaurantRating } = get();
    const base = placedBuildings.reduce(
      (sum, b) => sum + cpsForBuilding(b.type, b.level),
      0,
    );
    const rating = restaurantRating();
    return base * (1 + rating * 0.1);
  },

  restaurantRating: () => {
    const { placedBuildings } = get();
    const uniqueTypes = new Set(placedBuildings.map(b => b.type)).size;
    const totalLevel = placedBuildings.reduce((s, b) => s + b.level, 0);
    const score = (uniqueTypes / 7) * 2.5 + Math.min(totalLevel / 20, 1) * 2.5;
    return Math.min(5, Math.round(score * 10) / 10);
  },

  addCoins: amount => set(s => ({ coins: s.coins + amount })),

  spendCoins: amount => {
    if (get().coins < amount) return false;
    set(s => ({ coins: s.coins - amount }));
    return true;
  },

  selectBuildingType: type => set({ selectedBuildingType: type }),

  placeBuilding: (col, row) => {
    const { selectedBuildingType, placedBuildings, spendCoins, playerLevel } = get();
    if (!selectedBuildingType) return false;

    const def = BUILDINGS[selectedBuildingType];
    if (def.unlockLevel > playerLevel) return false;
    if (placedBuildings.some(b => b.col === col && b.row === row)) return false;
    if (!spendCoins(def.baseCost)) return false;

    const newBuilding: PlacedBuilding = {
      id: `${selectedBuildingType}-${col}-${row}-${Date.now()}`,
      type: selectedBuildingType,
      col,
      row,
      level: 1,
    };

    set(s => {
      const next = [...s.placedBuildings, newBuilding];
      const uniqueTypes = new Set(next.map(b => b.type)).size;
      const newLevel = Math.min(5, Math.floor(next.length / 5) + 1);
      return {
        placedBuildings: next,
        selectedBuildingType: null,
        playerLevel: Math.max(s.playerLevel, newLevel),
      };
    });
    return true;
  },

  upgradeBuilding: id => {
    const { placedBuildings, spendCoins } = get();
    const building = placedBuildings.find(b => b.id === id);
    if (!building) return false;

    const def = BUILDINGS[building.type];
    if (building.level >= def.maxLevel) return false;

    const cost = upgradeCostForBuilding(building.type, building.level);
    if (!spendCoins(cost)) return false;

    set(s => ({
      placedBuildings: s.placedBuildings.map(b =>
        b.id === id ? { ...b, level: b.level + 1 } : b,
      ),
    }));
    return true;
  },

  tick: () => {
    const cps = get().totalCPS();
    // Called every 100 ms — add 1/10th of a second's worth of coins
    set(s => ({ coins: s.coins + cps / 10 }));
  },

  saveGame: async () => {
    const { coins, gems, playerLevel, placedBuildings } = get();
    try {
      await AsyncStorage.multiSet([
        ['@rt_gameState', JSON.stringify({ coins, gems, playerLevel, placedBuildings })],
        ['@rt_lastActive', Date.now().toString()],
      ]);
    } catch {}
  },

  loadGame: async () => {
    try {
      const raw = await AsyncStorage.getItem('@rt_gameState');
      if (!raw) return;
      const data = JSON.parse(raw) as Partial<GameState>;
      set({
        coins: (data.coins as number) ?? 100,
        gems: (data.gems as number) ?? 10,
        playerLevel: (data.playerLevel as number) ?? 1,
        placedBuildings: (data.placedBuildings as PlacedBuilding[]) ?? [],
      });
    } catch {}
  },

  applyOfflineEarnings: async () => {
    try {
      const raw = await AsyncStorage.getItem('@rt_lastActive');
      if (!raw) return;
      const elapsed = Math.min((Date.now() - parseInt(raw, 10)) / 1000, 8 * 3600);
      if (elapsed < 30) return;
      const earned = Math.floor(get().totalCPS() * elapsed);
      if (earned > 0) set(s => ({ coins: s.coins + earned }));
    } catch {}
  },
}));
