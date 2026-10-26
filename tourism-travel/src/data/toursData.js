/**
 * Curated Cambodian Tour Packages Data
 */
export const TOURS_DATA = [
  {
    id: 'tour-1',
    title: 'Angkor Wat Sunrise & Sacred Grand Circuit',
    destination: 'Siem Reap',
    province: 'Siem Reap',
    duration: '3 Days / 2 Nights',
    durationDays: 3,
    price: 185,
    currency: 'USD',
    rating: 4.96,
    reviewsCount: 342,
    badge: 'Best Seller',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    description: 'Experience an unforgettable sunrise over the lotus ponds of Angkor Wat, followed by Bayon stone faces, Ta Prohm tree root ruins, and Banteay Srei pink sandstone carvings with a certified English-speaking Khmer historian.',
    highlights: [
      'Angkor Wat VIP sunrise access with photography guide',
      'Ta Prohm (Tomb Raider) overgrown jungle temple',
      'Bayon Temple 216 giant smiling stone faces',
      'Authentic Khmer banquet lunch in rural village',
      'AC private transportation & bottled chilled water'
    ],
    itinerary: [
      { day: 1, title: 'Sunrise Angkor Wat & Giant Smiling Bayon' },
      { day: 2, title: 'Ta Prohm, Banteay Srei & Preah Khan' },
      { day: 3, title: 'Tonle Sap Floating Village & Sunset Boat' }
    ],
    included: ['Certified Tour Guide', 'AC Minivan', 'Cold towels & water', 'Hotel pickup & drop-off'],
    groupSize: 'Max 10 guests',
    difficulty: 'Easy / Moderate Walking'
  },
  {
    id: 'tour-2',
    title: 'Phnom Penh Royal Heritage & Sunset Mekong Cruise',
    destination: 'Phnom Penh',
    province: 'Phnom Penh',
    duration: '2 Days / 1 Night',
    durationDays: 2,
    price: 120,
    currency: 'USD',
    rating: 4.89,
    reviewsCount: 198,
    badge: 'Cultural Immersion',
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
    description: 'Explore the grand architecture of the Royal Palace and Silver Pagoda, visit the National Museum, explore Russian Market crafts, and unwind on a traditional wooden boat cruising the junction of the Mekong and Tonle Sap rivers.',
    highlights: [
      'Royal Palace & Emerald Buddha Silver Pagoda',
      'National Museum of Cambodia ancient Angkor sculptures',
      'Central Market & Russian Market souvenir shopping',
      'Two-hour golden hour cruise on the Mekong river'
    ],
    itinerary: [
      { day: 1, title: 'Royal Palace, Silver Pagoda & Riverside Stroll' },
      { day: 2, title: 'National Museum, Markets & Sunset River Cruise' }
    ],
    included: ['Licensed City Guide', 'Private Tuk-Tuk / Van', 'All Entrance Fees', 'Cruise Refreshments'],
    groupSize: 'Max 8 guests',
    difficulty: 'Easy'
  },
  {
    id: 'tour-3',
    title: 'Koh Rong Secret Beach & Bioluminescent Plankton Explorer',
    destination: 'Koh Rong & Sanloem',
    province: 'Preah Sihanouk',
    duration: '3 Days / 2 Nights',
    durationDays: 3,
    price: 240,
    currency: 'USD',
    rating: 4.93,
    reviewsCount: 215,
    badge: 'Tropical Adventure',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    description: 'Escape to powdery white sand beaches and turquoise waters. Snorkel vibrant coral reefs, hike coastal rainforest trails, and swim at midnight among glowing blue bioluminescent plankton.',
    highlights: [
      'Long Set Beach & Sok San 7km private white sand bay',
      'Snorkeling boat trip to Koh Koun coral gardens',
      'Nighttime swimming with glowing blue bioluminescent plankton',
      'Seafood BBQ dinner on the beach with sunset views'
    ],
    itinerary: [
      { day: 1, title: 'Speed ferry to Koh Rong & Beachfront Bungalow check-in' },
      { day: 2, title: 'Coral Reef Snorkeling & Night Plankton Swimming' },
      { day: 3, title: 'Jungle Walk to Lonely Beach & Return Speedboat' }
    ],
    included: ['Roundtrip Speed Ferry', 'Snorkel Gear', 'Plankton Boat', 'Beach BBQ Dinner'],
    groupSize: 'Max 12 guests',
    difficulty: 'Moderate Swimming'
  },
  {
    id: 'tour-4',
    title: 'Kampot Pepper Heritage, Salt Fields & Bokor Cloud Summit',
    destination: 'Kampot & Kep',
    province: 'Kampot',
    duration: '2 Days / 1 Night',
    durationDays: 2,
    price: 95,
    currency: 'USD',
    rating: 4.88,
    reviewsCount: 164,
    badge: 'Eco & Culinary',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    description: 'Taste the worlds finest certified Kampot organic pepper at La Plantation, journey up the misty slopes of Mount Bokor National Park, and taste fresh blue crab steamed with green peppercorns at Keps famous Crab Market.',
    highlights: [
      'Organic pepper tasting and farm walking tour',
      'Historic abandoned French casino atop misty Mount Bokor',
      'Keps Crab Market authentic seafood tasting',
      'Sunset kayak on the tranquil Green Cathedral river loop'
    ],
    itinerary: [
      { day: 1, title: 'Kampot River, Salt Fields & Organic Pepper Farm' },
      { day: 2, title: 'Bokor National Park Summit & Kep Crab Market' }
    ],
    included: ['Local Culinary Guide', 'Pepper Farm Tasting Tour', 'Park Entry Fees', 'Kayak Rental'],
    groupSize: 'Max 10 guests',
    difficulty: 'Easy'
  },
  {
    id: 'tour-5',
    title: 'Cardamom Mountain Wilderness & Wildlife Eco-Trek',
    destination: 'Cardamom Rainforest',
    province: 'Koh Kong',
    duration: '4 Days / 3 Nights',
    durationDays: 4,
    price: 310,
    currency: 'USD',
    rating: 4.97,
    reviewsCount: 128,
    badge: 'Eco Trekking',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    description: 'Immerse yourself into Southeast Asias largest remaining rainforest. Trek with local wildlife rangers, kayak through dense mangrove canopies, camp by pristine waterfalls, and support local community conservation.',
    highlights: [
      'Ranger-guided rainforest tracking for gibbons & hornbills',
      'Tatai River kayak expedition & hidden waterfalls',
      'Overnight in eco-lodges and luxury wilderness canvas tents',
      'Direct contribution to community forest protection'
    ],
    itinerary: [
      { day: 1, title: 'Journey to Koh Kong & Tatai River Boat Arrival' },
      { day: 2, title: 'Deep Jungle Trekking & Wildlife Habitat Study' },
      { day: 3, title: 'Tatai Waterfall Kayak & Community Village Homestay' },
      { day: 4, title: 'Morning Birdwatching & Scenic Return Transfer' }
    ],
    included: ['Wilderness Rangers', 'Camping & Lodge Accommodations', 'All Organic Meals', 'Kayak Equipment'],
    groupSize: 'Max 8 guests',
    difficulty: 'Moderate / Active Trekking'
  },
  {
    id: 'tour-6',
    title: 'Mondulkiri Elephant Valley Sanctuary & Waterfalls',
    destination: 'Sen Monorom',
    province: 'Mondulkiri',
    duration: '3 Days / 2 Nights',
    durationDays: 3,
    price: 260,
    currency: 'USD',
    rating: 4.98,
    reviewsCount: 184,
    badge: 'Ethical Sanctuary',
    image: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
    description: 'Walk alongside rescued Asian elephants roaming freely in their natural jungle sanctuary with no riding permitted. Visit the thunderous Bousra twin waterfalls, coffee plantations, and Bunong indigenous villages.',
    highlights: [
      '100% ethical elephant sanctuary observation walk',
      'Bathing and river crossing observation with wild elephants',
      'Spectacular double-tier Bousra Waterfall swimming',
      'Bunong indigenous cultural exchange & coffee plantation tasting'
    ],
    itinerary: [
      { day: 1, title: 'Arrive Sen Monorom & Pine Forest Sunset Viewpoint' },
      { day: 2, title: 'Full Day Ethical Elephant Valley Forest Walk' },
      { day: 3, title: 'Bousra Waterfall & Highland Coffee Tasting' }
    ],
    included: ['Sanctuary Donation', 'Indigenous Guide', 'All Meals', 'Eco Bungalow Stay'],
    groupSize: 'Max 10 guests',
    difficulty: 'Moderate Walking'
  }
];
