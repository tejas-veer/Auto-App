# Restaurant Tycoon — Cursor Agent Build Prompt

## What You Are Building

A React Native mobile idle tycoon game where the player grows a restaurant from a tiny food stall into a 5-star dining empire. The view is **2.5D isometric** — a 45-degree top-down grid where buildings have visible top faces and side walls, like chunky Stardew Valley sprites. The game runs itself (idle), but smart placement and upgrades make it earn faster.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React Native (Expo SDK 51, managed workflow) |
| Language | TypeScript (strict mode) |
| Grid rendering | `react-native-svg` — SVG polygon-based isometric tiles |
| Animations | `react-native-reanimated` v3 |
| State | Zustand (`src/game/store.ts`) |
| Persistence | `@react-native-async-storage/async-storage` |
| Navigation | React Navigation bottom tabs (Game / Shop / Stats) |

---

## Project Structure (Scaffold Already Exists)

```
App.tsx                           Root — GestureHandlerRootView > SafeAreaProvider > NavigationContainer
src/
  constants/
    theme.ts                      COLORS, SIZES (tileW=72, tileH=36, gridCols=8, gridRows=8)
    buildings.ts                  7 BuildingDef entries + cpsForBuilding() + upgradeCostForBuilding()
  utils/
    isoMath.ts                    gridToScreen(), tileDiamond(), buildingPolygons()
  game/
    store.ts                      Zustand store — coins, gems, placedBuildings, tick(), saveGame(), loadGame()
  components/
    IsometricGrid.tsx             SVG 8×8 isometric grid with painter's-algorithm tile ordering
    HUD.tsx                       Coins, CPS, gems, star rating — top bar
    ShopSheet.tsx                 Bottom-sheet modal for choosing a building to place
    UpgradeModal.tsx              Tap-a-building modal with level progress bar and upgrade CTA
  screens/
    GameScreen.tsx                Main view: HUD + scrollable grid + place-mode bottom bar
    ShopScreen.tsx                Full building catalog with lock/afford states
    StatsScreen.tsx               Stat cards + placed building breakdown
```

---

## Isometric Coordinate System

```
screenX = originX + (col - row) * (tileW / 2)
screenY = originY + (col + row) * (tileH / 2)
```

`originX = SVG_WIDTH / 2`, `originY = buildingHeight + 20`

