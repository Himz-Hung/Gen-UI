// Mock catalog. Images from the public Pokémon TCG image CDN.
export type Rarity = 'common' | 'uncommon' | 'rare' | 'holo' | 'ultra';
export interface CardSet { id: string; name: string; releaseYear: number }
export interface Card { id: string; name: string; imageUrl: string; set: CardSet; rarity: Rarity; condition: 'NM' | 'LP' | 'MP' | 'HP'; priceLabel: string; price: number; stock: number }

const base: CardSet = { id: 'base1', name: 'Base Set', releaseYear: 1999 };
const jungle: CardSet = { id: 'base2', name: 'Jungle', releaseYear: 1999 };
const fossil: CardSet = { id: 'base3', name: 'Fossil', releaseYear: 1999 };
export const SETS = [base, jungle, fossil];

const img = (set: string, n: number) => `https://images.pokemontcg.io/${set}/${n}.png`;
const mk = (id: string, name: string, set: CardSet, n: number, rarity: Rarity, condition: Card['condition'], price: number, stock: number): Card =>
  ({ id, name, imageUrl: img(set.id, n), set, rarity, condition, price, priceLabel: `$${price.toFixed(2)}`, stock });

export const CARDS: Card[] = [
  mk('c1', 'Charizard', base, 4, 'holo', 'LP', 349.0, 1),
  mk('c2', 'Blastoise', base, 2, 'holo', 'NM', 189.0, 2),
  mk('c3', 'Venusaur', base, 15, 'holo', 'MP', 129.0, 0),
  mk('c4', 'Pikachu', base, 58, 'common', 'NM', 12.5, 14),
  mk('c5', 'Mewtwo', base, 10, 'holo', 'NM', 79.0, 3),
  mk('c6', 'Zapdos', base, 16, 'holo', 'LP', 64.0, 2),
  mk('c7', 'Alakazam', base, 1, 'holo', 'NM', 58.0, 1),
  mk('c8', 'Gyarados', base, 6, 'holo', 'HP', 22.0, 4),
  mk('c9', 'Scyther', jungle, 10, 'holo', 'NM', 45.0, 2),
  mk('c10', 'Snorlax', jungle, 11, 'holo', 'NM', 39.0, 3),
  mk('c11', 'Vaporeon', jungle, 12, 'holo', 'LP', 41.0, 1),
  mk('c12', 'Flareon', jungle, 3, 'holo', 'NM', 36.0, 2),
  mk('c13', 'Dragonite', fossil, 4, 'holo', 'NM', 72.0, 1),
  mk('c14', 'Gengar', fossil, 5, 'holo', 'LP', 48.0, 2),
  mk('c15', 'Lapras', fossil, 10, 'holo', 'NM', 29.0, 5),
  mk('c16', 'Aerodactyl', fossil, 1, 'holo', 'MP', 18.0, 0),
  mk('c17', 'Eevee', jungle, 51, 'common', 'NM', 4.0, 30),
  mk('c18', 'Magikarp', base, 35, 'uncommon', 'NM', 3.5, 22),
];
