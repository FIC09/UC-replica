import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  StatusBar,
  Dimensions,
  Platform,
  Image,
  Modal,
  Alert
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { mobileApi } from './src/services/apiClient';
import { SERVICES as WEB_APP_SERVICES, CATEGORIES as WEB_APP_CATEGORIES } from './src/data/servicesData';
import LoginAuthModal from './src/components/LoginAuthModal';
import WorkingPartnerDashboard from './src/components/WorkingPartnerDashboard';
import CustomerOrderTrackingModal from './src/components/CustomerOrderTrackingModal';
import BookingCheckoutFlowModal from './src/components/BookingCheckoutFlowModal';

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

// Role-specific Unique Catalog & Service Assets (assigned to reliable, pre-indexed assets)
IMAGES.shelfInstall = IMAGES.cupboardDrawerTable;
IMAGES.doorLockMortise = IMAGES.doorRepairWood;
IMAGES.drainBlockage = IMAGES.washBasin;
IMAGES.flushTank = IMAGES.homeBathroom;
IMAGES.connectionHose = IMAGES.washBasin;
IMAGES.tubelight = IMAGES.homeElectrician;
IMAGES.bulbInstall = IMAGES.homeElectrician;
IMAGES.cleaningBedroomBucket = IMAGES.livingBedroomClean;
IMAGES.laptopRepairBoard = IMAGES.laptopRepair;
IMAGES.microwaveCleanOven = IMAGES.applianceMicrowave;
IMAGES.tvCheckupItem = IMAGES.applianceTv;
IMAGES.geyserServiceTank = IMAGES.applianceWaterPurifier;
IMAGES.chimneyServiceClean = IMAGES.applianceChimney;
IMAGES.refrigeratorCheckupItem = IMAGES.applianceFridge;
IMAGES.washingMachineCheckupItem = IMAGES.washerServiceItem;
IMAGES.kitchenStoveClean = IMAGES.stoveRepair;
IMAGES.nativeM1Purifier = IMAGES.nativePurifier;
IMAGES.nativeSmartLock = IMAGES.nativeTileLocks;
IMAGES.salonBrazilianWax = IMAGES.salonRollonWaxing;
IMAGES.matchaDetoxRitual = IMAGES.beautyJapaneseRitual;
IMAGES.salonAquaGelWax = IMAGES.salonRollonWaxing;
IMAGES.cherryBlossomRitual = IMAGES.beautyJapaneseRitual;
IMAGES.salonBleachPhoto = IMAGES.salonRollonWaxing;
IMAGES.heroSalon = IMAGES.salonRollonWaxing;
IMAGES.beautyPotliMassage = IMAGES.heroMassage;

// Comprehensive Filename-to-Asset Mapping ensuring 100% reliable local image resolution
const FILENAME_MAP = {
  // Category Icons & Headers
  'cat_instahelp.jpg': IMAGES.catInstahelp,
  'cat_womens_salon.jpg': IMAGES.catWomensSalon,
  'cat_mens_salon.jpg': IMAGES.catMensSalon,
  'cat_cleaning.jpg': IMAGES.catCleaning,
  'cat_painting.jpg': IMAGES.catPainting,
  'cat_ac.jpg': IMAGES.catAc,
  'cat_repairs.jpg': IMAGES.catRepairs,
  'cat_lock.jpg': IMAGES.catLock,
  'cat_purifier.jpg': IMAGES.catPurifier,
  'icon_salon_women_avatar.jpg': IMAGES.beautyWomenAvatar,
  'beauty_women_avatar.jpg': IMAGES.beautyWomenAvatar,
  'icon_salon_men_avatar.jpg': IMAGES.beautyMenAvatar,
  'beauty_men_avatar.jpg': IMAGES.beautyMenAvatar,
  'icon_hair_dryer.jpg': IMAGES.beautyHairDryer,
  'beauty_hair_dryer.jpg': IMAGES.beautyHairDryer,
  'icon_spa_prime.jpg': IMAGES.beautySpaPrime,
  'icon_massage_bed.jpg': IMAGES.beautyMassageBed,

  // Native Smart Products
  'native_purifier.jpg': IMAGES.nativePurifier,
  'native_m1_purifier.jpg': IMAGES.nativeM1Purifier,
  'native_m2_pro_ltd.jpg': IMAGES.nativeM2ProLtd,
  'native_m3_pro.jpg': IMAGES.nativeM3Pro,
  'native_m3_basic.jpg': IMAGES.nativeM3Basic,
  'native_smart_lock.jpg': IMAGES.nativeSmartLock,
  'native_lock_ultra.jpg': IMAGES.nativeLockUltra,
  'native_lock_pro.jpg': IMAGES.nativeLockPro,
  'native_tile_purifiers.jpg': IMAGES.nativeTilePurifiers,
  'native_tile_locks.jpg': IMAGES.nativeTileLocks,
  'native_hero_story.jpg': IMAGES.nativeHeroStory,
  'native_pedestals.jpg': IMAGES.nativePedestals,
  'native_lab_collage.jpg': IMAGES.nativeLabCollage,
  'native_exclusive_bank.jpg': IMAGES.nativeExclusiveBank,
  'native_exclusive_exchange.jpg': IMAGES.nativeExclusiveExchange,
  'native_advantage_install.jpg': IMAGES.nativeAdvantageInstall,
  'native_advantage_support.jpg': IMAGES.nativeAdvantageSupport,

  // Appliances
  'appliance_ac.jpg': IMAGES.acService,
  'ac_service_card.jpg': IMAGES.acCard,
  'hero_ac.jpg': IMAGES.heroAc,
  'appliance_chimney.jpg': IMAGES.chimneyServiceClean,
  'appliance_geyser.jpg': IMAGES.geyserServiceTank,
  'appliance_laptop.jpg': IMAGES.laptopRepair,
  'laptop_dell_xps.jpg': IMAGES.laptopRepair,
  'appliance_microwave.jpg': IMAGES.applianceMicrowave,
  'appliance_tv.jpg': IMAGES.applianceTv,
  'appliance_fridge.jpg': IMAGES.applianceFridge,
  'appliance_washer.jpg': IMAGES.washerMachine,
  'appliance_water_purifier.jpg': IMAGES.applianceWaterPurifier,
  'washing_machine_checkup_item.jpg': IMAGES.washerServiceItem,

  // Home Care & Repairs
  'home_bathroom.jpg': IMAGES.homeBathroom,
  'home_painter.jpg': IMAGES.homePainter,
  'home_sofa_clean.jpg': IMAGES.homeSofaClean,
  'home_electrician.jpg': IMAGES.homeElectrician,
  'cleaning_bedroom_bucket.jpg': IMAGES.livingBedroomClean,
  'kitchen_stove_clean.jpg': IMAGES.stoveRepair,
  'ceiling_fan_install.jpg': IMAGES.ceilingFanInstall,
  'fan_repair.jpg': IMAGES.fanRepair,
  'bulb_install.jpg': IMAGES.bulbInstall,
  'internal_wiring.jpg': IMAGES.internalWiring,
  'wash_basin.jpg': IMAGES.washBasin,
  'door_repair_wood.jpg': IMAGES.doorRepairWood,
  'cupboard_drawer_table.jpg': IMAGES.cupboardDrawerTable,
  'cockroach_spray_can.jpg': IMAGES.cockroachSpray,
  'decor_abstract_frame.jpg': IMAGES.decorAbstractFrame,
  'home_festive.jpg': IMAGES.homeFestive,

  // Beauty & Salon
  'beauty_arm_treatment.jpg': IMAGES.beautyArmTreatment,
  'beauty_mens_haircut.jpg': IMAGES.beautyMensHaircut,
  'beauty_pedicure.jpg': IMAGES.beautyPedicure,
  'beauty_blowdry.jpg': IMAGES.beautyBlowdry,
  'beauty_curls_waves.jpg': IMAGES.beautyCurlsWaves,
  'beauty_straightening.jpg': IMAGES.beautyStraightening,
  'beauty_japanese_ritual.jpg': IMAGES.beautyJapaneseRitual,
  'beauty_hero_kglow.jpg': IMAGES.beautyHeroKglow,
  'beauty_korean_glow_facial.jpg': IMAGES.beautyKoreanGlowFacial,
  'beauty_skin_hydrating.jpg': IMAGES.beautySkinHydrating,
  'beauty_hero_trimmed.jpg': IMAGES.beautyHeroTrimmed,
  'beauty_hero_pain_relief.jpg': IMAGES.beautyHeroPainRelief,
  'beauty_deep_tissue_women.jpg': IMAGES.beautyDeepTissueWomen,
  'beauty_men_haircut_card.jpg': IMAGES.beautyMenHaircutCard,
  'beauty_beard_trim_card.jpg': IMAGES.beautyBeardTrimCard,
  'beauty_massage_men_card.jpg': IMAGES.beautyMassageMenCard,
  'salon_rollon_waxing.jpg': IMAGES.salonRollonWaxing,
  'salon_festive_glow.jpg': IMAGES.salonFestive,
  'spotlight_waxing.jpg': IMAGES.spotlightWaxing,
  'spotlight_massage.jpg': IMAGES.spotlightMassage,
  'spotlight_japanese_glow.jpg': IMAGES.spotlightGlow,
  'men_clean_shave_pro.jpg': IMAGES.menCleanShave,
  'men_haircut_pro.jpg': IMAGES.menHaircutPro,
  'men_head_neck_shoulder.jpg': IMAGES.menHeadNeckShoulder,
  'hero_massage.jpg': IMAGES.heroMassage,
  'hair_head_massage_relax.jpg': IMAGES.headMassage,
  'hair_blowdry_curl.jpg': IMAGES.hairBlowdryCurl,
  'hair_curls_waves.jpg': IMAGES.hairCurlsWaves,
  'hair_straightening.jpg': IMAGES.hairStraightening,
  'hair_wavy_back.jpg': IMAGES.hairStudioWomen,
  'men_prime_hydrating_facial.jpg': IMAGES.menHydratingFacial,
  'men_prime_beard_trim.jpg': IMAGES.menBeardTrim,
};

// Filter out tiny category icons so full services use crystal-clear studio photographs
const isCategoryIcon = (num) => {
  return (
    num === IMAGES.catWomensSalon ||
    num === IMAGES.catMensSalon ||
    num === IMAGES.catCleaning ||
    num === IMAGES.catPainting ||
    num === IMAGES.catAc ||
    num === IMAGES.catRepairs ||
    num === IMAGES.catLock ||
    num === IMAGES.catPurifier ||
    num === IMAGES.catInstahelp ||
    num === IMAGES.beautyWomenAvatar ||
    num === IMAGES.beautyMenAvatar ||
    num === IMAGES.beautySpaPrime ||
    num === IMAGES.beautyHairDryer ||
    num === IMAGES.beautyMassageBed
  );
};

// Unique Image Resolver based on Service Name, Designation Role & Category
const resolveServiceImage = (item) => {
  if (!item) return IMAGES.homeSofaClean;

  // 1. If already a local require() number or asset object with default/uri, use it (if not a small category icon)
  if (typeof item === 'number' && !isCategoryIcon(item)) return item;
  if (typeof item === 'object' && item !== null && item.default && !isCategoryIcon(item.default)) return item.default;
  if (typeof item.image === 'number' && !isCategoryIcon(item.image)) return item.image;
  if (typeof item.image === 'object' && item.image !== null && item.image.default && !isCategoryIcon(item.image.default)) return item.image.default;
  if (typeof item.icon === 'number' && !isCategoryIcon(item.icon)) return item.icon;
  if (typeof item.icon === 'object' && item.icon !== null && item.icon.default && !isCategoryIcon(item.icon.default)) return item.icon.default;

  // 2. Direct filename lookup
  const imgStr = typeof item === 'string' ? item : (typeof item.image === 'string' ? item.image : (typeof item.icon === 'string' ? item.icon : (item.image?.uri || item.icon?.uri || '')));
  if (imgStr) {
    const fn = imgStr.split('?')[0].split('/').pop().toLowerCase();
    if (FILENAME_MAP[fn] && !isCategoryIcon(FILENAME_MAP[fn])) return FILENAME_MAP[fn];
  }

  // If item has a custom remote or uploaded image URL from Admin Dashboard / DB, prioritize it
  if (typeof item === 'object' && item !== null && typeof item.image === 'string' && (item.image.startsWith('http://') || item.image.startsWith('https://') || item.image.startsWith('data:image/'))) {
    return { uri: item.image };
  }

  // 3. Extract strings for title, category, subcategory, and description
  const title = (typeof item === 'string' ? item : (item.title || item.name || '')).toLowerCase();
  const cat = (typeof item === 'object' && item !== null ? (item.category || item.categoryName || '') : '').toLowerCase();
  const sub = (typeof item === 'object' && item !== null ? (item.subcategory || '') : '').toLowerCase();
  const desc = (typeof item === 'object' && item !== null ? (item.description || '') : '').toLowerCase();
  const role = `${title} ${cat} ${sub} ${desc}`;

  // Check if title itself is a filename in FILENAME_MAP
  const titleClean = title.split('?')[0].split('/').pop().toLowerCase();
  if (FILENAME_MAP[titleClean] && !isCategoryIcon(FILENAME_MAP[titleClean])) return FILENAME_MAP[titleClean];

  // 1. CARPENTER & FURNITURE ASSEMBLY
  if (title.includes('floating shelf') || title.includes('shelf install') || title.includes('cabinet install')) {
    return IMAGES.shelfInstall;
  }
  if (title.includes('bed') || title.includes('wardrobe') || title.includes('assembly') || title.includes('cupboard') || title.includes('drawer')) {
    return IMAGES.cupboardDrawerTable;
  }
  if (title.includes('door lock') || title.includes('mortise')) {
    return IMAGES.doorLockMortise;
  }
  if (title.includes('door repair') || title.includes('door trim') || title.includes('hinge') || title.includes('drill') || title.includes('curtain rod')) {
    return IMAGES.doorRepairWood;
  }
  if (title.includes('wall decor') || title.includes('frame install') || title.includes('mirror hang')) {
    return IMAGES.decorAbstractFrame;
  }

  // 2. PLUMBING & PIPE LINE SERVICES
  if (title.includes('pipe') || title.includes('pipeline') || title.includes('drain') || title.includes('blockage') || title.includes('water tank')) {
    return IMAGES.drainBlockage;
  }
  if (title.includes('tap') || title.includes('mixer') || title.includes('wash basin') || title.includes('shower')) {
    return IMAGES.washBasin;
  }
  if (title.includes('flush') || title.includes('toilet') || title.includes('commode')) {
    return IMAGES.flushTank;
  }
  if (title.includes('hose') || title.includes('valve') || title.includes('connection')) {
    return IMAGES.connectionHose;
  }

  // 3. AC & AIR CONDITIONING SERVICES
  if (title.includes('powerjet') || title.includes('all in all ac') || title.includes('ac service') || title.includes('servicing') || (cat === 'ac-appliances' && title.includes('ac'))) {
    return IMAGES.acCard;
  }
  if (title.includes('gas leak') || title.includes('ac repair') || title.includes('cooling check') || title.includes('split / window')) {
    return IMAGES.acService;
  }

  // 4. HOME APPLIANCES (Individual Unique Role Images)
  if (role.includes('washing machine') || role.includes('washer')) {
    return IMAGES.washingMachineCheckupItem;
  }
  if (role.includes('refrigerator') || role.includes('fridge')) {
    return IMAGES.refrigeratorCheckupItem;
  }
  if (role.includes('chimney')) {
    return IMAGES.chimneyServiceClean;
  }
  if (role.includes('geyser') || role.includes('water heater')) {
    return IMAGES.geyserServiceTank;
  }
  if (role.includes('laptop') || role.includes('computer')) {
    return IMAGES.laptopRepairBoard;
  }
  if (role.includes('microwave') || role.includes('oven')) {
    return IMAGES.microwaveCleanOven;
  }
  if (role.includes('tv') || role.includes('television') || role.includes('led')) {
    return IMAGES.tvCheckupItem;
  }

  // 5. ELECTRICIAN SERVICES
  if (title.includes('tubelight') || title.includes('batten')) {
    return IMAGES.tubelight;
  }
  if (title.includes('bulb') || title.includes('spot light')) {
    return IMAGES.bulbInstall;
  }
  if (title.includes('ceiling fan') || title.includes('exhaust fan') || title.includes('fan install')) {
    return IMAGES.ceilingFanInstall;
  }
  if (title.includes('fan repair')) {
    return IMAGES.fanRepair;
  }
  if (title.includes('switchboard') || title.includes('socket')) {
    return IMAGES.homeElectrician;
  }
  if (title.includes('wiring') || title.includes('mcb') || title.includes('fuse') || title.includes('inverter') || title.includes('tripping')) {
    return IMAGES.internalWiring;
  }

  // 6. CLEANING & PEST CONTROL
  if (title.includes('cockroach') || title.includes('pest') || title.includes('ant') || title.includes('termite')) {
    return IMAGES.cockroachSpray;
  }
  if (title.includes('sofa') || title.includes('couch')) {
    return IMAGES.homeSofaClean;
  }
  if (title.includes('bathroom') || title.includes('toilet cleaning')) {
    return IMAGES.homeBathroom;
  }
  if (title.includes('kitchen') || title.includes('stove')) {
    return IMAGES.kitchenStoveClean;
  }
  if (title.includes('full home') || title.includes('room cleaning') || title.includes('house clean') || title.includes('clean')) {
    return IMAGES.cleaningBedroomBucket;
  }
  if (title.includes('painting') || title.includes('waterproofing') || title.includes('dampness')) {
    return IMAGES.homePainter;
  }

  // 7. NATIVE SMART LIVING
  if (title.includes('m1')) return IMAGES.nativeM1Purifier;
  if (title.includes('m2')) return IMAGES.nativeM2ProLtd;
  if (title.includes('m3')) return IMAGES.nativeM3Pro;
  if (title.includes('purifier') || title.includes('water filter') || title.includes('ro service') || title.includes('water')) {
    return IMAGES.applianceWaterPurifier;
  }
  if (title.includes('lock ultra') || title.includes('face recognition')) {
    return IMAGES.nativeLockUltra;
  }
  if (title.includes('lock pro')) {
    return IMAGES.nativeLockPro;
  }
  if (title.includes('smart lock') || title.includes('door lock') || title.includes('lock')) {
    return IMAGES.nativeSmartLock;
  }

  // 8. BEAUTY & SALON (Role-based High-Res Studio Photography)
  if (title.includes('brazilian') || title.includes('stripless') || title.includes('intimate')) return IMAGES.spotlightWaxing;
  if (title.includes('matcha')) return IMAGES.matchaDetoxRitual;
  if (title.includes('aqua gel')) return IMAGES.salonAquaGelWax;
  if (title.includes('cherry blossom') || title.includes('sakura')) return IMAGES.cherryBlossomRitual;
  if (title.includes('bleach')) return IMAGES.salonBleachPhoto;
  if (title.includes('waxing') || title.includes('roll-on') || title.includes('rica') || title.includes('arms') || title.includes('legs') || title.includes('wax')) {
    return IMAGES.salonRollonWaxing;
  }
  if (title.includes('bridal') || title.includes('facial') || title.includes('glow') || title.includes('korean')) {
    return IMAGES.beautyKoreanGlowFacial;
  }
  if (title.includes('manicure') || title.includes('pedicure') || title.includes('mani-pedi') || title.includes('mani') || title.includes('pedi')) {
    return IMAGES.beautyPedicure;
  }
  if (title.includes('festive') || title.includes('package') || title.includes('combo') || title.includes('maintenance')) {
    return IMAGES.salonFestive;
  }
  if (title.includes('beard') || title.includes('shave')) {
    return IMAGES.menCleanShave;
  }
  if (title.includes('haircut') || title.includes('grooming') || (title.includes('men') && !title.includes('women'))) {
    return IMAGES.menHaircutPro;
  }
  if (title.includes('hair') || title.includes('spa') || title.includes('blowdry') || title.includes('curls') || title.includes('straightening')) {
    return IMAGES.hairCurlsWaves;
  }
  if (title.includes('massage') || title.includes('potli') || title.includes('pain relief')) {
    return IMAGES.heroMassage;
  }
  if (cat.includes('salon') || cat.includes('beauty') || role.includes('salon for women') || role.includes('women')) {
    return IMAGES.beautyArmTreatment;
  }

  // 9. Remote URL fallback if valid
  if (typeof item === 'object' && item !== null && typeof item.image === 'string' && (item.image.startsWith('http://') || item.image.startsWith('https://'))) {
    return { uri: item.image };
  }

  // Role Category Default Fallbacks
  if (cat.includes('repair') || sub.includes('carpenter') || role.includes('carpenter')) return IMAGES.doorRepairWood;
  if (cat.includes('plumb') || sub.includes('plumber') || role.includes('plumber')) return IMAGES.drainBlockage;
  if (cat.includes('elect') || sub.includes('electrician') || role.includes('electrician')) return IMAGES.homeElectrician;
  if (cat.includes('clean') || role.includes('clean')) return IMAGES.homeBathroom;
  if (cat.includes('beauty') || cat.includes('salon') || role.includes('salon')) {
    return title.includes('men') ? IMAGES.menHaircutPro : IMAGES.beautyArmTreatment;
  }
  if (role.includes('ac')) return IMAGES.acCard;

  return IMAGES.homeSofaClean;
};

