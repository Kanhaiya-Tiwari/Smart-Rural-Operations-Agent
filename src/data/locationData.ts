// Complete India location data with all MP cities + other states
// Madhya Pradesh has full tehsil-level coverage

export interface MandiLocation {
  name: string;
  distance: string; // approximate distance from city
}

export interface CityData {
  name: string;
  nameHi: string;
  mandis: MandiLocation[];
}

export interface StateData {
  name: string;
  nameHi: string;
  cities: CityData[];
}

// All Madhya Pradesh districts + major tehsils (comprehensive coverage)
export const MP_CITIES: CityData[] = [
  { name: "Agar Malwa", nameHi: "आगर मालवा", mandis: [{ name: "Agar Mandi", distance: "0 km" }, { name: "Susner Mandi", distance: "22 km" }] },
  { name: "Ajaigarh", nameHi: "अजयगढ़", mandis: [{ name: "Ajaigarh Mandi", distance: "0 km" }, { name: "Panna Mandi", distance: "35 km" }] },
  { name: "Alirajpur", nameHi: "अलीराजपुर", mandis: [{ name: "Alirajpur Mandi", distance: "0 km" }, { name: "Jobat Mandi", distance: "25 km" }] },
  { name: "Amarpatan", nameHi: "अमरपाटन", mandis: [{ name: "Amarpatan Mandi", distance: "0 km" }, { name: "Satna Mandi", distance: "40 km" }] },
  { name: "Anuppur", nameHi: "अनूपपुर", mandis: [{ name: "Anuppur Mandi", distance: "0 km" }, { name: "Kotma Mandi", distance: "18 km" }] },
  { name: "Ashoknagar", nameHi: "अशोकनगर", mandis: [{ name: "Ashoknagar Mandi", distance: "0 km" }, { name: "Chanderi Mandi", distance: "45 km" }] },
  { name: "Ashta", nameHi: "आष्टा", mandis: [{ name: "Ashta Mandi", distance: "0 km" }, { name: "Sehore Mandi", distance: "32 km" }] },
  { name: "Balaghat", nameHi: "बालाघाट", mandis: [{ name: "Balaghat Mandi", distance: "0 km" }, { name: "Waraseoni Mandi", distance: "28 km" }] },
  { name: "Banskheda", nameHi: "बांसखेड़ा", mandis: [{ name: "Banskheda Mandi", distance: "0 km" }] },
  { name: "Bareli", nameHi: "बरेली", mandis: [{ name: "Bareli Mandi", distance: "0 km" }, { name: "Raisen Mandi", distance: "30 km" }] },
  { name: "Barwani", nameHi: "बड़वानी", mandis: [{ name: "Barwani Mandi", distance: "0 km" }, { name: "Sendhwa Mandi", distance: "20 km" }] },
  { name: "Bastar", nameHi: "बस्तर", mandis: [{ name: "Bastar Mandi", distance: "0 km" }] },
  { name: "Begumganj", nameHi: "बेगमगंज", mandis: [{ name: "Begumganj Mandi", distance: "0 km" }, { name: "Raisen Mandi", distance: "25 km" }] },
  { name: "Betul", nameHi: "बैतूल", mandis: [{ name: "Betul Mandi", distance: "0 km" }, { name: "Multai Mandi", distance: "35 km" }] },
  { name: "Bhopal", nameHi: "भोपाल", mandis: [{ name: "Bhopal Mandi (Navin)", distance: "0 km" }, { name: "APMC Bhopal", distance: "5 km" }, { name: "Sehore Mandi", distance: "40 km" }] },
  { name: "Biaora", nameHi: "बियोरा", mandis: [{ name: "Biaora Mandi", distance: "0 km" }, { name: "Rajgarh Mandi", distance: "28 km" }] },
  { name: "Bijuri", nameHi: "बिजुरी", mandis: [{ name: "Bijuri Mandi", distance: "0 km" }, { name: "Anuppur Mandi", distance: "15 km" }] },
  { name: "Burhanpur", nameHi: "बुरहानपुर", mandis: [{ name: "Burhanpur Mandi", distance: "0 km" }, { name: "Nepanagar Mandi", distance: "22 km" }] },
  { name: "Chanderi", nameHi: "चंदेरी", mandis: [{ name: "Chanderi Mandi", distance: "0 km" }, { name: "Ashoknagar Mandi", distance: "42 km" }] },
  { name: "Chhindwara", nameHi: "छिंदवाड़ा", mandis: [{ name: "Chhindwara Mandi", distance: "0 km" }, { name: "Sausar Mandi", distance: "30 km" }] },
  { name: "Chhatarpur", nameHi: "छतरपुर", mandis: [{ name: "Chhatarpur Mandi", distance: "0 km" }, { name: "Nowgong Mandi", distance: "25 km" }] },
  { name: "Damoh", nameHi: "दमोह", mandis: [{ name: "Damoh Mandi", distance: "0 km" }, { name: "Jabera Mandi", distance: "30 km" }] },
  { name: "Datia", nameHi: "दतिया", mandis: [{ name: "Datia Mandi", distance: "0 km" }, { name: "Gwalior Mandi", distance: "35 km" }] },
  { name: "Depalpur", nameHi: "देपालपुर", mandis: [{ name: "Depalpur Mandi", distance: "0 km" }, { name: "Indore Mandi", distance: "28 km" }] },
  { name: "Dewas", nameHi: "देवास", mandis: [{ name: "Dewas Mandi", distance: "0 km" }, { name: "Sonkatch Mandi", distance: "22 km" }] },
  { name: "Dhar", nameHi: "धार", mandis: [{ name: "Dhar Mandi", distance: "0 km" }, { name: "Badnawar Mandi", distance: "30 km" }] },
  { name: "Dindori", nameHi: "डिंडोरी", mandis: [{ name: "Dindori Mandi", distance: "0 km" }, { name: "Mandla Mandi", distance: "45 km" }] },
  { name: "Ganjbasoda", nameHi: "गंजबासौदा", mandis: [{ name: "Ganjbasoda Mandi", distance: "0 km" }, { name: "Vidisha Mandi", distance: "38 km" }] },
  { name: "Gadarwara", nameHi: "गाडरवारा", mandis: [{ name: "Gadarwara Mandi", distance: "0 km" }, { name: "Narsinghpur Mandi", distance: "25 km" }] },
  { name: "Guna", nameHi: "गुना", mandis: [{ name: "Guna Mandi", distance: "0 km" }, { name: "Raghogarh Mandi", distance: "22 km" }] },
  { name: "Gwalior", nameHi: "ग्वालियर", mandis: [{ name: "Gwalior Mandi", distance: "0 km" }, { name: "Lashkar Mandi", distance: "5 km" }, { name: "Murar Mandi", distance: "8 km" }] },
  { name: "Harda", nameHi: "हरदा", mandis: [{ name: "Harda Mandi", distance: "0 km" }, { name: "Timarni Mandi", distance: "25 km" }] },
  { name: "Hoshangabad", nameHi: "होशंगाबाद", mandis: [{ name: "Hoshangabad Mandi", distance: "0 km" }, { name: "Pipariya Mandi", distance: "28 km" }] },
  { name: "Indore", nameHi: "इंदौर", mandis: [{ name: "Indore APMC", distance: "0 km" }, { name: "Sanwer Mandi", distance: "22 km" }, { name: "Dewas Mandi", distance: "35 km" }] },
  { name: "Itarsi", nameHi: "इटारसी", mandis: [{ name: "Itarsi Mandi", distance: "0 km" }, { name: "Hoshangabad Mandi", distance: "12 km" }] },
  { name: "Jabalpur", nameHi: "जबलपुर", mandis: [{ name: "Jabalpur Mandi", distance: "0 km" }, { name: "Katni Mandi", distance: "40 km" }] },
  { name: "Jhabua", nameHi: "झाबुआ", mandis: [{ name: "Jhabua Mandi", distance: "0 km" }, { name: "Thandla Mandi", distance: "20 km" }] },
  { name: "Katni", nameHi: "कटनी", mandis: [{ name: "Katni Mandi", distance: "0 km" }, { name: "Umaria Mandi", distance: "40 km" }] },
  { name: "Khandwa", nameHi: "खंडवा", mandis: [{ name: "Khandwa Mandi", distance: "0 km" }, { name: "Pandhana Mandi", distance: "25 km" }] },
  { name: "Khargone", nameHi: "खरगोन", mandis: [{ name: "Khargone Mandi", distance: "0 km" }, { name: "Sanawad Mandi", distance: "22 km" }] },
  { name: "Kotma", nameHi: "कोतमा", mandis: [{ name: "Kotma Mandi", distance: "0 km" }, { name: "Anuppur Mandi", distance: "18 km" }, { name: "Shahdol Mandi", distance: "45 km" }] },
  { name: "Lahar", nameHi: "लहार", mandis: [{ name: "Lahar Mandi", distance: "0 km" }, { name: "Bhind Mandi", distance: "25 km" }] },
  { name: "Lakhnadaun", nameHi: "लखनादौन", mandis: [{ name: "Lakhnadaun Mandi", distance: "0 km" }, { name: "Seoni Mandi", distance: "32 km" }] },
  { name: "Lanji", nameHi: "लांजी", mandis: [{ name: "Lanji Mandi", distance: "0 km" }, { name: "Balaghat Mandi", distance: "30 km" }] },
  { name: "Maihar", nameHi: "मैहर", mandis: [{ name: "Maihar Mandi", distance: "0 km" }, { name: "Satna Mandi", distance: "45 km" }] },
  { name: "Mandla", nameHi: "मंडला", mandis: [{ name: "Mandla Mandi", distance: "0 km" }, { name: "Nainpur Mandi", distance: "30 km" }] },
  { name: "Mandsaur", nameHi: "मंदसौर", mandis: [{ name: "Mandsaur Mandi", distance: "0 km" }, { name: "Suwasra Mandi", distance: "25 km" }, { name: "Neemuch Mandi", distance: "35 km" }] },
  { name: "Morena", nameHi: "मुरैना", mandis: [{ name: "Morena Mandi", distance: "0 km" }, { name: "Ambah Mandi", distance: "28 km" }] },
  { name: "Murwara", nameHi: "मुरवारा", mandis: [{ name: "Murwara Mandi", distance: "0 km" }, { name: "Katni Mandi", distance: "5 km" }] },
  { name: "Mhow", nameHi: "महू", mandis: [{ name: "Mhow Mandi", distance: "0 km" }, { name: "Indore Mandi", distance: "23 km" }] },
  { name: "Narmadapuram", nameHi: "नर्मदापुरम", mandis: [{ name: "Narmadapuram Mandi", distance: "0 km" }, { name: "Harda Mandi", distance: "50 km" }] },
  { name: "Narsinghpur", nameHi: "नरसिंहपुर", mandis: [{ name: "Narsinghpur Mandi", distance: "0 km" }, { name: "Kareli Mandi", distance: "22 km" }] },
  { name: "Neemuch", nameHi: "नीमच", mandis: [{ name: "Neemuch Mandi", distance: "0 km" }, { name: "Mandsaur Mandi", distance: "35 km" }] },
  { name: "Nimrani", nameHi: "निमराण", mandis: [{ name: "Nimrani Mandi", distance: "0 km" }, { name: "Khargone Mandi", distance: "30 km" }] },
  { name: "Nowgong", nameHi: "नौगांव", mandis: [{ name: "Nowgong Mandi", distance: "0 km" }, { name: "Chhatarpur Mandi", distance: "25 km" }] },
  { name: "Pachmarhi", nameHi: "पचमढ़ी", mandis: [{ name: "Pachmarhi Mandi", distance: "0 km" }, { name: "Piparia Mandi", distance: "25 km" }] },
  { name: "Panna", nameHi: "पन्ना", mandis: [{ name: "Panna Mandi", distance: "0 km" }, { name: "Pawai Mandi", distance: "30 km" }] },
  { name: "Petlawad", nameHi: "पेटलावद", mandis: [{ name: "Petlawad Mandi", distance: "0 km" }, { name: "Jhabua Mandi", distance: "40 km" }] },
  { name: "Pipariya", nameHi: "पिपरिया", mandis: [{ name: "Pipariya Mandi", distance: "0 km" }, { name: "Hoshangabad Mandi", distance: "28 km" }] },
  { name: "Raisen", nameHi: "रायसेन", mandis: [{ name: "Raisen Mandi", distance: "0 km" }, { name: "Berasia Mandi", distance: "20 km" }] },
  { name: "Rajgarh", nameHi: "राजगढ़", mandis: [{ name: "Rajgarh Mandi", distance: "0 km" }, { name: "Biaora Mandi", distance: "28 km" }] },
  { name: "Ratlam", nameHi: "रतलाम", mandis: [{ name: "Ratlam Mandi", distance: "0 km" }, { name: "Sailana Mandi", distance: "22 km" }] },
  { name: "Rehli", nameHi: "रेहली", mandis: [{ name: "Rehli Mandi", distance: "0 km" }, { name: "Sagar Mandi", distance: "30 km" }] },
  { name: "Rewa", nameHi: "रीवा", mandis: [{ name: "Rewa Mandi", distance: "0 km" }, { name: "Teonthar Mandi", distance: "35 km" }] },
  { name: "Sagar", nameHi: "सागर", mandis: [{ name: "Sagar Mandi", distance: "0 km" }, { name: "Khurai Mandi", distance: "30 km" }] },
  { name: "Sanawad", nameHi: "सनावद", mandis: [{ name: "Sanawad Mandi", distance: "0 km" }, { name: "Khargone Mandi", distance: "22 km" }] },
  { name: "Satna", nameHi: "सतना", mandis: [{ name: "Satna Mandi", distance: "0 km" }, { name: "Raghuraj Nagar Mandi", distance: "5 km" }] },
  { name: "Sausar", nameHi: "सौसर", mandis: [{ name: "Sausar Mandi", distance: "0 km" }, { name: "Chhindwara Mandi", distance: "30 km" }] },
  { name: "Sehore", nameHi: "सीहोर", mandis: [{ name: "Sehore Mandi", distance: "0 km" }, { name: "Ashta Mandi", distance: "32 km" }] },
  { name: "Sendhwa", nameHi: "सेंधवा", mandis: [{ name: "Sendhwa Mandi", distance: "0 km" }, { name: "Barwani Mandi", distance: "20 km" }] },
  { name: "Seoni", nameHi: "सिवनी", mandis: [{ name: "Seoni Mandi", distance: "0 km" }, { name: "Lakhnadaun Mandi", distance: "32 km" }] },
  { name: "Shahdol", nameHi: "शहडोल", mandis: [{ name: "Shahdol Mandi", distance: "0 km" }, { name: "Beohari Mandi", distance: "28 km" }] },
  { name: "Shajapur", nameHi: "शाजापुर", mandis: [{ name: "Shajapur Mandi", distance: "0 km" }, { name: "Shujalpur Mandi", distance: "22 km" }] },
  { name: "Sheopur", nameHi: "श्योपुर", mandis: [{ name: "Sheopur Mandi", distance: "0 km" }, { name: "Vijaypur Mandi", distance: "25 km" }] },
  { name: "Shivpuri", nameHi: "शिवपुरी", mandis: [{ name: "Shivpuri Mandi", distance: "0 km" }, { name: "Pohri Mandi", distance: "30 km" }] },
  { name: "Sidhi", nameHi: "सीधी", mandis: [{ name: "Sidhi Mandi", distance: "0 km" }, { name: "Singrauli Mandi", distance: "50 km" }] },
  { name: "Singrauli", nameHi: "सिंगरौली", mandis: [{ name: "Singrauli Mandi", distance: "0 km" }, { name: "Waidhan Mandi", distance: "10 km" }] },
  { name: "Sironj", nameHi: "सिरोंज", mandis: [{ name: "Sironj Mandi", distance: "0 km" }, { name: "Vidisha Mandi", distance: "50 km" }] },
  { name: "Tikamgarh", nameHi: "टीकमगढ़", mandis: [{ name: "Tikamgarh Mandi", distance: "0 km" }, { name: "Niwari Mandi", distance: "30 km" }] },
  { name: "Ujjain", nameHi: "उज्जैन", mandis: [{ name: "Ujjain Mandi", distance: "0 km" }, { name: "Nagda Mandi", distance: "28 km" }, { name: "Maksi Mandi", distance: "30 km" }] },
  { name: "Umaria", nameHi: "उमरिया", mandis: [{ name: "Umaria Mandi", distance: "0 km" }, { name: "Katni Mandi", distance: "40 km" }] },
  { name: "Vidisha", nameHi: "विदिशा", mandis: [{ name: "Vidisha Mandi", distance: "0 km" }, { name: "Ganjbasoda Mandi", distance: "38 km" }] },
  { name: "Waraseoni", nameHi: "वारासेवनी", mandis: [{ name: "Waraseoni Mandi", distance: "0 km" }, { name: "Balaghat Mandi", distance: "28 km" }] },
  // Additional MP tehsils for comprehensive coverage
  { name: "Ambah", nameHi: "अम्बाह", mandis: [{ name: "Ambah Mandi", distance: "0 km" }, { name: "Morena Mandi", distance: "28 km" }] },
  { name: "Amla", nameHi: "आमला", mandis: [{ name: "Amla Mandi", distance: "0 km" }, { name: "Betul Mandi", distance: "30 km" }] },
  { name: "Badnawar", nameHi: "बदनावर", mandis: [{ name: "Badnawar Mandi", distance: "0 km" }, { name: "Dhar Mandi", distance: "30 km" }] },
  { name: "Beohari", nameHi: "बेओहारी", mandis: [{ name: "Beohari Mandi", distance: "0 km" }, { name: "Shahdol Mandi", distance: "28 km" }] },
  { name: "Berasia", nameHi: "बेरासिया", mandis: [{ name: "Berasia Mandi", distance: "0 km" }, { name: "Bhopal Mandi", distance: "30 km" }] },
  { name: "Bhind", nameHi: "भिंड", mandis: [{ name: "Bhind Mandi", distance: "0 km" }] },
  { name: "Churhat", nameHi: "चुरहट", mandis: [{ name: "Churhat Mandi", distance: "0 km" }, { name: "Sidhi Mandi", distance: "30 km" }] },
  { name: "Gohad", nameHi: "गोहद", mandis: [{ name: "Gohad Mandi", distance: "0 km" }, { name: "Bhind Mandi", distance: "28 km" }] },
  { name: "Kareli", nameHi: "करेली", mandis: [{ name: "Kareli Mandi", distance: "0 km" }, { name: "Narsinghpur Mandi", distance: "22 km" }] },
  { name: "Khurai", nameHi: "खुरई", mandis: [{ name: "Khurai Mandi", distance: "0 km" }, { name: "Sagar Mandi", distance: "30 km" }] },
  { name: "Multai", nameHi: "मुलताई", mandis: [{ name: "Multai Mandi", distance: "0 km" }, { name: "Betul Mandi", distance: "35 km" }] },
  { name: "Nainpur", nameHi: "नैनपुर", mandis: [{ name: "Nainpur Mandi", distance: "0 km" }, { name: "Mandla Mandi", distance: "30 km" }] },
  { name: "Nepanagar", nameHi: "नेपानगर", mandis: [{ name: "Nepanagar Mandi", distance: "0 km" }, { name: "Burhanpur Mandi", distance: "22 km" }] },
  { name: "Pandhana", nameHi: "पंधाना", mandis: [{ name: "Pandhana Mandi", distance: "0 km" }, { name: "Khandwa Mandi", distance: "25 km" }] },
  { name: "Pawai", nameHi: "पवई", mandis: [{ name: "Pawai Mandi", distance: "0 km" }, { name: "Panna Mandi", distance: "30 km" }] },
  { name: "Raghogarh", nameHi: "राघोगढ़", mandis: [{ name: "Raghogarh Mandi", distance: "0 km" }, { name: "Guna Mandi", distance: "22 km" }] },
  { name: "Raghuraj Nagar", nameHi: "रघुराजनगर", mandis: [{ name: "Raghuraj Nagar Mandi", distance: "0 km" }, { name: "Satna Mandi", distance: "5 km" }] },
  { name: "Sailana", nameHi: "सैलाना", mandis: [{ name: "Sailana Mandi", distance: "0 km" }, { name: "Ratlam Mandi", distance: "22 km" }] },
  { name: "Sanwer", nameHi: "सांवेर", mandis: [{ name: "Sanwer Mandi", distance: "0 km" }, { name: "Indore Mandi", distance: "22 km" }] },
  { name: "Shujalpur", nameHi: "शुजालपुर", mandis: [{ name: "Shujalpur Mandi", distance: "0 km" }, { name: "Shajapur Mandi", distance: "22 km" }] },
  { name: "Sonkatch", nameHi: "सोनकच्छ", mandis: [{ name: "Sonkatch Mandi", distance: "0 km" }, { name: "Dewas Mandi", distance: "22 km" }] },
  { name: "Susner", nameHi: "सुसनेर", mandis: [{ name: "Susner Mandi", distance: "0 km" }, { name: "Agar Mandi", distance: "22 km" }] },
  { name: "Teonthar", nameHi: "तिओंथर", mandis: [{ name: "Teonthar Mandi", distance: "0 km" }, { name: "Rewa Mandi", distance: "35 km" }] },
  { name: "Thandla", nameHi: "थांदला", mandis: [{ name: "Thandla Mandi", distance: "0 km" }, { name: "Jhabua Mandi", distance: "20 km" }] },
  { name: "Timarni", nameHi: "तिमरनी", mandis: [{ name: "Timarni Mandi", distance: "0 km" }, { name: "Harda Mandi", distance: "25 km" }] },
  { name: "Vijaypur", nameHi: "विजयपुर", mandis: [{ name: "Vijaypur Mandi", distance: "0 km" }, { name: "Sheopur Mandi", distance: "25 km" }] },
  { name: "Waidhan", nameHi: "वैढन", mandis: [{ name: "Waidhan Mandi", distance: "0 km" }, { name: "Singrauli Mandi", distance: "10 km" }] },
  { name: "Jabera", nameHi: "जबेरा", mandis: [{ name: "Jabera Mandi", distance: "0 km" }, { name: "Damoh Mandi", distance: "30 km" }] },
  { name: "Jobat", nameHi: "जोबट", mandis: [{ name: "Jobat Mandi", distance: "0 km" }, { name: "Alirajpur Mandi", distance: "25 km" }] },
  { name: "Pohri", nameHi: "पोहरी", mandis: [{ name: "Pohri Mandi", distance: "0 km" }, { name: "Shivpuri Mandi", distance: "30 km" }] },
  { name: "Niwari", nameHi: "निवाड़ी", mandis: [{ name: "Niwari Mandi", distance: "0 km" }, { name: "Tikamgarh Mandi", distance: "30 km" }] },
];

