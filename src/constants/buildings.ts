export type BuildingType =
  | 'table'
  | 'kitchen'
  | 'cashier'
  | 'bench'
  | 'decor'
  | 'bar'
  | 'vip';

export interface BuildingDef {
  id: BuildingType;
  name: string;
  description: string;
  baseCost: number;
  baseCPS: number;
  upgradeMultiplier: number;
  upgradeCostMultiplier: number;
  maxLevel: number;
  unlockLevel: number;
  emoji: string;
  colors: { top: string; right: string; left: string };
}

export const BUILDINGS: Record<BuildingType, BuildingDef> = {
  table: {
    id: 'table',
    name: 'Table & Chairs',
    description: 'Seats customers, generates base income.',
    baseCost: 50,
    baseCPS: 0.5,
    upgradeMultiplier: 1.8,
    upgradeCostMultiplier: 3,
    maxLevel: 10,
    unlockLevel: 1,
    emoji: '🪑',
    colors: { top: '#D4955A', right: '#7a4e2e', left: '#9c6438' },
  },
  kitchen: {
    id: 'kitchen',
    name: 'Kitchen Station',
    description: 'Speeds up food production, multiplies income.',
    baseCost: 200,
    baseCPS: 2,
    upgradeMultiplier: 2.0,
    upgradeCostMultiplier: 4,
    maxLevel: 10,
    unlockLevel: 1,
    emoji: '🍳',
    colors: { top: '#E8E0D0', right: '#888070', left: '#a8a090' },
  },
  cashier: {
    id: 'cashier',
    name: 'Cashier Counter',
    description: 'Increases coins per customer visit.',
    baseCost: 350,
    baseCPS: 3,
    upgradeMultiplier: 2.2,
    upgradeCostMultiplier: 4,
    maxLevel: 10,
    unlockLevel: 1,
    emoji: '🏧',
    colors: { top: '#4A90D9', right: '#1f5e9e', left: '#2f74b8' },
  },
  bench: {
    id: 'bench',
    name: 'Waiting Bench',
    description: 'Allows more customers to queue.',
    baseCost: 150,
    baseCPS: 1,
    upgradeMultiplier: 1.6,
    upgradeCostMultiplier: 2.5,
    maxLevel: 8,
    unlockLevel: 1,
    emoji: '🛋️',
    colors: { top: '#A0D080', right: '#507030', left: '#688048' },
  },
  decor: {
    id: 'decor',
    name: 'Decoration',
    description: 'Boosts overall restaurant rating.',
    baseCost: 100,
    baseCPS: 0.3,
    upgradeMultiplier: 1.5,
    upgradeCostMultiplier: 2,
    maxLevel: 5,
    unlockLevel: 1,
    emoji: '🌿',
    colors: { top: '#F0A0C0', right: '#905060', left: '#b06878' },
  },
  bar: {
    id: 'bar',
    name: 'Bar Counter',
    description: 'Unlocks drink orders, high coin value.',
    baseCost: 1500,
    baseCPS: 8,
    upgradeMultiplier: 2.5,
    upgradeCostMultiplier: 5,
    maxLevel: 10,
    unlockLevel: 3,
    emoji: '🍸',
    colors: { top: '#704020', right: '#281000', left: '#401808' },
  },
  vip: {
    id: 'vip',
    name: 'VIP Booth',
    description: 'Premium seating, 3× coin multiplier.',
    baseCost: 5000,
    baseCPS: 20,
    upgradeMultiplier: 3.0,
    upgradeCostMultiplier: 6,
    maxLevel: 10,
    unlockLevel: 4,
    emoji: '💎',
    colors: { top: '#FFD700', right: '#886000', left: '#aa8010' },
  },
};

export function cpsForBuilding(type: BuildingType, level: number): number {
  const def = BUILDINGS[type];
  return def.baseCPS * Math.pow(def.upgradeMultiplier, level - 1);
}

export function upgradeCostForBuilding(type: BuildingType, currentLevel: number): number {
  const def = BUILDINGS[type];
  return Math.floor(def.baseCost * Math.pow(def.upgradeCostMultiplier, currentLevel));
}
