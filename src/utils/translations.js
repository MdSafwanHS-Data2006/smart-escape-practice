/**
 * Centralized English and Bangla translations for Smart Escape.
 * Dataset-provided labels remain in their original form and are not translated here.
 */

export const translations = {
  en: {
    // App header
    appTitle: 'Smart Escape',
    appSubtitle: 'Emergency Evacuation Path Finder',
    langToggle: 'বাংলা',
    langName: 'English',

    // File loading
    importJson: 'Import JSON',
    useSample: 'Load Sample Building',
    fileErrorTitle: 'Invalid JSON Dataset',
    closeError: 'Dismiss',

    // Mode selection & Controls
    modeLabel: 'Mode:',
    modeSelectStart: 'Select Start Location',
    modeToggleHazard: 'Toggle Hazards',
    resetButton: 'Reset to Initial State',

    // Statuses
    statusNoStart: 'Select a starting room or junction on the map or from the list below.',
    statusRouteFound: 'Optimal escape route found',
    statusNoRoute: 'No route available',
    statusStartBlocked: 'Starting location blocked',
    statusInvalidStart: 'Exits cannot be chosen as starting locations.',
    totalCost: 'Total Cost',
    destinationExit: 'Destination Exit',
    pathSteps: 'Route Sequence',

    // Start location selector
    startLocationLabel: 'Selected Start Location',
    chooseStartPrompt: '-- Choose Start Location --',
    noneSelected: 'None',

    // Hazard lists
    hazardsTitle: 'Active Hazards & Closures',
    blockedNodesLabel: 'Blocked Nodes',
    blockedEdgesLabel: 'Blocked Corridors',
    closedExitsLabel: 'Closed Exits',
    noBlockedNodes: 'No blocked nodes',
    noBlockedEdges: 'No blocked corridors',
    noClosedExits: 'No closed exits',
    clickToToggle: 'Click to toggle',

    // Map Legend & Instructions
    legendTitle: 'Legend',
    legendRoom: 'Room',
    legendJunction: 'Junction',
    legendExit: 'Open Exit',
    legendClosedExit: 'Closed Exit',
    legendStart: 'Selected Start',
    legendBlockedNode: 'Blocked Node',
    legendRoute: 'Escape Route',
    legendBlockedEdge: 'Blocked Corridor',
    mapInstructions: 'Tip: Switch modes above to either select your starting point or click nodes/corridors to toggle hazard states in real time.',
  },

  bn: {
    // App header
    appTitle: 'স্মার্ট এস্কেপ',
    appSubtitle: 'জরুরি বহির্গমন পথ নির্দেশক',
    langToggle: 'English',
    langName: 'বাংলা',

    // File loading
    importJson: 'JSON ইমপোর্ট করুন',
    useSample: 'নমুনা ভবন লোড করুন',
    fileErrorTitle: 'ত্রুটিপূর্ণ JSON ডেটাসেট',
    closeError: 'বাতিল করুন',

    // Mode selection & Controls
    modeLabel: 'মোড:',
    modeSelectStart: 'শুরুর অবস্থান নির্বাচন',
    modeToggleHazard: 'বিপদ টগল করুন',
    resetButton: 'প্রাথমিক অবস্থায় রিসেট',

    // Statuses
    statusNoStart: 'মানচিত্রে বা তালিকা থেকে একটি শুরুর রুম বা জাংশন নির্বাচন করুন।',
    statusRouteFound: 'সর্বোত্তম বহির্গমন পথ পাওয়া গেছে',
    statusNoRoute: 'No route available (কোনো পথ পাওয়া যায়নি)',
    statusStartBlocked: 'Starting location blocked (শুরুর অবস্থানটি অবরুদ্ধ)',
    statusInvalidStart: 'বহির্গমন পথকে শুরুর স্থান হিসেবে নির্বাচন করা যাবে না।',
    totalCost: 'মোট খরচ',
    destinationExit: 'গন্তব্য বহির্গমন পথ',
    pathSteps: 'পথের পর্যায়ক্রম',

    // Start location selector
    startLocationLabel: 'নির্বাচিত শুরুর অবস্থান',
    chooseStartPrompt: '-- শুরুর অবস্থান বেছে নিন --',
    noneSelected: 'কোনোটি নয়',

    // Hazard lists
    hazardsTitle: 'সক্রিয় বিপদ ও বন্ধ পথসমূহ',
    blockedNodesLabel: 'অবরুদ্ধ নোডসমূহ',
    blockedEdgesLabel: 'অবরুদ্ধ করিডোরসমূহ',
    closedExitsLabel: 'বন্ধ বহির্গমন পথসমূহ',
    noBlockedNodes: 'কোনো অবরুদ্ধ নোড নেই',
    noBlockedEdges: 'কোনো অবরুদ্ধ করিডোর নেই',
    noClosedExits: 'কোনো বন্ধ বহির্গমন পথ নেই',
    clickToToggle: 'টগল করতে ক্লিক করুন',

    // Map Legend & Instructions
    legendTitle: 'সংকেতচিহ্ন (লেজেন্ড)',
    legendRoom: 'রুম',
    legendJunction: 'জাংশন',
    legendExit: 'খোলা বহির্গমন পথ',
    legendClosedExit: 'বন্ধ বহির্গমন পথ',
    legendStart: 'শুরুর অবস্থান',
    legendBlockedNode: 'অবরুদ্ধ নোড',
    legendRoute: 'বহির্গমন পথ',
    legendBlockedEdge: 'অবরুদ্ধ করিডোর',
    mapInstructions: 'পরামর্শ: উপরের মোড পরিবর্তন করে শুরুর অবস্থান নির্ধারণ করুন অথবা যেকোনো নোড/করিডোরে ক্লিক করে তাৎক্ষণিক বিপদ পরিবর্তন করুন।',
  },
};

/**
 * Translation helper function.
 * @param {string} key
 * @param {'en'|'bn'} lang
 * @returns {string}
 */
export function t(key, lang = 'en') {
  const dict = translations[lang] || translations.en;
  return dict[key] !== undefined ? dict[key] : (translations.en[key] || key);
}
