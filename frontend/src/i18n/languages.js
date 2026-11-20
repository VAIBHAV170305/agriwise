/**
 * Supported Languages configuration for AgriWise
 * Keeping only functional languages (English) active for now.
 * Non-working / partial translation languages are temporarily commented out per UI/UX cleanup requirements.
 */
export const SUPPORTED_LANGUAGES = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    region: 'Pan-India / Official',
    short: 'EN',
    greeting: 'Welcome Farmer Friend'
  }
  /*
  // Regional languages temporarily paused while full multilingual dictionaries undergo localization
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    region: 'North & Central India (UP, MP, Bihar, Rajasthan, Haryana)',
    short: 'हि',
    greeting: 'नमस्ते किसान भाई'
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    region: 'Gujarat & Western India (Anand, Saurashtra, Kutch)',
    short: 'ગુ',
    greeting: 'નમસ્તે ખેડૂત મિત્ર'
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    region: 'Punjab & North-West (Grain Basket of India)',
    short: 'ਪੰ',
    greeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ'
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    region: 'Maharashtra & Western Ghats',
    short: 'म',
    greeting: 'नमस्कार शेतकरी मित्र'
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    region: 'Andhra Pradesh & Telangana',
    short: 'తె',
    greeting: 'నమస్కారం రైతు సోదరులారా'
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    region: 'Tamil Nadu & Cauvery Delta',
    short: 'த',
    greeting: 'வணக்கம் விவசாய தோழர்களே'
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    region: 'West Bengal & Eastern Plains',
    short: 'বা',
    greeting: 'নমস্কার কৃষক ভাই ও বোনেরা'
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    region: 'Karnataka & Deccan Plateau',
    short: 'ಕ',
    greeting: 'ನಮಸ್ಕಾರ ರೈತ ಮಿತ್ರರೇ'
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    region: 'Kerala & Western Coast',
    short: 'മ',
    greeting: 'നമസ്കാരം കർഷക സുഹൃത്തുക്കളെ'
  },
  {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    region: 'Odisha & Mahanadi Valley',
    short: 'ଓ',
    greeting: 'ନମସ୍କାର ଚାଷୀ ଭାଇ ଓ ଭଉଣୀ'
  }
  */
];

export const DEFAULT_LANGUAGE = 'en';
