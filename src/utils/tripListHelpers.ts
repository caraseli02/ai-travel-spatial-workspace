import type { Trip } from '../models/trip';
import { deriveTripStatus } from './tripCardHelpers';
import type { CanvasCard } from '../data/tripData';

export function computeStatusCounts(trips: Trip[]) {
  const counts = {
    all: trips.length,
    upcoming: 0,
    ongoing: 0,
    planning: 0,
    completed: 0,
  };

  trips.forEach((trip) => {
    const status = deriveTripStatus(trip);
    if (status in counts) {
      counts[status as keyof typeof counts]++;
    }
  });

  return counts;
}

export function filterTripsByStatus(
  trips: Trip[],
  status: 'all' | 'upcoming' | 'ongoing' | 'planning' | 'completed'
): Trip[] {
  if (status === 'all') {
    return trips;
  }
  return trips.filter((trip) => deriveTripStatus(trip) === status);
}

export function generateTripFromMessage(message: string): Trip {
  const destinations = [
    'Paris', 'Tokyo', 'London', 'New York', 'Rome', 'Barcelona',
    'Dubai', 'Sydney', 'Cairo', 'Rio de Janeiro', 'Bangkok',
    'Istanbul', 'Amsterdam', 'Singapore', 'Machu Picchu',
    'Maldives', 'Swiss Alps', 'Petra', 'Taj Mahal', 'Grand Canyon',
    'Bali', 'Iceland', 'Kyoto'
  ];

  const destinationMap: Record<string, { full: string, country: string, emoji: string, image: string }> = {
    'paris': {
      full: 'Paris, France',
      country: 'France',
      emoji: '🗼',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80'
    },
    'bali': {
      full: 'Bali, Indonesia',
      country: 'Indonesia',
      emoji: '🌴',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80'
    },
    'tokyo': {
      full: 'Tokyo, Japan',
      country: 'Japan',
      emoji: '🍣',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80'
    },
    'london': {
      full: 'London, United Kingdom',
      country: 'United Kingdom',
      emoji: '🇬🇧',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80'
    },
    'new york': {
      full: 'New York, USA',
      country: 'USA',
      emoji: '🗽',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80'
    },
    'rome': {
      full: 'Rome, Italy',
      country: 'Italy',
      emoji: '🍕',
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80'
    },
    'barcelona': {
      full: 'Barcelona, Spain',
      country: 'Spain',
      emoji: '💃',
      image: 'https://images.unsplash.com/photo-1583422409516-2895a77efedd?auto=format&fit=crop&w=600&q=80'
    },
    'kyoto': {
      full: 'Kyoto, Japan',
      country: 'Japan',
      emoji: '🌸',
      image: '/images/kyoto-hero.jpg'
    },
    'iceland': {
      full: 'Reykjavik, Iceland',
      country: 'Iceland',
      emoji: '❄️',
      image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80'
    }
  };

  const lowerMsg = message.toLowerCase();
  let matchedKey = Object.keys(destinationMap).find(key => lowerMsg.includes(key));
  let destData = matchedKey ? destinationMap[matchedKey] : null;

  if (!destData) {
    const cityMatch = message.match(/(?:plan|trip|go|visit|travel)\s+(?:a\s+trip\s+)?(?:to|in)\s+([^,for\d]+)/i);
    if (cityMatch && cityMatch[1].trim()) {
      const destination = cityMatch[1].trim().replace(/[.!?]+$/, '');
      const parts = destination.split(' ');
      const capitalized = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
      destData = {
        full: `${capitalized}, Explore`,
        country: 'Explore',
        emoji: '✈️',
        image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80'
      };
    } else {
      destData = destinationMap['paris'];
    }
  }

  // Extract travelers
  let travelers = 1;
  const travelerMatch = message.match(/(\d+)\s*(?:person|people|traveler|travelers|guest|guests)/i);
  if (travelerMatch) {
    travelers = parseInt(travelerMatch[1], 10);
  } else {
    if (lowerMsg.includes('for two') || lowerMsg.includes('two guests') || lowerMsg.includes('two people') || lowerMsg.includes('2 people')) {
      travelers = 2;
    }
  }

  // Extract duration
  let duration = 5;
  const durationMatch = message.match(/(\d+)\s*(?:day|days|night|nights)/i);
  if (durationMatch) {
    duration = parseInt(durationMatch[1], 10);
  }

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() + 14);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + duration);

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];
  const dates = { start: startStr, end: endStr };

  const baseBudget = 300 + Math.floor(Math.random() * 200);
  const budget = `$${(baseBudget * duration * travelers).toLocaleString()}`;

  const cards: CanvasCard[] = [
    {
      id: `card_${Date.now()}_1`,
      type: 'flight',
      x: 100,
      y: 100,
      rotation: -2,
      title: `Flight to ${destData.full.split(',')[0]}`,
      subtitle: 'Confirmed booking',
      price: travelers > 1 ? `$${(350 * travelers).toLocaleString()}` : '$350',
      day: 1,
      details: ['Departure SFO at 10:30 AM', 'Arrives Day 1 at 2:15 PM'],
    },
    {
      id: `card_${Date.now()}_2`,
      type: 'hotel',
      x: 400,
      y: 120,
      rotation: 3,
      title: 'Premium Boutique Hotel',
      subtitle: `${duration} nights stay`,
      price: `$${(150 * duration).toLocaleString()}`,
      rating: 4.8,
      day: 1,
      details: ['Check-in 3:00 PM', 'Free Wi-Fi & breakfast'],
    },
    {
      id: `card_${Date.now()}_3`,
      type: 'polaroid',
      x: 250,
      y: 350,
      rotation: -5,
      title: 'Must-See Local Sight',
      subtitle: 'Popular Attraction',
      image: destData.image,
      day: 2,
      details: ['Highly recommended morning visit', 'Pre-book tickets online'],
    }
  ];

  return {
    id: `trip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: `Trip to ${destData.full.split(',')[0]}`,
    destination: destData.full,
    emoji: destData.emoji,
    dates,
    createdAt: today.toISOString(),
    updatedAt: today.toISOString(),
    image: destData.image,
    country: destData.country,
    travelers,
    budget,
    activities: [`Sights in ${destData.full.split(',')[0]}`, 'Local Food Tour'],
    cards,
    connections: [],
    inboxItems: [],
    days: [],
    dayLabels: []
  };
}
