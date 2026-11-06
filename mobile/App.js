import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  Image,
  Modal,
  Alert
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { mobileApi } from './src/services/apiClient';
import { SERVICES as WEB_APP_SERVICES } from './src/data/servicesData';

const { width } = Dimensions.get('window');

// Local Image Assets matching the official Urban Company mobile app designs
const IMAGES = {
  // Category Icons
  catInstahelp: require('./assets/images/categories/cat_instahelp.jpg'),
  catWomensSalon: require('./assets/images/categories/cat_womens_salon.jpg'),
  catMensSalon: require('./assets/images/categories/cat_mens_salon.jpg'),
  catCleaning: require('./assets/images/categories/cat_cleaning.jpg'),
  catPainting: require('./assets/images/categories/cat_painting.jpg'),
  catAc: require('./assets/images/categories/cat_ac.jpg'),
  catRepairs: require('./assets/images/categories/cat_repairs.jpg'),
  catLock: require('./assets/images/categories/cat_lock.jpg'),
  catPurifier: require('./assets/images/categories/cat_purifier.jpg'),
  heroAc: require('./assets/images/hero_ac.jpg'),
  nativeSmartLockHero: require('./assets/images/native_smart_lock.jpg'),
  beautyArmTreatment: require('./assets/images/beauty_arm_treatment.jpg'),

  // Spotlight & Curations
  spotlightWaxing: require('./assets/images/spotlight_waxing.jpg'),
  spotlightMassage: require('./assets/images/spotlight_massage.jpg'),
  spotlightGlow: require('./assets/images/spotlight_japanese_glow.jpg'),

  // Services
  homeSofaClean: require('./assets/images/home_sofa_clean.jpg'),
  homePainter: require('./assets/images/home_painter.jpg'),
  livingBedroomClean: require('./assets/images/cleaning_bedroom_bucket.jpg'),
  nativePurifier: require('./assets/images/native_m1_purifier.jpg'),
  nativePurifierM3: require('./assets/images/native_purifier.jpg'),
  stoveRepair: require('./assets/images/kitchen_stove_clean.jpg'),
  laptopRepair: require('./assets/images/laptop_dell_xps.jpg'),
  hairStudioWomen: require('./assets/images/hair_wavy_back.jpg'),
  acService: require('./assets/images/appliance_ac.jpg'),
  acCard: require('./assets/images/ac_service_card.jpg'),
  homeBathroom: require('./assets/images/home_bathroom.jpg'),
  fanRepair: require('./assets/images/fan_repair.jpg'),
  ceilingFanInstall: require('./assets/images/ceiling_fan_install.jpg'),
  beautyMensHaircut: require('./assets/images/beauty_mens_haircut.jpg'),
  beautyPedicure: require('./assets/images/beauty_pedicure.jpg'),
  headMassage: require('./assets/images/hair_head_massage_relax.jpg'),
  homeFestive: require('./assets/images/home_festive.jpg'),
  decorAbstractFrame: require('./assets/images/decor_abstract_frame.jpg'),
  salonFestive: require('./assets/images/salon_festive_glow.jpg'),

  // New Sections: Appliances, Electrical, Plumbing, Men's Salon & Massage
  homeElectrician: require('./assets/images/home_electrician.jpg'),
  internalWiring: require('./assets/images/internal_wiring.jpg'),
  washBasin: require('./assets/images/wash_basin.jpg'),
  washerMachine: require('./assets/images/appliance_washer.jpg'),
  washerServiceItem: require('./assets/images/washing_machine_checkup_item.jpg'),
  menCleanShave: require('./assets/images/men_clean_shave_pro.jpg'),
  menHaircutPro: require('./assets/images/men_haircut_pro.jpg'),
  menHeadNeckShoulder: require('./assets/images/men_head_neck_shoulder.jpg'),
  heroMassage: require('./assets/images/hero_massage.jpg'),

  // All Services Modal Catalog Images
  applianceFridge: require('./assets/images/appliance_fridge.jpg'),
  applianceTv: require('./assets/images/appliance_tv.jpg'),
  applianceMicrowave: require('./assets/images/appliance_microwave.jpg'),
  applianceChimney: require('./assets/images/appliance_chimney.jpg'),
  applianceWaterPurifier: require('./assets/images/appliance_water_purifier.jpg'),
  doorRepairWood: require('./assets/images/door_repair_wood.jpg'),
  cupboardDrawerTable: require('./assets/images/cupboard_drawer_table.jpg'),
  cockroachSpray: require('./assets/images/cockroach_spray_can.jpg'),

  // Beauty Tab Images
  salonRollonWaxing: require('./assets/images/salon_rollon_waxing.jpg'),
  hairBlowdryCurl: require('./assets/images/hair_blowdry_curl.jpg'),
  hairCurlsWaves: require('./assets/images/hair_curls_waves.jpg'),
  hairStraightening: require('./assets/images/hair_straightening.jpg'),
  menHydratingFacial: require('./assets/images/men_prime_hydrating_facial.jpg'),
  menBeardTrim: require('./assets/images/men_prime_beard_trim.jpg'),

  // Beauty Tab Images & Icons (Direct from Reference Screenshots)
  beautyWomenAvatar: require('./assets/images/icon_salon_women_avatar.jpg'),
  beautyMenAvatar: require('./assets/images/icon_salon_men_avatar.jpg'),
  beautySpaPrime: require('./assets/images/icon_spa_prime.jpg'),
  beautyHairDryer: require('./assets/images/icon_hair_dryer.jpg'),
  beautyMassageBed: require('./assets/images/icon_massage_bed.jpg'),
  beautyJapaneseRitual: require('./assets/images/beauty_japanese_ritual.jpg'),
  beautyHeroKglow: require('./assets/images/beauty_hero_kglow.jpg'),
  beautyKoreanGlowFacial: require('./assets/images/beauty_korean_glow_facial.jpg'),
  beautyDeepTissueWomen: require('./assets/images/beauty_deep_tissue_women.jpg'),
  beautyBlowdry: require('./assets/images/beauty_blowdry.jpg'),
  beautyCurlsWaves: require('./assets/images/beauty_curls_waves.jpg'),
  beautyStraightening: require('./assets/images/beauty_straightening.jpg'),
  beautyHeroTrimmed: require('./assets/images/beauty_hero_trimmed.jpg'),
  beautySkinHydrating: require('./assets/images/beauty_skin_hydrating.jpg'),
  beautyMenHaircutCard: require('./assets/images/beauty_men_haircut_card.jpg'),
  beautyBeardTrimCard: require('./assets/images/beauty_beard_trim_card.jpg'),
  beautyHeroPainRelief: require('./assets/images/beauty_hero_pain_relief.jpg'),
  beautyMassageMenCard: require('./assets/images/beauty_massage_men_card.jpg'),

  // Native Products Tab Images (Direct from Reference Screenshots)
  nativeTilePurifiers: require('./assets/images/native_tile_purifiers.jpg'),
  nativeTileLocks: require('./assets/images/native_tile_locks.jpg'),
  nativeM2ProLtd: require('./assets/images/native_m2_pro_ltd.jpg'),
  nativeM3Pro: require('./assets/images/native_m3_pro.jpg'),
  nativeM3Basic: require('./assets/images/native_m3_basic.jpg'),
  nativeHeroStory: require('./assets/images/native_hero_story.jpg'),
  nativeLockUltra: require('./assets/images/native_lock_ultra.jpg'),
  nativeLockPro: require('./assets/images/native_lock_pro.jpg'),
  nativeExclusiveBank: require('./assets/images/native_exclusive_bank.jpg'),
  nativeExclusiveExchange: require('./assets/images/native_exclusive_exchange.jpg'),
  nativeAdvantageInstall: require('./assets/images/native_advantage_install.jpg'),
  nativeAdvantageSupport: require('./assets/images/native_advantage_support.jpg'),
  nativePedestals: require('./assets/images/native_pedestals.jpg'),
  nativeLabCollage: require('./assets/images/native_lab_collage.jpg'),
  iconNativeTab: require('./assets/images/icon_native_tab.jpg'),
  iconTabUc: require('./assets/images/icon_tab_uc.png'),
  iconTabBeauty: require('./assets/images/icon_tab_beauty.png'),
  iconTabNative: require('./assets/images/icon_tab_native.png'),
  iconTabHomes: require('./assets/images/icon_tab_homes.png'),
  iconTabRewards: require('./assets/images/icon_tab_rewards.png'),
};

// Safe Image component with graceful fallback
const SafeImage = ({ source, style, fallbackIcon = '✨' }) => {
  const [hasError, setHasError] = useState(false);
  if (hasError || !source) {
    return (
      <View style={[style, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }]}>
        <Text style={{ fontSize: 22 }}>{fallbackIcon}</Text>
      </View>
    );
  }
  return (
    <Image
      source={source}
      style={style}
      onError={() => setHasError(true)}
    />
  );
};

// 1. Festive Banner Cards
const FESTIVE_CARDS = [
  {
    id: 'festive-1',
    title: 'InstaHelp by UC',
    tag: null,
    image: IMAGES.catInstahelp,
    bgColor: '#3B0764',
  },
  {
    id: 'festive-2',
    title: 'Deep cleaning',
    tag: 'Up to 20% off',
    image: IMAGES.homeSofaClean,
    bgColor: '#4C1D95',
  },
  {
    id: 'festive-3',
    title: 'Festive ready',
    tag: '25% off',
    image: IMAGES.salonFestive,
    bgColor: '#581C87',
  },
  {
    id: 'festive-4',
    title: 'Diwali lights & decor',
    tag: null,
    image: IMAGES.decorAbstractFrame,
    bgColor: '#311042',
  },
];

// 2. Main 8 Categories Grid
const MAIN_CATEGORIES = [
  {
    id: 'cat-1',
    name: 'InstaHelp by UC',
    image: IMAGES.catInstahelp,
    badge: 'Price Drop',
    badgeType: 'green-pill-top',
  },
  {
    id: 'cat-2',
    name: "Women's Salon",
    image: IMAGES.catWomensSalon,
    badge: null,
  },
  {
    id: 'cat-3',
    name: "Men's Salon",
    image: IMAGES.catMensSalon,
    badge: '59 mins',
    badgeType: 'bottom-pill',
  },
  {
    id: 'cat-4',
    name: 'Cleaning & Pest Control',
    image: IMAGES.catCleaning,
    badge: '55 mins',
    badgeType: 'bottom-pill',
  },
  {
    id: 'cat-5',
    name: 'Painting & Water-proofing',
    image: IMAGES.catPainting,
    badge: null,
  },
  {
    id: 'cat-6',
    name: 'AC & Appliance Repair',
    image: IMAGES.catAc,
    badge: null,
  },
  {
    id: 'cat-7',
    name: 'Electrician, Plumber & Carpenter',
    image: IMAGES.catRepairs,
    badge: '65 mins',
    badgeType: 'bottom-pill',
  },
  {
    id: 'cat-8',
    name: 'All services',
    isIcon: true,
    badge: null,
  },
];

// 3. Native Smart Products
const NATIVE_PRODUCTS = [
  {
    id: 'native-1',
    name: 'Native Purifier',
    tag: 'New',
    tagColor: '#DC2626',
    image: IMAGES.nativePurifier,
    price: '₹13,499',
    rating: '★ 4.88 (42K)',
  },
  {
    id: 'native-2',
    name: 'Native Smart Door Lock',
    tag: 'Sale',
    tagColor: '#059669',
    image: IMAGES.catLock,
    price: '₹8,999',
    rating: '★ 4.84 (18K)',
  },
];

// 4. In the Spotlight
const SPOTLIGHT_ITEMS = [
  {
    id: 'spotlight-1',
    category: 'Waxing & Facials',
    title: 'Perfect look\nwith RICA & O3+',
    buttonText: 'Book now',
    image: IMAGES.spotlightWaxing,
    price: '₹799',
    duration: '60 mins',
  },
  {
    id: 'spotlight-2',
    category: 'AC Service & Repair',
    title: 'Intense Jet Cleaning\nwith Master Pros',
    buttonText: 'Book now',
    image: IMAGES.acService,
    price: '₹499',
    duration: '45 mins',
  },
  {
    id: 'spotlight-3',
    category: 'Native by UC',
    title: 'Zero filter cost\nfor 2 whole years',
    buttonText: 'Book now',
    image: IMAGES.nativePurifier,
    price: '₹13,499',
    duration: 'Same-day',
  },
];

// 5. New and Noteworthy (4-column grid)
const NOTEWORTHY_ITEMS = [
  {
    id: 'full-home-cleaning',
    title: 'Full Home/ By\nRoom Cleaning',
    image: IMAGES.homeSofaClean,
    badge: null,
    subBadge: null,
    price: '₹1,299',
  },
  {
    id: 'full-home-painting',
    title: 'Full home painting',
    image: IMAGES.homePainter,
    badge: null,
    subBadge: null,
    price: 'Free Quote',
  },
  {
    id: 'living-bedroom-cleaning',
    title: 'Living & Bedroom\nCleaning',
    image: IMAGES.livingBedroomClean,
    badge: null,
    subBadge: null,
    price: '₹499',
  },
  {
    id: 'native-water-purifier',
    title: 'Native Water\nPurifier',
    image: IMAGES.nativePurifier,
    badge: 'New',
    subBadge: null,
    price: '₹13,499',
  },
  {
    id: 'stove-service',
    title: 'Stove Service &\nRepair',
    image: IMAGES.stoveRepair,
    badge: null,
    subBadge: null,
    price: '₹249',
  },
  {
    id: 'laptop-repair',
    title: 'Laptop Repair',
    image: IMAGES.laptopRepair,
    badge: null,
    subBadge: '⚡ 44 mins',
    price: '₹399',
  },
  {
    id: 'hair-studio-women',
    title: 'Hair Studio for\nWomen',
    image: IMAGES.hairStudioWomen,
    badge: null,
    subBadge: null,
    price: '₹599',
  },
  {
    id: 'ac-repair',
    title: 'AC',
    image: IMAGES.acService,
    badge: null,
    subBadge: null,
    price: '₹499',
  },
];

// 6. Most Booked Services
const MOST_BOOKED_ITEMS = [
  {
    id: 'most-1',
    title: 'Intense cleaning (2 bathroom)',
    image: IMAGES.homeBathroom,
    rating: '4.81 (7.9M)',
    duration: '60 MINS',
    price: '₹1,018',
    oldPrice: '₹1,098',
    btnSubtext: null,
  },
  {
    id: 'most-2',
    title: 'Foam-jet AC service',
    image: IMAGES.acCard,
    rating: '4.75 (3.1M)',
    duration: '60 MINS',
    price: 'Starts at ₹699',
    oldPrice: null,
    btnSubtext: '9 options',
  },
  {
    id: 'most-3',
    title: 'Ceiling fan repair',
    image: IMAGES.fanRepair,
    rating: '4.87 (760K)',
    duration: '20 MINS',
    price: '₹99',
    oldPrice: null,
    btnSubtext: null,
  },
];

// 7. Thoughtful Curations (Story Cards)
const CURATIONS_ITEMS = [
  {
    id: 'curation-1',
    title: 'Roll-on\nwaxing',
    image: IMAGES.spotlightWaxing,
  },
  {
    id: 'curation-2',
    title: "MEN'S\nHAIRCUT",
    image: IMAGES.beautyMensHaircut,
  },
  {
    id: 'curation-3',
    title: 'Glow\nrituals',
    image: IMAGES.beautyJapaneseRitual,
  },
];

// 8. Cleaning Essentials
const CLEANING_ESSENTIALS = [
  {
    id: 'clean-1',
    title: 'Intense cleaning (2 bathroom)',
    image: IMAGES.homeBathroom,
    rating: '4.81 (7.9M)',
    duration: '60 MINS',
    price: '₹1,018',
    oldPrice: '₹1,098',
    btnSubtext: null,
  },
  {
    id: 'clean-2',
    title: 'Ceiling fan cleaning',
    image: IMAGES.ceilingFanInstall,
    rating: '4.87 (760K)',
    duration: '15 MINS',
    price: '₹99',
    oldPrice: null,
    btnSubtext: null,
  },
  {
    id: 'clean-3',
    title: 'Furnished Full Home deep cleaning',
    image: IMAGES.livingBedroomClean,
    rating: '4.79 (1.1M)',
    duration: '4-5 HOURS',
    price: 'Starts at ₹4,499',
    oldPrice: null,
    btnSubtext: 'Options available',
  },
];

// 9. Salon for Women
const SALON_WOMEN = [
  {
    id: 'salon-1',
    title: 'Threading',
    image: IMAGES.catWomensSalon,
    rating: '4.86 (3.2M)',
    duration: '10 MINS',
    price: 'Starts at ₹49',
    btnSubtext: '8 options',
    luxe: false,
  },
  {
    id: 'salon-2',
    title: 'Hair styling & care',
    image: IMAGES.hairStudioWomen,
    rating: '4.87 (226.2K)',
    duration: '25 MINS',
    price: 'Starts at ₹249',
    btnSubtext: '2 options',
    luxe: false,
  },
  {
    id: 'salon-3',
    title: 'Threading Luxe',
    image: IMAGES.catWomensSalon,
    rating: '4.91 (520K)',
    duration: '15 MINS',
    price: 'Starts at ₹99',
    btnSubtext: null,
    luxe: true,
  },
];

