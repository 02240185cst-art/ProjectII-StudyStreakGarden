// Plant pool + unlock rules (ported from GardenRepository.kt) and the new decoration shop.
export const PLANT_POOL = [
  { name: 'Sprout', emoji: '🌱' },
  { name: 'Pink Daisy', emoji: '🌷' },
  { name: 'Lavender', emoji: '💜' },
  { name: 'Sunflower', emoji: '🌻' },
  { name: 'Tulip', emoji: '🌷' },
  { name: 'Rose', emoji: '🌹' },
  { name: 'White Flower', emoji: '🌼' },
  { name: 'Blue Flower', emoji: '🪻' },
  { name: 'Tree', emoji: '🌳' },
];

// Plants are kept based on your BEST streak so a reset never removes plants you already grew.
export const unlockedPlants = (best) => PLANT_POOL.slice(0, Math.min(best, PLANT_POOL.length));

export const daysToNextFlower = (streak) => {
  const m = streak % 10;
  return m === 0 && streak > 0 ? 10 : m;
};

// ---- Decorations (NEW in Project II) ----
export const DECORATIONS = [
  { id: 'fence', name: 'Wooden Fence', emoji: '🪵', cost: 5, kind: 'extra' },
  { id: 'pots', name: 'Clay Pots', emoji: '🪴', cost: 8, kind: 'extra' },
  { id: 'bg_sunset', name: 'Sunset Sky', emoji: '🌅', cost: 12, kind: 'background', color: '#F9D9C4' },
  { id: 'bg_night', name: 'Night Sky', emoji: '🌙', cost: 12, kind: 'background', color: '#D3D0EE' },
  { id: 'bg_meadow', name: 'Meadow', emoji: '🌿', cost: 10, kind: 'background', color: '#DDEBD2' },
];

// 1 seed per completed session + 5 bonus seeds per unlocked achievement.
export const seedsEarned = (sessionCount, achievementsUnlocked) => sessionCount + 5 * achievementsUnlocked;
