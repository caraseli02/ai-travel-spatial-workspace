export interface InboxItem {
  id: string;
  type: 'whatsapp' | 'link' | 'note' | 'flight' | 'hotel';
  source: string;
  content: string;
  timestamp: string;
  processed: boolean;
  avatar?: string;
}

export interface CanvasCard {
  id: string;
  type: 'polaroid' | 'sticky' | 'article' | 'flight' | 'hotel' | 'note';
  x: number;
  y: number;
  rotation: number;
  title: string;
  subtitle?: string;
  image?: string;
  color?: string;
  tag?: string;
  tagColor?: string;
  day?: number;
  details?: string[];
  price?: string;
  rating?: number;
  width?: number;
}

export interface DayCluster {
  day: number;
  label: string;
  x: number;
  y: number;
  color: string;
}

export const inboxItems: InboxItem[] = [
  {
    id: 'i1',
    type: 'whatsapp',
    source: 'Yuki (local friend)',
    content: 'You HAVE to go to Fushimi Inari at 5am before the crowds! And try the tofu kaiseki at Junsei near Nanzenji 🍜',
    timestamp: '2 hours ago',
    processed: true,
    avatar: '🇯🇵',
  },
  {
    id: 'i2',
    type: 'flight',
    source: 'Google Flights',
    content: 'SFO → KIX · Dec 14 · 12h 40m · $743 · JAL JL69 · Nonstop',
    timestamp: '3 hours ago',
    processed: true,
  },
  {
    id: 'i3',
    type: 'hotel',
    source: 'Booking.com',
    content: 'Hiiragiya Ryokan · Nakagyo Ward · Dec 14–21 · ¥45,000/night · Free cancellation',
    timestamp: '3 hours ago',
    processed: true,
  },
  {
    id: 'i4',
    type: 'link',
    source: 'Reddit r/JapanTravel',
    content: '"Top 7 hidden Kyoto temples most tourists skip" — Fushimi Inari, Kurama-dera, Jingo-ji...',
    timestamp: '5 hours ago',
    processed: false,
  },
  {
    id: 'i5',
    type: 'note',
    source: 'My notes',
    content: 'Remember: JR Pass needed? Check if Arashiyama day trip is covered. Also need pocket WiFi.',
    timestamp: '1 day ago',
    processed: false,
  },
  {
    id: 'i6',
    type: 'whatsapp',
    source: 'Mom',
    content: 'Don\'t forget to visit the Golden Pavilion (Kinkaku-ji)! And buy me some matcha kit-kats 🍵',
    timestamp: '1 day ago',
    processed: false,
  },
  {
    id: 'i7',
    type: 'link',
    source: 'Eater Japan',
    content: 'The 12 Essential Kyoto Restaurants: Kikunoi Honten, Mizai, Nakamura-ro at Yasaka Shrine...',
    timestamp: '2 days ago',
    processed: false,
  },
];