// 11. Appliance Repair & Service
const APPLIANCE_SERVICES = [
  {
    id: 'appliance-1',
    title: 'Foam-jet AC service',
    image: IMAGES.acCard,
    rating: '4.75 (3.1M)',
    duration: '60 MINS',
    price: 'Starts at ₹699',
    btnSubtext: null,
  },
  {
    id: 'appliance-2',
    title: 'Washing machine checkup & repair',
    image: IMAGES.washerMachine,
    rating: '4.82 (1.4M)',
    duration: '45 MINS',
    price: 'Starts at ₹299',
    btnSubtext: null,
  },
  {
    id: 'appliance-3',
    title: 'Water purifier service & repair',
    image: IMAGES.nativePurifier,
    rating: '4.86 (2.2M)',
    duration: '60 MINS',
    price: 'Starts at ₹399',
    btnSubtext: null,
  },
];

// 12. Home Repair & Installation
const HOME_REPAIR_SERVICES = [
  {
    id: 'repair-1',
    title: 'New switchbox installation',
    image: IMAGES.internalWiring,
    rating: '4.79 (107.1K)',
    duration: '40 MINS',
    price: 'Starts at ₹199',
    btnSubtext: '4 options',
  },
  {
    id: 'repair-2',
    title: 'Tap repair',
    image: IMAGES.washBasin,
    rating: '4.80 (294.4K)',
    duration: '30 MINS',
    price: 'Starts at ₹129',
    btnSubtext: '4 options',
  },
  {
    id: 'repair-3',
    title: 'Fan repair',
    image: IMAGES.fanRepair,
    rating: '4.80 (220K)',
    duration: '30 MINS',
    price: 'Starts at ₹149',
    btnSubtext: null,
  },
];

// 13. Massage for Men (Removed)
const MASSAGE_MEN = [];

// 14. Salon for Men
const SALON_MEN = [
  {
    id: 'salon-m-1',
    title: 'Haircut for men',
    image: IMAGES.menHaircutPro,
    rating: '4.86 (490.3K)',
    duration: '30 MINS',
    price: '₹259',
    btnSubtext: null,
    luxe: false,
  },
  {
    id: 'salon-m-2',
    title: 'Clean shave',
    image: IMAGES.menCleanShave,
    rating: '4.85 (80.2K)',
    duration: '20 MINS',
    price: '₹199',
    btnSubtext: null,
    luxe: false,
  },
  {
    id: 'salon-m-3',
    title: 'Haircut for men (Luxe)',
    image: IMAGES.beautyMensHaircut,
    rating: '4.89 (135K)',
    duration: '45 MINS',
    price: '₹459',
    btnSubtext: null,
    luxe: true,
  },
];

// Beauty Tab Categories (2 rows x 3 columns - Screenshot 1)
const BEAUTY_CATEGORIES = [
  {
    id: 'b-cat-1',
    name: 'Salon for Women',
    image: IMAGES.beautyWomenAvatar,
    badge: null,
  },
  {
    id: 'b-cat-2',
    name: 'Waxing & Facials',
    image: IMAGES.salonRollonWaxing,
    badge: null,
  },
  {
    id: 'b-cat-3',
    name: 'Hair Studio for Women',
    image: IMAGES.beautyHairDryer,
    badge: null,
  },
  {
    id: 'b-cat-4',
    name: 'Salon for Men',
    image: IMAGES.beautyMenAvatar,
    badge: '68 mins',
  },
  {
    id: 'b-cat-5',
    name: 'Facials & Cleanup',
    image: IMAGES.beautySkinHydrating,
    badge: '50 mins',
  },
  {
    id: 'b-cat-6',
    name: 'All services',
    isIcon: true,
    isAllServices: true,
  },
];

// Beauty Tab: Most Booked Services (Screenshot 2)
const BEAUTY_MOST_BOOKED = [
  {
    id: 'b-most-1',
    title: 'Roll-on waxing (Full arms, legs & underarms)',
    image: IMAGES.salonRollonWaxing,
    rating: '4.86 (284.1K)',
    duration: '60 MINS',
    startsAt: true,
    price: '₹1,099',
    btnSubtext: '2 options',
  },
  {
    id: 'b-most-2',
    title: 'Hydrating cleanup & facial',
    image: IMAGES.beautySkinHydrating,
    rating: '4.85 (331.8K)',
    duration: '45 MINS',
    startsAt: true,
    price: '₹799',
    btnSubtext: null,
  },
  {
    id: 'b-most-3',
    title: 'Haircut & beard grooming',
    image: IMAGES.beautyMenHaircutCard,
    rating: '4.86 (248.9K)',
    duration: '40 MINS',
    startsAt: true,
    price: '₹399',
    btnSubtext: null,
  },
];

// Beauty Tab: Salon for Women (Screenshot 3)
const BEAUTY_SALON_WOMEN = [
  {
    id: 'b-sw-1',
    title: 'Roll-on waxing (Full arms, legs & underarms)',
    image: IMAGES.salonRollonWaxing,
    rating: '4.86 (284.1K)',
    duration: '60 MINS',
    startsAt: true,
    price: '₹1,099',
    btnSubtext: '2 options',
  },
  {
    id: 'b-sw-2',
    title: 'Korean Glow facial',
    image: IMAGES.beautyKoreanGlowFacial,
    rating: '4.82 (93.8K)',
    duration: '1 HR 20 MINS',
    startsAt: false,
    price: '₹1,399',
    btnSubtext: null,
  },
];

// Beauty Tab: Hair Studio for Women (Screenshot 4)
const BEAUTY_HAIR_STUDIO = [
  {
    id: 'b-hs-1',
    title: 'In curl/out curl blow-dry',
    image: IMAGES.beautyBlowdry,
    rating: '4.78 (70.3K)',
    duration: '45 MINS',
    startsAt: false,
    price: '₹399',
    btnSubtext: null,
  },
  {
    id: 'b-hs-2',
    title: 'Curls & waves',
    image: IMAGES.beautyCurlsWaves,
    rating: '4.72 (18.5K)',
    duration: '60 MINS',
    startsAt: false,
    price: '₹549',
    btnSubtext: null,
  },
  {
    id: 'b-hs-3',
    title: 'Hair straightening',
    image: IMAGES.beautyStraightening,
    rating: '4.86 (22K)',
    duration: '60 MINS',
    startsAt: false,
    price: '₹549',
    btnSubtext: null,
  },
];

// Beauty Tab: Salon for Men (Screenshot 5)
const BEAUTY_SALON_MEN = [
  {
    id: 'b-sm-1',
    title: 'Skin hydrating facial',
    image: IMAGES.beautySkinHydrating,
    rating: '4.73 (5.5K)',
    duration: '1 HR 5 MINS',
    startsAt: false,
    price: '₹1,399',
    btnSubtext: null,
  },
  {
    id: 'b-sm-2',
    title: 'Haircut for men',
    image: IMAGES.beautyMenHaircutCard,
    rating: '4.86 (490.3K)',
    duration: '30 MINS',
    startsAt: false,
    price: '₹259',
    btnSubtext: null,
  },
  {
    id: 'b-sm-3',
    title: 'Beard trimming & styling',
    image: IMAGES.beautyBeardTrimCard,
    rating: '4.85 (15K)',
    duration: '20 MINS',
    startsAt: false,
    price: '₹199',
    btnSubtext: null,
  },
];

// Beauty Tab: Massage for Men (Removed)
const BEAUTY_MASSAGE_MEN = [];

// Native Tab: "What are you looking for?" 6-Tile Grid (Direct reference screenshot)
const NATIVE_LOOKING_FOR_TILES = [
  {
    id: 'ac-appliances',
    title: 'Appliance Repair\n& Service',
    icon: IMAGES.catAc,
    badge: null,
  },
  {
    id: 'quick-repairs',
    title: 'Electrician,\nPlumber &...',
    icon: IMAGES.catRepairs,
    badge: '46 mins',
    badgeType: 'bottom-pill',
  },
  {
    id: 'bathroom-kitchen-cleaning',
    title: 'Bathroom &\nKitchen cleaning',
    icon: IMAGES.catCleaning,
    badge: null,
  },
  {
    id: 'cleaning',
    title: 'Cleaning',
    icon: IMAGES.catCleaning,
    badge: null,
  },
  {
    id: 'native-ro',
    title: 'Native Water\nPurifier',
    icon: IMAGES.catPurifier,
    badge: 'Sale',
    badgeType: 'top-sale',
  },
  {
    id: 'native-smart-locks',
    title: 'Native Smart\nLocks',
    icon: IMAGES.catLock,
    badge: 'Sale',
    badgeType: 'top-sale',
  },
];

// Beauty Tab: Web Categories (Matches Screenshot 3)
const BEAUTY_WEB_TILES = [
  {
    id: 'b-tile-salon-prime',
    title: 'Salon Prime',
    icon: IMAGES.beautyWomenAvatar,
    badge: null,
  },
  {
    id: 'b-tile-hair-studio',
    title: 'Hair Studio for\nWomen',
    icon: IMAGES.beautyHairDryer,
    badge: '74 mins',
    badgeType: 'purple',
  },
  {
    id: 'b-tile-salon-men',
    title: 'Salon for Men',
    icon: IMAGES.beautyMenAvatar,
    badge: null,
  },
  {
    id: 'b-tile-all',
    title: 'All services',
    isIcon: true,
    badge: null,
  },
];

// Native Tab: Quick Categories (Screenshot 1)
const NATIVE_QUICK_TILES = [
  {
    id: 'n-tile-purifiers',
    title: 'Water Purifiers',
    badge: '% ₹4,300 off',
    image: IMAGES.nativeTilePurifiers,
  },
  {
    id: 'n-tile-locks',
    title: 'Smart Locks',
    badge: '% ₹3,500 off',
    image: IMAGES.nativeTileLocks,
  },
];

// Native Tab: Newly Launched (Screenshot 1)
const NATIVE_NEWLY_LAUNCHED = [
  {
    id: 'n-nl-1',
    title: 'Native M2 Pro / Limited Edition',
    badge: '✦ Limited Edition',
    badgeType: 'gold',
    image: IMAGES.nativeM2ProLtd,
    rating: null,
    startsAt: true,
    price: '₹16,699',
    btnSubtext: '2 options',
  },
  {
    id: 'n-nl-2',
    title: 'Native M3 Pro',
    badge: '% Get it at ₹22,690',
    badgeType: 'purple',
    image: IMAGES.nativeM3Pro,
    rating: '4.85 (8.4K)',
    startsAt: true,
    price: '₹24,699',
    btnSubtext: '2 options',
  },
  {
    id: 'n-nl-3',
    title: 'Native M3',
    badge: '% Get it at ₹18,199',
    badgeType: 'purple',
    image: IMAGES.nativeM3Basic,
    rating: '4.84 (756)',
    startsAt: true,
    price: '₹20,199',
    btnSubtext: '2 options',
  },
];

// Native Tab: Water Purifiers (Screenshot 2)
const NATIVE_WATER_PURIFIERS = [
  {
    id: 'n-wp-1',
    title: 'Native M3 Pro',
    badge: '% Get it at ₹22,690',
    badgeType: 'purple',
    image: IMAGES.nativeM3Pro,
    rating: '4.85 (8.4K)',
    startsAt: true,
    price: '₹24,699',
    btnSubtext: '2 options',
  },
  {
    id: 'n-wp-2',
    title: 'Native M3',
    badge: '% Get it at ₹18,199',
    badgeType: 'purple',
    image: IMAGES.nativeM3Basic,
    rating: '4.84 (756)',
    startsAt: true,
    price: '₹20,199',
    btnSubtext: '2 options',
  },
  {
    id: 'n-wp-3',
    title: 'Native M2 Pro',
    badge: '% Get it at ₹15,199',
    badgeType: 'purple',
    image: IMAGES.nativePurifier,
    rating: '4.83 (13K)',
    startsAt: true,
    price: '₹16,699',
    btnSubtext: '2 options',
  },
];

// Native Tab: Smart Door Locks (Screenshot 3)
const NATIVE_SMART_LOCKS = [
  {
    id: 'n-sl-1',
    title: 'Native Lock Ultra',
    badge: '% Get it at ₹20,499',
    badgeType: 'purple',
    image: IMAGES.nativeLockUltra,
    rating: '4.66 (2.4K)',
    startsAt: true,
    price: '₹22,499',
    btnSubtext: '2 options',
  },
  {
    id: 'n-sl-2',
    title: 'Native Lock Pro',
    badge: '% Get it at ₹13,500',
    badgeType: 'purple',
    image: IMAGES.nativeLockPro,
    rating: '4.80 (23K)',
    startsAt: true,
    price: '₹15,000',
    btnSubtext: '2 options',
  },
];

// Native Tab: UC App Exclusive (Screenshot 3)
const NATIVE_EXCLUSIVE_CARDS = [
  {
    id: 'n-ex-1',
    image: IMAGES.nativeExclusiveBank,
  },
  {
    id: 'n-ex-2',
    image: IMAGES.nativeExclusiveExchange,
  },
];

// Native Tab: Service Advantages (Screenshot 4)
const NATIVE_ADVANTAGE_CARDS = [
  {
    id: 'n-adv-1',
    image: IMAGES.nativeAdvantageInstall,
  },
  {
    id: 'n-adv-2',
    image: IMAGES.nativeAdvantageSupport,
  },
];

// 15. All Services Full Catalog Groups (Matches the official All Services Modal)
const ALL_SERVICES_GROUPS = [
  {
    id: 'grp-instahelp',
    title: 'InstaHelp by UC',
    items: [
      {
        id: 'as-instahelp',
        name: 'InstaHelp by UC',
        image: IMAGES.catInstahelp,
        badge: 'Price Drop ●',
        price: '₹399',
      },
    ],
  },
  {
    id: 'grp-womens-salon',
    title: "Women's Salon",
    items: [
      {
        id: 'as-salon-women',
        name: 'Salon for Women',
        image: IMAGES.beautyWomenAvatar,
        badge: null,
        price: 'Starts at ₹49',
      },
      {
        id: 'as-hair-studio',
        name: 'Hair Studio for Women',
        image: IMAGES.beautyHairDryer,
        badge: null,
        price: 'Starts at ₹599',
      },
    ],
  },
  {
    id: 'grp-mens-salon',
    title: "Men's Salon",
    items: [
      {
        id: 'as-salon-men',
        name: 'Salon for Men',
        image: IMAGES.beautyMenAvatar,
        badge: null,
        price: 'Starts at ₹199',
      },
      {
        id: 'as-beard-trim',
        name: 'Beard Trimming & Styling',
        image: IMAGES.beautyBeardTrimCard,
        badge: '20 mins',
        price: 'Starts at ₹199',
      },
    ],
  },
  {
    id: 'grp-cleaning',
    title: 'Cleaning & Pest Control',
    items: [
      {
        id: 'as-bath-clean',
        name: 'Deep Bathroom Cleaning',
        image: IMAGES.homeBathroom,
        badge: null,
        price: 'Starts at ₹399',
      },
      {
        id: 'as-kitchen-clean',
        name: 'Kitchen Cleaning',
        image: IMAGES.applianceChimney,
        badge: '55 mins',
        price: 'Starts at ₹499',
      },
      {
        id: 'as-living-clean',
        name: 'Living & Bedroom Cleaning',
        image: IMAGES.livingBedroomClean,
        badge: null,
        price: 'Starts at ₹499',
      },
      {
        id: 'as-full-home',
        name: 'Full Home/ By Room Cleaning',
        image: IMAGES.homeSofaClean,
        badge: null,
        price: 'Starts at ₹1,299',
      },
      {
        id: 'as-cockroach',
        name: 'Cockroach Control',
        image: IMAGES.cockroachSpray,
        badge: '74 mins',
        price: 'Starts at ₹799',
      },
      {
        id: 'as-termite',
        name: 'Termite Control',
        image: IMAGES.cockroachSpray,
        badge: null,
        price: 'Starts at ₹999',
      },
      {
        id: 'as-bedbugs',
        name: 'Ants & Bed Bugs Control',
        image: IMAGES.cockroachSpray,
        badge: '74 mins',
        price: 'Starts at ₹899',
      },
    ],
  },
  {
    id: 'grp-painting',
    title: 'Painting & Water - proofing',
    items: [
      {
        id: 'as-painting',
        name: 'Painting & Water - proofing',
        image: IMAGES.homePainter,
        badge: null,
        price: 'Free Quote',
      },
    ],
  },
  {
    id: 'grp-appliances',
    title: 'AC & Appliance Repair',
    items: [
      {
        id: 'as-ac',
        name: 'AC',
        image: IMAGES.acCard,
        badge: '44 mins',
        price: 'Starts at ₹699',
      },
      {
        id: 'as-washer',
        name: 'Washing Machine Repair',
        image: IMAGES.washerMachine,
        badge: null,
        price: 'Starts at ₹299',
      },
      {
        id: 'as-fridge',
        name: 'Refrigerator',
        image: IMAGES.applianceFridge,
        badge: null,
        price: 'Starts at ₹249',
      },
      {
        id: 'as-tv',
        name: 'Television Repair',
        image: IMAGES.applianceTv,
        badge: null,
        price: 'Starts at ₹299',
      },
      {
        id: 'as-chimney',
        name: 'Chimney Repair',
        image: IMAGES.applianceChimney,
        badge: null,
        price: 'Starts at ₹299',
      },
      {
        id: 'as-microwave',
        name: 'Microwave',
        image: IMAGES.applianceMicrowave,
        badge: null,
        price: 'Starts at ₹249',
      },
      {
        id: 'as-stove',
        name: 'Stove Service & Repair',
        image: IMAGES.stoveRepair,
        badge: null,
        price: 'Starts at ₹249',
      },
      {
        id: 'as-laptop',
        name: 'Laptop Repair',
        image: IMAGES.laptopRepair,
        badge: '44 mins',
        price: 'Starts at ₹399',
      },
      {
        id: 'as-purifier-service',
        name: 'Water Purifier Service & Installation',
        image: IMAGES.applianceWaterPurifier,
        badge: null,
        price: 'Starts at ₹399',
      },
    ],
  },
  {
    id: 'grp-repair',
    title: 'Electrician, Plumber & Carpenter',
    items: [
      {
        id: 'as-electrician',
        name: 'Electrician',
        image: IMAGES.internalWiring,
        badge: null,
        price: 'Starts at ₹99',
      },
      {
        id: 'as-plumber',
        name: 'Plumber',
        image: IMAGES.washBasin,
        badge: null,
        price: 'Starts at ₹129',
      },
      {
        id: 'as-carpenter',
        name: 'Carpenter',
        image: IMAGES.doorRepairWood,
        badge: null,
        price: 'Starts at ₹149',
      },
      {
        id: 'as-festive-lights',
        name: 'Festival Lights Installation',
        image: IMAGES.decorAbstractFrame,
        badge: null,
        price: 'Starts at ₹499',
      },
      {
        id: 'as-furniture-assembly',
        name: 'Furniture Assembly',
        image: IMAGES.cupboardDrawerTable,
        badge: null,
        price: 'Starts at ₹349',
      },
      {
        id: 'as-ikea',
        name: 'IKEA Furniture Assembly',
        image: IMAGES.cupboardDrawerTable,
        badge: null,
        price: 'Starts at ₹399',
      },
      {
        id: 'as-fan-install',
        name: 'Fan Installation',
        image: IMAGES.ceilingFanInstall,
        badge: null,
        price: 'Starts at ₹99',
      },
    ],
  },
];