// Clean Image Normalizer across Web (Metro / Webpack), iOS / Android native (require asset numbers), and remote URIs
const normalizeSource = (source, item) => {
  if (!source && !item) return null;

  let s = source;
  if (!s && item) {
    s = item.image || item.icon;
  }

  // Unwrap any ES Module .default (crucial for Metro Web / React Native Web)
  while (s && typeof s === 'object' && s.default !== undefined) {
    s = s.default;
  }

  // 1. Native asset number (e.g. require() on Android/iOS)
  if (typeof s === 'number') return s;

  // 2. Object with uri property (e.g. remote network URL, Metro asset object)
  if (s && typeof s === 'object' && typeof s.uri === 'string' && s.uri.trim().length > 0) {
    const rawUri = s.uri.trim();
    // Prioritize high-resolution local bundled assets by filename match
    const fnFromUri = rawUri.split('?')[0].split('/').pop().toLowerCase();
    if (FILENAME_MAP[fnFromUri]) {
      return normalizeSource(FILENAME_MAP[fnFromUri], item);
    }
    // Remote full network URLs (http/https/data)
    if (rawUri.startsWith('http://') || rawUri.startsWith('https://') || rawUri.startsWith('data:') || rawUri.startsWith('blob:')) {
      return { uri: rawUri };
    }
    // Web only relative paths
    if (Platform.OS === 'web' && (rawUri.startsWith('/') || rawUri.startsWith('./'))) {
      return { uri: rawUri };
    }
    // On native iOS/Android, resolve via role-based local high-res image
    if (item) {
      const fallback = resolveServiceImage(item);
      if (fallback && fallback !== s) return normalizeSource(fallback, null);
    }
    return { uri: rawUri };
  }

  // 3. String (web URL, data URI, web path, or asset filename)
  if (typeof s === 'string' && s.trim().length > 0) {
    const trimmed = s.trim();

    // Check if filename is in local high-res bundled assets FIRST
    const fn = trimmed.split('?')[0].split('/').pop().toLowerCase();
    if (FILENAME_MAP[fn]) {
      return normalizeSource(FILENAME_MAP[fn], item);
    }

    // Remote HTTP/HTTPS URLs or Data URIs
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
      return { uri: trimmed };
    }

    // If on web and starts with / or ./
    if (Platform.OS === 'web' && (trimmed.startsWith('/') || trimmed.startsWith('./'))) {
      return { uri: trimmed };
    }

    // On native mobile (iOS / Android), fall back to role-resolved local image
    if (item) {
      const fallback = resolveServiceImage(item);
      if (fallback && fallback !== s) {
        return normalizeSource(fallback, null);
      }
    }

    return { uri: trimmed };
  }

  return s;
};

// Safe Image component with graceful fallback, role resolver and zero-blank guarantees
const SafeImage = ({ source, item, style, fallbackIcon = '✨', resizeMode = 'cover' }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [source, item]);

  const resolved = normalizeSource(source, item);

  // If source failed to load or is invalid
  if (hasError || !resolved) {
    // If item was provided, resolve a role-based fallback matching its actual service or category
    if (item) {
      const fallback = resolveServiceImage(item);
      const normalizedFallback = normalizeSource(fallback, null);
      if (normalizedFallback) {
        return (
          <Image
            source={normalizedFallback}
            style={style}
            resizeMode={resizeMode}
            onError={() => {}}
          />
        );
      }
    }
    // Graceful icon container fallback (never collapses all into one identical picture)
    return (
      <View style={[style, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }]}>
        <Text style={{ fontSize: 20 }}>{fallbackIcon}</Text>
      </View>
    );
  }

  return (
    <Image
      source={resolved}
      style={style}
      resizeMode={resizeMode}
      onError={() => setHasError(true)}
    />
  );
};

// 1. Festive Banner Cards
const FESTIVE_CARDS = [
  {
    id: 'festive-2',
    title: 'Deep cleaning',
    tag: 'Up to 20% off',
    image: IMAGES.homeSofaClean,
    bgColor: '#D03800',
  },
  {
    id: 'festive-3',
    title: 'Appliance care',
    tag: '25% off',
    image: IMAGES.heroAc,
    bgColor: '#FFD91A',
  },
  {
    id: 'festive-4',
    title: 'Diwali lights & decor',
    tag: 'Festive Deal',
    image: IMAGES.decorAbstractFrame,
    bgColor: '#000000',
  },
  {
    id: 'festive-5',
    title: 'Home festive painting',
    tag: 'Upto 20% off',
    image: IMAGES.homePainter,
    bgColor: '#F04400',
  },
];

