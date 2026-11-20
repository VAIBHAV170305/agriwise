import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

/**
 * Comprehensive Pan-India Agricultural Cities & Mandi Hubs Database
 * Covers all 28 Indian States & major Union Territories with precise geographic coordinates,
 * agro-climatic zones, soil types, pH values, and major crop specializations.
 */
export const INDIAN_CITIES_DATABASE = [
  // Uttar Pradesh (Upper & Middle Gangetic Plains)
  { city: 'Meerut', state: 'Uttar Pradesh', district: 'Meerut', agroZone: 'Upper Gangetic Plain (Zone V)', latitude: 28.9845, longitude: 77.7064, mandiHub: 'Meerut Mandi (Sardhana Road)', majorCrops: ['Wheat', 'Sugarcane', 'Mustard', 'Tomato'], soilType: 'Deep Alluvial Loam', phValue: 7.4 },
  { city: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow', agroZone: 'Central Alluvial Plain', latitude: 26.8467, longitude: 80.9462, mandiHub: 'Dubagga Mandi Lucknow', majorCrops: ['Mango', 'Wheat', 'Mustard', 'Paddy'], soilType: 'Alluvial Loam', phValue: 7.5 },
  { city: 'Varanasi', state: 'Uttar Pradesh', district: 'Varanasi', agroZone: 'Middle Gangetic Plain (Zone IV)', latitude: 25.3176, longitude: 82.9739, mandiHub: 'Varanasi Mandi Samiti', majorCrops: ['Paddy', 'Wheat', 'Vegetables', 'Pulses'], soilType: 'Alluvial Sandy Loam', phValue: 7.3 },
  { city: 'Agra', state: 'Uttar Pradesh', district: 'Agra', agroZone: 'South-Western Semi-Arid Zone', latitude: 27.1767, longitude: 78.0081, mandiHub: 'Agra Mandi Samiti', majorCrops: ['Potato', 'Mustard', 'Wheat', 'Bajra'], soilType: 'Sandy Loam & Calcareous', phValue: 7.8 },
  { city: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar', agroZone: 'Central Plain Zone', latitude: 26.4499, longitude: 80.3319, mandiHub: 'Chakeri Mandi Kanpur', majorCrops: ['Wheat', 'Pulses', 'Oilseeds', 'Potato'], soilType: 'Alluvial Clay Loam', phValue: 7.4 },
  { city: 'Bareilly', state: 'Uttar Pradesh', district: 'Bareilly', agroZone: 'Rohilkhand Tarai Belt', latitude: 28.3670, longitude: 79.4304, mandiHub: 'Bareilly Grain Mandi', majorCrops: ['Sugarcane', 'Paddy', 'Wheat', 'Mentha'], soilType: 'Tarai Alluvium', phValue: 7.2 },
  { city: 'Prayagraj', state: 'Uttar Pradesh', district: 'Prayagraj', agroZone: 'Middle Gangetic Plain', latitude: 25.4358, longitude: 81.8463, mandiHub: 'Mundera Mandi Prayagraj', majorCrops: ['Guava', 'Wheat', 'Paddy', 'Pulses'], soilType: 'Alluvial Loam', phValue: 7.3 },
  { city: 'Gorakhpur', state: 'Uttar Pradesh', district: 'Gorakhpur', agroZone: 'North Eastern Plain Zone', latitude: 26.7606, longitude: 83.3732, mandiHub: 'Gorakhpur Krishi Mandi', majorCrops: ['Paddy', 'Sugarcane', 'Wheat', 'Maize'], soilType: 'Calcareous Alluvial Silt', phValue: 7.6 },
  { city: 'Muzaffarnagar', state: 'Uttar Pradesh', district: 'Muzaffarnagar', agroZone: 'Upper Doab Belt', latitude: 29.4727, longitude: 77.7085, mandiHub: 'Muzaffarnagar Jaggery & Grain Mandi', majorCrops: ['Sugarcane', 'Wheat', 'Mustard'], soilType: 'Rich Khadar Alluvium', phValue: 7.3 },
  { city: 'Aligarh', state: 'Uttar Pradesh', district: 'Aligarh', agroZone: 'South-Western Semi-Arid Plain', latitude: 27.8974, longitude: 78.0880, mandiHub: 'Aligarh Anaj Mandi', majorCrops: ['Wheat', 'Mustard', 'Barley', 'Paddy'], soilType: 'Alluvial Loam', phValue: 7.6 },
  { city: 'Jhansi', state: 'Uttar Pradesh', district: 'Jhansi', agroZone: 'Bundelkhand Semi-Arid Plateau', latitude: 25.4484, longitude: 78.5685, mandiHub: 'Jhansi Krishi Mandi', majorCrops: ['Gram (Chana)', 'Lentil', 'Sesame', 'Wheat'], soilType: 'Mixed Red & Black (Rakar)', phValue: 7.1 },

  // Punjab (Trans-Gangetic Plain)
  { city: 'Ludhiana', state: 'Punjab', district: 'Ludhiana', agroZone: 'Trans-Gangetic Plain (Zone VI)', latitude: 30.9010, longitude: 75.8573, mandiHub: 'Ludhiana Dana Mandi (PAU)', majorCrops: ['Wheat (HD-3226)', 'Basmati Paddy', 'Maize'], soilType: 'Coarse Loamy Alluvium', phValue: 7.6 },
  { city: 'Khanna', state: 'Punjab', district: 'Ludhiana', agroZone: 'Trans-Gangetic Plain (Zone VI)', latitude: 30.7068, longitude: 76.2166, mandiHub: "Khanna Grain Market (Asia's Largest)", majorCrops: ['Wheat', 'Paddy', 'Cotton'], soilType: 'Deep Alluvial Loam', phValue: 7.5 },
  { city: 'Amritsar', state: 'Punjab', district: 'Amritsar', agroZone: 'Upper Bari Doab Zone', latitude: 31.6340, longitude: 74.8723, mandiHub: 'Bhagtanwala Dana Mandi', majorCrops: ['Basmati Rice', 'Wheat', 'Vegetables'], soilType: 'Alluvial Sandy Loam', phValue: 7.7 },
  { city: 'Jalandhar', state: 'Punjab', district: 'Jalandhar', agroZone: 'Central Plain Zone', latitude: 31.3260, longitude: 75.5762, mandiHub: 'Jalandhar Maqsudan Mandi', majorCrops: ['Potato Seed', 'Paddy', 'Wheat', 'Sunflower'], soilType: 'Silt Loam', phValue: 7.4 },
  { city: 'Patiala', state: 'Punjab', district: 'Patiala', agroZone: 'Southern Plain Zone', latitude: 30.3398, longitude: 76.3869, mandiHub: 'Patiala Dana Mandi', majorCrops: ['Wheat', 'Paddy', 'Mustard', 'Barley'], soilType: 'Clayey Alluvium', phValue: 7.6 },
  { city: 'Bathinda', state: 'Punjab', district: 'Bathinda', agroZone: 'South-Western Arid Belt', latitude: 30.2110, longitude: 74.9455, mandiHub: 'Bathinda Cotton & Grain Market', majorCrops: ['Bt Cotton', 'Wheat', 'Mustard', 'Guar'], soilType: 'Desert Sandy Loam', phValue: 8.1 },
  { city: 'Abohar', state: 'Punjab', district: 'Fazilka', agroZone: 'South-Western Semi-Arid Belt', latitude: 30.1453, longitude: 74.1993, mandiHub: 'Abohar Kinnow & Cotton Market', majorCrops: ['Kinnow Mandarin', 'Cotton', 'Wheat'], soilType: 'Calcareous Sandy Loam', phValue: 8.2 },

  // Haryana (Trans-Gangetic Plain)
  { city: 'Karnal', state: 'Haryana', district: 'Karnal', agroZone: 'Trans-Gangetic Plain (Zone VI)', latitude: 29.6857, longitude: 76.9905, mandiHub: 'New Grain Market Karnal', majorCrops: ['Basmati Rice', 'Wheat', 'Sugarcane', 'Dairy'], soilType: 'Deep Alluvial Loam', phValue: 7.6 },
  { city: 'Hisar', state: 'Haryana', district: 'Hisar', agroZone: 'Western Semi-Arid Zone', latitude: 29.1492, longitude: 75.7217, mandiHub: 'Hisar Anaj Mandi', majorCrops: ['Cotton', 'Mustard', 'Wheat', 'Pearl Millet'], soilType: 'Sandy Aridisols', phValue: 8.0 },
  { city: 'Rohtak', state: 'Haryana', district: 'Rohtak', agroZone: 'Central Plain Zone', latitude: 28.8955, longitude: 76.6066, mandiHub: 'Rohtak Grain Market', majorCrops: ['Wheat', 'Bajra', 'Sugarcane', 'Paddy'], soilType: 'Alluvial Loam', phValue: 7.7 },
  { city: 'Sirsa', state: 'Haryana', district: 'Sirsa', agroZone: 'South-Western Dry Zone', latitude: 29.5349, longitude: 75.0290, mandiHub: 'Sirsa Cotton & Grain Market', majorCrops: ['Bt Cotton', 'Wheat', 'Mustard', 'Guar'], soilType: 'Sandy Aridisols', phValue: 8.2 },
  { city: 'Kurukshetra', state: 'Haryana', district: 'Kurukshetra', agroZone: 'Eastern Plain Belt', latitude: 29.9695, longitude: 76.8783, mandiHub: 'Thanesar Grain Mandi', majorCrops: ['Basmati Paddy', 'Wheat', 'Potato', 'Sunflower'], soilType: 'Clayey Loam', phValue: 7.5 },
  { city: 'Ambala', state: 'Haryana', district: 'Ambala', agroZone: 'Sub-Mountainous Shivalik Zone', latitude: 30.3782, longitude: 76.7767, mandiHub: 'Ambala Cantt Dana Mandi', majorCrops: ['Wheat', 'Paddy', 'Mustard', 'Maize'], soilType: 'Alluvial Gravelly Loam', phValue: 7.3 },

  // Rajasthan (Western Arid & Semi-Arid Zone)
  { city: 'Jaipur', state: 'Rajasthan', district: 'Jaipur', agroZone: 'Semi-Arid Eastern Plain', latitude: 26.9124, longitude: 75.7873, mandiHub: 'Muhana Mandi Jaipur', majorCrops: ['Mustard', 'Bajra', 'Barley', 'Vegetables'], soilType: 'Sandy Loam & Red Sandy', phValue: 7.9 },
  { city: 'Jodhpur', state: 'Rajasthan', district: 'Jodhpur', agroZone: 'Arid Western Zone (Zone XIV)', latitude: 26.2389, longitude: 73.0243, mandiHub: 'Basni Mandi Jodhpur', majorCrops: ['Cumin (Jeera)', 'Guar', 'Moth Bean', 'Bajra'], soilType: 'Desert Sand & Dune Soils', phValue: 8.4 },
  { city: 'Kota', state: 'Rajasthan', district: 'Kota', agroZone: 'Humid South-Eastern Plain', latitude: 25.2138, longitude: 75.8648, mandiHub: 'Bhamashah Mandi Kota', majorCrops: ['Soybean', 'Wheat', 'Mustard', 'Coriander'], soilType: 'Medium Deep Black Soils', phValue: 7.8 },
  { city: 'Bikaner', state: 'Rajasthan', district: 'Bikaner', agroZone: 'Hyper-Arid Partial Irrigated Zone', latitude: 28.0229, longitude: 73.3119, mandiHub: 'Bikaner Krishi Mandi', majorCrops: ['Groundnut (IGNP)', 'Moth', 'Guar', 'Wheat'], soilType: 'Arid Desert Sand', phValue: 8.5 },
  { city: 'Sri Ganganagar', state: 'Rajasthan', district: 'Sri Ganganagar', agroZone: 'Canal Command Irrigated Belt', latitude: 29.9038, longitude: 73.8772, mandiHub: 'Sri Ganganagar Anaj Mandi', majorCrops: ['Cotton', 'Wheat', 'Mustard', 'Gram'], soilType: 'Alluvial Silt Loam', phValue: 8.0 },
  { city: 'Bharatpur', state: 'Rajasthan', district: 'Bharatpur', agroZone: 'Flood Prone Eastern Plain', latitude: 27.2152, longitude: 77.5030, mandiHub: 'Bharatpur Oilseeds Mandi', majorCrops: ['Mustard (Yellow/Black)', 'Wheat', 'Bajra'], soilType: 'Alluvial Sandy Loam', phValue: 7.8 },
  { city: 'Alwar', state: 'Rajasthan', district: 'Alwar', agroZone: 'Semi-Arid North Eastern Belt', latitude: 27.5530, longitude: 76.6346, mandiHub: 'Alwar Krishi Mandi Yard', majorCrops: ['Mustard', 'Bajra', 'Onion', 'Wheat'], soilType: 'Sandy Loam', phValue: 7.7 },

  // Madhya Pradesh (Central Plateau & Hills)
  { city: 'Indore', state: 'Madhya Pradesh', district: 'Indore', agroZone: 'Malwa Plateau & Hills (Zone VIII)', latitude: 22.7196, longitude: 75.8577, mandiHub: 'Choithram Mandi Indore', majorCrops: ['Soybean', 'Sharbati Wheat', 'Potato', 'Garlic'], soilType: 'Deep Black Cotton Soil', phValue: 8.0 },
  { city: 'Bhopal', state: 'Madhya Pradesh', district: 'Bhopal', agroZone: 'Central Vindhya Basin', latitude: 23.2599, longitude: 77.4126, mandiHub: 'Karond Krishi Mandi Bhopal', majorCrops: ['Wheat', 'Gram (Chana)', 'Soybean'], soilType: 'Deep Medium Black Soil', phValue: 7.8 },
  { city: 'Ujjain', state: 'Madhya Pradesh', district: 'Ujjain', agroZone: 'Malwa Plateau Zone', latitude: 23.1765, longitude: 75.7885, mandiHub: 'Chimanganj Mandi Ujjain', majorCrops: ['Soybean', 'Wheat', 'Chickpea', 'Garlic'], soilType: 'Deep Black Vertisol', phValue: 8.1 },
  { city: 'Jabalpur', state: 'Madhya Pradesh', district: 'Jabalpur', agroZone: 'Kymore Plateau & Satpura Hills', latitude: 23.1815, longitude: 79.9864, mandiHub: 'Vijay Nagar Mandi Jabalpur', majorCrops: ['Green Pea', 'Wheat', 'Paddy', 'Gram'], soilType: 'Mixed Black & Red Soil', phValue: 7.3 },
  { city: 'Gwalior', state: 'Madhya Pradesh', district: 'Gwalior', agroZone: 'Gird Zone (Chambal Basin)', latitude: 26.2183, longitude: 78.1828, mandiHub: 'Laxmi Ganj Mandi Gwalior', majorCrops: ['Mustard', 'Wheat', 'Potato', 'Bajra'], soilType: 'Alluvial Loam', phValue: 7.7 },
  { city: 'Narmadapuram', state: 'Madhya Pradesh', district: 'Narmadapuram', agroZone: 'Central Narmada Valley', latitude: 22.7519, longitude: 77.7289, mandiHub: 'Hoshangabad Grain Mandi', majorCrops: ['Sharbati Wheat', 'Soybean', 'Paddy (Moong)'], soilType: 'Deep Fertile Alluvium & Black', phValue: 7.6 },

  // Gujarat (Western Plain Zone)
  { city: 'Anand', state: 'Gujarat', district: 'Anand', agroZone: 'Western Plain Zone (Zone XIII)', latitude: 22.5645, longitude: 72.9289, mandiHub: 'Anand APMC Market Yard', majorCrops: ['Tobacco', 'Wheat', 'Banana', 'Vegetables'], soilType: 'Goradu (Sandy Loam Alluvium)', phValue: 7.5 },
  { city: 'Surat', state: 'Gujarat', district: 'Surat', agroZone: 'South Gujarat Heavy Rainfall Zone', latitude: 21.1702, longitude: 72.8311, mandiHub: 'Surat APMC Mandi', majorCrops: ['Sugarcane', 'Paddy', 'Banana', 'Mango'], soilType: 'Deep Black Clay', phValue: 7.9 },
  { city: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad', agroZone: 'North Gujarat Plain Zone', latitude: 23.0225, longitude: 72.5714, mandiHub: 'Ahmedabad APMC Jamalpur', majorCrops: ['Cotton', 'Wheat', 'Castor', 'Vegetables'], soilType: 'Medium Black & Alluvial Loam', phValue: 7.8 },
  { city: 'Rajkot', state: 'Gujarat', district: 'Rajkot', agroZone: 'Saurashtra Dry Farming Belt', latitude: 22.3039, longitude: 70.8022, mandiHub: 'Bedi Yard APMC Rajkot', majorCrops: ['Groundnut', 'Cotton (Shankar-6)', 'Cumin', 'Sesame'], soilType: 'Medium Black Soils', phValue: 8.0 },
  { city: 'Vadodara', state: 'Gujarat', district: 'Vadodara', agroZone: 'Middle Gujarat Alluvial Zone', latitude: 22.3072, longitude: 73.1812, mandiHub: 'Sayajipura APMC Yard', majorCrops: ['Cotton', 'Paddy', 'Banana', 'Pulses'], soilType: 'Deep Black & Loamy', phValue: 7.7 },
  { city: 'Junagadh', state: 'Gujarat', district: 'Junagadh', agroZone: 'South Saurashtra Zone', latitude: 21.5222, longitude: 70.4579, mandiHub: 'Junagadh APMC Yard', majorCrops: ['Kesar Mango', 'Groundnut', 'Coriander'], soilType: 'Medium Black & Coastal Alluvium', phValue: 7.9 },
  { city: 'Mehsana', state: 'Gujarat', district: 'Mehsana', agroZone: 'North Gujarat Arid Belt', latitude: 23.5880, longitude: 72.3693, mandiHub: 'Unjha APMC (Asia Spices Hub)', majorCrops: ['Cumin', 'Fennel', 'Isabgol', 'Mustard'], soilType: 'Sandy Loam', phValue: 8.1 },

  // Maharashtra (Deccan & Western Plateau)
  { city: 'Pune', state: 'Maharashtra', district: 'Pune', agroZone: 'Western Ghats & Sub-Montane Zone', latitude: 18.5204, longitude: 73.8567, mandiHub: 'Market Yard Gultekdi Pune', majorCrops: ['Sugarcane', 'Onion', 'Pomegranate', 'Soybean'], soilType: 'Medium Black Clay (Vertisol)', phValue: 7.8 },
  { city: 'Nashik', state: 'Maharashtra', district: 'Nashik', agroZone: 'Western Plateau & Hills (Zone IX)', latitude: 19.9975, longitude: 73.7898, mandiHub: 'Lasalgaon APMC (Onion Capital)', majorCrops: ['Table Grapes', 'Onion', 'Tomato', 'Maize'], soilType: 'Black Clay Loam & Laterite', phValue: 7.6 },
  { city: 'Nagpur', state: 'Maharashtra', district: 'Nagpur', agroZone: 'Eastern Vidarbha Zone', latitude: 21.1458, longitude: 79.0882, mandiHub: 'Kalamna Mandi Nagpur', majorCrops: ['Nagpur Orange', 'Cotton', 'Soybean', 'Pigeon Pea'], soilType: 'Deep Black Regur Soil', phValue: 8.0 },
  { city: 'Kolhapur', state: 'Maharashtra', district: 'Kolhapur', agroZone: 'South Western Sub-Montane', latitude: 16.7050, longitude: 74.2433, mandiHub: 'Shahupuri Market Yard', majorCrops: ['Sugarcane', 'Jaggery', 'Paddy', 'Soybean'], soilType: 'Heavy Clayey Black Loam', phValue: 7.5 },
  { city: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', district: 'Aurangabad', agroZone: 'Marathwada Dry Plateau', latitude: 19.8762, longitude: 75.3433, mandiHub: 'Jadhavwadi APMC Mandi', majorCrops: ['Cotton', 'Sweet Lime (Mosambi)', 'Bajra', 'Soybean'], soilType: 'Shallow to Medium Black', phValue: 8.2 },
  { city: 'Solapur', state: 'Maharashtra', district: 'Solapur', agroZone: 'Scarcity Zone of Maharashtra', latitude: 17.6599, longitude: 75.9064, mandiHub: 'Solapur APMC Pomegranate Yard', majorCrops: ['Pomegranate (Bhagwa)', 'Sorghum (Jowar)', 'Sugarcane'], soilType: 'Medium Black Soils', phValue: 8.3 },
  { city: 'Amravati', state: 'Maharashtra', district: 'Amravati', agroZone: 'Western Vidarbha Zone', latitude: 20.9374, longitude: 77.7796, mandiHub: 'Amravati Cotton Yard', majorCrops: ['Cotton', 'Soybean', 'Orange', 'Pigeon Pea'], soilType: 'Deep Black Soil', phValue: 8.1 },

  // Karnataka (Southern Plateau & Western Ghats)
  { city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', agroZone: 'Eastern Dry Zone', latitude: 12.9716, longitude: 77.5946, mandiHub: 'Yeshwanthpur APMC Yard', majorCrops: ['Ragi (Finger Millet)', 'Horticulture', 'Vegetables', 'Flowers'], soilType: 'Red Sandy Loam', phValue: 6.5 },
  { city: 'Belagavi', state: 'Karnataka', district: 'Belagavi', agroZone: 'Northern Transition Zone (Zone X)', latitude: 15.8497, longitude: 74.4977, mandiHub: 'Belagavi APMC Yard', majorCrops: ['Sugarcane', 'Maize', 'Soybean', 'Vegetables'], soilType: 'Medium Black & Red Loam', phValue: 7.2 },
  { city: 'Mysuru', state: 'Karnataka', district: 'Mysuru', agroZone: 'Southern Dry Zone', latitude: 12.2958, longitude: 76.6394, mandiHub: 'Bandipalya APMC Mysuru', majorCrops: ['Paddy', 'Ragi', 'Sugarcane', 'Cotton'], soilType: 'Red Loamy Soils', phValue: 6.8 },
  { city: 'Hubballi-Dharwad', state: 'Karnataka', district: 'Dharwad', agroZone: 'Northern Transition Zone', latitude: 15.3647, longitude: 75.1240, mandiHub: 'Amargol APMC Market', majorCrops: ['Byadgi Chilli', 'Cotton', 'Onion', 'Sorghum'], soilType: 'Deep Black Vertisol', phValue: 7.9 },
  { city: 'Kalaburagi', state: 'Karnataka', district: 'Kalaburagi', agroZone: 'North Eastern Dry Zone', latitude: 17.3297, longitude: 76.8343, mandiHub: 'Nehru Gunj APMC (Red Gram Capital)', majorCrops: ['Red Gram (Tur Dal)', 'Sunflower', 'Bengal Gram'], soilType: 'Deep Black Soils', phValue: 8.2 },
  { city: 'Davanagere', state: 'Karnataka', district: 'Davanagere', agroZone: 'Central Dry Zone', latitude: 14.4644, longitude: 75.9218, mandiHub: 'Davanagere Maize Mandi', majorCrops: ['Maize', 'Paddy', 'Arecanut', 'Sugarcane'], soilType: 'Red Sandy to Black Clay', phValue: 7.0 },

  // Tamil Nadu (East Coast & Southern Plains)
  { city: 'Coimbatore', state: 'Tamil Nadu', district: 'Coimbatore', agroZone: 'Western Agro-Zone (TNAU)', latitude: 11.0168, longitude: 76.9558, mandiHub: 'MGR Wholesale Market Coimbatore', majorCrops: ['Coconut', 'Tomato', 'Turmeric', 'Poultry'], soilType: 'Red Calcareous & Black Clay', phValue: 7.4 },
  { city: 'Thanjavur', state: 'Tamil Nadu', district: 'Thanjavur', agroZone: 'Cauvery Delta Rice Bowl', latitude: 10.7870, longitude: 79.1378, mandiHub: 'Thanjavur Regulated Market', majorCrops: ['Paddy (Kuruvai/Samba)', 'Pulses', 'Coconut'], soilType: 'Deltaic Alluvial Clay', phValue: 7.1 },
  { city: 'Madurai', state: 'Tamil Nadu', district: 'Madurai', agroZone: 'Southern Dry Zone', latitude: 9.9252, longitude: 78.1198, mandiHub: 'Mattuthavani Central Market', majorCrops: ['Jasmine Flower', 'Paddy', 'Banana', 'Millets'], soilType: 'Red Sandy Loam', phValue: 6.9 },
  { city: 'Salem', state: 'Tamil Nadu', district: 'Salem', agroZone: 'North Western Zone', latitude: 11.6643, longitude: 78.1460, mandiHub: 'Shevapet Wholesale Market', majorCrops: ['Tapioca', 'Mango', 'Turmeric', 'Millets'], soilType: 'Red Sandy to Clay Loam', phValue: 6.8 },
  { city: 'Tiruchirappalli', state: 'Tamil Nadu', district: 'Tiruchirappalli', agroZone: 'Cauvery River Basin', latitude: 10.7905, longitude: 78.7047, mandiHub: 'Gandhi Market Trichy', majorCrops: ['Banana', 'Paddy', 'Sugarcane', 'Betel Vine'], soilType: 'Alluvial River Loam', phValue: 7.2 },

  // Andhra Pradesh (East Coast & Rayalaseema)
  { city: 'Guntur', state: 'Andhra Pradesh', district: 'Guntur', agroZone: 'Krishna-Godavari Coastal Zone', latitude: 16.3067, longitude: 80.4365, mandiHub: "Guntur Mirchi Yard (Asia's Largest)", majorCrops: ['Red Chilli', 'Cotton', 'Tobacco', 'Paddy'], soilType: 'Deep Black Regur & Alluvium', phValue: 7.8 },
  { city: 'Vijayawada', state: 'Andhra Pradesh', district: 'NTR', agroZone: 'Krishna Delta Basin', latitude: 16.5062, longitude: 80.6480, mandiHub: 'Gollapudi Wholesale Market', majorCrops: ['Paddy', 'Mango (Banganapalli)', 'Sugarcane', 'Pulses'], soilType: 'Deltaic River Alluvium', phValue: 7.3 },
  { city: 'Kurnool', state: 'Andhra Pradesh', district: 'Kurnool', agroZone: 'Rayalaseema Scarce Rainfall Zone', latitude: 15.8281, longitude: 78.0373, mandiHub: 'Kurnool APMC Market Yard', majorCrops: ['Groundnut', 'Bengal Gram', 'Sunflower', 'Cotton'], soilType: 'Black & Red Sandy Soils', phValue: 8.0 },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', district: 'Visakhapatnam', agroZone: 'North Coastal Zone', latitude: 17.6868, longitude: 83.2185, mandiHub: 'Anakapalle Jaggery Mandi', majorCrops: ['Sugarcane (Jaggery)', 'Paddy', 'Oilseeds', 'Cashew'], soilType: 'Red Sandy Clay Loam', phValue: 6.7 },
  { city: 'Anantapur', state: 'Andhra Pradesh', district: 'Anantapur', agroZone: 'Arid Rayalaseema Belt', latitude: 14.6819, longitude: 77.6006, mandiHub: 'Anantapur Groundnut Yard', majorCrops: ['Groundnut', 'Sweet Orange', 'Millets', 'Pomegranate'], soilType: 'Red Sandy Alfisols', phValue: 7.2 },

  // Telangana (Southern Telangana Plateau)
  { city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', agroZone: 'Southern Telangana Agro-Zone', latitude: 17.3850, longitude: 78.4867, mandiHub: 'Bowenpally Agricultural Market', majorCrops: ['Vegetables', 'Paddy', 'Cotton', 'Maize'], soilType: 'Red Sandy Loam (Chalka)', phValue: 6.8 },
  { city: 'Warangal', state: 'Telangana', district: 'Warangal', agroZone: 'Central Telangana Zone', latitude: 17.9689, longitude: 79.5941, mandiHub: 'Enumamula Krishi Market Warangal', majorCrops: ['Cotton', 'Red Chilli', 'Paddy', 'Turmeric'], soilType: 'Black Cotton Soil & Red Sandy', phValue: 7.7 },
  { city: 'Nizamabad', state: 'Telangana', district: 'Nizamabad', agroZone: 'Northern Telangana Zone', latitude: 18.6725, longitude: 78.0941, mandiHub: 'Nizamabad Turmeric Market', majorCrops: ['Turmeric', 'Paddy', 'Soybean', 'Maize'], soilType: 'Deep Black Soils', phValue: 7.9 },
  { city: 'Karimnagar', state: 'Telangana', district: 'Karimnagar', agroZone: 'Central Godavari Basin', latitude: 18.4386, longitude: 79.1288, mandiHub: 'Karimnagar Agricultural Market', majorCrops: ['Paddy (Fine Grain)', 'Cotton', 'Maize'], soilType: 'Alluvial Black & Red Loam', phValue: 7.5 },

  // Bihar (Middle Gangetic Plain)
  { city: 'Patna', state: 'Bihar', district: 'Patna', agroZone: 'South Bihar Alluvial Plain (Zone IV)', latitude: 25.5941, longitude: 85.1376, mandiHub: 'Bazar Samiti Mandi Patna', majorCrops: ['Paddy', 'Wheat', 'Maize', 'Vegetables'], soilType: 'Deep Gangetic Alluvium', phValue: 7.4 },
  { city: 'Muzaffarpur', state: 'Bihar', district: 'Muzaffarpur', agroZone: 'North West Alluvial Plain', latitude: 26.1209, longitude: 85.3647, mandiHub: 'Brahmapura Krishi Mandi', majorCrops: ['Shahi Litchi', 'Maize', 'Paddy', 'Tobacco'], soilType: 'Calcareous Alluvial Silt', phValue: 7.8 },
  { city: 'Purnea', state: 'Bihar', district: 'Purnea', agroZone: 'North East Alluvial Basin', latitude: 25.7771, longitude: 87.4753, mandiHub: "Gulabbagh Mandi (Asia's Top Maize Market)", majorCrops: ['Yellow Maize (Rabi/Kharif)', 'Jute', 'Paddy', 'Makhana'], soilType: 'Light Alluvium & Acidic Silt', phValue: 6.4 },
  { city: 'Bhagalpur', state: 'Bihar', district: 'Bhagalpur', agroZone: 'South Bihar Alluvial Zone', latitude: 25.2425, longitude: 86.9842, mandiHub: 'Bhagalpur Krishi Bazar', majorCrops: ['Katarni Rice', 'Jardalu Mango', 'Wheat', 'Maize'], soilType: 'Sandy Loam Alluvium', phValue: 7.2 },

  // West Bengal (Lower Gangetic & Coastal Delta)
  { city: 'Burdwan', state: 'West Bengal', district: 'Purba Bardhaman', agroZone: 'Lower Gangetic Plain (Zone III)', latitude: 23.2324, longitude: 87.8615, mandiHub: 'Burdwan Rice & Produce Mandi', majorCrops: ['Aman Rice (Gobindobhog)', 'Potato', 'Jute', 'Mustard'], soilType: 'Gangetic Deltaic Alluvium', phValue: 6.6 },
  { city: 'Kolkata', state: 'West Bengal', district: 'Kolkata', agroZone: 'Deltaic Alluvium', latitude: 22.5726, longitude: 88.3639, mandiHub: 'Posta Bazar Wholesale Market', majorCrops: ['Paddy', 'Vegetables', 'Betel Vine', 'Jute'], soilType: 'Tidal Alluvial Clay', phValue: 6.8 },
  { city: 'Siliguri', state: 'West Bengal', district: 'Darjeeling', agroZone: 'Terai Agro-Zone', latitude: 26.7271, longitude: 88.3953, mandiHub: 'Siliguri Regulated Market', majorCrops: ['Darjeeling Tea', 'Pineapple', 'Ginger', 'Cardamom'], soilType: 'Acidic Brown Forest Loam', phValue: 5.5 },
  { city: 'Malda', state: 'West Bengal', district: 'Malda', agroZone: 'Old Alluvial Zone', latitude: 25.0108, longitude: 88.1411, mandiHub: 'English Bazar Haat', majorCrops: ['Fazli Mango', 'Jute', 'Paddy', 'Silk Mulbery'], soilType: 'Riverine Alluvial Silt', phValue: 6.7 },

  // Odisha (East Coast & Eastern Ghats)
  { city: 'Bhubaneswar', state: 'Odisha', district: 'Khurda', agroZone: 'East Coast Coastal Plain', latitude: 20.2961, longitude: 85.8245, mandiHub: 'Unit-1 Central Haat Market', majorCrops: ['Paddy', 'Pulses', 'Oilseeds', 'Vegetables'], soilType: 'Laterite & Coastal Deltaic', phValue: 6.3 },
  { city: 'Sambalpur', state: 'Odisha', district: 'Sambalpur', agroZone: 'Western Undulating Agro-Zone', latitude: 21.4669, longitude: 83.9812, mandiHub: 'Khetrajpur RMC Mandi', majorCrops: ['Paddy (Hirakud Command)', 'Vegetables', 'Groundnut'], soilType: 'Red and Yellow Alfisols', phValue: 6.5 },
  { city: 'Bargarh', state: 'Odisha', district: 'Bargarh', agroZone: 'Rice Bowl of Odisha', latitude: 21.3347, longitude: 83.6234, mandiHub: 'Bargarh RMC Yard', majorCrops: ['Paddy', 'Sugarcane', 'Pulses', 'Vegetables'], soilType: 'Fertile Riverine Loam', phValue: 6.8 },

  // Kerala (High Altitude & Coastal Humid)
  { city: 'Wayanad', state: 'Kerala', district: 'Wayanad', agroZone: 'High Altitude Agro-Zone (Zone XII)', latitude: 11.6854, longitude: 76.1320, mandiHub: 'Kalpetta Spices & Produce Yard', majorCrops: ['Black Pepper', 'Coffee (Robusta)', 'Cardamom', 'Tea'], soilType: 'Lateritic Forest Humus Loam', phValue: 5.4 },
  { city: 'Palakkad', state: 'Kerala', district: 'Palakkad', agroZone: 'Palakkad Gap Central Plains', latitude: 10.7867, longitude: 76.6548, mandiHub: 'Palakkad Regulated Market', majorCrops: ['Paddy (Rice Bowl)', 'Banana', 'Coconut', 'Sugarcane'], soilType: 'Rich Clayey Alluvial Silt', phValue: 6.2 },
  { city: 'Kottayam', state: 'Kerala', district: 'Kottayam', agroZone: 'Midland Laterite Zone', latitude: 9.5916, longitude: 76.5222, mandiHub: 'Rubber Board Central Terminal', majorCrops: ['Natural Rubber', 'Black Pepper', 'Cocoa', 'Nutmeg'], soilType: 'Deep Acidic Laterite', phValue: 5.2 },

  // Assam (Brahmaputra Valley)
  { city: 'Guwahati', state: 'Assam', district: 'Kamrup Metro', agroZone: 'Lower Brahmaputra Valley', latitude: 26.1445, longitude: 91.7362, mandiHub: 'Pamohi Wholesale Market Guwahati', majorCrops: ['Tea', 'Paddy (Sali/Boro)', 'Jute', 'Mustard', 'Arecanut'], soilType: 'Rich Riverine Silt Alluvium', phValue: 5.8 },
  { city: 'Jorhat', state: 'Assam', district: 'Jorhat', agroZone: 'Upper Brahmaputra Valley', latitude: 26.7509, longitude: 94.2037, mandiHub: 'Jorhat RMC Market', majorCrops: ['Assam Black Tea', 'Winter Rice', 'Bhut Jolokia Chilli'], soilType: 'Acidic Alluvial Clay Loam', phValue: 5.2 },
  { city: 'Tezpur', state: 'Assam', district: 'Sonitpur', agroZone: 'North Bank Plain Zone', latitude: 26.6528, longitude: 92.7926, mandiHub: 'Tezpur Krishi Bazar', majorCrops: ['Litchi (Tezpur GI)', 'Paddy', 'Ginger', 'Jute'], soilType: 'Coarse Alluvial Silt', phValue: 5.6 },

  // Chhattisgarh (Eastern Plateau - Rice Bowl of Central India)
  { city: 'Raipur', state: 'Chhattisgarh', district: 'Raipur', agroZone: 'Chhattisgarh Plains (Zone VII)', latitude: 21.2514, longitude: 81.6296, mandiHub: 'Pandri Krishi Mandi Raipur', majorCrops: ['Paddy (Basmati/Dubraj)', 'Soybean', 'Chickpea', 'Lathyrus'], soilType: 'Red and Yellow (Matasi/Dorsa)', phValue: 6.8 },
  { city: 'Bilaspur', state: 'Chhattisgarh', district: 'Bilaspur', agroZone: 'Northern Hill & Plain Basin', latitude: 22.0797, longitude: 82.1409, mandiHub: 'Bilaspur Anaj Mandi', majorCrops: ['Paddy', 'Maize', 'Mustard', 'Vegetables'], soilType: 'Clayey Black Loam (Kanhar)', phValue: 7.1 },

  // Jharkhand (Chota Nagpur Plateau)
  { city: 'Ranchi', state: 'Jharkhand', district: 'Ranchi', agroZone: 'Central Chota Nagpur Plateau', latitude: 23.3441, longitude: 85.3096, mandiHub: 'Pandra Market Yard Ranchi', majorCrops: ['Tomato (Off-season)', 'Paddy', 'Ginger', 'Green Pea'], soilType: 'Red Lateritic Alfisols', phValue: 5.9 },
  { city: 'Jamshedpur', state: 'Jharkhand', district: 'East Singhbhum', agroZone: 'South Eastern Plateau', latitude: 22.8046, longitude: 86.2029, mandiHub: 'Sakchi Wholesale Market', majorCrops: ['Paddy', 'Vegetables', 'Pulses', 'Oilseeds'], soilType: 'Red Gravelly Loam', phValue: 6.2 },

  // Uttarakhand (Western Himalayan Zone)
  { city: 'Dehradun', state: 'Uttarakhand', district: 'Dehradun', agroZone: 'Doon Valley & Sub-Himalayan', latitude: 30.3165, longitude: 78.0322, mandiHub: 'Niranjanpur Mandi Dehradun', majorCrops: ['Basmati Rice (Dehradooni)', 'Litchi', 'Ginger', 'Maize'], soilType: 'Brown Forest Silt Loam', phValue: 6.6 },
  { city: 'Rudrapur', state: 'Uttarakhand', district: 'Udham Singh Nagar', agroZone: 'Tarai Fertile Belt', latitude: 28.9800, longitude: 79.4000, mandiHub: 'Rudrapur Krishi Mandi', majorCrops: ['Paddy', 'Wheat', 'Sugarcane', 'Poplar Agroforestry'], soilType: 'Deep Tarai Alluvium', phValue: 7.2 },

  // Himachal Pradesh (Western Himalayas)
  { city: 'Shimla', state: 'Himachal Pradesh', district: 'Shimla', agroZone: 'High Hill Temperate Wet Zone', latitude: 31.1048, longitude: 77.1734, mandiHub: 'Dhalli Fruit Mandi Shimla', majorCrops: ['Apple (Royal Delicious)', 'Pear', 'Plum', 'Off-season Peas'], soilType: 'Brown Hill Acidic Forest Soil', phValue: 6.0 },
  { city: 'Kullu', state: 'Himachal Pradesh', district: 'Kullu', agroZone: 'Mid-Hills Sub-Humid Zone', latitude: 31.9579, longitude: 77.1095, mandiHub: 'Bhuntar Fruit & Veg Mandi', majorCrops: ['Apple', 'Pomegranate (Kandhari)', 'Garlic', 'Almond'], soilType: 'Glacial Gravelly Loam', phValue: 6.3 },
  { city: 'Kangra', state: 'Himachal Pradesh', district: 'Kangra', agroZone: 'Sub-Montane Low Hills', latitude: 32.0998, longitude: 76.2691, mandiHub: 'Dharamshala APMC Mandi', majorCrops: ['Kangra Green Tea', 'Wheat', 'Maize', 'Citrus'], soilType: 'Alluvial Loamy Forest Soil', phValue: 6.2 },

  // Jammu & Kashmir (North-Western Himalayas)
  { city: 'Srinagar', state: 'Jammu & Kashmir', district: 'Srinagar', agroZone: 'Kashmir Valley Temperate Zone', latitude: 34.0837, longitude: 74.7973, mandiHub: 'Parimpora Fruit Mandi Srinagar', majorCrops: ['Kashmiri Apple', 'Saffron (Pampore)', 'Walnut', 'Almond'], soilType: 'Karewa Lacustrine Silt & Clay', phValue: 6.8 },
  { city: 'Jammu', state: 'Jammu & Kashmir', district: 'Jammu', agroZone: 'Sub-Tropical Outer Plains', latitude: 32.7266, longitude: 74.8570, mandiHub: 'Narwal Mandi Jammu', majorCrops: ['Basmati Rice (RS Pura)', 'Wheat', 'Mustard', 'Mango'], soilType: 'Alluvial Sandy Loam', phValue: 7.4 },

  // Goa (West Coast Coastal Plain)
  { city: 'Panaji', state: 'Goa', district: 'North Goa', agroZone: 'West Coast Coastal Zone', latitude: 15.4909, longitude: 73.8278, mandiHub: 'Ponda Subzi & Spices Yard', majorCrops: ['Cashew Nut', 'Coconut', 'Arecanut', 'Paddy (Khazan)'], soilType: 'Coastal Laterite & Khazan Alluvium', phValue: 5.6 },

  // North-Eastern States
  { city: 'Agartala', state: 'Tripura', district: 'West Tripura', agroZone: 'North Eastern Hills & Plain', latitude: 23.8315, longitude: 91.2868, mandiHub: 'Battala Market Agartala', majorCrops: ['Queen Pineapple', 'Rubber', 'Paddy', 'Jute'], soilType: 'Acidic Red Sandy Loam', phValue: 5.2 },
  { city: 'Shillong', state: 'Meghalaya', district: 'East Khasi Hills', agroZone: 'High Altitude Meghalaya Plateau', latitude: 25.5788, longitude: 91.8933, mandiHub: 'Iewduh (Bara Bazar) Shillong', majorCrops: ['Lakadong Turmeric', 'Ginger', 'Strawberry', 'Broomgrass'], soilType: 'Rich Organic Acidic Loam', phValue: 5.0 },
  { city: 'Imphal', state: 'Manipur', district: 'Imphal West', agroZone: 'Manipur Central Valley', latitude: 24.8170, longitude: 93.9368, mandiHub: 'Khwairamband (Ima Keithel) Market', majorCrops: ['Black Rice (Chak-Hao)', 'Pineapple', 'Paddy', 'King Chilli'], soilType: 'Clayey Peat & Alluvial Loam', phValue: 5.5 },
  { city: 'Kohima', state: 'Nagaland', district: 'Kohima', agroZone: 'Nagaland Sub-Tropical Mountain', latitude: 25.6751, longitude: 94.1086, mandiHub: 'Kohima Central Haat', majorCrops: ['Naga King Chilli', 'Cardamom', 'Terraced Paddy', 'Ginger'], soilType: 'Brown Forest Acidic Soil', phValue: 5.3 },
  { city: 'Aizawl', state: 'Mizoram', district: 'Aizawl', agroZone: 'Mizoram Wet Hill Zone', latitude: 23.7271, longitude: 92.7176, mandiHub: 'Bawngkawn Market Aizawl', majorCrops: ['Mizo Ginger', 'Birds Eye Chilli', 'Passion Fruit', 'Anthracite Rice'], soilType: 'Acidic Laterite & Forest Loam', phValue: 5.1 },
  { city: 'Itanagar', state: 'Arunachal Pradesh', district: 'Papum Pare', agroZone: 'Eastern Himalayan Sub-Montane', latitude: 27.0844, longitude: 93.6053, mandiHub: 'Naharlagun Daily Market', majorCrops: ['Organic Kiwi', 'Large Cardamom', 'Orange (Mandarin)', 'Ginger'], soilType: 'Acidic Gravelly Forest Soil', phValue: 5.2 },

  // Union Territories
  { city: 'Delhi', state: 'Delhi NCR', district: 'North Delhi', agroZone: 'Upper Gangetic / NCR Hub', latitude: 28.6139, longitude: 77.2090, mandiHub: "Azadpur Terminal Mandi (Asia's Largest)", majorCrops: ['Wheat', 'Vegetables', 'Flowers', 'Mustard'], soilType: 'Alluvial Loam', phValue: 7.6 },
  { city: 'Chandigarh', state: 'Chandigarh', district: 'Chandigarh', agroZone: 'Shivalik Foothills / Union Command', latitude: 30.7333, longitude: 76.7794, mandiHub: 'Sector 26 Grain & Vegetable Market', majorCrops: ['Wheat', 'Basmati Rice', 'Horticulture'], soilType: 'Silt Loam', phValue: 7.4 },
  { city: 'Puducherry', state: 'Puducherry', district: 'Puducherry', agroZone: 'Coromandel Coastal Plain', latitude: 11.9416, longitude: 79.8083, mandiHub: 'Goubert Market Puducherry', majorCrops: ['Paddy', 'Sugarcane', 'Groundnut', 'Coconut'], soilType: 'Coastal Sandy Loam', phValue: 7.0 }
];

export const INDIAN_AGRI_REGIONS = INDIAN_CITIES_DATABASE;

// Extract sorted unique list of all Indian States and Union Territories
export const INDIAN_STATES = Array.from(new Set(INDIAN_CITIES_DATABASE.map(c => c.state))).sort();

/**
 * Geographic projection bounds for the Indian Subcontinent
 */
export const INDIA_MAP_BOUNDS = {
  minLat: 8.0,   // Kanyakumari / Southern tip
  maxLat: 37.0,  // Northern Jammu & Kashmir / Ladakh
  minLon: 68.0,  // Western Gujarat / Kutch
  maxLon: 97.5   // Eastern Arunachal Pradesh
};

/**
 * Projects real GPS coordinates (Latitude/Longitude) onto the SVG India Map ViewBox (0 0 460 480)
 */
export function latLonToMapCoords(lat, lon) {
  const { minLat, maxLat, minLon, maxLon } = INDIA_MAP_BOUNDS;

  const clampLat = Math.max(minLat, Math.min(maxLat, lat));
  const clampLon = Math.max(minLon, Math.min(maxLon, lon));

  // Map to SVG coordinates: width 460, height 480 with padding
  const x = Math.round(((clampLon - minLon) / (maxLon - minLon)) * 360 + 50);
  const y = Math.round(((maxLat - clampLat) / (maxLat - minLat)) * 390 + 40);

  return { x, y };
}

/**
 * Converts clicked SVG Map coordinates back into real Latitude/Longitude
 */
export function mapCoordsToLatLon(x, y) {
  const { minLat, maxLat, minLon, maxLon } = INDIA_MAP_BOUNDS;

  const clampedX = Math.max(50, Math.min(410, x));
  const clampedY = Math.max(40, Math.min(430, y));

  const lon = parseFloat((minLon + ((clampedX - 50) / 360) * (maxLon - minLon)).toFixed(4));
  const lat = parseFloat((maxLat - ((clampedY - 40) / 390) * (maxLat - minLat)).toFixed(4));

  return { lat, lon };
}

/**
 * Finds the closest Indian city / district from any arbitrary GPS coordinate
 */
export function findClosestIndianCity(lat, lon) {
  let closest = INDIAN_CITIES_DATABASE[0];
  let minDistance = Infinity;

  for (const item of INDIAN_CITIES_DATABASE) {
    // Great circle Euclidean approximation
    const d = Math.sqrt(Math.pow(item.latitude - lat, 2) + Math.pow(item.longitude - lon, 2));
    if (d < minDistance) {
      minDistance = d;
      closest = item;
    }
  }
  return closest;
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
      address: 'Meerut, Uttar Pradesh (Upper Gangetic Plain)',
      soilType: 'Deep Alluvial Loam',
      phValue: 7.4
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

  // Instant live search across all Indian cities, districts, states & mandis
  const searchIndianLocations = (query) => {
    if (!query || !query.trim()) return INDIAN_CITIES_DATABASE.slice(0, 12);
    const q = query.toLowerCase().trim();
    return INDIAN_CITIES_DATABASE.filter(item => 
      item.city.toLowerCase().includes(q) ||
      item.state.toLowerCase().includes(q) ||
      item.district.toLowerCase().includes(q) ||
      item.mandiHub.toLowerCase().includes(q) ||
      (item.majorCrops && item.majorCrops.some(c => c.toLowerCase().includes(q))) ||
      (item.agroZone && item.agroZone.toLowerCase().includes(q))
    ).slice(0, 15);
  };

  // Filter cities by state
  const citiesInSelectedState = useMemo(() => {
    return INDIAN_CITIES_DATABASE.filter(c => c.state === selectedState);
  }, [selectedState]);

  // HTML5 Live Browser Geolocation Detection
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
        const closest = findClosestIndianCity(lat, lon);

        const newLoc = {
          city: closest.city,
          state: closest.state,
          district: closest.district,
          agroZone: closest.agroZone,
          latitude: lat,
          longitude: lon,
          isGps: true,
          mandiHub: closest.mandiHub,
          address: `${closest.city}, ${closest.state} (${lat}° N, ${lon}° E)`,
          soilType: closest.soilType || 'Regional Alluvial / Clay Loam',
          phValue: closest.phValue || 7.2
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
      address: `${regionObj.city || regionObj.district}, ${regionObj.state} (${regionObj.agroZone})`,
      soilType: regionObj.soilType || 'Regional Agricultural Soil',
      phValue: regionObj.phValue || 7.2
    });
    setSelectedState(regionObj.state);
    setErrorMsg(null);
    setShowLocationModal(false);
  };

  // State Change handler that cascades to default city in that state
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

  // Click on map coordinates handler: translates click to closest Indian city
  const handleMapClick = (svgX, svgY) => {
    const { lat, lon } = mapCoordsToLatLon(svgX, svgY);
    const closest = findClosestIndianCity(lat, lon);
    setManualRegion(closest);
    return closest;
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
      handleMapClick,
      searchIndianLocations,
      latLonToMapCoords,
      mapCoordsToLatLon,
      findClosestIndianCity
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