Tiles render in **back-to-front** order sorted by `col + row` ascending (painter's algorithm). Any new SVG elements (customers, coin floats) must be inserted into this sorted render list by their current grid position so they don't clip over forward tiles.

Buildings are 3-polygon isometric boxes: left wall (darkest), right wall (medium), top face (lightest). Height = `buildingHeight + (level - 1) * 8` pixels.

---

## Building Types

| ID | Name | Base Cost | Base CPS | Unlock Level |
|---|---|---|---|---|
| `table` | Table & Chairs | 50 | 0.5 | 1 |
| `kitchen` | Kitchen Station | 200 | 2.0 | 1 |
| `cashier` | Cashier Counter | 350 | 3.0 | 1 |
| `bench` | Waiting Bench | 150 | 1.0 | 1 |
| `decor` | Decoration | 100 | 0.3 | 1 |
| `bar` | Bar Counter | 1500 | 8.0 | 3 |
| `vip` | VIP Booth | 5000 | 20.0 | 4 |

`playerLevel` advances every 5 buildings placed (capped at 5). Bar unlocks at level 3, VIP at level 4.

---

## Economy

- **Coins** — earned passively. `totalCPS = sum(cpsForBuilding) × (1 + rating × 0.1)`
- `tick()` is called every 100 ms, adds `CPS / 10` coins each call
- **Offline earnings** — `min(elapsed_seconds, 8 × 3600) × CPS` applied on launch
- **Restaurant Rating** — 0–5 stars, based on unique building types and total level sum
- **Gems** — premium currency, only earned via achievements (implement separately)

---

## Tasks to Implement

Work through these in order. Each section is a self-contained feature.

---

### 1. Coin Float Animations

**Goal:** When a building generates a coin tick, a `+N` label floats upward from the building's position and fades out over ~1 second.

**Where:** `GameScreen.tsx` + new `src/components/CoinFloat.tsx`

**How:**
- In `GameScreen`, keep `floats: { id: string; x: number; y: number; value: number }[]` in local `useState`
- Every 2 seconds (separate interval from the tick), for each placed building compute its screen position using `gridToScreen()`, push a new float entry
- `CoinFloat` is an `Animated.View` with absolute position, starts at `(x, y)`, animates to `(x, y - 60)` while fading opacity 1 → 0 over 900 ms using `useNativeDriver: true`
- On animation complete, remove from the array

**Code sketch:**
```typescript
// CoinFloat.tsx
useEffect(() => {
  const translateY = new Animated.Value(0);
  const opacity = new Animated.Value(1);
  Animated.parallel([
    Animated.timing(translateY, { toValue: -60, duration: 900, useNativeDriver: true }),
    Animated.timing(opacity, { toValue: 0, duration: 900, useNativeDriver: true }),
  ]).start(() => onDone());
}, []);
```

---

### 2. Building Placement Bounce

**Goal:** When a building is placed on the grid, it bounces in with a spring scale animation (0 → 1.15 → 1.0).

**Where:** `IsometricGrid.tsx`

**How:**
- For each building in `placedBuildings`, track a Reanimated `useSharedValue(0)` keyed by `building.id`
- When a new building id appears (via `useEffect` comparing previous ids), run `withSequence(withSpring(1.15), withSpring(1.0))` on its scale value
- Wrap the building's `<G>` in an `<AnimatedG>` (create via `Animated.createAnimatedComponent(G)` from `react-native-svg`) and apply the scale transform centered on the building's screen position

---

### 3. Customer Characters

**Goal:** Small animated customer figures walk in from the restaurant entrance, sit at a table, then leave.

**Architecture:**
```typescript
// Add to store.ts
export interface Customer {
  id: string;
  phase: 'walking-in' | 'eating' | 'leaving';
  targetTableId: string | null;
  screenX: number;
  screenY: number;
}
customers: Customer[];
spawnCustomer: () => void;
removeCustomer: (id: string) => void;
```

**Spawning rule:** Spawn a new customer every `max(5, 30 - placedBuildings.length * 2)` seconds, capped at `2 + floor(tables.length / 2)` simultaneous customers.

**Animation:**
- Each customer has a Reanimated `useSharedValue` for x and y
- `walking-in`: animate from entrance (left edge, random row 2-5) to target table screen position over 2s using `withTiming`
- `eating`: bob y ±3px with `withRepeat(withSequence(withTiming(-3), withTiming(3)), -1, true)` for 8s
- `leaving`: animate to right edge over 2s, then remove

**Rendering:** Render customers inside the SVG after all tiles. Use a small `<Circle>` (radius 10) in the customer's building color + an emoji `<SvgText>` above it (`👤`). Sort by `screenY` so customers behind others render first.

**Emotion bubbles:** When `eating`, show a small `😊` `<SvgText>` 20px above the customer's circle.

---

### 4. VIP Customer Event

**Goal:** Every 2–5 minutes (random), a special VIP customer appears. If a VIP Booth exists, they give 50× CPS as a lump sum. If not, they leave after 30s.

**Add to store:**
```typescript
vipActive: boolean;
vipCountdown: number;          // seconds until next VIP
triggerVIP: () => void;
dismissVIP: () => void;
```

**UI:**
- Show a banner at the top of the game screen: `✨ VIP Customer! Tap to seat them.`
- If tapped and a VIP booth exists: play a sparkle animation, add `cps * 50` coins, dismiss banner
- If no VIP booth: banner says `✨ VIP Customer arrived... but left (no VIP Booth)`

**Implementation:** Add a VIP countdown to the store tick. When countdown hits 0, set `vipActive = true` and reset countdown to `random(120, 300)` seconds.

---

### 5. Lunch Rush Event

**Goal:** Every 30 minutes of active play, customer income doubles for 10 minutes.

**Add to store:**
```typescript
lunchRushActive: boolean;
lunchRushSecondsLeft: number;
activeSeconds: number;          // total seconds the app has been in foreground
```

**Logic:**
- Each tick, increment `activeSeconds` by 0.1
- Every 1800 active seconds, set `lunchRushActive = true`, `lunchRushSecondsLeft = 600`
- During lunch rush, `totalCPS()` multiplies by 2
- Decrement `lunchRushSecondsLeft` each second; when 0, set `lunchRushActive = false`

**UI:** Add a pulsing animated banner below the HUD showing `🍽️ LUNCH RUSH! ×2 income — 9:32 remaining`. Use Reanimated `withRepeat(withSequence(withTiming(1.05), withTiming(1.0)))` on the banner scale.

---

### 6. Daily Bonus

**Goal:** On first app launch of each calendar day, show a modal awarding coins.

**Storage keys:** `@rt_lastBonusDate` (ISO date string), `@rt_dayStreak` (number)

**Logic in `loadGame()`:**
```typescript
const today = new Date().toISOString().slice(0, 10);
const last = await AsyncStorage.getItem('@rt_lastBonusDate');
if (last !== today) {
  const yesterday = new Date(Date.now() - 86400_000).toISOString().slice(0, 10);
  const streak = last === yesterday ? (savedStreak + 1) : 1;
  const reward = 100 * streak;
  set(s => ({ coins: s.coins + reward, dailyBonusPending: { reward, streak } }));
  await AsyncStorage.multiSet([['@rt_lastBonusDate', today], ['@rt_dayStreak', String(streak)]]);
}
```

**UI:** Add `dailyBonusPending: { reward: number; streak: number } | null` to store. In `GameScreen`, watch this value and show a `DailyBonusModal` when non-null. The modal should show a large 🪙 with an animated counter from 0 → reward, and a "Claim!" button that sets `dailyBonusPending = null`.

---

### 7. Zone Expansion

**Goal:** At player level 3, an "Expand Restaurant" button appears. Spending 20 gems grows the grid from 8×8 to 10×10.

**Add to store:**
```typescript
gridSize: number;   // default 8, can grow to 10, 12
expandGrid: () => boolean;
```

**In `IsometricGrid.tsx`:** Replace hardcoded `gridCols` / `gridRows` with `gridSize` from the store. Compute `SVG_WIDTH`, `SVG_HEIGHT`, and `ORIGIN_X` dynamically based on `gridSize`.

**Animation:** When grid expands, newly revealed tiles fade in with staggered opacity (tile at index `i` starts animating after `i * 20ms` delay) using Reanimated.

**UI:** Add an "Expand 🏗️ (20💎)" button to the bottom bar of `GameScreen` when `playerLevel >= 3 && gridSize < 10`.

---

### 8. Prestige System

**Goal:** When player has placed all 7 building types and has 40+ total buildings, offer a Prestige reset that clears the board but grants a permanent ×2 CPS multiplier.

**Add to store:**
```typescript
prestigeCount: number;
prestigeMultiplier: number;   // = 2^prestigeCount
prestige: () => void;
```

**`totalCPS()` becomes:** `base * ratingMultiplier * prestigeMultiplier`

**UI:** In `StatsScreen`, show a "⚜️ Prestige" button when conditions are met. Tapping opens a confirmation dialog explaining the reset. On confirm, run `prestige()` which resets `placedBuildings`, `coins`, `playerLevel` back to defaults but increments `prestigeCount` and doubles `prestigeMultiplier`. Show a golden flash animation on the grid.

---

### 9. Sound & Haptics

**Dependencies to add:**
```bash
npx expo install expo-av expo-haptics
```

**Create `src/utils/sounds.ts`:**
```typescript
import { Audio } from 'expo-av';
// Load and cache sound objects at module level
// coinClink, customerDing, kitchenSizzle, bgMusic
export async function loadSounds() { ... }
export async function playCoin() { ... }
export async function playDing() { ... }
```

**Trigger points:**
- `placeBuilding()` success → `impactMedium` haptic + placement sound
- `upgradeBuilding()` success → `notificationSuccess` haptic
- Coin float appears → `playCoin()` (debounced, max once per 200ms)
- Customer seated → `playDing()`
- `GameScreen` mount → start bg music loop at volume 0.3

Add a mute toggle in `StatsScreen` stored in AsyncStorage (`@rt_muted`).

---

### 10. Offline Earnings Notification Modal

**Goal:** When the user returns after ≥ 30 seconds away, show a "Welcome back!" modal with how many coins were earned while away.

**Add to store:** `offlineEarned: number | null`

**Modify `applyOfflineEarnings()`:** Instead of silently adding coins, set `offlineEarned = earned`.

**In `GameScreen`:** Watch `offlineEarned`. When non-null, show `OfflineModal` with:
- ⏰ "You were away for X hours"
- 🪙 "+N coins earned while you slept"
- "Collect!" button that clears `offlineEarned`

Use an animated counter from 0 → N using Reanimated `withTiming` over 1.5s.

---

## Visual Style Constraints

| Token | Value |
|---|---|
| Background | `#1a0a00` |
| Surface | `#2d1a0e` |
| Surface light | `#3d2a1a` |
| Primary (amber) | `#f4a017` |
| Coin gold | `#ffd700` |
| Text | `#fff8f0` |
| Muted text | `#a08060` |
| Gem purple | `#a78bfa` |

Building top faces are the lightest shade, right walls are medium, left walls are darkest. No drop shadows — the dark wall faces provide all depth. Chunky, warm, inviting. Every interactive element should have a press animation (scale 0.97 on `Pressable`).

---

## Known Limitations of Current Scaffold

- `onPress` on SVG `<Polygon>` and `<G>` elements works on iOS but may need `react-native-gesture-handler` wrapping on Android — test and wrap if needed.
- The `IsometricGrid` re-renders on every coin tick because `GameScreen` subscribes to `coins` indirectly. Move the grid into a `React.memo` wrapper with explicit `placedBuildings` comparison to prevent unnecessary SVG re-renders.
- `playerLevel` advances based on building count in `placeBuilding()` — no toast or animation for level-ups yet.
- `UpgradeModal` calls `upgradeBuilding()` which is a synchronous state update; add a success/failure callback to show feedback.

---

## Coding Rules

1. All game state lives in `src/game/store.ts`. Do not create separate React context for game data.
2. Screens use Zustand selectors (`useGameStore(s => s.coins)`) — never subscribe to the whole store object.
3. SVG elements for the isometric view live in `IsometricGrid.tsx`. Do not mix RN `View`s and SVG in the same visual layer.
4. No comments explaining what the code does. Only add a comment if there is a non-obvious constraint or invariant.
5. No fallback handling for impossible states. Trust Zustand's type contract.
6. Coordinate math always goes through `gridToScreen()` in `isoMath.ts`.
