import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

/**
 * Comprehensive Pan-India Agricultural Cities & Mandi Hubs Database
 * Covers all major Indian States with geographic coordinates, agro-climatic zones, and crop specializations.
 */
export const INDIAN_CITIES_DATABASE = [
  // Uttar Pradesh
  { city: 'Meerut', state: 'Uttar Pradesh', district: 'Meerut', agroZone: 'Upper Gangetic Plain (Zone V)', latitude: 28.9845, longitude: 77.7064, mandiHub: 'Meerut Mandi (Sardhana Road)', majorCrops: ['Wheat', 'Sugarcane', 'Mustard', 'Tomato'] },
  { city: 'Varanasi', state: 'Uttar Pradesh', district: 'Varanasi', agroZone: 'Middle Gangetic Plain (Zone IV)', latitude: 25.3176, longitude: 82.9739, mandiHub: 'Varanasi Mandi Samiti', majorCrops: ['Paddy', 'Wheat', 'Vegetables', 'Pulses'] },
  { city: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow', agroZone: 'Central Alluvial Plain', latitude: 26.8467, longitude: 80.9462, mandiHub: 'Dubagga Mandi Lucknow', majorCrops: ['Mango', 'Wheat', 'Mustard', 'Paddy'] },
  { city: 'Agra', state: 'Uttar Pradesh', district: 'Agra', agroZone: 'South-Western Semi-Arid Zone', latitude: 27.1767, longitude: 78.0081, mandiHub: 'Agra Mandi Samiti', majorCrops: ['Potato', 'Mustard', 'Wheat', 'Bajra'] },
  { city: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar', agroZone: 'Central Plain Zone', latitude: 26.4499, longitude: 80.3319, mandiHub: 'Chakeri Mandi Kanpur', majorCrops: ['Wheat', 'Pulses', 'Oilseeds', 'Potato'] },
  { city: 'Bareilly', state: 'Uttar Pradesh', district: 'Bareilly', agroZone: 'Rohilkhand Tarai Belt', latitude: 28.3670, longitude: 79.4304, mandiHub: 'Bareilly Grain Mandi', majorCrops: ['Sugarcane', 'Paddy', 'Wheat', 'Mentha'] },
  { city: 'Prayagraj', state: 'Uttar Pradesh', district: 'Prayagraj', agroZone: 'Middle Gangetic Plain', latitude: 25.4358, longitude: 81.8463, mandiHub: 'Mundera Mandi Prayagraj', majorCrops: ['Guava', 'Wheat', 'Paddy', 'Pulses'] },
  { city: 'Gorakhpur', state: 'Uttar Pradesh', district: 'Gorakhpur', agroZone: 'North Eastern Plain Zone', latitude: 26.7606, longitude: 83.3732, mandiHub: 'Gorakhpur Krishi Mandi', majorCrops: ['Paddy', 'Sugarcane', 'Wheat', 'Maize'] },

  // Gujarat
  { city: 'Anand', state: 'Gujarat', district: 'Anand', agroZone: 'Western Plain Zone (Zone XIII)', latitude: 22.5645, longitude: 72.9289, mandiHub: 'Anand APMC Market Yard', majorCrops: ['Tobacco', 'Wheat', 'Banana', 'Vegetables'] },
  { city: 'Surat', state: 'Gujarat', district: 'Surat', agroZone: 'South Gujarat Heavy Rainfall Zone', latitude: 21.1702, longitude: 72.8311, mandiHub: 'Surat APMC Mandi', majorCrops: ['Sugarcane', 'Paddy', 'Banana', 'Mango'] },
  { city: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad', agroZone: 'North Gujarat Plain Zone', latitude: 23.0225, longitude: 72.5714, mandiHub: 'Ahmedabad APMC Jamalpur', majorCrops: ['Cotton', 'Wheat', 'Castor', 'Vegetables'] },
  { city: 'Rajkot', state: 'Gujarat', district: 'Rajkot', agroZone: 'Saurashtra Dry Farming Belt', latitude: 22.3039, longitude: 70.8022, mandiHub: 'Bedi Yard APMC Rajkot', majorCrops: ['Groundnut', 'Cotton', 'Cumin', 'Sesame'] },
  { city: 'Vadodara', state: 'Gujarat', district: 'Vadodara', agroZone: 'Middle Gujarat Alluvial Zone', latitude: 22.3072, longitude: 73.1812, mandiHub: 'Sayajipura APMC Yard', majorCrops: ['Cotton', 'Paddy', 'Banana', 'Pulses'] },
  { city: 'Junagadh', state: 'Gujarat', district: 'Junagadh', agroZone: 'South Saurashtra Zone', latitude: 21.5222, longitude: 70.4579, mandiHub: 'Junagadh APMC Yard', majorCrops: ['Kesar Mango', 'Groundnut', 'Coriander'] },

  // Punjab
  { city: 'Ludhiana', state: 'Punjab', district: 'Ludhiana', agroZone: 'Trans-Gangetic Plain (Zone VI)', latitude: 30.9010, longitude: 75.8573, mandiHub: 'Ludhiana Dana Mandi (PAU)', majorCrops: ['Wheat (HD-3226)', 'Basmati Paddy', 'Maize'] },
  { city: 'Khanna', state: 'Punjab', district: 'Ludhiana', agroZone: 'Trans-Gangetic Plain (Zone VI)', latitude: 30.7068, longitude: 76.2166, mandiHub: "Khanna Grain Market (Asia's Largest)", majorCrops: ['Wheat', 'Paddy', 'Cotton'] },
  { city: 'Amritsar', state: 'Punjab', district: 'Amritsar', agroZone: 'Upper Bari Doab Zone', latitude: 31.6340, longitude: 74.8723, mandiHub: 'Bhagtanwala Dana Mandi', majorCrops: ['Basmati Rice', 'Wheat', 'Vegetables'] },
  { city: 'Jalandhar', state: 'Punjab', district: 'Jalandhar', agroZone: 'Central Plain Zone', latitude: 31.3260, longitude: 75.5762, mandiHub: 'Jalandhar Maqsudan Mandi', majorCrops: ['Potato Seed', 'Paddy', 'Wheat', 'Sunflower'] },
  { city: 'Patiala', state: 'Punjab', district: 'Patiala', agroZone: 'Southern Plain Zone', latitude: 30.3398, longitude: 76.3869, mandiHub: 'Patiala Dana Mandi', majorCrops: ['Wheat', 'Paddy', 'Mustard', 'Barley'] },
  { city: 'Bathinda', state: 'Punjab', district: 'Bathinda', agroZone: 'South-Western Arid Belt', latitude: 30.2110, longitude: 74.9455, mandiHub: 'Bathinda Cotton & Grain Market', majorCrops: ['Bt Cotton', 'Wheat', 'Mustard', 'Guar'] },

  // Maharashtra
  { city: 'Pune', state: 'Maharashtra', district: 'Pune', agroZone: 'Western Ghats & Sub-Montane Zone', latitude: 18.5204, longitude: 73.8567, mandiHub: 'Market Yard Gultekdi Pune', majorCrops: ['Sugarcane', 'Onion', 'Pomegranate', 'Soybean'] },
  { city: 'Nashik', state: 'Maharashtra', district: 'Nashik', agroZone: 'Western Plateau & Hills (Zone IX)', latitude: 19.9975, longitude: 73.7898, mandiHub: 'Pimpalgaon & Lasalgaon Mandi', majorCrops: ['Table Grapes', 'Onion', 'Tomato', 'Maize'] },
  { city: 'Nagpur', state: 'Maharashtra', district: 'Nagpur', agroZone: 'Eastern Vidarbha Zone', latitude: 21.1458, longitude: 79.0882, mandiHub: 'Kalamna Mandi Nagpur', majorCrops: ['Nagpur Orange', 'Cotton', 'Soybean', 'Pigeon Pea'] },
  { city: 'Kolhapur', state: 'Maharashtra', district: 'Kolhapur', agroZone: 'South Western Sub-Montane', latitude: 16.7050, longitude: 74.2433, mandiHub: 'Shahupuri Market Yard', majorCrops: ['Sugarcane', 'Jaggery', 'Paddy', 'Soybean'] },
  { city: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', district: 'Aurangabad', agroZone: 'Marathwada Dry Plateau', latitude: 19.8762, longitude: 75.3433, mandiHub: 'Jadhavwadi APMC Mandi', majorCrops: ['Cotton', 'Sweet Lime (Mosambi)', 'Bajra'] },

  // Haryana
  { city: 'Karnal', state: 'Haryana', district: 'Karnal', agroZone: 'Trans-Gangetic Plain (Zone VI)', latitude: 29.6857, longitude: 76.9905, mandiHub: 'New Grain Market Karnal', majorCrops: ['Basmati Rice', 'Wheat', 'Sugarcane', 'Dairy'] },
  { city: 'Hisar', state: 'Haryana', district: 'Hisar', agroZone: 'Western Semi-Arid Zone', latitude: 29.1492, longitude: 75.7217, mandiHub: 'Hisar Anaj Mandi', majorCrops: ['Cotton', 'Mustard', 'Wheat', 'Pearl Millet'] },
  { city: 'Rohtak', state: 'Haryana', district: 'Rohtak', agroZone: 'Central Plain Zone', latitude: 28.8955, longitude: 76.6066, mandiHub: 'Rohtak Grain Market', majorCrops: ['Wheat', 'Bajra', 'Sugarcane', 'Paddy'] },

  // Madhya Pradesh
  { city: 'Indore', state: 'Madhya Pradesh', district: 'Indore', agroZone: 'Malwa Plateau & Hills (Zone VIII)', latitude: 22.7196, longitude: 75.8577, mandiHub: 'Choithram Mandi Indore', majorCrops: ['Soybean', 'Sharbati Wheat', 'Potato', 'Garlic'] },
  { city: 'Bhopal', state: 'Madhya Pradesh', district: 'Bhopal', agroZone: 'Central Vindhya Basin', latitude: 23.2599, longitude: 77.4126, mandiHub: 'Karond Krishi Mandi Bhopal', majorCrops: ['Wheat', 'Gram (Chana)', 'Soybean'] },
  { city: 'Ujjain', state: 'Madhya Pradesh', district: 'Ujjain', agroZone: 'Malwa Plateau Zone', latitude: 23.1765, longitude: 75.7885, mandiHub: 'Chimanganj Mandi Ujjain', majorCrops: ['Soybean', 'Wheat', 'Chickpea', 'Garlic'] },

  // Rajasthan
  { city: 'Jaipur', state: 'Rajasthan', district: 'Jaipur', agroZone: 'Semi-Arid Eastern Plain', latitude: 26.9124, longitude: 75.7873, mandiHub: 'Muhana Mandi Jaipur', majorCrops: ['Mustard', 'Bajra', 'Barley', 'Vegetables'] },
  { city: 'Jodhpur', state: 'Rajasthan', district: 'Jodhpur', agroZone: 'Arid Western Zone (Zone XIV)', latitude: 26.2389, longitude: 73.0243, mandiHub: 'Basni Mandi Jodhpur', majorCrops: ['Cumin (Jeera)', 'Guar', 'Moth Bean', 'Bajra'] },
  { city: 'Kota', state: 'Rajasthan', district: 'Kota', agroZone: 'Humid South-Eastern Plain', latitude: 25.2138, longitude: 75.8648, mandiHub: 'Bhamashah Mandi Kota', majorCrops: ['Soybean', 'Wheat', 'Mustard', 'Coriander'] },

  // Karnataka
  { city: 'Belagavi', state: 'Karnataka', district: 'Belagavi', agroZone: 'Northern Transition Zone (Zone X)', latitude: 15.8497, longitude: 74.4977, mandiHub: 'Belagavi APMC Yard', majorCrops: ['Sugarcane', 'Maize', 'Soybean', 'Vegetables'] },
  { city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', agroZone: 'Eastern Dry Zone', latitude: 12.9716, longitude: 77.5946, mandiHub: 'Yeshwanthpur APMC Yard', majorCrops: ['Ragi (Finger Millet)', 'Horticulture', 'Vegetables'] },
  { city: 'Mysuru', state: 'Karnataka', district: 'Mysuru', agroZone: 'Southern Dry Zone', latitude: 12.2958, longitude: 76.6394, mandiHub: 'Bandipalya APMC Mysuru', majorCrops: ['Paddy', 'Ragi', 'Sugarcane', 'Cotton'] },

  // Tamil Nadu
  { city: 'Coimbatore', state: 'Tamil Nadu', district: 'Coimbatore', agroZone: 'Western Agro-Zone (TNAU)', latitude: 11.0168, longitude: 76.9558, mandiHub: 'MGR Wholesale Market Coimbatore', majorCrops: ['Coconut', 'Tomato', 'Turmeric', 'Poultry'] },
  { city: 'Thanjavur', state: 'Tamil Nadu', district: 'Thanjavur', agroZone: 'Cauvery Delta Rice Bowl', latitude: 10.7870, longitude: 79.1378, mandiHub: 'Thanjavur Regulated Market', majorCrops: ['Paddy (Kuruvai/Samba)', 'Pulses', 'Coconut'] },
  { city: 'Madurai', state: 'Tamil Nadu', district: 'Madurai', agroZone: 'Southern Dry Zone', latitude: 9.9252, longitude: 78.1198, mandiHub: 'Mattuthavani Central Market', majorCrops: ['Jasmine', 'Paddy', 'Banana', 'Millets'] },

  // Andhra Pradesh & Telangana
  { city: 'Guntur', state: 'Andhra Pradesh', district: 'Guntur', agroZone: 'Krishna-Godavari Coastal Zone', latitude: 16.3067, longitude: 80.4365, mandiHub: "Guntur Mirchi Yard (Asia's Largest)", majorCrops: ['Red Chilli', 'Cotton', 'Tobacco', 'Paddy'] },
  { city: 'Vijayawada', state: 'Andhra Pradesh', district: 'NTR', agroZone: 'Krishna Delta Basin', latitude: 16.5062, longitude: 80.6480, mandiHub: 'Gollapudi Wholesale Market', majorCrops: ['Paddy', 'Mango', 'Sugarcane', 'Pulses'] },
  { city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', agroZone: 'Southern Telangana Agro-Zone', latitude: 17.3850, longitude: 78.4867, mandiHub: 'Bowenpally Agricultural Market', majorCrops: ['Vegetables', 'Paddy', 'Cotton', 'Maize'] },
  { city: 'Warangal', state: 'Telangana', district: 'Warangal', agroZone: 'Central Telangana Zone', latitude: 17.9689, longitude: 79.5941, mandiHub: 'Enumamula Krishi Market Warangal', majorCrops: ['Cotton', 'Red Chilli', 'Paddy', 'Turmeric'] },

  // West Bengal & Bihar
  { city: 'Burdwan', state: 'West Bengal', district: 'Purba Bardhaman', agroZone: 'Lower Gangetic Plain (Zone III)', latitude: 23.2324, longitude: 87.8615, mandiHub: 'Burdwan Rice & Produce Mandi', majorCrops: ['Aman Rice', 'Potato', 'Jute', 'Mustard'] },
  { city: 'Kolkata', state: 'West Bengal', district: 'Kolkata', agroZone: 'Deltaic Alluvium', latitude: 22.5726, longitude: 88.3639, mandiHub: 'Posta Bazar Wholesale Market', majorCrops: ['Paddy', 'Vegetables', 'Betel Vine', 'Jute'] },
  { city: 'Patna', state: 'Bihar', district: 'Patna', agroZone: 'South Bihar Alluvial Plain (Zone IV)', latitude: 25.5941, longitude: 85.1376, mandiHub: 'Bazar Samiti Mandi Patna', majorCrops: ['Paddy', 'Wheat', 'Maize', 'Vegetables'] },
  { city: 'Muzaffarpur', state: 'Bihar', district: 'Muzaffarpur', agroZone: 'North West Alluvial Plain', latitude: 26.1209, longitude: 85.3647, mandiHub: 'Brahmapura Krishi Mandi', majorCrops: ['Shahi Litchi', 'Maize', 'Paddy', 'Tobacco'] },

  // Kerala
  { city: 'Wayanad', state: 'Kerala', district: 'Wayanad', agroZone: 'High Altitude Agro-Zone (Zone XII)', latitude: 11.6854, longitude: 76.1320, mandiHub: 'Kalpetta Spices & Produce Yard', majorCrops: ['Black Pepper', 'Coffee', 'Cardamom', 'Tea'] },
  { city: 'Palakkad', state: 'Kerala', district: 'Palakkad', agroZone: 'Palakkad Gap Central Plains', latitude: 10.7867, longitude: 76.6548, mandiHub: 'Palakkad Regulated Market', majorCrops: ['Paddy', 'Banana', 'Coconut', 'Sugarcane'] },

  // Odisha
  { city: 'Bhubaneswar', state: 'Odisha', district: 'Khurda', agroZone: 'East Coast Coastal Plain', latitude: 20.2961, longitude: 85.8245, mandiHub: 'Unit-1 Central Haat Market', majorCrops: ['Paddy', 'Pulses', 'Oilseeds', 'Vegetables'] },
  { city: 'Sambalpur', state: 'Odisha', district: 'Sambalpur', agroZone: 'Western Undulating Agro-Zone', latitude: 21.4669, longitude: 83.9812, mandiHub: 'Khetrajpur RMC Mandi', majorCrops: ['Paddy (Hirakud Command)', 'Vegetables'] }
];

export const INDIAN_AGRI_REGIONS = INDIAN_CITIES_DATABASE;

// Extract sorted list of Indian states
export const INDIAN_STATES = Array.from(new Set(INDIAN_CITIES_DATABASE.map(c => c.state))).sort();

/**
 * Projects real GPS coordinates (Latitude/Longitude) onto the SVG India Map ViewBox (0 0 420 440)
 */
export function latLonToMapCoords(lat, lon) {
  // Bounding box for India
  const minLat = 8.0;
  const maxLat = 36.0;
  const minLon = 68.0;
  const maxLon = 97.0;

  const clampLat = Math.max(minLat, Math.min(maxLat, lat));
  const clampLon = Math.max(minLon, Math.min(maxLon, lon));

  // Map to SVG coordinates: width 420, height 440
  const x = Math.round(((clampLon - minLon) / (maxLon - minLon)) * 320 + 48);
  const y = Math.round(((maxLat - clampLat) / (maxLat - minLat)) * 360 + 36);

  return { x, y };
}

const LocationContext = createContext();

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('agriwise_user_location');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Default specifically to Meerut, Uttar Pradesh per user preference
    return {
      city: 'Meerut',
      state: 'Uttar Pradesh',
      district: 'Meerut',
      agroZone: 'Upper Gangetic Plain (Zone V)',
      latitude: 28.9845,
      longitude: 77.7064,
      isGps: false,
      mandiHub: 'Meerut Mandi (Sardhana Road)',
      address: 'Meerut, Uttar Pradesh (Upper Gangetic Plain)'
    };
  });

  const [detecting, setDetecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedState, setSelectedState] = useState(location.state || 'Uttar Pradesh');

  useEffect(() => {
    try {
      localStorage.setItem('agriwise_user_location', JSON.stringify(location));
    } catch {
      // ignore
    }
  }, [location]);

  // Find closest pre-configured agro region to given coordinates
  const findClosestRegion = (lat, lon) => {
    let closest = INDIAN_CITIES_DATABASE[0];
    let minDistance = Infinity;

    for (const reg of INDIAN_CITIES_DATABASE) {
      const d = Math.sqrt(Math.pow(reg.latitude - lat, 2) + Math.pow(reg.longitude - lon, 2));
      if (d < minDistance) {
        minDistance = d;
        closest = reg;
      }
    }
    return closest;
  };

  // Instant live search across all Indian cities, districts, states & mandis
  const searchIndianLocations = (query) => {
    if (!query || !query.trim()) return INDIAN_CITIES_DATABASE.slice(0, 10);
    const q = query.toLowerCase().trim();
    return INDIAN_CITIES_DATABASE.filter(item => 
      item.city.toLowerCase().includes(q) ||
      item.state.toLowerCase().includes(q) ||
      item.district.toLowerCase().includes(q) ||
      item.mandiHub.toLowerCase().includes(q) ||
      (item.agroZone && item.agroZone.toLowerCase().includes(q))
    );
  };

  // Filter cities by state
  const citiesInSelectedState = useMemo(() => {
    return INDIAN_CITIES_DATABASE.filter(c => c.state === selectedState);
  }, [selectedState]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('GPS geolocation is not supported by your browser.');
      return;
    }

    setDetecting(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lon = parseFloat(pos.coords.longitude.toFixed(4));
        const closest = findClosestRegion(lat, lon);

        const newLoc = {
          city: closest.city,
          state: closest.state,
          district: closest.district,
          agroZone: closest.agroZone,
          latitude: lat,
          longitude: lon,
          isGps: true,
          mandiHub: closest.mandiHub,
          address: `${closest.city}, ${closest.state} (${lat}° N, ${lon}° E)`
        };

        setLocation(newLoc);
        setSelectedState(closest.state);
        setDetecting(false);
      },
      (err) => {
        setDetecting(false);
        let msg = 'Could not retrieve GPS location.';
        if (err.code === 1) msg = 'Location access was not granted. Please select your Indian state & city from the dropdown.';
        else if (err.code === 2) msg = 'Location unavailable. Showing selected regional hub.';
        else if (err.code === 3) msg = 'Location request timed out.';
        setErrorMsg(msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const setManualRegion = (regionObj) => {
    setLocation({
      city: regionObj.city || regionObj.district,
      state: regionObj.state,
      district: regionObj.district,
      agroZone: regionObj.agroZone,
      latitude: regionObj.latitude,
      longitude: regionObj.longitude,
      isGps: false,
      mandiHub: regionObj.mandiHub || `${regionObj.city || regionObj.district} APMC Mandi`,
      address: `${regionObj.city || regionObj.district}, ${regionObj.state} (${regionObj.agroZone})`
    });
    setSelectedState(regionObj.state);
    setErrorMsg(null);
    setShowLocationModal(false);
  };

  const handleStateChange = (stateName) => {
    setSelectedState(stateName);
    const firstCity = INDIAN_CITIES_DATABASE.find(c => c.state === stateName);
    if (firstCity) {
      setManualRegion(firstCity);
    }
  };

  const handleCityChange = (cityName) => {
    const found = INDIAN_CITIES_DATABASE.find(c => c.state === selectedState && c.city === cityName);
    if (found) {
      setManualRegion(found);
    }
  };

  return (
    <LocationContext.Provider value={{
      location,
      detecting,
      errorMsg,
      detectLocation,
      setManualRegion,
      showLocationModal,
      setShowLocationModal,
      availableRegions: INDIAN_CITIES_DATABASE,
      statesList: INDIAN_STATES,
      selectedState,
      setSelectedState,
      citiesInSelectedState,
      handleStateChange,
      handleCityChange,
      searchIndianLocations,
      latLonToMapCoords
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
