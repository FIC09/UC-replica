import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Search, Star, Plus, Minus, Check, ChevronDown, 
  ShoppingBag, Shield, Clock, Sparkles, X, Info, Scissors, Award, Heart,
  Volume2, Play
} from 'lucide-react';

export function HairStudioWomenServicePage({
  onBackHome,
  selectedCity = 'Krishnagiri',
  selectedLocality = '4744+HMQ, N Town Internal Rd-',
  onOpenLocationModal,
  cart = {},
  onAddToCart,
  onUpdateQty,
  onOpenCart,
  onOpenCheckout,
  showToast,
  monsoonSurge = false
}) {
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetailService, setSelectedDetailService] = useState(null);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [customizingPackage, setCustomizingPackage] = useState(null);
  
  // Customization state for Edit Package modal
  const [selectedHaircutOption, setSelectedHaircutOption] = useState('Haircut');
  const [selectedStylingOption, setSelectedStylingOption] = useState('Straight & smooth blow-dry');
  const [selectedHaircareOption, setSelectedHaircareOption] = useState("L'Oreal hair spa");
  const [selectedColorShade, setSelectedColorShade] = useState('Shade 2: Darkest Brown');

  // Categories for Left Sidebar ("Select a service") from Screenshots
  const SERVICE_CATEGORIES = [
    { id: 'all', label: 'All Services', type: 'badge' },
    { id: 'packages', label: 'Packages', image: '/images/hair_cat_packages.png' },
    { id: 'blow-dry', label: 'Blow dry & style', image: '/images/hair_cat_blowdry.png' },
    { id: 'cut-trim', label: 'Cut & trim', image: '/images/hair_cat_cuttrim.png' },
    { id: 'hair-care', label: 'Hair care', image: '/images/hair_cat_haircare.png' },
    { id: 'keratin-botox', label: 'Keratin & botox', image: '/images/hair_cat_keratin.png' },
    { id: 'hair-colour', label: 'Hair colour', image: '/images/hair_cat_haircolour.png' },
    { id: 'extensions', label: 'Hair extensions', image: '/images/hair_cat_extensions.png' },
    { id: 'fashion-color', label: 'Fashion color', image: '/images/hair_cat_fashioncolor.png' }
  ];

  // Full Catalogue of Hair Studio Services matching all 5 Screenshots
  const CATALOGUE_SECTIONS = [
    {
      id: 'packages',
      title: 'Packages',
      services: [
        {
          id: 'haircut-spa-pkg',
          categoryId: 'packages',
          tag: 'PACKAGE',
          title: 'Haircut & spa',
          rating: 4.80,
          reviewsCount: '180K reviews',
          price: 1648,
          originalPrice: 1848,
          duration: '1 hr 45 mins',
          thumbnailImg: '/images/hair_steaming_cap.jpg',
          hasCustomization: true,
          inclusions: [
            "Hair care: L'Oreal hair spa",
            'Haircut: Haircut'
          ],
          description: "Relaxing L'Oreal hair spa with professional nourishing cream bath, warm steam infusion, relaxing scalp massage, and precision custom haircut."
        },
        {
          id: 'hair-spa-style-pkg',
          categoryId: 'packages',
          tag: 'PACKAGE',
          title: 'Hair spa & style',
          rating: 4.81,
          reviewsCount: '172K reviews',
          price: 1498,
          originalPrice: 1698,
          duration: '1 hr 45 mins',
          thumbnailImg: '/images/hair_spa_style.jpg',
          hasCustomization: true,
          inclusions: [
            "Hair care: Deep conditioning salon therapy",
            'Styling: Blow-dry styling'
          ],
          description: 'Intense salon conditioning treatment combined with professional blow-dry styling for soft, camera-ready bounce.'
        },
        {
          id: 'haircut-styling-pkg',
          categoryId: 'packages',
          tag: 'PACKAGE',
          title: 'Haircut & styling',
          rating: 4.81,
          reviewsCount: '279K reviews',
          price: 648,
          originalPrice: 948,
          duration: '1 hr 30 mins',
          thumbnailImg: '/images/hair_wavy_back.jpg',
          hasCustomization: true,
          inclusions: [
            'Haircut: Haircut',
            'Styling: Blow-dry : Straight & smooth'
          ],
          description: 'Precision layered, feather, or bob haircut followed by a sleek straight & smooth high-shine blow-dry.'
        },
        {
          id: 'wedding-ready-group',
          categoryId: 'packages',
          tag: 'VALUE-SAVER',
          title: 'Wedding-ready group hairstyling',
          rating: 4.62,
          reviewsCount: '738 reviews',
          price: 1199,
          optionsCount: 3,
          thumbnailImg: '/images/hair_wedding_group.jpg',
          inclusions: [
            'Group hairstyling with options like blow-dry, straightening, or tong curls'
          ],
          description: 'Multi-person event hairstyling package ideal for weddings, sangeet, and festive family celebrations.'
        },
        {
          id: 'hair-trim-styling-pkg',
          categoryId: 'packages',
          tag: 'PACKAGE',
          title: 'Hair trim & styling',
          rating: 4.81,
          reviewsCount: '172K reviews',
          price: 598,
          originalPrice: 848,
          duration: '1 hr 5 mins',
          thumbnailImg: '/images/hair_trim_style.jpg',
          hasCustomization: true,
          inclusions: [
            'Styling: Blowdry: In-curl / out-curl',
            'Hair trim: Hair trim'
          ],
          description: 'Neat split-end and length maintenance hair trim complemented by glamorous in-curl or out-curl blow-dry styling.'
        },
        {
          id: 'hair-trim-spa-pkg',
          categoryId: 'packages',
          tag: 'PACKAGE',
          title: 'Hair trim & spa',
          rating: 4.80,
          reviewsCount: '72K reviews',
          price: 1548,
          originalPrice: 1748,
          duration: '1 hr 20 mins',
          thumbnailImg: '/images/hair_trim_spa.jpg',
          hasCustomization: true,
          inclusions: [
            'Hair trim: Hair trim',
            "Hair care: L'Oreal hair spa"
          ],
          description: "Nourishing L'Oreal hair spa ritual with warm towel steam, pressure point scalp massage, and precision edge trimming."
        },
        {
          id: 'haircut-color-pkg',
          categoryId: 'packages',
          tag: 'VALUE-SAVER',
          title: 'Haircut & color',
          rating: 4.79,
          reviewsCount: '173K reviews',
          price: 2697,
          originalPrice: 2847,
          discountPercent: 15,
          duration: '1 hr 45 mins',
          hasDiscountBox: true,
          hasCustomization: true,
          inclusions: [
            "Roots: Color (L'Oréal Inoa): Shade 2: Darkest Brown",
            "Roots: Color (L'Oréal Majirel): Shade 3: Dark Brown",
            'Haircut or trim: Haircut'
          ],
          description: "Ammonia-free 100% grey root touch-up with L'Oréal professional colours paired with a flattering haircut."
        },
        {
          id: 'haircut-botox-keratin-pkg',
          categoryId: 'packages',
          tag: 'VALUE-SAVER',
          title: 'Haircut & botox/keratin',
          rating: 4.80,
          reviewsCount: '185K reviews',
          price: 5248,
          originalPrice: 5548,
          duration: '3 hrs 45 mins',
          thumbnailImg: '/images/hair_sleek_keratin.jpg',
          hasCustomization: true,
          inclusions: [
            'Keratin: Long-length',
            'Haircut or trim: Haircut'
          ],
          description: 'Formaldehyde-free luxury keratin / hair botox infusion for mirror-like shine, zero frizz, and fresh cut ends.'
        }
      ]
    },
    {
      id: 'blow-dry',
      title: 'Blow-dry & style',
      services: [
        {
          id: 'straight-smooth-blowdry',
          categoryId: 'blow-dry',
          title: 'Straight & smooth blow-dry',
          rating: 4.85,
          reviewsCount: '64K reviews',
          price: 399,
          duration: '45 mins',
          thumbnailImg: '/images/hair_blowdry_straight.jpg',
          inclusions: [
            'Sleek, smooth & straight hair with a professional blow-dry'
          ],
          description: 'Thermal heat protectant serum application followed by smooth paddle and round brush blow-dry for frizz-free straight locks.'
        },
        {
          id: 'in-curl-out-curl-blowdry',
          categoryId: 'blow-dry',
          title: 'In curl/out curl blow-dry',
          rating: 4.78,
          reviewsCount: '69K reviews',
          price: 399,
          duration: '45 mins',
          thumbnailImg: '/images/hair_blowdry_curl.jpg',
          inclusions: [
            'Beautiful curls, styled in or out, with a perfect blow-dry finish'
          ],
          description: 'Volumizing blowout with sculpted inward or outward cascading curls finished with light-hold shine mist.'
        },
        {
          id: 'advanced-hairstyling',
          categoryId: 'blow-dry',
          tag: 'NEW LAUNCH',
          title: 'Advanced hairstyling',
          rating: 4.64,
          reviewsCount: '771 reviews',
          price: 1000,
          optionsCount: 3,
          thumbnailImg: '/images/hair_advanced_hairstyling.jpg',
          inclusions: [
            'Transform your look with open, half-tie, braids, ponytail, or side hairstyling'
          ],
          description: 'Special occasion and party hairstyling customized with elegant braiding, half-up styling, or glamorous ponytails.'
        },
        {
          id: 'advanced-buns',
          categoryId: 'blow-dry',
          tag: 'NEW LAUNCH',
          title: 'Advanced buns',
          rating: 4.64,
          reviewsCount: '291 reviews',
          price: 1000,
          optionsCount: 3,
          thumbnailImg: '/images/hair_advanced_buns.jpg',
          inclusions: [
            'Transform your look with messy, side, low, high, or textured buns'
          ],
          description: 'Artistic textured wedding and cocktail buns accessorized and pinned with strong all-day hold.'
        },
        {
          id: 'hair-straightening',
          categoryId: 'blow-dry',
          title: 'Hair straightening',
          rating: 4.86,
          reviewsCount: '21K reviews',
          price: 549,
          duration: '45 mins',
          thumbnailImg: '/images/hair_straightening.jpg',
          inclusions: [
            'Transform your hair into a sleek, straight look with long-lasting results'
          ],
          description: 'High-precision ionic ceramic straightening that smooths out curls and creates mirror-like shine.'
        },
        {
          id: 'curls-and-waves',
          categoryId: 'blow-dry',
          title: 'Curls & waves',
          rating: 4.73,
          reviewsCount: '18K reviews',
          price: 549,
          duration: '60 mins',
          thumbnailImg: '/images/hair_curls_waves.jpg',
          inclusions: [
            'Soft curls or waves for a natural, voluminous hairstyle'
          ],
          description: 'Thermal barrel styling for bouncy Hollywood curls, beach waves, or romantic soft spirals.'
        }
      ]
    },
    {
      id: 'cut-trim',
      title: 'Cut & trim',
      services: [
        {
          id: 'haircut-for-women',
          categoryId: 'cut-trim',
          title: 'Haircut for women',
          rating: 4.81,
          reviewsCount: '144K reviews',
          price: 549,
          duration: '45 mins',
          hasVideoBanner: true,
          inclusions: [
            'Expert haircut tailored to your style. Blow dry not included.'
          ],
          description: 'Expert haircut tailored to your style by top salon professionals. Complete consultation, sectioning, and finish.'
        },
        {
          id: 'haircut-for-girls',
          categoryId: 'cut-trim',
          title: 'Haircut for girls',
          rating: 4.81,
          reviewsCount: '8K reviews',
          price: 649,
          duration: '45 mins',
          thumbnailImg: '/images/hair_haircut_girls.jpg',
          inclusions: [
            'A gentle, stylish haircut with care & precision. For girls aged 6-15.'
          ],
          description: 'Patience and gentle precision styling tailored for young girls to look neat, stylish, and confident.'
        },
        {
          id: 'haircut-for-mom-daughter',
          categoryId: 'cut-trim',
          title: 'Haircut for mom & daughter',
          rating: 4.80,
          reviewsCount: '7K reviews',
          price: 949,
          originalPrice: 1199,
          duration: '2 hrs',
          thumbnailImg: '/images/hair_mom_daughter_cut.jpg',
          inclusions: [
            'Hair cut for daughter is for girls aged 6-15 years.'
          ],
          description: 'Delightful pampering session for mother and daughter with custom haircuts and styling.'
        },
        {
          id: 'hair-trim',
          categoryId: 'cut-trim',
          title: 'Hair trim',
          rating: 4.81,
          reviewsCount: '36K reviews',
          price: 449,
          duration: '20 mins',
          thumbnailImg: '/images/hair_trim_scissors.jpg',
          inclusions: [
            'Split-end removal with minimal length reduction. Blow dry not included.'
          ],
          description: 'Quick precision micro-dusting of split ends without compromising hair length.'
        },
        {
          id: 'hair-trim-for-mom-daughter',
          categoryId: 'cut-trim',
          title: 'Hair trim for mom & daughter',
          rating: 4.77,
          reviewsCount: '2K reviews',
          price: 849,
          originalPrice: 899,
          duration: '40 mins',
          thumbnailImg: '/images/hair_mom_daughter_trim.jpg',
          inclusions: [
            'Split-end maintenance trimming combo for both mother and daughter.'
          ],
          description: 'Joint grooming session for healthy split-free hair ends with minimal length loss.'
        }
      ]
    },
    {
      id: 'hair-care',
      title: 'Hair care',
      services: [
        {
          id: 'loreal-hair-spa',
          categoryId: 'hair-care',
          title: "L'Oreal hair spa",
          rating: 4.78,
          reviewsCount: '16K reviews',
          price: 1299,
          duration: '60 mins',
          thumbnailImg: '/images/hair_loreal_spa_cap.jpg',
          inclusions: [
            'Steam therapy to deeply nourish hair from scalp to ends, restoring natural shine'
          ],
          description: "Rejuvenating L'Oreal cream bath, hot towel steam therapy, and relaxing 15-minute scalp acupressure."
        },
        {
          id: 'keratin-hair-spa',
          categoryId: 'hair-care',
          title: 'Keratin hair spa',
          rating: 4.79,
          reviewsCount: '9K reviews',
          price: 1299,
          duration: '60 mins',
          hasVideoBanner: true,
          inclusions: [
            'Natural spa that restores moisture & shine to your hair'
          ],
          description: 'Protein-enriched keratin masque infusion that smooths frizz, locks in moisture, and restores glossy bounce.'
        },
        {
          id: 'ayurvedic-strengthening-hair-spa',
          categoryId: 'hair-care',
          title: 'Ayurvedic strengthening hair spa',
          rating: 4.78,
          reviewsCount: '7K reviews',
          price: 1299,
          duration: '60 mins',
          thumbnailImg: '/images/hair_ayurvedic_spa.jpg',
          inclusions: [
            'Ayurvedic spa with aloe vera & neem to hydrate the scalp'
          ],
          description: 'Herbal cooling mask enriched with pure aloe vera, bhringraj, and neem to strengthen hair follicles from roots.'
        },
        {
          id: 'loreal-hair-repair-mask',
          categoryId: 'hair-care',
          title: 'L’Oréal hair repair mask',
          rating: 4.76,
          reviewsCount: '4K reviews',
          price: 649,
          duration: '40 mins',
          thumbnailImg: '/images/hair_repair_mask_clips.jpg',
          inclusions: [
            'Intensive repair mask therapy to strengthen & restore hair'
          ],
          description: 'Intense micro-keratin reconstructor applied section by section to repair split cuticles and color damage.'
        },
        {
          id: 'hair-studio-head-massage',
          categoryId: 'hair-care',
          title: 'Head massage',
          rating: 4.78,
          reviewsCount: '5K reviews',
          price: 349,
          duration: '20 mins',
          thumbnailImg: '/images/hair_head_massage_relax.jpg',
          inclusions: [
            'Gentle massage to help promote blood flow, reduce stress & nourish the scalp',
            'Hair wash & blow-dry not included'
          ],
          description: 'Pressure point focused Indian head massage using warm almond or coconut oil for instant mental and physical relaxation.'
        }
      ]
    },
    {
      id: 'keratin-botox',
      title: 'Keratin & botox',
      services: [
        {
          id: 'hair-keratin-service',
          categoryId: 'keratin-botox',
          title: 'Hair keratin',
          rating: 4.62,
          reviewsCount: '2K reviews',
          price: 3999,
          optionsCount: 2,
          thumbnailImg: '/images/hair_keratin_split.jpg',
          inclusions: [
            'Keratin treatment smoothens hair for a shiny, frizz-free look'
          ],
          description: 'Semi-permanent hair smoothing treatment that reduces volume and shields hair against humidity for up to 4 months.'
        },
        {
          id: 'hair-botox-service',
          categoryId: 'keratin-botox',
          tag: 'BESTSELLER',
          title: 'Hair botox',
          rating: 4.54,
          reviewsCount: '3K reviews',
          price: 5499,
          duration: '3 hrs',
          thumbnailImg: '/images/hair_botox_glossy.jpg',
          inclusions: [
            'Single-session treatment to repair damaged, frizzy hair & promote healthy scalp'
          ],
          description: 'Deep conditioning anti-aging hair treatment that fills in damaged fiber gaps, restores elasticity, and delivers mirror-like gloss.'
        }
      ]
    },
    {
      id: 'hair-colour',
      title: 'Hair colour',
      services: [
        {
          id: 'hair-colour-application-only',
          categoryId: 'hair-colour',
          title: 'Hair colour (application only)',
          rating: 4.80,
          reviewsCount: '57K reviews',
          price: 399,
          optionsCount: 2,
          hasVideoBanner: true,
          inclusions: [
            'Even application of the chosen shade from root to tip'
          ],
          description: 'Expert sectioning and mess-free application of your own hair colour by trained salon professionals.'
        },
        {
          id: 'loreal-inoa-root-touchup',
          categoryId: 'hair-colour',
          title: "L'Oréal Inoa root touch-up",
          rating: 4.70,
          reviewsCount: '20K reviews',
          price: 1299,
          optionsCount: 4,
          thumbnailImg: '/images/hair_inoa_root_touchup.jpg',
          inclusions: [
            "Gentle, long-lasting root touch-up with L'Oréal Inoa shades"
          ],
          description: "Ammonia-free gentle 100% grey coverage with oil-delivery system for long-lasting vibrant roots."
        },
        {
          id: 'loreal-majirel-root-touchup',
          categoryId: 'hair-colour',
          title: "L'Oréal Majirel root touch-up",
          rating: 4.73,
          reviewsCount: '9K reviews',
          price: 999,
          optionsCount: 3,
          thumbnailImg: '/images/hair_majirel_root_touchup.jpg',
          inclusions: [
            "Gentle, long-lasting root touch-up with L'Oréal Majirel shades"
          ],
          description: "Classic rich conditioning root coverage providing deep rich tones and complete grey concealment."
        },
        {
          id: 'loreal-inoa-global-color',
          categoryId: 'hair-colour',
          title: "L'Oréal Inoa global color",
          rating: 4.63,
          reviewsCount: '4K reviews',
          price: 2699,
          optionsCount: 4,
          thumbnailImg: '/images/hair_inoa_global_color.jpg',
          inclusions: [
            'Even application of the chosen shade from root to tip'
          ],
          description: "Ammonia-free full head color treatment delivering intense reflection and optimum scalp comfort."
        },
        {
          id: 'loreal-majirel-global-colour',
          categoryId: 'hair-colour',
          title: "L'Oréal Majirel global colour",
          rating: 4.66,
          reviewsCount: '1K reviews',
          price: 2399,
          optionsCount: 3,
          thumbnailImg: '/images/hair_majirel_global_color.jpg',
          inclusions: [
            'Even application of the chosen shade from root to tip'
          ],
          description: "Full hair transformation with Ionène G & Incell technology for high-shine chromatic longevity."
        }
      ]
    },
    {
      id: 'extensions',
      title: 'Hair extensions',
      services: [
        {
          id: 'scalp-toppers',
          categoryId: 'extensions',
          title: 'Scalp toppers',
          rating: 4.82,
          reviewsCount: '1.2K reviews',
          price: 6499,
          duration: '60 mins',
          isStartsAt: true,
          thumbnailImg: '/images/hair_scalp_toppers.jpg',
          inclusions: [
            'Conceals thinning & bald patches on your scalp',
            '100% human hair & silk base toppers by Hair Originals'
          ],
          description: 'Lightweight, breathable silk base toppers crafted from 100% natural human hair to conceal thinning crowns and add instant volume.'
        },
        {
          id: 'clip-in-hair-extensions',
          categoryId: 'extensions',
          title: 'Clip-in Hair Extensions Styling',
          rating: 4.75,
          reviewsCount: '14K reviews',
          price: 1499,
          duration: '1 hr',
          thumbnailImg: '/images/hair_wedding_group.jpg',
          inclusions: [
            'Seamless volume and length blending for special occasions'
          ],
          description: 'Expert sectioning, secure placement, and thermal blending of your clip-in human hair wefts.'
        }
      ]
    },
    {
      id: 'fashion-color',
      title: 'Fashion color',
      services: [
        {
          id: 'loreal-balayage-ombre-color',
          categoryId: 'fashion-color',
          title: "L'Oréal balayage/ombre color",
          rating: 4.48,
          reviewsCount: '2K reviews',
          price: 3899,
          optionsCount: 4,
          thumbnailImg: '/images/hair_balayage_ombre.jpg',
          inclusions: [
            'Seamless application of the chosen shade with a soft color transition',
            'Blow-dry & hair wash is not included'
          ],
          description: 'Artistic dimensional gradient lighting creating natural sun-kissed depth from mid-lengths to ends.'
        },
        {
          id: 'loreal-hair-highlights',
          categoryId: 'fashion-color',
          title: 'Loreal Hair Highlights',
          rating: 4.56,
          reviewsCount: '1K reviews',
          price: 3499,
          optionsCount: 4,
          thumbnailImg: '/images/hair_highlights_caramel.jpg',
          inclusions: [
            'Precise application of chosen shade on closely spaced sections',
            'Blow-dry & hair wash is not included'
          ],
          description: 'Foil-placed streak highlights to accentuate natural hair texture and create brilliant contrasting dimension.'
        },
        {
          id: 'loreal-inoa-shades',
          categoryId: 'fashion-color',
          title: "L'Oréal Inoa shades",
          rating: 4.48,
          reviewsCount: '721 reviews',
          price: 2999,
          optionsCount: 3,
          hasVideoBanner: true,
          videoPoster: '/images/hair_inoa_shades_banner.jpg',
          inclusions: [
            "L'Oreal Inoa base colour with fashion shades for vibrant, ammonia-free hair"
          ],
          description: 'Trendy vibrant fashion hues powered by ammonia-free Inoa oil delivery technology for high-fashion brilliance.'
        },
        {
          id: 'loreal-majirel-shades',
          categoryId: 'fashion-color',
          title: "L'Oréal Majirel shades",
          rating: 4.61,
          reviewsCount: '848 reviews',
          price: 2599,
          optionsCount: 3,
          thumbnailImg: '/images/hair_majirel_shades_waves.jpg',
          inclusions: [
            "L'Oreal Majirel base colour with fashion shades for vibrant, ammonia-free hair"
          ],
          description: "Vibrant multi-dimensional fashion shades from L'Oréal Majirel collection for intense luminous results."
        },
        {
          id: 'loreal-inoa-fashion-root-touchup',
          categoryId: 'fashion-color',
          title: "L'Oréal Inoa root touch-up",
          rating: 4.66,
          reviewsCount: '1K reviews',
          price: 1499,
          optionsCount: 3,
          thumbnailImg: '/images/hair_inoa_root_touchup.jpg',
          inclusions: [
            'Hair wash not included',
            'Base hair color of Loreal Inoa or Loreal Majirel will be used with fashion shade'
          ],
          description: 'Targeted regrowth touch-up formulated to seamlessly blend with existing Inoa or Majirel fashion shades.'
        },
        {
          id: 'loreal-majirel-fashion-root-touchup',
          categoryId: 'fashion-color',
          title: "L'Oréal Majirel root touch-up",
          rating: 4.67,
          reviewsCount: '738 reviews',
          price: 1299,
          optionsCount: 3,
          thumbnailImg: '/images/hair_majirel_root_touchup.jpg',
          inclusions: [
            'Hair wash not included',
            'Base hair color of Loreal Inoa or Loreal Majirel will be used with fashion shade'
          ],
          description: 'Quick precision root color maintenance blended with complementary fashion shade nuances.'
        }
      ]
    }
  ];

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
      serviceCategory: 'women-hair-services'
    });
    showToast(`✨ Added "${svc.title}" to cart`);
  }

  function handleOpenCustomize(pkg) {
    setCustomizingPackage(pkg);
    setIsCustomizeModalOpen(true);
  }

  function handleSaveCustomization() {
    setIsCustomizeModalOpen(false);
    showToast(`✅ Customized "${customizingPackage?.title || 'Package'}": ${selectedHaircutOption} + ${selectedStylingOption}`);
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
    <div className="hair-studio-page" style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 100, color: '#0F172A', fontFamily: 'inherit' }}>
      
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
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          
          {/* Left: Back Arrow + UC Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div 
              onClick={onBackHome}
              style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}
            >
              <div style={{
                background: '#000000',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: 12,
                padding: '4px 6px',
                borderRadius: 7,
                letterSpacing: 0
              }}>
                FIC
              </div>
              <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.4, color: '#0F172A' }}>
                Forge India Connect
              </span>
            </div>
          </div>

          {/* Center: Location Pill + Search Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, maxWidth: 650, margin: '0 20px' }}>
            
            {/* Location Pill */}
            <button
              type="button"
              onClick={onOpenLocationModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: 10,
                padding: '8px 14px',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                color: '#1E293B',
                maxWidth: 240,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              <span style={{ color: '#64748B' }}>📍</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedLocality}</span>
              <ChevronDown size={14} color="#64748B" />
            </button>

            {/* Search Input */}
            <div style={{
              position: 'relative',
              flex: 1,
              display: 'flex',
              alignItems: 'center'
            }}>
              <Search 
                size={16} 
                color="#64748B" 
                style={{ position: 'absolute', left: 14, pointerEvents: 'none' }} 
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in Hair Studio for Women"
                style={{
                  width: '100%',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: 10,
                  padding: '9px 14px 9px 38px',
                  fontSize: 13.5,
                  color: '#0F172A',
                  outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#6E42E5'; e.target.style.boxShadow = '0 0 0 3px rgba(110,66,229,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none'; }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: 12,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Right: Cart Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={onOpenCart}
              style={{
                position: 'relative',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 10,
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 13,
                color: '#0F172A'
              }}
            >
              <ShoppingBag size={18} color="#6E42E5" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span style={{
                  background: '#6E42E5',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  fontSize: 11,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800
                }}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* 2. MAIN 3-COLUMN LAYOUT */}
      <div style={{ maxWidth: 1240, margin: '24px auto', padding: '0 20px' }}>
        
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

            {/* Service Grid Tiles (3 Columns matching Screenshots) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {SERVICE_CATEGORIES.map(cat => {
                const isActive = activeCategoryTab === cat.id;

                if (cat.type === 'badge') {
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryTileClick(cat.id)}
                      style={{
                        gridColumn: '1 / -1',
                        background: isActive ? '#6E42E5' : '#F8FAFC',
                        color: isActive ? '#FFFFFF' : '#475569',
                        border: '1px solid #E2E8F0',
                        borderRadius: 10,
                        padding: '8px 12px',
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: 'pointer',
                        marginBottom: 4,
                        transition: 'all 0.15s'
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                }

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryTileClick(cat.id)}
                    style={{
                      background: isActive ? '#F5F3FF' : '#FFFFFF',
                      border: isActive ? '1.5px solid #6E42E5' : '1px solid #E2E8F0',
                      borderRadius: 12,
                      padding: '8px 4px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      cursor: 'pointer',
                      minHeight: 88,
                      justifyContent: 'center',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      overflow: 'hidden',
                      marginBottom: 6,
                      background: '#F8FAFC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <img
                        src={cat.image}
                        alt={cat.label}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                    <span style={{
                      fontSize: 11,
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? '#6E42E5' : '#1E293B',
                      lineHeight: 1.25
                    }}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ========================================================= */}
          {/* CENTER COLUMN: Service Sections List                      */}
          {/* ========================================================= */}
          <main style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 32 }}>
            
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
                  Try searching for haircut, blow dry, keratin, or clear the search.
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
                          {/* Top Video Banner (Screenshot 3: Haircut for women, Screenshot 5: Inoa shades) */}
                          {service.hasVideoBanner && (
                            <div style={{
                              position: 'relative',
                              width: '100%',
                              height: 220,
                              background: '#F1F5F9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden'
                            }}>
                              {service.videoPoster && (
                                <img
                                  src={service.videoPoster}
                                  alt={service.title}
                                  style={{
                                    position: 'absolute',
                                    inset: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                />
                              )}

                              {/* Big Play Button circle matching Screenshot 3 & 5 */}
                              <div style={{
                                position: 'relative',
                                zIndex: 2,
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                background: 'rgba(100, 116, 139, 0.45)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#FFFFFF',
                                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                                cursor: 'pointer'
                              }}>
                                <Play size={22} fill="#FFFFFF" color="#FFFFFF" style={{ marginLeft: 3 }} />
                              </div>

                              {/* Mute icon at bottom right matching Screenshot 3 & 5 */}
                              <div style={{
                                position: 'absolute',
                                zIndex: 2,
                                bottom: 14,
                                right: 18,
                                color: service.videoPoster ? '#FFFFFF' : '#94A3B8'
                              }}>
                                <Volume2 size={18} />
                              </div>
                            </div>
                          )}

                          {/* Card Content Body */}
                          <div style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18 }}>
                              
                              {/* Left Details */}
                              <div style={{ flex: 1 }}>
                                
                                {/* Tag above title: PACKAGE / VALUE-SAVER */}
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
                                    <span style={{ width: 6, height: 6, background: '#059669', display: 'inline-block' }} />
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
                                  {service.duration ? (
                                    <>
                                      <span style={{ fontSize: 17, fontWeight: 900, color: '#0F172A' }}>
                                        {service.isStartsAt ? 'Starts at ' : ''}₹{livePrice.toLocaleString('en-IN')}
                                      </span>
                                      {liveOriginal && liveOriginal > livePrice && (
                                        <span style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'line-through', fontWeight: 600 }}>
                                          ₹{liveOriginal.toLocaleString('en-IN')}
                                        </span>
                                      )}
                                      <span style={{ fontSize: 12.5, color: '#64748B', fontWeight: 600 }}>
                                        • {service.duration}
                                      </span>
                                    </>
                                  ) : (
                                    <span style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
                                      Starts at ₹{livePrice.toLocaleString('en-IN')}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Right Action: 15% OFF Box OR Photo Thumbnail + Add Button */}
                              {service.hasDiscountBox ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                                  <div style={{
                                    background: '#F1F5F9',
                                    borderRadius: 14,
                                    padding: '14px 20px',
                                    textAlign: 'center',
                                    minWidth: 108
                                  }}>
                                    <div style={{ fontSize: 24, fontWeight: 900, color: '#047857', letterSpacing: -0.5 }}>
                                      15%
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
                                        border: '1.5px solid #6E42E5',
                                        color: '#6E42E5',
                                        borderRadius: 8,
                                        padding: '7px 24px',
                                        fontSize: 13.5,
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                        minWidth: 86
                                      }}
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
                                </div>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                  
                                  {/* Thumbnail Image */}
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

                            {/* Action Row: "Edit your package" OR "View details" */}
                            <div style={{
                              marginTop: 14,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: 10
                            }}>
                              {service.hasCustomization ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenCustomize(service)}
                                  style={{
                                    background: '#FFFFFF',
                                    border: '1px solid #CBD5E1',
                                    borderRadius: 8,
                                    color: '#0F172A',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    padding: '7px 18px',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s'
                                  }}
                                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#6E42E5'; e.currentTarget.style.color = '#6E42E5'; }}
                                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#0F172A'; }}
                                >
                                  Edit your package
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setSelectedDetailService(service)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#6E42E5',
                                    fontSize: 13,
                                    fontWeight: 700,
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
          </main>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Promo Coupon + UC Promise Card              */}
          {/* ========================================================= */}
          <aside style={{
            position: 'sticky',
            top: 84,
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            
            {/* Promo Coupon Card (HAIRSTUDIO25 from Screenshot 1 & 2) */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 16,
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
                fontWeight: 900,
                fontSize: 16,
                flexShrink: 0
              }}>
                %
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#0F172A', letterSpacing: 0.2 }}>
                  HAIRSTUDIO25
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                  25% off on hair services
                </div>
              </div>
            </div>

            {/* UC Promise Card (Matching all 5 Screenshots) */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 16,
              padding: '22px 20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h4 style={{ fontSize: 17, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  UC Promise
                </h4>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #E0F2FE 0%, #F5F3FF 100%)',
                  border: '1px solid #CBD5E1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 8,
                  fontWeight: 900,
                  color: '#0284C7',
                  textAlign: 'center',
                  lineHeight: 1.1
                }}>
                  QUALITY<br />ASSURED
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, color: '#334155' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Check size={16} strokeWidth={3} color="#059669" />
                  <span style={{ fontWeight: 600 }}>Verified Professionals</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Check size={16} strokeWidth={3} color="#059669" />
                  <span style={{ fontWeight: 600 }}>Hassle Free Booking</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Check size={16} strokeWidth={3} color="#059669" />
                  <span style={{ fontWeight: 600 }}>Transparent Pricing</span>
                </div>
              </div>
            </div>

            {/* Floating Purple Cart Button */}
            {cartCount > 0 && (
              <div style={{
                background: '#6E42E5',
                borderRadius: 12,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#FFFFFF',
                boxShadow: '0 4px 16px rgba(110,66,229,0.35)',
                cursor: 'pointer'
              }}
              onClick={onOpenCart}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900 }}>
                    ₹{cartSubtotal.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.85 }}>
                    {cartCount} {cartCount === 1 ? 'service' : 'services'} added
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onOpenCart(); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  View Cart →
                </button>
              </div>
            )}

          </aside>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. "EDIT YOUR PACKAGE" MODAL                              */}
      {/* ========================================================= */}
      {isCustomizeModalOpen && customizingPackage && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 20,
            width: '100%',
            maxWidth: 520,
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 26,
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, borderBottom: '1px solid #E2E8F0', paddingBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  Customize Package
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748B' }}>
                  {customizingPackage.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomizeModalOpen(false)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Customization Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Option 1: Haircut vs Trim */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: 8 }}>
                  1. Haircut or Trim
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {['Haircut', 'Hair trim'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedHaircutOption(opt)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: selectedHaircutOption === opt ? '1.5px solid #6E42E5' : '1px solid #CBD5E1',
                        background: selectedHaircutOption === opt ? '#F5F3FF' : '#FFFFFF',
                        color: selectedHaircutOption === opt ? '#6E42E5' : '#1E293B',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer'
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 2: Styling */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: 8 }}>
                  2. Blow-dry Finish
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { name: 'Straight & smooth blow-dry', note: 'Sleek, glossy straight hair' },
                    { name: 'In-curl / out-curl blow-dry', note: 'Soft cascading bouncy waves' }
                  ].map(s => (
                    <label key={s.name} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: selectedStylingOption === s.name ? '1.5px solid #6E42E5' : '1px solid #E2E8F0',
                      background: selectedStylingOption === s.name ? '#F5F3FF' : '#FFFFFF',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="radio"
                        name="hair-styling-option"
                        checked={selectedStylingOption === s.name}
                        onChange={() => setSelectedStylingOption(s.name)}
                        style={{ accentColor: '#6E42E5' }}
                      />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{s.name}</div>
                        <div style={{ fontSize: 11.5, color: '#64748B' }}>{s.note}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Option 3: Haircare Masque */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: 8 }}>
                  3. Hair Care Therapy
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { name: "L'Oreal hair spa", note: 'Hydrating cream bath with steam infusion' },
                    { name: 'Deep nourishing therapy', note: 'Argan oil restorative cuticle seal' }
                  ].map(c => (
                    <label key={c.name} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: selectedHaircareOption === c.name ? '1.5px solid #6E42E5' : '1px solid #E2E8F0',
                      background: selectedHaircareOption === c.name ? '#F5F3FF' : '#FFFFFF',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="radio"
                        name="hair-care-option"
                        checked={selectedHaircareOption === c.name}
                        onChange={() => setSelectedHaircareOption(c.name)}
                        style={{ accentColor: '#6E42E5' }}
                      />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{c.name}</div>
                        <div style={{ fontSize: 11.5, color: '#64748B' }}>{c.note}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Bottom Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, marginTop: 26, paddingTop: 16, borderTop: '1px solid #E2E8F0' }}>
              <button
                type="button"
                onClick={() => setIsCustomizeModalOpen(false)}
                style={{
                  background: 'none',
                  border: '1px solid #CBD5E1',
                  borderRadius: 10,
                  padding: '9px 18px',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCustomization}
                style={{
                  background: '#6E42E5',
                  border: 'none',
                  borderRadius: 10,
                  padding: '9px 24px',
                  fontWeight: 800,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(110,66,229,0.25)'
                }}
              >
                Save & Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. "VIEW DETAILS" MODAL                                   */}
      {/* ========================================================= */}
      {selectedDetailService && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 20,
            width: '100%',
            maxWidth: 480,
            padding: 26,
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                {selectedDetailService.title}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedDetailService(null)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748B', marginBottom: 16 }}>
              <span style={{ color: '#F59E0B', fontWeight: 800 }}>★ {selectedDetailService.rating}</span>
              <span>({selectedDetailService.reviewsCount})</span>
              {selectedDetailService.duration && <span>• {selectedDetailService.duration}</span>}
            </div>

            <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.5, margin: '0 0 20px' }}>
              {selectedDetailService.description}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#0F172A' }}>
                ₹{selectedDetailService.price.toLocaleString('en-IN')}
              </div>
              <button
                type="button"
                onClick={() => {
                  handleAddService(selectedDetailService);
                  setSelectedDetailService(null);
                }}
                style={{
                  background: '#6E42E5',
                  border: 'none',
                  borderRadius: 10,
                  padding: '9px 24px',
                  fontWeight: 800,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  color: '#FFFFFF'
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