export const canvasCards: CanvasCard[] = [
  // Day 1 cluster — Arrival
  {
    id: 'c1',
    type: 'flight',
    x: 48,
    y: 72,
    rotation: -1.5,
    title: 'JAL JL69 · SFO → KIX',
    subtitle: 'Dec 14 · Departs 11:05am · 12h 40m nonstop',
    tag: 'Day 1 · Arrival',
    tagColor: 'amber',
    day: 1,
    details: ['Window seat 32A confirmed', 'Meal: Japanese', '$743 total'],
    price: '$743',
    width: 280,
  },
  {
    id: 'c2',
    type: 'hotel',
    x: 365,
    y: 48,
    rotation: 1,
    title: 'Hiiragiya Ryokan',
    subtitle: 'Nakagyo Ward, Kyoto',
    tag: 'Dec 14–21 · 7 nights',
    tagColor: 'amber',
    day: 1,
    details: ['Traditional tatami rooms', 'Kaiseki dinner included', '¥45,000/night', 'Free cancellation'],
    rating: 4.9,
    image: '/images/ryokan.jpg',
    width: 260,
  },
  {
    id: 'c3',
    type: 'sticky',
    x: 680,
    y: 60,
    rotation: 2,
    title: 'Pack light!',
    subtitle: 'Ryokan provides yukata & toiletries. Just bring camera + layers.',
    color: '#fef3c7',
    day: 1,
    width: 200,
  },

  // Day 2 cluster — Fushimi Inari
  {
    id: 'c4',
    type: 'polaroid',
    x: 40,
    y: 310,
    rotation: -2.5,
    title: 'Fushimi Inari',
    subtitle: '5am · Beat the crowds',
    image: '/images/fushimi-inari.jpg',
    tag: 'Day 2',
    tagColor: 'orange',
    day: 2,
    width: 210,
  },
  {
    id: 'c5',
    type: 'sticky',
    x: 285,
    y: 290,
    rotation: 1.5,
    title: 'Yuki says:',
    subtitle: '"Go at 5am!! The light through the torii is incredible and zero tourists 🌅"',
    color: '#fce7f3',
    day: 2,
    width: 195,
  },
  {
    id: 'c6',
    type: 'article',
    x: 510,
    y: 275,
    rotation: -1,
    title: 'Nishiki Market',
    subtitle: '"Kyoto\'s Kitchen" — 126 stalls of fresh tofu, pickles & street snacks',
    tag: 'Day 2 · Afternoon',
    tagColor: 'orange',
    day: 2,
    details: ['Open 9am–6pm', 'Try: Tako tamago skewers', 'Near Gion district'],
    image: '/images/nishiki-market.jpg',
    width: 255,
  },

  // Day 3 cluster — Arashiyama
  {
    id: 'c7',
    type: 'polaroid',
    x: 48,
    y: 580,
    rotation: 1.8,
    title: 'Arashiyama Bamboo',
    subtitle: 'Early morning walk',
    image: '/images/arashiyama.jpg',
    tag: 'Day 3',
    tagColor: 'emerald',
    day: 3,
    width: 220,
  },
  {
    id: 'c8',
    type: 'sticky',
    x: 305,
    y: 560,
    rotation: -1.5,
    title: 'JR Pass ✓',
    subtitle: 'Arashiyama is covered! Take the Sagano Scenic Railway. Rent a bike to Jojakko-ji.',
    color: '#d1fae5',
    day: 3,
    width: 195,
  },
  {
    id: 'c9',
    type: 'article',
    x: 538,
    y: 548,
    rotation: 2,
    title: 'Tenryu-ji Garden',
    subtitle: 'UNESCO World Heritage · Zen garden with Arashiyama mountain backdrop',
    tag: 'Day 3 · Must-see',
    tagColor: 'emerald',
    day: 3,
    details: ['¥500 entry', 'Opens 8:30am', 'Allow 1.5 hours'],
    width: 240,
  },

  // Day 4 cluster — Gion
  {
    id: 'c10',
    type: 'polaroid',
    x: 790,
    y: 280,
    rotation: -1,
    title: 'Gion at Dusk',
    subtitle: 'Traditional machiya district',
    image: '/images/gion.jpg',
    tag: 'Day 4',
    tagColor: 'rose',
    day: 4,
    width: 225,
  },
  {
    id: 'c11',
    type: 'sticky',
    x: 810,
    y: 530,
    rotation: 1.5,
    title: 'Dinner: Junsei',
    subtitle: 'Tofu kaiseki near Nanzenji. Book 2 weeks ahead! Yuki\'s top rec 🍜',
    color: '#ffe4e6',
    day: 4,
    width: 190,
  },
  {
    id: 'c12',
    type: 'note',
    x: 790,
    y: 72,
    rotation: -0.5,
    title: 'Pocket WiFi',
    subtitle: 'Pick up at KIX airport · ¥600/day · Pre-book online',
    tag: 'Logistics',
    tagColor: 'slate',
    day: 0,
    width: 210,
  },
  {
    id: 'c13',
    type: 'sticky',
    x: 305,
    y: 740,
    rotation: 1,
    title: '🍵 Matcha kit-kats',
    subtitle: 'Mom\'s request! Get at Nishiki Market or the airport. Also grab mochi for Sarah.',
    color: '#d1fae5',
    day: 0,
    width: 200,
  },
  {
    id: 'c14',
    type: 'article',
    x: 538,
    y: 720,
    rotation: -1.5,
    title: 'Kikunoi Honten',
    subtitle: 'Michelin 3★ kaiseki · Book 1 month in advance · ¥33,000/person',
    tag: 'Day 5 · Dinner',
    tagColor: 'rose',
    day: 5,
    details: ['Reserve via official website', 'Seasonal menu only', 'Dress code: smart casual'],
    width: 245,
  },
];

export const dayGroups = [
  { day: 1, label: 'Day 1 — Arrival', color: '#f59e0b' },
  { day: 2, label: 'Day 2 — Fushimi Inari + Gion', color: '#f97316' },
  { day: 3, label: 'Day 3 — Arashiyama', color: '#10b981' },
  { day: 4, label: 'Day 4 — Gion + Nanzenji', color: '#f43f5e' },
];

export const connections = [
  { from: 'c4', to: 'c5', label: 'tip' },
  { from: 'c6', to: 'c10', label: 'nearby' },
  { from: 'c1', to: 'c2', label: 'same day' },
  { from: 'c12', to: 'c1', label: 'logistics' },
];
