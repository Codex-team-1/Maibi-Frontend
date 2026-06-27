/**
 * English string catalog — the source of truth for all translation keys.
 * `ar.ts` must provide a value for every key here (enforced at compile time).
 *
 * Use `{var}` placeholders for interpolated values; pass them to `t(key, vars)`.
 */
export const en = {
  /* ── Common ─────────────────────────────────────────────────────────────── */
  'common.back': 'Back',
  'common.backToShop': 'Back to shop',
  'common.backToHome': 'Back to home',
  'common.backToStore': 'Back to store',
  'common.continueShopping': 'Continue shopping',
  'common.continue': 'Continue',
  'common.edit': 'Edit',
  'common.clearAll': 'Clear all',
  'common.loading': 'Loading…',
  'common.soldOut': 'Sold out',
  'common.save': 'Save',
  'common.currency': 'DA',

  /* ── Language switcher ──────────────────────────────────────────────────── */
  'lang.switchTo': 'العربية',
  'lang.label': 'Language',

  /* ── Header / nav ───────────────────────────────────────────────────────── */
  'nav.shop': 'Shop',
  'nav.dresses': 'Dresses',
  'nav.robes': 'Robes',
  'nav.newIn': 'New in',
  'nav.customOrder': 'Custom order',
  'nav.ourStory': 'Our story',
  'nav.searchPlaceholder': 'Search pieces…',
  'nav.wishlist': 'Wishlist',
  'nav.cart': 'Cart',
  'nav.search': 'Search',

  /* ── Mobile bottom nav ──────────────────────────────────────────────────── */
  'bottomNav.home': 'Home',
  'bottomNav.shop': 'Shop',
  'bottomNav.saved': 'Saved',
  'bottomNav.custom': 'Custom',
  'bottomNav.cart': 'Cart',

  /* ── Footer ─────────────────────────────────────────────────────────────── */
  'footer.tagline':
    'Hand-embroidered, limited-edition clothing made with care by Algerian artisans.',
  'footer.shop': 'Shop',
  'footer.services': 'Services',
  'footer.myAccount': 'My account',
  'footer.newIn': 'New in',
  'footer.dresses': 'Dresses',
  'footer.robes': 'Robes',
  'footer.abayas': 'Abayas',
  'footer.customOrder': 'Custom order',
  'footer.wishlist': 'Wishlist',
  'footer.myBag': 'My bag',
  'footer.checkout': 'Checkout',
  'footer.madeBy': 'Made by',
  'footer.inAlgeria': 'in Algeria',

  /* ── Home — hero ────────────────────────────────────────────────────────── */
  'home.heroBrand': 'Maibi,',
  'home.heroCraftedWithSoul': 'crafted with soul.',
  'home.heroSubtitleA': 'Handmade fashion by Algerian artisans.',
  'home.heroSubtitleB': 'Limited pieces. Timeless details. Made to be unique.',
  'home.shopTheDrop': 'Shop the drop',
  'home.requestCustomPiece': 'Request custom piece',
  'home.lovedByPrefix': 'Loved by',
  'home.lovedBySuffix': 'women',

  /* ── Home — feature items ───────────────────────────────────────────────── */
  'home.featHandmade': 'Handmade',
  'home.featHandmadeDesc': 'crafted with love',
  'home.featHeritage': 'Cultural heritage',
  'home.featHeritageDesc': 'in every detail',
  'home.featLimited': 'Limited pieces',
  'home.featLimitedDesc': 'never mass produced',
  'home.featPackaged': 'Carefully packaged',
  'home.featPackagedDesc': 'delivered with care',

  /* ── Home — marquee ─────────────────────────────────────────────────────── */
  'home.marqueeHandEmbroidered': 'Hand-embroidered',
  'home.marqueeLimitedEdition': 'Limited edition',
  'home.marqueeSlowFashion': 'Slow fashion',
  'home.marqueeMadeInAlgeria': 'Made in Algeria',
  'home.marqueeCustomOrders': 'Custom orders',
  'home.marqueeOneOfAKind': 'One of a kind',
  'home.marqueeAlgerianArtisans': 'Algerian artisans',
  'home.marqueeWearableArt': 'Wearable art',

  /* ── Home — sections ────────────────────────────────────────────────────── */
  'home.featuredPieces': 'Featured pieces',
  'home.featuredSub': 'Our most-loved pieces this season',
  'home.viewAll': 'View all',
  'home.newArrivals': 'New arrivals',
  'home.newArrivalsSub': 'Fresh from our artisans — just arrived',
  'home.shopAll': 'Shop all',

  /* ── Home — our story ───────────────────────────────────────────────────── */
  'home.ourStory': 'Our Story',
  'home.storyQuoteMobile': '"Each stitch is a word. Each garment is a story."',
  'home.storyQuoteDesktop':
    'Each stitch is a word. Each garment is a story told with thread.',
  'home.storyAuthor': 'Maibi artisans, Algeria',
  'home.storyHeadingA': 'Craft handed down',
  'home.storyHeadingB': 'through generations',
  'home.storyBodyMobile':
    'Maibi was born from a love of Algerian embroidery — passed from grandmother to granddaughter in Algeria. Every piece is hand-stitched by women artisans who have spent years mastering the craft.',
  'home.storyBodyDesktop':
    'Maibi was born from a love of Algerian embroidery — the kind passed from grandmother to granddaughter in Algeria. Every piece in our collection is hand-stitched by women artisans who have spent years mastering the craft.',
  'home.storyProp1': 'Limited runs — slow, intentional, never mass-produced',
  'home.storyProp2':
    'Rooted in 3 Algerian cities, each with its own embroidery tradition',
  'home.storyProp3': '5+ women artisans, 100+ one-of-a-kind pieces and counting',
  'home.statArtisans': 'Artisans',
  'home.statPieces': 'Pieces',
  'home.statPiecesMade': 'Pieces made',
  'home.statCities': 'Cities',
  'home.discoverCollection': 'Discover the collection',
  'home.customOrder': 'Custom order',

  /* ── Home — custom order banner ─────────────────────────────────────────── */
  'home.bespokeService': 'Bespoke service',
  'home.yourVisionA': 'Your vision,',
  'home.yourVisionB': 'crafted by hand',
  'home.bannerBody':
    "Can't find exactly what you're looking for? Send us a photo and describe your dream piece — our artisans will bring it to life, stitch by stitch.",
  'home.startCustomOrder': 'Start your custom order',
  'home.browseReadyMade': 'Browse ready-made',
  'home.bannerNoPayment': 'No upfront payment',
  'home.bannerNoPaymentSub': 'Pay after quote',
  'home.bannerResponse': '48h response',
  'home.bannerResponseSub': 'Fast turnaround',
  'home.bannerWhatsapp': 'WhatsApp support',
  'home.bannerWhatsappSub': 'Direct with artisans',

  /* ── Reviews carousel ───────────────────────────────────────────────────── */
  'reviews.title': 'Customer reviews',
  'reviews.summary': '4.9 · 200+ verified customers',
  'reviews.verified': 'Verified',

  /* ── Shop ───────────────────────────────────────────────────────────────── */
  'shop.title': 'Shop all',
  'shop.countOne': '{count} piece',
  'shop.countMany': '{count} pieces',
  'shop.forQuery': ' for "{query}"',
  'shop.filters': 'Filters',
  'shop.sortBy': 'Sort by',
  'shop.inStock': 'In stock',
  'shop.gridView': 'grid view',
  'shop.listView': 'list view',
  'shop.removeFilter': 'Remove {label} filter',
  'shop.loadingPieces': 'Loading pieces…',
  'shop.noMatchTitle': 'No pieces match your filters',
  'shop.noMatchBody': 'Try broadening your search or clearing some filters.',
  'shop.clearAllFilters': 'Clear all filters',
  'shop.loadMore': 'Load more',

  /* ── Sort options ───────────────────────────────────────────────────────── */
  'sort.featured': 'Featured',
  'sort.new': 'New arrivals',
  'sort.priceAsc': 'Price: low to high',
  'sort.priceDesc': 'Price: high to low',
  'sort.limited': 'Limited editions',

  /* ── Filter labels (badge labels) ───────────────────────────────────────── */
  'filterLabel.Featured': 'Featured',
  'filterLabel.Trending': 'Trending',
  'filterLabel.New': 'New',

  /* ── Filter sections ────────────────────────────────────────────────────── */
  'filter.category': 'Category',
  'filter.availability': 'Availability',
  'filter.inStockOnly': 'In stock only',
  'filter.labels': 'Labels',
  'filter.closeFilters': 'Close filters',
  'filter.showResultsOne': 'Show {count} result',
  'filter.showResultsMany': 'Show {count} results',

  /* ── Badge labels (on product cards) ────────────────────────────────────── */
  'badge.Featured': 'Featured',
  'badge.Trending': 'Trending',
  'badge.New': 'New',

  /* ── Product ────────────────────────────────────────────────────────────── */
  'product.loadingPiece': 'Loading piece…',
  'product.notFound': 'Product not found.',
  'product.reviewOne': '{count} review',
  'product.reviewMany': '{count} reviews',
  'product.noReviews': 'No reviews yet',
  'product.sale': '-{percent}% sale',
  'product.daysLeft': '{days}d {hours}h left',
  'product.timeLeft': '{time} left',
  'product.onlyLeft': 'Only {count} left — almost gone!',
  'product.leftSellingFast': '{count} left — selling fast',
  'product.inStockCount': '{count} in stock',
  'product.currentlyUnavailable': 'Currently unavailable',
  'product.shipsIn': 'Ships in 3–5 business days',
  'product.size': 'Size',
  'product.color': 'Color',
  'product.selectColor': 'select one',
  'product.added': '♥ Added',
  'product.addToBag': 'Add to bag',
  'product.removeFromWishlist': 'Remove from wishlist',
  'product.addToWishlist': 'Add to wishlist',
  'product.viewPiece': 'View piece',
  'product.view': 'View',

  /* ── Cart drawer ────────────────────────────────────────────────────────── */
  'cart.title': 'Your bag',
  'cart.closeCart': 'Close cart',
  'cart.removeItem': 'Remove item',
  'cart.empty': 'Your bag is empty.',
  'cart.size': 'Size {size}',
  'cart.subtotal': 'Subtotal',
  'cart.shippingAtCheckout': 'Shipping calculated at checkout',
  'cart.checkout': 'Checkout',

  /* ── Wishlist ───────────────────────────────────────────────────────────── */
  'wishlist.title': 'Saved pieces',
  'wishlist.loading': 'Loading your saved pieces…',
  'wishlist.emptyTitle': 'Your wishlist is empty',
  'wishlist.emptyBody': "Heart a piece while browsing and it'll appear here.",
  'wishlist.discoverPieces': 'Discover pieces',
  'wishlist.addToBag': 'Add to bag',
  'wishlist.notReserved':
    "Items saved won't be reserved — limited editions go fast.",
  'wishlist.clear': 'Clear wishlist',

  /* ── Custom order ───────────────────────────────────────────────────────── */
  'custom.stepPhoto': 'Your photo',
  'custom.stepSizeColor': 'Size & color',
  'custom.stepContact': 'Contact',
  'custom.sizeCustomFit': 'Custom fit',
  'custom.requestReceived': 'Request received!',
  'custom.requestReceivedBody':
    'Thank you, {name}. Our artisans will review your request and reach out within 48 hours at {email}.',
  'custom.summaryNotes': 'Notes',
  'custom.bespokeService': 'Bespoke service',
  'custom.title': 'Custom order',
  'custom.subtitle':
    'Share your vision — our artisans will craft a one-of-a-kind piece just for you.',
  'custom.uploadTitle': 'Upload a reference photo',
  'custom.uploadDesc':
    'A photo of something you love — a dress, embroidery detail, colour palette, or outfit inspiration.',
  'custom.dropPhoto': 'Drop your photo here',
  'custom.orBrowse': 'or click to browse · JPG, PNG up to 10MB',
  'custom.choosePhoto': 'Choose photo',
  'custom.change': 'Change',
  'custom.remove': 'Remove',
  'custom.photoUploaded': 'Photo uploaded',
  'custom.describeTitle': 'Describe what you have in mind',
  'custom.describeDesc':
    'Tell us about the piece — occasion, style, details you love, what to keep or change from the photo.',
  'custom.describePlaceholder':
    "e.g. I love the embroidery on the sleeves in this photo. I'd like a similar style in ivory with gold thread, for a summer wedding in Constantine. The neckline can be different — something more open…",
  'custom.charactersCount': '{count} characters',
  'custom.garmentType': 'Garment type',
  'custom.selectGarment': 'Select a garment type…',
  'custom.budget': 'Budget',
  'custom.optional': '— optional',
  'custom.yourSize': 'Your size',
  'custom.sizeConfirm': "We'll confirm measurements over WhatsApp after your request.",
  'custom.enterMeasurements': 'Enter your measurements',
  'custom.measurementsPlaceholder':
    'e.g. Bust: 92cm, Waist: 74cm, Hips: 100cm, Height: 168cm — add any relevant details',
  'custom.colourPalette': 'Colour palette',
  'custom.colourDesc':
    'Pick up to 3 colours. Our artisans will find the closest thread match.',
  'custom.selected': 'Selected:',
  'custom.moreAllowed': '{count} more allowed',
  'custom.yourRequest': 'Your request',
  'custom.fullName': 'Full name',
  'custom.email': 'Email',
  'custom.whatsappNumber': 'WhatsApp number',
  'custom.replyHere': "— we'll reply here",
  'custom.wilaya': 'Wilaya',
  'custom.selectWilaya': 'Select wilaya…',
  'custom.quoteInfo':
    "We'll review your request and send a quote within 48 hours. No payment required now — everything is confirmed over WhatsApp first.",
  'custom.sendError': 'Could not send your request. Please try again.',
  'custom.sending': 'Sending…',
  'custom.sendRequest': 'Send request ✶',

  /* ── Checkout ───────────────────────────────────────────────────────────── */
  'checkout.stepShipping': 'Shipping',
  'checkout.stepPayment': 'Payment',
  'checkout.stepReview': 'Review',
  'checkout.title': 'Checkout',
  'checkout.orderSummary': 'Order summary',
  'checkout.summaryItemsOne': 'Order summary ({count} item)',
  'checkout.summaryItemsMany': 'Order summary ({count} items)',
  'checkout.contact': 'Contact',
  'checkout.emailAddress': 'Email address',
  'checkout.firstName': 'First name',
  'checkout.lastName': 'Last name',
  'checkout.phoneWhatsapp': 'Phone / WhatsApp',
  'checkout.shippingAddress': 'Shipping address',
  'checkout.streetAddress': 'Street address',
  'checkout.city': 'City',
  'checkout.wilaya': 'Wilaya',
  'checkout.selectWilaya': 'Select wilaya…',
  'checkout.deliveryNotes': 'Delivery notes',
  'checkout.deliveryNotesPlaceholder': 'Apartment, floor, landmark…',
  'checkout.deliveryType': 'Delivery type',
  'checkout.homeDelivery': 'Home delivery',
  'checkout.homeDeliverySub': 'Delivered to your door',
  'checkout.stopDesk': 'Stop desk',
  'checkout.stopDeskSub': 'Pick up at agency',
  'checkout.selectWilayaShort': 'Select wilaya',
  'checkout.continueToPayment': 'Continue to payment',
  'checkout.paymentMethod': 'Payment method',
  'checkout.comingSoon': 'Coming soon',
  'checkout.reviewOrder': 'Review order',
  'checkout.shippingTo': 'Shipping to',
  'checkout.delivery': 'Delivery:',
  'checkout.note': 'Note: {note}',
  'checkout.payment': 'Payment',
  'checkout.termsPrefix': "By placing your order you agree to Maibi's",
  'checkout.terms': 'terms',
  'checkout.and': 'and',
  'checkout.privacyPolicy': 'privacy policy',
  'checkout.termsSuffix': '. All sales are final on limited-edition pieces.',
  'checkout.conflictError':
    'One or more items just went out of stock. Please review your bag.',
  'checkout.placeError': 'Could not place your order. Please try again.',
  'checkout.placingOrder': 'Placing order…',
  'checkout.placeOrder': 'Place order · {total}',
  'checkout.orderPlaced': 'Order placed!',
  'checkout.orderPlacedBody':
    'Thank you, {name}. Your order is confirmed and our artisans are preparing it with care.',
  'checkout.confirmationSent': 'A confirmation will be sent to {email}.',
  'checkout.orderNumber': 'Order #{id}',
  'checkout.expected': 'Expected: 3–5 days',
  'checkout.orderId': 'Order ID',
  'checkout.shippingFee': 'Shipping fee',
  'checkout.total': 'Total',
  'checkout.viewWishlist': 'View wishlist',

  /* ── Order summary ──────────────────────────────────────────────────────── */
  'summary.title': 'Order summary',
  'summary.size': 'Size: {size}',
  'summary.color': 'Color: {color}',
  'summary.subtotal': 'Subtotal',
  'summary.shipping': 'Shipping',
  'summary.selectWilayaType': 'Select wilaya & type',
  'summary.total': 'Total',
  'summary.secureCheckout': 'Secure checkout · SSL encrypted',

  /* ── Rating ─────────────────────────────────────────────────────────────── */
  'rating.close': 'Close',
  'rating.title': 'Rate your order',
  'rating.subtitle':
    'Your feedback helps Maibi & our artisans keep improving. It only takes a minute. 🌸',
  'rating.fullName': 'Full name',
  'rating.fullNamePlaceholder': 'e.g. Yasmine Benali',
  'rating.wilaya': 'Wilaya',
  'rating.selectWilaya': 'Select your wilaya…',
  'rating.yourReview': 'Your review',
  'rating.reviewPlaceholder': 'Tell us what you loved about your order…',
  'rating.genericError': 'Something went wrong. Please try again.',
  'rating.submitting': 'Submitting…',
  'rating.submit': 'Submit rating',
  'rating.thankYou': 'Thank you! 🌸',
  'rating.thankYouBody':
    'Your rating has been submitted. We truly appreciate you supporting Algerian craftsmanship.',

  /* ── Form validation (zod messages, keyed) ──────────────────────────────── */
  'val.nameRequired': 'Your name is required',
  'val.nameMin': 'Name must be at least 2 characters',
  'val.wilayaSelect': 'Select your wilaya',
  'val.ratingPick': 'Please pick a star rating',
  'val.commentRequired': 'A short comment is required',
  'val.commentMin': 'Comment must be at least 10 characters',
  'val.emailRequired': 'Email is required',
  'val.emailValid': 'Enter a valid email',
  'val.firstNameRequired': 'First name is required',
  'val.lastNameRequired': 'Last name is required',
  'val.phoneRequired': 'Phone is required',
  'val.phoneValid': 'Enter a valid phone number',
  'val.addressRequired': 'Street address is required',
  'val.cityRequired': 'City is required',
  'val.wilayaSelectShort': 'Select a wilaya',
  'val.wilayaValid': 'Select a valid wilaya',
  'val.deliveryTypeSelect': 'Select a delivery type',
} as const;

export type TranslationKey = keyof typeof en;