// Helper to normalize text for search and product matching
const normText = (str) =>
  (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Universal Product & Service Details Matcher connecting Mobile App directly to Web App Specs
const findFullProductDetails = (item, dbServices = []) => {
  if (!item) return null;

  const allServices = [...(dbServices || []), ...(WEB_APP_SERVICES || [])];

  const itemTitle = (item.title || item.name || '').trim();
  const itemNorm = normText(itemTitle);
  const itemId = item.id || item._id;

  // 1. Direct ID match
  let matched = null;
  if (itemId) {
    matched = allServices.find((s) => s.id === itemId || s._id === itemId);
  }

  // 2. Exact normalized title match
  if (!matched && itemNorm) {
    matched = allServices.find((s) => normText(s.title) === itemNorm);
  }

  // 3. Substring match
  if (!matched && itemNorm) {
    matched = allServices.find((s) => {
      const sNorm = normText(s.title);
      return sNorm && (sNorm.includes(itemNorm) || itemNorm.includes(sNorm));
    });
  }

  // 4. Keyword heuristic map for app cards & categories
  if (!matched && itemNorm) {
    const keyMap = [
      { trigger: ['laptop'], match: 'laptop' },
      { trigger: ['stove', 'kitchen stove', 'stove repair'], match: 'kitchen chimney' },
      { trigger: ['chimney'], match: 'kitchen chimney' },
      { trigger: ['washing machine', 'washer'], match: 'washing machine' },
      { trigger: ['fridge', 'refrigerator'], match: 'refrigerator' },
      { trigger: ['ac', 'powerjet', 'air condition'], match: 'powerjet ac' },
      { trigger: ['sofa', 'couch'], match: '5-seater sofa' },
      { trigger: ['bathroom'], match: 'intense bathroom' },
      { trigger: ['living', 'bedroom'], match: 'full home deep' },
      { trigger: ['full home', 'by room'], match: 'full home deep' },
      { trigger: ['painting', 'water proofing', 'waterproofing'], match: 'express home painting' },
      { trigger: ['m3 pro'], match: 'native m3 pro' },
      { trigger: ['m3'], match: 'native m3' },
      { trigger: ['m2 pro', 'limited edition'], match: 'native m2 pro' },
      { trigger: ['m2 copper'], match: 'native m2' },
      { trigger: ['m1'], match: 'native m1' },
      { trigger: ['purifier', 'water purifier', 'ro'], match: 'native m3' },
      { trigger: ['lock ultra', 'face recognition'], match: 'native lock ultra' },
      { trigger: ['lock pro', 'smart lock'], match: 'native lock pro' },
      { trigger: ['beard', 'men grooming', 'haircut'], match: 'expert haircut' },
      { trigger: ['men haircut', 'salon for men', 'haircut'], match: 'expert haircut' },
      { trigger: ['waxing', 'rica'], match: 'rica roll-on' },
      { trigger: ['facial', 'o3', 'japanese glow', 'korean glow'], match: 'o3+ bridal glow' },
      { trigger: ['manicure', 'pedicure'], match: 'lavender relax manicure' },
      { trigger: ['cockroach', 'pest', 'termite', 'bed bugs'], match: 'cockroach' },
      { trigger: ['fan repair', 'fan install'], match: 'ceiling fan' },
      { trigger: ['switchboard', 'electrician', 'wiring'], match: 'switchboard' },
      { trigger: ['tap', 'plumber', 'drain', 'basin', 'leak'], match: 'water tap repair' },
      { trigger: ['door lock', 'door repair', 'carpenter'], match: 'door lock repair' },
      { trigger: ['instahelp'], match: 'classic kitchen cleaning' }
    ];

    for (const km of keyMap) {
      if (km.trigger.some((t) => itemNorm.includes(t))) {
        matched = allServices.find((s) => normText(s.title).includes(km.match));
        if (matched) break;
      }
    }
  }

  // 5. Build Unified Rich Product Details
  const priceDisplay = item.price
    ? typeof item.price === 'number'
      ? `₹${item.price.toLocaleString('en-IN')}`
      : item.price
    : matched && matched.price
    ? `₹${matched.price.toLocaleString('en-IN')}`
    : '₹499';

  const origPriceDisplay =
    matched && matched.originalPrice
      ? `₹${matched.originalPrice.toLocaleString('en-IN')}`
      : item.originalPrice
      ? typeof item.originalPrice === 'number'
        ? `₹${item.originalPrice.toLocaleString('en-IN')}`
        : item.originalPrice
      : null;

  const rawInclusions =
    (matched && (matched.inclusions || matched.includedWork || matched.features)) ||
    item.inclusions ||
    item.features;
  const inclusions =
    rawInclusions && rawInclusions.length > 0
      ? rawInclusions
      : [
          'Pre-service inspection & comprehensive diagnostic test',
          'Doorstep service by background-verified certified professional',
          'Single-use sealed sanitization kit & protective drop cloths',
          'Strict multi-point safety & quality execution standard',
          'Post-service cooling / performance demonstration & cleanup'
        ];

  const rawExclusions =
    (matched && (matched.exclusions || matched.excludedWork)) || item.exclusions;
  const exclusions =
    rawExclusions && rawExclusions.length > 0
      ? rawExclusions
      : [
          'Replacement spare parts or physical hardware replacement',
          'Major civil, masonry, or structural modifications'
        ];

  const rawSteps = (matched && (matched.steps || matched.prepInstructions)) || item.steps;
  const steps =
    rawSteps && rawSteps.length > 0
      ? rawSteps
      : [
          'Master technician arrives at your chosen slot with sanitized toolkit',
          'Pre-service assessment, temperature baseline test & final quote confirmation',
          'Flawless service delivery following certified Urban Company SOP',
          'Final performance test, digital invoice generation & mess-free cleanup'
        ];

  return {
    ...matched,
    ...item,
    id: itemId || (matched && matched.id) || 'srv-' + Date.now(),
    title: itemTitle || (matched && matched.title) || 'Urban Company Service',
    category:
      (matched && (matched.categoryName || matched.category)) ||
      item.category ||
      'Urban Company Verified',
    subcategory: (matched && matched.subcategory) || item.subcategory || '',
    price: priceDisplay,
    originalPrice: origPriceDisplay,
    rating: (matched && matched.rating) || item.rating || 4.86,
    reviewsCount:
      (matched && (matched.reviewsCount || matched.reviews)) ||
      item.reviews ||
      item.reviewsCount ||
      '124K reviews',
    duration: (matched && matched.duration) || item.duration || '45 mins',
    badge: (matched && matched.badge) || item.badge || 'VERIFIED',
    tag: (matched && matched.tag) || item.tag || null,
    image: item.image || (matched && matched.image ? { uri: matched.image } : IMAGES.acService),
    description:
      (matched && matched.description) ||
      item.description ||
      'High-performance doorstep service with certified technician safety check, genuine parts assurance, and single-use protective equipment.',
    inclusions,
    exclusions,
    steps,
    warranty:
      (matched && matched.warrantyDays && `${matched.warrantyDays}-day warranty protection`) ||
      item.warranty ||
      '30-Day Urban Company Assurance'
  };
};

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [showAllServicesModal, setShowAllServicesModal] = useState(false);
  const [activeTab, setActiveTab] = useState('homes');
  const [cartCount, setCartCount] = useState(0);
  const [coinsBalance, setCoinsBalance] = useState(350);
  const [scratchedCardId, setScratchedCardId] = useState(null);
  const [dbServices, setDbServices] = useState([]);

  // Auto connect to backend and sync all live web app products
  useEffect(() => {
    mobileApi.checkHealth().catch(() => {});
    mobileApi
      .getServices()
      .then((res) => {
        if (res && res.success && Array.isArray(res.services)) {
          setDbServices(res.services);
        }
      })
      .catch(() => {});
  }, []);

  const handleAddService = (item) => {
    const fullDetails = findFullProductDetails(item, dbServices);
    setSelectedService(fullDetails);
  };

  const handleConfirmBooking = () => {
    setCartCount(prev => prev + 1);
    setCoinsBalance(prev => prev + 50); // Earn coins on booking!
    Alert.alert(
      'Service Added to Cart 🎉',
      `"${selectedService.title || selectedService.name}" has been reserved. You earned +50 UC Coins!`,
      [{ text: 'Awesome', onPress: () => setSelectedService(null) }]
    );
  };

  // 0. SEARCH RESULTS VIEW (Searching across all Web App Products & Live DB Services)
  const renderSearchResultsView = () => {
    const allServices = [...(dbServices || []), ...(WEB_APP_SERVICES || [])];
    const q = searchQuery.toLowerCase().trim();
    const results = allServices.filter(
      (s) =>
        (s.title && s.title.toLowerCase().includes(q)) ||
        (s.category && s.category.toLowerCase().includes(q)) ||
        (s.subcategory && s.subcategory.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q))
    );

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.searchResultsHeaderRow}>
          <Text style={styles.searchResultsCount}>
            Found {results.length} services for "{searchQuery}"
          </Text>
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearSearchLink}>Clear</Text>
          </TouchableOpacity>
        </View>

        {results.length === 0 ? (
          <View style={styles.noResultsBox}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🔍</Text>
            <Text style={styles.noResultsTitle}>No exact match found</Text>
            <Text style={styles.noResultsSub}>
              Try searching for AC, Purifier, Sofa, Haircut, or Painting
            </Text>
          </View>
        ) : (
          results.map((item, idx) => (
            <TouchableOpacity
              key={item.id || item._id || idx}
              style={styles.searchResultCard}
              activeOpacity={0.85}
              onPress={() => handleAddService(item)}
            >
              <View style={styles.searchResultMedia}>
                {item.image ? (
                  <SafeImage
                    source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                    style={styles.searchResultImg}
                  />
                ) : (
                  <View style={styles.searchResultImgPlaceholder}>
                    <Text style={{ fontSize: 24 }}>✨</Text>
                  </View>
                )}
                {item.badge && (
                  <View style={styles.searchResultBadge}>
                    <Text style={styles.searchResultBadgeText}>{item.badge}</Text>
                  </View>
                )}
              </View>

              <View style={styles.searchResultInfo}>
                <View style={styles.searchResultRatingRow}>
                  <Text style={styles.searchResultStar}>★ {item.rating || 4.85}</Text>
                  <Text style={styles.searchResultReviews}>
                    ({item.reviewsCount || item.reviews || '120K'})
                  </Text>
                  {item.duration && (
                    <Text style={styles.searchResultDuration}>• {item.duration}</Text>
                  )}
                </View>

                <Text style={styles.searchResultTitle} numberOfLines={2}>
                  {item.title}
                </Text>

                <Text style={styles.searchResultDesc} numberOfLines={2}>
                  {item.description}
                </Text>

                <View style={styles.searchResultBottomRow}>
                  <View style={styles.searchResultPriceRow}>
                    <Text style={styles.searchResultPrice}>
                      {typeof item.price === 'number' ? `₹${item.price.toLocaleString('en-IN')}` : item.price}
                    </Text>
                    {item.originalPrice && (
                      <Text style={styles.searchResultOrigPrice}>
                        {typeof item.originalPrice === 'number'
                          ? `₹${item.originalPrice.toLocaleString('en-IN')}`
                          : item.originalPrice}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.searchResultAddBtn}
                    onPress={() => handleAddService(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.searchResultAddBtnText}>Add +</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    );
  };

  // 1. REWARDS TAB VIEW
  const renderRewardsView = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Rewards Header */}
      <View style={styles.rewardsHeaderBanner}>
        <Text style={styles.rewardsHeaderSuper}>URBAN COMPANY REWARDS</Text>
        <Text style={styles.rewardsHeaderTitle}>Exclusive Member Benefits</Text>
        <Text style={styles.rewardsHeaderSub}>
          Save more on every service & unlock VIP privileges
        </Text>
      </View>

      {/* Coins Balance Card */}
      <View style={styles.coinsBalanceCard}>
        <View style={styles.coinsRowTop}>
          <View>
            <Text style={styles.coinsBalanceLabel}>Available UC Coins</Text>
            <View style={styles.coinsValueRow}>
              <Text style={styles.coinsIconLarge}>🪙</Text>
              <Text style={styles.coinsAmountText}>{coinsBalance}</Text>
              <Text style={styles.coinsCurrencyText}>(= ₹{coinsBalance})</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.redeemBtn}
            onPress={() => Alert.alert('Coins Applied', '₹' + coinsBalance + ' discount will be auto-applied on your next booking!')}
          >
            <Text style={styles.redeemBtnText}>Redeem</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.coinsCardDivider} />
        <Text style={styles.coinsCardHint}>
          💡 1 UC Coin = ₹1. Coins can be used across all Salon, Cleaning & Repair bookings.
        </Text>
      </View>

      {/* UC Plus Membership Tier Card */}
      <View style={styles.ucPlusCard}>
        <View style={styles.ucPlusBadge}>
          <Text style={styles.ucPlusBadgeText}>⭐ UC PLUS VIP</Text>
        </View>
        <Text style={styles.ucPlusTitle}>Save 15% on every booking</Text>
        <Text style={styles.ucPlusDesc}>
          Get unlimited 15% discount on all home & salon services, free top-rated professionals & zero convenience fee.
        </Text>

        <View style={styles.ucPlusPerksList}>
          <Text style={styles.ucPlusPerkItem}>✓ Guaranteed 15% extra savings</Text>
          <Text style={styles.ucPlusPerkItem}>✓ Free cancellation anytime</Text>
          <Text style={styles.ucPlusPerkItem}>✓ Priority dispatch within 30 mins</Text>
        </View>

        <TouchableOpacity
          style={styles.joinPlusBtn}
          onPress={() => Alert.alert('UC Plus Membership', 'Welcome to UC Plus VIP! 15% discount is now active across your account.')}
        >
          <Text style={styles.joinPlusBtnText}>Join UC Plus for ₹299 / yr</Text>
        </TouchableOpacity>
      </View>

      {/* Mystery Scratch Cards Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeading}>Your Scratch Cards</Text>
        <Text style={styles.sectionSubheading}>Tap a card to scratch & reveal instant discounts</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scratchCardsScroll}
      >
        {/* Scratch Card 1 */}
        <TouchableOpacity
          style={styles.scratchCard}
          activeOpacity={0.88}
          onPress={() => {
            setScratchedCardId('card-1');
            Alert.alert('Coupon Revealed! 🎉', 'You unlocked FLAT ₹150 OFF on AC Repair & Cleaning!\nUse code: DIWALI150');
          }}
        >
          <Text style={styles.scratchCardIcon}>🎁</Text>
          <Text style={styles.scratchCardTitle}>Diwali Surprise</Text>
          <Text style={styles.scratchCardSub}>
            {scratchedCardId === 'card-1' ? 'CODE: DIWALI150\n(Flat ₹150 OFF)' : 'Tap to Scratch'}
          </Text>
        </TouchableOpacity>

        {/* Scratch Card 2 */}
        <TouchableOpacity
          style={styles.scratchCard}
          activeOpacity={0.88}
          onPress={() => {
            setScratchedCardId('card-2');
            Alert.alert('Coupon Revealed! 💅', 'You unlocked 20% OFF on Salon & Grooming!\nUse code: GLOW20');
          }}
        >
          <Text style={styles.scratchCardIcon}>✨</Text>
          <Text style={styles.scratchCardTitle}>Salon Special</Text>
          <Text style={styles.scratchCardSub}>
            {scratchedCardId === 'card-2' ? 'CODE: GLOW20\n(20% OFF)' : 'Tap to Scratch'}
          </Text>
        </TouchableOpacity>

        {/* Scratch Card 3 */}
        <TouchableOpacity
          style={styles.scratchCard}
          activeOpacity={0.88}
          onPress={() => {
            setScratchedCardId('card-3');
            Alert.alert('Coupon Revealed! 🛠️', 'Zero Visit Fee on Plumbing & Electrical!\nUse code: FREEVISIT');
          }}
        >
          <Text style={styles.scratchCardIcon}>🪔</Text>
          <Text style={styles.scratchCardTitle}>Festive Perk</Text>
          <Text style={styles.scratchCardSub}>
            {scratchedCardId === 'card-3' ? 'CODE: FREEVISIT\n(Zero Visit Fee)' : 'Tap to Scratch'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Refer & Earn Card */}
      <View style={styles.referralCardContainer}>
        <View style={styles.referralCard}>
          <View style={styles.referralTextSection}>
            <Text style={styles.referralTitle}>Refer a Friend &{'\n'}Earn ₹150 Each</Text>
            <Text style={styles.referralSub}>Your code: SELVAKUMAR2026</Text>
            <TouchableOpacity
              style={styles.copyCodeBtn}
              onPress={() => Alert.alert('Referral Code Copied', 'Code "SELVAKUMAR2026" copied to clipboard! Share it with friends.')}
            >
              <Text style={styles.copyCodeBtnText}>Copy Code</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.referralGraphicSection}>
            <Text style={styles.referralGiftsIcon}>🎁 ✨ 🪙</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );

  // 2. BEAUTY TAB VIEW (Matches all 5 screenshots)
  const renderBeautyView = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}
      keyboardShouldPersistTaps="handled"
    >
      {/* 1. BEAUTY HERO: "Beauty services at your doorstep" + Categories + 2-Photo Collage + Ratings (Screenshot 3) */}
      <View style={styles.webHeroSection}>
        <Text style={styles.doorstepHeadline}>
          Beauty services at your{'\n'}doorstep
        </Text>

        {/* Category Card (Screenshot 3) */}
        <View style={styles.beautyWebCard}>
          <View style={styles.beautyWebGrid}>
            {BEAUTY_WEB_TILES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.beautyWebItem}
                activeOpacity={0.8}
                onPress={() => {
                  if (cat.isIcon) {
                    setShowAllServicesModal(true);
                  } else {
                    handleAddService({ title: cat.title.replace('\n', ' '), price: '₹499', image: cat.icon });
                  }
                }}
              >
                <View style={styles.beautyWebIconBox}>
                  {cat.isIcon ? (
                    <View style={styles.allServicesIconBox}>
                      <View style={styles.dotRow}>
                        <View style={styles.gridDot} />
                        <View style={styles.gridDot} />
                        <View style={styles.gridDot} />
                      </View>
                      <View style={styles.dotRow}>
                        <View style={styles.gridDot} />
                        <View style={styles.gridDot} />
                        <View style={styles.gridDot} />
                      </View>
                      <View style={styles.dotRow}>
                        <View style={styles.gridDot} />
                        <View style={styles.gridDot} />
                        <View style={styles.gridDot} />
                      </View>
                    </View>
                  ) : (
                    <SafeImage source={cat.icon} style={styles.beautyWebImg} />
                  )}
                </View>

                {cat.badge ? (
                  <View style={styles.beautyArrivalBadge}>
                    <Text style={styles.beautyArrivalBadgeText}>{cat.badge}</Text>
                  </View>
                ) : (
                  <View style={styles.beautyBadgeSpacer} />
                )}

                <Text style={styles.beautyWebLabel} numberOfLines={2}>
                  {cat.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 2-Photo Mosaic Collage (Screenshot 3) */}
        <View style={styles.beautyMosaicRow}>
          <View style={styles.beautyMosaicCard}>
            <SafeImage source={IMAGES.beautyArmTreatment} style={styles.beautyMosaicImg} />
          </View>
          <View style={styles.beautyMosaicCard}>
            <SafeImage source={IMAGES.beautyHeroTrimmed} style={styles.beautyMosaicImg} />
          </View>
        </View>

        {/* Trust & Ratings Banner (Screenshot 3) */}
        <View style={styles.ratingTrustBanner}>
          <View style={styles.ratingTrustCol}>
            <Text style={styles.ratingTrustNumber}>★ 4.8</Text>
            <Text style={styles.ratingTrustLabel}>Service Rating</Text>
          </View>
          <View style={styles.ratingTrustDivider} />
          <View style={styles.ratingTrustCol}>
            <Text style={styles.ratingTrustNumber}>12M+</Text>
            <Text style={styles.ratingTrustLabel}>Customers Globally</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionDivider} />

      {/* 2. In the spotlight (Screenshot 1) */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeading}>In the spotlight</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.beautySpotlightScroll}
      >
        <TouchableOpacity
          activeOpacity={0.92}
          style={styles.beautySpotlightCard}
          onPress={() => handleAddService({ title: 'Japanese glow rituals', price: '₹1,599', image: IMAGES.beautyJapaneseRitual })}
        >
          <View style={styles.beautySpotlightTextCol}>
            <View style={styles.newLaunchPill}>
              <Text style={styles.newLaunchPillText}>New launch</Text>
            </View>
            <Text style={styles.beautySpotlightTitle}>Japanese{'\n'}glow rituals</Text>
            <Text style={styles.beautySpotlightSub}>Now at your doorstep</Text>
            <View style={styles.beautyBookBtn}>
              <Text style={styles.beautyBookBtnText}>Book now</Text>
            </View>
          </View>
          <View style={styles.beautySpotlightImgWrapper}>
            <SafeImage source={IMAGES.beautyJapaneseRitual} style={styles.beautySpotlightImg} />
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* 3. Hero Banner 1: Get K-glow at home (Screenshot 2) */}
      <View style={styles.beautyHeroCardContainer}>
        <TouchableOpacity
          style={styles.beautyHeroCard}
          activeOpacity={0.92}
          onPress={() => handleAddService({ title: 'Korean Glow Facial', price: '₹1,399', image: IMAGES.beautyHeroKglow })}
        >
          <SafeImage source={IMAGES.beautyHeroKglow} style={styles.beautyHeroCardBg} />
        </TouchableOpacity>
      </View>

      {/* 4. Most booked services (Screenshot 2) */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeading}>Most booked services</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesScroll}>
        {BEAUTY_MOST_BOOKED.map((item, idx) => (
          <View key={item.id} style={[styles.serviceProductCard, idx === 0 && { marginLeft: 16 }, idx === BEAUTY_MOST_BOOKED.length - 1 && { marginRight: 16 }]}>
            <View style={styles.serviceImageWrapper}>
              <SafeImage source={item.image} style={styles.serviceImage} />
              <View style={styles.beautyAddWrapper}>
                <TouchableOpacity style={styles.beautyAddBtn} onPress={() => handleAddService(item)}>
                  <Text style={styles.beautyAddBtnText}>Add</Text>
                </TouchableOpacity>
                {item.btnSubtext && (
                  <Text style={styles.beautyBtnSubtext}>{item.btnSubtext}</Text>
                )}
              </View>
            </View>
            <Text style={styles.serviceCardTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.serviceRating}>★ {item.rating} · {item.duration}</Text>
            {item.startsAt && <Text style={styles.beautyStartsAtText}>Starts at</Text>}
            <Text style={styles.servicePrice}>{item.price}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.sectionDivider} />

      {/* 5. Salon for women (Screenshot 3) */}
      <View style={styles.beautySectionHeader}>
        <Text style={styles.beautySectionTitle}>Salon for women</Text>
        <Text style={styles.beautySectionSubtitle}>Waxing, threading, facials & more at home</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesScroll}>
        {BEAUTY_SALON_WOMEN.map((item, idx) => (
          <View key={item.id} style={[styles.serviceProductCard, idx === 0 && { marginLeft: 16 }, idx === BEAUTY_SALON_WOMEN.length - 1 && { marginRight: 16 }]}>
            <View style={styles.serviceImageWrapper}>
              <SafeImage source={item.image} style={styles.serviceImage} />
              <View style={styles.beautyAddWrapper}>
                <TouchableOpacity style={styles.beautyAddBtn} onPress={() => handleAddService(item)}>
                  <Text style={styles.beautyAddBtnText}>Add</Text>
                </TouchableOpacity>
                {item.btnSubtext && (
                  <Text style={styles.beautyBtnSubtext}>{item.btnSubtext}</Text>
                )}
              </View>
            </View>
            <Text style={styles.serviceCardTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.serviceRating}>★ {item.rating} · {item.duration}</Text>
            {item.startsAt && <Text style={styles.beautyStartsAtText}>Starts at</Text>}
            <Text style={styles.servicePrice}>{item.price}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.sectionDivider} />

      {/* Hair studio for women (Screenshot 4) */}
      <View style={styles.beautySectionHeader}>
        <Text style={styles.beautySectionTitle}>Hair studio for women</Text>
        <Text style={styles.beautySectionSubtitle}>Haircuts, styling & hair treatments</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesScroll}>
        {BEAUTY_HAIR_STUDIO.map((item, idx) => (
          <View key={item.id} style={[styles.serviceProductCard, idx === 0 && { marginLeft: 16 }, idx === BEAUTY_HAIR_STUDIO.length - 1 && { marginRight: 16 }]}>
            <View style={styles.serviceImageWrapper}>
              <SafeImage source={item.image} style={styles.serviceImage} />
              <View style={styles.beautyAddWrapper}>
                <TouchableOpacity style={styles.beautyAddBtn} onPress={() => handleAddService(item)}>
                  <Text style={styles.beautyAddBtnText}>Add</Text>
                </TouchableOpacity>
                {item.btnSubtext && (
                  <Text style={styles.beautyBtnSubtext}>{item.btnSubtext}</Text>
                )}
              </View>
            </View>
            <Text style={styles.serviceCardTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.serviceRating}>★ {item.rating} · {item.duration}</Text>
            {item.startsAt && <Text style={styles.beautyStartsAtText}>Starts at</Text>}
            <Text style={styles.servicePrice}>{item.price}</Text>
          </View>
        ))}
      </ScrollView>

      {/* 8. Hero Banner 2: Trimmed, styled & cleaned up at home (Screenshot 4) */}
      <View style={styles.beautyHeroCardContainer}>
        <TouchableOpacity
          style={styles.beautyHeroCard}
          activeOpacity={0.92}
          onPress={() => handleAddService({ title: "Men's Haircut", price: '₹259', image: IMAGES.beautyHeroTrimmed })}
        >
          <SafeImage source={IMAGES.beautyHeroTrimmed} style={styles.beautyHeroCardBg} />
        </TouchableOpacity>
      </View>

      {/* 9. Salon for men (Screenshot 5) */}
      <View style={styles.beautySectionHeader}>
        <Text style={styles.beautySectionTitle}>Salon for men</Text>
        <Text style={styles.beautySectionSubtitle}>Haircuts, beard grooming & skin care</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesScroll}>
        {BEAUTY_SALON_MEN.map((item, idx) => (
          <View key={item.id} style={[styles.serviceProductCard, idx === 0 && { marginLeft: 16 }, idx === BEAUTY_SALON_MEN.length - 1 && { marginRight: 16 }]}>
            <View style={styles.serviceImageWrapper}>
              <SafeImage source={item.image} style={styles.serviceImage} />
              <View style={styles.beautyAddWrapper}>
                <TouchableOpacity style={styles.beautyAddBtn} onPress={() => handleAddService(item)}>
                  <Text style={styles.beautyAddBtnText}>Add</Text>
                </TouchableOpacity>
                {item.btnSubtext && (
                  <Text style={styles.beautyBtnSubtext}>{item.btnSubtext}</Text>
                )}
              </View>
            </View>
            <Text style={styles.serviceCardTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.serviceRating}>★ {item.rating} · {item.duration}</Text>
            {item.startsAt && <Text style={styles.beautyStartsAtText}>Starts at</Text>}
            <Text style={styles.servicePrice}>{item.price}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={{ height: 110 }} />
    </ScrollView>
  );

  // 3. NATIVE TAB VIEW (Matches all 5 screenshots)
  const renderNativeView = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}
      keyboardShouldPersistTaps="handled"
    >
      {/* NATIVE PRODUCT SHOWCASE AT TOP: Water Purifiers & Smart Locks (Matches Screenshot 2) */}
      <View style={styles.nativeShowcaseGrid}>
        {/* 1. Water Purifiers Card */}
        <TouchableOpacity
          style={styles.nativeShowcaseCard}
          activeOpacity={0.92}
          onPress={() => setSelectedService(NATIVE_WATER_PURIFIERS[0])}
        >
          <View style={styles.nativeShowcaseBadge}>
            <Text style={styles.nativeShowcaseBadgeText}>% ₹4,800 off</Text>
          </View>
          <View style={styles.nativeShowcaseImgBox}>
            <SafeImage source={IMAGES.nativePurifierM3} style={styles.nativeShowcaseImg} />
          </View>
          <Text style={styles.nativeShowcaseTitle}>Water Purifiers</Text>
          <Text style={styles.nativeShowcaseDesc}>
            Needs no service for 2 years • In-built RO + UV + Alkaline Copper
          </Text>
          <View style={styles.nativeShowcasePrimaryBtn}>
            <Text style={styles.nativeShowcasePrimaryBtnText}>Explore Water Purifiers →</Text>
          </View>
        </TouchableOpacity>

        {/* 2. Smart Locks Card */}
        <TouchableOpacity
          style={styles.nativeShowcaseCard}
          activeOpacity={0.92}
          onPress={() => setSelectedService(NATIVE_SMART_LOCKS[0])}
        >
          <View style={styles.nativeShowcaseBadge}>
            <Text style={styles.nativeShowcaseBadgeText}>% ₹4,500 off</Text>
          </View>
          <View style={styles.nativeShowcaseImgBox}>
            <SafeImage source={IMAGES.nativeSmartLockHero} style={styles.nativeShowcaseImg} />
          </View>
          <Text style={styles.nativeShowcaseTitle}>Smart Locks</Text>
          <Text style={styles.nativeShowcaseDesc}>
            6 in 1 Unlocking • Built in Video Doorbell & Anti Theft Security
          </Text>
          <View style={styles.nativeShowcaseSecondaryBtn}>
            <Text style={styles.nativeShowcaseSecondaryBtnText}>Explore Smart Locks →</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionDivider} />

      {/* 2. Newly launched (Screenshot 1) */}
      <View style={styles.beautySectionHeader}>
        <Text style={styles.beautySectionTitle}>Newly launched</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesScroll}>
        {NATIVE_NEWLY_LAUNCHED.map((item, idx) => (
          <View key={item.id} style={[styles.serviceProductCard, idx === 0 && { marginLeft: 16 }, idx === NATIVE_NEWLY_LAUNCHED.length - 1 && { marginRight: 16 }]}>
            <View style={styles.serviceImageWrapper}>
              <SafeImage source={item.image} style={styles.serviceImage} />
              {item.badge && (
                <View style={[
                  styles.nativeProductBadge,
                  item.badgeType === 'gold' ? styles.nativeBadgeGold : styles.nativeBadgePurple
                ]}>
                  <Text style={[
                    styles.nativeProductBadgeText,
                    item.badgeType === 'gold' ? styles.nativeBadgeGoldText : styles.nativeBadgePurpleText
                  ]}>
                    {item.badge}
                  </Text>
                </View>
              )}
              <View style={styles.beautyAddWrapper}>
                <TouchableOpacity style={styles.beautyAddBtn} onPress={() => handleAddService(item)}>
                  <Text style={styles.beautyAddBtnText}>Add</Text>
                </TouchableOpacity>
                {item.btnSubtext && (
                  <Text style={styles.beautyBtnSubtext}>{item.btnSubtext}</Text>
                )}
              </View>
            </View>
            <Text style={styles.serviceCardTitle} numberOfLines={2}>{item.title}</Text>
            {item.rating && <Text style={styles.serviceRating}>★ {item.rating}</Text>}
            {item.startsAt && <Text style={styles.beautyStartsAtText}>Starts at</Text>}
            <Text style={styles.servicePrice}>{item.price}</Text>
          </View>
        ))}
      </ScrollView>

      {/* 3. Hero Story Banner: M2 PRO / LIMITED EDITION (Screenshot 2) */}
      <View style={styles.nativeHeroStoryContainer}>
        <TouchableOpacity
          style={styles.nativeHeroStoryCard}
          activeOpacity={0.92}
          onPress={() => Alert.alert('Native M2 Pro Story', 'Over 5 lakh Indian households trust Native for zero maintenance and clean mineral water.')}
        >
          <SafeImage source={IMAGES.nativeHeroStory} style={styles.nativeHeroStoryBg} />
        </TouchableOpacity>
      </View>

      {/* 4. Water Purifiers (Screenshot 2) */}
      <View style={styles.beautySectionHeader}>
        <Text style={styles.beautySectionTitle}>Water Purifiers</Text>
        <Text style={styles.beautySectionSubtitle}>No service for 3 years</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesScroll}>
        {NATIVE_WATER_PURIFIERS.map((item, idx) => (
          <View key={item.id} style={[styles.serviceProductCard, idx === 0 && { marginLeft: 16 }, idx === NATIVE_WATER_PURIFIERS.length - 1 && { marginRight: 16 }]}>
            <View style={styles.serviceImageWrapper}>
              <SafeImage source={item.image} style={styles.serviceImage} />
              {item.badge && (
                <View style={[styles.nativeProductBadge, styles.nativeBadgePurple]}>
                  <Text style={[styles.nativeProductBadgeText, styles.nativeBadgePurpleText]}>
                    {item.badge}
                  </Text>
                </View>
              )}
              <View style={styles.beautyAddWrapper}>
                <TouchableOpacity style={styles.beautyAddBtn} onPress={() => handleAddService(item)}>
                  <Text style={styles.beautyAddBtnText}>Add</Text>
                </TouchableOpacity>
                {item.btnSubtext && (
                  <Text style={styles.beautyBtnSubtext}>{item.btnSubtext}</Text>
                )}
              </View>
            </View>
            <Text style={styles.serviceCardTitle} numberOfLines={2}>{item.title}</Text>
            {item.rating && <Text style={styles.serviceRating}>★ {item.rating}</Text>}
            {item.startsAt && <Text style={styles.beautyStartsAtText}>Starts at</Text>}
            <Text style={styles.servicePrice}>{item.price}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Compare all models button bar (Screenshot 2) */}
      <TouchableOpacity
        style={styles.nativeCompareBar}
        activeOpacity={0.7}
        onPress={() => Alert.alert('Compare Native Purifiers', '• M2: 2-year filter life, 10-stage RO, ₹13,499\n• M2 Pro: 2-year filter life, Smart Rinse, ₹16,699\n• M3: 3-year filter life, IoT App, ₹20,199\n• M3 Pro: 3-year filter life, Touchscreen & TDS display, ₹24,699')}
      >
        <View style={styles.nativeCompareLeft}>
          <Text style={styles.nativeCompareIcon}>◫</Text>
          <Text style={styles.nativeCompareText}>Compare all models</Text>
        </View>
        <Text style={styles.nativeCompareArrow}>›</Text>
      </TouchableOpacity>

      <View style={styles.sectionDivider} />

      {/* 5. Smart Door Locks (Screenshot 3) */}
      <View style={styles.beautySectionHeader}>
        <Text style={styles.beautySectionTitle}>Smart Door Locks</Text>
        <Text style={styles.beautySectionSubtitle}>Most advance and secure locks</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesScroll}>
        {NATIVE_SMART_LOCKS.map((item, idx) => (
          <View key={item.id} style={[styles.serviceProductCard, idx === 0 && { marginLeft: 16 }, idx === NATIVE_SMART_LOCKS.length - 1 && { marginRight: 16 }]}>
            <View style={styles.serviceImageWrapper}>
              <SafeImage source={item.image} style={styles.serviceImage} />
              {item.badge && (
                <View style={[styles.nativeProductBadge, styles.nativeBadgePurple]}>
                  <Text style={[styles.nativeProductBadgeText, styles.nativeBadgePurpleText]}>
                    {item.badge}
                  </Text>
                </View>
              )}
              <View style={styles.beautyAddWrapper}>
                <TouchableOpacity style={styles.beautyAddBtn} onPress={() => handleAddService(item)}>
                  <Text style={styles.beautyAddBtnText}>Add</Text>
                </TouchableOpacity>
                {item.btnSubtext && (
                  <Text style={styles.beautyBtnSubtext}>{item.btnSubtext}</Text>
                )}
              </View>
            </View>
            <Text style={styles.serviceCardTitle} numberOfLines={2}>{item.title}</Text>
            {item.rating && <Text style={styles.serviceRating}>★ {item.rating}</Text>}
            {item.startsAt && <Text style={styles.beautyStartsAtText}>Starts at</Text>}
            <Text style={styles.servicePrice}>{item.price}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.sectionDivider} />

      {/* 6. UC app exclusive. Even more reason to buy from here. (Screenshot 3) */}
      <View style={styles.beautySectionHeader}>
        <Text style={styles.beautySectionTitle}>UC app exclusive.</Text>
        <Text style={[styles.beautySectionTitle, { color: '#64748B' }]}>Even more reason to buy from here.</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesScroll}>
        {NATIVE_EXCLUSIVE_CARDS.map((card, idx) => (
          <View key={card.id} style={[styles.nativeExclusiveCardWrapper, idx === 0 && { marginLeft: 16 }, idx === NATIVE_EXCLUSIVE_CARDS.length - 1 && { marginRight: 16 }]}>
            <SafeImage source={card.image} style={styles.nativeExclusiveCardImg} />
          </View>
        ))}
      </ScrollView>

      <View style={styles.sectionDivider} />

      {/* 7. UC app service advantages (Screenshot 4) */}
      <View style={styles.beautySectionHeader}>
        <Text style={styles.beautySectionTitle}>UC app service advantages</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesScroll}>
        {NATIVE_ADVANTAGE_CARDS.map((card, idx) => (
          <View key={card.id} style={[styles.nativeAdvantageCardWrapper, idx === 0 && { marginLeft: 16 }, idx === NATIVE_ADVANTAGE_CARDS.length - 1 && { marginRight: 16 }]}>
            <SafeImage source={card.image} style={styles.nativeAdvantageCardImg} />
          </View>
        ))}
      </ScrollView>

      <View style={styles.sectionDivider} />

      {/* 8. For business enquiries (Screenshot 4) */}
      <View style={styles.nativeBusinessSection}>
        <Text style={styles.beautySectionTitle}>For business enquiries</Text>
        <Text style={styles.nativeBusinessDesc}>
          Looking to buy Native products in bulk or become a distributor? Write to us at{' '}
          <Text
            style={styles.nativeBusinessLink}
            onPress={() => Alert.alert('Contact Native B2B', 'Please email us at nativequeries@urbancompany.com')}
          >
            nativequeries@urbancompany.com
          </Text>
        </Text>
        <View style={styles.nativePedestalsContainer}>
          <SafeImage source={IMAGES.nativePedestals} style={styles.nativePedestalsImg} />
        </View>
      </View>

      {/* 9. Designed in India. For Indian homes. (Screenshot 5 & 6) */}
      <View style={styles.nativeLabSection}>
        <View style={styles.nativeLabCollageContainer}>
          <SafeImage source={IMAGES.nativeLabCollage} style={styles.nativeLabCollageImg} />
        </View>
        <View style={styles.nativeLabTextContainer}>
          <Text style={styles.nativeLabTitle}>Designed in India.{'\n'}For Indian homes.</Text>

          <Text style={styles.nativeLabBody}>
            At Urban Company, we spent 12 years inside Indian kitchens, servicing 50+ brands. We saw that your RO water purifier was broken. The RO industry wasn't built for consumers but around Annual Maintenance Contracts (AMCs).
          </Text>

          <Text style={styles.nativeLabBody}>
            So we asked a different question: what if we built a purifier people never had to think about? One that just worked quietly and reliably for years. That question became Native. India's first RO that needs no service for 3 years. Designed in India. For homes like yours.
          </Text>

          <Text style={styles.nativeLabBody}>
            Today, Native builds beautiful, smart RO water purifiers and smart door locks. They are designed, engineered, and built in India. We are focused on making your everyday living better.
          </Text>
        </View>
      </View>

      <View style={{ height: 110 }} />
    </ScrollView>
  );

  // 4. HOMES TAB VIEW
  const renderHomesView = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.homesHeroBanner}>
        <Text style={styles.homesHeroTag}>URBAN COMPANY HOMES</Text>
        <Text style={styles.homesHeroTitle}>Complete Home Care{'\n'}& Maintenance</Text>
        <Text style={styles.homesHeroSub}>
          Expert cleaning, appliance repairs, painting & verified mechanics
        </Text>
      </View>

      {/* Cleaning Essentials */}
      <View style={styles.sectionHeaderRowWithLink}>
        <View>
          <Text style={styles.sectionHeading}>Cleaning Essentials</Text>
          <Text style={styles.sectionSubheading}>Deep cleaning by trained pros</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesScroll}>
        {CLEANING_ESSENTIALS.map((item, idx) => (
          <View key={item.id} style={[styles.serviceProductCard, idx === 0 && { marginLeft: 16 }, idx === CLEANING_ESSENTIALS.length - 1 && { marginRight: 16 }]}>
            <View style={styles.serviceImageWrapper}>
              <SafeImage source={item.image} style={styles.serviceImage} />
              <TouchableOpacity style={styles.addButton} onPress={() => handleAddService(item)}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.serviceCardTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.serviceRating}>★ {item.rating} · {item.duration}</Text>
            <Text style={styles.servicePrice}>{item.price}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Appliance repair & service */}
      <View style={styles.sectionHeaderRowWithLink}>
        <Text style={styles.sectionHeading}>Appliance repair & service</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesScroll}>
        {APPLIANCE_SERVICES.map((item, idx) => (
          <View key={item.id} style={[styles.serviceProductCard, idx === 0 && { marginLeft: 16 }, idx === APPLIANCE_SERVICES.length - 1 && { marginRight: 16 }]}>
            <View style={styles.serviceImageWrapper}>
              <SafeImage source={item.image} style={styles.serviceImage} />
              <TouchableOpacity style={styles.addButton} onPress={() => handleAddService(item)}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.serviceCardTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.serviceRating}>★ {item.rating} · {item.duration}</Text>
            <Text style={styles.servicePrice}>{item.price}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Home repair & installation */}
      <View style={styles.sectionHeaderRowWithLink}>
        <Text style={styles.sectionHeading}>Home repair & installation</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesScroll}>
        {HOME_REPAIR_SERVICES.map((item, idx) => (
          <View key={item.id} style={[styles.serviceProductCard, idx === 0 && { marginLeft: 16 }, idx === HOME_REPAIR_SERVICES.length - 1 && { marginRight: 16 }]}>
            <View style={styles.serviceImageWrapper}>
              <SafeImage source={item.image} style={styles.serviceImage} />
              <TouchableOpacity style={styles.addButton} onPress={() => handleAddService(item)}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.serviceCardTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.serviceRating}>★ {item.rating} · {item.duration}</Text>
            <Text style={styles.servicePrice}>{item.price}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={{ height: 80 }} />
    </ScrollView>
  );

  // 5. MAIN UC HOME FEED VIEW (FULL ORIGINAL FEED)
  const renderHomeContent = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}
      keyboardShouldPersistTaps="handled"
    >
      {/* 1. HOMES HERO: "Home services at your doorstep" + "What are you looking for?" + 4-Mosaic (Screenshot 1) */}
      <View style={styles.webHeroSection}>
        <Text style={styles.doorstepHeadline}>
          Home services at your{'\n'}doorstep
        </Text>

        {/* White Card: "What are you looking for?" with 6 Category Tiles */}
        <View style={styles.nativeLookingForCard}>
          <Text style={styles.nativeLookingForTitle}>What are you looking for?</Text>
          <View style={styles.nativeLookingForGrid}>
            {NATIVE_LOOKING_FOR_TILES.map((tile) => (
              <TouchableOpacity
                key={tile.id}
                style={styles.nativeLookingForItem}
                activeOpacity={0.8}
                onPress={() => {
                  if (tile.id === 'native-ro') {
                    setSelectedService(NATIVE_WATER_PURIFIERS[0]);
                  } else if (tile.id === 'native-smart-locks') {
                    setSelectedService(NATIVE_SMART_LOCKS[0]);
                  } else if (tile.id === 'ac-appliances') {
                    setSelectedService(APPLIANCE_SERVICES[0]);
                  } else if (tile.id === 'quick-repairs') {
                    setSelectedService(HOME_REPAIR_SERVICES[0]);
                  } else {
                    setSelectedService(CLEANING_ESSENTIALS[0]);
                  }
                }}
              >
                <View style={styles.nativeLookingForIconBox}>
                  {tile.badgeType === 'top-sale' && (
                    <View style={styles.nativeLookingForSaleBadge}>
                      <Text style={styles.nativeLookingForSaleText}>{tile.badge}</Text>
                    </View>
                  )}
                  <SafeImage source={tile.icon} style={styles.nativeLookingForImg} />
                </View>

                {tile.badgeType === 'bottom-pill' ? (
                  <View style={styles.nativeLookingForArrivalBadge}>
                    <Text style={styles.nativeLookingForArrivalText}>{tile.badge}</Text>
                  </View>
                ) : (
                  <View style={styles.nativeLookingForBadgeSpacer} />
                )}

                <Text style={styles.nativeLookingForLabel} numberOfLines={2}>
                  {tile.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 4-Photo 2x2 Mosaic Collage (Screenshot 1) */}
        <View style={styles.mosaicGrid2x2}>
          <View style={styles.mosaicSubcol}>
            <View style={styles.mosaicImgCard}>
              <SafeImage source={IMAGES.heroAc} style={styles.mosaicImg} />
            </View>
            <View style={styles.mosaicImgCard}>
              <SafeImage source={IMAGES.ceilingFanInstall} style={styles.mosaicImg} />
            </View>
          </View>
          <View style={styles.mosaicSubcol}>
            <View style={styles.mosaicImgCard}>
              <SafeImage source={IMAGES.homeBathroom} style={styles.mosaicImg} />
            </View>
            <View style={styles.mosaicImgCard}>
              <SafeImage source={IMAGES.homePainter} style={styles.mosaicImg} />
            </View>
          </View>
        </View>
      </View>

      {/* 2. FESTIVE DIWALI ROOFTOP CAROUSEL BANNER */}
      <View style={styles.festiveContainer}>
        <View style={styles.festiveHeaderBar}>
          <Text style={styles.festiveDiyasLeft}>🪔 🏮</Text>
          <Text style={styles.festiveTitle}>HAPPY DIWALI</Text>
          <Text style={styles.festiveDiyasRight}>🏮 🪔</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.festiveCardsScroll}
        >
          {FESTIVE_CARDS.map((card, idx) => (
            <TouchableOpacity
              key={card.id}
              activeOpacity={0.9}
              style={[
                styles.festiveCard,
                idx === 0 && { marginLeft: 16 },
                idx === FESTIVE_CARDS.length - 1 && { marginRight: 16 }
              ]}
              onPress={() => handleAddService({ title: card.title, price: '₹399' })}
            >
              {card.tag && (
                <View style={styles.festiveTag}>
                  <Text style={styles.festiveTagText}>{card.tag}</Text>
                </View>
              )}

              <SafeImage source={card.image} style={styles.festiveCardImage} />

              <View style={styles.festiveCardFooter}>
                <Text style={styles.festiveCardTitle} numberOfLines={1}>
                  {card.title}
                </Text>
              </View>

              <View style={styles.cornerDotTL} />
              <View style={styles.cornerDotTR} />
              <View style={styles.cornerDotBL} />
              <View style={styles.cornerDotBR} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 3. MAIN 8-SERVICE CATEGORIES GRID */}
      <View style={styles.categoriesGrid}>
        {MAIN_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            activeOpacity={0.8}
            style={styles.categoryItem}
            onPress={() => {
              if (cat.name === 'All services' || cat.isIcon) {
                setShowAllServicesModal(true);
              } else {
                handleAddService({ title: cat.name, price: '₹499' });
              }
            }}
          >
            <View style={styles.categoryCard}>
              {cat.badge && cat.badgeType === 'green-pill-top' && (
                <View style={styles.priceDropPill}>
                  <Text style={styles.priceDropPillText}>{cat.badge}</Text>
                </View>
              )}

              {cat.isIcon ? (
                <View style={styles.allServicesIconBox}>
                  <View style={styles.dotRow}>
                    <View style={styles.gridDot} />
                    <View style={styles.gridDot} />
                    <View style={styles.gridDot} />
                  </View>
                  <View style={styles.dotRow}>
                    <View style={styles.gridDot} />
                    <View style={styles.gridDot} />
                    <View style={styles.gridDot} />
                  </View>
                  <View style={styles.dotRow}>
                    <View style={styles.gridDot} />
                    <View style={styles.gridDot} />
                    <View style={styles.gridDot} />
                  </View>
                </View>
              ) : (
                <SafeImage source={cat.image} style={styles.categoryImage} />
              )}

              {cat.badge && cat.badgeType === 'bottom-pill' && (
                <View style={styles.bottomPillBadge}>
                  <Text style={styles.bottomPillBadgeText}>{cat.badge}</Text>
                </View>
              )}
            </View>

            <Text style={styles.categoryName} numberOfLines={2}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 4. NATIVE SMART PRODUCTS */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeading}>Native Smart Products</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.nativeScroll}
      >
        {NATIVE_PRODUCTS.map((prod, idx) => (
          <TouchableOpacity
            key={prod.id}
            activeOpacity={0.85}
            style={[
              styles.nativeProductCard,
              idx === 0 && { marginLeft: 16 },
              idx === NATIVE_PRODUCTS.length - 1 && { marginRight: 16 }
            ]}
            onPress={() => handleAddService({ title: prod.name, price: prod.price })}
          >
            <View style={styles.nativeImageContainer}>
              <SafeImage source={prod.image} style={styles.nativeImage} />
              <View style={[styles.productTag, { backgroundColor: prod.tagColor }]}>
                <Text style={styles.productTagText}>{prod.tag}</Text>
              </View>
            </View>
            <Text style={styles.nativeTitle}>{prod.name}</Text>
            <Text style={styles.nativePrice}>{prod.price}</Text>
            <Text style={styles.nativeRating}>{prod.rating}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sectionDivider} />

      {/* 5. IN THE SPOTLIGHT */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeading}>In the spotlight</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.spotlightCarousel}
        decelerationRate="fast"
        snapToInterval={width * 0.85 + 14}
        snapToAlignment="start"
      >
        {SPOTLIGHT_ITEMS.map((item, idx) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.92}
            style={[
              styles.spotlightCard,
              idx === 0 && { marginLeft: 16 },
              idx === SPOTLIGHT_ITEMS.length - 1 && { marginRight: 16 }
            ]}
            onPress={() => handleAddService(item)}
          >
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerDotTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerDotTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerDotBottomLeft} />
            <View style={styles.cornerBottomRight} />
            <View style={styles.cornerDotBottomRight} />

            <View style={styles.spotlightTextContainer}>
              <Text style={styles.spotlightCategory}>{item.category}</Text>
              <Text style={styles.spotlightTitle}>{item.title}</Text>
              <View style={styles.bookNowButton}>
                <Text style={styles.bookNowButtonText}>{item.buttonText}</Text>
              </View>
            </View>

            <View style={styles.spotlightImageContainer}>
              <SafeImage source={item.image} style={styles.spotlightImage} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sectionDivider} />

      {/* 6. NEW AND NOTEWORTHY */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeading}>New and noteworthy</Text>
      </View>

      <View style={styles.noteworthyGrid}>
        {NOTEWORTHY_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.noteworthyItem}
            activeOpacity={0.75}
            onPress={() => handleAddService(item)}
          >
            <View style={styles.noteworthyImageCard}>
              <SafeImage source={item.image} style={styles.noteworthyImage} />
              {item.badge && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>{item.badge}</Text>
                </View>
              )}
            </View>

            <Text style={styles.noteworthyTitle} numberOfLines={2}>
              {item.title}
            </Text>

            {item.subBadge && (
              <View style={styles.subBadgeContainer}>
                <Text style={styles.subBadgeText}>{item.subBadge}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionDivider} />

      {/* 7. MOST BOOKED SERVICES */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeading}>Most booked services</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.servicesScroll}
      >
        {MOST_BOOKED_ITEMS.map((item, idx) => (
          <View
            key={item.id}
            style={[
              styles.serviceProductCard,
              idx === 0 && { marginLeft: 16 },
              idx === MOST_BOOKED_ITEMS.length - 1 && { marginRight: 16 }
            ]}
          >
            <View style={styles.serviceImageWrapper}>
              <SafeImage source={item.image} style={styles.serviceImage} />
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddService(item)}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
              {item.btnSubtext && (
                <Text style={styles.btnSubtext}>{item.btnSubtext}</Text>
              )}
            </View>

            <Text style={styles.serviceCardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.serviceRating}>
              ★ {item.rating} · {item.duration}
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.servicePrice}>{item.price}</Text>
              {item.oldPrice && (
                <Text style={styles.serviceOldPrice}>{item.oldPrice}</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.sectionDivider} />

      {/* 8. THOUGHTFUL CURATIONS */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionHeading}>Thoughtful curations</Text>
          <Text style={styles.sectionSubheading}>of our finest experiences</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.curationsScroll}
      >
        {CURATIONS_ITEMS.map((item, idx) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.9}
            style={[
              styles.curationCard,
              idx === 0 && { marginLeft: 16 },
              idx === CURATIONS_ITEMS.length - 1 && { marginRight: 16 }
            ]}
            onPress={() => handleAddService({ title: item.title.replace('\n', ' '), price: '₹699' })}
          >
            <SafeImage source={item.image} style={styles.curationImage} />
            <View style={styles.curationOverlay}>
              <Text style={styles.curationTitle}>{item.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sectionDivider} />

      {/* 9. LARGE SPOTLIGHT BANNER - BATHROOM CLEANING */}
      <View style={styles.largeSpotlightContainer}>
        <TouchableOpacity
          activeOpacity={0.92}
          style={styles.largeSpotlightCard}
          onPress={() => handleAddService({
            title: 'Bathroom deep cleaning',
            price: '₹399'
          })}
        >
          <View style={styles.cornerTopLeft} />
          <View style={styles.cornerDotTopLeft} />
          <View style={styles.cornerTopRight} />
          <View style={styles.cornerDotTopRight} />
          <View style={styles.cornerBottomLeft} />
          <View style={styles.cornerDotBottomLeft} />
          <View style={styles.cornerBottomRight} />
          <View style={styles.cornerDotBottomRight} />

          <SafeImage source={IMAGES.homeBathroom} style={styles.largeSpotlightBg} />

          <View style={styles.largeSpotlightContent}>
            <Text style={styles.largeSpotlightTitle}>
              Bathroom deep cleaning{'\n'}starting at ₹399*
            </Text>
            <Text style={styles.largeSpotlightSub}>*On first-time booking</Text>

            <View style={styles.whiteBookBtn}>
              <Text style={styles.whiteBookBtnText}>Book now</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* 10. CLEANING ESSENTIALS */}
      <View style={styles.sectionHeaderRowWithLink}>
        <View>
          <Text style={styles.sectionHeading}>Cleaning Essentials</Text>
          <Text style={styles.sectionSubheading}>Monthly cleaning essential services</Text>
        </View>
        <TouchableOpacity onPress={() => setShowAllServicesModal(true)}>
          <Text style={styles.seeAllLink}>See all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.servicesScroll}
      >
        {CLEANING_ESSENTIALS.map((item, idx) => (
          <View
            key={item.id}
            style={[
              styles.serviceProductCard,
              idx === 0 && { marginLeft: 16 },
              idx === CLEANING_ESSENTIALS.length - 1 && { marginRight: 16 }
            ]}
          >
            <View style={styles.serviceImageWrapper}>
              <SafeImage source={item.image} style={styles.serviceImage} />
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddService(item)}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.serviceCardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.serviceRating}>
              ★ {item.rating} · {item.duration}
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.servicePrice}>{item.price}</Text>
              {item.oldPrice && (
                <Text style={styles.serviceOldPrice}>{item.oldPrice}</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.sectionDivider} />

      {/* 11. SALON FOR WOMEN */}
      <View style={styles.sectionHeaderRowWithLink}>
        <View>
          <Text style={styles.sectionHeading}>Salon for Women</Text>
          <Text style={styles.sectionSubheading}>Pamper yourself at home</Text>
        </View>
        <TouchableOpacity onPress={() => setShowAllServicesModal(true)}>
          <Text style={styles.seeAllLink}>See all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.servicesScroll}
      >
        {SALON_WOMEN.map((item, idx) => (
          <View
            key={item.id}
            style={[
              styles.serviceProductCard,
              idx === 0 && { marginLeft: 16 },
              idx === SALON_WOMEN.length - 1 && { marginRight: 16 }
            ]}
          >
            <View style={styles.serviceImageWrapper}>
              <SafeImage source={item.image} style={styles.serviceImage} />
              {item.luxe && (
                <View style={styles.luxeBadge}>
                  <Text style={styles.luxeBadgeText}>Luxe</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddService(item)}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
              {item.btnSubtext && (
                <Text style={styles.btnSubtext}>{item.btnSubtext}</Text>
              )}
            </View>

            <Text style={styles.serviceCardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.serviceRating}>
              ★ {item.rating} · {item.duration}
            </Text>
            <Text style={styles.servicePrice}>{item.price}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.sectionDivider} />

      {/* 13. NATIVE FESTIVE DAYS BANNER */}
      <View style={styles.diyaSectionBar}>
        <Text style={styles.diyaRepeat}>🪔 🪔 🪔 🪔 🪔 🪔 🪔 🪔 🪔</Text>
      </View>

      <View style={styles.largeSpotlightContainer}>
        <TouchableOpacity
          activeOpacity={0.94}
          style={styles.nativeFestiveBanner}
          onPress={() => handleAddService({
            title: 'Native M3 & M3 Pro',
            price: '₹20,199'
          })}
        >
          <View style={styles.cornerTopLeft} />
          <View style={styles.cornerDotTopLeft} />
          <View style={styles.cornerTopRight} />
          <View style={styles.cornerDotTopRight} />
          <View style={styles.cornerBottomLeft} />
          <View style={styles.cornerDotBottomLeft} />
          <View style={styles.cornerBottomRight} />
          <View style={styles.cornerDotBottomRight} />

          <View style={styles.nativeFestivePill}>
            <Text style={styles.nativeFestivePillText}>
              Native Festive Days • Up to ₹4,800 off
            </Text>
          </View>

          <Text style={styles.nativeFestiveHeadline}>
            3-year filter life.{'\n'}3-year unconditional{'\n'}warranty.
          </Text>

          <View style={styles.nativeBannerImageCenter}>
            <SafeImage source={IMAGES.nativePurifierM3} style={styles.nativeM3Image} />
          </View>

          <View style={styles.nativeBannerBottomRow}>
            <View>
              <Text style={styles.nativeModelName}>Native M3 & M3 Pro</Text>
              <Text style={styles.nativeModelPrice}>Starting from ₹20,199</Text>
            </View>

            <View style={styles.whiteBuyBtn}>
              <Text style={styles.whiteBuyBtnText}>Buy now</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* 14. APPLIANCE REPAIR & SERVICE */}
      <View style={styles.sectionHeaderRowWithLink}>
        <Text style={styles.sectionHeading}>Appliance repair & service</Text>
        <TouchableOpacity onPress={() => setShowAllServicesModal(true)}>
          <Text style={styles.seeAllLink}>See all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.servicesScroll}
      >
        {APPLIANCE_SERVICES.map((item, idx) => (
          <View
            key={item.id}
            style={[
              styles.serviceProductCard,
              idx === 0 && { marginLeft: 16 },
              idx === APPLIANCE_SERVICES.length - 1 && { marginRight: 16 }
            ]}
          >
            <View style={styles.serviceImageWrapper}>
              <SafeImage source={item.image} style={styles.serviceImage} />
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddService(item)}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.serviceCardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.serviceRating}>
              ★ {item.rating} · {item.duration}
            </Text>
            <Text style={styles.servicePrice}>{item.price}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.sectionDivider} />

      {/* 15. HOME REPAIR & INSTALLATION */}
      <View style={styles.sectionHeaderRowWithLink}>
        <Text style={styles.sectionHeading}>Home repair & installation</Text>
        <TouchableOpacity onPress={() => setShowAllServicesModal(true)}>
          <Text style={styles.seeAllLink}>See all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.servicesScroll}
      >
        {HOME_REPAIR_SERVICES.map((item, idx) => (
          <View
            key={item.id}
            style={[
              styles.serviceProductCard,
              idx === 0 && { marginLeft: 16 },
              idx === HOME_REPAIR_SERVICES.length - 1 && { marginRight: 16 }
            ]}
          >
            <View style={styles.serviceImageWrapper}>
              <SafeImage source={item.image} style={styles.serviceImage} />
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddService(item)}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
              {item.btnSubtext && (
                <Text style={styles.btnSubtext}>{item.btnSubtext}</Text>
              )}
            </View>

            <Text style={styles.serviceCardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.serviceRating}>
              ★ {item.rating} · {item.duration}
            </Text>
            <Text style={styles.servicePrice}>{item.price}</Text>
          </View>
        ))}
      </ScrollView>


      {/* 17. NATIVE M2 PRO LIMITED EDITION BANNER */}
      <View style={styles.diyaSectionBar}>
        <Text style={styles.diyaRepeat}>🪔 🪔 🪔 🪔 🪔 🪔 🪔 🪔 🪔</Text>
      </View>

      <View style={styles.largeSpotlightContainer}>
        <TouchableOpacity
          activeOpacity={0.94}
          style={styles.nativeM2Banner}
          onPress={() => handleAddService({
            title: 'Native M2 Pro Limited Edition',
            price: '₹14,999'
          })}
        >
          <View style={styles.cornerTopLeft} />
          <View style={styles.cornerDotTopLeft} />
          <View style={styles.cornerTopRight} />
          <View style={styles.cornerDotTopRight} />
          <View style={styles.cornerBottomLeft} />
          <View style={styles.cornerDotBottomLeft} />
          <View style={styles.cornerBottomRight} />
          <View style={styles.cornerDotBottomRight} />

          <View style={styles.nativeM2Pill}>
            <Text style={styles.nativeM2PillText}>Native M2 Pro</Text>
          </View>

          <Text style={styles.nativeM2Headline}>Limited Edition</Text>
          <Text style={styles.nativeM2Sub}>
            Celebrating Native RO in 5,00,000 Indian Homes
          </Text>

          <View style={styles.nativeM2ImageContainer}>
            <SafeImage source={IMAGES.nativePurifier} style={styles.nativeM2Image} />
          </View>

          <View style={styles.nativeM2BottomRow}>
            <View>
              <Text style={styles.nativeModelNameDark}>Native M2 Pro</Text>
              <Text style={styles.nativeModelPriceDark}>Starts at ₹14,999</Text>
            </View>
            <View style={styles.blackBuyBtn}>
              <Text style={styles.blackBuyBtnText}>Buy now</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* 18. SALON FOR MEN */}
      <View style={styles.sectionHeaderRowWithLink}>
        <View>
          <Text style={styles.sectionHeading}>Salon for Men</Text>
          <Text style={styles.sectionSubheading}>Grooming essentials</Text>
        </View>
        <TouchableOpacity onPress={() => setShowAllServicesModal(true)}>
          <Text style={styles.seeAllLink}>See all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.servicesScroll}
      >
        {SALON_MEN.map((item, idx) => (
          <View
            key={item.id}
            style={[
              styles.serviceProductCard,
              idx === 0 && { marginLeft: 16 },
              idx === SALON_MEN.length - 1 && { marginRight: 16 }
            ]}
          >
            <View style={styles.serviceImageWrapper}>
              <SafeImage source={item.image} style={styles.serviceImage} />
              {item.luxe && (
                <View style={styles.luxeBadge}>
                  <Text style={styles.luxeBadgeText}>Luxe</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddService(item)}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.serviceCardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.serviceRating}>
              ★ {item.rating} · {item.duration}
            </Text>
            <Text style={styles.servicePrice}>{item.price}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.sectionDivider} />

      {/* 19. REFERRAL BANNER */}
      <View style={styles.referralCardContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.referralCard}
          onPress={() => Alert.alert('Referral Program', 'Share your invite code with friends & get ₹50 on each successful booking!')}
        >
          <View style={styles.referralTextSection}>
            <Text style={styles.referralTitle}>Refer and get{'\n'}free services</Text>
            <Text style={styles.referralSub}>Invite and get ₹50*</Text>
          </View>

          <View style={styles.referralGraphicSection}>
            <Text style={styles.referralGiftsIcon}>🎁 ✨ 🪙</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 20. BOTTOM DIYA FOOTER DECORATION */}
      <View style={styles.diyaFooterBar}>
        <Text style={styles.diyaRepeat}>🪔 🪔 🪔 🪔 🪔 🪔 🪔 🪔 🪔</Text>
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.safeArea, (activeTab === 'beauty' || activeTab === 'native') && { backgroundColor: '#FFFFFF' }]}>
      <ExpoStatusBar style={(activeTab === 'beauty' || activeTab === 'native') ? 'dark' : 'light'} />
      <StatusBar
        barStyle={(activeTab === 'beauty' || activeTab === 'native') ? 'dark-content' : 'light-content'}
        backgroundColor={(activeTab === 'beauty' || activeTab === 'native') ? '#FFFFFF' : '#2B0957'}
      />

      {/* 1. TOP HEADER: Clean white Personal grooming header on Beauty tab; Native header on Native tab; Deep Purple header on others */}
      {activeTab === 'beauty' ? (
        <View style={styles.beautyTopHeader}>
          <View style={styles.beautyHeaderTitleRow}>
            <Text style={styles.beautyHeaderIcon}>🪞</Text>
            <Text style={styles.beautyHeaderTitleBold}>Personal </Text>
            <Text style={styles.beautyHeaderTitleLight}>grooming</Text>
          </View>

          <View style={styles.beautySearchBarContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a service"
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : activeTab === 'native' ? (
        <View style={styles.nativeTopHeader}>
          <Text style={styles.nativeHeaderTitle}>Native products</Text>
          <Text style={styles.nativeHeaderSubtitle}>Innovative products. Designed in India for India.</Text>
        </View>
      ) : (
        <View style={styles.topPurpleHeader}>
          <View style={styles.statusLocationRow}>
            <View style={styles.locationContainer}>
              <Text style={styles.timeStatusText}>Forge India Connect</Text>
              <TouchableOpacity activeOpacity={0.8} style={styles.locationPill}>
                <Text style={styles.locationName}>Chennai Central - Tamil Nadu</Text>
                <Text style={styles.dropdownArrow}> ▾</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.profileAvatarButton}
              onPress={() => Alert.alert('Account Profile', 'Signed in as selvakumarc029\nUrban Company Member')}
            >
              <View style={styles.profileInnerCircle}>
                <Text style={styles.profileIconText}>👤</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.searchBarContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder={
                activeTab === 'native'
                  ? 'Search RO purifiers, smart locks...'
                  : activeTab === 'beauty'
                  ? 'Search salon, facials, spa...'
                  : 'Search for a service'
              }
              placeholderTextColor="#64748B"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* DYNAMIC CONTENT SWITCHER: SEARCH RESULTS OR ACTIVE BOTTOM TAB */}
      <View style={styles.tabContentWrapper}>
        {searchQuery.trim().length > 0 ? (
          renderSearchResultsView()
        ) : (
          <>
            {(activeTab === 'homes' || activeTab === 'uc') && renderHomeContent()}
            {activeTab === 'native' && renderNativeView()}
            {activeTab === 'beauty' && renderBeautyView()}
          </>
        )}
      </View>

      {/* 21. BOTTOM NAVIGATION BAR (3 SECTIONS: HOMES, NATIVE, BEAUTY) */}
      <View style={styles.bottomNavContainer}>
        {/* Tab 1: Homes */}
        <TouchableOpacity
          style={styles.navSectionTab}
          onPress={() => setActiveTab('homes')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.navSectionText,
              (activeTab === 'homes' || activeTab === 'uc') && styles.navSectionActiveText,
            ]}
          >
            Homes
          </Text>
          <View
            style={[
              styles.navSectionIndicator,
              (activeTab === 'homes' || activeTab === 'uc') && styles.navSectionIndicatorActive,
            ]}
          />
        </TouchableOpacity>

        {/* Tab 2: Native */}
        <TouchableOpacity
          style={styles.navSectionTab}
          onPress={() => setActiveTab('native')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.navSectionText,
              activeTab === 'native' && styles.navSectionActiveText,
            ]}
          >
            Native
          </Text>
          <View
            style={[
              styles.navSectionIndicator,
              activeTab === 'native' && styles.navSectionIndicatorActive,
            ]}
          />
        </TouchableOpacity>

        {/* Tab 3: Beauty */}
        <TouchableOpacity
          style={styles.navSectionTab}
          onPress={() => setActiveTab('beauty')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.navSectionText,
              activeTab === 'beauty' && styles.navSectionActiveText,
            ]}
          >
            Beauty
          </Text>
          <View
            style={[
              styles.navSectionIndicator,
              activeTab === 'beauty' && styles.navSectionIndicatorActive,
            ]}
          />
        </TouchableOpacity>
      </View>

      {/* 22. RICH SERVICE & PRODUCT DETAIL MODAL (Direct Web App Specifications) */}
      {selectedService && (
        <Modal
          visible={Boolean(selectedService)}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedService(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.richModalCard}>
              {/* Media Top Container */}
              <View style={styles.richModalMedia}>
                {selectedService.image ? (
                  <SafeImage source={selectedService.image} style={styles.richModalImage} />
                ) : (
                  <View style={styles.richModalImagePlaceholder}>
                    <Text style={{ fontSize: 40 }}>✨</Text>
                  </View>
                )}

                {/* Floating Close Button */}
                <TouchableOpacity
                  onPress={() => setSelectedService(null)}
                  style={styles.richModalCloseBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.richModalCloseIcon}>✕</Text>
                </TouchableOpacity>

                {/* Floating Badge (e.g. BESTSELLER, 3-YEAR WARRANTY, LIMITED EDITION) */}
                {selectedService.badge && (
                  <View style={styles.richModalBadge}>
                    <Text style={styles.richModalBadgeText}>{selectedService.badge}</Text>
                  </View>
                )}

                {/* Duration Badge */}
                {selectedService.duration && (
                  <View style={styles.richModalDurationBadge}>
                    <Text style={styles.richModalDurationText}>⏱ {selectedService.duration}</Text>
                  </View>
                )}
              </View>

              {/* Scrollable Content Body */}
              <ScrollView
                style={styles.richModalScroll}
                contentContainerStyle={styles.richModalScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Rating & Category Row */}
                <View style={styles.richRatingRow}>
                  <View style={styles.richRatingPill}>
                    <Text style={styles.richRatingStar}>★</Text>
                    <Text style={styles.richRatingVal}>{selectedService.rating || 4.86}</Text>
                  </View>
                  <Text style={styles.richReviewsTxt}>
                    ({selectedService.reviewsCount || selectedService.reviews || '124K reviews'})
                  </Text>
                  {selectedService.category && (
                    <View style={styles.richCategoryPill}>
                      <Text style={styles.richCategoryPillText}>{selectedService.category}</Text>
                    </View>
                  )}
                </View>

                {/* Product Title */}
                <Text style={styles.richModalTitle}>
                  {(selectedService.title || selectedService.name || '').replace('\n', ' ')}
                </Text>

                {/* Tagline / Subtitle */}
                {selectedService.tag && (
                  <Text style={styles.richModalTagline}>{selectedService.tag}</Text>
                )}

                {/* Full Description */}
                <Text style={styles.richModalDesc}>
                  {selectedService.description ||
                    'Comprehensive doorstep service executed by trained, background-verified professionals using sealed single-use kits.'}
                </Text>

                {/* Pricing & Savings Card */}
                <View style={styles.richPricingCard}>
                  <View>
                    <View style={styles.richPriceRow}>
                      <Text style={styles.richPriceCurrent}>{selectedService.price || '₹499'}</Text>
                      {selectedService.originalPrice && (
                        <Text style={styles.richPriceOriginal}>{selectedService.originalPrice}</Text>
                      )}
                      {selectedService.originalPrice && (
                        <View style={styles.richDiscountPill}>
                          <Text style={styles.richDiscountText}>SAVE 25%</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.richPriceInclusiveText}>
                      Inclusive of all taxes & single-use kit
                    </Text>
                  </View>
                  <View style={styles.richCoinRewardPill}>
                    <Text style={styles.richCoinRewardText}>+50 UC Coins</Text>
                  </View>
                </View>

                {/* What's Included */}
                {selectedService.inclusions && selectedService.inclusions.length > 0 && (
                  <View style={styles.richSectionBlock}>
                    <Text style={styles.richSectionTitle}>What's Included</Text>
                    {selectedService.inclusions.map((inc, i) => (
                      <View key={i} style={styles.richInclusionItem}>
                        <View style={styles.richCheckCircle}>
                          <Text style={styles.richCheckIcon}>✓</Text>
                        </View>
                        <Text style={styles.richInclusionText}>{inc}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* What's Excluded */}
                {selectedService.exclusions && selectedService.exclusions.length > 0 && (
                  <View style={styles.richSectionBlock}>
                    <Text style={styles.richSectionTitle}>What's Excluded</Text>
                    {selectedService.exclusions.map((exc, i) => (
                      <View key={i} style={styles.richExclusionItem}>
                        <View style={styles.richCrossCircle}>
                          <Text style={styles.richCrossIcon}>✕</Text>
                        </View>
                        <Text style={styles.richExclusionText}>{exc}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* How It Works */}
                {selectedService.steps && selectedService.steps.length > 0 && (
                  <View style={styles.richSectionBlock}>
                    <Text style={styles.richSectionTitle}>How It Works</Text>
                    {selectedService.steps.map((step, i) => (
                      <View key={i} style={styles.richStepItem}>
                        <View style={styles.richStepNumberCircle}>
                          <Text style={styles.richStepNumberText}>{i + 1}</Text>
                        </View>
                        <Text style={styles.richStepText}>{step}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Urban Company Assurance & Warranty Promise */}
                <View style={styles.richAssuranceCard}>
                  <Text style={styles.richAssuranceIcon}>🛡️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.richAssuranceTitle}>
                      {selectedService.warranty || '30-Day Urban Company Assurance'}
                    </Text>
                    <Text style={styles.richAssuranceBody}>
                      100% verified master technicians, sterile single-use packaging, and free doorstep rework if not completely satisfied.
                    </Text>
                  </View>
                </View>
              </ScrollView>

              {/* Fixed Bottom Action Bar */}
              <View style={styles.richModalBottomBar}>
                <View>
                  <Text style={styles.richBottomTotalLabel}>Total payable</Text>
                  <Text style={styles.richBottomTotalVal}>{selectedService.price || '₹499'}</Text>
                </View>
                <TouchableOpacity
                  style={styles.richModalBookBtn}
                  onPress={handleConfirmBooking}
                  activeOpacity={0.85}
                >
                  <Text style={styles.richModalBookBtnText}>Book Now / Add to Cart</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* 23. ALL SERVICES FULL CATALOG MODAL */}
      <Modal
        visible={showAllServicesModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAllServicesModal(false)}
      >
        <View style={styles.allServicesOverlay}>
          {/* Circular Close Button on Top Right (floating above sheet) */}
          <TouchableOpacity
            style={styles.allServicesCloseFloatingBtn}
            onPress={() => setShowAllServicesModal(false)}
            activeOpacity={0.85}
          >
            <Text style={styles.allServicesCloseX}>✕</Text>
          </TouchableOpacity>

          {/* White Bottom Sheet Container */}
          <View style={styles.allServicesSheet}>
            <Text style={styles.allServicesSheetTitle}>All services</Text>

            <ScrollView
              style={styles.allServicesScrollView}
              contentContainerStyle={styles.allServicesScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {ALL_SERVICES_GROUPS.map((group) => (
                <View key={group.id} style={styles.allServicesGroup}>
                  <Text style={styles.allServicesGroupTitle}>{group.title}</Text>

                  <View style={styles.allServicesItemsGrid}>
                    {group.items.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.allServicesGridItem}
                        activeOpacity={0.78}
                        onPress={() => {
                          setShowAllServicesModal(false);
                          handleAddService({ title: item.name, price: item.price, image: item.image });
                        }}
                      >
                        <View style={styles.allServicesCardImageWrapper}>
                          <SafeImage source={item.image} style={styles.allServicesCardImg} />
                          {item.badge && (
                            <View
                              style={
                                item.badge.includes('Price Drop')
                                  ? styles.allServicesPriceDropBadge
                                  : styles.allServicesTimeBadge
                              }
                            >
                              <Text
                                style={
                                  item.badge.includes('Price Drop')
                                    ? styles.allServicesPriceDropText
                                    : styles.allServicesTimeBadgeText
                                }
                              >
                                {item.badge}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.allServicesCardText} numberOfLines={2}>
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    height: Platform.OS === 'web' ? '100vh' : '100%',
    maxHeight: Platform.OS === 'web' ? '100vh' : undefined,
    backgroundColor: '#2B0957',
    maxWidth: Platform.OS === 'web' ? 440 : undefined,
    width: '100%',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  tabContentWrapper: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 90,
  },

  // 1. TOP PURPLE BANNER HEADER
  topPurpleHeader: {
    backgroundColor: '#2B0957',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 10,
    paddingBottom: 14,
  },
  statusLocationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationContainer: {
    flex: 1,
  },
  timeStatusText: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationName: {
    fontSize: 13,
    color: '#E9D5FF',
    fontWeight: '500',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#E9D5FF',
  },
  profileAvatarButton: {
    padding: 2,
  },
  profileInnerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIconText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    height: 48,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
    color: '#64748B',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: 14,
    color: '#94A3B8',
    padding: 6,
  },

  // 2. FESTIVE CAROUSEL BANNER
  festiveContainer: {
    backgroundColor: '#240649',
    paddingTop: 12,
    paddingBottom: 16,
  },
  festiveHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  festiveDiyasLeft: {
    fontSize: 14,
    marginRight: 8,
  },
  festiveDiyasRight: {
    fontSize: 14,
    marginLeft: 8,
  },
  festiveTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FDE047',
    letterSpacing: 2.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  festiveCardsScroll: {
    paddingBottom: 4,
  },
  festiveCard: {
    width: 130,
    height: 150,
    backgroundColor: '#3B0764',
    borderRadius: 10,
    marginRight: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#EAB308',
    position: 'relative',
  },
  festiveTag: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#EAB308',
    paddingVertical: 2,
    zIndex: 10,
    alignItems: 'center',
  },
  festiveTagText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '800',
  },
  festiveCardImage: {
    width: '100%',
    height: 115,
    resizeMode: 'cover',
  },
  festiveCardFooter: {
    height: 35,
    backgroundColor: '#BE185D',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  festiveCardTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  cornerDotTL: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 4,
    height: 4,
    backgroundColor: '#FDE047',
    zIndex: 20,
  },
  cornerDotTR: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 4,
    height: 4,
    backgroundColor: '#FDE047',
    zIndex: 20,
  },
  cornerDotBL: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 4,
    height: 4,
    backgroundColor: '#FDE047',
    zIndex: 20,
  },
  cornerDotBR: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 4,
    height: 4,
    backgroundColor: '#FDE047',
    zIndex: 20,
  },

  // 3. MAIN 8 CATEGORIES GRID
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    rowGap: 14,
  },
  categoryItem: {
    width: '25%',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 6,
  },
  categoryCard: {
    width: '90%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  categoryImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  priceDropPill: {
    position: 'absolute',
    top: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#10B981',
    zIndex: 10,
  },
  priceDropPillText: {
    color: '#059669',
    fontSize: 8,
    fontWeight: '800',
  },
  bottomPillBadge: {
    position: 'absolute',
    bottom: 3,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  bottomPillBadgeText: {
    color: '#059669',
    fontSize: 8.5,
    fontWeight: '700',
  },
  allServicesIconBox: {
    width: '60%',
    height: '60%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  gridDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1E293B',
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 14,
    minHeight: 28,
  },

  // 4. NATIVE SMART PRODUCTS
  nativeScroll: {
    paddingVertical: 8,
  },
  nativeProductCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 10,
  },
  nativeImageContainer: {
    width: '100%',
    height: 100,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  productTag: {
    position: 'absolute',
    top: 4,
    right: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  nativeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 8,
  },
  nativePrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  nativeRating: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },

  // SECTION HEADERS & DIVIDERS
  sectionHeaderRow: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,
  },
  sectionHeaderRowWithLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  sectionSubheading: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  seeAllLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6D28D9',
  },
  sectionDivider: {
    height: 8,
    backgroundColor: '#F8FAFC',
    marginVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },

  // 5. SPOTLIGHT CAROUSEL
  spotlightCarousel: {
    paddingBottom: 4,
  },
  spotlightCard: {
    width: width * 0.84,
    height: 185,
    backgroundColor: '#FFFDF9',
    borderRadius: 14,
    marginRight: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 14,
    height: 14,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderColor: '#EAB308',
    zIndex: 10,
  },
  cornerDotTopLeft: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 3.5,
    height: 3.5,
    backgroundColor: '#EAB308',
    zIndex: 10,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 14,
    height: 14,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: '#EAB308',
    zIndex: 10,
  },
  cornerDotTopRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 3.5,
    height: 3.5,
    backgroundColor: '#EAB308',
    zIndex: 10,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    width: 14,
    height: 14,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
    borderColor: '#EAB308',
    zIndex: 10,
  },
  cornerDotBottomLeft: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 3.5,
    height: 3.5,
    backgroundColor: '#EAB308',
    zIndex: 10,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 14,
    height: 14,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: '#EAB308',
    zIndex: 10,
  },
  cornerDotBottomRight: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 3.5,
    height: 3.5,
    backgroundColor: '#EAB308',
    zIndex: 10,
  },
  spotlightTextContainer: {
    flex: 1.15,
    paddingLeft: 20,
    paddingRight: 6,
    paddingVertical: 18,
    justifyContent: 'center',
    zIndex: 5,
  },
  spotlightCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 5,
  },
  spotlightTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  bookNowButton: {
    backgroundColor: '#111827',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  bookNowButtonText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  spotlightImageContainer: {
    flex: 1,
    height: '100%',
  },
  spotlightImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  // 6. NEW AND NOTEWORTHY 4-COLUMN GRID
  noteworthyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    rowGap: 20,
  },
  noteworthyItem: {
    width: '25%',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  noteworthyImageCard: {
    width: '90%',
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  noteworthyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  newBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#BE123C',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  noteworthyTitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 14.5,
    minHeight: 29,
  },
  subBadgeContainer: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },

  // 7, 10, 11, 12, 14, 15, 16, 18. HORIZONTAL SERVICES SCROLL
  servicesScroll: {
    paddingVertical: 6,
  },
  serviceProductCard: {
    width: 155,
    marginRight: 14,
  },
  serviceImageWrapper: {
    width: 155,
    height: 145,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  addButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#6D28D9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  addButtonText: {
    color: '#6D28D9',
    fontSize: 12.5,
    fontWeight: '800',
  },
  btnSubtext: {
    position: 'absolute',
    bottom: -2,
    right: 12,
    fontSize: 8.5,
    color: '#64748B',
    fontWeight: '500',
  },
  luxeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#CA8A04',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  luxeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  serviceCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 8,
    lineHeight: 17,
    minHeight: 34,
  },
  serviceRating: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 3,
  },
  servicePrice: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  serviceOldPrice: {
    fontSize: 11.5,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },

  // 8. THOUGHTFUL CURATIONS (PORTRAIT STORY CARDS)
  curationsScroll: {
    paddingVertical: 6,
  },
  curationCard: {
    width: 145,
    height: 220,
    borderRadius: 14,
    marginRight: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1E293B',
  },
  curationImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  curationOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  curationTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // 9. LARGE SPOTLIGHT BANNER
  largeSpotlightContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  largeSpotlightCard: {
    width: '100%',
    height: 230,
    backgroundColor: '#E0F2FE',
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  largeSpotlightBg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  largeSpotlightContent: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
  },
  largeSpotlightTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 26,
    letterSpacing: -0.4,
  },
  largeSpotlightSub: {
    fontSize: 12,
    color: '#475569',
    marginTop: 6,
    fontWeight: '500',
  },
  whiteBookBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  whiteBookBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },

  // 13. NATIVE FESTIVE DAYS BANNER
  diyaSectionBar: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeFestiveBanner: {
    width: '100%',
    minHeight: 330,
    backgroundColor: '#4C1D95',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    position: 'relative',
  },
  nativeFestivePill: {
    backgroundColor: '#111827',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  nativeFestivePillText: {
    color: '#FDE047',
    fontSize: 11,
    fontWeight: '800',
  },
  nativeFestiveHeadline: {
    fontSize: 21,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 27,
    letterSpacing: -0.3,
  },
  nativeBannerImageCenter: {
    width: '100%',
    height: 150,
    marginVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeM3Image: {
    width: '75%',
    height: '100%',
    resizeMode: 'contain',
  },
  nativeBannerBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  nativeModelName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  nativeModelPrice: {
    fontSize: 12,
    color: '#E9D5FF',
    marginTop: 2,
  },
  whiteBuyBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingVertical: 9,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  whiteBuyBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },

  // 17. NATIVE M2 PRO LIMITED EDITION BANNER
  nativeM2Banner: {
    width: '100%',
    minHeight: 330,
    backgroundColor: '#F5EBE1',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    position: 'relative',
  },
  nativeM2Pill: {
    borderWidth: 1.2,
    borderColor: '#78350F',
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'center',
    marginBottom: 8,
  },
  nativeM2PillText: {
    color: '#78350F',
    fontSize: 11,
    fontWeight: '800',
  },
  nativeM2Headline: {
    fontSize: 26,
    fontWeight: '900',
    color: '#3F2314',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  nativeM2Sub: {
    fontSize: 13,
    color: '#78350F',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  nativeM2ImageContainer: {
    width: '100%',
    height: 155,
    marginVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeM2Image: {
    width: '80%',
    height: '100%',
    resizeMode: 'contain',
  },
  nativeM2BottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  nativeModelNameDark: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3F2314',
  },
  nativeModelPriceDark: {
    fontSize: 12,
    color: '#78350F',
    marginTop: 2,
  },
  blackBuyBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 22,
    paddingVertical: 9,
    borderRadius: 20,
  },
  blackBuyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  // 19. REFERRAL BANNER
  referralCardContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  referralCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F7FF',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  referralTextSection: {
    flex: 1,
  },
  referralTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
  },
  referralSub: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  copyCodeBtn: {
    backgroundColor: '#6D28D9',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  copyCodeBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  referralGraphicSection: {
    paddingLeft: 12,
  },
  referralGiftsIcon: {
    fontSize: 28,
  },

  // 20. FESTIVE DIYAS BOTTOM BORDER
  diyaFooterBar: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diyaRepeat: {
    fontSize: 18,
    letterSpacing: 4,
  },

  // REWARDS VIEW STYLING
  rewardsHeaderBanner: {
    backgroundColor: '#3B0764',
    padding: 22,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  rewardsHeaderSuper: {
    color: '#FDE047',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  rewardsHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  rewardsHeaderSub: {
    color: '#DDD6FE',
    fontSize: 12.5,
    marginTop: 4,
  },
  coinsBalanceCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: -16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    shadowColor: '#B45309',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  coinsRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coinsBalanceLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#92400E',
    textTransform: 'uppercase',
  },
  coinsValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  coinsIconLarge: {
    fontSize: 26,
    marginRight: 6,
  },
  coinsAmountText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#78350F',
  },
  coinsCurrencyText: {
    fontSize: 13,
    color: '#92400E',
    marginLeft: 6,
    fontWeight: '600',
  },
  redeemBtn: {
    backgroundColor: '#B45309',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
  },
  redeemBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  coinsCardDivider: {
    height: 1,
    backgroundColor: '#FDE68A',
    marginVertical: 12,
  },
  coinsCardHint: {
    fontSize: 11.5,
    color: '#92400E',
    lineHeight: 16,
  },
  ucPlusCard: {
    backgroundColor: '#1E1B4B',
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 16,
    padding: 18,
    position: 'relative',
  },
  ucPlusBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  ucPlusBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
  },
  ucPlusTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  ucPlusDesc: {
    color: '#C7D2FE',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  ucPlusPerksList: {
    marginBottom: 16,
  },
  ucPlusPerkItem: {
    color: '#E0E7FF',
    fontSize: 12.5,
    marginBottom: 6,
    fontWeight: '600',
  },
  joinPlusBtn: {
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  joinPlusBtnText: {
    color: '#000000',
    fontSize: 13.5,
    fontWeight: '800',
  },
  scratchCardsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  scratchCard: {
    width: 140,
    height: 140,
    backgroundColor: '#F3E8FF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#C084FC',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderStyle: 'dashed',
  },
  scratchCardIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  scratchCardTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#6B21A8',
    textAlign: 'center',
  },
  scratchCardSub: {
    fontSize: 10,
    color: '#7E22CE',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },

  // BEAUTY SCREEN STYLES (Screenshots 1 - 5)
  beautyTopHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  beautyHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  beautyHeaderIcon: {
    fontSize: 22,
    marginRight: 8,
  },
  beautyHeaderTitleBold: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  beautyHeaderTitleLight: {
    fontSize: 22,
    fontWeight: '400',
    color: '#64748B',
  },
  beautySearchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 25,
    height: 48,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  beautyCategoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 16,
    rowGap: 14,
  },
  beautyCategoryItem: {
    width: '33.33%',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  beautyCategoryCard: {
    width: '90%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  beautyCategoryImg: {
    width: '78%',
    height: '78%',
    resizeMode: 'contain',
  },
  beautyBadgePill: {
    position: 'absolute',
    bottom: 3,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  beautyBadgeText: {
    color: '#059669',
    fontSize: 8.5,
    fontWeight: '700',
  },
  beautyCategoryName: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 14.5,
  },
  beautySpotlightScroll: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  beautySpotlightCard: {
    width: width - 32,
    height: 180,
    backgroundColor: '#D1D5DB',
    borderRadius: 18,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
  },
  beautySpotlightTextCol: {
    flex: 1.15,
    padding: 18,
    justifyContent: 'space-between',
    zIndex: 5,
  },
  newLaunchPill: {
    backgroundColor: '#831843',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  newLaunchPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  beautySpotlightTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 24,
    letterSpacing: -0.4,
  },
  beautySpotlightSub: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  beautyBookBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  beautyBookBtnText: {
    color: '#0F172A',
    fontSize: 12.5,
    fontWeight: '800',
  },
  beautySpotlightImgWrapper: {
    flex: 1,
    height: '100%',
  },
  beautySpotlightImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  beautyHeroCardContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  beautyHeroCard: {
    width: '100%',
    height: Math.round((width - 32) * (418 / 433)),
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1E293B',
  },
  beautyHeroCardBg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  beautyAddWrapper: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    alignItems: 'center',
  },
  beautyAddBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#6D28D9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  beautyAddBtnText: {
    color: '#6D28D9',
    fontSize: 12.5,
    fontWeight: '800',
  },
  beautyBtnSubtext: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 4,
    borderRadius: 3,
  },
  beautySectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,
  },
  beautySectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  beautySectionSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '400',
    marginTop: 2,
  },
  beautyStartsAtText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '400',
    marginTop: 4,
    marginBottom: -2,
  },
  beautyHeroCardOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
  },
  beautyHeroCardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  beautyHeroCardSub: {
    fontSize: 14,
    color: '#F1F5F9',
    marginTop: 6,
    fontWeight: '600',
    lineHeight: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  whitePillBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  whitePillBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  beautyHeroCardDark: {
    width: '100%',
    height: 270,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  beautyHeroCardOverlayDark: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
  },
  beautyHeroCardTitleDark: {
    fontSize: 21,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  beautyHeroCardSubDark: {
    fontSize: 13,
    color: '#E2E8F0',
    marginTop: 6,
    fontWeight: '500',
  },

  // NATIVE PRODUCTS TAB STYLES (Direct from 5 Screenshots)
  nativeTopHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  nativeHeaderTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  nativeHeaderSubtitle: {
    fontSize: 13.5,
    color: '#64748B',
    fontWeight: '400',
    marginTop: 4,
  },

  // "What are you looking for?" 6-Tile Card (Matches Reference Screenshot)
  nativeLookingForCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 14,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  nativeLookingForTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
    marginBottom: 16,
  },
  nativeLookingForGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
  },
  nativeLookingForItem: {
    width: '31%',
    alignItems: 'center',
  },
  nativeLookingForIconBox: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  nativeLookingForImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  nativeLookingForSaleBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#059669',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    zIndex: 10,
  },
  nativeLookingForSaleText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  nativeLookingForArrivalBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 5,
  },
  nativeLookingForArrivalText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '700',
  },
  nativeLookingForBadgeSpacer: {
    height: 19,
  },
  nativeLookingForLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },

  nativeCategoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  nativeCategoryTile: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    position: 'relative',
  },
  nativeTileBadge: {
    backgroundColor: '#047857',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  nativeTileBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  nativeTileImgContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nativeTileImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  nativeTileName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 8,
    textAlign: 'center',
  },
  nativeProductBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
    zIndex: 5,
  },
  nativeProductBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  nativeBadgeGold: {
    backgroundColor: '#FEF3C7',
    borderWidth: 0.8,
    borderColor: '#FDE68A',
  },
  nativeBadgeGoldText: {
    color: '#78350F',
  },
  nativeBadgePurple: {
    backgroundColor: '#4C1D95',
  },
  nativeBadgePurpleText: {
    color: '#FFFFFF',
  },
  nativeHeroStoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  nativeHeroStoryCard: {
    width: '100%',
    height: Math.round((width - 32) * (195 / 433)),
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#382012',
  },
  nativeHeroStoryBg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  nativeCompareBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    marginTop: 16,
    backgroundColor: '#FFFFFF',
  },
  nativeCompareLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nativeCompareIcon: {
    fontSize: 18,
    marginRight: 10,
    color: '#0F172A',
  },
  nativeCompareText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  nativeCompareArrow: {
    fontSize: 20,
    color: '#0F172A',
    fontWeight: '700',
  },
  nativeExclusiveCardWrapper: {
    width: 210,
    height: 285,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  nativeExclusiveCardImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  nativeAdvantageCardWrapper: {
    width: 250,
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  nativeAdvantageCardImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  nativeBusinessSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  nativeBusinessDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    marginTop: 6,
    marginBottom: 16,
  },
  nativeBusinessLink: {
    color: '#2563EB',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  nativePedestalsContainer: {
    width: '100%',
    height: Math.round((width - 32) * (260 / 433)),
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  nativePedestalsImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  nativeLabSection: {
    backgroundColor: '#0B0F19',
    paddingTop: 16,
    paddingBottom: 40,
  },
  nativeLabCollageContainer: {
    width: width - 32,
    height: Math.round((width - 32) * (570 / 433)),
    borderRadius: 16,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: '#1E293B',
  },
  nativeLabCollageImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  nativeLabTextContainer: {
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  nativeLabTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 33,
    letterSpacing: -0.4,
    marginBottom: 20,
  },
  nativeLabBody: {
    fontSize: 14.5,
    color: '#9CA3AF',
    lineHeight: 23,
    marginBottom: 18,
    fontWeight: '400',
  },
  bottomNavNativeImg: {
    width: 20,
    height: 24,
    resizeMode: 'contain',
    marginBottom: 2,
  },
  bottomNavTabImg: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    marginBottom: 3,
    opacity: 0.65,
  },
  bottomNavActiveTabImg: {
    opacity: 1,
    transform: [{ scale: 1.08 }],
  },

  // HOMES HERO BANNER
  homesHeroBanner: {
    backgroundColor: '#064E3B',
    padding: 22,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  homesHeroTag: {
    color: '#A7F3D0',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  homesHeroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  homesHeroSub: {
    color: '#D1FAE5',
    fontSize: 12,
    marginTop: 6,
  },

  // 21. BOTTOM NAVIGATION BAR (3 SECTIONS: HOMES, NATIVE, BEAUTY)
  bottomNavContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 6,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  navSectionTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  navSectionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.1,
  },
  navSectionActiveText: {
    color: '#000000',
    fontWeight: '800',
  },
  navSectionIndicator: {
    height: 3.5,
    width: '100%',
    minWidth: 54,
    backgroundColor: 'transparent',
    marginTop: 6,
    borderRadius: 2,
  },
  navSectionIndicatorActive: {
    backgroundColor: '#000000',
  },
  bottomNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  bottomNavIcon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.45,
  },
  bottomNavActiveIcon: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  bottomNavText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  bottomNavActiveText: {
    color: '#0F172A',
    fontWeight: '800',
  },
  bottomActiveIndicator: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#6D28D9',
  },
  rewardsBadgeDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },

  // 22. MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalCategory: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#7C3AED',
    textTransform: 'uppercase',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalCloseIcon: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '700',
  },
  modalImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    resizeMode: 'cover',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
  },
  modalPriceLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  modalPriceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCta: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  modalCtaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // 23. ALL SERVICES MODAL STYLING
  allServicesOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  allServicesCloseFloatingBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 36,
    right: 18,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  allServicesCloseX: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  allServicesSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '86%',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  allServicesSheetTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 16,
    paddingHorizontal: 4,
    letterSpacing: -0.4,
  },
  allServicesScrollView: {
    flex: 1,
  },
  allServicesScrollContent: {
    paddingBottom: 20,
  },
  allServicesGroup: {
    marginBottom: 22,
  },
  allServicesGroupTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    paddingHorizontal: 4,
    letterSpacing: -0.2,
  },
  allServicesItemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 14,
  },
  allServicesGridItem: {
    width: '25%',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  allServicesCardImageWrapper: {
    width: '90%',
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  allServicesCardImg: {
    width: '74%',
    height: '74%',
    resizeMode: 'contain',
  },
  allServicesTimeBadge: {
    position: 'absolute',
    bottom: 2,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  allServicesTimeBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#059669',
  },
  allServicesPriceDropBadge: {
    position: 'absolute',
    top: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#10B981',
  },
  allServicesPriceDropText: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#059669',
  },
  allServicesCardText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 13.5,
    minHeight: 27,
  },

  // 24. RICH SERVICE DETAIL MODAL (Matching Web App Specs)
  richModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    width: '100%',
    overflow: 'hidden',
  },
  richModalMedia: {
    height: 190,
    width: '100%',
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  richModalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  richModalImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },
  richModalCloseBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  richModalCloseIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  richModalBadge: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    backgroundColor: '#6D28D9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  richModalBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  richModalDurationBadge: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  richModalDurationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  richModalScroll: {
    maxHeight: Dimensions.get('window').height * 0.55,
  },
  richModalScrollContent: {
    padding: 18,
    paddingBottom: 24,
  },
  richRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  richRatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 3,
  },
  richRatingStar: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '800',
  },
  richRatingVal: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '800',
  },
  richReviewsTxt: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  richCategoryPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  richCategoryPillText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  richModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 26,
    marginBottom: 4,
  },
  richModalTagline: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#6D28D9',
    marginBottom: 8,
  },
  richModalDesc: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
  },
  richPricingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  richPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  richPriceCurrent: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  richPriceOriginal: {
    fontSize: 14,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  richDiscountPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  richDiscountText: {
    color: '#166534',
    fontSize: 10.5,
    fontWeight: '800',
  },
  richPriceInclusiveText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
    marginTop: 3,
  },
  richCoinRewardPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  richCoinRewardText: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '800',
  },
  richSectionBlock: {
    marginBottom: 20,
  },
  richSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  richInclusionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  richCheckCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  richCheckIcon: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '900',
  },
  richInclusionText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  richExclusionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  richCrossCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  richCrossIcon: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '900',
  },
  richExclusionText: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  richStepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  richStepNumberCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  richStepNumberText: {
    color: '#6D28D9',
    fontSize: 11,
    fontWeight: '900',
  },
  richStepText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  richAssuranceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  richAssuranceIcon: {
    fontSize: 24,
  },
  richAssuranceTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#4C1D95',
    marginBottom: 2,
  },
  richAssuranceBody: {
    fontSize: 12,
    color: '#5B21B6',
    lineHeight: 16,
  },
  richModalBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  richBottomTotalLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  richBottomTotalVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  richModalBookBtn: {
    backgroundColor: '#6D28D9',
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  richModalBookBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // 25. SEARCH RESULTS LIST VIEW
  searchResultsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  searchResultsCount: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  clearSearchLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6D28D9',
  },
  noResultsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  noResultsTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  noResultsSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  searchResultCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  searchResultMedia: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    position: 'relative',
  },
  searchResultImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  searchResultImgPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },
  searchResultBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  searchResultBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  searchResultInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  searchResultRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  searchResultStar: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  searchResultReviews: {
    fontSize: 11,
    color: '#64748B',
  },
  searchResultDuration: {
    fontSize: 11,
    color: '#94A3B8',
  },
  searchResultTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 18,
    marginBottom: 2,
  },
  searchResultDesc: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 15,
    marginBottom: 6,
  },
  searchResultBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchResultPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  searchResultPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  searchResultOrigPrice: {
    fontSize: 11.5,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  searchResultAddBtn: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 6,
  },
  searchResultAddBtnText: {
    color: '#6D28D9',
    fontSize: 12,
    fontWeight: '800',
  },

  // ==========================================
  // WEB-ALIGNED HERO & SHOWCASE STYLES
  // ==========================================
  webHeroSection: {
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingBottom: 16,
  },
  doorstepHeadline: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    lineHeight: 32,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 10,
  },

  // 4-Photo 2x2 Mosaic Collage (Homes View)
  mosaicGrid2x2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 16,
    gap: 10,
  },
  mosaicSubcol: {
    flex: 1,
    gap: 10,
  },
  mosaicImgCard: {
    width: '100%',
    height: 110,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  mosaicImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  // Beauty Tab: Web Categories Card
  beautyWebCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 14,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  beautyWebGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
  },
  beautyWebItem: {
    width: '31%',
    alignItems: 'center',
  },
  beautyWebIconBox: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  beautyWebImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  beautyArrivalBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 5,
  },
  beautyArrivalBadgeText: {
    color: '#7E22CE',
    fontSize: 9.5,
    fontWeight: '700',
  },
  beautyBadgeSpacer: {
    height: 18,
  },
  beautyWebLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 15,
  },

  // Beauty 2-Photo Mosaic Row
  beautyMosaicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    gap: 10,
  },
  beautyMosaicCard: {
    flex: 1,
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  beautyMosaicImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  // Rating & Trust Banner
  ratingTrustBanner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  ratingTrustCol: {
    alignItems: 'center',
  },
  ratingTrustNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  ratingTrustLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  ratingTrustDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
  },

  // Native Showcase Cards (Water Purifiers & Smart Locks)
  nativeShowcaseGrid: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  nativeShowcaseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  nativeShowcaseBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#047857',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 5,
  },
  nativeShowcaseBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  nativeShowcaseImgBox: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  nativeShowcaseImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  nativeShowcaseTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  nativeShowcaseDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },
  nativeShowcasePrimaryBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeShowcasePrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  nativeShowcaseSecondaryBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeShowcaseSecondaryBtnText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
});
