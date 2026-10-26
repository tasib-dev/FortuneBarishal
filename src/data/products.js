// Placeholder data. Later the backend replaces this (see src/api.js).
// For real photos: put files in public/products/ and set image: "/products/bat1.jpg"
export const money = (n) => "৳" + Number(n).toLocaleString("en-US");
export const CATEGORIES = [
  { name: "Cricket", emoji: "🏏" }, { name: "Football", emoji: "⚽" },
  { name: "Badminton", emoji: "🏸" }, { name: "Fitness", emoji: "🏋️" },
];
export const PRODUCTS = [
  { id: 1, name: "Pro Cricket Bat", category: "Cricket", price: 8500, old: 9800, emoji: "🏏", image: "", desc: "Placeholder description. Replace with real product details." },
  { id: 2, name: "Leather Cricket Ball", category: "Cricket", price: 850, old: 0, emoji: "🔴", image: "", desc: "Placeholder description." },
  { id: 3, name: "Match Football Size 5", category: "Football", price: 2200, old: 2600, emoji: "⚽", image: "", desc: "Placeholder description." },
  { id: 4, name: "Goalkeeper Gloves", category: "Football", price: 1500, old: 0, emoji: "🧤", image: "", desc: "Placeholder description." },
  { id: 5, name: "Badminton Racket Set", category: "Badminton", price: 3200, old: 3800, emoji: "🏸", image: "", desc: "Placeholder description." },
  { id: 6, name: "Shuttlecock (Pack of 6)", category: "Badminton", price: 650, old: 0, emoji: "🪶", image: "", desc: "Placeholder description." },
  { id: 7, name: "Adjustable Dumbbell Set", category: "Fitness", price: 4500, old: 5200, emoji: "💪", image: "", desc: "Placeholder description." },
  { id: 8, name: "Yoga Mat", category: "Fitness", price: 1100, old: 0, emoji: "🧘", image: "", desc: "Placeholder description." },
];
// Tabs used on Home + Shop (later the backend can send real flags like isNew / isBestSeller)
export const TABS = {
  new: { label: "New In", test: (p) => p.id > 4 },
  best: { label: "Best Sellers", test: (p) => p.id % 2 === 1 },
  sale: { label: "Flash Deal", test: (p) => p.old > 0 },
};