// All Indian States with major cities
export const ALL_INDIA_STATES: StateData[] = [
  {
    name: "Andhra Pradesh",
    nameHi: "आंध्र प्रदेश",
    cities: [
      { name: "Visakhapatnam", nameHi: "विशाखापट्टनम", mandis: [{ name: "Visakhapatnam Mandi", distance: "0 km" }] },
      { name: "Vijayawada", nameHi: "विजयवाड़ा", mandis: [{ name: "Vijayawada Mandi", distance: "0 km" }] },
      { name: "Guntur", nameHi: "गुंटूर", mandis: [{ name: "Guntur Mandi", distance: "0 km" }] },
      { name: "Tirupati", nameHi: "तिरुपति", mandis: [{ name: "Tirupati Mandi", distance: "0 km" }] },
      { name: "Kurnool", nameHi: "कुरनूल", mandis: [{ name: "Kurnool Mandi", distance: "0 km" }] },
    ],
  },
  {
    name: "Arunachal Pradesh",
    nameHi: "अरुणाचल प्रदेश",
    cities: [
      { name: "Itanagar", nameHi: "ईटानगर", mandis: [{ name: "Itanagar Mandi", distance: "0 km" }] },
    ],
  },
  {
    name: "Assam",
    nameHi: "असम",
    cities: [
      { name: "Guwahati", nameHi: "गुवाहाटी", mandis: [{ name: "Guwahati Mandi", distance: "0 km" }] },
      { name: "Dibrugarh", nameHi: "डिब्रूगढ़", mandis: [{ name: "Dibrugarh Mandi", distance: "0 km" }] },
      { name: "Silchar", nameHi: "सिलचर", mandis: [{ name: "Silchar Mandi", distance: "0 km" }] },
    ],
  },
  {
    name: "Bihar",
    nameHi: "बिहार",
    cities: [
      { name: "Patna", nameHi: "पटना", mandis: [{ name: "Patna Mandi", distance: "0 km" }] },
      { name: "Gaya", nameHi: "गया", mandis: [{ name: "Gaya Mandi", distance: "0 km" }] },
      { name: "Muzaffarpur", nameHi: "मुजफ्फरपुर", mandis: [{ name: "Muzaffarpur Mandi", distance: "0 km" }] },
      { name: "Bhagalpur", nameHi: "भागलपुर", mandis: [{ name: "Bhagalpur Mandi", distance: "0 km" }] },
      { name: "Darbhanga", nameHi: "दरभंगा", mandis: [{ name: "Darbhanga Mandi", distance: "0 km" }] },
    ],
  },
  {
    name: "Chhattisgarh",
    nameHi: "छत्तीसगढ़",
    cities: [
      { name: "Raipur", nameHi: "रायपुर", mandis: [{ name: "Raipur Mandi", distance: "0 km" }] },
      { name: "Bhilai", nameHi: "भिलाई", mandis: [{ name: "Bhilai Mandi", distance: "0 km" }] },
      { name: "Bilaspur", nameHi: "बिलासपुर", mandis: [{ name: "Bilaspur Mandi", distance: "0 km" }] },
      { name: "Durg", nameHi: "दुर्ग", mandis: [{ name: "Durg Mandi", distance: "0 km" }] },
    ],
  },
  {
    name: "Goa",
    nameHi: "गोवा",
    cities: [
      { name: "Panaji", nameHi: "पणजी", mandis: [{ name: "Panaji Mandi", distance: "0 km" }] },
      { name: "Margao", nameHi: "मडगाव", mandis: [{ name: "Margao Mandi", distance: "0 km" }] },
    ],
  },
  {
    name: "Gujarat",
    nameHi: "गुजरात",
    cities: [
      { name: "Ahmedabad", nameHi: "अहमदाबाद", mandis: [{ name: "Ahmedabad APMC", distance: "0 km" }] },
      { name: "Surat", nameHi: "सूरत", mandis: [{ name: "Surat Mandi", distance: "0 km" }] },
      { name: "Vadodara", nameHi: "वडोदरा", mandis: [{ name: "Vadodara Mandi", distance: "0 km" }] },
      { name: "Rajkot", nameHi: "राजकोट", mandis: [{ name: "Rajkot Mandi", distance: "0 km" }] },
      { name: "Bhavnagar", nameHi: "भावनगर", mandis: [{ name: "Bhavnagar Mandi", distance: "0 km" }] },
    ],
  },
  {
    name: "Haryana",
    nameHi: "हरियाणा",
    cities: [
      { name: "Gurugram", nameHi: "गुरुग्राम", mandis: [{ name: "Gurugram Mandi", distance: "0 km" }] },
      { name: "Faridabad", nameHi: "फरीदाबाद", mandis: [{ name: "Faridabad Mandi", distance: "0 km" }] },
      { name: "Panipat", nameHi: "पानीपत", mandis: [{ name: "Panipat Mandi", distance: "0 km" }] },
      { name: "Ambala", nameHi: "अंबाला", mandis: [{ name: "Ambala Mandi", distance: "0 km" }] },
      { name: "Karnal", nameHi: "करनाल", mandis: [{ name: "Karnal Mandi", distance: "0 km" }] },
    ],
  },
  {
    name: "Himachal Pradesh",
    nameHi: "हिमाचल प्रदेश",
    cities: [
      { name: "Shimla", nameHi: "शिमला", mandis: [{ name: "Shimla Mandi", distance: "0 km" }] },
      { name: "Dharamshala", nameHi: "धर्मशाला", mandis: [{ name: "Dharamshala Mandi", distance: "0 km" }] },
      { name: "Manali", nameHi: "मनाली", mandis: [{ name: "Manali Mandi", distance: "0 km" }] },
    ],
  },
  {
    name: "Jharkhand",
    nameHi: "झारखंड",
    cities: [
      { name: "Ranchi", nameHi: "रांची", mandis: [{ name: "Ranchi Mandi", distance: "0 km" }] },
      { name: "Jamshedpur", nameHi: "जमशेदपुर", mandis: [{ name: "Jamshedpur Mandi", distance: "0 km" }] },
      { name: "Dhanbad", nameHi: "धनबाद", mandis: [{ name: "Dhanbad Mandi", distance: "0 km" }] },
    ],
  },
  {
    name: "Karnataka",
    nameHi: "कर्नाटक",
    cities: [
      { name: "Bengaluru", nameHi: "बेंगलुरु", mandis: [{ name: "Bengaluru APMC", distance: "0 km" }] },
      { name: "Mysuru", nameHi: "मैसूरु", mandis: [{ name: "Mysuru Mandi", distance: "0 km" }] },
      { name: "Mangaluru", nameHi: "मंगलुरु", mandis: [{ name: "Mangaluru Mandi", distance: "0 km" }] },
      { name: "Hubballi", nameHi: "हुब्बल्ली", mandis: [{ name: "Hubballi Mandi", distance: "0 km" }] },
    ],
  },
  {
    name: "Kerala",
    nameHi: "केरल",
    cities: [
      { name: "Thiruvananthapuram", nameHi: "तिरुवनंतपुरम", mandis: [{ name: "Thiruvananthapuram Mandi", distance: "0 km" }] },
      { name: "Kochi", nameHi: "कोच्चि", mandis: [{ name: "Kochi Mandi", distance: "0 km" }] },
      { name: "Kozhikode", nameHi: "कोझिकोड", mandis: [{ name: "Kozhikode Mandi", distance: "0 km" }] },
    ],
  },
  {
    name: "Madhya Pradesh",
    nameHi: "मध्य प्रदेश",
    cities: MP_CITIES,
  },
  {
    name: "Maharashtra",
    nameHi: "महाराष्ट्र",
    cities: [
      { name: "Mumbai", nameHi: "मुंबई", mandis: [{ name: "Mumbai APMC Vashi", distance: "0 km" }] },
      { name: "Pune", nameHi: "पुणे", mandis: [{ name: "Pune Mandi", distance: "0 km" }] },
      { name: "Nagpur", nameHi: "नागपुर", mandis: [{ name: "Nagpur Mandi", distance: "0 km" }] },
      { name: "Nashik", nameHi: "नासिक", mandis: [{ name: "Nashik Mandi", distance: "0 km" }] },
      { name: "Aurangabad", nameHi: "औरंगाबाद", mandis: [{ name: "Aurangabad Mandi", distance: "0 km" }] },
      { name: "Solapur", nameHi: "सोलापुर", mandis: [{ name: "Solapur Mandi", distance: "0 km" }] },
    ],
  },
  {
    name: "Manipur",
    nameHi: "मणिपुर",
    cities: [
      { name: "Imphal", nameHi: "इंफाल", mandis: [{ name: "Imphal Mandi", distance: "0 km" }] },
    ],
  },
  {
    name: "Meghalaya",
    nameHi: "मेघालय",
    cities: [
      { name: "Shillong", nameHi: "शिलांग", mandis: [{ name: "Shillong Mandi", distance: "0 km" }] },
    ],
  },
  {
    name: "Mizoram",
    nameHi: "मिजोरम",
    cities: [
      { name: "Aizawl", nameHi: "आइजोल", mandis: [{ name: "Aizawl Mandi", distance: "0 km" }] },
    ],
  },
  {
    name: "Nagaland",
    nameHi: "नागालैंड",
    cities: [
      { name: "Kohima", nameHi: "कोहिमा", mandis: [{ name: "Kohima Mandi", distance: "0 km" }] },
      { name: "Dimapur", nameHi: "दीमापुर", mandis: [{ name: "Dimapur Mandi", distance: "0 km" }] },
    ],
  },
  {
    name: "Odisha",
    nameHi: "ओडिशा",
    cities: [
      { name: "Bhubaneswar", nameHi: "भुवनेश्वर", mandis: [{ name: "Bhubaneswar Mandi", distance: "0 km" }] },
      { name: "Cuttack", nameHi: "कटक", mandis: [{ name: "Cuttack Mandi", distance: "0 km" }] },
      { name: "Rourkela", nameHi: "राउरकेला", mandis: [{ name: "Rourkela Mandi", distance: "0 km" }] },
    ],
  },
  {
    name: "Punjab",
    nameHi: "पंजाब",
    cities: [
      { name: "Ludhiana", nameHi: "लुधियाना", mandis: [{ name: "Ludhiana Grain Market", distance: "0 km" }] },
      { name: "Amritsar", nameHi: "अमृतसर", mandis: [{ name: "Amritsar Mandi", distance: "0 km" }] },
      { name: "Jalandhar", nameHi: "जालंधर", mandis: [{ name: "Jalandhar Mandi", distance: "0 km" }] },
      { name: "Patiala", nameHi: "पटियाला", mandis: [{ name: "Patiala Mandi", distance: "0 km" }] },
    ],
  },
  {
    name: "Rajasthan",
    nameHi: "राजस्थान",
    cities: [
      { name: "Jaipur", nameHi: "जयपुर", mandis: [{ name: "Jaipur Mandi", distance: "0 km" }] },
      { name: "Jodhpur", nameHi: "जोधपुर", mandis: [{ name: "Jodhpur Mandi", distance: "0 km" }] },
      { name: "Kota", nameHi: "कोटा", mandis: [{ name: "Kota Mandi", distance: "0 km" }] },
      { name: "Bikaner", nameHi: "बीकानेर", mandis: [{ name: "Bikaner Mandi", distance: "0 km" }] },
      { name: "Ajmer", nameHi: "अजमेर", mandis: [{ name: "Ajmer Mandi", distance: "0 km" }] },
      { name: "Udaipur", nameHi: "उदयपुर", mandis: [{ name: "Udaipur Mandi", distance: "0 km" }] },
    ],
  },
  {
    name: "Sikkim",
    nameHi: "सिक्किम",
    cities: [
      { name: "Gangtok", nameHi: "गंगटोक", mandis: [{ name: "Gangtok Mandi", distance: "0 km" }] },
    ],
  },
  {
    name: "Tamil Nadu",
    nameHi: "तमिलनाडु",
    cities: [
      { name: "Chennai", nameHi: "चेन्नई", mandis: [{ name: "Chennai Koyambedu Mandi", distance: "0 km" }] },
      { name: "Coimbatore", nameHi: "कोयंबटूर", mandis: [{ name: "Coimbatore Mandi", distance: "0 km" }] },
      { name: "Madurai", nameHi: "मदुरई", mandis: [{ name: "Madurai Mandi", distance: "0 km" }] },
      { name: "Salem", nameHi: "सेलम", mandis: [{ name: "Salem Mandi", distance: "0 km" }] },
      { name: "Trichy", nameHi: "त्रिची", mandis: [{ name: "Trichy Mandi", distance: "0 km" }] },
    ],
  },
  {
    name: "Telangana",
    nameHi: "तेलंगाना",
    cities: [
      { name: "Hyderabad", nameHi: "हैदराबाद", mandis: [{ name: "Hyderabad Mandi", distance: "0 km" }] },
      { name: "Warangal", nameHi: "वारंगल", mandis: [{ name: "Warangal Mandi", distance: "0 km" }] },
      { name: "Nizamabad", nameHi: "निजामाबाद", mandis: [{ name: "Nizamabad Mandi", distance: "0 km" }] },
    ],
  },
  {
    name: "Tripura",
    nameHi: "त्रिपुरा",
    cities: [
      { name: "Agartala", nameHi: "अगरतला", mandis: [{ name: "Agartala Mandi", distance: "0 km" }] },
    ],
  },
  {
    name: "Uttar Pradesh",
    nameHi: "उत्तर प्रदेश",
    cities: [
      { name: "Lucknow", nameHi: "लखनऊ", mandis: [{ name: "Lucknow Mandi", distance: "0 km" }] },
      { name: "Kanpur", nameHi: "कानपुर", mandis: [{ name: "Kanpur Mandi", distance: "0 km" }] },
      { name: "Agra", nameHi: "आगरा", mandis: [{ name: "Agra Mandi", distance: "0 km" }] },
      { name: "Varanasi", nameHi: "वाराणसी", mandis: [{ name: "Varanasi Mandi", distance: "0 km" }] },
      { name: "Allahabad", nameHi: "प्रयागराज", mandis: [{ name: "Allahabad Mandi", distance: "0 km" }] },
      { name: "Meerut", nameHi: "मेरठ", mandis: [{ name: "Meerut Mandi", distance: "0 km" }] },
      { name: "Mathura", nameHi: "मथुरा", mandis: [{ name: "Mathura Mandi", distance: "0 km" }] },
      { name: "Bareilly", nameHi: "बरेली", mandis: [{ name: "Bareilly Mandi", distance: "0 km" }] },
      { name: "Gorakhpur", nameHi: "गोरखपुर", mandis: [{ name: "Gorakhpur Mandi", distance: "0 km" }] },
    ],
  },
  {
    name: "Uttarakhand",
    nameHi: "उत्तराखंड",
    cities: [
      { name: "Dehradun", nameHi: "देहरादून", mandis: [{ name: "Dehradun Mandi", distance: "0 km" }] },
      { name: "Haridwar", nameHi: "हरिद्वार", mandis: [{ name: "Haridwar Mandi", distance: "0 km" }] },
      { name: "Roorkee", nameHi: "रुड़की", mandis: [{ name: "Roorkee Mandi", distance: "0 km" }] },
    ],
  },
  {
    name: "West Bengal",
    nameHi: "पश्चिम बंगाल",
    cities: [
      { name: "Kolkata", nameHi: "कोलकाता", mandis: [{ name: "Kolkata Mandi", distance: "0 km" }] },
      { name: "Asansol", nameHi: "आसनसोल", mandis: [{ name: "Asansol Mandi", distance: "0 km" }] },
      { name: "Siliguri", nameHi: "सिलीगुड़ी", mandis: [{ name: "Siliguri Mandi", distance: "0 km" }] },
    ],
  },
  // Union Territories
  {
    name: "Delhi",
    nameHi: "दिल्ली",
    cities: [
      { name: "New Delhi", nameHi: "नई दिल्ली", mandis: [{ name: "Azadpur Mandi", distance: "0 km" }, { name: "Okhla Mandi", distance: "10 km" }] },
      { name: "Dwarka", nameHi: "द्वारका", mandis: [{ name: "Azadpur Mandi", distance: "15 km" }] },
    ],
  },
  {
    name: "Jammu & Kashmir",
    nameHi: "जम्मू और कश्मीर",
    cities: [
      { name: "Srinagar", nameHi: "श्रीनगर", mandis: [{ name: "Srinagar Mandi", distance: "0 km" }] },
      { name: "Jammu", nameHi: "जम्मू", mandis: [{ name: "Jammu Mandi", distance: "0 km" }] },
    ],
  },
  {
    name: "Chandigarh",
    nameHi: "चंडीगढ़",
    cities: [
      { name: "Chandigarh", nameHi: "चंडीगढ़", mandis: [{ name: "Chandigarh Mandi", distance: "0 km" }] },
    ],
  },
];

export function getAllCities(): { city: CityData; state: StateData }[] {
  const result: { city: CityData; state: StateData }[] = [];
  for (const state of ALL_INDIA_STATES) {
    for (const city of state.cities) {
      result.push({ city, state });
    }
  }
  return result;
}

export function searchCities(query: string): { city: CityData; state: StateData }[] {
  const q = query.toLowerCase().trim();
  if (!q) return getAllCities();
  return getAllCities().filter(
    ({ city, state }) =>
      city.name.toLowerCase().includes(q) ||
      city.nameHi.includes(q) ||
      state.name.toLowerCase().includes(q) ||
      state.nameHi.includes(q)
  );
}

export function getCitiesForState(stateName: string): CityData[] {
  const state = ALL_INDIA_STATES.find((s) => s.name === stateName);
  return state ? state.cities : [];
}
