// Comprehensive crop data for India

export interface CropData {
  id: string;
  name: string;
  nameHi: string;
  nameLocal?: string;
  category: string;
  categoryHi: string;
  emoji: string;
  seasons: string[]; // kharif, rabi, zaid
  states: string[]; // main growing states
  avgPrice: number; // per quintal in INR
  priceUnit: string;
}

export const CROP_CATEGORIES = [
  { id: "cereals", name: "Cereals", nameHi: "अनाज" },
  { id: "pulses", name: "Pulses / Legumes", nameHi: "दालें / फलियां" },
  { id: "oilseeds", name: "Oilseeds", nameHi: "तिलहन" },
  { id: "vegetables", name: "Vegetables", nameHi: "सब्जियां" },
  { id: "fruits", name: "Fruits", nameHi: "फल" },
  { id: "cash", name: "Cash Crops", nameHi: "नकदी फसलें" },
  { id: "spices", name: "Spices", nameHi: "मसाले" },
  { id: "nuts", name: "Nuts & Dryfruit", nameHi: "नट्स और मेवे" },
  { id: "fodder", name: "Fodder", nameHi: "चारा" },
  { id: "horticulture", name: "Horticulture", nameHi: "बागवानी" },
];

export const ALL_CROPS: CropData[] = [
  // Cereals
  { id: "wheat", name: "Wheat", nameHi: "गेहूं", category: "cereals", categoryHi: "अनाज", emoji: "🌾", seasons: ["rabi"], states: ["MP", "UP", "Punjab", "Haryana"], avgPrice: 2200, priceUnit: "quintal" },
  { id: "rice", name: "Rice (Paddy)", nameHi: "चावल (धान)", category: "cereals", categoryHi: "अनाज", emoji: "🍚", seasons: ["kharif"], states: ["MP", "UP", "West Bengal", "Odisha"], avgPrice: 2000, priceUnit: "quintal" },
  { id: "maize", name: "Maize (Corn)", nameHi: "मक्का", category: "cereals", categoryHi: "अनाज", emoji: "🌽", seasons: ["kharif", "rabi"], states: ["MP", "Bihar", "Karnataka"], avgPrice: 1800, priceUnit: "quintal" },
  { id: "sorghum", name: "Sorghum (Jowar)", nameHi: "ज्वार", category: "cereals", categoryHi: "अनाज", emoji: "🌾", seasons: ["kharif", "rabi"], states: ["MP", "Maharashtra", "Rajasthan"], avgPrice: 2100, priceUnit: "quintal" },
  { id: "bajra", name: "Pearl Millet (Bajra)", nameHi: "बाजरा", category: "cereals", categoryHi: "अनाज", emoji: "🌾", seasons: ["kharif"], states: ["MP", "Rajasthan", "Gujarat", "Haryana"], avgPrice: 1900, priceUnit: "quintal" },
  { id: "barley", name: "Barley (Jau)", nameHi: "जौ", category: "cereals", categoryHi: "अनाज", emoji: "🌾", seasons: ["rabi"], states: ["MP", "UP", "Rajasthan"], avgPrice: 1700, priceUnit: "quintal" },
  { id: "ragi", name: "Finger Millet (Ragi)", nameHi: "रागी", category: "cereals", categoryHi: "अनाज", emoji: "🌾", seasons: ["kharif"], states: ["Karnataka", "Tamil Nadu", "Andhra Pradesh"], avgPrice: 3000, priceUnit: "quintal" },
  { id: "oats", name: "Oats (Jai)", nameHi: "जई", category: "cereals", categoryHi: "अनाज", emoji: "🌾", seasons: ["rabi"], states: ["Punjab", "Haryana", "UP"], avgPrice: 2000, priceUnit: "quintal" },

  // Pulses
  { id: "chickpea", name: "Chickpea (Chana)", nameHi: "चना (छोला)", category: "pulses", categoryHi: "दालें", emoji: "🌰", seasons: ["rabi"], states: ["MP", "Rajasthan", "Maharashtra", "UP"], avgPrice: 5500, priceUnit: "quintal" },
  { id: "lentil", name: "Lentil (Masoor)", nameHi: "मसूर", category: "pulses", categoryHi: "दालें", emoji: "🫘", seasons: ["rabi"], states: ["MP", "UP", "Bihar"], avgPrice: 6000, priceUnit: "quintal" },
  { id: "pigeon_pea", name: "Pigeon Pea (Toor / Arhar)", nameHi: "तुअर / अरहर दाल", category: "pulses", categoryHi: "दालें", emoji: "🫘", seasons: ["kharif"], states: ["MP", "Maharashtra", "Karnataka", "UP"], avgPrice: 7000, priceUnit: "quintal" },
  { id: "moong", name: "Green Gram (Moong)", nameHi: "मूंग", category: "pulses", categoryHi: "दालें", emoji: "🫘", seasons: ["kharif", "zaid"], states: ["MP", "Rajasthan", "Maharashtra"], avgPrice: 7500, priceUnit: "quintal" },
  { id: "urad", name: "Black Gram (Urad)", nameHi: "उड़द", category: "pulses", categoryHi: "दालें", emoji: "🫘", seasons: ["kharif"], states: ["MP", "Maharashtra", "UP", "Andhra Pradesh"], avgPrice: 7000, priceUnit: "quintal" },
  { id: "rajma", name: "Kidney Beans (Rajma)", nameHi: "राजमा", category: "pulses", categoryHi: "दालें", emoji: "🫘", seasons: ["zaid", "rabi"], states: ["Himachal Pradesh", "J&K", "Uttarakhand"], avgPrice: 8000, priceUnit: "quintal" },
  { id: "peas", name: "Field Peas (Matar)", nameHi: "मटर", category: "pulses", categoryHi: "दालें", emoji: "🟢", seasons: ["rabi"], states: ["MP", "UP", "Bihar"], avgPrice: 3500, priceUnit: "quintal" },
  { id: "cowpea", name: "Cowpea (Lobia)", nameHi: "लोबिया", category: "pulses", categoryHi: "दालें", emoji: "🫘", seasons: ["kharif", "zaid"], states: ["MP", "Karnataka", "Tamil Nadu"], avgPrice: 5000, priceUnit: "quintal" },

  // Oilseeds
  { id: "soybean", name: "Soybean", nameHi: "सोयाबीन", category: "oilseeds", categoryHi: "तिलहन", emoji: "🫘", seasons: ["kharif"], states: ["MP", "Maharashtra", "Rajasthan"], avgPrice: 4500, priceUnit: "quintal" },
  { id: "groundnut", name: "Groundnut (Peanut)", nameHi: "मूंगफली", category: "oilseeds", categoryHi: "तिलहन", emoji: "🥜", seasons: ["kharif", "zaid"], states: ["Gujarat", "Rajasthan", "Andhra Pradesh", "Tamil Nadu", "MP"], avgPrice: 5500, priceUnit: "quintal" },
  { id: "mustard", name: "Mustard (Sarso)", nameHi: "सरसों", category: "oilseeds", categoryHi: "तिलहन", emoji: "🌻", seasons: ["rabi"], states: ["Rajasthan", "Haryana", "MP", "UP"], avgPrice: 5000, priceUnit: "quintal" },
  { id: "sunflower", name: "Sunflower", nameHi: "सूरजमुखी", category: "oilseeds", categoryHi: "तिलहन", emoji: "🌻", seasons: ["kharif", "rabi"], states: ["Karnataka", "Andhra Pradesh", "Maharashtra"], avgPrice: 5500, priceUnit: "quintal" },
  { id: "sesame", name: "Sesame (Til)", nameHi: "तिल", category: "oilseeds", categoryHi: "तिलहन", emoji: "🌿", seasons: ["kharif"], states: ["MP", "Rajasthan", "Gujarat", "UP"], avgPrice: 10000, priceUnit: "quintal" },
  { id: "linseed", name: "Linseed (Alsi)", nameHi: "अलसी", category: "oilseeds", categoryHi: "तिलहन", emoji: "🌿", seasons: ["rabi"], states: ["MP", "Maharashtra", "Bihar"], avgPrice: 5500, priceUnit: "quintal" },
  { id: "castor", name: "Castor (Arandi)", nameHi: "अरंडी", category: "oilseeds", categoryHi: "तिलहन", emoji: "🌿", seasons: ["kharif"], states: ["Gujarat", "Rajasthan", "Andhra Pradesh"], avgPrice: 5800, priceUnit: "quintal" },
  { id: "safflower", name: "Safflower (Kusum)", nameHi: "कुसुम", category: "oilseeds", categoryHi: "तिलहन", emoji: "🌺", seasons: ["rabi"], states: ["Maharashtra", "Karnataka", "Andhra Pradesh", "MP"], avgPrice: 5500, priceUnit: "quintal" },

  // Vegetables
  { id: "tomato", name: "Tomato", nameHi: "टमाटर", category: "vegetables", categoryHi: "सब्जियां", emoji: "🍅", seasons: ["kharif", "rabi", "zaid"], states: ["all"], avgPrice: 1500, priceUnit: "quintal" },
  { id: "potato", name: "Potato (Aaloo)", nameHi: "आलू", category: "vegetables", categoryHi: "सब्जियां", emoji: "🥔", seasons: ["rabi"], states: ["UP", "West Bengal", "Bihar", "MP"], avgPrice: 1200, priceUnit: "quintal" },
  { id: "onion", name: "Onion (Pyaaz)", nameHi: "प्याज", category: "vegetables", categoryHi: "सब्जियां", emoji: "🧅", seasons: ["rabi"], states: ["Maharashtra", "MP", "Karnataka", "Gujarat"], avgPrice: 2000, priceUnit: "quintal" },
  { id: "garlic", name: "Garlic (Lahsun)", nameHi: "लहसुन", category: "vegetables", categoryHi: "सब्जियां", emoji: "🧄", seasons: ["rabi"], states: ["MP", "Rajasthan", "Gujarat"], avgPrice: 4000, priceUnit: "quintal" },
  { id: "cauliflower", name: "Cauliflower (Phool Gobhi)", nameHi: "फूलगोभी", category: "vegetables", categoryHi: "सब्जियां", emoji: "🥦", seasons: ["rabi"], states: ["all"], avgPrice: 1000, priceUnit: "quintal" },
  { id: "cabbage", name: "Cabbage (Patta Gobhi)", nameHi: "पत्तागोभी", category: "vegetables", categoryHi: "सब्जियां", emoji: "🥬", seasons: ["rabi"], states: ["all"], avgPrice: 800, priceUnit: "quintal" },
  { id: "brinjal", name: "Brinjal (Baigan)", nameHi: "बैंगन", category: "vegetables", categoryHi: "सब्जियां", emoji: "🍆", seasons: ["all"], states: ["all"], avgPrice: 1200, priceUnit: "quintal" },
  { id: "spinach", name: "Spinach (Palak)", nameHi: "पालक", category: "vegetables", categoryHi: "सब्जियां", emoji: "🥬", seasons: ["rabi", "zaid"], states: ["all"], avgPrice: 1000, priceUnit: "quintal" },
  { id: "okra", name: "Lady Finger (Bhindi)", nameHi: "भिंडी", category: "vegetables", categoryHi: "सब्जियां", emoji: "🌿", seasons: ["kharif", "zaid"], states: ["all"], avgPrice: 1500, priceUnit: "quintal" },
  { id: "bitter_gourd", name: "Bitter Gourd (Karela)", nameHi: "करेला", category: "vegetables", categoryHi: "सब्जियां", emoji: "🥒", seasons: ["zaid", "kharif"], states: ["all"], avgPrice: 1800, priceUnit: "quintal" },

  // Fruits
  { id: "mango", name: "Mango (Aam)", nameHi: "आम", category: "fruits", categoryHi: "फल", emoji: "🥭", seasons: ["zaid"], states: ["UP", "MP", "Andhra Pradesh", "Maharashtra"], avgPrice: 3000, priceUnit: "quintal" },
  { id: "banana", name: "Banana (Kela)", nameHi: "केला", category: "fruits", categoryHi: "फल", emoji: "🍌", seasons: ["all"], states: ["Tamil Nadu", "Maharashtra", "UP", "Gujarat"], avgPrice: 2000, priceUnit: "quintal" },
  { id: "guava", name: "Guava (Amrud)", nameHi: "अमरूद", category: "fruits", categoryHi: "फल", emoji: "🍈", seasons: ["winter"], states: ["UP", "MP", "Maharashtra"], avgPrice: 2500, priceUnit: "quintal" },
  { id: "papaya", name: "Papaya (Papita)", nameHi: "पपीता", category: "fruits", categoryHi: "फल", emoji: "🍈", seasons: ["all"], states: ["Andhra Pradesh", "Karnataka", "MP"], avgPrice: 1500, priceUnit: "quintal" },
  { id: "pomegranate", name: "Pomegranate (Anar)", nameHi: "अनार", category: "fruits", categoryHi: "फल", emoji: "🍎", seasons: ["rabi"], states: ["Maharashtra", "Rajasthan", "Gujarat", "MP"], avgPrice: 8000, priceUnit: "quintal" },
  { id: "grapes", name: "Grapes (Angoor)", nameHi: "अंगूर", category: "fruits", categoryHi: "फल", emoji: "🍇", seasons: ["rabi", "summer"], states: ["Maharashtra", "Karnataka", "AP"], avgPrice: 5000, priceUnit: "quintal" },

  // Cash Crops
  { id: "cotton", name: "Cotton (Kapas)", nameHi: "कपास", category: "cash", categoryHi: "नकदी फसलें", emoji: "☁️", seasons: ["kharif"], states: ["Gujarat", "Punjab", "Haryana", "MP", "Maharashtra"], avgPrice: 6000, priceUnit: "quintal" },
  { id: "sugarcane", name: "Sugarcane (Ganna)", nameHi: "गन्ना", category: "cash", categoryHi: "नकदी फसलें", emoji: "🎋", seasons: ["kharif"], states: ["UP", "Maharashtra", "Karnataka", "Haryana"], avgPrice: 350, priceUnit: "quintal" },
  { id: "jute", name: "Jute (Pat)", nameHi: "जूट", category: "cash", categoryHi: "नकदी फसलें", emoji: "🌿", seasons: ["kharif"], states: ["West Bengal", "Bihar", "Assam"], avgPrice: 4000, priceUnit: "quintal" },
  { id: "tobacco", name: "Tobacco (Tambaku)", nameHi: "तंबाकू", category: "cash", categoryHi: "नकदी फसलें", emoji: "🍃", seasons: ["rabi"], states: ["Andhra Pradesh", "Gujarat", "Karnataka", "MP"], avgPrice: 10000, priceUnit: "quintal" },

  // Spices
  { id: "turmeric", name: "Turmeric (Haldi)", nameHi: "हल्दी", category: "spices", categoryHi: "मसाले", emoji: "🟡", seasons: ["kharif"], states: ["Andhra Pradesh", "Maharashtra", "Tamil Nadu", "MP"], avgPrice: 8000, priceUnit: "quintal" },
  { id: "coriander", name: "Coriander (Dhaniya)", nameHi: "धनिया", category: "spices", categoryHi: "मसाले", emoji: "🌿", seasons: ["rabi"], states: ["Rajasthan", "MP", "UP", "Gujarat"], avgPrice: 6000, priceUnit: "quintal" },
  { id: "cumin", name: "Cumin (Jeera)", nameHi: "जीरा", category: "spices", categoryHi: "मसाले", emoji: "🌰", seasons: ["rabi"], states: ["Rajasthan", "Gujarat", "MP"], avgPrice: 20000, priceUnit: "quintal" },
  { id: "fenugreek", name: "Fenugreek (Methi)", nameHi: "मेथी", category: "spices", categoryHi: "मसाले", emoji: "🌿", seasons: ["rabi"], states: ["Rajasthan", "Gujarat", "MP"], avgPrice: 5000, priceUnit: "quintal" },
  { id: "chilli", name: "Red Chilli (Lal Mirch)", nameHi: "लाल मिर्च", category: "spices", categoryHi: "मसाले", emoji: "🌶️", seasons: ["kharif", "rabi"], states: ["Andhra Pradesh", "MP", "Karnataka", "Maharashtra"], avgPrice: 12000, priceUnit: "quintal" },
  { id: "cardamom", name: "Cardamom (Elaichi)", nameHi: "इलायची", category: "spices", categoryHi: "मसाले", emoji: "🌿", seasons: ["all"], states: ["Kerala", "Karnataka", "Tamil Nadu"], avgPrice: 180000, priceUnit: "quintal" },
  { id: "ginger", name: "Ginger (Adrak)", nameHi: "अदरक", category: "spices", categoryHi: "मसाले", emoji: "🫚", seasons: ["kharif"], states: ["Kerala", "Meghalaya", "Orissa", "Sikkim", "MP"], avgPrice: 8000, priceUnit: "quintal" },

  // Nuts & Dryfruits
  { id: "cashew", name: "Cashew (Kaju)", nameHi: "काजू", category: "nuts", categoryHi: "नट्स और मेवे", emoji: "🥜", seasons: ["kharif"], states: ["Kerala", "Karnataka", "Goa", "Tamil Nadu"], avgPrice: 80000, priceUnit: "quintal" },
  { id: "coconut", name: "Coconut (Nariyal)", nameHi: "नारियल", category: "nuts", categoryHi: "नट्स और मेवे", emoji: "🥥", seasons: ["all"], states: ["Kerala", "Tamil Nadu", "Karnataka", "Andhra Pradesh"], avgPrice: 15000, priceUnit: "quintal" },
  { id: "walnut", name: "Walnut (Akhrot)", nameHi: "अखरोट", category: "nuts", categoryHi: "नट्स और मेवे", emoji: "🌰", seasons: ["all"], states: ["J&K", "Himachal Pradesh", "Uttarakhand"], avgPrice: 60000, priceUnit: "quintal" },
  { id: "almond", name: "Almond (Badam)", nameHi: "बादाम", category: "nuts", categoryHi: "नट्स और मेवे", emoji: "🌰", seasons: ["rabi"], states: ["J&K", "Himachal Pradesh"], avgPrice: 100000, priceUnit: "quintal" },
  { id: "pistachio", name: "Pistachio (Pista)", nameHi: "पिस्ता", category: "nuts", categoryHi: "नट्स और मेवे", emoji: "🫘", seasons: ["all"], states: ["J&K"], avgPrice: 120000, priceUnit: "quintal" },

  // Fodder
  { id: "berseem", name: "Berseem (Egyptian Clover)", nameHi: "बरसीम", category: "fodder", categoryHi: "चारा", emoji: "🌿", seasons: ["rabi"], states: ["all"], avgPrice: 500, priceUnit: "quintal" },
  { id: "lucerne", name: "Lucerne (Alfalfa)", nameHi: "रिजका", category: "fodder", categoryHi: "चारा", emoji: "🌿", seasons: ["rabi"], states: ["all"], avgPrice: 600, priceUnit: "quintal" },

  // Horticulture
  { id: "rose", name: "Rose (Gulab)", nameHi: "गुलाब", category: "horticulture", categoryHi: "बागवानी", emoji: "🌹", seasons: ["all"], states: ["all"], avgPrice: 500, priceUnit: "quintal" },
  { id: "marigold", name: "Marigold (Genda)", nameHi: "गेंदा", category: "horticulture", categoryHi: "बागवानी", emoji: "🌼", seasons: ["all"], states: ["all"], avgPrice: 800, priceUnit: "quintal" },
  { id: "jasmine", name: "Jasmine (Chameli)", nameHi: "चमेली", category: "horticulture", categoryHi: "बागवानी", emoji: "🌸", seasons: ["all"], states: ["Tamil Nadu", "Karnataka", "AP"], avgPrice: 2000, priceUnit: "quintal" },
];

export function searchCrops(query: string): CropData[] {
  const q = query.toLowerCase().trim();
  if (!q) return ALL_CROPS;
  return ALL_CROPS.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.nameHi.includes(q) ||
      c.category.toLowerCase().includes(q)
  );
}

export function getCropsByCategory(categoryId: string): CropData[] {
  if (!categoryId) return ALL_CROPS;
  return ALL_CROPS.filter((c) => c.category === categoryId);
}

// Season-based crop suggestions
export function getCropSuggestionsForSeason(season: string, state: string = ""): CropData[] {
  return ALL_CROPS.filter(
    (c) =>
      c.seasons.includes(season) &&
      (state === "" || c.states.includes("all") || c.states.some((s) => s.toLowerCase().includes(state.toLowerCase())))
  );
}

export function getCurrentSeason(): "kharif" | "rabi" | "zaid" {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 6 && month <= 11) return "kharif"; // Jun-Nov
  if (month >= 11 || month <= 3) return "rabi";   // Nov-Mar
  return "zaid"; // Apr-Jun
}
