import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Search, 
  ShoppingBag, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Plus, 
  Minus, 
  SlidersHorizontal, 
  ShieldCheck, 
  User,
  Volume2
} from 'lucide-react';

export function SalonPrimeServicePage({
  onBackHome,
  selectedCity = 'Krishnagiri',
  selectedLocality = 'Rayakottai Road',
  onOpenLocationModal,
  cart = {},
  onAddToCart,
  onUpdateQty,
  onOpenCart,
  onOpenCheckout,
  showToast = () => {},
  monsoonSurge = false
}) {
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBannerSlide, setActiveBannerSlide] = useState(0);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [customizingPackage, setCustomizingPackage] = useState(null);
  const [selectedDetailService, setSelectedDetailService] = useState(null);

  // Customization choices for packages
  const [selectedWax, setSelectedWax] = useState('Chocolate roll-on wax');
  const [selectedFacial, setSelectedFacial] = useState('Korean Glass hydration facial');
  const [selectedManiPedi, setSelectedManiPedi] = useState('Essential mani-pedi combo - with heel peel');

  // Categories matching Left Sidebar ("Select a service") from Screenshots
  const SERVICE_CATEGORIES = [
    { id: 'all', label: 'All Services', type: 'badge' },
    { id: 'festive', label: 'Festive ready', type: 'icon-festive' },
    { id: 'super-saver', label: 'Super saver packages', type: 'discount-box', discount: 'Upto 20% OFF' },
    { id: 'waxing', label: 'Waxing & threading', type: 'img', image: '/images/spotlight_waxing.jpg' },
    { id: 'rituals', label: 'Japanese & Korean rituals', type: 'img', image: '/images/spotlight_japanese_glow.jpg', badge: 'New' },
    { id: 'facial', label: 'Signature facial & cleanup', type: 'img', image: '/images/hero_salon.jpg' },
    { id: 'pedi-mani', label: 'Pedicure & manicure', type: 'img', image: '/images/beauty_pedicure.jpg' },
    { id: 'detan', label: 'Bleach, detan & massages', type: 'img', image: '/images/salon_bleach_photo.jpg' }
  ];

  // Top Carousel Slides (Screenshots 1, 3, 4, 5)
  const HERO_SLIDES = [
    {
      id: 'slide-brazilian',
      badge: 'Price drop',
      badgeColor: '#15803D',
      title: 'Brazilian stripless wax',
      subtitle: 'Starting at ₹1,299 • Special intimate care',
      bgGradient: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
      imgSrc: '/images/salon_brazilian_wax.jpg',
      targetSection: 'waxing'
    },
    {
      id: 'slide-matcha',
      badge: 'New launch',
      badgeColor: '#831843',
      title: 'Japanese & Korean Rituals',
      subtitle: 'A deep Matcha detox for your skin',
      bgGradient: 'linear-gradient(135deg, #16382C 0%, #081C15 100%)',
      imgSrc: '/images/matcha_detox_ritual.jpg',
      targetSection: 'rituals'
    },
    {
      id: 'slide-aqua',
      badge: 'New launch',
      badgeColor: '#831843',
      title: 'Introducing Aqua gel wax',
      subtitle: 'Aqua gel wax with less heat & less pain',
      bgGradient: 'linear-gradient(135deg, #094752 0%, #062E35 100%)',
      imgSrc: '/images/salon_aqua_gel_wax.jpg',
      targetSection: 'waxing'
    },
    {
      id: 'slide-cherry',
      badge: 'Ancient Tradition',
      badgeColor: '#9D174D',
      title: 'Cherry blossom glow ritual',
      subtitle: 'Authentic sakura botanical skin barrier infusion',
      bgGradient: 'linear-gradient(135deg, #4A154B 0%, #1F0726 100%)',
      imgSrc: '/images/cherry_blossom_ritual.jpg',
      targetSection: 'rituals'
    }
  ];

  // Full Sections Catalogue matching ALL Screenshots
  const CATALOGUE_SECTIONS = [
    {
      id: 'festive',
      title: 'Festive ready',
      services: [
        {
          id: 'essential-mani-pedi',
          categoryId: 'festive',
          isPackage: false,
          title: 'Essential Mani-Pedi Combo',
          rating: 4.81,
          reviewsCount: '26K reviews',
          price: 1399,
          originalPrice: 1699,
          optionsCount: 2,
          inclusions: [
            'Essential manicure, pedicure combo for effective hand & feet maintenance',
            'Enriched with Kojic acid for brightening & skin restoration'
          ],
          description: 'Comprehensive hand and feet grooming therapy using disposable sterilized single-use nail kits and kojic acid brightening.'
        },
        {
          id: 'festive-glow-pkg',
          categoryId: 'festive',
          isPackage: true,
          tag: 'PACKAGE',
          title: 'Festive glow package',
          rating: 4.85,
          reviewsCount: '8.1M reviews',
          price: 4874,
          originalPrice: 6092,
          discountPercent: 20,
          duration: '4 hrs 55 mins',
          bannerImg: '/images/salon_festive_glow.jpg',
          bannerHeadline: 'Festive glow package',
          bannerDiscount: '20% off',
          bannerSub: 'Pick from mani-pedi, facials & more',
          hasCustomization: true,
          inclusions: [
            'Waxing: Full arms (Including underarms) - Rica White Chocolate Wax, Full legs - Rica White Chocolate Wax',
            'Facial & cleanup: Korean Glass hydration facial',
            'Manicure & pedicure: British rose manicure, Candle pedicure',
            'Hair care & massage: Head massage (20 mins)',
            'Facial hair removal: Eyebrow, Upper lip - Threading'
          ],
          description: 'Comprehensive head-to-toe pre-festive pampering designed to impart long-lasting camera-ready radiance with luxury international brands.'
        }
      ]
    },
    {
      id: 'super-saver',
      title: 'Super saver packages',
      services: [
        {
          id: 'make-your-own-pkg',
          categoryId: 'super-saver',
          isPackage: true,
          tag: 'PACKAGE',
          title: 'Make your own package',
          rating: 4.85,
          reviewsCount: '9M reviews',
          price: 3859,
          originalPrice: 4824,
          discountPercent: 20,
          duration: '4 hrs 20 mins',
          hasCustomization: true,
          inclusions: [
            'Waxing: Full arms (including underarms) - Chocolate roll-on wax, Full legs - Chocolate roll-on wax',
            'Facial & cleanup: Korean Glass hydration facial',
            'Manicure & pedicure: Essential mani-pedi combo - with heel peel',
            'Facial hair removal: Eyebrow, Upper lip - Threading'
          ],
          description: 'Customizable 4-in-1 complete head-to-toe monthly grooming package tailored to your exact beauty needs.'
        },
        {
          id: 'wax-and-glow',
          categoryId: 'super-saver',
          isPackage: true,
          tag: 'PACKAGE',
          title: 'Wax & glow',
          rating: 4.85,
          reviewsCount: '8.4M reviews',
          price: 2614,
          originalPrice: 3075,
          discountPercent: 15,
          duration: '2 hrs 10 mins',
          hasCustomization: true,
          inclusions: [
            'Waxing: Full arms (including underarms) - Chocolate roll-on wax, Full legs - Chocolate roll-on wax',
            'Facial & cleanup: Cherry blossom glow ritual facial',
            'Facial hair removal: Eyebrow, Upper lip - Threading'
          ],
          description: 'Essential waxing and radiance ritual combination for a fresh, illuminated complexion.'
        },
        {
          id: 'monthly-maintenance-pkg',
          categoryId: 'super-saver',
          isPackage: true,
          tag: 'PACKAGE',
          title: 'Monthly maintenance package',
          rating: 4.85,
          reviewsCount: '8M reviews',
          price: 2344,
          originalPrice: 2605,
          discountPercent: 10,
          duration: '1 hr 55 mins',
          hasCustomization: true,
          inclusions: [
            'Waxing: Full arms (including underarms) - Chocolate roll-on wax, Full legs - Chocolate roll-on wax',
            'Facial & cleanup: Anti tan brightening cleanup O3 / Kanpeki',
            'Facial hair removal: Eyebrow, Upper lip - Threading'
          ],
          description: 'Monthly grooming maintenance keeping skin silky, hydrated, and tan-free.'
        }
      ]
    },
    {
      id: 'waxing',
      title: 'Waxing & threading',
      services: [
        {
          id: 'spatula-waxing-arms-legs',
          categoryId: 'waxing',
          isPackage: false,
          title: 'Spatula waxing (Full arms, legs & underarms)',
          subtext: '3 options',
          optionsCount: 3,
          rating: 4.85,
          reviewsCount: '279K reviews',
          price: 799,
          originalPrice: 1049,
          duration: '50 mins',
          bannerImg: '/images/salon_aqua_gel_wax.jpg',
          bannerBadge: 'New launch',
          bannerBadgeColor: '#831843',
          bannerHeadline: 'Spatula waxing',
          bannerSub: 'Aqua gel wax with less heat & less pain',
          bannerPill: 'Full arms, legs & underarms',
          inclusions: [
            'Painless & irritation-free hair removal',
            'Three wax types for you to pick from: Aqua, Rica or Honey'
          ],
          description: 'Hypoallergenic low-temperature wax suitable for sensitive and dry skin, removing the shortest ingrown hairs effortlessly.'
        },
        {
          id: 'rollon-waxing-arms-legs',
          categoryId: 'waxing',
          isPackage: false,
          title: 'Roll-on waxing (Full arms, legs & underarms)',
          subtext: '2 options',
          optionsCount: 2,
          rating: 4.86,
          reviewsCount: '277K reviews',
          price: 1099,
          originalPrice: 1398,
          duration: '50 mins',
          bannerImg: '/images/salon_rollon_waxing.jpg',
          bannerBadge: 'Price drop',
          bannerBadgeColor: '#15803D',
          bannerHeadline: 'Roll-on waxing starting at ₹1,099',
          bannerOriginalPrice: '₹1,398',
          bannerPill: 'Full arms, legs & underarms',
          inclusions: [
            'Hygienic & smooth application with single use cartridge wax',
            'Choose your preferred wax type'
          ],
          description: 'Ultra-smooth roll-on cartridge waxing minimizing skin heating and stickiness for silky hair-free finish.'
        },
        {
          id: 'brazilian-stripless-bikini',
          categoryId: 'waxing',
          isPackage: false,
          title: 'Brazilian stripless bikini waxing',
          rating: 4.89,
          reviewsCount: '179K reviews',
          price: 1399,
          originalPrice: 1848,
          duration: '45 mins',
          bannerImg: '/images/salon_brazilian_wax.jpg',
          bannerBadge: 'Price drop',
          bannerBadgeColor: '#15803D',
          bannerHeadline: 'Brazilian stripless wax',
          bannerPriceHighlight: '₹1,299',
          bannerOriginalPrice: '₹1,548',
          bannerPill: 'Bikini waxing',
          inclusions: [
            'Stripless, non-sticky & anti-irritant peel off wax is used for intimate area',
            'Peel-off wax is applied using spatula, followed by hair removal'
          ],
          description: 'Specialized peel-off stripless waxing formulated specifically for delicate intimate skin with minimal discomfort.'
        },
        {
          id: 'underarms-waxing',
          categoryId: 'waxing',
          isPackage: false,
          title: 'Underarms waxing',
          rating: 4.84,
          reviewsCount: '200K reviews',
          price: 99,
          optionsCount: 2,
          thumbnailImg: '/images/waxing_arms_underarms.jpg',
          inclusions: [
            'Peel - off wax is applied using spatula, followed by hair removal'
          ],
          description: 'Gentle underarm hair removal using disposable peel-off wax preventing darkness.'
        },
        {
          id: 'full-body-waxing',
          categoryId: 'waxing',
          isPackage: false,
          title: 'Full body waxing',
          rating: 4.85,
          reviewsCount: '75K reviews',
          price: 1499,
          optionsCount: 4,
          thumbnailImg: '/images/salon_brazilian_wax.jpg',
          inclusions: [
            'Covers full arms, full legs, underarms, stomach & back'
          ],
          description: 'Complete full body hair removal leaving entire skin silky and soft.'
        },
        {
          id: 'threading-service',
          categoryId: 'waxing',
          isPackage: false,
          title: 'Threading',
          rating: 4.85,
          reviewsCount: '3.2M reviews',
          price: 49,
          optionsCount: 8,
          thumbnailImg: '/images/spotlight_japanese_glow.jpg',
          inclusions: [
            'Precise hair removal for eyebrows, upper lip, chin & forehead using anti-bacterial thread'
          ],
          description: 'High precision organic cotton thread shaping for clean brows and face.'
        },
        {
          id: 'peel-off-face-waxing',
          categoryId: 'waxing',
          isPackage: false,
          title: 'Peel-off face waxing',
          rating: 4.84,
          reviewsCount: '635K reviews',
          price: 89,
          optionsCount: 7,
          thumbnailImg: '/images/hero_salon.jpg',
          inclusions: [
            'Peel-off wax to remove even the tiniest hair for smooth skin',
            'Face waxing service does not include eyebrow shaping/threading'
          ],
          description: 'Low temperature stripless facial wax removing fine peach fuzz effortlessly.'
        },
        {
          id: 'full-arms-underarms-waxing',
          categoryId: 'waxing',
          isPackage: false,
          title: 'Full arms & underarms waxing',
          rating: 4.85,
          reviewsCount: '1.1M reviews',
          price: 429,
          optionsCount: 5,
          thumbnailImg: '/images/waxing_arms_underarms.jpg',
          inclusions: [
            'Full arms hair removal including underarms',
            'Choice of Rica, Chocolate roll-on, or honey wax'
          ],
          description: 'Thorough hair removal from shoulders to fingers with underarms included.'
        },
        {
          id: 'butt-waxing',
          categoryId: 'waxing',
          isPackage: false,
          title: 'Butt waxing',
          rating: 4.93,
          reviewsCount: '22 reviews',
          price: 449,
          optionsCount: 1,
          thumbnailImg: '/images/salon_brazilian_wax.jpg',
          inclusions: [
            'Covers the buttocks. Butthole is not included'
          ],
          description: 'Gentle hair removal over the buttocks area with soothing post-wax gel.'
        },
        {
          id: 'full-legs-waxing',
          categoryId: 'waxing',
          isPackage: false,
          title: 'Full legs waxing',
          rating: 4.86,
          reviewsCount: '577K reviews',
          price: 519,
          optionsCount: 5,
          thumbnailImg: '/images/waxing_legs.jpg',
          inclusions: [
            'Bikini/ bikini line/ butt waxing is not included'
          ],
          description: 'Complete hair removal from upper thigh to toes leaving skin smooth and radiant.'
        },
        {
          id: 'half-legs-waxing',
          categoryId: 'waxing',
          isPackage: false,
          title: 'Half legs waxing',
          rating: 4.85,
          reviewsCount: '381K reviews',
          price: 249,
          optionsCount: 3,
          thumbnailImg: '/images/spotlight_waxing.jpg',
          inclusions: [
            'Waxing covers area from toe to knee'
          ],
          description: 'Targeted hair removal covering toes, shins, and knees.'
        },
        {
          id: 'back-waxing',
          categoryId: 'waxing',
          isPackage: false,
          title: 'Back waxing',
          rating: 4.87,
          reviewsCount: '29K reviews',
          price: 549,
          optionsCount: 5,
          thumbnailImg: '/images/waxing_back.jpg',
          inclusions: [
            'Covers the area from shoulders to the pelvis'
          ],
          description: 'Complete back hair removal covering lower, mid, and upper back.'
        },
        {
          id: 'stomach-waxing',
          categoryId: 'waxing',
          isPackage: false,
          title: 'Stomach waxing',
          rating: 4.88,
          reviewsCount: '31K reviews',
          price: 399,
          optionsCount: 5,
          thumbnailImg: '/images/waxing_arms_underarms.jpg',
          inclusions: [
            'Covers the area from below the bust to the pelvis'
          ],
          description: 'Smooth, clean hair removal covering the entire abdomen from underbust to waistline.'
        },
        {
          id: 'bikini-waxing',
          categoryId: 'waxing',
          isPackage: false,
          title: 'Bikini waxing',
          rating: 4.89,
          reviewsCount: '149K reviews',
          price: 1049,
          optionsCount: 2,
          thumbnailImg: '/images/salon_brazilian_wax.jpg',
          inclusions: [
            'Covers full pelvic area (buttocks not included)'
          ],
          description: 'Clean, thorough intimate grooming with temperature-controlled gentle wax.'
        },
        {
          id: 'bikini-line-waxing',
          categoryId: 'waxing',
          isPackage: false,
          title: 'Bikini line waxing',
          rating: 4.89,
          reviewsCount: '55K reviews',
          price: 349,
          optionsCount: 2,
          thumbnailImg: '/images/salon_brazilian_wax.jpg',
          inclusions: [
            'Only covers area around the pelvis, not the pelvis itself'
          ],
          description: 'Neat boundary cleanup around swimsuit line using low-irritation formula.'
        }
      ]
    },
    {
      id: 'rituals',
      title: 'Japanese & Korean rituals',
      services: [
        {
          id: 'cherry-blossom-glow-ritual',
          categoryId: 'rituals',
          isPackage: false,
          tag: 'FREEBIE INCLUDED',
          title: 'Cherry blossom glow ritual',
          rating: 4.83,
          reviewsCount: '9K reviews',
          price: 1499,
          duration: '60 mins',
          bannerImg: '/images/cherry_blossom_ritual.jpg',
          bannerSubtitle: 'a timeless tradition',
          hasAudioToggle: true,
          hasProgressBar: true,
          inclusions: [
            'Strengthens skin barrier & locks in lasting hydration for a supple, glowing skin',
            'Free SPF 70 PA ++++ mist'
          ],
          description: 'Authentic Japanese Sakura floral infusion designed to restore barrier strength and provide radiant dewy hydration.'
        },
        {
          id: 'matcha-detox-ritual',
          categoryId: 'rituals',
          isPackage: false,
          tag: 'FREEBIE INCLUDED',
          title: 'Matcha detox ritual',
          rating: 4.83,
          reviewsCount: '10K reviews',
          price: 1749,
          duration: '60 mins',
          bannerImg: '/images/matcha_detox_ritual.jpg',
          bannerBadge: 'New launch',
          bannerBadgeColor: '#831843',
          bannerHeadline: 'A deep Matcha detox for your skin',
          bannerSub: '抹茶 / Matcha for deep antioxidant cleanse',
          inclusions: [
            'Draws out deep-seated impurities for a visibly clearer skin',
            'Free SPF 70 PA ++++ mist'
          ],
          description: 'High-potency ceremonial green tea antioxidant purifying treatment for pores and deep detox.'
        },
        {
          id: 'korean-glass-hydration-facial',
          categoryId: 'rituals',
          isPackage: false,
          tag: 'BESTSELLER',
          title: 'Korean Glass hydration facial',
          rating: 4.83,
          reviewsCount: '92K reviews',
          price: 1749,
          duration: '1 hr 20 mins',
          thumbnailImg: '/images/spotlight_japanese_glow.jpg',
          inclusions: [
            'Suitable for normal to dry skin',
            '10 mins of shoulder, leg & back massage included'
          ],
          description: 'Viral multi-layer hyaluronic and fermented rice essence treatment for crystal clear glass glow.'
        },
        {
          id: 'korean-plant-peptide-brightening',
          categoryId: 'rituals',
          isPackage: false,
          tag: 'RECOMMENDED',
          title: 'Korean Plant-peptide brightening facial',
          rating: 4.82,
          reviewsCount: '50K reviews',
          price: 1849,
          duration: '1 hr 30 mins',
          thumbnailImg: '/images/salon_festive_glow.jpg',
          inclusions: [
            'Smoothens uneven patches for a clearer, more even complexion',
            'Suitable for oily & combination skin'
          ],
          description: 'Clinical botanical peptide infusion targeting pigmentation, enlarged pores, and uneven tone.'
        },
        {
          id: 'korean-glow-facial',
          categoryId: 'rituals',
          isPackage: false,
          title: 'Korean Glow facial',
          rating: 4.82,
          reviewsCount: '90K reviews',
          price: 1399,
          duration: '1 hr 20 mins',
          thumbnailImg: '/images/spotlight_japanese_glow.jpg',
          inclusions: [
            'Revives dull skin & restores hydration levels',
            'Suitable for normal skin type'
          ],
          description: 'Refreshing multi-stage Korean essence treatment restoring moisture and natural luminosity.'
        }
      ]
    },
    {
      id: 'facial',
      title: 'Signature facial & cleanup',
      services: [
        {
          id: 'o3-shine-glow-facial',
          categoryId: 'facial',
          isPackage: false,
          title: 'O3+ shine & glow facial',
          rating: 4.83,
          reviewsCount: '102K reviews',
          price: 1849,
          duration: '1 hr 20 mins',
          thumbnailImg: '/images/hero_salon.jpg',
          inclusions: [
            'Reduces hyperpigmentation to even out skin tone',
            'Suitable for normal to oily skin'
          ],
          description: 'Brightening antioxidant facial targeting uneven skin pigmentation and dull complexion.'
        },
        {
          id: 'sara-lightening-glow-facial',
          categoryId: 'facial',
          isPackage: false,
          title: 'Sara Lightening glow facial',
          rating: 4.83,
          reviewsCount: '119K reviews',
          price: 1219,
          duration: '1 hr 20 mins',
          thumbnailImg: '/images/spotlight_japanese_glow.jpg',
          inclusions: [
            'Boosts hydration to improve overall skin clarity',
            'Suitable for combination skin'
          ],
          description: 'Hydrating, brightening botanical facial for balanced and crystal clear skin.'
        },
        {
          id: 'aroma-magic-instant-glow',
          categoryId: 'facial',
          isPackage: false,
          title: 'Aroma Magic instant glow facial',
          rating: 4.85,
          reviewsCount: '97K reviews',
          price: 999,
          duration: '1 hr 5 mins',
          thumbnailImg: '/images/beauty_arm_treatment.jpg',
          inclusions: [
            'Refreshes tired skin & brings back a natural glow',
            'Suitable for combination skin'
          ],
          description: 'Aromatherapy rose & botanical oils facial restoring instant freshness and soft texture.'
        },
        {
          id: 'o3-power-brightening',
          categoryId: 'facial',
          isPackage: false,
          title: 'O3+ Power brightening facial',
          rating: 4.81,
          reviewsCount: '54K reviews',
          price: 2099,
          duration: '1 hr 25 mins',
          bannerImg: '/images/salon_festive_glow.jpg',
          bannerHeadline: 'Glow brighter this festive season',
          bannerSub: 'Vitamin C restores radiance for plump, glowing skin',
          inclusions: [
            'Fades spots & refines texture for a clearer skin',
            'Suitable for normal to oily skin'
          ],
          description: 'High-potency clinical antioxidant treatment that targets uneven sun tanning, dullness and blemishes.'
        },
        {
          id: 'kumkumadi-ubtan-hydration',
          categoryId: 'facial',
          isPackage: false,
          title: 'Kumkumadi ubtan hydration facial',
          rating: 4.83,
          reviewsCount: '46K reviews',
          price: 1299,
          duration: '1 hr 20 mins',
          thumbnailImg: '/images/salon_festive_glow.jpg',
          inclusions: [
            'Replenishes hydration & enhances skin\'s natural radiance',
            'Suitable for normal to dry skin'
          ],
          description: 'Traditional Ayurvedic saffron ubtan therapy delivering rich nourishment and glowing complexion.'
        },
        {
          id: 'firming-wine-glow-facial',
          categoryId: 'facial',
          isPackage: false,
          title: 'Firming Wine glow facial',
          rating: 4.83,
          reviewsCount: '98K reviews',
          price: 1349,
          duration: '1 hr 15 mins',
          thumbnailImg: '/images/beauty_makeup.jpg',
          inclusions: [
            'Tightens the skin & boosts elasticity for a firmer look',
            'Suitable for normal to dry skin'
          ],
          description: 'Polyphenol-rich red wine grape extract facial providing collagen stimulation and skin tightening.'
        },
        {
          id: 'power-glow-cleanup',
          categoryId: 'facial',
          isPackage: false,
          title: 'Power glow cleanup',
          rating: 4.86,
          reviewsCount: '168K reviews',
          price: 699,
          duration: '50 mins',
          thumbnailImg: '/images/hero_salon.jpg',
          inclusions: [
            'Clears deep-rooted impurities to enhance skin clarity & brightness',
            'Suitable for all skin types'
          ],
          description: 'Fast, effective pore cleanup, exfoliation and brightening mask session.'
        },
        {
          id: 'anti-tan-brightening-cleanup',
          categoryId: 'facial',
          isPackage: false,
          title: 'Anti tan brightening cleanup O3 / Kanpeki',
          rating: 4.84,
          reviewsCount: '120K reviews',
          price: 1029,
          duration: '45 mins',
          thumbnailImg: '/images/spotlight_japanese_glow.jpg',
          inclusions: [
            'Targets tan & dullness for a more even skin tone',
            'Suitable for normal to oily skin'
          ],
          description: 'Intensive anti-tan formula clarifying sun pigmentation and uneven facial tone.'
        },
        {
          id: 'sara-fruit-cleanup',
          categoryId: 'facial',
          isPackage: false,
          title: 'Sara fruit cleanup',
          rating: 4.85,
          reviewsCount: '158K reviews',
          price: 819,
          duration: '45 mins',
          thumbnailImg: '/images/hero_salon.jpg',
          inclusions: [
            'Provides antioxidant protection to counter pollution & UV effects',
            'Suitable for all skin types'
          ],
          description: 'Fruit enzyme gentle scrub and antioxidant vitamin cleanup protecting against environmental pollutants.'
        }
      ]
    },
    {
      id: 'pedi-mani',
      title: 'Pedicure & manicure',
      services: [
        {
          id: 'essential-mani-pedi-pedimani',
          categoryId: 'pedi-mani',
          isPackage: false,
          title: 'Essential Mani-Pedi Combo',
          rating: 4.81,
          reviewsCount: '26K reviews',
          price: 1399,
          optionsCount: 2,
          bannerImg: '/images/beauty_pedicure.jpg',
          bannerHeadline: 'For a brighter & nourished finish',
          bannerSub: 'Enriched with Kojic acid for brightening & skin restoration',
          inclusions: [
            'Essential manicure, pedicure combo for effective hand & feet maintenance',
            'Enriched with Kojic acid for brightening & skin restoration'
          ],
          description: 'Comprehensive hand and feet grooming therapy using disposable sterilized single-use nail kits and kojic acid brightening.'
        },
        {
          id: 'candle-spa-manicure',
          categoryId: 'pedi-mani',
          isPackage: false,
          title: 'Candle manicure',
          rating: 4.80,
          reviewsCount: '12K reviews',
          price: 1189,
          duration: '60 mins',
          thumbnailImg: '/images/beauty_arm_treatment.jpg',
          inclusions: [
            'Himalayan salt & peppermint oil soothe the hands & provide relaxation'
          ],
          description: 'Warm soy candle oil infusion with restorative Himalayan pink salt scrub.'
        },
        {
          id: 'british-rose-manicure',
          categoryId: 'pedi-mani',
          isPackage: false,
          title: 'British rose manicure',
          rating: 4.81,
          reviewsCount: '149K reviews',
          price: 809,
          duration: '45 mins',
          thumbnailImg: '/images/beauty_makeup.jpg',
          inclusions: [
            'Olive oil & jojoba oil provide intense & long-lasting hydration'
          ],
          description: 'Intensely hydrating hand therapy infused with authentic English rose essence and jojoba oil.'
        },
        {
          id: 'cut-file-polish-hands',
          categoryId: 'pedi-mani',
          isPackage: false,
          title: 'Cut, file & polish (hands)',
          rating: 4.85,
          reviewsCount: '86K reviews',
          price: 249,
          duration: '15 mins',
          thumbnailImg: '/images/beauty_pedicure.jpg',
          inclusions: [
            'Quick fingernail grooming session with a wide range of nail paints'
          ],
          description: 'Swift nail trimming, edge buffing, and professional high-gloss polish application.'
        },
        {
          id: 'candle-spa-pedicure',
          categoryId: 'pedi-mani',
          isPackage: false,
          title: 'Candle pedicure',
          rating: 4.81,
          reviewsCount: '66K reviews',
          price: 1419,
          optionsCount: 2,
          bannerImg: '/images/beauty_pedicure.jpg',
          bannerHeadline: 'A soothing care ritual for tired feet',
          bannerSub: 'Peppermint oil provides a cooling, refreshing sensation',
          inclusions: [
            'Himalayan salt & peppermint oil soothe & hydrate the feet'
          ],
          description: 'Warm shea butter candle reflexology, callous smoothing, and aromatherapy cooling foot soak.'
        },
        {
          id: 'crystal-rose-pedicure',
          categoryId: 'pedi-mani',
          isPackage: false,
          title: 'Crystal rose pedicure',
          rating: 4.82,
          reviewsCount: '368K reviews',
          price: 859,
          optionsCount: 2,
          thumbnailImg: '/images/spotlight_waxing.jpg',
          inclusions: [
            'Olive oil & jojoba oil provide intense & long-lasting hydration',
            'Includes crystal soak treatment with foot, shoulder & palm massage'
          ],
          description: 'Jelly crystal soak with floral rose extracts, heel filing, and relaxing upper body palm massage.'
        },
        {
          id: 'cut-file-polish-feet',
          categoryId: 'pedi-mani',
          isPackage: false,
          title: 'Cut, file & polish (feet)',
          rating: 4.85,
          reviewsCount: '83K reviews',
          price: 299,
          duration: '15 mins',
          thumbnailImg: '/images/beauty_pedicure.jpg',
          inclusions: [
            'Quick toenail grooming session with a wide range of nail paints'
          ],
          description: 'Speedy toenail clipping, cuticle grooming, and chip-resistant salon lacquer.'
        }
      ]
    },
    {
      id: 'detan',
      title: 'Bleach, detan & massages',
      services: [
        {
          id: 'bleach-service',
          categoryId: 'detan',
          isPackage: false,
          title: 'Bleach',
          rating: 4.84,
          reviewsCount: '103K reviews',
          price: 449,
          optionsCount: 6,
          thumbnailImg: '/images/salon_bleach_photo.jpg',
          inclusions: [
            'Professional bleach for an even-looking complexion & fresh glow'
          ],
          description: 'Professional gold & pearl bleach for an even-looking radiant complexion and fresh skin glow.'
        },
        {
          id: 'hair-colour-mehendi',
          categoryId: 'detan',
          isPackage: false,
          title: 'Hair colour/mehendi (only application)',
          rating: 4.83,
          reviewsCount: '280K reviews',
          price: 399,
          optionsCount: 2,
          thumbnailImg: '/images/salon_hair_colour_photo.jpg',
          inclusions: [
            'Covers application only; please have your product ready before the service'
          ],
          description: 'Neat sectioned hair colour or organic mehendi application by skilled salon professionals.'
        },
        {
          id: 'head-massage',
          categoryId: 'detan',
          isPackage: false,
          title: 'Head massage',
          rating: 4.87,
          reviewsCount: '223K reviews',
          price: 249,
          optionsCount: 2,
          thumbnailImg: '/images/salon_head_massage_photo.jpg',
          inclusions: [
            'Pressure point focused massage for instant relaxation'
          ],
          description: 'Acupressure and tension-relief head massage using nourishing essential oils.'
        },
        {
          id: 'foot-massage',
          categoryId: 'detan',
          isPackage: false,
          title: 'Foot massage',
          rating: 4.81,
          reviewsCount: '7K reviews',
          price: 249,
          optionsCount: 2,
          thumbnailImg: '/images/salon_foot_massage_photo.jpg',
          inclusions: [
            'Pressure point focused massage for instant relaxation'
          ],
          description: 'Reflexology pressure point focused foot and heel massage for deep muscular relief.'
        },
        {
          id: 'raaga-white-detan',
          categoryId: 'detan',
          isPackage: false,
          title: 'Raaga White Chocolate Detan & Glow',
          rating: 4.83,
          reviewsCount: '195K reviews',
          price: 649,
          originalPrice: 849,
          discountPercent: 23,
          duration: '35 mins',
          thumbnailImg: '/images/spotlight_massage.jpg',
          inclusions: [
            'Milk enzyme kojic formula for instant sun damage reversal',
            'Zero peroxide formula, completely burn-free and gentle on skin',
            'Deep nourishing cocoa butter application'
          ],
          description: 'Instant tan removal that clarifies uneven neck and facial complexion safely.'
        }
      ]
    }
  ];

  // Surge Price Adjuster
  const surgeAmount = monsoonSurge ? 49 : 0;

  // Filter sections by search query or active category
  const visibleSections = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return CATALOGUE_SECTIONS.map(section => {
      const matchesCategory = activeCategoryTab === 'all' || section.id === activeCategoryTab;
      
      const filteredServices = section.services.filter(svc => {
        if (!q) return true;
        return (
          svc.title.toLowerCase().includes(q) ||
          (svc.inclusions || []).some(inc => inc.toLowerCase().includes(q)) ||
          (svc.description || '').toLowerCase().includes(q)
        );
      });

      return {
        ...section,
        services: filteredServices,
        visible: matchesCategory && filteredServices.length > 0
      };
    }).filter(sec => sec.visible);
  }, [activeCategoryTab, searchQuery]);

  // Cart Totals - strictly count only items with positive quantity
  const cartItems = useMemo(() => {
    return Object.values(cart || {}).filter(item => {
      const q = typeof item === 'number' ? item : (item?.qty ?? item?.quantity ?? 0);
      return q > 0;
    });
  }, [cart]);

  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const q = typeof item === 'number' ? item : (item?.qty ?? item?.quantity ?? 0);
      return acc + q;
    }, 0);
  }, [cartItems]);

  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const q = typeof item === 'number' ? item : (item?.qty ?? item?.quantity ?? 0);
      return acc + ((item.price || 0) * q);
    }, 0);
  }, [cartItems]);

  function handleAddService(svc) {
    const finalPrice = svc.price + surgeAmount;
    const finalOriginal = svc.originalPrice ? svc.originalPrice + surgeAmount : Math.round(finalPrice * 1.25);
    onAddToCart({
      ...svc,
      price: finalPrice,
      originalPrice: finalOriginal,
      serviceCategory: 'womens-salon'
    });
    showToast(`✨ Added "${svc.title}" to cart`);
  }

  function handleOpenCustomize(pkg) {
    setCustomizingPackage(pkg);
    setIsCustomizeModalOpen(true);
  }

  function handleSaveCustomization() {
    setIsCustomizeModalOpen(false);
    showToast(`✅ Customized "${customizingPackage?.title || 'Package'}": ${selectedWax} + ${selectedFacial}`);
  }

  function handleCategoryTileClick(catId) {
    setActiveCategoryTab(catId);
    setSearchQuery('');
    
    if (catId === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setTimeout(() => {
        const el = document.getElementById(`section-${catId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }
  }

  return (
    <div className="salon-prime-page" style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 100, color: '#0F172A', fontFamily: 'inherit' }}>
      
      {/* 1. TOP STICKY HEADER */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '12px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          
          {/* Left: Back Arrow & UC Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              type="button"
              onClick={onBackHome}
              style={{
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: 38,
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#334155',
                transition: 'background 0.15s'
              }}
              title="Return to Home"
            >
              <ArrowLeft size={18} />
            </button>

            <div onClick={onBackHome} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
              <div style={{
                background: '#0F172A',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: 14,
                padding: '4px 7px',
                borderRadius: 4,
                letterSpacing: 0.5
              }}>
                UC
              </div>
              <span style={{ fontSize: 17, fontWeight: 900, color: '#0F172A', letterSpacing: -0.3 }}>
                Urban Company
              </span>
            </div>
          </div>

          {/* Middle: Location Pill & Search in Salon Prime */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, maxWidth: 680 }}>
            {/* Location Pill */}
            <button
              type="button"
              onClick={onOpenLocationModal}
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 10,
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                fontSize: 12.5,
                fontWeight: 600,
                color: '#1E293B',
                whiteSpace: 'nowrap',
                maxWidth: 240
              }}
            >
              <MapPin size={14} color="#6E42E5" style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                4744+HMQ, {selectedLocality || selectedCity}
              </span>
              <ChevronDown size={14} color="#64748B" />
            </button>

            {/* Search Box */}
            <div style={{
              flex: 1,
              position: 'relative',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              padding: '0 14px'
            }}>
              <Search size={16} color="#94A3B8" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search in Salon Prime"
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: '9px 10px',
                  fontSize: 13,
                  outline: 'none',
                  color: '#0F172A',
                  width: '100%'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Right: Cart Button & Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              type="button"
              onClick={onOpenCheckout || onOpenCart}
              style={{
                position: 'relative',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 10,
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#1E293B'
              }}
              title="View Cart"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  background: '#6E42E5',
                  color: '#fff',
                  fontSize: 10.5,
                  fontWeight: 900,
                  borderRadius: 999,
                  width: 18,
                  height: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #fff'
                }}>
                  {cartCount}
                </span>
              )}
            </button>

            <div style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569'
            }}>
              <User size={18} />
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN 3-COLUMN LAYOUT */}
      <main style={{ maxWidth: 1280, margin: '24px auto 0', padding: '0 24px' }}>
        
        {/* Page Title & Star Rating Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: '0 0 6px', color: '#0F172A', letterSpacing: -0.5 }}>
            Salon Prime
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: '#475569', fontWeight: 600 }}>
            <span style={{
              background: '#6E42E5',
              color: '#FFFFFF',
              width: 18,
              height: 18,
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 900
            }}>
              ★
            </span>
            <span style={{ fontWeight: 800, color: '#0F172A' }}>4.85</span>
            <span style={{ borderBottom: '1px dashed #94A3B8', cursor: 'pointer' }}>
              (18.8 M bookings)
            </span>
            {monsoonSurge && (
              <span style={{
                marginLeft: 8,
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                color: '#0284C7',
                fontSize: 11,
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 4
              }}>
                🌧️ Rain Surge Active (+₹49)
              </span>
            )}
          </div>
        </div>

        {/* 3-Column Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr 310px', gap: 28, alignItems: 'start' }}>
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: "Select a service" Sticky Sidebar            */}
          {/* ========================================================= */}
          <aside style={{
            position: 'sticky',
            top: 84,
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 16,
            padding: 16,
            boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
              color: '#64748B',
              fontSize: 12.5,
              fontWeight: 700
            }}>
              <span>Select a service</span>
              <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
            </div>

            {/* Service Grid Tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {SERVICE_CATEGORIES.map(cat => {
                const isActive = activeCategoryTab === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryTileClick(cat.id)}
                    style={{
                      background: isActive ? '#F5F3FF' : '#FFFFFF',
                      border: isActive ? '1.5px solid #6E42E5' : '1px solid #E2E8F0',
                      borderRadius: 12,
                      padding: '10px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      minHeight: 96,
                      justifyContent: 'center',
                      transition: 'all 0.15s'
                    }}
                  >
                    {/* Visual Badge / Icon / Photo */}
                    {cat.type === 'icon-festive' ? (
                      <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: '#991B1B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        fontWeight: 900,
                        fontSize: 16,
                        marginBottom: 6,
                        boxShadow: '0 2px 6px rgba(153, 27, 27, 0.3)'
                      }}>
                        %
                      </div>
                    ) : cat.type === 'discount-box' ? (
                      <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: 8,
                        background: '#ECFDF5',
                        border: '1px solid #A7F3D0',
                        color: '#059669',
                        fontWeight: 900,
                        fontSize: 9,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1.1,
                        marginBottom: 6
                      }}>
                        <span>Upto</span>
                        <span style={{ fontSize: 11, fontWeight: 900 }}>20%</span>
                        <span>OFF</span>
                      </div>
                    ) : cat.type === 'badge' ? (
                      <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: 8,
                        background: '#F3E8FF',
                        color: '#6E42E5',
                        fontWeight: 900,
                        fontSize: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 6
                      }}>
                        ★
                      </div>
                    ) : (
                      <div style={{ position: 'relative', marginBottom: 6 }}>
                        <img
                          src={cat.image}
                          alt={cat.label}
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1px solid #E2E8F0'
                          }}
                        />
                        {cat.badge && (
                          <span style={{
                            position: 'absolute',
                            top: -4,
                            right: -6,
                            background: '#7C3AED',
                            color: '#fff',
                            fontSize: 8.5,
                            fontWeight: 800,
                            padding: '1px 4px',
                            borderRadius: 4
                          }}>
                            {cat.badge}
                          </span>
                        )}
                      </div>
                    )}

                    <span style={{
                      fontSize: 11,
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? '#6E42E5' : '#334155',
                      lineHeight: 1.2
                    }}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ========================================================= */}
          {/* CENTER COLUMN: Hero Carousel + Exact Sections Feed         */}
          {/* ========================================================= */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: 32, minWidth: 0 }}>
            
            {/* Top Carousel Banner */}
            {activeCategoryTab === 'all' && !searchQuery && (
              <div style={{
                position: 'relative',
                borderRadius: 18,
                overflow: 'hidden',
                background: HERO_SLIDES[activeBannerSlide].bgGradient,
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                minHeight: 250,
                display: 'flex',
                color: '#FFFFFF'
              }}>
                {/* Left Text */}
                <div style={{ flex: 1.2, padding: '36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 2 }}>
                  <span style={{
                    alignSelf: 'flex-start',
                    background: HERO_SLIDES[activeBannerSlide].badgeColor,
                    color: '#FFFFFF',
                    fontSize: 11.5,
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: 6,
                    marginBottom: 14,
                    letterSpacing: '0.03em'
                  }}>
                    {HERO_SLIDES[activeBannerSlide].badge}
                  </span>
                  
                  <h2 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.15, margin: '0 0 10px', color: '#FFFFFF' }}>
                    {HERO_SLIDES[activeBannerSlide].title}
                  </h2>
                  
                  <p style={{ fontSize: 15, color: '#E2E8F0', margin: 0, fontWeight: 500 }}>
                    {HERO_SLIDES[activeBannerSlide].subtitle}
                  </p>
                </div>

                {/* Right Visual Image */}
                <div style={{ flex: 1.1, position: 'relative', minHeight: 250 }}>
                  <img
                    src={HERO_SLIDES[activeBannerSlide].imgSrc}
                    alt={HERO_SLIDES[activeBannerSlide].title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to right, rgba(9, 71, 82, 0.9) 0%, transparent 40%)'
                  }} />
                </div>

                {/* Carousel Controls */}
                <button
                  type="button"
                  onClick={() => setActiveBannerSlide(prev => prev === 0 ? HERO_SLIDES.length - 1 : prev - 1)}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.9)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#0F172A',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    zIndex: 3
                  }}
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveBannerSlide(prev => (prev + 1) % HERO_SLIDES.length)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.9)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#0F172A',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    zIndex: 3
                  }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* Sections Loop */}
            {visibleSections.length === 0 ? (
              <div style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: 48,
                textAlign: 'center',
                border: '1px solid #E2E8F0'
              }}>
                <Search size={36} color="#94A3B8" style={{ marginBottom: 12 }} />
                <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                  No services found matching "{searchQuery}"
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>
                  Try searching for waxing, facial, manicure, or clear the search.
                </p>
              </div>
            ) : (
              visibleSections.map(section => (
                <div key={section.id} id={`section-${section.id}`} style={{ scrollMarginTop: 90 }}>
                  
                  {/* Section Title Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 24, fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: -0.3 }}>
                      {section.title}
                    </h3>
                    <span style={{ fontSize: 12.5, color: '#64748B', fontWeight: 600 }}>
                      {section.services.length} {section.services.length === 1 ? 'service' : 'services'}
                    </span>
                  </div>

                  {/* Service Cards inside Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {section.services.map(service => {
                      const inCartItem = cart[service.id];
                      const qty = inCartItem?.qty || 0;
                      const livePrice = service.price + surgeAmount;
                      const liveOriginal = service.originalPrice ? service.originalPrice + surgeAmount : null;

                      return (
                        <article
                          key={service.id}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: 16,
                            overflow: 'hidden',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                            transition: 'border-color 0.2s'
                          }}
                        >
                          {/* Banner Image on Top */}
                          {service.bannerImg && (
                            <div style={{
                              position: 'relative',
                              width: '100%',
                              height: 205,
                              overflow: 'hidden',
                              background: '#0F172A'
                            }}>
                              <img
                                src={service.bannerImg}
                                alt={service.title}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  display: 'block'
                                }}
                              />
                              {/* Dark subtle overlay for readable text */}
                              <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 75%)',
                                padding: '22px 26px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                color: '#FFFFFF'
                              }}>
                                {/* Top Badge: New launch or Price drop */}
                                <div>
                                  {service.bannerBadge && (
                                    <span style={{
                                      display: 'inline-block',
                                      background: service.bannerBadgeColor || '#831843',
                                      color: '#fff',
                                      fontSize: 10.5,
                                      fontWeight: 800,
                                      padding: '3px 9px',
                                      borderRadius: 4,
                                      marginBottom: 10
                                    }}>
                                      {service.bannerBadge}
                                    </span>
                                  )}
                                  
                                  {/* Headline */}
                                  {service.bannerHeadline && (
                                    <h4 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 4px', color: '#FFFFFF', textShadow: '0 2px 6px rgba(0,0,0,0.5)', lineHeight: 1.2 }}>
                                      {service.bannerHeadline}
                                    </h4>
                                  )}

                                  {/* Price highlight directly on banner */}
                                  {service.bannerPriceHighlight && (
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '6px 0 4px' }}>
                                      <span style={{ fontSize: 22, fontWeight: 900, color: '#FFFFFF', textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>
                                        {service.bannerPriceHighlight}
                                      </span>
                                      {service.bannerOriginalPrice && (
                                        <span style={{ fontSize: 15, color: '#CBD5E1', textDecoration: 'line-through', fontWeight: 600 }}>
                                          {service.bannerOriginalPrice}
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {service.bannerDiscount && (
                                    <div style={{ fontSize: 24, fontWeight: 900, color: '#FDE047', marginBottom: 4 }}>
                                      {service.bannerDiscount}
                                    </div>
                                  )}

                                  {service.bannerSub && (
                                    <p style={{ fontSize: 13, color: '#F1F5F9', margin: 0, fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                                      {service.bannerSub}
                                    </p>
                                  )}
                                </div>

                                {/* Bottom Pill or Video Subtitle on Banner (Screenshot 3: a timeless tradition) */}
                                {(service.bannerPill || service.bannerSubtitle) && (
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                    fontSize: 13.5,
                                    fontWeight: 700,
                                    color: '#FFFFFF',
                                    textShadow: '0 1px 4px rgba(0,0,0,0.7)'
                                  }}>
                                    <span>{service.bannerPill || service.bannerSubtitle}</span>
                                    {service.hasAudioToggle && (
                                      <div style={{
                                        background: 'rgba(0,0,0,0.55)',
                                        borderRadius: '50%',
                                        width: 28,
                                        height: 28,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#FFFFFF'
                                      }}>
                                        <Volume2 size={14} />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Interactive White Video Scrubber Progress Line (Screenshot 3) */}
                              {service.hasProgressBar && (
                                <div style={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  height: 3,
                                  background: 'rgba(255,255,255,0.25)',
                                  zIndex: 4
                                }}>
                                  <div style={{ width: '42%', height: '100%', background: '#FFFFFF' }} />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Card Content Body */}
                          <div style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18 }}>
                              
                              {/* Left Details */}
                              <div style={{ flex: 1 }}>
                                
                                {/* Tag above title: FREEBIE INCLUDED / BESTSELLER / RECOMMENDED / PACKAGE */}
                                {service.tag && (
                                  <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    color: '#059669',
                                    fontSize: 11,
                                    fontWeight: 900,
                                    letterSpacing: '0.04em',
                                    marginBottom: 6
                                  }}>
                                    {service.tag === 'PACKAGE' && (
                                      <span style={{ width: 6, height: 6, background: '#059669', display: 'inline-block' }} />
                                    )}
                                    <span>{service.tag}</span>
                                  </div>
                                )}

                                {/* Service Title */}
                                <h4 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: '0 0 6px', lineHeight: 1.25 }}>
                                  {service.title}
                                </h4>

                                {/* Star Rating & Review Count */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#64748B', marginBottom: 10 }}>
                                  <span style={{
                                    background: '#6E42E5',
                                    color: '#FFFFFF',
                                    width: 15,
                                    height: 15,
                                    borderRadius: '50%',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 9,
                                    fontWeight: 900
                                  }}>
                                    ★
                                  </span>
                                  <span style={{ fontWeight: 800, color: '#0F172A' }}>{service.rating}</span>
                                  <span>({service.reviewsCount})</span>
                                </div>

                                {/* Price / Duration Line */}
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                                  {service.isPackage || service.duration ? (
                                    <>
                                      <span style={{ fontSize: 17, fontWeight: 900, color: monsoonSurge ? '#0284C7' : '#0F172A' }}>
                                        ₹{livePrice.toLocaleString('en-IN')}
                                      </span>
                                      {liveOriginal && liveOriginal > livePrice && (
                                        <span style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'line-through', fontWeight: 600 }}>
                                          ₹{liveOriginal.toLocaleString('en-IN')}
                                        </span>
                                      )}
                                      {service.duration && (
                                        <span style={{ fontSize: 12.5, color: '#64748B', fontWeight: 600 }}>
                                          • {service.duration}
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      <span style={{ fontSize: 15, fontWeight: 800, color: monsoonSurge ? '#0284C7' : '#0F172A' }}>
                                        Starts at ₹{livePrice.toLocaleString('en-IN')}
                                      </span>
                                    </>
                                  )}
                                  {monsoonSurge && (
                                    <span style={{
                                      fontSize: 10,
                                      fontWeight: 800,
                                      color: '#0284C7',
                                      background: 'rgba(56, 189, 248, 0.12)',
                                      padding: '1px 5px',
                                      borderRadius: 4
                                    }}>
                                      +₹49 Rain Surge
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Right Action: Grey Discount Box for Packages OR Thumbnail + Add Stack for Standard */}
                              {service.isPackage && service.discountPercent ? (
                                <div style={{
                                  background: '#F1F5F9',
                                  borderRadius: 14,
                                  padding: '16px 14px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  minWidth: 108,
                                  gap: 12,
                                  flexShrink: 0
                                }}>
                                  <div style={{ textAlign: 'center', lineHeight: 1 }}>
                                    <div style={{ fontSize: 24, fontWeight: 900, color: '#047857', letterSpacing: -0.5 }}>
                                      {service.discountPercent}%
                                    </div>
                                    <div style={{ fontSize: 13, fontWeight: 900, color: '#047857', letterSpacing: 0.5, marginTop: 2 }}>
                                      OFF
                                    </div>
                                  </div>

                                  {qty === 0 ? (
                                    <button
                                      type="button"
                                      onClick={() => handleAddService(service)}
                                      style={{
                                        background: '#FFFFFF',
                                        border: '1.5px solid #CBD5E1',
                                        borderRadius: 8,
                                        color: '#6E42E5',
                                        fontSize: 13.5,
                                        fontWeight: 800,
                                        padding: '7px 22px',
                                        cursor: 'pointer',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                        transition: 'all 0.15s'
                                      }}
                                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#6E42E5'; e.currentTarget.style.background = '#F5F3FF'; }}
                                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#FFFFFF'; }}
                                    >
                                      Add
                                    </button>
                                  ) : (
                                    <div style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      background: '#FFFFFF',
                                      border: '1.5px solid #6E42E5',
                                      borderRadius: 8,
                                      overflow: 'hidden'
                                    }}>
                                      <button
                                        type="button"
                                        onClick={() => onUpdateQty(service.id, qty - 1)}
                                        style={{ background: 'none', border: 'none', padding: '6px 8px', color: '#6E42E5', cursor: 'pointer' }}
                                      >
                                        <Minus size={12} strokeWidth={3} />
                                      </button>
                                      <span style={{ fontWeight: 800, color: '#6E42E5', fontSize: 12, padding: '0 6px' }}>
                                        {qty}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => onUpdateQty(service.id, qty + 1)}
                                        style={{ background: 'none', border: 'none', padding: '6px 8px', color: '#6E42E5', cursor: 'pointer' }}
                                      >
                                        <Plus size={12} strokeWidth={3} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                  
                                  {/* Thumbnail Image on the Right */}
                                  {service.thumbnailImg && (
                                    <div style={{
                                      width: 104,
                                      height: 90,
                                      borderRadius: 12,
                                      overflow: 'hidden',
                                      border: '1px solid #E2E8F0',
                                      marginBottom: 2
                                    }}>
                                      <img
                                        src={service.thumbnailImg}
                                        alt={service.title}
                                        style={{
                                          width: '100%',
                                          height: '100%',
                                          objectFit: 'cover',
                                          display: 'block'
                                        }}
                                      />
                                    </div>
                                  )}

                                  {qty === 0 ? (
                                    <button
                                      type="button"
                                      onClick={() => handleAddService(service)}
                                      style={{
                                        background: '#FFFFFF',
                                        border: '1.5px solid #6E42E5',
                                        color: '#6E42E5',
                                        borderRadius: 8,
                                        padding: '7px 24px',
                                        fontSize: 13.5,
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                        boxShadow: '0 2px 6px rgba(110, 66, 229, 0.08)',
                                        minWidth: 86
                                      }}
                                      onMouseEnter={e => { e.currentTarget.style.background = '#6E42E5'; e.currentTarget.style.color = '#fff'; }}
                                      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#6E42E5'; }}
                                    >
                                      Add
                                    </button>
                                  ) : (
                                    <div style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      background: '#F5F3FF',
                                      border: '1.5px solid #6E42E5',
                                      borderRadius: 8,
                                      overflow: 'hidden'
                                    }}>
                                      <button
                                        type="button"
                                        onClick={() => onUpdateQty(service.id, qty - 1)}
                                        style={{ background: 'none', border: 'none', padding: '6px 8px', color: '#6E42E5', cursor: 'pointer' }}
                                      >
                                        <Minus size={12} strokeWidth={3} />
                                      </button>
                                      <span style={{ fontWeight: 800, color: '#6E42E5', fontSize: 12, padding: '0 6px' }}>
                                        {qty}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => onUpdateQty(service.id, qty + 1)}
                                        style={{ background: 'none', border: 'none', padding: '6px 8px', color: '#6E42E5', cursor: 'pointer' }}
                                      >
                                        <Plus size={12} strokeWidth={3} />
                                      </button>
                                    </div>
                                  )}

                                  {service.optionsCount && (
                                    <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                                      {service.optionsCount} {service.optionsCount === 1 ? 'option' : 'options'}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Bullet Inclusions */}
                            {service.inclusions && service.inclusions.length > 0 && (
                              <div style={{
                                marginTop: 16,
                                paddingTop: 14,
                                borderTop: '1px solid #F1F5F9',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 6
                              }}>
                                {service.inclusions.map((bullet, idx) => {
                                  const parts = bullet.split(': ');
                                  const hasPrefix = parts.length > 1;
                                  return (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12.5, color: '#475569', lineHeight: 1.4 }}>
                                      <span style={{ color: '#94A3B8', marginTop: 2 }}>•</span>
                                      <span>
                                        {hasPrefix ? (
                                          <>
                                            <strong style={{ color: '#1E293B' }}>{parts[0]}: </strong>
                                            {parts.slice(1).join(': ')}
                                          </>
                                        ) : (
                                          bullet
                                        )}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Footer Action: "Edit your package" pill OR "View details" link */}
                            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
                              {service.hasCustomization ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenCustomize(service)}
                                  style={{
                                    background: '#FFFFFF',
                                    border: '1px solid #CBD5E1',
                                    borderRadius: 8,
                                    padding: '7px 14px',
                                    fontSize: 12.5,
                                    fontWeight: 700,
                                    color: '#1E293B',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    transition: 'all 0.15s'
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.borderColor = '#6E42E5'}
                                  onMouseLeave={e => e.currentTarget.style.borderColor = '#CBD5E1'}
                                >
                                  <SlidersHorizontal size={13} color="#6E42E5" />
                                  <span>Edit your package</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setSelectedDetailService(service)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#6E42E5',
                                    fontSize: 12.5,
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    padding: 0
                                  }}
                                >
                                  View details
                                </button>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </section>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Promo Voucher + UC Promise + Sticky Cart Bar */}
          {/* ========================================================= */}
          <aside style={{ position: 'sticky', top: 84, display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            {/* Promo Voucher Card */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 14,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: 14
                }}>
                  %
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
                    Get 25% off upto 200
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>
                    For new salon users
                  </div>
                </div>
              </div>
              <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700 }}>
                1/2
              </span>
            </div>

            {/* UC Promise Card with Iridescent Quality Assured Badge */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
              position: 'relative'
            }}>
              {/* Iridescent Quality Stamp Badge */}
              <div style={{
                position: 'absolute',
                top: 18,
                right: 18,
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #E0F2FE 0%, #F5D0FE 50%, #DDD6FE 100%)',
                border: '1px solid rgba(147, 51, 234, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <span style={{ fontSize: 7, fontWeight: 900, color: '#6B21A8', textTransform: 'uppercase' }}>QUALITY</span>
                <span style={{ fontSize: 6.5, fontWeight: 800, color: '#1E293B' }}>ASSURED</span>
              </div>

              <h4 style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', margin: '0 0 14px' }}>
                UC Promise
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#334155', fontWeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <Check size={15} color="#059669" strokeWidth={3} />
                  <span>4.5+ Rated Beauticians</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <Check size={15} color="#059669" strokeWidth={3} />
                  <span>Luxury Salon Experience</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <Check size={15} color="#059669" strokeWidth={3} />
                  <span>Premium Branded Products</span>
                </div>
              </div>
            </div>

            {/* Sticky Floating Purple Cart Bar (Only shown when items exist in cart) */}
            {cartCount > 0 && (
              <div style={{
                background: '#6E42E5',
                borderRadius: 14,
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#FFFFFF',
                boxShadow: '0 8px 24px rgba(110, 66, 229, 0.35)',
                cursor: 'pointer',
                transition: 'transform 0.15s'
              }}
              onClick={onOpenCheckout || onOpenCart}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: 900 }}>
                    ₹{cartSubtotal.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 12, color: '#E9D5FF', textDecoration: 'line-through' }}>
                    ₹{Math.round(cartSubtotal * 1.15).toLocaleString('en-IN')}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 800 }}>
                  <span>View Cart</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* 4. "EDIT YOUR PACKAGE" CUSTOMIZATION MODAL */}
      {isCustomizeModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 16
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 18,
            width: '100%',
            maxWidth: 540,
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
                  Edit {customizingPackage?.title || 'Package'}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748B' }}>
                  Personalize your waxing, facial, and mani-pedi preferences
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomizeModalOpen(false)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={16} color="#475569" />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Option 1: Wax Formula */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: 8 }}>
                  1. Waxing Preference
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { name: 'Chocolate roll-on wax', note: 'Single use cartridge, smooth & fast application' },
                    { name: 'Rica White Chocolate Wax', note: 'Italian hypoallergenic formula, colophony-free' },
                    { name: 'Aqua Gel Wax (New)', note: 'Ultra-gentle low heat wax for sensitive skin' }
                  ].map(w => (
                    <label key={w.name} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: selectedWax === w.name ? '1.5px solid #6E42E5' : '1px solid #E2E8F0',
                      background: selectedWax === w.name ? '#F5F3FF' : '#FFFFFF',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="radio"
                        name="wax-choice"
                        checked={selectedWax === w.name}
                        onChange={() => setSelectedWax(w.name)}
                        style={{ accentColor: '#6E42E5' }}
                      />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{w.name}</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>{w.note}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Option 2: Facial / Clean-up */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: 8 }}>
                  2. Facial & Clean-up Ritual
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { name: 'Korean Glass hydration facial', note: 'Fermented essence + cryogenic ice roller therapy' },
                    { name: 'Cherry blossom glow ritual facial', note: 'Sakura extracts for dewy floral brightness' },
                    { name: 'Anti tan brightening cleanup O3 / Kanpeki', note: 'Pure Vitamin C & spot reduction formula' }
                  ].map(f => (
                    <label key={f.name} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: selectedFacial === f.name ? '1.5px solid #6E42E5' : '1px solid #E2E8F0',
                      background: selectedFacial === f.name ? '#F5F3FF' : '#FFFFFF',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="radio"
                        name="facial-choice"
                        checked={selectedFacial === f.name}
                        onChange={() => setSelectedFacial(f.name)}
                        style={{ accentColor: '#6E42E5' }}
                      />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{f.name}</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>{f.note}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Option 3: Mani-Pedi Treatment */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: 8 }}>
                  3. Manicure & Pedicure Selection
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { name: 'Essential mani-pedi combo - with heel peel', note: 'Kojic acid brightness with disposable sealed kits' },
                    { name: 'British rose manicure & candle pedicure', note: 'Warm candle oil reflexology and soft skin care' }
                  ].map(m => (
                    <label key={m.name} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: selectedManiPedi === m.name ? '1.5px solid #6E42E5' : '1px solid #E2E8F0',
                      background: selectedManiPedi === m.name ? '#F5F3FF' : '#FFFFFF',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="radio"
                        name="mani-choice"
                        checked={selectedManiPedi === m.name}
                        onChange={() => setSelectedManiPedi(m.name)}
                        style={{ accentColor: '#6E42E5' }}
                      />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>{m.note}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#0F172A' }}>
                Package Total: ₹{((customizingPackage?.price || 3859) + surgeAmount).toLocaleString('en-IN')}
              </div>
              <button
                type="button"
                onClick={handleSaveCustomization}
                style={{
                  background: '#6E42E5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 20px',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                Apply & Save Package
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. VIEW DETAILS MODAL */}
      {selectedDetailService && !isCustomizeModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 16
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 18,
            width: '100%',
            maxWidth: 500,
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: '#0F172A' }}>
                {selectedDetailService.title}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedDetailService(null)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={16} color="#475569" />
              </button>
            </div>

            <div style={{ padding: '20px 24px', overflowY: 'auto' }}>
              <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.5, margin: '0 0 16px' }}>
                {selectedDetailService.description}
              </p>

              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 10px' }}>
                What is included
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(selectedDetailService.inclusions || []).map((inc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: '#334155' }}>
                    <Check size={14} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{inc}</span>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: 20,
                padding: '14px 16px',
                borderRadius: 12,
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                <ShieldCheck size={24} color="#6E42E5" />
                <div style={{ fontSize: 12, color: '#334155' }}>
                  <strong style={{ color: '#0F172A', display: 'block' }}>100% Genuine Branded Kits</strong>
                  All wax strips, spatulas, and cleanup kits are sealed single-use.
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A' }}>
                ₹{(selectedDetailService.price + surgeAmount).toLocaleString('en-IN')}
              </div>
              <button
                type="button"
                onClick={() => {
                  handleAddService(selectedDetailService);
                  setSelectedDetailService(null);
                }}
                style={{
                  background: '#6E42E5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 22px',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