// 2. Main Service Categories Grid
const MAIN_CATEGORIES = [
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
    category: 'Bathroom & Kitchen Cleaning',
    title: 'Deep Stain Removal\nwith Power Jet & Scrub',
    buttonText: 'Book now',
    image: IMAGES.homeBathroom,
    price: '₹399',
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
    category: 'Painting & Waterproofing',
    title: 'Laser Measurement &\nExpert Wall Painters',
    buttonText: 'Book now',
    image: IMAGES.homePainter,
    price: 'Free Quote',
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
    id: 'fan-repair',
    title: 'Ceiling Fan\nRepair & Install',
    image: IMAGES.ceilingFanInstall,
    badge: 'Popular',
    subBadge: null,
    price: '₹149',
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
    id: 'furniture-assembly',
    title: 'Carpentry &\nFurniture Fix',
    image: IMAGES.catRepairs,
    badge: null,
    subBadge: '⚡ 45 mins',
    price: '₹299',
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
    title: 'Deep sofa\ncleaning',
    image: IMAGES.homeSofaClean,
  },
  {
    id: 'curation-2',
    title: 'AC power\njet clean',
    image: IMAGES.acService,
  },
  {
    id: 'curation-3',
    title: 'Full home\npainting',
    image: IMAGES.homePainter,
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

// 10B. Recently Viewed Services (Urban Company Home)
const RECENTLY_VIEWED_SERVICES = [
  {
    id: 'recent-1',
    title: 'AC Foam Jet Deep Service',
    rating: '4.86 (142K)',
    duration: '45 mins',
    price: '₹599',
    oldPrice: '₹799',
    image: IMAGES.heroAc,
    badge: 'Popular',
  },
  {
    id: 'recent-2',
    title: 'Intense Bathroom Cleaning',
    rating: '4.81 (95K)',
    duration: '50 mins',
    price: '₹449',
    oldPrice: '₹599',
    image: IMAGES.homeBathroom,
    badge: 'Bestseller',
  },
  {
    id: 'recent-3',
    title: 'Salon Deluxe Pedicure & Spa',
    rating: '4.92 (68K)',
    duration: '60 mins',
    price: '₹799',
    oldPrice: '₹999',
    image: IMAGES.catWomensSalon,
    badge: 'VIP Choice',
  },
  {
    id: 'recent-4',
    title: 'Water Purifier Filter Service',
    rating: '4.89 (42K)',
    duration: '40 mins',
    price: '₹899',
    oldPrice: '₹1,199',
    image: IMAGES.nativePurifier,
    badge: 'Genuine Parts',
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

// Painting & Waterproofing Services for Homes
const PAINTING_SERVICES = [
  {
    id: 'paint-1',
    title: 'Full home painting consultation',
    image: IMAGES.homePainter,
    rating: '4.89 (120K)',
    duration: '60 MINS',
    price: 'Free Quote',
    btnSubtext: null,
  },
  {
    id: 'paint-2',
    title: 'Waterproofing & damp repair',
    image: IMAGES.homePainter,
    rating: '4.83 (45K)',
    duration: '45 MINS',
    price: 'Starts at ₹499',
    btnSubtext: '3 options',
  },
  {
    id: 'paint-3',
    title: 'Single room wall painting',
    image: IMAGES.decorAbstractFrame,
    rating: '4.91 (88K)',
    duration: '3-4 HOURS',
    price: 'Starts at ₹1,499',
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

// Homes Tab: "What are you looking for?" 4-Tile Grid (Home Services Only)
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
    title: 'Full Home\nCleaning',
    icon: IMAGES.catCleaning,
    badge: null,
  },
];

// Appliance Repair & Service Modal 9 Items (Matches screenshot)
const APPLIANCE_REPAIR_ITEMS = [
  { id: 'ac', name: 'AC', image: require('./assets/images/appliance_ac.jpg'), query: 'AC' },
  { id: 'chimney', name: 'Chimney Repair', image: require('./assets/images/appliance_chimney.jpg'), query: 'Chimney' },
  { id: 'geyser', name: 'Geyser Service & Repair', image: require('./assets/images/appliance_geyser.jpg'), query: 'Geyser' },
  { id: 'laptop', name: 'Laptop Repair', image: require('./assets/images/laptop_dell_xps.jpg'), query: 'Laptop' },
  { id: 'refrigerator', name: 'Refrigerator', image: require('./assets/images/appliance_fridge.jpg'), query: 'Refrigerator' },
  { id: 'washing-machine', name: 'Washing Machine Repair', image: require('./assets/images/appliance_washer.jpg'), query: 'Washing Machine' },
  { id: 'microwave', name: 'Microwave', image: require('./assets/images/appliance_microwave.jpg'), query: 'Microwave' },
  { id: 'television', name: 'Television Repair', image: require('./assets/images/appliance_tv.jpg'), query: 'Television' },
  { id: 'water-purifier', name: 'Water Purifier Service & Installation', image: require('./assets/images/appliance_water_purifier.jpg'), query: 'Water Purifier' },
];

// Electrician, Plumber & Carpenters Items (Matches screenshot)
const EPC_ITEMS = [
  { id: 'electrician', name: 'Electrician', badge: '71 mins', image: require('./assets/images/bulb_install.jpg'), query: 'Electrician' },
  { id: 'plumber', name: 'Plumber', badge: null, image: require('./assets/images/wash_basin.jpg'), query: 'Plumber' },
  { id: 'carpenter', name: 'Carpenter', badge: '76 mins', image: require('./assets/images/door_repair_wood.jpg'), query: 'Carpenter' },
];

// Bathroom & Kitchen Cleaning Options (Matches screenshot)
const BATHROOM_KITCHEN_OPTIONS = [
  {
    id: 'single-bathroom',
    title: 'Single Bathroom Visit',
    subtitle: 'One-time deep cleaning',
    price: 'Starts at ₹419/service',
    image: require('./assets/images/home_bathroom.jpg'),
    query: 'Bathroom Cleaning',
  },
  {
    id: 'kitchen-cleaning',
    title: 'Kitchen cleaning',
    subtitle: 'For one time kitchen deep cleaning needs',
    price: 'Starting at ₹799',
    image: require('./assets/images/kitchen_stove_clean.jpg'),
    query: 'Kitchen Cleaning',
  },
];

// Cleaning Options (Matches screenshot)
const CLEANING_OPTIONS = [
  {
    id: 'full-home',
    name: 'Full Home/ By Room Cleaning',
    image: require('./assets/images/cleaning_bedroom_bucket.jpg'),
    query: 'Full Home Cleaning',
  },
  {
    id: 'cockroach-control',
    name: 'Cockroach Control',
    image: require('./assets/images/cockroach_spray_can.jpg'),
    query: 'Cockroach Control',
  },
];

// Beauty Tab: Web Categories (Complete 6-tile 3x2 Grid - No gaps)
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
    id: 'b-tile-beard-hair',
    title: 'Beard & Hair\nGrooming',
    icon: IMAGES.beautyMenAvatar,
    badge: '30 mins',
    badgeType: 'green',
  },
  {
    id: 'b-tile-facials-cleanup',
    title: 'Facials &\nCleanup',
    icon: IMAGES.beautySkinHydrating,
    badge: '50 mins',
    badgeType: 'purple',
  },
  {
    id: 'b-tile-all',
    title: 'All services',
    isIcon: true,
    badge: null,
  },
];

// Salon Prime Categories matching Left Sidebar ("Select a service") from Web App
const SALON_PRIME_CATEGORIES = [
  { id: 'all', label: 'All Services', icon: '★' },
  { id: 'festive', label: 'Festive ready', image: IMAGES.salonFestive },
  { id: 'super-saver', label: 'Super saver packages', image: IMAGES.salonAquaGelWax, discount: 'Upto 20% OFF' },
  { id: 'waxing', label: 'Waxing & threading', image: IMAGES.spotlightWaxing },
  { id: 'rituals', label: 'Japanese & Korean rituals', image: IMAGES.spotlightGlow, badge: 'New' },
  { id: 'facial', label: 'Signature facial & cleanup', image: IMAGES.beautyKoreanGlowFacial },
  { id: 'pedi-mani', label: 'Pedicure & manicure', image: IMAGES.beautyPedicure },
  { id: 'detan', label: 'Bleach, detan & massages', image: IMAGES.salonBleachPhoto },
  { id: 'hair-care', label: 'Hair Studio & Care', image: IMAGES.hairStudioWomen }
];

// Salon Prime Hero Carousel Slides
const SALON_PRIME_HERO_SLIDES = [
  {
    id: 'slide-brazilian',
    badge: 'Price drop',
    badgeColor: '#15803D',
    title: 'Brazilian stripless wax',
    subtitle: 'Starting at ₹1,299 • Special intimate care',
    bgColor: '#1E293B',
    image: IMAGES.salonBrazilianWax,
    section: 'waxing'
  },
  {
    id: 'slide-matcha',
    badge: 'New launch',
    badgeColor: '#831843',
    title: 'Japanese & Korean Rituals',
    subtitle: 'A deep Matcha detox for your skin',
    bgColor: '#16382C',
    image: IMAGES.matchaDetoxRitual,
    section: 'rituals'
  },
  {
    id: 'slide-aqua',
    badge: 'New launch',
    badgeColor: '#094752',
    title: 'Introducing Aqua gel wax',
    subtitle: 'Aqua gel wax with less heat & less pain',
    bgColor: '#0F2B33',
    image: IMAGES.salonAquaGelWax,
    section: 'waxing'
  },
  {
    id: 'slide-cherry',
    badge: 'Ancient Tradition',
    badgeColor: '#9D174D',
    title: 'Cherry blossom glow ritual',
    subtitle: 'Authentic sakura botanical skin barrier infusion',
    bgColor: '#3A1439',
    image: IMAGES.cherryBlossomRitual,
    section: 'rituals'
  }
];

// Full Sections Catalogue matching Web App
const SALON_PRIME_SECTIONS = [
  {
    id: 'festive',
    title: 'Festive ready',
    services: [
      {
        id: 'essential-mani-pedi',
        title: 'Essential Mani-Pedi Combo',
        rating: 4.81,
        reviewsCount: '26K reviews',
        price: '₹1,399',
        originalPrice: '₹1,699',
        inclusions: [
          'Essential manicure, pedicure combo for effective hand & feet maintenance',
          'Enriched with Kojic acid for brightening & skin restoration'
        ]
      },
      {
        id: 'festive-glow-pkg',
        title: 'Festive glow package',
        rating: 4.87,
        reviewsCount: '42K reviews',
        price: '₹2,499',
        originalPrice: '₹3,199',
        inclusions: [
          'Full arms & legs waxing + O3+ bridal glow facial + classic pedicure',
          'Single-use mono-dose sealed kits for 100% hygienic execution'
        ]
      }
    ]
  },
  {
    id: 'super-saver',
    title: 'Super saver packages',
    services: [
      {
        id: 'make-your-own-pkg',
        title: 'Make your own package',
        rating: 4.89,
        reviewsCount: '150K reviews',
        price: '₹1,599',
        originalPrice: '₹2,299',
        inclusions: [
          'Custom combination of waxing, cleanup & mani-pedi',
          'Save flat 20% compared to standalone services'
        ]
      },
      {
        id: 'wax-and-glow',
        title: 'Wax & glow',
        rating: 4.85,
        reviewsCount: '88K reviews',
        price: '₹1,899',
        originalPrice: '₹2,599',
        inclusions: [
          'Rica roll-on full arms & legs waxing + Sara fruit cleanup',
          'Free eyebrow & upper lip threading included'
        ]
      },
      {
        id: 'monthly-maintenance',
        title: 'Monthly maintenance package',
        rating: 4.88,
        reviewsCount: '92K reviews',
        price: '₹1,299',
        originalPrice: '₹1,799',
        inclusions: [
          'Honey waxing + express cleanup + threading',
          'Regular monthly hygiene maintenance routine'
        ]
      }
    ]
  },
  {
    id: 'waxing',
    title: 'Waxing & threading',
    services: [
      {
        id: 'brazilian-wax',
        title: 'Brazilian stripless bikini waxing',
        rating: 4.88,
        reviewsCount: '62K reviews',
        price: '₹1,299',
        originalPrice: '₹1,699',
        inclusions: [
          'Specialized peel-off stripless wax for intimate sensitive skin',
          'Pre-wax soothing oil and post-wax tea tree calming lotion'
        ]
      },
      {
        id: 'rollon-waxing',
        title: 'Roll-on waxing (Full arms, legs & underarms)',
        rating: 4.86,
        reviewsCount: '284K reviews',
        price: '₹899',
        originalPrice: '₹1,199',
        inclusions: [
          'Mess-free cartridge roll-on waxing with uniform temperature',
          '100% disposable cartridge rollers and sanitised hygiene strips'
        ]
      },
      {
        id: 'full-body-waxing',
        title: 'Full body waxing',
        rating: 4.89,
        reviewsCount: '45K reviews',
        price: '₹2,199',
        originalPrice: '₹2,899',
        inclusions: [
          'Full arms, full legs, underarms, back and stomach waxing',
          'Includes aloe-vera soothing gel finish'
        ]
      },
      {
        id: 'threading-duo',
        title: 'Threading (Eyebrows + Upper lip)',
        rating: 4.82,
        reviewsCount: '120K reviews',
        price: '₹99',
        originalPrice: '₹149',
        inclusions: [
          'Organic anti-bacterial cotton thread with soothing astringent',
          'Precise arch shaping matching facial symmetry'
        ]
      }
    ]
  },
  {
    id: 'rituals',
    title: 'Japanese & Korean rituals',
    services: [
      {
        id: 'matcha-detox',
        title: 'Matcha Deep Detox Facial Ritual',
        rating: 4.92,
        reviewsCount: '18K reviews',
        price: '₹1,799',
        originalPrice: '₹2,399',
        inclusions: [
          'Ceremonial Japanese Uji green tea antioxidant skin infusion',
          'Lymphatic jade-roller drainage massage & pore purifying peel'
        ]
      },
      {
        id: 'cherry-blossom',
        title: 'Cherry Blossom Glow Skin Infusion',
        rating: 4.90,
        reviewsCount: '24K reviews',
        price: '₹1,999',
        originalPrice: '₹2,599',
        inclusions: [
          'Sakura botanical extract with micro-droplet hydration mist',
          'Ultra-hydrating gel mask with icy globe tightening therapy'
        ]
      },
      {
        id: 'korean-glass-skin',
        title: 'Korean Glass Skin Hydration Facial',
        rating: 4.94,
        reviewsCount: '32K reviews',
        price: '₹2,299',
        originalPrice: '₹2,999',
        inclusions: [
          '7-step Korean glass hydration protocol with snail mucin & hyaluronic acid',
          'Deep radiance glow and ceramic-smooth dewy complexion'
        ]
      }
    ]
  },
  {
    id: 'facial',
    title: 'Signature facial & cleanup',
    services: [
      {
        id: 'o3-bridal-glow',
        title: 'O3+ Bridal Glow & Brightening Facial',
        rating: 4.88,
        reviewsCount: '140K reviews',
        price: '₹1,899',
        originalPrice: '₹2,499',
        inclusions: [
          'Original O3+ whitening ampoule and seaweed rubber peel-off mask',
          'Removes stubborn tan and revitalizes dull sun-damaged skin'
        ]
      },
      {
        id: 'dtan-cleanup',
        title: 'D-Tan & Deep Pore Cleanup',
        rating: 4.84,
        reviewsCount: '95K reviews',
        price: '₹799',
        originalPrice: '₹1,099',
        inclusions: [
          'Gentle glycolic lactic exfoliation with blackhead removal',
          'Cooling mint mask and tea tree soothing toner'
        ]
      }
    ]
  },
  {
    id: 'pedi-mani',
    title: 'Pedicure & manicure',
    services: [
      {
        id: 'lavender-mani-pedi',
        title: 'Lavender Relax Manicure & Pedicure Duo',
        rating: 4.87,
        reviewsCount: '75K reviews',
        price: '₹1,499',
        originalPrice: '₹1,999',
        inclusions: [
          'Warm lavender bath soak with Himalayan dead sea salt scrub',
          'Cuticle trimming, heel callus filing and soothing massage cream'
        ]
      },
      {
        id: 'express-pedi',
        title: 'Express Pedicure with Foot Soak',
        rating: 4.81,
        reviewsCount: '50K reviews',
        price: '₹699',
        originalPrice: '₹899',
        inclusions: [
          'Cleansing foot soak, toenail shaping, buffing and moisture lock',
          'Quick 30-minute grooming touchup'
        ]
      }
    ]
  },
  {
    id: 'detan',
    title: 'Bleach, detan & massages',
    services: [
      {
        id: 'bleach-service',
        title: 'Bleach (Gold & Pearl Radiance)',
        rating: 4.84,
        reviewsCount: '103K reviews',
        price: '₹449',
        originalPrice: '₹599',
        inclusions: [
          'Professional gold & pearl bleach for an even-looking complexion',
          'Gentle soothing lotion application'
        ]
      },
      {
        id: 'hair-colour-mehendi',
        title: 'Hair colour/mehendi (only application)',
        rating: 4.83,
        reviewsCount: '280K reviews',
        price: '₹399',
        originalPrice: '₹499',
        inclusions: [
          'Neat sectioned hair colour or organic mehendi application by skilled professionals',
          'Mess-free ear & neck skin protection'
        ]
      },
      {
        id: 'raaga-white-detan',
        title: 'Raaga White Chocolate Detan & Glow',
        rating: 4.83,
        reviewsCount: '195K reviews',
        price: '₹649',
        originalPrice: '₹849',
        inclusions: [
          'Milk enzyme kojic formula for instant sun damage reversal',
          'Zero peroxide formula, completely burn-free and gentle on skin',
          'Deep nourishing cocoa butter application'
        ]
      }
    ]
  },
  {
    id: 'hair-care',
    title: 'Hair Studio & Care',
    services: [
      {
        id: 'hair-studio-cut-blowdry',
        title: 'Hair Studio Haircut, Layered Trim & Blowdry',
        rating: 4.86,
        reviewsCount: '48K reviews',
        price: '₹599',
        originalPrice: '₹899',
        inclusions: [
          'Face shape consultation & precision sectioned haircut',
          'Split-end removal & heat-protectant blowdry styling'
        ]
      },
      {
        id: 'loreal-hair-care',
        title: 'L’Oréal Deep Nourishing Hair Conditioning Treatment',
        rating: 4.84,
        reviewsCount: '62K reviews',
        price: '₹999',
        originalPrice: '₹1,499',
        inclusions: [
          'Scalp analysis, L’Oréal Creambath infusion & ampoule',
          '20-min rhythmic scalp therapy & micro-mist steaming'
        ]
      },
      {
        id: 'root-touchup-hair',
        title: 'Root Touch-up & Grey Coverage',
        rating: 4.83,
        reviewsCount: '45K reviews',
        price: '₹799',
        originalPrice: '₹1,099',
        inclusions: [
          'Ammonia-free branded matrix / L’Oréal hair colour',
          'Even root coverage without scalp staining'
        ]
      }
    ]
  }
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
    image: resolveServiceImage((!isCategoryIcon(item?.image) && item?.image) ? item : (matched || item)),
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showProfileMenuModal, setShowProfileMenuModal] = useState(false);

  const handleLoginSuccess = (userProfile) => {
    setIsAuthenticated(true);
    setCurrentUser(userProfile);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [showAllServicesModal, setShowAllServicesModal] = useState(false);
  const [activeTab, setActiveTab] = useState('homes');
  const [bookingFilter, setBookingFilter] = useState('all');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('all');
  const [cartCount, setCartCount] = useState(0);

  // Live Tracking & Reviews State (syncs customer and partner views)
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [partnerReviews, setPartnerReviews] = useState([]);
  const [activeCustomerBooking, setActiveCustomerBooking] = useState({
    id: '9410',
    service: 'All in All AC',
    price: 3524,
    otp: '4829',
    stage: 2, // Specialist Assigned
    address: 'Flat 302, Green Park, Rayakottai Road, Krishnagiri - 635122',
    customer: 'Rahul Sharma',
    phone: '+91 98200 12345',
    slot: 'Today, 04:00 PM - 05:00 PM',
    technician: {
      name: 'Vikram Salvi',
      rating: 4.94,
      phone: '+91 98765 43210',
      vehicle: 'MH-02-CB-4912'
    }
  });

  // Partner Hot Leads Queue (live synchronized between customer bookings and worker portal)
  const [partnerLeads, setPartnerLeads] = useState([
    {
      id: 'LEAD-9410',
      bookingId: '9410',
      service: 'All in All AC',
      payout: 3524,
      customer: 'Rahul Sharma',
      address: 'Flat 302, Green Park, Rayakottai Road, Krishnagiri - 635122',
      distance: '0.5 km away',
      slot: 'Today, 04:00 PM - 05:00 PM',
      phone: '+91 98200 12345',
      tag: '🔥 NEW LIVE BOOKING (JUST NOW)'
    },
    {
      id: 'LEAD-104',
      service: 'AC Gas Leak Repair & Refill',
      customer: 'Pooja Deshmukh',
      address: 'Perry Cross Rd, Bandra West, Mumbai',
      distance: '0.8 km away',
      payout: 1250,
      slot: 'Today, 02:00 PM',
      phone: '+91 98330 99881',
      tag: '⚡ HOT LEAD (15 MINS)'
    },
    {
      id: 'LEAD-105',
      service: 'Microwave Heating Coil & Magnetron Fix',
      customer: 'Amitabh Sen',
      address: 'Turner Road, Bandra West, Mumbai',
      distance: '1.4 km away',
      payout: 650,
      slot: 'Today, 04:30 PM',
      phone: '+91 98210 44321',
      tag: '⚡ POPULAR'
    }
  ]);

  // Slot, Address & Payment Flow State
  const [showCheckoutFlow, setShowCheckoutFlow] = useState(false);
  const [checkoutService, setCheckoutService] = useState(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setCurrentScreen('home');
  };
  const [coinsBalance, setCoinsBalance] = useState(350);
  const [scratchedCardId, setScratchedCardId] = useState(null);
  const [dbServices, setDbServices] = useState(WEB_APP_SERVICES || []);

  // Modals for categories
  const [showApplianceModal, setShowApplianceModal] = useState(false);
  const [showEPCModal, setShowEPCModal] = useState(false);
  const [showBathroomKitchenModal, setShowBathroomKitchenModal] = useState(false);
  const [showCleaningModal, setShowCleaningModal] = useState(false);
  const [showHairStudioModal, setShowHairStudioModal] = useState(false);
  const [showSalonMenModal, setShowSalonMenModal] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home' | 'native-purifier' | 'native-locks' | 'salon-prime' | 'category-detail'
  const [salonCategoryTab, setSalonCategoryTab] = useState('all');
  const [salonSlideIndex, setSalonSlideIndex] = useState(0);
  const [salonSearch, setSalonSearch] = useState('');

  // Category Detail View state
  const [selectedCategoryView, setSelectedCategoryView] = useState('all');
  const [selectedSubcategoryFilter, setSelectedSubcategoryFilter] = useState('all');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  const fetchLiveServices = () => {
    mobileApi
      .getServices()
      .then((res) => {
        if (res && res.success && Array.isArray(res.services) && res.services.length > 0) {
          setDbServices(res.services);
        }
      })
      .catch(() => {});
  };

  const openCategoryScreen = (categoryId, subcategoryName = 'all') => {
    fetchLiveServices();
    setShowAllServicesModal(false);
    setShowApplianceModal(false);
    setShowEPCModal(false);
    setShowBathroomKitchenModal(false);
    setShowCleaningModal(false);
    setShowHairStudioModal(false);
    setShowSalonMenModal(false);

    if (categoryId === 'womens-salon' || categoryId === 'salon' || categoryId === 'beauty') {
      setSalonCategoryTab(subcategoryName === 'all' ? 'all' : subcategoryName);
      setSalonSearch('');
      setCurrentScreen('salon-prime');
    } else if (categoryId === 'native-purifier' || categoryId === 'water-purifier') {
      setCurrentScreen('native-purifier');
    } else if (categoryId === 'native-locks' || categoryId === 'smart-locks') {
      setCurrentScreen('native-locks');
    } else {
      setSelectedCategoryView(categoryId);
      setSelectedSubcategoryFilter(subcategoryName || 'all');
      setCategorySearchQuery('');
      setCurrentScreen('category-detail');
    }
  };

  // Auto connect to backend and sync all live web app products & bookings in real-time
  const syncActiveBooking = async () => {
    try {
      const res = await mobileApi.getBookings();
      if (res && res.success && Array.isArray(res.bookings) && res.bookings.length > 0) {
        const latest = res.bookings[0];
        if (latest) {
          const stageMap = { 'Pending': 1, 'Confirmed': 1, 'Assigned': 2, 'En Route': 3, 'Arrived': 4, 'In Progress': 5, 'Completed': 6 };
          const stageFromStatus = (status) => {
            if (!status) return null;
            const s = String(status).toLowerCase();
            if (s.includes('completed')) return 6;
            if (s.includes('progress')) return 5;
            if (s.includes('arrived')) return 4;
            if (s.includes('route') || s.includes('way')) return 3;
            if (s.includes('assigned')) return 2;
            if (s.includes('confirm') || s.includes('placed')) return 1;
            return null;
          };
          const resolvedStage = (typeof latest.stage === 'number' && latest.stage >= 1 && latest.stage <= 6)
            ? latest.stage
            : (stageFromStatus(latest.status) || stageMap[latest.status] || 2);

          setActiveCustomerBooking((prev) => ({
            ...prev,
            id: (latest.id || latest.bookingReference || prev.id || '9410').replace(/^[#\s]+/, '').replace(/^(UC|JOB)-/, ''),
            service: latest.serviceName || latest.service || prev.service,
            price: latest.totalAmount || latest.price || prev.price,
            customer: latest.customerName || latest.userName || prev.customer,
            address: latest.address || prev.address,
            phone: latest.userPhone || prev.phone,
            otp: latest.safetyPin || prev.otp || '4829',
            status: latest.status || prev.status,
            stage: resolvedStage,
            prePhoto: latest.beforeWorkPhoto || prev.prePhoto,
            postPhoto: latest.afterWorkPhoto || prev.postPhoto
          }));
        }
      }
    } catch (_) {}
  };

  useEffect(() => {
    mobileApi.checkHealth().catch(() => {});
    fetchLiveServices();
    syncActiveBooking();
    const interval = setInterval(() => {
      fetchLiveServices();
      syncActiveBooking();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAddService = (item) => {
    const fullDetails = findFullProductDetails(item, dbServices);
    setSelectedService(fullDetails);
  };

  const handleConfirmBooking = () => {
    if (selectedService) {
      setCheckoutService(selectedService);
      setSelectedService(null);
      setShowCheckoutFlow(true);
    }
  };

  // 0. SEARCH RESULTS VIEW (Searching across all Web App Products & Live DB Services)
  const renderSearchResultsView = () => {
    // Deduplicate between live dbServices and fallback WEB_APP_SERVICES by unique ID / title
    const seenIds = new Set();
    const allServices = [];
    [...(dbServices || []), ...(WEB_APP_SERVICES || [])].forEach((s) => {
      const key = (s.id || s._id || s.title || '').trim().toLowerCase();
      if (key && !seenIds.has(key)) {
        seenIds.add(key);
        allServices.push(s);
      } else if (!key) {
        allServices.push(s);
      }
    });

    const q = searchQuery.toLowerCase().trim();

    // Word boundary regex for short acronyms like 'ac', 'ro', 'tv', etc.
    const isShortQuery = q.length <= 3;
    const wordRegex = isShortQuery ? new RegExp(`(^|[^a-z0-9])${q}([^a-z0-9]|$)`, 'i') : null;

    const results = allServices.filter((s) => {
      const title = (s.title || s.name || '').toLowerCase();
      const cat = (s.category || s.categoryName || '').toLowerCase();
      const sub = (s.subcategory || '').toLowerCase();
      const desc = (s.description || '').toLowerCase();

      if (isShortQuery) {
        if (q === 'ac') {
          return (
            wordRegex.test(title) ||
            title.includes('air condition') ||
            cat === 'ac-appliances' ||
            sub.toLowerCase().includes('ac') ||
            wordRegex.test(desc)
          );
        }
        if (q === 'ro') {
          return (
            wordRegex.test(title) ||
            title.includes('purifier') ||
            title.includes('water') ||
            cat.includes('purifier')
          );
        }
        if (q === 'tv') {
          return (
            wordRegex.test(title) ||
            title.includes('television') ||
            wordRegex.test(desc)
          );
        }
        return wordRegex.test(title) || wordRegex.test(cat) || wordRegex.test(sub);
      }

      return (
        title.includes(q) ||
        cat.includes(q) ||
        sub.includes(q) ||
        desc.includes(q)
      );
    });

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
              key={`search-card-${item.id || item._id || 'srv'}-${idx}`}
              style={styles.searchResultCard}
              activeOpacity={0.85}
              onPress={() => handleAddService(item)}
            >
              <View style={styles.searchResultMedia}>
                <SafeImage
                  source={resolveServiceImage(item)}
                  item={item}
                  style={styles.searchResultImg}
                  resizeMode="cover"
                />
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
    </ScrollView>
  );

  // 1B. CATEGORIES SCREEN VIEW (Urban Company Image-Based Grid & Categories)
  const renderCategoriesView = () => {
    const categoryFilters = [
      { id: 'all', label: 'All Services' },
      { id: 'ac', label: 'AC & Appliances' },
      { id: 'cleaning', label: 'Cleaning & Pest' },
      { id: 'salon', label: "Women's Salon" },
      { id: 'men', label: "Men's Salon" },
      { id: 'electrician', label: 'Electrician & Plumber' },
      { id: 'painting', label: 'Painting' },
    ];

    const categoryCards = [
      {
        id: 'cat-card-1',
        category: 'ac',
        title: 'AC Service & Repair',
        subtitle: 'Power jet, gas refill, installation',
        price: 'Starts at ₹499',
        rating: '4.86 ★ (1.2M)',
        badge: 'High Demand',
        image: IMAGES.heroAc,
        onClick: () => openCategoryScreen('ac-appliances', 'AC Service & Repair'),
      },
      {
        id: 'cat-card-2',
        category: 'cleaning',
        title: 'Bathroom & Kitchen Cleaning',
        subtitle: 'Deep stain removal & disinfection',
        price: 'Starts at ₹399',
        rating: '4.82 ★ (850K)',
        badge: '55 mins',
        image: IMAGES.homeBathroom,
        onClick: () => openCategoryScreen('cleaning-pest', 'Bathroom Cleaning'),
      },
      {
        id: 'cat-card-3',
        category: 'salon',
        title: "Women's Salon & Spa",
        subtitle: 'Waxing, facials, mani-pedi at home',
        price: 'Starts at ₹149',
        rating: '4.91 ★ (2.1M)',
        badge: 'Top Rated',
        image: IMAGES.catWomensSalon,
        onClick: () => {
          setSalonCategoryTab('all');
          setCurrentScreen('salon-prime');
        },
      },
      {
        id: 'cat-card-4',
        category: 'men',
        title: "Men's Haircut & Grooming",
        subtitle: 'Haircut, beard styling, head massage',
        price: 'Starts at ₹199',
        rating: '4.88 ★ (720K)',
        badge: '30 mins',
        image: IMAGES.catMensSalon,
        onClick: () => openCategoryScreen('mens-salon', 'all'),
      },
      {
        id: 'cat-card-5',
        category: 'cleaning',
        title: 'Sofa & Carpet Cleaning',
        subtitle: 'Multi-stage deep extraction shampooing',
        price: 'Starts at ₹599',
        rating: '4.85 ★ (410K)',
        badge: 'Trending',
        image: IMAGES.homeSofaClean,
        onClick: () => openCategoryScreen('cleaning-pest', 'Sofa & Carpet'),
      },
      {
        id: 'cat-card-6',
        category: 'electrician',
        title: 'Electrician Services',
        subtitle: 'Switchboards, fans, MCB, wiring repair',
        price: 'Starts at ₹99',
        rating: '4.84 ★ (980K)',
        badge: '60 mins',
        image: IMAGES.ceilingFanInstall,
        onClick: () => openCategoryScreen('quick-repairs', 'Electrician'),
      },
      {
        id: 'cat-card-7',
        category: 'painting',
        title: 'Home Painting & Waterproofing',
        subtitle: 'Laser measurement, free shade consult',
        price: 'Free inspection',
        rating: '4.89 ★ (150K)',
        badge: 'Warranty',
        image: IMAGES.homePainter,
        onClick: () => openCategoryScreen('painting-decor', 'all'),
      },
      {
        id: 'cat-card-8',
        category: 'ac',
        title: 'Washing Machine & Chimney',
        subtitle: 'Comprehensive diagnosis & repair',
        price: 'Starts at ₹299',
        rating: '4.80 ★ (310K)',
        badge: 'Same Day',
        image: IMAGES.applianceChimney,
        onClick: () => openCategoryScreen('ac-appliances', 'Washing Machine'),
      },
    ];

    const filteredCards = selectedCategoryTab === 'all'
      ? categoryCards
      : categoryCards.filter(c => c.category === selectedCategoryTab);

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Header */}
        <View style={styles.categoriesHeroHeader}>
          <Text style={styles.categoriesHeroTitle}>Service Categories</Text>
          <Text style={styles.categoriesHeroSub}>
            Book vetted background-verified professionals for your home & beauty needs
          </Text>
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryFilterRow}
        >
          {categoryFilters.map((tab) => {
            const isActive = selectedCategoryTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.categoryFilterPill, isActive && styles.categoryFilterPillActive]}
                onPress={() => setSelectedCategoryTab(tab.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.categoryFilterText, isActive && styles.categoryFilterTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 2-Column Image Card Grid */}
        <View style={styles.categoryCardsGrid}>
          {filteredCards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={styles.categoryImageCard}
              activeOpacity={0.88}
              onPress={card.onClick}
            >
              <View style={styles.categoryCardImgBox}>
                <SafeImage source={card.image} style={styles.categoryCardImg} resizeMode="cover" />
                {card.badge && (
                  <View style={styles.categoryCardBadge}>
                    <Text style={styles.categoryCardBadgeText}>{card.badge}</Text>
                  </View>
                )}
              </View>
              <View style={styles.categoryCardContent}>
                <Text style={styles.categoryCardRating}>{card.rating}</Text>
                <Text style={styles.categoryCardTitle} numberOfLines={2}>{card.title}</Text>
                <Text style={styles.categoryCardSubtitle} numberOfLines={1}>{card.subtitle}</Text>
                <View style={styles.categoryCardPriceRow}>
                  <Text style={styles.categoryCardPrice}>{card.price}</Text>
                  <View style={styles.categoryCardArrowBtn}>
                    <Text style={styles.categoryCardArrowText}>→</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* View Full 150+ Services Catalog Card */}
        <TouchableOpacity
          style={styles.fullCatalogCard}
          activeOpacity={0.9}
          onPress={() => setShowAllServicesModal(true)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.fullCatalogSuper}>CAN'T FIND WHAT YOU'RE LOOKING FOR?</Text>
            <Text style={styles.fullCatalogTitle}>Explore Complete 150+ Services Catalog</Text>
            <Text style={styles.fullCatalogSub}>From emergency water motor repairs to luxury facials</Text>
          </View>
          <View style={styles.fullCatalogBtn}>
            <Text style={styles.fullCatalogBtnText}>View All</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  // 1C. MY BOOKINGS SCREEN VIEW (Urban Company Step-by-Step Experience & Tracking)
  const renderMyBookingsView = () => {
    const filterTabs = [
      { id: 'all', label: 'All' },
      { id: 'ongoing', label: 'Ongoing (1)' },
      { id: 'upcoming', label: 'Upcoming' },
      { id: 'completed', label: 'Completed (2)' },
      { id: 'cancelled', label: 'Cancelled (1)' },
    ];

    const showOngoing = bookingFilter === 'all' || bookingFilter === 'ongoing';
    const showUpcoming = bookingFilter === 'all' || bookingFilter === 'upcoming';
    const showCompleted = bookingFilter === 'all' || bookingFilter === 'completed';
    const showCancelled = bookingFilter === 'all' || bookingFilter === 'cancelled';

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.bookingsHeaderBox}>
          <Text style={styles.bookingsHeaderTitle}>My Bookings</Text>
          <Text style={styles.bookingsHeaderSub}>Track live dispatches, view invoices and manage orders</Text>
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bookingFilterScroll}
        >
          {filterTabs.map((tab) => {
            const isActive = bookingFilter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.bookingFilterChip, isActive && styles.bookingFilterChipActive]}
                onPress={() => setBookingFilter(tab.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.bookingFilterText, isActive && styles.bookingFilterTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 1. ONGOING BOOKING CARD (JOB #9410 - VIKRAM SALVI) */}
        {showOngoing && (
          <View style={styles.bookingCardOngoing}>
            {/* Live Indicator Header */}
            <View style={styles.ongoingCardHeader}>
              <View style={[
                styles.liveStatusPill,
                activeCustomerBooking?.stage === 6 ? { backgroundColor: '#ECFDF5' } :
                activeCustomerBooking?.stage === 5 ? { backgroundColor: '#FEF3C7' } :
                activeCustomerBooking?.stage === 4 ? { backgroundColor: '#EFF6FF' } :
                { backgroundColor: '#FFF7ED' }
              ]}>
                <View style={[
                  styles.liveGreenPulse,
                  activeCustomerBooking?.stage === 6 ? { backgroundColor: '#10B981' } :
                  activeCustomerBooking?.stage === 5 ? { backgroundColor: '#F59E0B' } :
                  activeCustomerBooking?.stage === 4 ? { backgroundColor: '#3B82F6' } :
                  { backgroundColor: '#F04400' }
                ]} />
                <Text style={[
                  styles.liveStatusText,
                  activeCustomerBooking?.stage === 6 ? { color: '#047857' } :
                  activeCustomerBooking?.stage === 5 ? { color: '#B45309' } :
                  activeCustomerBooking?.stage === 4 ? { color: '#1D4ED8' } :
                  { color: '#C2410C' }
                ]}>
                  {activeCustomerBooking?.stage === 6 ? 'SERVICE COMPLETED 🎉' :
                   activeCustomerBooking?.stage === 5 ? 'SERVICE IN PROGRESS ⚡' :
                   activeCustomerBooking?.stage === 4 ? 'SPECIALIST ARRIVED 📍' :
                   activeCustomerBooking?.stage === 3 ? 'SPECIALIST EN ROUTE 🛵' :
                   'SPECIALIST ASSIGNED 👷'}
                </Text>
              </View>
              <Text style={styles.bookingIdText}>#UC-{activeCustomerBooking?.id || '9410'}</Text>
            </View>

            {/* Service & Price */}
            <View style={styles.ongoingServiceRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.ongoingServiceTitle}>{activeCustomerBooking.service || 'All in All AC'}</Text>
                <Text style={styles.ongoingSlotText}>📅 {activeCustomerBooking.slot || 'Today, 04:00 PM - 05:00 PM'}</Text>
                <Text style={styles.ongoingAddressText} numberOfLines={1}>📍 {activeCustomerBooking.address}</Text>
              </View>
              <Text style={styles.ongoingPriceText}>₹{activeCustomerBooking.price || '3,524'}</Text>
            </View>

            {/* Assigned Specialist Details Box */}
            <View style={styles.ongoingSpecialistBox}>
              <View style={styles.specialistAvatarCircle}>
                <Text style={styles.specialistAvatarText}>V</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.specialistName}>{activeCustomerBooking.technician?.name || 'Vikram Salvi'}</Text>
                  <View style={styles.specialistRatingPill}>
                    <Text style={styles.specialistRatingText}>★ {activeCustomerBooking.technician?.rating || 4.94}</Text>
                  </View>
                </View>
                <Text style={styles.specialistSub}>Master AC Specialist & Electrician • Diamond Pro L5</Text>
              </View>
              <TouchableOpacity
                style={styles.specialistCallBtn}
                onPress={() => Alert.alert('Call Specialist', `Calling Vikram Salvi at ${activeCustomerBooking.technician?.phone || '+91 98765 43210'}...`)}
              >
                <Text style={styles.specialistCallIcon}>📞</Text>
              </TouchableOpacity>
            </View>

            {/* Start Service OTP Box */}
            <View style={styles.otpNoticeBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.otpNoticeLabel}>Start Service Verification Code</Text>
                <Text style={styles.otpNoticeSub}>Share this 4-digit OTP with specialist upon arrival</Text>
              </View>
              <View style={styles.otpDisplayBox}>
                <Text style={styles.otpDisplayText}>{activeCustomerBooking.otp || '4829'}</Text>
              </View>
            </View>

            {/* Primary Action: LIVE GPS TRACK */}
            <TouchableOpacity
              style={styles.liveTrackCTAButton}
              activeOpacity={0.88}
              onPress={() => setShowTrackingModal(true)}
            >
              <Text style={styles.liveTrackCTAIcon}>🛵</Text>
              <Text style={styles.liveTrackCTAText}>Live GPS Track Specialist (ETA ~8 mins)</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 2. UPCOMING STATE (Empty placeholder or informational card) */}
        {showUpcoming && bookingFilter === 'upcoming' && (
          <View style={styles.emptyBookingsBox}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>🗓️</Text>
            <Text style={styles.emptyBookingsTitle}>No other upcoming bookings</Text>
            <Text style={styles.emptyBookingsSub}>All your upcoming scheduled appointments will appear here.</Text>
            <TouchableOpacity
              style={styles.bookNewServiceBtn}
              onPress={() => handleTabChange('categories')}
            >
              <Text style={styles.bookNewServiceBtnText}>Book a Service</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 3. COMPLETED BOOKING CARDS */}
        {showCompleted && (
          <>
            <View style={styles.bookingCardCompleted}>
              <View style={styles.completedHeaderRow}>
                <View style={styles.completedBadgePill}>
                  <Text style={styles.completedBadgeText}>✓ COMPLETED</Text>
                </View>
                <Text style={styles.bookingDateText}>02 Nov 2026, 11:30 AM</Text>
              </View>

              <View style={styles.completedBodyRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.completedServiceTitle}>Deep Kitchen & Chimney Cleaning</Text>
                  <Text style={styles.completedSpecialistText}>Served by Suresh Kumar (★ 4.91)</Text>
                  <View style={styles.starRow}>
                    <Text style={styles.starGold}>★★★★★</Text>
                    <Text style={styles.ratedText}>Rated 5.0 by you</Text>
                  </View>
                </View>
                <Text style={styles.completedPriceText}>₹1,299</Text>
              </View>

              <View style={styles.completedActionsRow}>
                <TouchableOpacity
                  style={styles.repeatBookingBtn}
                  onPress={() => handleAddService({ id: 'clean-kitchen', title: 'Deep Kitchen & Chimney Cleaning', price: 1299, rating: 4.91 })}
                >
                  <Text style={styles.repeatBookingText}>Book Again</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.invoiceBtn}
                  onPress={() => Alert.alert('Tax Invoice', 'Invoice for #UC-8842 (₹1,299) has been sent to customer@forgeindia.in')}
                >
                  <Text style={styles.invoiceBtnText}>📄 Invoice</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.bookingCardCompleted}>
              <View style={styles.completedHeaderRow}>
                <View style={styles.completedBadgePill}>
                  <Text style={styles.completedBadgeText}>✓ COMPLETED</Text>
                </View>
                <Text style={styles.bookingDateText}>18 Oct 2026, 03:00 PM</Text>
              </View>

              <View style={styles.completedBodyRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.completedServiceTitle}>Salon Classic Pedicure & Hair Spa</Text>
                  <Text style={styles.completedSpecialistText}>Served by Priya Sharma (★ 4.96)</Text>
                  <View style={styles.starRow}>
                    <Text style={styles.starGold}>★★★★★</Text>
                    <Text style={styles.ratedText}>Rated 5.0 by you</Text>
                  </View>
                </View>
                <Text style={styles.completedPriceText}>₹1,599</Text>
              </View>

              <View style={styles.completedActionsRow}>
                <TouchableOpacity
                  style={styles.repeatBookingBtn}
                  onPress={() => handleAddService({ id: 'salon-pedi', title: 'Salon Classic Pedicure & Hair Spa', price: 1599, rating: 4.96 })}
                >
                  <Text style={styles.repeatBookingText}>Book Again</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.invoiceBtn}
                  onPress={() => Alert.alert('Tax Invoice', 'Invoice for #UC-7921 (₹1,599) has been sent to customer@forgeindia.in')}
                >
                  <Text style={styles.invoiceBtnText}>📄 Invoice</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* 4. CANCELLED BOOKING CARD */}
        {showCancelled && (
          <View style={styles.bookingCardCancelled}>
            <View style={styles.cancelledHeaderRow}>
              <View style={styles.cancelledBadgePill}>
                <Text style={styles.cancelledBadgeText}>✕ CANCELLED</Text>
              </View>
              <Text style={styles.bookingDateText}>04 Sep 2026</Text>
            </View>

            <View style={styles.cancelledBodyRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cancelledServiceTitle}>Bathroom Anti-Bacterial Cleaning</Text>
                <Text style={styles.refundText}>✓ Full refund of ₹499 processed to HDFC UPI (Ref #TXN-902148)</Text>
              </View>
              <Text style={styles.cancelledPriceText}>₹499</Text>
            </View>

            <TouchableOpacity
              style={styles.rebookCancelledBtn}
              onPress={() => handleAddService({ id: 'clean-bath', title: 'Bathroom Anti-Bacterial Cleaning', price: 499, rating: 4.81 })}
            >
              <Text style={styles.rebookCancelledText}>Book Service Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    );
  };

  // 1D. PROFILE SCREEN VIEW (Urban Company Profile, Saved Addresses & Account Hub)
  const renderProfileView = () => {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Hero Card */}
        <View style={styles.profileHeroCard}>
          <View style={styles.profileAvatarLarge}>
            <Text style={styles.profileAvatarLargeText}>
              {(currentUser?.name || 'Rahul').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <Text style={styles.profileUserName}>{currentUser?.name || 'Rahul Sharma'}</Text>
              <View style={styles.profilePlusBadge}>
                <Text style={styles.profilePlusBadgeText}>👑 UC PLUS</Text>
              </View>
            </View>
            <Text style={styles.profileUserEmail}>{currentUser?.email || 'customer@forgeindia.in'}</Text>
            <Text style={styles.profileUserPhone}>{currentUser?.phone || '+91 98200 12345'}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileEditBtn}
            onPress={() => Alert.alert('Edit Profile', 'Profile editing options.')}
          >
            <Text style={styles.profileEditBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats Metrics Row */}
        <View style={styles.profileStatsRow}>
          <TouchableOpacity
            style={styles.profileStatItem}
            activeOpacity={0.8}
            onPress={() => handleTabChange('bookings')}
          >
            <Text style={styles.profileStatNumber}>4</Text>
            <Text style={styles.profileStatLabel}>Total Bookings</Text>
          </TouchableOpacity>
          <View style={styles.profileStatDivider} />
          <TouchableOpacity
            style={styles.profileStatItem}
            activeOpacity={0.8}
            onPress={() => handleTabChange('offers')}
          >
            <Text style={styles.profileStatNumber}>🪙 {coinsBalance}</Text>
            <Text style={styles.profileStatLabel}>UC Coins</Text>
          </TouchableOpacity>
          <View style={styles.profileStatDivider} />
          <TouchableOpacity
            style={styles.profileStatItem}
            activeOpacity={0.8}
            onPress={() => Alert.alert('Saved Addresses', '1. Flat 302, Green Park, Rayakottai Rd (Home)\n2. Brigade Tech Gardens, Bangalore (Work)')}
          >
            <Text style={styles.profileStatNumber}>2</Text>
            <Text style={styles.profileStatLabel}>Addresses</Text>
          </TouchableOpacity>
        </View>

        {/* UC Plus Banner */}
        <View style={styles.profilePlusBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.profilePlusBannerSuper}>URBAN COMPANY PLUS VIP</Text>
            <Text style={styles.profilePlusBannerTitle}>Active VIP Membership</Text>
            <Text style={styles.profilePlusBannerSub}>Saving 15% extra on every booking • Renews Dec 2026</Text>
          </View>
          <Text style={{ fontSize: 28 }}>👑</Text>
        </View>

        {/* Account Menu Items List */}
        <View style={styles.profileMenuGroup}>
          <Text style={styles.profileMenuSectionTitle}>Account & Orders</Text>

          <TouchableOpacity
            style={styles.profileMenuItem}
            onPress={() => handleTabChange('bookings')}
          >
            <View style={styles.profileMenuIconBox}>
              <Text style={styles.profileMenuIcon}>📋</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileMenuTitle}>My Bookings</Text>
              <Text style={styles.profileMenuSub}>Track active bookings, rate services & see history</Text>
            </View>
            <Text style={styles.profileMenuChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileMenuItem}
            onPress={() => Alert.alert('Saved Addresses', '1. Home: Flat 302, Green Park, Rayakottai Rd, Krishnagiri\n2. Work: Brigade Tech Gardens, Outer Ring Rd, Bangalore')}
          >
            <View style={styles.profileMenuIconBox}>
              <Text style={styles.profileMenuIcon}>📍</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileMenuTitle}>Saved Addresses</Text>
              <Text style={styles.profileMenuSub}>Manage home, office and other delivery locations</Text>
            </View>
            <Text style={styles.profileMenuChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileMenuItem}
            onPress={() => Alert.alert('Payment Methods', '• Saved Cards: HDFC Regalia Visa ending in 4112\n• UPI: 9820012345@okhdfcbank (Default)\n• UC Wallet Balance: ₹350')}
          >
            <View style={styles.profileMenuIconBox}>
              <Text style={styles.profileMenuIcon}>💳</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileMenuTitle}>Payment Methods & Wallet</Text>
              <Text style={styles.profileMenuSub}>Saved UPI, credit/debit cards & refunds</Text>
            </View>
            <Text style={styles.profileMenuChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileMenuItem}
            onPress={() => handleTabChange('offers')}
          >
            <View style={styles.profileMenuIconBox}>
              <Text style={styles.profileMenuIcon}>🪙</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileMenuTitle}>Rewards & Scratch Cards</Text>
              <Text style={styles.profileMenuSub}>350 Coins available • 2 mystery cards to scratch</Text>
            </View>
            <Text style={styles.profileMenuChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Safety & Help Section */}
        <View style={styles.profileMenuGroup}>
          <Text style={styles.profileMenuSectionTitle}>Safety & Support</Text>

          <TouchableOpacity
            style={styles.profileMenuItem}
            onPress={() => Alert.alert('UC Insurance & Protection', 'Every service booking comes with standard ₹10,000 damage protection guarantee.')}
          >
            <View style={styles.profileMenuIconBox}>
              <Text style={styles.profileMenuIcon}>🛡️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileMenuTitle}>UC Safety & Insurance Guarantee</Text>
              <Text style={styles.profileMenuSub}>100% background checked & ₹10,000 cover</Text>
            </View>
            <Text style={styles.profileMenuChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileMenuItem}
            onPress={() => Alert.alert('24x7 Help Center', 'Customer Support Hotline: 1800-123-4567\nWhatsApp Support: +91 91234 56789\nAverage wait time: < 1 min')}
          >
            <View style={styles.profileMenuIconBox}>
              <Text style={styles.profileMenuIcon}>💬</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileMenuTitle}>Help & Support</Text>
              <Text style={styles.profileMenuSub}>FAQs, 24x7 instant chat and ticket history</Text>
            </View>
            <Text style={styles.profileMenuChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Working Partner Mode Switcher Button */}
        <TouchableOpacity
          style={styles.switchPartnerModeBtn}
          activeOpacity={0.88}
          onPress={() => {
            setCurrentUser((prev) => ({
              ...(prev || {}),
              role: 'partner',
              name: prev?.name && prev?.name !== 'Customer' && prev?.name !== 'Rahul Sharma' ? prev.name : 'Vikram Salvi',
              email: prev?.email || 'partner@forgeindia.in',
              trade: 'Master AC Specialist & Electrician'
            }));
          }}
        >
          <Text style={styles.switchPartnerModeIcon}>👷</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchPartnerModeTitle}>Switch to Working Partner Portal</Text>
            <Text style={styles.switchPartnerModeSub}>View assigned jobs, hot leads queue & dispatch tracker</Text>
          </View>
          <Text style={styles.switchPartnerModeArrow}>→</Text>
        </TouchableOpacity>

        {/* Log Out */}
        <TouchableOpacity
          style={styles.profileLogoutBtn}
          activeOpacity={0.8}
          onPress={() => {
            Alert.alert('Log Out', 'Are you sure you want to log out?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Log Out', style: 'destructive', onPress: handleLogout }
            ]);
          }}
        >
          <Text style={styles.profileLogoutBtnText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.profileAppVersionText}>Urban Company Mobile v4.18.2 • Chennai</Text>
      </ScrollView>
    );
  };

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
                  if (cat.id === 'b-tile-salon-prime' || cat.id === 'b-tile-facials-cleanup' || cat.title.includes('Salon Prime') || cat.title.includes('Facial')) {
                    setSalonCategoryTab('all');
                    setSalonSearch('');
                    setCurrentScreen('salon-prime');
                  } else if (cat.id === 'b-tile-hair-studio' || cat.title.includes('Hair Studio')) {
                    setSalonCategoryTab('hair-care');
                    setSalonSearch('');
                    setCurrentScreen('salon-prime');
                  } else if (cat.id === 'b-tile-salon-men' || cat.id === 'b-tile-beard-hair' || cat.title.includes('Men') || cat.title.includes('Beard')) {
                    openCategoryScreen('mens-salon', cat.title.includes('Beard') ? 'Hair & Beard' : 'all');
                  } else if (cat.isIcon) {
                    setShowAllServicesModal(true);
                  } else {
                    openCategoryScreen('womens-salon', 'all');
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

        {/* 4-Photo Mosaic Collage (Matches Screenshot 1) */}
        <View style={styles.beautyMosaicGrid2x2}>
          <View style={styles.beautyMosaicRow}>
            <View style={styles.beautyMosaicCard}>
              <SafeImage source={IMAGES.beautyArmTreatment} style={styles.beautyMosaicImg} />
            </View>
            <View style={styles.beautyMosaicCard}>
              <SafeImage source={IMAGES.beautyPotliMassage || IMAGES.heroMassage} style={styles.beautyMosaicImg} />
            </View>
          </View>
          <View style={[styles.beautyMosaicRow, { marginTop: 0 }]}>
            <View style={styles.beautyMosaicCard}>
              <SafeImage source={IMAGES.menHaircutPro} style={styles.beautyMosaicImg} />
            </View>
            <View style={styles.beautyMosaicCard}>
              <SafeImage source={IMAGES.beautySkinHydrating || IMAGES.heroSalon} style={styles.beautyMosaicImg} />
            </View>
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
          <View key={`${item.id}-${idx}`} style={[styles.serviceProductCard, idx === 0 && { marginLeft: 16 }, idx === BEAUTY_MOST_BOOKED.length - 1 && { marginRight: 16 }]}>
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
          <View key={`${item.id}-${idx}`} style={[styles.serviceProductCard, idx === 0 && { marginLeft: 16 }, idx === BEAUTY_SALON_WOMEN.length - 1 && { marginRight: 16 }]}>
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
          <View key={`${item.id}-${idx}`} style={[styles.serviceProductCard, idx === 0 && { marginLeft: 16 }, idx === BEAUTY_HAIR_STUDIO.length - 1 && { marginRight: 16 }]}>
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
          <View key={`${item.id}-${idx}`} style={[styles.serviceProductCard, idx === 0 && { marginLeft: 16 }, idx === BEAUTY_SALON_MEN.length - 1 && { marginRight: 16 }]}>
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
          onPress={() => setCurrentScreen('native-purifier')}
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
          onPress={() => setCurrentScreen('native-locks')}
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
          <View key={`${item.id}-${idx}`} style={[styles.serviceProductCard, idx === 0 && { marginLeft: 16 }, idx === NATIVE_NEWLY_LAUNCHED.length - 1 && { marginRight: 16 }]}>
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
          <View key={`${item.id}-${idx}`} style={[styles.serviceProductCard, idx === 0 && { marginLeft: 16 }, idx === NATIVE_WATER_PURIFIERS.length - 1 && { marginRight: 16 }]}>
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
          <View key={`${item.id}-${idx}`} style={[styles.serviceProductCard, idx === 0 && { marginLeft: 16 }, idx === NATIVE_SMART_LOCKS.length - 1 && { marginRight: 16 }]}>
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
          <View key={`${card.id}-${idx}`} style={[styles.nativeExclusiveCardWrapper, idx === 0 && { marginLeft: 16 }, idx === NATIVE_EXCLUSIVE_CARDS.length - 1 && { marginRight: 16 }]}>
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
          <View key={`${card.id}-${idx}`} style={[styles.nativeAdvantageCardWrapper, idx === 0 && { marginLeft: 16 }, idx === NATIVE_ADVANTAGE_CARDS.length - 1 && { marginRight: 16 }]}>
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
          <View key={`clean-1-${item.id}-${idx}`} style={[styles.serviceProductCard, idx === 0 && { marginLeft: 16 }, idx === CLEANING_ESSENTIALS.length - 1 && { marginRight: 16 }]}>
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
          <View key={`app-1-${item.id}-${idx}`} style={[styles.serviceProductCard, idx === 0 && { marginLeft: 16 }, idx === APPLIANCE_SERVICES.length - 1 && { marginRight: 16 }]}>
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
          <View key={`repair-1-${item.id}-${idx}`} style={[styles.serviceProductCard, idx === 0 && { marginLeft: 16 }, idx === HOME_REPAIR_SERVICES.length - 1 && { marginRight: 16 }]}>
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
      {/* LIVE SPECIALIST TRACKING CARD (CUSTOMER WORKFLOW) */}
      <TouchableOpacity
        style={styles.customerTrackingBanner}
        activeOpacity={0.88}
        onPress={() => setShowTrackingModal(true)}
      >
        <View style={styles.trackingBannerIconBox}>
          <Text style={styles.trackingBannerIcon}>🛵</Text>
        </View>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <Text style={styles.trackingBannerTitle}>
              {activeCustomerBooking?.stage === 6 ? 'Service Completed 🎉' :
               activeCustomerBooking?.stage === 5 ? 'Service In Progress ⚡' :
               activeCustomerBooking?.stage === 4 ? 'Specialist Arrived 📍' :
               activeCustomerBooking?.stage === 3 ? 'Specialist on the way 🛵' :
               'Specialist Assigned 👷'}
            </Text>
            <View style={styles.trackingLivePill}>
              <Text style={styles.trackingLivePillText}>LIVE</Text>
            </View>
          </View>
          <Text style={styles.trackingBannerSub} numberOfLines={1}>
            {activeCustomerBooking?.stage === 4
              ? `Vikram Salvi at your door • Share OTP: `
              : activeCustomerBooking?.stage === 5
              ? `${activeCustomerBooking?.service || 'Doorstep Service'} • In Progress`
              : activeCustomerBooking?.stage === 6
              ? `${activeCustomerBooking?.service || 'Doorstep Service'} • Completed`
              : `Vikram Salvi arriving in ~8 mins • Start OTP: `}
            <Text style={{ fontWeight: '800', color: '#F04400' }}>
              {activeCustomerBooking?.otp || '4829'}
            </Text>
          </Text>
        </View>
        <View style={styles.trackingBannerAction}>
          <Text style={styles.trackingBannerActionText}>Track ›</Text>
        </View>
      </TouchableOpacity>

      {/* 1. FESTIVE DIWALI ROOFTOP CAROUSEL BANNER (At Top of Homes) */}
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

              <SafeImage source={card.image} item={card} style={styles.festiveCardImage} />

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

      {/* 2. HOMES HERO: "Home services at your doorstep" + "What are you looking for?" + 4-Mosaic (Screenshot 1) */}
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
                  if (tile.id === 'painting') {
                    openCategoryScreen('painting-decor', 'all');
                  } else if (tile.id === 'home-repairs' || tile.id === 'quick-repairs') {
                    openCategoryScreen('quick-repairs', 'all');
                  } else if (tile.id === 'ac-appliances') {
                    openCategoryScreen('ac-appliances', 'all');
                  } else if (tile.id === 'bathroom-kitchen-cleaning') {
                    openCategoryScreen('cleaning-pest', 'Bathroom Cleaning');
                  } else if (tile.id === 'cleaning') {
                    openCategoryScreen('cleaning-pest', 'all');
                  } else if (tile.id === 'native-ro' || tile.id === 'water-purifier') {
                    openCategoryScreen('native-ro', 'all');
                  } else {
                    openCategoryScreen('ac-appliances', 'all');
                  }
                }}
              >
                <View style={styles.nativeLookingForIconBox}>
                  {tile.badgeType === 'top-sale' && (
                    <View style={styles.nativeLookingForSaleBadge}>
                      <Text style={styles.nativeLookingForSaleText}>{tile.badge}</Text>
                    </View>
                  )}
                  <SafeImage source={tile.icon} item={tile} style={styles.nativeLookingForImg} />
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
              <SafeImage source={IMAGES.heroAc} item={{ title: 'AC Service & Repair', category: 'ac' }} style={styles.mosaicImg} />
            </View>
            <View style={styles.mosaicImgCard}>
              <SafeImage source={IMAGES.ceilingFanInstall} item={{ title: 'Ceiling Fan Installation', category: 'electrician' }} style={styles.mosaicImg} />
            </View>
          </View>
          <View style={styles.mosaicSubcol}>
            <View style={styles.mosaicImgCard}>
              <SafeImage source={IMAGES.homeBathroom} item={{ title: 'Bathroom Cleaning', category: 'cleaning' }} style={styles.mosaicImg} />
            </View>
            <View style={styles.mosaicImgCard}>
              <SafeImage source={IMAGES.homePainter} item={{ title: 'Home Painting', category: 'painting' }} style={styles.mosaicImg} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.sectionDivider} />

      {/* IN THE SPOTLIGHT */}
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
            key={`spotlight-${item.id}-${idx}`}
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
        {NOTEWORTHY_ITEMS.map((item, idx) => (
          <TouchableOpacity
            key={`noteworthy-${item.id}-${idx}`}
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

      {/* 7. MOST BOOKED & LIVE CATALOGUE SERVICES */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeading}>Most booked services</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.servicesScroll}
      >
        {(() => {
          const activeDb = (dbServices || []).filter(s => !s.isArchived && s.status !== 'Archived');
          const dynamicCards = activeDb.map((s, dIdx) => ({
            id: s.id || s._id || `db-${dIdx}`,
            title: s.title,
            image: s.image ? (typeof s.image === 'string' ? { uri: s.image } : s.image) : IMAGES.acCard,
            rating: typeof s.rating === 'number' ? `${s.rating} (${s.reviewsCount || '100K'})` : (s.rating || '4.85 (100K)'),
            duration: s.duration || `${s.durationMins || 60} MINS`,
            price: typeof s.price === 'number' ? `₹${s.price}` : s.price,
            oldPrice: s.originalPrice ? (typeof s.originalPrice === 'number' ? `₹${s.originalPrice}` : s.originalPrice) : null,
            btnSubtext: s.badge || 'Verified',
            rawService: s
          }));
          const combinedItems = [...dynamicCards, ...MOST_BOOKED_ITEMS];

          return combinedItems.map((item, idx) => (
            <View
              key={`mostbooked-${item.id}-${idx}`}
              style={[
                styles.serviceProductCard,
                idx === 0 && { marginLeft: 16 },
                idx === combinedItems.length - 1 && { marginRight: 16 }
              ]}
            >
              <View style={styles.serviceImageWrapper}>
                <SafeImage source={item.image} item={item.rawService || item} style={styles.serviceImage} resizeMode="cover" />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => handleAddService(item.rawService || item)}
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
          ));
        })()}
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
            key={`curation-${item.id}-${idx}`}
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
            key={`clean-2-${item.id}-${idx}`}
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
            key={`app-2-${item.id}-${idx}`}
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
            key={`repair-2-${item.id}-${idx}`}
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


      <View style={styles.sectionDivider} />

      {/* 16. PAINTING & WATERPROOFING */}
      <View style={styles.sectionHeaderRowWithLink}>
        <Text style={styles.sectionHeading}>Painting & Waterproofing</Text>
        <TouchableOpacity onPress={() => setShowAllServicesModal(true)}>
          <Text style={styles.seeAllLink}>See all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.servicesScroll}
      >
        {PAINTING_SERVICES.map((item, idx) => (
          <View
            key={`paint-${item.id}-${idx}`}
            style={[
              styles.serviceProductCard,
              idx === 0 && { marginLeft: 16 },
              idx === PAINTING_SERVICES.length - 1 && { marginRight: 16 }
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

      <View style={styles.sectionDivider} />

      {/* 18B. RECENTLY VIEWED SERVICES (Urban Company Recents) */}
      <View style={styles.sectionHeaderRowWithLink}>
        <Text style={styles.sectionHeading}>Recently viewed</Text>
        <TouchableOpacity onPress={() => setShowAllServicesModal(true)}>
          <Text style={styles.seeAllLink}>See all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.servicesScroll}
      >
        {RECENTLY_VIEWED_SERVICES.map((item, idx) => (
          <View
            key={`recent-${item.id}-${idx}`}
            style={[
              styles.serviceProductCard,
              idx === 0 && { marginLeft: 16 },
              idx === RECENTLY_VIEWED_SERVICES.length - 1 && { marginRight: 16 }
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
              {item.badge && (
                <View style={styles.serviceCardBadgePill}>
                  <Text style={styles.serviceCardBadgePillText}>{item.badge}</Text>
                </View>
              )}
            </View>

            <Text style={styles.serviceCardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.serviceRating}>
              ★ {item.rating} · {item.duration}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Text style={styles.servicePrice}>{item.price}</Text>
              {item.oldPrice && (
                <Text style={styles.serviceOldPrice}>{item.oldPrice}</Text>
              )}
            </View>
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
    </ScrollView>
  );

  const renderNativePurifierScreen = () => (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Header Bar */}
      <View style={styles.detailHeaderBar}>
        <TouchableOpacity
          onPress={() => setCurrentScreen('home')}
          style={styles.detailHeaderBackBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.detailHeaderBackArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.detailHeaderTitle} numberOfLines={1}>
          Native Water Purifier
        </Text>
        <View style={styles.cartIconWrapper}>
          <Text style={styles.cartIconText}>🛒</Text>
          <View style={styles.cartCountBadge}>
            <Text style={styles.cartCountBadgeText}>{cartCount || 1}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Title Banner */}
        <View style={styles.npBannerSection}>
          <Text style={styles.npMainTitle}>Native Water Purifier</Text>
          <Text style={styles.npSubtitleRating}>★ 4.84 (321K bookings)</Text>
          <TouchableOpacity
            style={styles.npViewServicesBtn}
            onPress={() => setSearchQuery('Purifier')}
          >
            <Text style={styles.npViewServicesText}>View Services</Text>
          </TouchableOpacity>
        </View>

        {/* Models List */}
        <View style={styles.npModelsContainer}>
          <Text style={styles.npModelsHeading}>Models</Text>

          {/* Model 1: Native M1 */}
          <View style={styles.npModelCard}>
            <View style={styles.npModelDetails}>
              <Text style={styles.npModelName}>Native M1</Text>
              <Text style={styles.npModelRating}>★ 4.86 (162K reviews)</Text>
              <Text style={styles.npModelPrice}>Starts at ₹13,499</Text>
              <Text style={styles.npModelLink}>View details →</Text>
            </View>
            <View style={styles.npModelImgCol}>
              <View style={styles.npOfferTag}>
                <Text style={styles.npOfferTagText}>% Get it at ₹11,799</Text>
              </View>
              <SafeImage source={IMAGES.nativeM1Purifier} style={styles.npModelImg} />
              <TouchableOpacity
                style={styles.npAddBtn}
                onPress={() => {
                  setCartCount((prev) => prev + 1);
                  Alert.alert('Added to Cart', 'Native M1 added to cart successfully!');
                }}
              >
                <Text style={styles.npAddBtnText}>Add</Text>
                <Text style={styles.npAddSubtext}>2 options</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Model 2: Native M0 */}
          <View style={styles.npModelCard}>
            <View style={styles.npModelDetails}>
              <Text style={styles.npModelName}>Native M0</Text>
              <Text style={styles.npModelRating}>★ 4.85 (12K reviews)</Text>
              <Text style={styles.npModelPrice}>Starts at ₹11,799</Text>
              <Text style={styles.npModelLink}>View details →</Text>
            </View>
            <View style={styles.npModelImgCol}>
              <View style={styles.npOfferTag}>
                <Text style={styles.npOfferTagText}>% Get it at ₹10,269</Text>
              </View>
              <SafeImage source={IMAGES.nativePurifier} style={styles.npModelImg} />
              <TouchableOpacity
                style={styles.npAddBtn}
                onPress={() => {
                  setCartCount((prev) => prev + 1);
                  Alert.alert('Added to Cart', 'Native M0 added to cart successfully!');
                }}
              >
                <Text style={styles.npAddBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* UC Promise Box */}
        <View style={styles.npPromiseCard}>
          <Text style={styles.npPromiseTitle}>UC Promise  ✓ ASSURED</Text>
          <Text style={styles.npPromiseLine}>✓  Verified Professionals</Text>
          <Text style={styles.npPromiseLine}>✓  Hassle Free Booking</Text>
          <Text style={styles.npPromiseLine}>✓  Transparent Pricing</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Bottom Cart Bar */}
      <View style={styles.npStickyCartBar}>
        <View>
          <Text style={styles.npStickyCartItems}>Cart ({cartCount || 1} items)</Text>
          <Text style={styles.npStickyCartPrice}>₹1,199</Text>
        </View>
        <TouchableOpacity
          style={styles.npCheckoutBtn}
          onPress={() => {
            Alert.alert('Checkout', 'Proceeding to checkout with item (₹1,199)...');
          }}
        >
          <Text style={styles.npCheckoutBtnText}>Proceed to Checkout →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderNativeLocksScreen = () => (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={styles.detailHeaderBar}>
        <TouchableOpacity
          onPress={() => setCurrentScreen('home')}
          style={styles.detailHeaderBackBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.detailHeaderBackArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.detailHeaderTitle} numberOfLines={1}>
          Native Smart Locks
        </Text>
        <View style={styles.cartIconWrapper}>
          <Text style={styles.cartIconText}>🛒</Text>
          <View style={styles.cartCountBadge}>
            <Text style={styles.cartCountBadgeText}>{cartCount || 1}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Locks Title Banner */}
        <View style={styles.npBannerSection}>
          <Text style={styles.npMainTitle}>Native Smart Locks</Text>
          <Text style={styles.npSubtitleRating}>★ 4.77 (28K bookings)</Text>
          <TouchableOpacity
            style={styles.npViewServicesBtn}
            onPress={() => setSearchQuery('Smart Lock')}
          >
            <Text style={styles.npViewServicesText}>View Services</Text>
          </TouchableOpacity>
        </View>

        {/* Video Showcase Card with Play Icon */}
        <View style={styles.locksVideoCard}>
          <Image
            source={require('./assets/images/native_smart_lock.jpg')}
            style={styles.locksVideoImg}
            resizeMode="cover"
          />
          <View style={styles.locksPlayButton}>
            <Text style={styles.locksPlayIcon}>▶</Text>
          </View>
        </View>

        {/* Featured Lock Models */}
        <View style={styles.npModelsContainer}>
          <Text style={styles.npModelsHeading}>Feature lock</Text>

          <View style={styles.npModelCard}>
            <View style={styles.npModelDetails}>
              <Text style={styles.npModelName}>Native Lock Pro</Text>
              <Text style={styles.npModelRating}>★ 4.88 (14K reviews)</Text>
              <Text style={styles.npModelPrice}>Starts at ₹11,999</Text>
              <Text style={styles.npModelLink}>View details →</Text>
            </View>
            <View style={styles.npModelImgCol}>
              <SafeImage source={IMAGES.nativeLockPro} style={styles.npModelImg} />
              <TouchableOpacity
                style={styles.npAddBtn}
                onPress={() => {
                  setCartCount((prev) => prev + 1);
                  Alert.alert('Added to Cart', 'Native Lock Pro added to cart!');
                }}
              >
                <Text style={styles.npAddBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );

  // 24. SALON PRIME DEDICATED SCREEN (Direct replica of Web App / Screenshot 2)
  const renderSalonPrimeScreen = () => {
    const currentSlide = SALON_PRIME_HERO_SLIDES[salonSlideIndex] || SALON_PRIME_HERO_SLIDES[0];

    // Build real-time dynamic catalogue sections merged with live dbServices
    const activeDb = (dbServices || []).filter((s) => !s.isArchived && s.status !== 'Archived');
    const dbMap = new Map();
    activeDb.forEach((s) => {
      const k = (s.id || s._id || s.title || '').trim().toLowerCase();
      if (k) dbMap.set(k, s);
      if (s.title) dbMap.set(s.title.trim().toLowerCase(), s);
    });

    const usedDbIds = new Set();
    const liveSalonSections = SALON_PRIME_SECTIONS.map((sec) => {
      const updatedServices = sec.services
        .filter((s) => {
          const k = (s.id || s.title || '').trim().toLowerCase();
          const dbItem = dbMap.get(k);
          if (dbItem && (dbItem.isArchived || dbItem.status === 'Archived')) return false;
          return true;
        })
        .map((s) => {
          const k = (s.id || s.title || '').trim().toLowerCase();
          const dbItem = dbMap.get(k);
          if (dbItem) {
            usedDbIds.add(dbItem.id || dbItem._id);
            return {
              ...s,
              title: dbItem.title || s.title,
              price: typeof dbItem.price === 'number' ? `₹${dbItem.price.toLocaleString('en-IN')}` : (dbItem.price || s.price),
              originalPrice: dbItem.originalPrice ? (typeof dbItem.originalPrice === 'number' ? `₹${dbItem.originalPrice.toLocaleString('en-IN')}` : dbItem.originalPrice) : s.originalPrice,
              rating: dbItem.rating || s.rating,
              reviewsCount: dbItem.reviewsCount || s.reviewsCount,
              inclusions: Array.isArray(dbItem.includedWork) && dbItem.includedWork.length > 0
                ? dbItem.includedWork
                : Array.isArray(dbItem.inclusions) && dbItem.inclusions.length > 0
                ? dbItem.inclusions
                : s.inclusions,
              image: dbItem.image || s.image
            };
          }
          return s;
        });

      // Also append any new dbServices whose subcategory matches this section
      activeDb.forEach((db) => {
        if (usedDbIds.has(db.id || db._id)) return;
        const cat = (db.category || '').toLowerCase();
        const isSalon = cat.includes('salon') || cat.includes('beauty') || cat.includes('women');
        if (!isSalon) return;
        const sub = (db.subcategory || '').toLowerCase();
        const secId = sec.id.toLowerCase();
        if (
          sub.includes(secId) ||
          (secId === 'waxing' && sub.includes('wax')) ||
          (secId === 'facial' && sub.includes('facial')) ||
          (secId === 'pedi-mani' && (sub.includes('mani') || sub.includes('pedi'))) ||
          (secId === 'hair-care' && (sub.includes('hair') || sub.includes('studio')))
        ) {
          usedDbIds.add(db.id || db._id);
          updatedServices.push({
            id: db.id || `srv-${Date.now()}`,
            title: db.title,
            rating: db.rating || 4.88,
            reviewsCount: db.reviewsCount || '12K reviews',
            price: typeof db.price === 'number' ? `₹${db.price.toLocaleString('en-IN')}` : db.price,
            originalPrice: db.originalPrice ? `₹${db.originalPrice}` : `₹${Math.round((Number(db.price) || 500) * 1.25)}`,
            inclusions: Array.isArray(db.includedWork) && db.includedWork.length > 0 ? db.includedWork : [db.description || 'Doorstep service with certified technician'],
            image: db.image
          });
        }
      });

      return {
        ...sec,
        services: updatedServices
      };
    });

    // Any remaining salon services from DB go into a "More Catalogue Services" section
    const remainingSalon = activeDb.filter((db) => {
      if (usedDbIds.has(db.id || db._id)) return false;
      const cat = (db.category || '').toLowerCase();
      return cat.includes('salon') || cat.includes('beauty') || cat.includes('women');
    });

    if (remainingSalon.length > 0) {
      liveSalonSections.push({
        id: 'more-salon',
        title: 'More Catalogue Services',
        services: remainingSalon.map((db) => ({
          id: db.id || `srv-${Date.now()}`,
          title: db.title,
          rating: db.rating || 4.86,
          reviewsCount: db.reviewsCount || '15K reviews',
          price: typeof db.price === 'number' ? `₹${db.price.toLocaleString('en-IN')}` : db.price,
          originalPrice: db.originalPrice ? `₹${db.originalPrice}` : `₹${Math.round((Number(db.price) || 500) * 1.2)}`,
          inclusions: Array.isArray(db.includedWork) && db.includedWork.length > 0 ? db.includedWork : [db.description || 'Verified doorstep service'],
          image: db.image
        }))
      });
    }

    // Filter catalogue sections by active category tab and search query
    const filteredSections = liveSalonSections.filter((section) => {
      if (salonCategoryTab !== 'all' && section.id !== salonCategoryTab) {
        return false;
      }
      return true;
    }).map((section) => {
      if (!salonSearch.trim()) return section;
      const q = salonSearch.toLowerCase().trim();
      return {
        ...section,
        services: section.services.filter((s) =>
          s.title.toLowerCase().includes(q) ||
          s.inclusions.some((inc) => inc.toLowerCase().includes(q))
        )
      };
    }).filter((section) => section.services.length > 0);

    return (
      <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        {/* Header Bar matching Screenshot 2 */}
        <View style={styles.salonPrimeHeader}>
          <View style={styles.salonPrimeHeaderTop}>
            <TouchableOpacity
              onPress={() => setCurrentScreen('home')}
              style={styles.detailHeaderBackBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.detailHeaderBackArrow}>←</Text>
            </TouchableOpacity>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.salonPrimeTitle}>Salon Prime</Text>
              <Text style={styles.salonPrimeRatingSub}>★ 4.85 (18.8 M bookings)</Text>
            </View>

            <TouchableOpacity
              style={styles.cartIconWrapper}
              onPress={() => Alert.alert('Cart', `${cartCount || 1} item in cart. Total: ₹1,199`)}
            >
              <Text style={styles.cartIconText}>🛒</Text>
              <View style={styles.cartCountBadge}>
                <Text style={styles.cartCountBadgeText}>{cartCount || 1}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Location & Search row */}
          <View style={styles.salonPrimeSearchRow}>
            <View style={styles.salonPrimeLocationChip}>
              <Text style={styles.salonPrimeLocationText} numberOfLines={1}>📍 4744+HMQ, Rayakottai Road ▾</Text>
            </View>
            <View style={styles.salonPrimeSearchInputBox}>
              <Text style={{ fontSize: 13, marginRight: 6 }}>🔍</Text>
              <TextInput
                style={styles.salonPrimeSearchInput}
                placeholder="Search in Salon Prime"
                placeholderTextColor="#94A3B8"
                value={salonSearch}
                onChangeText={setSalonSearch}
              />
              {salonSearch.length > 0 && (
                <TouchableOpacity onPress={() => setSalonSearch('')}>
                  <Text style={{ fontSize: 14, color: '#94A3B8' }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Select a service Categories Horizontal Tabs */}
          <View style={styles.salonSelectSection}>
            <Text style={styles.salonSelectHeading}>Select a service</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.salonCatScroll}>
              {SALON_PRIME_CATEGORIES.map((cat) => {
                const isActive = salonCategoryTab === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.salonCatTabCard, isActive && styles.salonCatTabCardActive]}
                    activeOpacity={0.8}
                    onPress={() => setSalonCategoryTab(cat.id)}
                  >
                    <View style={styles.salonCatIconBox}>
                      {cat.image ? (
                        <SafeImage source={cat.image} item={cat} style={styles.salonCatTabImg} resizeMode="cover" />
                      ) : cat.discount ? (
                        <View style={styles.salonDiscountPillBox}>
                          <Text style={styles.salonDiscountPillText}>{cat.discount}</Text>
                        </View>
                      ) : (
                        <Text style={[styles.salonCatStarIcon, isActive && { color: '#F04400' }]}>{cat.icon || '★'}</Text>
                      )}
                      {cat.badge && (
                        <View style={styles.salonCatNewBadge}>
                          <Text style={styles.salonCatNewBadgeText}>{cat.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.salonCatTabLabel, isActive && styles.salonCatTabLabelActive]} numberOfLines={2}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Hero Carousel Banner matching Screenshot 2 */}
          <View style={[styles.salonHeroBannerCard, { backgroundColor: currentSlide.bgColor }]}>
            <View style={styles.salonHeroBannerLeft}>
              <View style={[styles.salonHeroBadgePill, { backgroundColor: currentSlide.badgeColor }]}>
                <Text style={styles.salonHeroBadgeText}>{currentSlide.badge}</Text>
              </View>
              <Text style={styles.salonHeroBannerTitle}>{currentSlide.title}</Text>
              <Text style={styles.salonHeroBannerSubtitle}>{currentSlide.subtitle}</Text>

              {/* Slider Arrows */}
              <View style={styles.salonHeroArrowsRow}>
                <TouchableOpacity
                  style={styles.salonHeroArrowBtn}
                  onPress={() => setSalonSlideIndex((prev) => (prev === 0 ? SALON_PRIME_HERO_SLIDES.length - 1 : prev - 1))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.salonHeroArrowText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.salonHeroPaginationText}>{salonSlideIndex + 1} / {SALON_PRIME_HERO_SLIDES.length}</Text>
                <TouchableOpacity
                  style={styles.salonHeroArrowBtn}
                  onPress={() => setSalonSlideIndex((prev) => (prev === SALON_PRIME_HERO_SLIDES.length - 1 ? 0 : prev + 1))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.salonHeroArrowText}>›</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.salonHeroBannerRight}>
              <SafeImage source={currentSlide.image} item={currentSlide} style={styles.salonHeroBannerImg} resizeMode="cover" />
            </View>
          </View>

          {/* Promo Row: 25% Off + UC Promise */}
          <View style={styles.salonPromoRow}>
            {/* 25% Off Promo Card */}
            <View style={styles.salonOfferCard}>
              <View style={styles.salonOfferBadgeRow}>
                <Text style={styles.salonOfferPercentIcon}>%</Text>
                <Text style={styles.salonOfferTitle}>Get 25% off upto 200</Text>
              </View>
              <Text style={styles.salonOfferSub}>For new salon users • 1/2</Text>
            </View>

            {/* UC Promise Card */}
            <View style={styles.salonPromiseCard}>
              <View style={styles.salonPromiseHeader}>
                <Text style={styles.salonPromiseTitle}>UC Promise</Text>
                <View style={styles.salonQualityPill}>
                  <Text style={styles.salonQualityPillText}>QUALITY ASSURED</Text>
                </View>
              </View>
              <Text style={styles.salonPromiseItem}>✓ 4.5+ Rated Beauticians</Text>
              <Text style={styles.salonPromiseItem}>✓ Luxury Salon Experience</Text>
              <Text style={styles.salonPromiseItem}>✓ Premium Branded Products</Text>
            </View>
          </View>

          {/* Services Catalogue Sections */}
          <View style={styles.salonCatalogueContainer}>
            {filteredSections.map((sec, secIdx) => (
              <View key={`sec-${sec.id}-${secIdx}`} style={styles.salonSectionBlock}>
                <View style={styles.salonSectionHeaderRow}>
                  <Text style={styles.salonSectionHeading}>{sec.title}</Text>
                  <Text style={styles.salonSectionCount}>{sec.services.length} services</Text>
                </View>

                {sec.services.map((srv, srvIdx) => (
                  <TouchableOpacity
                    key={`srv-${srv.id}-${srvIdx}`}
                    style={styles.salonItemCard}
                    activeOpacity={0.88}
                    onPress={() => handleAddService(srv)}
                  >
                    <View style={styles.salonItemInfo}>
                      <Text style={styles.salonItemTitle}>{srv.title}</Text>
                      <View style={styles.salonItemRatingRow}>
                        <Text style={styles.salonItemStar}>★ {srv.rating}</Text>
                        <Text style={styles.salonItemReviews}>({srv.reviewsCount})</Text>
                      </View>
                      <View style={styles.salonItemPriceRow}>
                        <Text style={styles.salonItemPrice}>{srv.price}</Text>
                        <Text style={styles.salonItemOrigPrice}>{srv.originalPrice}</Text>
                      </View>
                      <View style={styles.salonItemInclusions}>
                        {srv.inclusions.map((inc, i) => (
                          <Text key={i} style={styles.salonInclusionText}>• {inc}</Text>
                        ))}
                      </View>
                    </View>

                    <View style={styles.salonItemActionCol}>
                      <View style={styles.salonItemThumbContainer}>
                        <SafeImage
                          source={srv.image || resolveServiceImage(srv)}
                          item={srv}
                          style={styles.salonItemThumbImage}
                          resizeMode="cover"
                        />
                      </View>
                      <TouchableOpacity
                        style={styles.salonItemAddBtn}
                        activeOpacity={0.8}
                        onPress={() => {
                          setCartCount((prev) => prev + 1);
                          Alert.alert('Added to Cart 🎉', `"${srv.title}" added to your salon booking!`);
                        }}
                      >
                        <Text style={styles.salonItemAddBtnText}>Add +</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* Sticky Floating View Cart Bottom Bar matching Screenshot 2 */}
        <View style={styles.salonStickyCartBar}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
              <Text style={styles.salonCartPriceMain}>₹1,199</Text>
              <Text style={styles.salonCartPriceOrig}>₹1,379</Text>
            </View>
            <Text style={styles.salonCartItemsLabel}>{cartCount || 1} service in cart</Text>
          </View>

          <TouchableOpacity
            style={styles.salonViewCartBtn}
            activeOpacity={0.85}
            onPress={() => Alert.alert('Cart & Checkout', 'Proceeding to Salon Prime Checkout with 25% First-Booking discount applied!')}
          >
            <Text style={styles.salonViewCartBtnText}>View Cart  ›</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCategoryDetailScreen = () => {
    // 1. Category metadata dictionary
    const categoryMetaMap = {
      'mens-salon': {
        title: "Men's Salon & Grooming",
        ratingSub: '★ 4.88 (720K+ bookings)',
        bannerTag: 'MOST BOOKED',
        bannerTitle: 'Expert Grooming & Haircuts',
        bannerSub: 'Custom scissor cuts, fade styling, beard shaping & detan facials',
        bannerBg: '#0F172A',
        icon: '✂️'
      },
      'ac-appliances': {
        title: 'AC & Appliance Repair',
        ratingSub: '★ 4.86 (1.2M+ bookings)',
        bannerTag: 'SUMMER SAVER',
        bannerTitle: 'PowerJet AC Servicing',
        bannerSub: 'Deep foam wash • 2X cooling • 60-day warranty protection',
        bannerBg: '#1E293B',
        icon: '❄️'
      },
      'cleaning-pest': {
        title: 'Cleaning & Pest Control',
        ratingSub: '★ 4.85 (950K+ bookings)',
        bannerTag: '100% SPOTLESS',
        bannerTitle: 'Intense Stain Removal & Disinfection',
        bannerSub: 'Motorized single-disc floor scrub & German chemical descaling',
        bannerBg: '#064E3B',
        icon: '✨'
      },
      'quick-repairs': {
        title: 'Electrician, Plumber & Carpenter',
        ratingSub: '★ 4.84 (2.4M+ bookings)',
        bannerTag: 'IN 15 MINS',
        bannerTitle: 'Doorstep Home Repairs',
        bannerSub: 'Switchboards, tap leaks, door lock fixes & drill/hang',
        bannerBg: '#78350F',
        icon: '🔧'
      },
      'native-ro': {
        title: 'Native Water Purifiers & Locks',
        ratingSub: '★ 4.90 (240K+ bookings)',
        bannerTag: 'UC INNOVATION',
        bannerTitle: 'Needs No Filter Service for 2 Years',
        bannerSub: '10-Stage RO+UV water purification & 3D face recognition smart locks',
        bannerBg: '#1E1B4B',
        icon: '💧'
      },
      'painting-decor': {
        title: 'Painting & Waterproofing',
        ratingSub: '★ 4.89 (150K+ bookings)',
        bannerTag: 'CONSULTATION ₹49',
        bannerTitle: 'Express Home Painting & Laser Inspection',
        bannerSub: 'Laser room measurement, 3D shade preview & Dr. Fixit waterproofing',
        bannerBg: '#312E81',
        icon: '🎨'
      }
    };

    const meta = categoryMetaMap[selectedCategoryView] || {
      title: 'Available Services',
      ratingSub: '★ 4.86 (1M+ bookings)',
      bannerTag: 'VERIFIED',
      bannerTitle: 'Doorstep Professional Services',
      bannerSub: 'Certified specialists, standardized pricing & 100% mess-free SOP',
      bannerBg: '#0F172A',
      icon: '⭐'
    };

    // 2. Fetch all services matching category from live dbServices + WEB_APP_SERVICES
    const activeDb = (dbServices || []).filter((s) => !s.isArchived && s.status !== 'Archived');
    const rawServices = [...activeDb, ...(WEB_APP_SERVICES || [])].filter((s) => {
      if (s.isArchived || s.status === 'Archived') return false;
      const cat = (s.category || '').toLowerCase().trim();
      const target = (selectedCategoryView || '').toLowerCase().trim();
      if (cat === target) return true;
      if (target === 'cleaning-pest' && (cat === 'cleaning' || cat === 'pest' || cat.includes('clean') || cat.includes('pest'))) return true;
      if (target === 'ac-appliances' && (cat === 'ac' || cat === 'appliances' || cat.includes('ac') || cat.includes('appliance'))) return true;
      if (target === 'quick-repairs' && (cat === 'repair' || cat === 'epc' || cat.includes('repair') || cat.includes('electric') || cat.includes('plumb') || cat.includes('carpent'))) return true;
      if (target === 'painting-decor' && (cat === 'painting' || cat.includes('paint') || cat.includes('decor'))) return true;
      if (target === 'native-ro' && (cat === 'native-purifier' || cat === 'water-purifier' || cat.includes('purifier'))) return true;
      if ((target === 'womens-salon' || target === 'salon-women') && (cat.includes('salon') || cat.includes('beauty') || cat.includes('women'))) return true;
      if ((target === 'mens-salon' || target === 'mens-grooming') && (cat.includes('men') || cat.includes('groom'))) return true;
      return false;
    });

    // Deduplicate by unique id / title (live database records take precedence)
    const seen = new Set();
    const uniqueCatServices = [];
    rawServices.forEach((s) => {
      const k = (s.id || s._id || s.title || '').trim().toLowerCase();
      if (k && !seen.has(k)) {
        seen.add(k);
        uniqueCatServices.push(s);
      }
    });

    // Extract all distinct subcategories
    const distinctSubs = Array.from(new Set(uniqueCatServices.map((s) => s.subcategory).filter(Boolean)));
    const subcategoryTabs = ['all', ...distinctSubs];

    // Filter services based on active subcategory pill and search query
    const filteredList = uniqueCatServices.filter((s) => {
      if (selectedSubcategoryFilter !== 'all') {
        const sub = (s.subcategory || '').toLowerCase().trim();
        const activeFilter = (selectedSubcategoryFilter || '').toLowerCase().trim();
        if (sub !== activeFilter && !sub.includes(activeFilter) && !activeFilter.includes(sub)) {
          return false;
        }
      }
      if (categorySearchQuery.trim()) {
        const q = categorySearchQuery.toLowerCase().trim();
        const tMatch = (s.title || '').toLowerCase().includes(q);
        const sMatch = (s.subcategory || '').toLowerCase().includes(q);
        const dMatch = (s.description || '').toLowerCase().includes(q);
        const iMatch = Array.isArray(s.inclusions) && s.inclusions.some((inc) => inc.toLowerCase().includes(q));
        return tMatch || sMatch || dMatch || iMatch;
      }
      return true;
    });

    // Group by subcategory
    const subcategoryGroups = {};
    filteredList.forEach((srv) => {
      const sub = srv.subcategory || 'All Services';
      if (!subcategoryGroups[sub]) subcategoryGroups[sub] = [];
      subcategoryGroups[sub].push(srv);
    });

    return (
      <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        {/* Header Bar */}
        <View style={styles.salonPrimeHeader}>
          <View style={styles.salonPrimeHeaderTop}>
            <TouchableOpacity
              onPress={() => setCurrentScreen('home')}
              style={styles.detailHeaderBackBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.detailHeaderBackArrow}>←</Text>
            </TouchableOpacity>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.salonPrimeTitle} numberOfLines={1}>{meta.title}</Text>
              <Text style={styles.salonPrimeRatingSub}>{meta.ratingSub}</Text>
            </View>

            <TouchableOpacity
              style={styles.cartIconWrapper}
              onPress={() => Alert.alert('Cart', `${cartCount || 1} item in cart.`)}
            >
              <Text style={styles.cartIconText}>🛒</Text>
              <View style={styles.cartCountBadge}>
                <Text style={styles.cartCountBadgeText}>{cartCount || 1}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Location & Search row */}
          <View style={styles.salonPrimeSearchRow}>
            <View style={styles.salonPrimeLocationChip}>
              <Text style={styles.salonPrimeLocationText} numberOfLines={1}>📍 4744+HMQ, Rayakottai Road ▾</Text>
            </View>
            <View style={styles.salonPrimeSearchInputBox}>
              <Text style={{ fontSize: 13, marginRight: 6 }}>🔍</Text>
              <TextInput
                style={styles.salonPrimeSearchInput}
                placeholder={`Search in ${meta.title}`}
                placeholderTextColor="#94A3B8"
                value={categorySearchQuery}
                onChangeText={setCategorySearchQuery}
              />
              {categorySearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setCategorySearchQuery('')}>
                  <Text style={{ fontSize: 14, color: '#94A3B8' }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Subcategory Filter Pills */}
          {subcategoryTabs.length > 1 && (
            <View style={styles.salonSelectSection}>
              <Text style={styles.salonSelectHeading}>Select category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.salonCatScroll}>
                {subcategoryTabs.map((subName) => {
                  const isActive = selectedSubcategoryFilter === subName;
                  const label = subName === 'all' ? 'All Services' : subName;
                  return (
                    <TouchableOpacity
                      key={subName}
                      style={[styles.salonCatTabCard, isActive && styles.salonCatTabCardActive]}
                      activeOpacity={0.8}
                      onPress={() => setSelectedSubcategoryFilter(subName)}
                    >
                      <View style={styles.salonCatIconBox}>
                        <Text style={[styles.salonCatStarIcon, isActive && { color: '#F04400' }]}>
                          {subName === 'all' ? '★' : meta.icon}
                        </Text>
                      </View>
                      <Text style={[styles.salonCatTabLabel, isActive && styles.salonCatTabLabelActive]} numberOfLines={2}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Hero Banner Card */}
          <View style={[styles.salonHeroBannerCard, { backgroundColor: meta.bannerBg }]}>
            <View style={[styles.salonHeroBannerLeft, { flex: 1 }]}>
              <View style={[styles.salonHeroBadgePill, { backgroundColor: '#F04400' }]}>
                <Text style={styles.salonHeroBadgeText}>{meta.bannerTag}</Text>
              </View>
              <Text style={styles.salonHeroBannerTitle}>{meta.bannerTitle}</Text>
              <Text style={styles.salonHeroBannerSubtitle}>{meta.bannerSub}</Text>
            </View>
          </View>

          {/* UC Assurance Strip */}
          <View style={styles.salonPromoRow}>
            <View style={styles.salonPromiseCard}>
              <View style={styles.salonPromiseHeader}>
                <Text style={styles.salonPromiseTitle}>Urban Company Assurance</Text>
                <View style={styles.salonQualityPill}>
                  <Text style={styles.salonQualityPillText}>VERIFIED</Text>
                </View>
              </View>
              <Text style={styles.salonPromiseItem}>✓ Background-verified master specialists</Text>
              <Text style={styles.salonPromiseItem}>✓ 30-Day service warranty & standardized pricing</Text>
              <Text style={styles.salonPromiseItem}>✓ Sealed single-use kit & post-service cleanup</Text>
            </View>
          </View>

          {/* Services List by Subcategory */}
          <View style={styles.salonCatalogueContainer}>
            {Object.keys(subcategoryGroups).length === 0 ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>🔍</Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 4 }}>No services found</Text>
                <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center' }}>Try clearing your search query or choosing another category filter.</Text>
              </View>
            ) : (
              Object.keys(subcategoryGroups).map((subTitle, grpIdx) => (
                <View key={`grp-${subTitle}-${grpIdx}`} style={styles.salonSectionBlock}>
                  <View style={styles.salonSectionHeaderRow}>
                    <Text style={styles.salonSectionHeading}>{subTitle}</Text>
                    <Text style={styles.salonSectionCount}>{subcategoryGroups[subTitle].length} services</Text>
                  </View>

                  {subcategoryGroups[subTitle].map((srv, srvIdx) => {
                    const priceNum = typeof srv.price === 'number' ? `₹${srv.price}` : srv.price;
                    const origPriceNum = srv.originalPrice ? (typeof srv.originalPrice === 'number' ? `₹${srv.originalPrice}` : srv.originalPrice) : null;
                    const ratingNum = srv.rating || 4.85;
                    const reviewsNum = srv.reviewsCount || '100K+ reviews';
                    const inclusionsList = Array.isArray(srv.inclusions) ? srv.inclusions : [srv.description || 'Doorstep service with verified professional'];

                    return (
                      <TouchableOpacity
                        key={`srv-${srv.id || srvIdx}`}
                        style={styles.salonItemCard}
                        activeOpacity={0.88}
                        onPress={() => handleAddService(srv)}
                      >
                        <View style={styles.salonItemInfo}>
                          <Text style={styles.salonItemTitle}>{srv.title}</Text>
                          <View style={styles.salonItemRatingRow}>
                            <Text style={styles.salonItemStar}>★ {ratingNum}</Text>
                            <Text style={styles.salonItemReviews}>({reviewsNum})</Text>
                            {srv.duration && <Text style={[styles.salonItemReviews, { marginLeft: 6 }]}>• ⏱ {srv.duration}</Text>}
                          </View>
                          <View style={styles.salonItemPriceRow}>
                            <Text style={styles.salonItemPrice}>{priceNum}</Text>
                            {origPriceNum && <Text style={styles.salonItemOrigPrice}>{origPriceNum}</Text>}
                          </View>
                          <View style={styles.salonItemInclusions}>
                            {inclusionsList.slice(0, 3).map((inc, i) => (
                              <Text key={i} style={styles.salonInclusionText} numberOfLines={2}>• {inc}</Text>
                            ))}
                          </View>
                        </View>

                        <View style={styles.salonItemActionCol}>
                          {srv.image && (
                            <View style={{ width: 72, height: 72, borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
                              <SafeImage source={srv.image} item={srv} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                            </View>
                          )}
                          <TouchableOpacity
                            style={styles.salonItemAddBtn}
                            activeOpacity={0.8}
                            onPress={() => {
                              setCartCount((prev) => prev + 1);
                              Alert.alert('Added to Cart 🎉', `"${srv.title}" added to your cart!`);
                            }}
                          >
                            <Text style={styles.salonItemAddBtnText}>Add +</Text>
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))
            )}
          </View>

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* Sticky Floating View Cart Bottom Bar */}
        <View style={styles.salonStickyCartBar}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
              <Text style={styles.salonCartPriceMain}>₹{cartCount ? cartCount * 499 : 499}</Text>
              <Text style={styles.salonCartPriceOrig}>₹{cartCount ? cartCount * 799 : 799}</Text>
            </View>
            <Text style={styles.salonCartItemsLabel}>{cartCount || 1} service in cart</Text>
          </View>

          <TouchableOpacity
            style={styles.salonViewCartBtn}
            activeOpacity={0.85}
            onPress={() => Alert.alert('Cart & Checkout', 'Proceeding to checkout with verified Urban Company professional!')}
          >
            <Text style={styles.salonViewCartBtnText}>View Cart  ›</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaProvider style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: '#FFFFFF' }]}>
          <ExpoStatusBar style="dark" />
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <LoginAuthModal
            visible={!isAuthenticated}
            onSuccess={handleLoginSuccess}
            initialRole="customer"
          />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (currentUser?.role === 'partner') {
    return (
      <SafeAreaProvider style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: '#FFFFFF' }]}>
          <ExpoStatusBar style="dark" />
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <WorkingPartnerDashboard
            currentUser={currentUser}
            onLogout={handleLogout}
            onSwitchToCustomer={() => {
              setCurrentUser((prev) => ({ ...prev, role: 'customer' }));
              setShowTrackingModal(true);
            }}
            sharedReviews={partnerReviews}
            sharedBooking={activeCustomerBooking}
            sharedLeads={partnerLeads}
            onAcceptLead={(leadId) => {
              setPartnerLeads((prev) => prev.filter((l) => l.id !== leadId));
            }}
            onAddReviewReply={(revId, replyText) => {
              setPartnerReviews((prev) =>
                prev.map((r) => (r.id === revId ? { ...r, reply: replyText } : r))
              );
            }}
            onUpdateJobStage={(stage) => {
              setActiveCustomerBooking((prev) => ({ ...prev, stage }));
            }}
            onSyncJob={(updatedJob) => {
              setActiveCustomerBooking((prev) => ({
                ...prev,
                id: (updatedJob.id || prev.id || '9410').replace('JOB-', '').replace('UC-', ''),
                service: updatedJob.service || prev.service,
                price: updatedJob.payout || prev.price,
                customer: updatedJob.customer || prev.customer,
                address: updatedJob.address || prev.address,
                phone: updatedJob.phone || prev.phone,
                otp: updatedJob.otp || prev.otp || '4829',
                stage: updatedJob.stage || prev.stage,
                status: updatedJob.status || prev.status,
                prePhoto: updatedJob.prePhoto || prev.prePhoto,
                postPhoto: updatedJob.postPhoto || prev.postPhoto
              }));
            }}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: '#FFFFFF' }]}>
      <ExpoStatusBar style="dark" />
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      {/* 1. TOP HEADER: Clean Urban Company Premium White Header */}
      {currentScreen === 'home' && (
        <View style={styles.ucCleanHeader}>
          {/* Top Brand & Location Bar */}
          <View style={styles.ucHeaderTopBar}>
            <View style={styles.ucBrandAndLocation}>
              <View style={styles.ucBrandLogoBadge}>
                <Text style={styles.ucBrandLogoText}>UC</Text>
              </View>
              <View style={styles.ucLocationContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.ucLocationTitleRow}
                  onPress={() => Alert.alert('Select Location', 'Current Location: Chennai Central - Tamil Nadu\nSaved: Flat 302, Green Park, Rayakottai Rd, Krishnagiri')}
                >
                  <Text style={styles.ucLocationPin}>📍</Text>
                  <Text style={styles.ucLocationName} numberOfLines={1}>Chennai Central - Tamil Nadu</Text>
                  <Text style={styles.ucLocationArrow}>▾</Text>
                </TouchableOpacity>
                <Text style={styles.ucLocationSub} numberOfLines={1}>Flat 302, Green Park, Rayakottai Rd</Text>
              </View>
            </View>

            {/* Right Action Icons: Coins, Cart & Profile */}
            <View style={styles.ucHeaderActionsRow}>
              <TouchableOpacity
                style={styles.ucCoinsPill}
                activeOpacity={0.8}
                onPress={() => handleTabChange('offers')}
              >
                <Text style={styles.ucCoinsIcon}>🪙</Text>
                <Text style={styles.ucCoinsText}>{coinsBalance}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.ucCartButton}
                activeOpacity={0.8}
                onPress={() => Alert.alert('Cart', `${cartCount || 1} item in cart.`)}
              >
                <Text style={styles.ucCartIcon}>🛒</Text>
                <View style={styles.ucCartBadge}>
                  <Text style={styles.ucCartBadgeText}>{cartCount || 1}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.ucProfileAvatarBtn}
                activeOpacity={0.8}
                onPress={() => handleTabChange('profile')}
              >
                <Text style={styles.ucProfileAvatarText}>
                  {(currentUser?.name || 'Rahul').charAt(0).toUpperCase()}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.ucSearchBarContainer}>
            <Text style={styles.ucSearchIcon}>🔍</Text>
            <TextInput
              style={styles.ucSearchInput}
              placeholder="Search for 'AC service', 'cleaning', 'salon'..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.ucClearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Search Suggestion Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.ucQuickChipsScroll}
          >
            {['AC Service', 'Deep Cleaning', 'Salon for Women', "Men's Haircut", 'Water Purifier', 'Electrician', 'Plumber'].map((chip, idx) => (
              <TouchableOpacity
                key={`chip-${idx}`}
                style={[
                  styles.ucQuickChip,
                  searchQuery.toLowerCase().includes(chip.toLowerCase()) && styles.ucQuickChipActive
                ]}
                onPress={() => setSearchQuery(chip)}
              >
                <Text
                  style={[
                    styles.ucQuickChipText,
                    searchQuery.toLowerCase().includes(chip.toLowerCase()) && styles.ucQuickChipTextActive
                  ]}
                >
                  {chip}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* DYNAMIC CONTENT SWITCHER: SEARCH RESULTS OR ACTIVE BOTTOM TAB */}
      <View style={styles.tabContentWrapper}>
        {currentScreen === 'native-purifier' ? (
          renderNativePurifierScreen()
        ) : currentScreen === 'native-locks' ? (
          renderNativeLocksScreen()
        ) : currentScreen === 'salon-prime' ? (
          renderSalonPrimeScreen()
        ) : currentScreen === 'category-detail' ? (
          renderCategoryDetailScreen()
        ) : searchQuery.trim().length > 0 ? (
          renderSearchResultsView()
        ) : (
          <>
            {(activeTab === 'homes' || activeTab === 'uc') && renderHomeContent()}
            {activeTab === 'categories' && renderCategoriesView()}
            {activeTab === 'bookings' && renderMyBookingsView()}
            {(activeTab === 'offers' || activeTab === 'rewards') && renderRewardsView()}
            {activeTab === 'profile' && renderProfileView()}
            {activeTab === 'native' && renderNativeView()}
            {activeTab === 'beauty' && renderBeautyView()}
          </>
        )}
      </View>

      {/* 21. BOTTOM NAVIGATION BAR (5 SECTIONS: HOME, CATEGORIES, MY BOOKINGS, OFFERS, PROFILE) */}
      {currentScreen === 'home' && (
        <View style={styles.bottomNavContainer}>
          <TouchableOpacity
            style={styles.bottomNavItem}
            onPress={() => handleTabChange('homes')}
            activeOpacity={0.7}
          >
            {(activeTab === 'homes' || activeTab === 'uc') && <View style={styles.bottomActiveIndicator} />}
            <Text style={[styles.bottomNavIcon, (activeTab === 'homes' || activeTab === 'uc') && styles.bottomNavActiveIcon]}>🏠</Text>
            <Text style={[styles.bottomNavText, (activeTab === 'homes' || activeTab === 'uc') && styles.bottomNavActiveText]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomNavItem}
            onPress={() => handleTabChange('categories')}
            activeOpacity={0.7}
          >
            {activeTab === 'categories' && <View style={styles.bottomActiveIndicator} />}
            <Text style={[styles.bottomNavIcon, activeTab === 'categories' && styles.bottomNavActiveIcon]}>🗂️</Text>
            <Text style={[styles.bottomNavText, activeTab === 'categories' && styles.bottomNavActiveText]}>Categories</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomNavItem}
            onPress={() => handleTabChange('bookings')}
            activeOpacity={0.7}
          >
            {activeTab === 'bookings' && <View style={styles.bottomActiveIndicator} />}
            <View style={{ position: 'relative' }}>
              <Text style={[styles.bottomNavIcon, activeTab === 'bookings' && styles.bottomNavActiveIcon]}>📋</Text>
              <View style={styles.bottomBookingBadge}>
                <Text style={styles.bottomBookingBadgeText}>1</Text>
              </View>
            </View>
            <Text style={[styles.bottomNavText, activeTab === 'bookings' && styles.bottomNavActiveText]}>Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomNavItem}
            onPress={() => handleTabChange('offers')}
            activeOpacity={0.7}
          >
            {(activeTab === 'offers' || activeTab === 'rewards') && <View style={styles.bottomActiveIndicator} />}
            <View style={{ position: 'relative' }}>
              <Text style={[styles.bottomNavIcon, (activeTab === 'offers' || activeTab === 'rewards') && styles.bottomNavActiveIcon]}>🏷️</Text>
              <View style={styles.rewardsBadgeDot} />
            </View>
            <Text style={[styles.bottomNavText, (activeTab === 'offers' || activeTab === 'rewards') && styles.bottomNavActiveText]}>Offers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomNavItem}
            onPress={() => handleTabChange('profile')}
            activeOpacity={0.7}
          >
            {activeTab === 'profile' && <View style={styles.bottomActiveIndicator} />}
            <Text style={[styles.bottomNavIcon, activeTab === 'profile' && styles.bottomNavActiveIcon]}>👤</Text>
            <Text style={[styles.bottomNavText, activeTab === 'profile' && styles.bottomNavActiveText]}>Profile</Text>
          </TouchableOpacity>
        </View>
      )}

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
                <SafeImage
                  source={resolveServiceImage(selectedService)}
                  item={selectedService}
                  style={styles.richModalImage}
                  resizeMode="cover"
                />

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
              {ALL_SERVICES_GROUPS.map((group, grpIdx) => (
                <View key={`grp-${group.id}-${grpIdx}`} style={styles.allServicesGroup}>
                  <Text style={styles.allServicesGroupTitle}>{group.title}</Text>

                  <View style={styles.allServicesItemsGrid}>
                    {group.items.map((item, itmIdx) => (
                      <TouchableOpacity
                        key={`grpitem-${item.id}-${itmIdx}`}
                        style={styles.allServicesGridItem}
                        activeOpacity={0.78}
                        onPress={() => {
                          setShowAllServicesModal(false);
                          const itemName = (item.name || '').toLowerCase();
                          const grpTitle = (group.title || '').toLowerCase();

                          if (grpTitle.includes("women") || itemName.includes("salon for women") || itemName.includes("hair studio")) {
                            if (itemName.includes("hair studio")) {
                              setSalonCategoryTab('hair-care');
                            } else {
                              setSalonCategoryTab('all');
                            }
                            setSalonSearch('');
                            setCurrentScreen('salon-prime');
                          } else if (grpTitle.includes("men") || itemName.includes("men") || itemName.includes("beard")) {
                            openCategoryScreen('mens-salon', itemName.includes('beard') ? 'Hair & Beard' : 'all');
                          } else if (grpTitle.includes("cleaning") || itemName.includes("clean") || itemName.includes("cockroach") || itemName.includes("termite") || itemName.includes("bug")) {
                            const sub = itemName.includes("bathroom") ? "Bathroom Cleaning" :
                                        itemName.includes("kitchen") ? "Kitchen Cleaning" :
                                        (itemName.includes("cockroach") || itemName.includes("termite") || itemName.includes("bug")) ? "Pest Control" :
                                        itemName.includes("sofa") ? "Sofa & Carpet" : "Full Home Cleaning";
                            openCategoryScreen('cleaning-pest', sub);
                          } else if (grpTitle.includes("appliance") || itemName.includes("ac") || itemName.includes("washer") || itemName.includes("fridge") || itemName.includes("chimney") || itemName.includes("microwave") || itemName.includes("tv") || itemName.includes("laptop")) {
                            const sub = itemName.includes("ac") ? "AC Service & Repair" :
                                        itemName.includes("washer") ? "Washing Machine" :
                                        itemName.includes("fridge") ? "Refrigerator" :
                                        itemName.includes("chimney") ? "Chimney" :
                                        itemName.includes("microwave") ? "Microwave" :
                                        itemName.includes("tv") ? "Television" :
                                        itemName.includes("laptop") ? "Laptop" : "all";
                            openCategoryScreen('ac-appliances', sub);
                          } else if (grpTitle.includes("repair") || itemName.includes("electrician") || itemName.includes("plumber") || itemName.includes("carpenter") || itemName.includes("furniture") || itemName.includes("fan")) {
                            const sub = itemName.includes("electrician") || itemName.includes("fan") || itemName.includes("light") ? "Electrician" :
                                        itemName.includes("plumber") ? "Plumber" : "Carpenter";
                            openCategoryScreen('quick-repairs', sub);
                          } else if (grpTitle.includes("painting") || itemName.includes("paint") || itemName.includes("waterproof")) {
                            openCategoryScreen('painting-decor', itemName.includes("waterproof") ? "Waterproofing" : "Full Home Painting");
                          } else if (itemName.includes("purifier") || itemName.includes("water purifier")) {
                            openCategoryScreen('native-ro', 'Water Purifier');
                          } else {
                            openCategoryScreen('ac-appliances', 'all');
                          }
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

      {/* 24. APPLIANCE REPAIR & SERVICE MODAL (Matches user screenshot 1) */}
      <Modal
        visible={showApplianceModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowApplianceModal(false)}
      >
        <TouchableOpacity
          style={styles.applianceModalOverlay}
          activeOpacity={1}
          onPress={() => setShowApplianceModal(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.applianceModalCard}>
              <View style={styles.applianceModalHeader}>
                <Text style={styles.applianceModalTitle}>Appliance Repair & Service</Text>
                <TouchableOpacity
                  style={styles.applianceModalCloseBtn}
                  onPress={() => setShowApplianceModal(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.applianceModalCloseX}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.applianceGrid3x3}>
                {APPLIANCE_REPAIR_ITEMS.map((item, idx) => (
                  <TouchableOpacity
                    key={`app-tile-${item.id}-${idx}`}
                    style={styles.applianceTile}
                    activeOpacity={0.75}
                    onPress={() => {
                      setShowApplianceModal(false);
                      const sub = item.name.toLowerCase().includes('ac') ? 'AC Service & Repair' :
                                  item.name.toLowerCase().includes('washer') || item.name.toLowerCase().includes('washing') ? 'Washing Machine' :
                                  item.name.toLowerCase().includes('refrigerator') || item.name.toLowerCase().includes('fridge') ? 'Refrigerator' :
                                  item.name.toLowerCase().includes('chimney') ? 'Chimney' :
                                  item.name.toLowerCase().includes('microwave') ? 'Microwave' :
                                  item.name.toLowerCase().includes('television') || item.name.toLowerCase().includes('tv') ? 'Television' :
                                  item.name.toLowerCase().includes('laptop') ? 'Laptop' :
                                  item.name.toLowerCase().includes('geyser') ? 'Geyser' : 'all';
                      openCategoryScreen('ac-appliances', sub);
                    }}
                  >
                    <View style={styles.applianceTileBox}>
                      <SafeImage source={item.image} item={item} style={styles.applianceTileImg} resizeMode="contain" />
                    </View>
                    <Text style={styles.applianceTileName} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* 25. ELECTRICIAN, PLUMBER & CARPENTERS MODAL (Matches user screenshot 2) */}
      <Modal
        visible={showEPCModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowEPCModal(false)}
      >
        <TouchableOpacity
          style={styles.applianceModalOverlay}
          activeOpacity={1}
          onPress={() => setShowEPCModal(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.epcModalCard}>
              <View style={styles.applianceModalHeader}>
                <Text style={styles.applianceModalTitle}>Electrician, Plumber & Carpenters</Text>
                <TouchableOpacity
                  style={styles.applianceModalCloseBtn}
                  onPress={() => setShowEPCModal(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.applianceModalCloseX}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.epcRow}>
                {EPC_ITEMS.map((item, idx) => (
                  <TouchableOpacity
                    key={`epc-tile-${item.id}-${idx}`}
                    style={styles.epcItem}
                    activeOpacity={0.75}
                    onPress={() => {
                      setShowEPCModal(false);
                      const sub = item.name.toLowerCase().includes('plumb') ? 'Plumber' :
                                  item.name.toLowerCase().includes('carpent') ? 'Carpenter' : 'Electrician';
                      openCategoryScreen('quick-repairs', sub);
                    }}
                  >
                    <View style={styles.epcIconBox}>
                      <SafeImage source={item.image} item={item} style={styles.epcIconImg} resizeMode="contain" />
                      {item.badge && (
                        <View style={styles.epcArrivalBadge}>
                          <Text style={styles.epcArrivalBadgeText}>{item.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.epcLabel}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Guarantee Banner */}
              <View style={styles.ucGuaranteeBanner}>
                <Text style={styles.ucGuaranteeShield}>🛡️</Text>
                <Text style={styles.ucGuaranteeText}>
                  <Text style={{ fontWeight: '700' }}>Urban Company Guarantee:</Text> 30-day service warranty, verified background-checked pros & upfront transparent pricing.
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* 26. BATHROOM & KITCHEN CLEANING MODAL (Matches user screenshot 3) */}
      <Modal
        visible={showBathroomKitchenModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowBathroomKitchenModal(false)}
      >
        <TouchableOpacity
          style={styles.applianceModalOverlay}
          activeOpacity={1}
          onPress={() => setShowBathroomKitchenModal(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.bkModalCard}>
              <View style={styles.bkModalHeader}>
                <Text style={styles.bkModalTitle}>Bathroom & Kitchen cleaning</Text>
                <TouchableOpacity
                  style={styles.applianceModalCloseBtn}
                  onPress={() => setShowBathroomKitchenModal(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.applianceModalCloseX}>✕</Text>
                </TouchableOpacity>
              </View>

              {BATHROOM_KITCHEN_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={styles.bkOptionCard}
                  activeOpacity={0.8}
                  onPress={() => {
                    setShowBathroomKitchenModal(false);
                    const sub = opt.title.toLowerCase().includes('kitchen') ? 'Kitchen Cleaning' : 'Bathroom Cleaning';
                    openCategoryScreen('cleaning-pest', sub);
                  }}
                >
                  <SafeImage source={opt.image} item={opt} style={styles.bkOptionImg} resizeMode="cover" />
                  <View style={styles.bkOptionTextCol}>
                    <Text style={styles.bkOptionTitle}>{opt.title}</Text>
                    <Text style={styles.bkOptionSub}>{opt.subtitle}</Text>
                    <Text style={styles.bkOptionPrice}>{opt.price}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* 27. CLEANING MODAL (Matches user screenshot 4) */}
      <Modal
        visible={showCleaningModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCleaningModal(false)}
      >
        <TouchableOpacity
          style={styles.applianceModalOverlay}
          activeOpacity={1}
          onPress={() => setShowCleaningModal(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.bkModalCard}>
              <View style={styles.bkModalHeader}>
                <Text style={styles.bkModalTitle}>Cleaning</Text>
                <TouchableOpacity
                  style={styles.applianceModalCloseBtn}
                  onPress={() => setShowCleaningModal(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.applianceModalCloseX}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cleaningGridRow}>
                {CLEANING_OPTIONS.map((opt, idx) => (
                  <TouchableOpacity
                    key={`clean-opt-${opt.id}-${idx}`}
                    style={styles.cleaningGridItem}
                    activeOpacity={0.8}
                    onPress={() => {
                      setShowCleaningModal(false);
                      const sub = opt.name.toLowerCase().includes('bathroom') ? 'Bathroom Cleaning' :
                                  opt.name.toLowerCase().includes('kitchen') ? 'Kitchen Cleaning' :
                                  opt.name.toLowerCase().includes('sofa') ? 'Sofa & Carpet' :
                                  opt.name.toLowerCase().includes('cockroach') || opt.name.toLowerCase().includes('pest') ? 'Pest Control' :
                                  'Full Home Cleaning';
                      openCategoryScreen('cleaning-pest', sub);
                    }}
                  >
                    <View style={styles.cleaningIconBox}>
                      <SafeImage source={opt.image} item={opt} style={styles.cleaningIconImg} resizeMode="contain" />
                    </View>
                    <Text style={styles.cleaningGridTitle} numberOfLines={2}>
                      {opt.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* 28. HAIR STUDIO FOR WOMEN MODAL */}
      <Modal
        visible={showHairStudioModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHairStudioModal(false)}
      >
        <TouchableOpacity
          style={styles.applianceModalOverlay}
          activeOpacity={1}
          onPress={() => setShowHairStudioModal(false)}
        >
          <TouchableWithoutFeedback>
            <View style={[styles.bkModalCard, { maxHeight: '82%' }]}>
              <View style={styles.bkModalHeader}>
                <View>
                  <Text style={styles.bkModalTitle}>Hair Studio for Women</Text>
                  <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Haircuts, styling, spa & treatments</Text>
                </View>
                <TouchableOpacity
                  style={styles.applianceModalCloseBtn}
                  onPress={() => setShowHairStudioModal(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.applianceModalCloseX}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {BEAUTY_HAIR_STUDIO.map((item, idx) => (
                  <View key={`hs-modal-${item.id}-${idx}`} style={styles.salonItemCard}>
                    <View style={styles.salonItemInfo}>
                      <Text style={styles.salonItemTitle}>{item.title}</Text>
                      <View style={styles.salonItemRatingRow}>
                        <Text style={styles.salonItemStar}>★ {item.rating}</Text>
                        <Text style={styles.salonItemReviews}>· {item.duration}</Text>
                      </View>
                      <Text style={styles.salonItemPrice}>{item.price}</Text>
                    </View>
                    <View style={styles.salonItemActionCol}>
                      <View style={styles.salonItemThumbContainer}>
                        <SafeImage
                          source={item.image || resolveServiceImage(item)}
                          item={item}
                          style={styles.salonItemThumbImage}
                          resizeMode="cover"
                        />
                      </View>
                      <TouchableOpacity
                        style={styles.salonItemAddBtn}
                        activeOpacity={0.8}
                        onPress={() => {
                          setShowHairStudioModal(false);
                          handleAddService(item);
                        }}
                      >
                        <Text style={styles.salonItemAddBtnText}>Add +</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* 29. SALON FOR MEN & GROOMING MODAL */}
      <Modal
        visible={showSalonMenModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSalonMenModal(false)}
      >
        <TouchableOpacity
          style={styles.applianceModalOverlay}
          activeOpacity={1}
          onPress={() => setShowSalonMenModal(false)}
        >
          <TouchableWithoutFeedback>
            <View style={[styles.bkModalCard, { maxHeight: '82%' }]}>
              <View style={styles.bkModalHeader}>
                <View>
                  <Text style={styles.bkModalTitle}>Salon for Men & Grooming</Text>
                  <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Haircuts, beard grooming & facials</Text>
                </View>
                <TouchableOpacity
                  style={styles.applianceModalCloseBtn}
                  onPress={() => setShowSalonMenModal(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.applianceModalCloseX}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {BEAUTY_SALON_MEN.map((item, idx) => (
                  <View key={`sm-modal-${item.id}-${idx}`} style={styles.salonItemCard}>
                    <View style={styles.salonItemInfo}>
                      <Text style={styles.salonItemTitle}>{item.title}</Text>
                      <View style={styles.salonItemRatingRow}>
                        <Text style={styles.salonItemStar}>★ {item.rating}</Text>
                        <Text style={styles.salonItemReviews}>· {item.duration}</Text>
                      </View>
                      <Text style={styles.salonItemPrice}>{item.price}</Text>
                    </View>
                    <View style={styles.salonItemActionCol}>
                      <View style={styles.salonItemThumbContainer}>
                        <SafeImage
                          source={item.image || resolveServiceImage(item)}
                          item={item}
                          style={styles.salonItemThumbImage}
                          resizeMode="cover"
                        />
                      </View>
                      <TouchableOpacity
                        style={styles.salonItemAddBtn}
                        activeOpacity={0.8}
                        onPress={() => {
                          setShowSalonMenModal(false);
                          handleAddService(item);
                        }}
                      >
                        <Text style={styles.salonItemAddBtnText}>Add +</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* 23. CUSTOMER PROFILE & LOGOUT MODAL */}
      <Modal
        visible={showProfileMenuModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowProfileMenuModal(false)}
      >
        <TouchableOpacity
          style={styles.profileMenuOverlay}
          activeOpacity={1}
          onPress={() => setShowProfileMenuModal(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.profileMenuCard}>
              {/* Profile Card Header */}
              <View style={styles.profileMenuHeader}>
                <View style={styles.profileMenuAvatarCircle}>
                  <Text style={styles.profileMenuAvatarText}>
                    {(currentUser?.name || 'R').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.profileMenuName}>
                    {currentUser?.name || 'Rahul Sharma'}
                  </Text>
                  <Text style={styles.profileMenuEmail}>
                    {currentUser?.email || 'customer@forgeindia.in'}
                  </Text>
                  <View style={styles.profileRoleBadge}>
                    <Text style={styles.profileRoleBadgeText}>
                      👤 Customer Account
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setShowProfileMenuModal(false)}
                  style={styles.profileMenuCloseBtn}
                >
                  <Text style={styles.profileMenuCloseX}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.profileMenuDivider} />

              {/* Action Buttons */}
              <View style={styles.profileMenuActions}>
                <TouchableOpacity
                  style={[styles.profileLogoutBtn, { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10 }]}
                  activeOpacity={0.85}
                  onPress={() => {
                    setShowProfileMenuModal(false);
                    setCurrentUser((prev) => ({
                      ...(prev || {}),
                      name: 'Vikram Salvi',
                      email: 'partner@forgeindia.in',
                      role: 'partner'
                    }));
                  }}
                >
                  <Text style={[styles.profileLogoutText, { color: '#0284C7' }]}>
                    ⚡ Switch to Worker Portal
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.profileLogoutBtn}
                  activeOpacity={0.85}
                  onPress={() => {
                    setShowProfileMenuModal(false);
                    handleLogout();
                  }}
                >
                  <Text style={styles.profileLogoutText}>
                    🚪 Logout
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.profileCancelBtn}
                  onPress={() => setShowProfileMenuModal(false)}
                >
                  <Text style={styles.profileCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* 23. LIVE ORDER TRACKING & REVIEW MODAL (CUSTOMER WORKFLOW) */}
      <CustomerOrderTrackingModal
        visible={showTrackingModal}
        onClose={() => setShowTrackingModal(false)}
        booking={activeCustomerBooking}
        onReviewSubmitted={(newReview) => {
          setPartnerReviews((prev) => [newReview, ...prev]);
        }}
        onUpdateStage={(newStage) => {
          setActiveCustomerBooking((prev) => ({ ...prev, stage: newStage }));
        }}
      />

      {/* 24. FULL MULTI-STEP BOOKING, SLOT & PAYMENT FLOW MODAL */}
      <BookingCheckoutFlowModal
        visible={showCheckoutFlow}
        onClose={() => {
          setShowCheckoutFlow(false);
          setCheckoutService(null);
        }}
        service={checkoutService}
        currentUser={currentUser}
        onBookingSuccess={(bookingDetails) => {
          setCartCount((prev) => prev + 1);
          setCoinsBalance((prev) => prev + 50);

          const newLeadId = `LEAD-${bookingDetails.id || Math.floor(1000 + Math.random() * 9000)}`;
          const freshLead = {
            id: newLeadId,
            bookingId: bookingDetails.id || '9410',
            service: bookingDetails.serviceName || checkoutService?.title || checkoutService?.name || 'All in All AC',
            customer: currentUser?.name || 'Rahul Sharma',
            address: bookingDetails.address || 'Flat 302, Green Park, Rayakottai Road, Krishnagiri - 635122',
            distance: '0.4 km away',
            payout: bookingDetails.price || 3524,
            slot: bookingDetails.slot || 'Today, Express Doorstep',
            phone: currentUser?.phone || '+91 98200 12345',
            tag: '🔥 NEW LIVE BOOKING (JUST NOW)',
            paymentMode: bookingDetails.paymentMode || 'UPI',
            otp: bookingDetails.otp || '4829'
          };

          // Prepend to partner leads so worker dashboard immediately has it in Hot Leads & Queue!
          setPartnerLeads((prev) => [freshLead, ...prev.filter((l) => l.id !== newLeadId)]);

          setActiveCustomerBooking((prev) => ({
            ...prev,
            id: bookingDetails.id || '9410',
            service: freshLead.service,
            price: freshLead.payout,
            slot: freshLead.slot,
            address: freshLead.address,
            customer: freshLead.customer,
            phone: freshLead.phone,
            otp: freshLead.otp,
            stage: 2 // Specialist Assigned / Pending pickup
          }));
          setShowCheckoutFlow(false);
          setCheckoutService(null);
          // Auto launch live map tracking modal for customer
          setTimeout(() => {
            setShowTrackingModal(true);
          }, 350);
        }}
      />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    maxWidth: Platform.OS === 'web' ? 440 : undefined,
    width: '100%',
    alignSelf: 'center',
  },
  tabContentWrapper: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  // 1. TOP PURPLE BANNER HEADER (Now 60% Fiery Orange #F04400)
  topPurpleHeader: {
    backgroundColor: '#F04400',
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
    color: '#FFD91A',
    fontWeight: '600',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#FFD91A',
  },
  profileAvatarButton: {
    padding: 2,
  },
  profileInnerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1.5,
    borderColor: '#FFD91A',
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
    color: '#F04400',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: 14,
    color: '#94A3B8',
    padding: 6,
  },

  // 2. FESTIVE CAROUSEL BANNER (60% Fiery Orange + 30% Sunshine Yellow)
  festiveContainer: {
    backgroundColor: '#D03800',
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
    color: '#FFD91A',
    letterSpacing: 2.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  festiveCardsScroll: {
    paddingBottom: 4,
  },
  festiveCard: {
    width: 130,
    height: 150,
    backgroundColor: '#F04400',
    borderRadius: 10,
    marginRight: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FFD91A',
    position: 'relative',
  },
  festiveTag: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFD91A',
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
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  festiveCardTitle: {
    color: '#FFD91A',
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
    backgroundColor: '#D0F030',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#000000',
    zIndex: 10,
  },
  priceDropPillText: {
    color: '#000000',
    fontSize: 8,
    fontWeight: '900',
  },
  bottomPillBadge: {
    position: 'absolute',
    bottom: 3,
    backgroundColor: '#FFD91A',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  bottomPillBadgeText: {
    color: '#000000',
    fontSize: 8.5,
    fontWeight: '800',
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
    color: '#F04400',
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
    backgroundColor: '#D0F030',
    borderWidth: 1.2,
    borderColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addButtonText: {
    color: '#000000',
    fontSize: 12.5,
    fontWeight: '900',
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
    backgroundColor: '#FFD91A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  luxeBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '800',
  },
  serviceCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
    marginTop: 8,
    lineHeight: 17,
    minHeight: 34,
  },
  serviceRating: {
    fontSize: 10.5,
    color: '#475569',
    marginTop: 4,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 3,
  },
  servicePrice: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#F04400',
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
    backgroundColor: '#F04400',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#FFD91A',
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
    borderColor: '#FFD91A',
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
    backgroundColor: '#F04400',
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
    backgroundColor: '#F04400',
    padding: 22,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  rewardsHeaderSuper: {
    color: '#FFD91A',
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
    backgroundColor: '#FFF8D1',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FFD91A',
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
    color: '#F04400',
    textAlign: 'center',
  },
  scratchCardSub: {
    fontSize: 10,
    color: '#8A6D00',
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
    backgroundColor: '#D0F030',
    borderWidth: 1.2,
    borderColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  beautyAddBtnText: {
    color: '#000000',
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
    backgroundColor: '#F04400',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E03C00',
  },
  nativeHeaderTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  nativeHeaderSubtitle: {
    fontSize: 13.5,
    color: '#FFF8D1',
    fontWeight: '600',
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
    width: '48%',
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
    backgroundColor: '#D0F030',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    zIndex: 10,
  },
  nativeLookingForSaleText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  nativeLookingForArrivalBadge: {
    backgroundColor: '#FFD91A',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 5,
  },
  nativeLookingForArrivalText: {
    color: '#000000',
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
    backgroundColor: '#D0F030',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  nativeTileBadgeText: {
    color: '#000000',
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
    backgroundColor: '#F04400',
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

  // 21. BOTTOM NAVIGATION BAR (5 SECTIONS: HOMES, CATEGORIES, BOOKINGS, OFFERS, PROFILE)
  bottomNavContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    height: Platform.OS === 'ios' ? 76 : 62,
    paddingTop: 6,
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
    color: '#F04400',
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
    backgroundColor: '#F04400',
  },
  bottomNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: 48,
    position: 'relative',
  },
  bottomNavIcon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.45,
  },
  bottomNavActiveIcon: {
    opacity: 1,
    transform: [{ scale: 1.08 }],
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
    top: -6,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#0F172A',
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
    backgroundColor: '#F04400',
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
    color: '#F04400',
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
    backgroundColor: '#D0F030',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  richDiscountText: {
    color: '#000000',
    fontSize: 10.5,
    fontWeight: '800',
  },
  richPriceInclusiveText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 3,
  },
  richCoinRewardPill: {
    backgroundColor: '#FFD91A',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD91A',
  },
  richCoinRewardText: {
    color: '#000000',
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
    backgroundColor: '#D0F030',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  richCheckIcon: {
    color: '#000000',
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
    backgroundColor: '#FFD91A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  richStepNumberText: {
    color: '#000000',
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
    backgroundColor: '#FFF8D1',
    borderWidth: 1,
    borderColor: '#FFD91A',
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
    color: '#F04400',
    marginBottom: 2,
  },
  richAssuranceBody: {
    fontSize: 12,
    color: '#8A6D00',
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
    backgroundColor: '#F04400',
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
    color: '#F04400',
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
    color: '#F04400',
  },
  searchResultOrigPrice: {
    fontSize: 11.5,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  searchResultAddBtn: {
    backgroundColor: '#D0F030',
    borderWidth: 1.2,
    borderColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  searchResultAddBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
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
    backgroundColor: '#FFD91A',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 5,
  },
  beautyArrivalBadgeText: {
    color: '#000000',
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
    backgroundColor: '#FFD91A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 5,
  },
  nativeShowcaseBadgeText: {
    color: '#000000',
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
    backgroundColor: '#F04400',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeShowcasePrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  nativeShowcaseSecondaryBtn: {
    backgroundColor: '#D0F030',
    borderWidth: 1.5,
    borderColor: '#000000',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeShowcaseSecondaryBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },

  // ------------------------------------------
  // Category Modals (Appliance, EPC, Cleaning)
  // ------------------------------------------
  applianceModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  applianceModalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  applianceModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  applianceModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  applianceModalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applianceModalCloseX: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },
  applianceGrid3x3: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  applianceTile: {
    width: '31%',
    alignItems: 'center',
    marginBottom: 16,
  },
  applianceTileBox: {
    width: '100%',
    height: 76,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    marginBottom: 6,
  },
  applianceTileImg: {
    width: '85%',
    height: '85%',
  },
  applianceTileName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 14,
  },

  // EPC Modal
  epcModalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
  },
  epcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  epcItem: {
    width: '31%',
    alignItems: 'center',
  },
  epcIconBox: {
    width: '100%',
    height: 80,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 6,
  },
  epcIconImg: {
    width: 44,
    height: 44,
  },
  epcArrivalBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#FFD91A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  epcArrivalBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#000000',
  },
  epcLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 6,
  },
  ucGuaranteeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  ucGuaranteeShield: {
    fontSize: 18,
  },
  ucGuaranteeText: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
    flex: 1,
  },

  // Bathroom & Kitchen Modal
  bkModalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
  },
  bkModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bkModalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  bkOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  bkOptionImg: {
    width: 68,
    height: 68,
    borderRadius: 12,
  },
  bkOptionTextCol: {
    flex: 1,
  },
  bkOptionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  bkOptionSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
  },
  bkOptionPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },

  // Cleaning Modal
  cleaningGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cleaningGridItem: {
    flex: 1,
    alignItems: 'center',
  },
  cleaningIconBox: {
    width: '100%',
    height: 90,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cleaningIconImg: {
    width: 48,
    height: 48,
  },
  cleaningGridTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 16,
  },

  // ------------------------------------------
  // Native Purifier & Locks Dedicated Screens
  // ------------------------------------------
  detailHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E03C00',
    backgroundColor: '#F04400',
  },
  detailHeaderBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailHeaderBackArrow: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  detailHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cartIconWrapper: {
    position: 'relative',
    padding: 4,
  },
  cartIconText: {
    fontSize: 20,
  },
  cartCountBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#D0F030',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartCountBadgeText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '800',
  },
  npBannerSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  npMainTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  npSubtitleRating: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F04400',
    marginBottom: 12,
  },
  npViewServicesBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#F04400',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  npViewServicesText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  npModelsContainer: {
    padding: 16,
  },
  npModelsHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  npModelCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    justifyContent: 'space-between',
  },
  npModelDetails: {
    flex: 1,
    marginRight: 10,
  },
  npModelName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  npModelRating: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 6,
  },
  npModelPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  npModelLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F04400',
  },
  npModelImgCol: {
    alignItems: 'center',
    width: 110,
  },
  npOfferTag: {
    backgroundColor: '#FFD91A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  npOfferTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#000000',
  },
  npModelImg: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 6,
  },
  npAddBtn: {
    width: '100%',
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#000000',
    alignItems: 'center',
    backgroundColor: '#D0F030',
  },
  npAddBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },
  npAddSubtext: {
    fontSize: 9,
    color: '#64748B',
  },
  npPromiseCard: {
    marginHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    gap: 6,
  },
  npPromiseTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  npPromiseLine: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  npStickyCartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  npStickyCartItems: {
    fontSize: 12,
    color: '#64748B',
  },
  npStickyCartPrice: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  npCheckoutBtn: {
    backgroundColor: '#F04400',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  npCheckoutBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  locksVideoCard: {
    marginHorizontal: 16,
    height: 200,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
    marginBottom: 16,
  },
  locksVideoImg: {
    width: '100%',
    height: '100%',
  },
  locksPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locksPlayIcon: {
    fontSize: 18,
    color: '#0F172A',
    marginLeft: 3,
  },

  // Beauty Clean Top Header Styles matching Screenshot 1
  beautyTopHeaderClean: {
    backgroundColor: '#F04400',
    borderBottomWidth: 1,
    borderBottomColor: '#E03C00',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 10,
    paddingBottom: 12,
  },
  beautyBrandTabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  beautyBrandLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  beautyBrandBadge: {
    backgroundColor: '#000000',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  beautyBrandBadgeText: {
    color: '#D0F030',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  beautyBrandName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  beautyHeaderTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  beautyHeaderTab: {
    paddingVertical: 4,
    position: 'relative',
  },
  beautyHeaderTabActive: {},
  beautyHeaderTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  beautyHeaderTabActiveText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFD91A',
  },
  beautyHeaderActiveUnderline: {
    position: 'absolute',
    bottom: -2,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: '#FFD91A',
    borderRadius: 2,
  },
  beautyHeaderActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  beautyLocationChip: {
    backgroundColor: '#FFD91A',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    maxWidth: '38%',
  },
  beautyLocationChipText: {
    fontSize: 11,
    color: '#000000',
    fontWeight: '800',
  },
  beautySearchBarBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 36,
    overflow: 'hidden',
    flexShrink: 1,
  },
  beautySearchInput: {
    flex: 1,
    fontSize: 11.5,
    color: '#0F172A',
    paddingVertical: 0,
    overflow: 'hidden',
    minWidth: 0,
  },
  beautyAvatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFD91A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  beautyAvatarText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
  beautyMosaicGrid2x2: {
    marginBottom: 8,
  },

  // Salon Prime Screen Styles matching Screenshot 2
  salonPrimeHeader: {
    backgroundColor: '#F04400',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E03C00',
  },
  salonPrimeHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  salonPrimeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  salonPrimeRatingSub: {
    fontSize: 12,
    color: '#FFF8D1',
    fontWeight: '600',
    marginTop: 2,
  },
  salonPrimeSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  salonPrimeLocationChip: {
    backgroundColor: '#FFD91A',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    maxWidth: '45%',
  },
  salonPrimeLocationText: {
    fontSize: 11,
    color: '#000000',
    fontWeight: '800',
  },
  salonPrimeSearchInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
  },
  salonPrimeSearchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
    paddingVertical: 0,
  },

  // Select a service Horizontal Tabs
  salonSelectSection: {
    backgroundColor: '#FFFFFF',
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  salonSelectHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginLeft: 16,
    marginBottom: 10,
  },
  salonCatScroll: {
    paddingHorizontal: 12,
    gap: 10,
  },
  salonCatTabCard: {
    width: 92,
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  salonCatTabCardActive: {
    borderColor: '#F04400',
    backgroundColor: '#FFF8D1',
  },
  salonCatIconBox: {
    width: 52,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  salonCatTabImg: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  salonCatStarIcon: {
    fontSize: 26,
    color: '#FFD91A',
  },
  salonDiscountPillBox: {
    backgroundColor: '#FFF8D1',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  salonDiscountPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
    textAlign: 'center',
  },
  salonCatNewBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#D0F030',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  salonCatNewBadgeText: {
    color: '#000000',
    fontSize: 8,
    fontWeight: '800',
  },
  salonCatTabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    lineHeight: 14,
  },
  salonCatTabLabelActive: {
    color: '#F04400',
    fontWeight: '800',
  },

  // Hero Carousel Card
  salonHeroBannerCard: {
    margin: 16,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  salonHeroBannerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  salonHeroBadgePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  salonHeroBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  salonHeroBannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  salonHeroBannerSubtitle: {
    fontSize: 12,
    color: '#E2E8F0',
    lineHeight: 16,
    marginBottom: 12,
  },
  salonHeroArrowsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  salonHeroArrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  salonHeroArrowText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  salonHeroPaginationText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '600',
  },
  salonHeroBannerRight: {
    width: 115,
    height: 115,
    borderRadius: 14,
    overflow: 'hidden',
  },
  salonHeroBannerImg: {
    width: '100%',
    height: '100%',
  },

  // Promo Row
  salonPromoRow: {
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  salonOfferCard: {
    backgroundColor: '#FFFDEB',
    borderWidth: 1,
    borderColor: '#FFD91A',
    borderRadius: 12,
    padding: 12,
  },
  salonOfferBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  salonOfferPercentIcon: {
    backgroundColor: '#FFD91A',
    color: '#000000',
    fontWeight: '800',
    fontSize: 11,
    width: 18,
    height: 18,
    borderRadius: 9,
    textAlign: 'center',
    lineHeight: 18,
  },
  salonOfferTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8A6D00',
  },
  salonOfferSub: {
    fontSize: 11,
    color: '#A16207',
    marginLeft: 24,
  },

  // Promise Card
  salonPromiseCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
  },
  salonPromiseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  salonPromiseTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  salonQualityPill: {
    backgroundColor: '#D0F030',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  salonQualityPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#000000',
  },
  salonPromiseItem: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
    marginBottom: 4,
  },

  // Services Catalogue
  salonCatalogueContainer: {
    paddingHorizontal: 16,
  },
  salonSectionBlock: {
    marginBottom: 20,
  },
  salonSectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  salonSectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  salonSectionCount: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  salonItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  salonItemInfo: {
    flex: 1,
    paddingRight: 10,
  },
  salonItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  salonItemRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  salonItemStar: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFD91A',
  },
  salonItemReviews: {
    fontSize: 11,
    color: '#64748B',
  },
  salonItemPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 6,
  },
  salonItemPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F04400',
  },
  salonItemOrigPrice: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  salonItemInclusions: {
    marginTop: 4,
    gap: 2,
  },
  salonInclusionText: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 15,
  },
  salonItemActionCol: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    minWidth: 88,
  },
  salonItemThumbContainer: {
    width: 84,
    height: 84,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  salonItemThumbImage: {
    width: '100%',
    height: '100%',
  },
  salonItemAddBtn: {
    backgroundColor: '#D0F030',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  salonItemAddBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },

  // Sticky Cart Bottom Bar
  salonStickyCartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  salonCartPriceMain: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  salonCartPriceOrig: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  salonCartItemsLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  salonViewCartBtn: {
    backgroundColor: '#F04400',
    borderRadius: 10,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  salonViewCartBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // Customer Profile & Logout Popup Modal Styles
  profileMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileMenuCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  profileMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileMenuAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFD91A',
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileMenuAvatarText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: '900',
  },
  profileMenuName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  profileMenuEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  profileRoleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  profileRoleBadgeText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },
  profileMenuCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileMenuCloseX: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '800',
  },
  profileMenuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  profileMenuActions: {
    gap: 10,
  },
  profileSwitchPartnerBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  profileSwitchPartnerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  profileLogoutBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  profileLogoutText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  profileCancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  profileCancelText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },

  // Customer Live Order Tracking Banner
  customerTrackingBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#F04400',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  trackingBannerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  trackingBannerIcon: {
    fontSize: 22,
  },
  trackingBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  trackingLivePill: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trackingLivePillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  trackingBannerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  trackingBannerAction: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  trackingBannerActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },

  // URBAN COMPANY PREMIUM WHITE REDESIGN STYLES
  ucCleanHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: Platform.OS === 'android' ? 36 : 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  ucHeaderTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ucBrandAndLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  ucBrandLogoBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  ucBrandLogoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  ucLocationContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  ucLocationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ucLocationPin: {
    fontSize: 13,
    marginRight: 3,
  },
  ucLocationName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    flexShrink: 1,
    maxWidth: 135,
  },
  ucLocationArrow: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 3,
  },
  ucLocationSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  ucHeaderActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 2,
  },
  ucCoinsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  ucCoinsIcon: {
    fontSize: 12,
    marginRight: 3,
  },
  ucCoinsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  ucCartButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ucCartIcon: {
    fontSize: 15,
  },
  ucCartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  ucCartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  ucProfileAvatarBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ucProfileAvatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  ucSearchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ucSearchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  ucSearchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#0F172A',
    paddingVertical: 0,
  },
  ucClearIcon: {
    fontSize: 14,
    color: '#94A3B8',
    paddingHorizontal: 4,
  },
  ucQuickChipsScroll: {
    flexDirection: 'row',
    paddingTop: 8,
    gap: 6,
  },
  ucQuickChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  ucQuickChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  ucQuickChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  ucQuickChipTextActive: {
    color: '#FFFFFF',
  },
  bottomBookingBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#0F172A',
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  bottomBookingBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  serviceCardBadgePill: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  serviceCardBadgePillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // CATEGORIES SCREEN STYLES
  categoriesHeroHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  categoriesHeroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  categoriesHeroSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
  categoryFilterRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryFilterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryFilterPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  categoryFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  categoryFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  categoryCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryImageCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryCardImgBox: {
    width: '100%',
    height: 120,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  categoryCardImg: {
    width: '100%',
    height: '100%',
  },
  categoryCardBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryCardBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  categoryCardContent: {
    padding: 10,
  },
  categoryCardRating: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: 2,
  },
  categoryCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 17,
  },
  categoryCardSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 8,
  },
  categoryCardPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  categoryCardPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  categoryCardArrowBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryCardArrowText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  fullCatalogCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  fullCatalogSuper: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  fullCatalogTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  fullCatalogSub: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 2,
  },
  fullCatalogBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  fullCatalogBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },

  // BOOKINGS SCREEN STYLES
  bookingsHeaderBox: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  bookingsHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  bookingsHeaderSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  bookingFilterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  bookingFilterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bookingFilterChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  bookingFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  bookingFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  bookingCardOngoing: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#10B981',
    padding: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  ongoingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 5,
  },
  liveGreenPulse: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  liveStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  bookingIdText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  ongoingServiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ongoingServiceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  ongoingSlotText: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 2,
    fontWeight: '500',
  },
  ongoingAddressText: {
    fontSize: 11,
    color: '#64748B',
  },
  ongoingPriceText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  ongoingSpecialistBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    gap: 10,
  },
  specialistAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  specialistAvatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  specialistName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  specialistRatingPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  specialistRatingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
  },
  specialistSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  specialistCallBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  specialistCallIcon: {
    fontSize: 14,
  },
  otpNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 14,
  },
  otpNoticeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
  },
  otpNoticeSub: {
    fontSize: 10,
    color: '#3B82F6',
    marginTop: 1,
  },
  otpDisplayBox: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  otpDisplayText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  liveTrackCTAButton: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  liveTrackCTAIcon: {
    fontSize: 16,
  },
  liveTrackCTAText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  // Completed Bookings
  bookingCardCompleted: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  completedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  completedBadgePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  completedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  bookingDateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  completedBodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  completedServiceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },
  completedSpecialistText: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starGold: {
    color: '#F59E0B',
    fontSize: 12,
  },
  ratedText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  completedPriceText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  completedActionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  repeatBookingBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  repeatBookingText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  invoiceBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  invoiceBtnText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },

  // Cancelled Bookings
  bookingCardCancelled: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  cancelledHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cancelledBadgePill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  cancelledBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  cancelledBodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cancelledServiceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },
  refundText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '500',
  },
  cancelledPriceText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  rebookCancelledBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  rebookCancelledText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },

  // Empty Bookings
  emptyBookingsBox: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 16,
  },
  emptyBookingsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptyBookingsSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  bookNewServiceBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookNewServiceBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // PROFILE SCREEN STYLES
  profileHeroCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileAvatarLarge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarLargeText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  profileUserName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  profilePlusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  profilePlusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#92400E',
  },
  profileUserEmail: {
    fontSize: 12,
    color: '#64748B',
  },
  profileUserPhone: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  profileEditBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  profileEditBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  profileStatsRow: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  profileStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  profileStatNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  profileStatLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  profileStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  profilePlusBanner: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePlusBannerSuper: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  profilePlusBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 1,
  },
  profilePlusBannerSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  profileMenuGroup: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  profileMenuSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    gap: 12,
  },
  profileMenuIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profileMenuIcon: {
    fontSize: 15,
  },
  profileMenuTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  profileMenuSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  profileMenuChevron: {
    fontSize: 18,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  switchPartnerModeBtn: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  switchPartnerModeIcon: {
    fontSize: 22,
  },
  switchPartnerModeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  switchPartnerModeSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  switchPartnerModeArrow: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  profileLogoutBtn: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  profileLogoutBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '800',
  },
  profileAppVersionText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 24,
  },
});
