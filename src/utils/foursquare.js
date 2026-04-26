import axios from 'axios';

const FOURSQUARE_API_KEY = import.meta.env.VITE_FOURSQUARE_API_KEY;

export const searchPlaces = async (query) => {
  if (!query || query.length < 3) return [];
  
  try {
    console.log('Searching for:', query);
    const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=pk`, {
      headers: {
        'Accept-Language': 'en'
      }
    });

    if (!response.data || response.data.length === 0) {
      console.warn('No results from OSM, returning mock data.');
      return getMockData(query);
    }

    return response.data.map(place => ({
      id: place.place_id.toString(),
      name: place.display_name.split(',')[0],
      location: {
        formatted_address: place.display_name,
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lon),
      },
    }));
  } catch (error) {
    console.error('Search API Error:', error);
    return getMockData(query);
  }
};

const getMockData = (query) => [
  { id: 'mock-1', name: `${query} Center`, location: { formatted_address: `${query}, Karachi, Pakistan`, lat: 24.8607, lng: 67.0011 } },
  { id: 'mock-2', name: `Clinical Services - ${query}`, location: { formatted_address: `Phase 2, ${query}, Karachi`, lat: 24.8700, lng: 67.0100 } },
];
