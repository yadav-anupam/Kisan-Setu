export type LanguageCode =
  | 'en'
  | 'hi'
  | 'mr'
  | 'te'
  | 'ml'
  | 'bho'
  | 'pa'
  | 'kn'

export interface LanguageOption {
  code: LanguageCode
  name: string
  nativeName: string
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
]

export interface Translations {
  brandName: string
  brandTagline: string
  nav: {
    home: string
    about: string
    howItWorks: string
    forFarmers: string
    forCentres: string
    features: string
    contact: string
  }
  loginBtn: string
  home: {
    heroKicker: string
    heroTitle1: string
    heroTitle2: string
    heroDesc: string
    bookSlotBtn: string
    howItWorksBtn: string
    journeyTitle: string
    journey: { title: string; text: string }[]
    benefits: { title: string; text: string }[]
    impactLabels: {
      farmers: string
      centres: string
      appointments: string
      procured: string
      payments: string
    }
    featuresHeading: string
    features: { title: string; text: string }[]
    trustHeading: string
    trustPoints: { title: string; text: string }[]
  }
  about: {
    kicker: string
    title: string
    desc: string
    badgeTitle: string
    badgeSub: string
    pillarsHeading: string
    pillarsSub: string
    pillars: { title: string; text: string }[]
    problemsHeading: string
    problemsSub: string
    mandiProblemsTitle: string
    solutionsTitle: string
    problems: string[]
    solutions: string[]
    ctaTitle: string
    ctaDesc: string
    ctaHomeBtn: string
    ctaHelpdeskBtn: string
  }
  howItWorks: {
    kicker: string
    title1: string
    title2: string
    desc: string
    badges: { slot: string; weighment: string; security: string; dbt: string }
    stepsHeading: string
    stepsSub: string
    steps: { step: string; title: string; text: string; tag: string }[]
    rolesHeading: string
    rolesSub: string
    roleTabs: { farmer: string; centre: string; admin: string }
    farmerView: {
      title: string
      desc: string
      bullets: string[]
      stats: { label: string; val: string }[]
    }
    centreView: {
      title: string
      desc: string
      bullets: string[]
      stats: { label: string; val: string }[]
    }
    adminView: {
      title: string
      desc: string
      bullets: string[]
      stats: { label: string; val: string }[]
    }
    faqHeading: string
    faqSub: string
    faqs: { q: string; a: string }[]
    ctaTitle: string
    ctaDesc: string
    ctaBookBtn: string
    ctaLearnBtn: string
  }
  forFarmers: {
    kicker: string
    title1: string
    title2: string
    desc: string
    badges: { slots: string; msp: string; scale: string; dbt: string }
    benefitsHeading: string
    benefitsSub: string
    benefits: { title: string; text: string }[]
    comparisonHeading: string
    comparisonSub: string
    traditionalTitle: string
    kisanSetuTitle: string
    traditionalPoints: string[]
    kisanSetuPoints: string[]
    calcHeading: string
    calcSub: string
    calcCropLabel: string
    calcQtyLabel: string
    calcMspRateLabel: string
    calcTotalPayoutLabel: string
    calcDbtLabel: string
    ctaTitle: string
    ctaDesc: string
    ctaBookSlot: string
  }
  forCentres: {
    kicker: string
    title1: string
    title2: string
    desc: string
    badges: { antiRush: string; scales: string; paperless: string; efficiency: string }
    capabilitiesHeading: string
    capabilitiesSub: string
    capabilities: { title: string; text: string }[]
    metricsHeading: string
    metricsSub: string
    metrics: { val: string; label: string; sub: string }[]
    simHeading: string
    simSub: string
    simScalesLabel: string
    simTimeLabel: string
    simHourlyCapacity: string
    simDailyThroughput: string
    ctaTitle: string
    ctaDesc: string
    ctaPortalBtn: string
  }
  featuresPage: {
    kicker: string
    title1: string
    title2: string
    desc: string
    badges: { ai: string; scale: string; dbt: string; cloud: string }
    gridHeading: string
    gridSub: string
    featuresList: {
      title: string
      subtitle: string
      desc: string
      bullets: string[]
    }[]
    archHeading: string
    archSub: string
    archPillars: { title: string; desc: string }[]
    ctaTitle: string
    ctaDesc: string
    ctaExploreHome: string
    ctaBookSlot: string
  }
  contactPage: {
    kicker: string
    title1: string
    title2: string
    desc: string
    badges: { tollFree: string; languages: string; instant: string; whatsapp: string }
    channelsHeading: string
    channelsSub: string
    channels: {
      title: string
      val: string
      sub: string
      action: string
    }[]
    formHeading: string
    formSub: string
    formLabels: {
      name: string
      phone: string
      mandi: string
      topic: string
      msg: string
      submit: string
      submitting: string
      successTitle: string
      successDesc: string
      ticketLabel: string
    }
    topics: { id: string; label: string }[]
    zonesHeading: string
    zonesSub: string
    zones: { region: string; state: string; phone: string; email: string }[]
  }
  farmerLogin: {
    heroTitle1: string
    heroTitle2: string
    heroDesc: string
    badges: {
      bookSlot: string
      liveQueue: string
      sellProduce: string
      fairPayment: string
    }
    trustBanner: string
    trustSub: string
    welcomeTitle: string
    welcomeSubtitle: string
    tabPassword: string
    tabOtp: string
    mobileLabel: string
    mobilePlaceholder: string
    passwordLabel: string
    passwordPlaceholder: string
    forgotPassword: string
    loginBtn: string
    loggingIn: string
    orDivider: string
    loginWithOtpBtn: string
    loginWithPasswordBtn: string
    otpInstructions: string
    otpLabel: string
    sendOtpBtn: string
    sendingOtp: string
    resendOtp: string
    resendIn: string
    seconds: string
    verifyBtn: string
    verifying: string
    newToPlatform: string
    registerNow: string
    demoFarmer: string
    quickFill: string
    needHelp: string
    switchRole: string
  }
  farmerRegister: {
    heroTitle1: string
    heroTitle2: string
    heroDesc: string
    steps: {
      step1: string
      step2: string
      step3: string
      step4: string
    }
    trustBanner: string
    trustSub: string
    title: string
    subtitle: string
    step1Title: string
    step2Title: string
    step3Title: string
    fullNameLabel: string
    fullNamePlaceholder: string
    mobileLabel: string
    mobilePlaceholder: string
    aadhaarLabel: string
    aadhaarPlaceholder: string
    stateLabel: string
    districtLabel: string
    villageLabel: string
    villagePlaceholder: string
    landCategoryLabel: string
    landCategories: {
      marginal: string
      small: string
      medium: string
      large: string
    }
    khasraLabel: string
    khasraPlaceholder: string
    cropLabel: string
    crops: {
      wheat: string
      paddy: string
      mustard: string
      gram: string
      soybean: string
      cotton: string
      maize: string
    }
    quantityLabel: string
    quantityPlaceholder: string
    centreLabel: string
    bankAccountLabel: string
    bankAccountPlaceholder: string
    ifscLabel: string
    ifscPlaceholder: string
    pinLabel: string
    pinPlaceholder: string
    confirmPinLabel: string
    confirmPinPlaceholder: string
    nextStepBtn: string
    prevStepBtn: string
    registerBtn: string
    registering: string
    quickFill: string
    alreadyRegistered: string
    loginLink: string
    successTitle: string
    successSub: string
    farmerIdLabel: string
    proceedToDashboard: string
  }
  footer: {
    desc: string
    quickLinks: string
    importantLinks: string
    contactUs: string
    tollFree: string
    address: string
    copyright: string
  }
}

const enTranslations: Translations = {
  brandName: 'Kisan Setu',
  brandTagline: 'Procurement Platform',
  nav: {
    home: 'Home',
    about: 'About Us',
    howItWorks: 'How It Works',
    forFarmers: 'For Farmers',
    forCentres: 'For Centres',
    features: 'Features',
    contact: 'Contact Us',
  },
  loginBtn: 'Login / Sign In',
  home: {
    heroKicker: 'Smart Procurement. Happy Farmers.',
    heroTitle1: 'Digital Procurement,',
    heroTitle2: 'Better Farming',
    heroDesc:
      'A smart platform for farmers to book slots, avoid long queues, track procurement status and get timely payments - all in one place.',
    bookSlotBtn: 'Book Your Slot',
    howItWorksBtn: 'How It Works',
    journeyTitle: 'Your Journey, Simplified',
    journey: [
      { title: 'Book Slot Online', text: 'Choose centre, date & time' },
      { title: 'Get Token', text: 'Receive your token instantly' },
      { title: 'Live Queue Updates', text: 'Track your queue in real-time' },
      { title: 'Procurement', text: 'Hassle-free & transparent' },
      { title: 'Payment', text: 'Get paid directly to your account' },
    ],
    benefits: [
      { title: 'Save Time', text: 'Avoid long waiting' },
      { title: 'Real-time Updates', text: 'Get live queue status' },
      { title: 'Transparent', text: 'Track process clearly' },
      { title: 'Timely Payments', text: 'Receive securely' },
    ],
    impactLabels: {
      farmers: 'Registered Farmers',
      centres: 'Procurement Centres',
      appointments: 'Appointments Today',
      procured: 'Quintal Procured Today',
      payments: 'Payments Completed',
    },
    featuresHeading: 'What You Can Do',
    features: [
      { title: 'Book Your Slot', text: 'Choose your nearest centre, date and time slot easily.' },
      { title: 'Live Queue Tracking', text: 'Track your token and estimated waiting time in real-time.' },
      { title: 'Procurement Status', text: 'Know your procurement progress at every step.' },
      { title: 'Secure Payments', text: 'Receive payments directly in your bank account.' },
      { title: 'History & Records', text: 'View your past procurements, payments and receipts.' },
    ],
    trustHeading: 'Why Choose Kisan Setu?',
    trustPoints: [
      { title: 'Reduce Waiting Time', text: 'Smart queue management saves your time.' },
      { title: 'Better Planning', text: 'Book in advance and plan your visit better.' },
      { title: 'Complete Transparency', text: 'All information and updates at your fingertips.' },
      { title: 'Secure & Reliable', text: 'Your data and payments are always safe.' },
    ],
  },
  about: {
    kicker: 'Official Initiative • Government of India',
    title: 'Building a Smarter, Faster & Transparent Agricultural Procurement Ecosystem',
    desc:
      'Kisan Setu is a modern digital platform designed under the Department of Consumer Affairs to connect farmers, procurement centres, and administrators. We replace chaotic physical queues with predictable digital appointments, verified weighment, and guaranteed MSP payments.',
    badgeTitle: 'Aadhaar & DigiLocker Verified',
    badgeSub: '100% Cryptographically Audited Platform',
    pillarsHeading: 'Core Principles Guiding Kisan Setu',
    pillarsSub: "Every feature in Kisan Setu is designed with simplicity, accountability, and empowerment for India's agricultural workforce.",
    pillars: [
      {
        title: 'Farmer First Experience',
        text: 'Engineered specifically for smallholder and commercial farmers to eliminate long mandi queues and uncertainty.',
      },
      {
        title: '100% Transparent Weighment',
        text: 'Automated digital weighbridges and instant laboratory moisture/quality grading certificates.',
      },
      {
        title: 'AI & Data-Driven Insights',
        text: 'Predictive queue waiting times, automated counter balancing, and intelligent anti-rush scheduling.',
      },
      {
        title: 'Direct Benefit Transfer (DBT)',
        text: 'Zero intermediaries with guaranteed Government Minimum Support Price (MSP) credited directly to bank accounts.',
      },
    ],
    problemsHeading: 'Transforming Agricultural Procurement',
    problemsSub: 'Moving from manual friction to automated digital trust at every step of crop offloading.',
    mandiProblemsTitle: 'Traditional Mandi Challenges',
    solutionsTitle: 'The Kisan Setu Solution',
    problems: [
      'Farmers forced to wait in vehicle queues outside mandis for 12–24+ hours.',
      'Uncertain daily arrival volumes causing massive vehicular gridlock and spoilage.',
      'Manual weighment tickets leading to dispute, lack of trust, and human error.',
      'Delayed or opaque payment disbursement cycles through middlemen.',
    ],
    solutions: [
      'Reserve confirmed 2-hour drop-off windows in advance from any smartphone.',
      'Real-time token call alerts, live queue tracking, and AI wait-time estimation.',
      'Cryptographically signed digital weighbridge receipts and J-Form generation.',
      'Direct Bank Transfer (DBT) directly into Aadhaar-seeded accounts within hours.',
    ],
    ctaTitle: 'Ready for a Smarter Mandi Experience?',
    ctaDesc: 'Join thousands of farmers across India managing their appointments, live queues, and payments with total transparency.',
    ctaHomeBtn: 'Go to Home Page',
    ctaHelpdeskBtn: 'Contact Farmer Helpdesk',
  },
  howItWorks: {
    kicker: 'Complete 8-Step Procurement Journey',
    title1: 'How Kisan Setu Works from',
    title2: 'Booking to Bank Payout',
    desc: 'Experience a calm, predictable, and 100% transparent agricultural procurement journey. No long queues, no middlemen, and zero uncertainty.',
    badges: {
      slot: '2-Hour Confirmed Slots',
      weighment: 'Digital Weighbridge Scale',
      security: 'DigiLocker & Aadhaar Verified',
      dbt: 'Direct Bank Transfer (DBT)',
    },
    stepsHeading: 'The 8-Stage Digital Workflow',
    stepsSub: 'From your initial smartphone slot reservation to certified weighment and guaranteed government MSP payout.',
    steps: [
      {
        step: '01',
        title: 'Book Slot Online',
        text: 'Select your preferred procurement centre, crop variety, estimated quantity, date, and 2-hour arrival window.',
        tag: 'Mobile / Web',
      },
      {
        step: '02',
        title: 'Get Digital Token',
        text: 'Receive your unique alphanumeric token and QR code instantly on your phone with SMS & WhatsApp confirmation.',
        tag: 'Instant SMS',
      },
      {
        step: '03',
        title: 'Gate Arrival & Check-In',
        text: 'Arrive at the mandi gate. The security operator scans your token QR or Aadhaar for instant zero-paperwork entry.',
        tag: 'Aadhaar Verified',
      },
      {
        step: '04',
        title: 'Live Queue & AI ETA',
        text: 'Follow the live token display screens and mobile app. AI predicts your counter calling time with minute-level precision.',
        tag: 'AI Prediction',
      },
      {
        step: '05',
        title: 'Automated Weighment',
        text: 'Drive onto the electronic weighbridge. Gross and tare weights are captured digitally and synced to prevent any dispute.',
        tag: 'Tamper-Proof',
      },
      {
        step: '06',
        title: 'Quality Lab Inspection',
        text: 'Government-certified quality inspectors test moisture %, grain cleanliness, and classify produce into Grade A/B/C.',
        tag: 'Lab Certified',
      },
      {
        step: '07',
        title: 'J-Form Generation',
        text: 'Official Government of India J-Form procurement certificate is issued instantly with cryptographic audit signatures.',
        tag: 'Legal Proof',
      },
      {
        step: '08',
        title: 'Direct Bank Payment (DBT)',
        text: 'Minimum Support Price (MSP) payment is transferred directly to your Aadhaar-seeded bank account with UTR tracking.',
        tag: 'Direct to Bank',
      },
    ],
    rolesHeading: 'Designed for Every Stakeholder',
    rolesSub: 'Tailored interfaces built specifically for farmers, centre operators, and state administrators.',
    roleTabs: { farmer: 'For Farmers', centre: 'For Mandi Operators', admin: 'For Administrators' },
    farmerView: {
      title: 'Peace of Mind for Every Farmer',
      desc: 'Never spend the night in a tractor queue again. Plan your journey, track your live token number from your village, and know exactly how much you will receive before you leave the mandi.',
      bullets: [
        'Advance 2-hour drop-off window reservation',
        'Live AI queue tracking and token call notifications',
        'Instant downloadable J-Form certificate and payment UTR',
      ],
      stats: [
        { label: 'Average Waiting Time', val: '28 mins (vs 16 hrs)' },
        { label: 'Weighment Accuracy', val: '100% Electronic' },
        { label: 'Payment Speed', val: 'Within 24-48 Hours' },
      ],
    },
    centreView: {
      title: 'Streamlined Mandi Gate & Scale Operations',
      desc: 'Eliminate paperwork and vehicular gridlock with high-speed digital check-ins, automated weighbridge integration, and instant lab moisture grade recordings.',
      bullets: [
        'Fast QR code & Aadhaar arrival check-in',
        'Electronic weighbridge serial capture without manual keying',
        'Automated capacity pacing preventing yard congestion',
      ],
      stats: [
        { label: 'Daily Processing Speed', val: '3.2x Faster' },
        { label: 'Dispute Resolution', val: 'Zero Discrepancies' },
        { label: 'Shift Efficiency', val: '99.4% Uptime' },
      ],
    },
    adminView: {
      title: 'Statewide Visibility & Cryptographic Trust',
      desc: 'Monitor procurement progress across hundreds of mandis in real time. Validate weighbridge logs against cryptographic tamper hashes and audit DBT disbursements.',
      bullets: [
        'Live statewide heatmaps and crop volume analytics',
        'SHA-256 tamper-evident weighbridge audit verification',
        'Automated PFMS/RBI DBT fund disbursement tracking',
      ],
      stats: [
        { label: 'Active Mandis Monitored', val: '125+ Statewide' },
        { label: 'Audit Integrity', val: '100% Cryptographic' },
        { label: 'Disbursed Volume', val: '₹ 1.85 Cr+ Today' },
      ],
    },
    faqHeading: 'Frequently Asked Questions',
    faqSub: 'Everything you need to know about booking, queue tracking, and payments on Kisan Setu.',
    faqs: [
      {
        q: 'Can I reschedule or cancel my booking slot if I cannot visit on time?',
        a: 'Yes, you can easily reschedule or cancel your appointment up to 4 hours before your reserved slot directly from the Kisan Setu dashboard or by calling toll-free 1800-123-4567.',
      },
      {
        q: 'How accurate is the AI waiting-time prediction?',
        a: 'The AI model calculates wait times based on live weighbridge throughput, active inspection bays, and current vehicle flow, updating dynamically every 60 seconds.',
      },
      {
        q: 'How soon is the DBT payment credited to my bank account?',
        a: 'Once your J-Form is approved at the mandi, the Direct Benefit Transfer (DBT) is initiated through PFMS/RBI gateway and typically reflects in your bank account within 24 to 48 hours.',
      },
      {
        q: 'What documents do I need to bring to the procurement centre?',
        a: 'You only need your digital Token QR Code (on your phone or SMS) and your original Aadhaar Card. Land records and bank account details are pre-verified via DigiLocker.',
      },
      {
        q: 'What happens if my crop does not meet the specified moisture grade?',
        a: 'If moisture exceeds standard FAQ parameters, the centre allows you 24 hours to sun-dry your crop in designated mandi drying yards before a free re-test is performed.',
      },
    ],
    ctaTitle: 'Ready to Offload Your Crop Without Waiting?',
    ctaDesc: 'Book your confirmed procurement slot now or check live queue status across all mandis.',
    ctaBookBtn: 'Book a Slot Online',
    ctaLearnBtn: 'Learn About Kisan Setu',
  },
  forFarmers: {
    kicker: "Built for India's Annadata",
    title1: 'A Simpler, Faster & Dignified',
    title2: 'Mandi Day for Every Farmer',
    desc: 'No more overnight waits in tractor queues. Kisan Setu empowers you with guaranteed appointments, live token tracking, transparent electronic weighment, and direct government MSP payments.',
    badges: {
      slots: 'Confirmed 2-Hour Slots',
      msp: '100% Guaranteed MSP',
      scale: 'Digital Electronic Weighbridge',
      dbt: 'Direct Account DBT',
    },
    benefitsHeading: 'Empowering You at Every Step',
    benefitsSub: 'Designed with ease of use in mind so every farmer can sell their harvest with dignity and total peace of mind.',
    benefits: [
      {
        title: 'Plan Your Visit from Home',
        text: 'Reserve a guaranteed drop-off slot from your phone before loading your tractor, avoiding unexpected mandi closures.',
      },
      {
        title: 'Know Your Live Turn',
        text: 'Track live queue status, token calls, and AI estimated arrival time so you only arrive when your turn is near.',
      },
      {
        title: 'Fair & Accurate Weighment',
        text: 'Automated electronic weighbridge records gross and tare weights directly into the government system without manual tampering.',
      },
      {
        title: 'Direct Benefit Transfer (DBT)',
        text: 'Your full MSP payout is credited directly into your Aadhaar-linked bank account within 24 to 48 hours with zero commission.',
      },
      {
        title: 'Official J-Form Digital Certificate',
        text: 'Get an authentic, legally binding J-Form certificate on WhatsApp and SMS immediately after crop handover.',
      },
      {
        title: 'Multi-Language Helpdesk',
        text: 'Free toll-free voice support in 8 regional languages available from 7 AM to 9 PM every harvest day.',
      },
    ],
    comparisonHeading: 'Traditional Mandi vs. Kisan Setu',
    comparisonSub: 'See how digital procurement transforms your crop selling experience.',
    traditionalTitle: 'Traditional Mandi Experience',
    kisanSetuTitle: 'Kisan Setu Experience',
    traditionalPoints: [
      '12 to 24+ hours waiting in vehicle queues outside the mandi gate.',
      'Manual weighment with paper slips prone to disputes and errors.',
      'Uncertain quality deductions decided subjectively by middlemen.',
      'Delayed payment disbursement taking weeks or months through commission agents.',
    ],
    kisanSetuPoints: [
      'Confirmed 2-hour arrival slot with an average 28-minute turnaround.',
      'Automated digital weighbridge with instant gross/tare certificates.',
      'Government lab moisture and impurity testing with Grade A/B/C norms.',
      'Direct Benefit Transfer (DBT) directly into bank accounts within 24-48 hours.',
    ],
    calcHeading: 'Government MSP Payout Calculator',
    calcSub: 'Estimate your guaranteed Minimum Support Price earnings before visiting the mandi.',
    calcCropLabel: 'Select Crop',
    calcQtyLabel: 'Quantity (in Quintals)',
    calcMspRateLabel: 'Government MSP Rate',
    calcTotalPayoutLabel: 'Total Guaranteed Payout',
    calcDbtLabel: 'Direct Benefit Transfer to Your Account',
    ctaTitle: 'Ready to Experience Seamless Procurement?',
    ctaDesc: 'Book your slot now and offload your crop with ease, transparency, and dignity.',
    ctaBookSlot: 'Book Your Slot Now',
  },
  forCentres: {
    kicker: 'Mandi Operations & Capacity Management',
    title1: 'A Smarter, Faster Way to Run Your',
    title2: 'Procurement Centre',
    desc: 'Empower your mandi staff with automated electronic weighbridges, real-time yard capacity pacing, zero-paperwork gate check-ins, and instant government J-Form certification.',
    badges: {
      antiRush: 'Anti-Rush Yard Pacing',
      scales: 'Automated Weighbridge Integration',
      paperless: 'Zero Paperwork Check-In',
      efficiency: '3.2x Shift Throughput',
    },
    capabilitiesHeading: 'Core Operational Modules',
    capabilitiesSub: 'Comprehensive tools designed to eliminate operational friction and vehicular congestion.',
    capabilities: [
      {
        title: 'Smart Yard Capacity & Anti-Rush',
        text: 'Configure hourly vehicle limits based on weighing bays to eliminate road gridlock and ensure smooth yard traffic.',
      },
      {
        title: 'Electronic Weighbridge Scale Sync',
        text: 'Capture gross and tare weights directly via RS232/IP scale interfaces, preventing human recording discrepancies.',
      },
      {
        title: 'Laboratory Quality Testing Console',
        text: 'Record moisture percentages and foreign matter in seconds with instant automated Grade A/B/C classification.',
      },
      {
        title: 'Instant Legal J-Form Generation',
        text: 'Issue cryptographically signed J-Form certificates directly to farmers with digital signatures.',
      },
      {
        title: 'Operator Duty Rosters & Bay Allocation',
        text: 'Allocate staff to check-in gates, weighbridges, and inspection bays with real-time operator tracking.',
      },
      {
        title: 'Daily Reconciliation & PFMS Auditing',
        text: 'Automate daily end-of-shift reporting, crop intake balance sheets, and government PFMS DBT payment files.',
      },
    ],
    metricsHeading: 'Operational Impact for Mandis',
    metricsSub: 'Delivering unprecedented speed, transparency, and compliance for centre administrators.',
    metrics: [
      { val: '3.2x', label: 'Faster Daily Processing', sub: 'vs manual ledger recording' },
      { val: '99.4%', label: 'Scale & Yard Uptime', sub: 'Continuous uninterrupted flow' },
      { val: '0', label: 'Weighment Discrepancies', sub: '100% digital scale validation' },
      { val: '100%', label: 'PFMS/DBT Compliance', sub: 'Direct bank integration' },
    ],
    simHeading: 'Mandi Throughput & Capacity Calculator',
    simSub: 'Simulate vehicle processing speeds and optimize daily procurement capacity.',
    simScalesLabel: 'Active Weighbridge Bays',
    simTimeLabel: 'Avg. Weighment Time per Vehicle (Minutes)',
    simHourlyCapacity: 'Estimated Hourly Capacity',
    simDailyThroughput: 'Estimated Daily Intake (10-Hour Shift)',
    ctaTitle: 'Ready to Modernize Your Mandi Operations?',
    ctaDesc: 'Access the centre operator console or contact state administrators for centre onboarding.',
    ctaPortalBtn: 'Access Operator Portal',
  },
  featuresPage: {
    kicker: 'Next-Generation Agriculture Infrastructure',
    title1: 'Cutting-Edge Capabilities',
    title2: 'Powering Kisan Setu',
    desc: 'Explore the full suite of intelligent features built to modernize crop procurement, ensure zero wait time, and guarantee direct financial security for millions of farmers.',
    badges: {
      ai: 'AI Queue Pacing',
      scale: 'Cryptographic Scales',
      dbt: 'Direct DBT Rails',
      cloud: 'Government Cloud Hosted',
    },
    gridHeading: 'Comprehensive Platform Capabilities',
    gridSub: 'Six interconnected modules creating an integrated, tamper-proof national agricultural network.',
    featuresList: [
      {
        title: 'Smart Slot Booking & Scheduling',
        subtitle: 'Eliminate Unpredictable Arrivals',
        desc: 'Dynamic scheduling system that distributes appointments across 2-hour windows according to each centre’s capacity.',
        bullets: ['Village-level quotas', 'Automated SMS/WhatsApp reminders', 'Instant 4-hour reschedule flexibility'],
      },
      {
        title: 'Live Queue & AI Wait-Time Prediction',
        subtitle: 'Minute-Level Mandi Transparency',
        desc: 'Machine learning algorithms continuously recalculate counter wait times using live weighbridge speeds and token call pacing.',
        bullets: ['Visual token display boards', 'Proactive turn notifications', 'Multi-lingual voice announcements'],
      },
      {
        title: 'Tamper-Evident Weighbridge Integration',
        subtitle: 'Zero Human Intervention Weighment',
        desc: 'Direct hardware connection with electronic weighbridges ensuring gross and tare weights are saved with cryptographic signatures.',
        bullets: ['RS-232/IP scale interfaces', 'SHA-256 tamper verification', 'Automatic deduction calculation'],
      },
      {
        title: 'Digital Quality & Moisture Lab Console',
        subtitle: 'Objective Grade A/B/C Tagging',
        desc: 'Laboratory testing workstation that logs grain purity, moisture percentages, and foreign matter in under 90 seconds.',
        bullets: ['Standard FAQ rules engine', 'Instant digital grading certs', '24-hour free re-test protocol'],
      },
      {
        title: 'Zero-Middleman Direct Benefit Transfer',
        subtitle: '100% Guaranteed MSP to Bank',
        desc: 'Direct integration with Public Financial Management System (PFMS) and RBI gateway for rapid direct bank credits.',
        bullets: ['Aadhaar-seeded accounts', 'Real-time UTR payment tracking', 'Zero commission deductions'],
      },
      {
        title: 'Statewide Analytics & Command Center',
        subtitle: 'Real-Time Oversight for Administrators',
        desc: 'Comprehensive executive dashboards tracking daily procurement volumes, mandi bottlenecks, and grievance resolutions.',
        bullets: ['District heatmaps', 'Anomaly detection alerts', 'Automated compliance audits'],
      },
    ],
    archHeading: 'Enterprise Security & Trust Architecture',
    archSub: 'Built on mission-critical national cloud infrastructure for peak harvest scalability.',
    archPillars: [
      { title: 'SHA-256 Cryptographic Audit Logs', desc: 'Every weighment, grade change, and token call is permanently recorded in tamper-evident logs.' },
      { title: 'DigiLocker & Aadhaar Integration', desc: 'Farmer identities and land records are verified digitally with zero physical document friction.' },
      { title: '99.9% High Availability Cloud', desc: 'Redundant government cloud servers ensuring seamless operations during peak harvest surges.' },
      { title: 'End-to-End Encryption', desc: 'All data transmissions and payment pipelines are encrypted with TLS 1.3 and banking-grade security.' },
    ],
    ctaTitle: 'Ready to Experience Modern Agricultural Procurement?',
    ctaDesc: 'Join thousands of farmers, mandi staff, and administrators using Kisan Setu across India.',
    ctaExploreHome: 'Explore Platform Home',
    ctaBookSlot: 'Book a Slot Online',
  },
  contactPage: {
    kicker: '24/7 Farmer & Mandi Support • Government of India',
    title1: 'We Are Here to Help',
    title2: 'Every Step of the Way',
    desc: 'Get immediate assistance with appointment booking, live token queries, weighbridge verification, or DBT payment status in 8 regional languages.',
    badges: {
      tollFree: 'Toll-Free 1800 Helpline',
      languages: '8 Regional Languages',
      instant: 'Instant Ticket Tracking',
      whatsapp: 'Official WhatsApp Bot',
    },
    channelsHeading: 'Direct Contact Channels',
    channelsSub: 'Choose your preferred way to reach our dedicated national agricultural support team.',
    channels: [
      {
        title: 'Toll-Free Farmer Helpline',
        val: '1800-123-4567',
        sub: 'Open 7:00 AM – 9:00 PM (All 7 Days during harvest)',
        action: 'Call Helpline',
      },
      {
        title: 'Official Email Helpdesk',
        val: 'support@kisansetu.gov.in',
        sub: 'Response guaranteed within 2 hours for urgent issues',
        action: 'Send Email',
      },
      {
        title: 'WhatsApp Virtual Assistant',
        val: '+91 92143 34494',
        sub: 'Instant Token QR and live queue status on chat',
        action: 'Open WhatsApp',
      },
      {
        title: 'Central National Headquarters',
        val: 'Krishi Bhawan, New Delhi',
        sub: 'Department of Consumer Affairs, Pin: 110001',
        action: 'View Map',
      },
    ],
    formHeading: 'Submit a Query or Grievance',
    formSub: 'Fill in your details below and our team will resolve your request promptly.',
    formLabels: {
      name: 'Full Name',
      phone: '10-Digit Mobile Number',
      mandi: 'Procurement Centre / Mandi Name',
      topic: 'Topic / Query Category',
      msg: 'Detailed Description of Query',
      submit: 'Submit Support Request',
      submitting: 'Submitting Ticket...',
      successTitle: 'Ticket Submitted Successfully!',
      successDesc: 'Our support officer has received your request and will call you on your mobile shortly.',
      ticketLabel: 'Grievance Reference Number',
    },
    topics: [
      { id: 'slot', label: 'Slot Booking / Rescheduling Issue' },
      { id: 'queue', label: 'Token Number & Live Queue Query' },
      { id: 'scale', label: 'Weighbridge / Moisture Test Dispute' },
      { id: 'dbt', label: 'DBT Bank Payment & UTR Status' },
      { id: 'operator', label: 'Mandi Operator Hardware / Portal Support' },
    ],
    zonesHeading: 'Regional State Nodal Desks',
    zonesSub: 'Dedicated state procurement monitoring desks for immediate local coordination.',
    zones: [
      { region: 'North Zone', state: 'Punjab, Haryana, UP, Rajasthan', phone: '011-23381001', email: 'north@kisansetu.gov.in' },
      { region: 'Central Zone', state: 'Madhya Pradesh, Chhattisgarh', phone: '0755-2551002', email: 'central@kisansetu.gov.in' },
      { region: 'West Zone', state: 'Maharashtra, Gujarat', phone: '022-22021003', email: 'west@kisansetu.gov.in' },
      { region: 'South Zone', state: 'Telangana, AP, Karnataka, Kerala', phone: '040-23451004', email: 'south@kisansetu.gov.in' },
    ],
  },
  farmerLogin: {
    heroTitle1: 'Kisan Setu',
    heroTitle2: 'Aapka Faslon ka Bharosemand Saathi',
    heroDesc: 'Connect with your nearest procurement center, book your slot, track your queue and get fair payment – all in one place.',
    badges: {
      bookSlot: 'Book Slot',
      liveQueue: 'Live Queue',
      sellProduce: 'Sell Produce',
      fairPayment: 'Get Fair Payment',
    },
    trustBanner: 'Secure • Transparent • Farmer First',
    trustSub: 'Trusted by thousands of farmers across India',
    welcomeTitle: 'Welcome Back, Farmer!',
    welcomeSubtitle: 'Login to your Kisan Setu account',
    tabPassword: 'Password Login',
    tabOtp: 'Login with OTP',
    mobileLabel: 'Registered Mobile Number',
    mobilePlaceholder: 'Enter 10-digit mobile number',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    forgotPassword: 'Forgot Password?',
    loginBtn: 'Login to Dashboard',
    loggingIn: 'Verifying Credentials...',
    orDivider: 'or',
    loginWithOtpBtn: 'Login with OTP',
    loginWithPasswordBtn: 'Login with Password',
    otpInstructions: 'Enter the 6-digit verification code sent to your registered mobile number.',
    otpLabel: 'One-Time Password (OTP)',
    sendOtpBtn: 'Send OTP',
    sendingOtp: 'Sending OTP...',
    resendOtp: 'Resend OTP',
    resendIn: 'Resend in',
    seconds: 's',
    verifyBtn: 'Verify & Access Dashboard',
    verifying: 'Authenticating...',
    newToPlatform: 'New to Kisan Setu?',
    registerNow: 'Register Now',
    demoFarmer: 'Demo Farmer: 9214334494 / 123456',
    quickFill: 'Quick Demo',
    needHelp: 'Need Help?',
    switchRole: 'Staff / Admin Login',
  },
  farmerRegister: {
    heroTitle1: 'Join Kisan Setu',
    heroTitle2: 'Direct Digital Procurement for Every Indian Farmer',
    heroDesc: 'Register once with your mobile and land details to get instant queue tokens, verified MSP rates, and direct DBT bank payments.',
    steps: {
      step1: 'Identity & Contact',
      step2: 'Land & Crop Details',
      step3: 'Bank DBT & Security PIN',
      step4: 'Registration Complete',
    },
    trustBanner: 'Verified DBT & DigiLocker Integrated',
    trustSub: 'Endorsed by Department of Consumer Affairs & Ministry of Agriculture',
    title: 'Farmer Registration',
    subtitle: 'Step-by-step verified enrollment for MSP procurement',
    step1Title: 'Step 1: Farmer Identity & Location',
    step2Title: 'Step 2: Landholding & Crop Information',
    step3Title: 'Step 3: Bank Account for DBT Payment',
    fullNameLabel: 'Full Name (as on Aadhaar)',
    fullNamePlaceholder: 'e.g. Ramesh Kumar Singh',
    mobileLabel: '10-Digit Mobile Number',
    mobilePlaceholder: 'Enter 10-digit mobile number',
    aadhaarLabel: 'Aadhaar Number (Last 4 Digits / Virtual ID)',
    aadhaarPlaceholder: 'e.g. 8942',
    stateLabel: 'State / UT',
    districtLabel: 'District',
    villageLabel: 'Village / Tehsil',
    villagePlaceholder: 'e.g. Rampur, Alwar',
    landCategoryLabel: 'Landholding Category',
    landCategories: {
      marginal: 'Marginal (< 1 Hectare)',
      small: 'Small (1 - 2 Hectares)',
      medium: 'Medium (2 - 10 Hectares)',
      large: 'Large (> 10 Hectares)',
    },
    khasraLabel: 'Khasra / Land Record Survey Number',
    khasraPlaceholder: 'e.g. KHA-104/89',
    cropLabel: 'Primary Crop for Procurement',
    crops: {
      wheat: 'Wheat (गेहूं)',
      paddy: 'Paddy / Rice (धान)',
      mustard: 'Mustard (सरसों)',
      gram: 'Gram / Chana (चना)',
      soybean: 'Soybean (सोयाबीन)',
      cotton: 'Cotton (कपास)',
      maize: 'Maize (मक्का)',
    },
    quantityLabel: 'Estimated Crop Quantity for Sale (Quintals)',
    quantityPlaceholder: 'e.g. 50',
    centreLabel: 'Nearest Preferred Mandi / Procurement Centre',
    bankAccountLabel: 'Bank Account Number for DBT Credit',
    bankAccountPlaceholder: 'Enter 9-18 digit account number',
    ifscLabel: 'Bank IFSC Code',
    ifscPlaceholder: 'e.g. SBIN0001234',
    pinLabel: 'Create 6-Digit Login PIN / Password',
    pinPlaceholder: 'Enter 6-digit PIN or password',
    confirmPinLabel: 'Confirm 6-Digit PIN / Password',
    confirmPinPlaceholder: 'Re-enter PIN or password',
    nextStepBtn: 'Continue to Next Step',
    prevStepBtn: 'Back',
    registerBtn: 'Complete Registration & Generate ID',
    registering: 'Creating Farmer Account...',
    quickFill: 'Quick Fill Demo Farmer Data',
    alreadyRegistered: 'Already have a Kisan Setu account?',
    loginLink: 'Login Here',
    successTitle: 'Registration Successful!',
    successSub: 'Your farmer profile has been verified and registered on the Kisan Setu National Grid.',
    farmerIdLabel: 'Unique Kisan Setu ID',
    proceedToDashboard: 'Access Farmer Dashboard',
  },
  footer: {
    desc: 'A Government of India initiative to empower farmers with a transparent, efficient and technology-driven procurement system.',
    quickLinks: 'Quick Links',
    importantLinks: 'Important Links',
    contactUs: 'Contact Us',
    tollFree: '1800-123-4567 (Toll Free)',
    address: 'Krishi Bhawan, New Delhi - 110001',
    copyright: '© 2026 Kisan Setu. Department of Consumer Affairs. All rights reserved.',
  },
}

const hiTranslations: Translations = {
  brandName: 'किसान सेतु',
  brandTagline: 'डिजिटल खरीद प्लेटफॉर्म',
  nav: {
    home: 'मुख्य पृष्ठ',
    about: 'हमारे बारे में',
    howItWorks: 'यह कैसे काम करता है',
    forFarmers: 'किसानों के लिए',
    forCentres: 'केंद्रों के लिए',
    features: 'विशेषताएं',
    contact: 'संपर्क करें',
  },
  loginBtn: 'लॉग इन / साइन इन',
  home: {
    heroKicker: 'स्मार्ट खरीद, सशक्त किसान',
    heroTitle1: 'डिजिटल खरीद,',
    heroTitle2: 'बेहतर किसानी',
    heroDesc:
      'किसानों के लिए स्लॉट बुक करने, लंबी कतारों से बचने, खरीद स्थिति ट्रैक करने और पारदर्शी भुगतान प्राप्त करने का एक विश्वसनीय मंच।',
    bookSlotBtn: 'स्लॉट बुक करें',
    howItWorksBtn: 'यह कैसे काम करता है',
    journeyTitle: 'आपकी यात्रा, हुई आसान',
    journey: [
      { title: 'ऑनलाइन स्लॉट बुक करें', text: 'मंडी, दिनांक और समय चुनें' },
      { title: 'टोकन प्राप्त करें', text: 'तुरंत डिजिटल टोकन पाएं' },
      { title: 'लाइव कतार अपडेट', text: 'रीयल-टाइम कतार ट्रैक करें' },
      { title: 'पारदर्शी खरीद', text: 'डिजिटल तौल और गुणवत्ता जांच' },
      { title: 'सीधा बैंक भुगतान', text: 'खाते में सीधे डीबीटी भुगतान' },
    ],
    benefits: [
      { title: 'समय की बचत', text: 'लंबी कतारों से मुक्ति' },
      { title: 'लाइव अपडेट', text: 'कतार की रीयल-टाइम स्थिति' },
      { title: 'पूर्ण पारदर्शिता', text: 'हर चरण की स्पष्ट ट्रैकिंग' },
      { title: 'सुरक्षित भुगतान', text: 'सीधे बैंक खाते में डीबीटी' },
    ],
    impactLabels: {
      farmers: 'पंजीकृत किसान',
      centres: 'सक्रिय खरीद केंद्र',
      appointments: 'आज के अपॉइंटमेंट',
      procured: 'क्विंटल खरीद आज',
      payments: 'डीबीटी भुगतान संपन्न',
    },
    featuresHeading: 'किसान सेतु की प्रमुख सुविधाएं',
    features: [
      { title: 'स्लॉट बुकिंग', text: 'नजदीकी केंद्र, सुविधाजनक तारीख और समय चुनें।' },
      { title: 'लाइव कतार ट्रैकिंग', text: 'टोकन नंबर और अनुमानित प्रतीक्षा समय देखें।' },
      { title: 'खरीद स्थिति', text: 'तौल और गुणवत्ता ग्रेडिंग की प्रगति ट्रैक करें।' },
      { title: 'सुरक्षित डीबीटी भुगतान', text: 'सीधे अपने बैंक खाते में एमएसपी प्राप्त करें।' },
      { title: 'इतिहास व डिजिटल रसीदें', text: 'पिछले सभी लेन-देन और जे-फॉर्म डाउनलोड करें।' },
    ],
    trustHeading: 'किसान सेतु क्यों चुनें?',
    trustPoints: [
      { title: 'प्रतीक्षा समय में भारी कमी', text: 'स्मार्ट स्लॉट आवंटन से समय की बचत होती है।' },
      { title: 'बेहतर योजना', text: 'अग्रिम बुकिंग से मंडी आवागमन सुगम होता है।' },
      { title: '100% पारदर्शिता', text: 'डिजिटल कांटे से सटीक तौल और पारदर्शी पर्ची।' },
      { title: 'विश्वसनीय व सुरक्षित', text: 'सरकारी एमएसपी की गारंटी और सुरक्षित डीबीटी।' },
    ],
  },
  about: {
    kicker: 'आधिकारिक पहल • भारत सरकार',
    title: 'एक आधुनिक, तीव्र और पारदर्शी कृषि खरीद व्यवस्था का निर्माण',
    desc:
      'किसान सेतु उपभोक्ता मामले विभाग द्वारा विकसित एक डिजिटल मंच है जो किसानों, खरीद केंद्रों और प्रशासकों को जोड़ता है। हम लंबी कतारों को अग्रिम बुकिंग, डिजिटल तौल और समयबद्ध डीबीटी भुगतान में बदलते हैं।',
    badgeTitle: 'आधार व डिजिलॉकर सत्यापित',
    badgeSub: '100% डिजिटल ऑडिटेड प्लेटफॉर्म',
    pillarsHeading: 'किसान सेतु के मार्गदर्शक सिद्धांत',
    pillarsSub: 'हर सुविधा भारतीय किसानों की सरलता, विश्वास और सशक्तिकरण के लिए तैयार की गई है।',
    pillars: [
      {
        title: 'किसान-केंद्रित अनुभव',
        text: 'छोटे और बड़े सभी किसानों के लिए सरल, ताकि अनिश्चितता और कतारें समाप्त हों।',
      },
      {
        title: '100% पारदर्शी तौल',
        text: 'डिजिटल वे-ब्रिज और तत्काल प्रयोगशाला गुणवत्ता ग्रेडिंग रिपोर्ट।',
      },
      {
        title: 'एआई व डेटा अंतर्दृष्टि',
        text: 'कतार प्रतीक्षा समय का सटीक पूर्वानुमान और भीड़ नियंत्रण शेड्यूलिंग।',
      },
      {
        title: 'प्रत्यक्ष लाभ अंतरण (DBT)',
        text: 'बिना बिचौलियों के सीधे बैंक खाते में न्यूनतम समर्थन मूल्य (MSP) का अंतरण।',
      },
    ],
    problemsHeading: 'कृषि खरीद का डिजिटल रूपांतरण',
    problemsSub: 'पारंपरिक मंडी समस्याओं से आधुनिक डिजिटल समाधान की ओर।',
    mandiProblemsTitle: 'पारंपरिक मंडी की चुनौतियाँ',
    solutionsTitle: 'किसान सेतु का डिजिटल समाधान',
    problems: [
      'मंडियों के बाहर ट्रॉलियों के साथ 12-24 घंटे की लंबी और थकाऊ प्रतीक्षा।',
      'अचानक अत्यधिक आवक से मंडी में जाम और फसल खराब होने का डर।',
      'हाथ से लिखी पर्चियों से तौल में गड़बड़ी और अविश्वास की संभावना।',
      'बिचौलियों के माध्यम से भुगतान में देरी और अपारदर्शिता।',
    ],
    solutions: [
      'स्मार्टफोन से पहले ही 2 घंटे का निश्चित स्लॉट बुक करें।',
      'रीयल-टाइम टोकन कॉल अलर्ट और एआई कतार समय ट्रैकिंग।',
      'डिजिटल तौल पर्ची और ऑनलाइन जे-फॉर्म प्रमाण पत्र।',
      'सीधे आधार से जुड़े बैंक खाते में त्वरित डीबीटी भुगतान।',
    ],
    ctaTitle: 'क्या आप आधुनिक मंडी अनुभव के लिए तैयार हैं?',
    ctaDesc: 'देशभर के हजारों किसानों के साथ जुड़ें और अपनी उपज की बिक्री को सुगम बनाएं।',
    ctaHomeBtn: 'मुख्य पृष्ठ पर जाएं',
    ctaHelpdeskBtn: 'किसान हेल्पलाइन से संपर्क करें',
  },
  howItWorks: {
    kicker: 'संपूर्ण 8-चरणीय खरीद प्रक्रिया',
    title1: 'किसान सेतु की कार्यप्रणाली,',
    title2: 'बुकिंग से बैंक खाते तक',
    desc: 'शांत, सुरक्षित और शत-प्रतिशत पारदर्शी खरीद का अनुभव। न लंबी लाइन, न बिचौलिया, न कोई चिंता।',
    badges: {
      slot: '2 घंटे का निश्चित स्लॉट',
      weighment: 'डिजिटल कंप्यूटर कांटा',
      security: 'आधार व डिजिलॉकर प्रमाणित',
      dbt: 'प्रत्यक्ष बैंक अंतरण (DBT)',
    },
    stepsHeading: '8 चरणों की आसान डिजिटल यात्रा',
    stepsSub: 'मोबाइल से स्लॉट चुनने से लेकर सीधे बैंक खाते में एमएसपी पाने तक।',
    steps: [
      {
        step: '01',
        title: 'ऑनलाइन स्लॉट बुकिंग',
        text: 'अपनी नजदीकी मंडी, फसल की किस्म, अनुमानित वजन और 2 घंटे का समय चुनें।',
        tag: 'मोबाइल / वेब',
      },
      {
        step: '02',
        title: 'डिजिटल टोकन प्राप्त करें',
        text: 'अपने मोबाइल पर क्यूआर कोड और टोकन नंबर तुरंत एसएमएस व व्हाट्सएप पर पाएं।',
        tag: 'त्वरित एसएमएस',
      },
      {
        step: '03',
        title: 'गेट पर आसान चेक-इन',
        text: 'मंडी गेट पर टोकन या आधार स्कैन करवाएं और बिना किसी कागजी झंझट के प्रवेश करें।',
        tag: 'आधार सत्यापित',
      },
      {
        step: '04',
        title: 'लाइव कतार व एआई समय',
        text: 'स्क्रीन और मोबाइल पर अपना नंबर देखें। एआई तकनीक बताएगी आपका सटीक बुलावा समय।',
        tag: 'एआई पूर्वानुमान',
      },
      {
        step: '05',
        title: 'डिजिटल कंप्यूटर तौल',
        text: 'इलेक्ट्रॉनिक वे-ब्रिज पर वाहन का कुल और खाली वजन सीधे कंप्यूटर में दर्ज होता है।',
        tag: 'सटीक माप',
      },
      {
        step: '06',
        title: 'प्रयोगशाला गुणवत्ता जांच',
        text: 'प्रमाणित जांचकर्ताओं द्वारा नमी व साफ-सफाई की जांच कर ग्रेड तय किया जाता है।',
        tag: 'लैब प्रमाणित',
      },
      {
        step: '07',
        title: 'डिजिटल जे-फॉर्म जारी',
        text: 'खरीद पूरी होते ही सरकारी जे-फॉर्म प्रमाण पत्र डिजिटल रूप से आपके फोन पर मिलता है।',
        tag: 'सरकारी रसीद',
      },
      {
        step: '08',
        title: 'सीधे खाते में डीबीटी (DBT)',
        text: 'सरकारी न्यूनतम समर्थन मूल्य (MSP) का पूरा पैसा बिना किसी कटौती सीधे बैंक खाते में आता है।',
        tag: 'सीधा बैंक में',
      },
    ],
    rolesHeading: 'हर हितधारक के लिए विशेष सुविधाएं',
    rolesSub: 'किसानों, मंडी ऑपरेटरों और सरकारी अधिकारियों के लिए अलग-अलग सशक्त इंटरफेस।',
    roleTabs: { farmer: 'किसानों के लिए', centre: 'मंडी ऑपरेटरों के लिए', admin: 'प्रशासकों के लिए' },
    farmerView: {
      title: 'हर किसान के लिए सम्मान और सुविधा',
      desc: 'अब ट्रैक्टर की कतार में रात बिताने की जरूरत नहीं। घर बैठे टोकन की स्थिति देखें और निश्चित समय पर मंडी पहुंचे।',
      bullets: [
        '2 घंटे का पक्का समय स्लॉट',
        'लाइव कतार ट्रैकिंग और फोन पर अलर्ट',
        'तुरंत डाउनलोड होने वाला जे-फॉर्म और यूटीआर नंबर',
      ],
      stats: [
        { label: 'औसत प्रतीक्षा समय', val: '28 मिनट (पहले 16 घंटे)' },
        { label: 'तौल की शुद्धता', val: '100% इलेक्ट्रॉनिक' },
        { label: 'भुगतान की गति', val: '24-48 घंटे में' },
      ],
    },
    centreView: {
      title: 'मंडी गेट और तौल कांटे का सुगम संचालन',
      desc: 'कागजी फाइलों से मुक्ति, तेज गति से डिजिटल चेक-इन और ऑटोमैटिक वे-ब्रिज का उपयोग।',
      bullets: [
        'क्यूआर और आधार से त्वरित गेट एंट्री',
        'सीधे कंप्यूटर से तौल रिकॉर्डिंग',
        'मंडी में भीड़ नियंत्रण और सुगम यातायात',
      ],
      stats: [
        { label: 'दैनिक कार्य गति', val: '3.2 गुना तेज' },
        { label: 'तौल विवाद', val: 'शून्य शिकायत' },
        { label: 'मशीनी दक्षता', val: '99.4% अपटाइम' },
      ],
    },
    adminView: {
      title: 'राज्यव्यापी निगरानी और डिजिटल पारदर्शिता',
      desc: 'सैकड़ों मंडियों की लाइव खरीद प्रगति देखें और क्रिप्टोग्राफिक ऑडिट से तौल रिकॉर्ड्स की प्रामाणिकता जांचें।',
      bullets: [
        'राज्यव्यापी हीटमैप और फसल आवक आंकड़े',
        'तौल डेटा की सुरक्षित जांच प्रणाली',
        'सीधे पीएफएमएस/आरबीआई गेटवे से डीबीटी ट्रैकिंग',
      ],
      stats: [
        { label: 'सक्रिय मंडियां', val: '125+ राज्यभर में' },
        { label: 'ऑडिट सुरक्षा', val: '100% डिजिटल' },
        { label: 'आज का भुगतान', val: '₹ 1.85 करोड़+' },
      ],
    },
    faqHeading: 'अक्सर पूछे जाने वाले सवाल (FAQs)',
    faqSub: 'किसान सेतु पर स्लॉट बुकिंग, कतार और भुगतान से जुड़े सभी मुख्य उत्तर।',
    faqs: [
      {
        q: 'क्या मैं अपना बुक किया हुआ स्लॉट बदल या रद्द कर सकता हूँ?',
        a: 'हाँ, आप अपने तय समय से 4 घंटे पहले तक किसान सेतु पोर्टल या टोल फ्री नंबर 1800-123-4567 पर कॉल करके स्लॉट बदल सकते हैं।',
      },
      {
        q: 'एआई द्वारा बताया गया प्रतीक्षा समय कितना सटीक होता है?',
        a: 'यह समय मंडी में सक्रिय कांटों और गाड़ियों की रफ्तार के आधार पर हर 60 सेकंड में अपडेट होता है और पूरी तरह सटीक रहता है।',
      },
      {
        q: 'फसल बेचने के बाद बैंक खाते में पैसे कब तक आते हैं?',
        a: 'जे-फॉर्म जारी होने के बाद पीएफएमएस/आरबीआई के जरिए 24 से 48 घंटे के भीतर सीधे आपके आधार से जुड़े खाते में पैसा आ जाता है।',
      },
      {
        q: 'मंडी जाते समय मुझे कौन-कौन से दस्तावेज ले जाने होंगे?',
        a: 'आपको सिर्फ अपने फोन पर प्राप्त डिजिटल टोकन (या एसएमएस) और अपना मूल आधार कार्ड साथ ले जाना होगा।',
      },
      {
        q: 'अगर मेरी फसल में नमी मानक से अधिक पाई गई तो क्या होगा?',
        a: 'मंडी परिसर में निर्धारित सुखाने के यार्ड में फसल सुखाने के लिए 24 घंटे का समय दिया जाता है, जिसके बाद मुफ्त पुनः जांच होती है।',
      },
    ],
    ctaTitle: 'बिना इंतजार के अपनी फसल बेचने के लिए तैयार हैं?',
    ctaDesc: 'आज ही अपना पक्का स्लॉट बुक करें या सभी मंडियों की लाइव कतार स्थिति देखें।',
    ctaBookBtn: 'ऑनलाइन स्लॉट बुक करें',
    ctaLearnBtn: 'किसान सेतु के बारे में जानें',
  },
  forFarmers: {
    kicker: 'देश के अन्नदाता के सम्मान में समर्पित',
    title1: 'हर किसान के लिए',
    title2: 'सम्मानजनक और सुगम मंडी दिन',
    desc: 'ट्रैक्टर-ट्रॉलियों की लंबी कतारों में रात बिताने से मुक्ति। किसान सेतु सुनिश्चित करता है निश्चित समय, पारदर्शी कंप्यूटर तौल और सीधे बैंक खाते में सरकारी एमएसपी का भुगतान।',
    badges: {
      slots: '2 घंटे का निश्चित स्लॉट',
      msp: '100% गारंटीकृत एमएसपी',
      scale: 'डिजिटल कंप्यूटर कांटा',
      dbt: 'सीधे बैंक खाते में डीबीटी',
    },
    benefitsHeading: 'हर कदम पर किसान का सशक्तिकरण',
    benefitsSub: 'इतनी सरल व्यवस्था कि हर किसान भाई आसानी से अपनी उपज बेच सकें।',
    benefits: [
      {
        title: 'घर बैठे तय करें मंडी का समय',
        text: 'ट्रैक्टर लोड करने से पहले ही मोबाइल से 2 घंटे का निश्चित समय बुक करें और अचानक मंडी बंद होने से बचें।',
      },
      {
        title: 'लाइव नंबर की जानकारी',
        text: 'गांव में रहते हुए ही लाइव टोकन स्थिति और एआई समय देखें, ताकि आपका नंबर आने पर ही आपको पहुंचना पड़े।',
      },
      {
        title: 'सटीक व पारदर्शी कंप्यूटर तौल',
        text: 'इलेक्ट्रॉनिक वे-ब्रिज पर बिना किसी इंसानी हेरफेर के सीधे कंप्यूटर में गाड़ी का वजन दर्ज होता है।',
      },
      {
        title: 'सीधे बैंक खाते में डीबीटी',
        text: 'बिना किसी आढ़ती या दलाल की कटौती के पूरी एमएसपी 24 से 48 घंटे में सीधे बैंक खाते में जमा होती है।',
      },
      {
        title: 'सरकारी डिजिटल जे-फॉर्म',
        text: 'फसल तुलते ही व्हाट्सएप और एसएमएस पर सरकार द्वारा प्रमाणित कानूनी जे-फॉर्म पर्ची तुरंत मिल जाती है।',
      },
      {
        title: '8 भाषाओं में मुफ्त किसान हेल्पलाइन',
        text: 'फसल कटाई के दौरान सुबह 7 से रात 9 बजे तक अपनी मातृभाषा में 1800-123-4567 पर मुफ्त सहायता पाएं।',
      },
    ],
    comparisonHeading: 'पारंपरिक मंडी बनाम किसान सेतु',
    comparisonSub: 'देखें कि डिजिटल खरीद से आपका मंडी अनुभव कैसे बदलता है।',
    traditionalTitle: 'पारंपरिक मंडी का अनुभव',
    kisanSetuTitle: 'किसान सेतु का डिजिटल अनुभव',
    traditionalPoints: [
      'मंडी गेट के बाहर 12 से 24 घंटे तक गाड़ियों की कतार में जागना।',
      'कागज की कच्ची पर्चियों से तौल में गड़बड़ी और अविश्वास।',
      'गुणवत्ता के नाम पर मनमानी कटौती।',
      'आढ़तियों के चक्कर और हफ्तों-महीनों तक भुगतान की अनिश्चितता।',
    ],
    kisanSetuPoints: [
      'निश्चित 2 घंटे का स्लॉट और औसतन 28 मिनट में पूरी खरीद।',
      'कंप्यूटर कांटे से सटीक तौल और तुरंत डिजिटल पर्ची।',
      'सरकारी लैब में नमी और कचरे की पारदर्शी जांच।',
      '24 से 48 घंटे में सीधे बैंक खाते में पूरा एमएसपी भुगतान।',
    ],
    calcHeading: 'सरकारी एमएसपी आय कैलकुलेटर',
    calcSub: 'मंडी जाने से पहले ही अपनी उपज का सरकारी मूल्य आसानी से जानें।',
    calcCropLabel: 'फसल चुनें',
    calcQtyLabel: 'मात्रा (क्विंटल में)',
    calcMspRateLabel: 'सरकारी एमएसपी दर',
    calcTotalPayoutLabel: 'कुल गारंटीकृत भुगतान',
    calcDbtLabel: 'सीधे बैंक खाते में जाने वाली राशि',
    ctaTitle: 'क्या आप सुगम और पारदर्शी खरीद के लिए तैयार हैं?',
    ctaDesc: 'आज ही अपना स्लॉट बुक करें और बिना किसी परेशानी के अपनी उपज बेचें।',
    ctaBookSlot: 'अभी स्लॉट बुक करें',
  },
  forCentres: {
    kicker: 'मंडी संचालन एवं क्षमता प्रबंधन',
    title1: 'खरीद केंद्र प्रबंधन का',
    title2: 'आधुनिक और तीव्र समाधान',
    desc: 'ऑटोमैटिक वे-ब्रिज, रीयल-टाइम यार्ड क्षमता प्रबंधन, बिना कागजी कार्रवाई गेट चेक-इन और डिजिटल जे-फॉर्म प्रमाणन के साथ अपने खरीद केंद्र का संचालन सशक्त बनाएं।',
    badges: {
      antiRush: 'भीड़-नियंत्रित यार्ड शेड्यूलिंग',
      scales: 'ऑटोमैटिक वे-ब्रिज एकीकरण',
      paperless: 'कागजरहित डिजिटल चेक-इन',
      efficiency: '3.2x कार्यकुशलता',
    },
    capabilitiesHeading: 'मुख्य परिचालन मॉड्यूल',
    capabilitiesSub: 'मंडी में भीड़ और जाम को समाप्त करने के लिए तैयार की गई विशेष व्यवस्था।',
    capabilities: [
      {
        title: 'स्मार्ट यार्ड क्षमता और भीड़ नियंत्रण',
        text: 'कांटों की संख्या के आधार पर प्रति घंटे गाड़ियों की सीमा तय करें, ताकि सड़क पर जाम न लगे।',
      },
      {
        title: 'इलेक्ट्रॉनिक वे-ब्रिज स्केल सिंक',
        text: 'गाड़ी का भरा और खाली वजन सीधे कंप्यूटर में दर्ज होता है, जिससे मानवीय भूल की संभावना समाप्त होती है।',
      },
      {
        title: 'प्रयोगशाला गुणवत्ता परीक्षण कंसोल',
        text: 'नमी और कचरे का प्रतिशत सेकंडों में दर्ज कर ऑटोमैटिक ग्रेड-ए/बी/सी प्रमाणपत्र जारी करें।',
      },
      {
        title: 'त्वरित कानूनी जे-फॉर्म जारी करना',
        text: 'खरीद पूरी होते ही डिजिटल हस्ताक्षरित कानूनी जे-फॉर्म पर्ची तुरंत किसान के फोन पर भेजें।',
      },
      {
        title: 'कर्मचारी ड्यूटी रोस्टर व बे आवंटन',
        text: 'गेट, कांटे और गुणवत्ता लैब पर कर्मचारियों की रीयल-टाइम ड्यूटी तैनात करें।',
      },
      {
        title: 'दैनिक समाधान व पीएफएमएस ऑडिट',
        text: 'दिन के अंत में कुल खरीद, शेष स्टॉक और पीएफएमएस डीबीटी भुगतान फाइलों का स्वचालित मिलान।',
      },
    ],
    metricsHeading: 'खरीद केंद्रों के लिए मुख्य लाभ',
    metricsSub: 'मंडी प्रशासकों के लिए अभूतपूर्व गति, पारदर्शिता और सरकारी नियमों का शत-प्रतिशत पालन।',
    metrics: [
      { val: '3.2x', label: 'दैनिक कार्य गति', sub: 'पारंपरिक रजिस्टर प्रणाली की तुलना में' },
      { val: '99.4%', label: 'मशीनी सक्रियता', sub: 'निरंतर अबाधित खरीद प्रवाह' },
      { val: '0', label: 'तौल विवाद', sub: '100% प्रमाणित डिजिटल माप' },
      { val: '100%', label: 'पीएफएमएस/डीबीटी अनुपालन', sub: 'सीधा बैंक भुगतान एकीकरण' },
    ],
    simHeading: 'मंडी क्षमता व थ्रूपुट कैलकुलेटर',
    simSub: 'गाड़ियों के तौल समय के आधार पर दैनिक खरीद क्षमता का सटीक अनुमान लगाएं।',
    simScalesLabel: 'सक्रिय वे-ब्रिज कांटों की संख्या',
    simTimeLabel: 'प्रति गाड़ी औसत तौल समय (मिनट)',
    simHourlyCapacity: 'प्रति घंटे अनुमानित गाड़ियां',
    simDailyThroughput: '10 घंटे की शिफ्ट में अनुमानित खरीद क्षमता',
    ctaTitle: 'क्या आप अपने केंद्र को डिजिटल बनाने के लिए तैयार हैं?',
    ctaDesc: 'मंडी ऑपरेटर कंसोल खोलें या नए खरीद केंद्र पंजीकरण हेतु राज्य प्रशासन से संपर्क करें।',
    ctaPortalBtn: 'ऑपरेटर पोर्टल खोलें',
  },
  featuresPage: {
    kicker: 'आधुनिक राष्ट्रीय कृषि अवसंरचना',
    title1: 'किसान सेतु की',
    title2: 'उन्नत डिजिटल क्षमताएं',
    desc: 'फसल खरीद को आधुनिक बनाने, कतार मुक्त अनुभव देने और सीधे बैंक खाते में भुगतान की गारंटी देने वाली सभी प्रमुख डिजिटल सुविधाएं।',
    badges: {
      ai: 'एआई कतार प्रबंधन',
      scale: 'डिजिटल कांटे',
      dbt: 'सीधा डीबीटी भुगतान',
      cloud: 'सरकारी क्लाउड सुरक्षा',
    },
    gridHeading: 'किसान सेतु की प्रमुख 6 प्रणालियाँ',
    gridSub: 'पारदर्शिता और गति सुनिश्चित करने वाले छह मजबूत डिजिटल स्तंभ।',
    featuresList: [
      {
        title: 'स्मार्ट स्लॉट बुकिंग व शेड्यूलिंग',
        subtitle: 'अनियंत्रित भीड़ का संपूर्ण समाधान',
        desc: 'मंडी की वास्तविक क्षमता के अनुसार प्रति 2 घंटे में निश्चित संख्या में वाहनों का पूर्व आवंटन।',
        bullets: ['ग्राम स्तरीय कोटा संतुलन', 'एसएमएस व व्हाट्सएप अलर्ट', '4 घंटे पहले तक रीशेड्यूल सुविधा'],
      },
      {
        title: 'लाइव कतार व एआई प्रतीक्षा समय',
        subtitle: 'मिनट-दर-मिनट कतार पारदर्शिता',
        desc: 'मशीन लर्निंग मॉडल जो कांटों की गति के अनुसार आपके बुलावे के समय का सटीक अनुमान लगाता है।',
        bullets: ['डिजिटल टोकन स्क्रीन बोर्ड', 'फोन पर पूर्व सूचना अलर्ट', 'मातृभाषा में वॉयस अनाउंसमेंट'],
      },
      {
        title: 'कंप्यूटर कांटा व डिजिटल तौल ऑडिट',
        subtitle: 'बिना मानवीय हस्तक्षेप के सटीक तौल',
        desc: 'इलेक्ट्रॉनिक वे-ब्रिज से सीधा कंप्यूटर कनेक्शन, जो कुल और खाली वजन को डिजिटल हस्ताक्षर के साथ दर्ज करता है।',
        bullets: ['आरएस-232/आईपी स्केल लिंक', 'क्रिप्टोग्राफिक सुरक्षा', 'स्वचालित शुद्ध वजन गणना'],
      },
      {
        title: 'डिजिटल लैब व नमी परीक्षण कंसोल',
        subtitle: 'निष्पक्ष ग्रेड-ए/बी/सी प्रमाणन',
        desc: 'डिजिटल नमी मीटर और विदेशी कचरे की जांच जो 90 सेकंड में परिणाम जारी करती है।',
        bullets: ['सरकारी एफएक्यू मानक अनुपालन', 'डिजिटल गुणवत्ता रिपोर्ट', '24 घंटे में मुफ्त पुनः जांच'],
      },
      {
        title: 'सीधे बैंक खाते में डीबीटी भुगतान',
        subtitle: '100% गारंटीकृत एमएसपी राशि',
        desc: 'पीएफएमएस और आरबीआई गेटवे से सीधा एकीकरण, जिससे पूरा पैसा बिना दलाली सीधे खाते में आता है।',
        bullets: ['आधार लिंक बैंक खाता', 'रीयल-टाइम यूटीआर ट्रैकिंग', 'शून्य दलाली कटौती'],
      },
      {
        title: 'राज्यव्यापी कमान व निगरानी केंद्र',
        subtitle: 'प्रशासकों के लिए रीयल-टाइम नियंत्रण',
        desc: 'राज्यभर की मंडियों की दैनिक खरीद, वाहनों की आवाजाही और किसान शिकायतों का लाइव डैशबोर्ड।',
        bullets: ['जिलावार खरीद हीटमैप', 'गड़बड़ी चेतावनी अलर्ट', 'ऑटोमैटिक ऑडिट रिपोर्ट'],
      },
    ],
    archHeading: 'राष्ट्रीय सुरक्षा एवं डिजिटल विश्वसनीयता',
    archSub: 'उच्चतम सरकारी क्लाउड मानकों पर तैयार किया गया मजबूत ढांचा।',
    archPillars: [
      { title: 'क्रिप्टोग्राफिक सुरक्षा लॉग', desc: 'हर तौल और गुणवत्ता जांच का रिकॉर्ड सुरक्षित और अपरिवर्तनीय डिजिटल लॉग में दर्ज होता है।' },
      { title: 'डिजिलॉकर व आधार प्रमाणीकरण', desc: 'किसान पहचान और जमीन के रिकॉर्ड का बिना किसी कागजी झंझट के डिजिटल सत्यापन।' },
      { title: '99.9% हाई अवेलेबिलिटी क्लाउड', desc: 'फसल कटाई के पीक सीजन में बिना रुकावट काम करने वाला मजबूत सरकारी सर्वर।' },
      { title: 'एंड-टू-एंड डेटा एन्क्रिप्शन', desc: 'बैंकिंग स्तर की टीएलएस 1.3 एन्क्रिप्शन सुरक्षा।' },
    ],
    ctaTitle: 'क्या आप आधुनिक कृषि खरीद का अनुभव करने के लिए तैयार हैं?',
    ctaDesc: 'देशभर के हजारों किसानों, मंडी कर्मचारियों और अधिकारियों के साथ किसान सेतु से जुड़ें।',
    ctaExploreHome: 'मुख्य पोर्टल देखें',
    ctaBookSlot: 'ऑनलाइन स्लॉट बुक करें',
  },
  contactPage: {
    kicker: '24/7 किसान व मंडी सहायता • भारत सरकार',
    title1: 'आपकी सहायता के लिए',
    title2: 'हम हर कदम पर साथ हैं',
    desc: 'स्लॉट बुकिंग, टोकन स्थिति, तौल विवाद या डीबीटी बैंक भुगतान से जुड़े किसी भी सवाल के लिए 8 क्षेत्रीय भाषाओं में तुरंत सहायता प्राप्त करें।',
    badges: {
      tollFree: 'टोल फ्री 1800 हेल्पलाइन',
      languages: '8 क्षेत्रीय भाषाओं में सहायता',
      instant: 'तुरंत शिकायत ट्रैकिंग',
      whatsapp: 'आधिकारिक व्हाट्सएप बॉट',
    },
    channelsHeading: 'सीधे संपर्क सूत्र',
    channelsSub: 'अपनी सुविधानुसार राष्ट्रीय किसान सहायता केंद्र से संपर्क करने का माध्यम चुनें।',
    channels: [
      {
        title: 'टोल फ्री किसान हेल्पलाइन',
        val: '1800-123-4567',
        sub: 'सुबह 7:00 से रात 9:00 बजे तक (सप्ताह के सातों दिन)',
        action: 'हेल्पलाइन पर कॉल करें',
      },
      {
        title: 'आधिकारिक ईमेल हेल्पडेस्क',
        val: 'support@kisansetu.gov.in',
        sub: 'अति आवश्यक मामलों में 2 घंटे के भीतर समाधान',
        action: 'ईमेल भेजें',
      },
      {
        title: 'व्हाट्सएप वर्चुअल सहायक',
        val: '+91 92143 34494',
        sub: 'टोकन क्यूआर और कतार स्थिति व्हाट्सएप पर तुरंत पाएं',
        action: 'व्हाट्सएप खोलें',
      },
      {
        title: 'केंद्रीय राष्ट्रीय मुख्यालय',
        val: 'कृषि भवन, नई दिल्ली',
        sub: 'उपभोक्ता मामले विभाग, पिन: 110001',
        action: 'मानचित्र देखें',
      },
    ],
    formHeading: 'सहायता या शिकायत दर्ज करें',
    formSub: 'नीचे अपना विवरण भरें, हमारी सहायता टीम तुरंत आपसे संपर्क करेगी।',
    formLabels: {
      name: 'पूरा नाम',
      phone: '10 अंकों का मोबाइल नंबर',
      mandi: 'खरीद केंद्र / मंडी का नाम',
      topic: 'विषय / शिकायत की श्रेणी',
      msg: 'समस्या का विस्तृत विवरण',
      submit: 'शिकायत दर्ज करें',
      submitting: 'दर्ज हो रहा है...',
      successTitle: 'शिकायत सफलतापूर्वक दर्ज हो गई है!',
      successDesc: 'सहायता अधिकारी को आपका अनुरोध मिल गया है और वे शीघ्र ही आपके फोन पर संपर्क करेंगे।',
      ticketLabel: 'शिकायत संदर्भ संख्या (Ticket ID)',
    },
    topics: [
      { id: 'slot', label: 'स्लॉट बुकिंग / समय बदलाव संबंधी' },
      { id: 'queue', label: 'टोकन नंबर व लाइव कतार संबंधी' },
      { id: 'scale', label: 'कांटा तौल / नमी जांच विवाद' },
      { id: 'dbt', label: 'डीबीटी बैंक भुगतान व यूटीआर स्थिति' },
      { id: 'operator', label: 'मंडी ऑपरेटर पोर्टल / हार्डवेयर सहायता' },
    ],
    zonesHeading: 'क्षेत्रीय राज्य नोडल डेस्क',
    zonesSub: 'स्थानीय समन्वय के लिए समर्पित राज्य स्तरीय खरीद निगरानी कार्यालय।',
    zones: [
      { region: 'उत्तरी क्षेत्र', state: 'पंजाब, हरियाणा, उत्तर प्रदेश, राजस्थान', phone: '011-23381001', email: 'north@kisansetu.gov.in' },
      { region: 'मध्य क्षेत्र', state: 'मध्य प्रदेश, छत्तीसगढ़', phone: '0755-2551002', email: 'central@kisansetu.gov.in' },
      { region: 'पश्चिमी क्षेत्र', state: 'महाराष्ट्र, गुजरात', phone: '022-22021003', email: 'west@kisansetu.gov.in' },
      { region: 'दक्षिणी क्षेत्र', state: 'तेलंगाना, आंध्र प्रदेश, कर्नाटक, केरल', phone: '040-23451004', email: 'south@kisansetu.gov.in' },
    ],
  },
  farmerLogin: {
    heroTitle1: 'किसान सेतु',
    heroTitle2: 'आपका फसलों का भरोसेमंद साथी',
    heroDesc: 'अपने नजदीकी खरीद केंद्र से जुड़ें, टोकन बुक करें, कतार की स्थिति ट्रैक करें और सीधे बैंक खाते में सही भुगतान पाएं।',
    badges: {
      bookSlot: 'स्लॉट बुक करें',
      liveQueue: 'लाइव कतार',
      sellProduce: 'फसल बेचें',
      fairPayment: 'सीधा भुगतान पाएं',
    },
    trustBanner: 'सुरक्षित • पारदर्शी • किसान प्रथम',
    trustSub: 'देश भर के हजारों किसानों का विश्वसनीय मंच',
    welcomeTitle: 'नमस्ते, किसान भाई!',
    welcomeSubtitle: 'अपने किसान सेतु खाते में प्रवेश करें',
    tabPassword: 'पासवर्ड से लॉगिन',
    tabOtp: 'ओटीपी से लॉगिन',
    mobileLabel: 'पंजीकृत मोबाइल नंबर',
    mobilePlaceholder: '10 अंकों का मोबाइल नंबर दर्ज करें',
    passwordLabel: 'पासवर्ड',
    passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
    forgotPassword: 'पासवर्ड भूल गए?',
    loginBtn: 'डैशबोर्ड में प्रवेश करें',
    loggingIn: 'सत्यापित किया जा रहा है...',
    orDivider: 'या',
    loginWithOtpBtn: 'ओटीपी द्वारा लॉगिन करें',
    loginWithPasswordBtn: 'पासवर्ड द्वारा लॉगिन करें',
    otpInstructions: 'आपके पंजीकृत मोबाइल नंबर पर भेजा गया 6 अंकों का ओटीपी दर्ज करें।',
    otpLabel: 'ओटीपी (One-Time Password)',
    sendOtpBtn: 'ओटीपी भेजें',
    sendingOtp: 'ओटीपी भेजा जा रहा है...',
    resendOtp: 'ओटीपी पुनः भेजें',
    resendIn: 'पुनः भेजें',
    seconds: 'सेकंड',
    verifyBtn: 'सत्यापित करें व प्रवेश करें',
    verifying: 'प्रवेश हो रहा है...',
    newToPlatform: 'किसान सेतु पर नए हैं?',
    registerNow: 'नया पंजीकरण करें',
    demoFarmer: 'डेमो किसान: 9214334494 / 123456',
    quickFill: 'डेमो भरें',
    needHelp: 'सहायता चाहिए?',
    switchRole: 'स्टाफ / एडमिन लॉगिन',
  },
  farmerRegister: {
    heroTitle1: 'किसान सेतु से जुड़ें',
    heroTitle2: 'हर भारतीय किसान के लिए डिजिटल खरीद',
    heroDesc: 'टोकन प्राप्त करने, न्यूनतम समर्थन मूल्य (MSP) पाने और सीधे बैंक खाते में भुगतान के लिए तुरंत ऑनलाइन पंजीकरण करें।',
    steps: {
      step1: 'पहचान व संपर्क',
      step2: 'भूमि व फसल विवरण',
      step3: 'बैंक डीबीटी व पिन',
      step4: 'पंजीकरण पूर्ण',
    },
    trustBanner: 'डीबीटी व डिजिलॉकर प्रमाणित',
    trustSub: 'उपभोक्ता मामले विभाग व कृषि मंत्रालय द्वारा अनुमोदित',
    title: 'किसान पंजीकरण',
    subtitle: 'एमएसपी खरीद हेतु चरणबद्ध सत्यापित नामांकन',
    step1Title: 'चरण 1: किसान की पहचान व स्थान',
    step2Title: 'चरण 2: भूमि व फसल की जानकारी',
    step3Title: 'चरण 3: डीबीटी भुगतान बैंक खाता व पासवर्ड',
    fullNameLabel: 'पूरा नाम (आधार कार्ड अनुसार)',
    fullNamePlaceholder: 'उदा. रमेश कुमार सिंह',
    mobileLabel: '10 अंकों का मोबाइल नंबर',
    mobilePlaceholder: '10 अंकों का मोबाइल नंबर दर्ज करें',
    aadhaarLabel: 'आधार नंबर (अंतिम 4 अंक / वर्चुअल आईडी)',
    aadhaarPlaceholder: 'उदा. 8942',
    stateLabel: 'राज्य',
    districtLabel: 'जिला',
    villageLabel: 'गाँव / तहसील',
    villagePlaceholder: 'उदा. रामपुर, अलवर',
    landCategoryLabel: 'भूमि श्रेणी',
    landCategories: {
      marginal: 'सीमांत (< 1 हेक्टेयर)',
      small: 'लघु (1 - 2 हेक्टेयर)',
      medium: 'मध्यम (2 - 10 हेक्टेयर)',
      large: 'बड़ा (> 10 हेक्टेयर)',
    },
    khasraLabel: 'खसरा / भू-अभिलेख संख्या',
    khasraPlaceholder: 'उदा. KHA-104/89',
    cropLabel: 'खरीद हेतु मुख्य फसल',
    crops: {
      wheat: 'गेहूं',
      paddy: 'धान / चावल',
      mustard: 'सरसों',
      gram: 'चना',
      soybean: 'सोयाबीन',
      cotton: 'कपास',
      maize: 'मक्का',
    },
    quantityLabel: 'बिक्री हेतु अनुमानित फसल मात्रा (क्विंटल)',
    quantityPlaceholder: 'उदा. 50',
    centreLabel: 'निकटतम पसंदीदा मंडी / खरीद केंद्र',
    bankAccountLabel: 'डीबीटी भुगतान हेतु बैंक खाता संख्या',
    bankAccountPlaceholder: '9-18 अंकों का खाता नंबर दर्ज करें',
    ifscLabel: 'बैंक आईएफएससी (IFSC) कोड',
    ifscPlaceholder: 'उदा. SBIN0001234',
    pinLabel: '6 अंकों का लॉगिन पिन / पासवर्ड बनाएं',
    pinPlaceholder: '6 अंकों का पासवर्ड दर्ज करें',
    confirmPinLabel: 'पिन / पासवर्ड की पुष्टि करें',
    confirmPinPlaceholder: 'पुनः पासवर्ड दर्ज करें',
    nextStepBtn: 'अगले चरण पर जाएं',
    prevStepBtn: 'पिछला',
    registerBtn: 'पंजीकरण पूर्ण करें व किसान आईडी प्राप्त करें',
    registering: 'खाता बनाया जा रहा है...',
    quickFill: 'डेमो किसान डेटा भरें',
    alreadyRegistered: 'क्या आपका पहले से खाता है?',
    loginLink: 'यहां लॉगिन करें',
    successTitle: 'पंजीकरण सफलतापूर्वक संपन्न हुआ!',
    successSub: 'आपका किसान प्रोफाइल राष्ट्रीय खरीद ग्रिड पर सफलतापूर्वक पंजीकृत कर दिया गया है।',
    farmerIdLabel: 'विशिष्ट किसान सेतु आईडी',
    proceedToDashboard: 'किसान डैशबोर्ड में प्रवेश करें',
  },
  footer: {
    desc: 'भारत सरकार की एक पहल, किसानों को पारदर्शी, कुशल और तकनीक-संचालित खरीद प्रणाली से सशक्त बनाने हेतु।',
    quickLinks: 'त्वरित लिंक',
    importantLinks: 'महत्वपूर्ण लिंक',
    contactUs: 'संपर्क करें',
    tollFree: '1800-123-4567 (टोल फ्री)',
    address: 'कृषि भवन, नई दिल्ली - 110001',
    copyright: '© 2026 किसान सेतु. उपभोक्ता मामले विभाग, भारत सरकार. सर्वाधिकार सुरक्षित।',
  },
}

// Marathi Translations
const mrTranslations: Translations = {
  ...hiTranslations,
  brandName: 'किसान सेतू',
  brandTagline: 'डिजिटल खरेदी व्यासपीठ',
  nav: {
    home: 'मुख्य पृष्ठ',
    about: 'आमच्याबद्दल',
    howItWorks: 'हे कसे कार्य करते',
    forFarmers: 'शेतकऱ्यांसाठी',
    forCentres: 'केंद्रांसाठी',
    features: 'वैशिष्ट्ये',
    contact: 'संपर्क',
  },
  loginBtn: 'लॉगिन / साइन इन',
  home: {
    ...hiTranslations.home,
    heroKicker: 'स्मार्ट खरेदी, समृद्ध शेतकरी',
    heroTitle1: 'डिजिटल शेती खरेदी,',
    heroTitle2: 'थेट आणि पारदर्शक',
    heroDesc: 'स्मार्ट टोकन बुकिंग, थेट रांग व्यवस्थापन आणि खात्रीशीर हमीभाव थेट बँक खात्यात.',
    bookSlotBtn: 'तुमचा स्लॉट बुक करा',
    howItWorksBtn: 'कसे कार्य करते',
    journeyTitle: 'शेतकरी खरेदी प्रवास',
  },
  farmerLogin: {
    ...hiTranslations.farmerLogin,
    heroTitle1: 'किसान सेतू',
    heroTitle2: 'तुमचा पिकांचा विश्वासू सोबती',
    heroDesc: 'जवळच्या खरेदी केंद्राशी जोडा, स्लॉट बुक करा, थेट रांग तपासा आणि खात्रीशीर हमीभाव थेट खात्यात मिळवा.',
    welcomeTitle: 'स्वागत आहे, शेतकरी बांधव!',
    welcomeSubtitle: 'तुमच्या किसान सेतू खात्यात लॉगिन करा',
    loginBtn: 'डॅशबोर्डमध्ये प्रवेश करा',
    newToPlatform: 'किसान सेतूवर नवीन आहात?',
    registerNow: 'नोंदणी करा',
  },
  farmerRegister: {
    ...hiTranslations.farmerRegister,
    heroTitle1: 'किसान सेतूशी जोडा',
    heroTitle2: 'प्रत्येक शेतकऱ्यासाठी थेट डिजिटल खरेदी',
    title: 'शेतकरी नोंदणी',
    subtitle: 'हमीभाव खरेदीसाठी चरणबद्ध ऑनलाइन नोंदणी',
    proceedToDashboard: 'शेतकरी डॅशबोर्ड उघडा',
  },
}

// Punjabi Translations
const paTranslations: Translations = {
  ...hiTranslations,
  brandName: 'ਕਿਸਾਨ ਸੇਤੂ',
  brandTagline: 'ਡਿਜੀਟਲ ਖਰੀਦ ਪਲੇਟਫਾਰਮ',
  nav: {
    home: 'ਮੁੱਖ ਪੰਨਾ',
    about: 'ਸਾਡੇ ਬਾਰੇ',
    howItWorks: 'ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ',
    forFarmers: 'ਕਿਸਾਨਾਂ ਲਈ',
    forCentres: 'ਖਰੀਦ ਕੇਂਦਰਾਂ ਲਈ',
    features: 'ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ',
    contact: 'ਸੰਪਰਕ ਕਰੋ',
  },
  loginBtn: 'ਲਾਗਇਨ / ਸਾਈਨ ਇਨ',
  home: {
    ...hiTranslations.home,
    heroKicker: 'ਸਮਾਰਟ ਖਰੀਦ, ਖੁਸ਼ਹਾਲ ਕਿਸਾਨ',
    heroTitle1: 'ਡਿਜੀਟਲ ਖਰੀਦ,',
    heroTitle2: 'ਸਿੱਧਾ ਤੇ ਪਾਰਦਰਸ਼ੀ',
    heroDesc: 'ਆਪਣੀ ਫ਼ਸਲ ਲਈ ਟੋਕਨ ਬੁੱਕ ਕਰੋ, ਲਾਈਵ ਲਾਈਨ ਦੇਖੋ ਅਤੇ ਸਿੱਧਾ ਐਮਐਸਪੀ ਭੁਗਤਾਨ ਆਪਣੇ ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ ਪਾਓ।',
    bookSlotBtn: 'ਸਲਾਟ ਬੁੱਕ ਕਰੋ',
    howItWorksBtn: 'ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ',
  },
  farmerLogin: {
    ...hiTranslations.farmerLogin,
    heroTitle1: 'ਕਿਸਾਨ ਸੇਤੂ',
    heroTitle2: 'ਤੁਹਾਡੀਆਂ ਫ਼ਸਲਾਂ ਦਾ ਭਰੋਸੇਮੰਦ ਸਾਥੀ',
    welcomeTitle: 'ਜੀ ਆਇਆਂ ਨੂੰ, ਕਿਸਾਨ ਵੀਰੋ!',
    welcomeSubtitle: 'ਆਪਣੇ ਕਿਸਾਨ ਸੇਤੂ ਖਾਤੇ ਵਿੱਚ ਲਾਗਇਨ ਕਰੋ',
    loginBtn: 'ਡੈਸ਼ਬੋਰਡ ਵਿੱਚ ਦਾਖਲ ਹੋਵੋ',
    newToPlatform: 'ਕਿਸਾਨ ਸੇਤੂ ਤੇ ਨਵੇਂ ਹੋ?',
    registerNow: 'ਨਵੀਂ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਕਰੋ',
  },
  farmerRegister: {
    ...hiTranslations.farmerRegister,
    heroTitle1: 'ਕਿਸਾਨ ਸੇਤੂ ਨਾਲ ਜੁੜੋ',
    heroTitle2: 'ਹਰ ਕਿਸਾਨ ਲਈ ਆਧੁਨਿਕ ਡਿਜੀਟਲ ਖਰੀਦ',
    title: 'ਕਿਸਾਨ ਰਜਿਸਟ੍ਰੇਸ਼ਨ',
    subtitle: 'ਐਮਐਸਪੀ ਖਰੀਦ ਲਈ ਕਦਮ-ਦਰ-ਕਦਮ ਰਜਿਸਟ੍ਰੇਸ਼ਨ',
  },
}

// Bhojpuri Translations
const bhoTranslations: Translations = {
  ...hiTranslations,
  brandName: 'किसान सेतु',
  brandTagline: 'डिजिटल खरीद मंच',
  nav: {
    home: 'होम',
    about: 'हमार बारे में',
    howItWorks: 'ई कइसे काम करेला',
    forFarmers: 'किसान भाई खातिर',
    forCentres: 'खरीद केंद्र खातिर',
    features: 'खासियत',
    contact: 'संपर्क करीं',
  },
  loginBtn: 'लॉगिन करीं',
  home: {
    ...hiTranslations.home,
    heroKicker: 'स्मार्ट खरीद, सुखी किसान',
    heroTitle1: 'डिजिटल खरीद,',
    heroTitle2: 'सीधा आ पारदर्शी',
    heroDesc: 'टोकन बुक करीं, लाइन देखीं आ सीधे बैंक खाता में एमएसपी पईसा पाईं।',
    bookSlotBtn: 'स्लॉट बुक करीं',
    howItWorksBtn: 'काम कइसे करेला',
  },
  farmerLogin: {
    ...hiTranslations.farmerLogin,
    welcomeTitle: 'प्रणाम, किसान भाई!',
    welcomeSubtitle: 'किसान सेतु खाता में लॉगिन करीं',
    loginBtn: 'डैशबोर्ड में जाईं',
    registerNow: 'नया खाता बनाईं',
  },
  farmerRegister: {
    ...hiTranslations.farmerRegister,
    heroTitle1: 'किसान सेतु से जुड़ीं',
    title: 'किसान रजिस्ट्रेशन',
  },
}

// Telugu Translations
const teTranslations: Translations = {
  ...enTranslations,
  brandName: 'కిసాన్ సేతు',
  brandTagline: 'డిజిటల్ సేకరణ వేదిక',
  nav: {
    home: 'హోమ్',
    about: 'మా గురించి',
    howItWorks: 'ఇది ఎలా పనిచేస్తుంది',
    forFarmers: 'రైతుల కోసం',
    forCentres: 'సేకరణ కేంద్రాల కోసం',
    features: 'ఫీచర్లు',
    contact: 'సంప్రదించండి',
  },
  loginBtn: 'లాగిన్ / సైన్ ఇన్',
  home: {
    ...enTranslations.home,
    heroKicker: 'స్మార్ట్ సేకరణ, ఆనందకరమైన రైతులు',
    heroTitle1: 'డిజిటల్ వ్యవసాయ సేకరణ,',
    heroTitle2: 'పారదర్శకం & వేగవంతం',
    heroDesc: 'స్మార్ట్ స్లాట్ బుకింగ్, లైవ్ క్యూ ట్రాకింగ్ మరియు మీ బ్యాంక్ ఖాతాకు నేరుగా MSP చెల్లింపులు.',
    bookSlotBtn: 'స్లాట్ బుక్ చేయండి',
    howItWorksBtn: 'ఇది ఎలా పనిచేస్తుంది',
  },
  farmerLogin: {
    ...enTranslations.farmerLogin,
    heroTitle1: 'కిసాన్ సేతు',
    heroTitle2: 'మీ పంటల నమ్మకమైన భాగస్వామి',
    welcomeTitle: 'స్వాగతం, రైతు మిత్రమా!',
    welcomeSubtitle: 'మీ కిసాన్ సేతు ఖాతాలోకి లాగిన్ అవ్వండి',
    loginBtn: 'డ్యాష్‌బోర్డ్‌కు వెళ్లండి',
    newToPlatform: 'కిసాన్ సేతుకు కొత్తవారా?',
    registerNow: 'ఇప్పుడే నమోదు చేసుకోండి',
  },
  farmerRegister: {
    ...enTranslations.farmerRegister,
    heroTitle1: 'కిసాన్ సేతులో చేరండి',
    heroTitle2: 'ప్రతి రైతుకు ప్రత్యక్ష డిజిటల్ సేకరణ',
    title: 'రైతు నమోదు',
    subtitle: 'MSP సేకరణ కోసం దశలవారీగా ధృవీకరించబడిన నమోదు',
  },
}

// Kannada Translations
const knTranslations: Translations = {
  ...enTranslations,
  brandName: 'ಕಿಸಾನ್ ಸೇತು',
  brandTagline: 'ಡಿಜಿಟಲ್ ಖರೀದಿ ವೇದಿಕೆ',
  nav: {
    home: 'ಮುಖಪುಟ',
    about: 'ನಮ್ಮ ಬಗ್ಗೆ',
    howItWorks: 'ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ',
    forFarmers: 'ರೈತರಿಗಾಗಿ',
    forCentres: 'ಖರೀದಿ ಕೇಂದ್ರಗಳಿಗಾಗಿ',
    features: 'ವೈಶಿಷ್ಟ್ಯಗಳು',
    contact: 'ಸಂಪರ್ಕಿಸಿ',
  },
  loginBtn: 'ಲಾಗಿನ್ / ಸೈನ್ ಇನ್',
  home: {
    ...enTranslations.home,
    heroKicker: 'ಸ್ಮಾರ್ಟ್ ಖರೀದಿ, ಸಮೃದ್ಧ ರೈತರು',
    heroTitle1: 'ಡಿಜಿಟಲ್ ಕೃಷಿ ಖರೀದಿ,',
    heroTitle2: 'ನೇರ ಮತ್ತು ಪಾರದರ್ಶಕ',
    heroDesc: 'ಸ್ಮಾರ್ಟ್ ಸ್ಲಾಟ್ ಬುಕಿಂಗ್, ಲೈವ್ ಕ್ಯೂ ಟ್ರ್ಯಾಕಿಂಗ್ ಮತ್ತು ನೇರವಾಗಿ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಎಂಎಸ್‌ಪಿ ಪಾವತಿ.',
    bookSlotBtn: 'ಸ್ಲಾಟ್ ಬುಕ್ ಮಾಡಿ',
    howItWorksBtn: 'ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ',
  },
  farmerLogin: {
    ...enTranslations.farmerLogin,
    heroTitle1: 'ಕಿಸಾನ್ ಸೇತು',
    heroTitle2: 'ನಿಮ್ಮ ಬೆಳೆಗಳ ವಿಶ್ವಾಸಾರ್ಹ ಪಾಲುದಾರ',
    welcomeTitle: 'ಸ್ವಾಗತ, ರೈತ ಮಿತ್ರರೇ!',
    welcomeSubtitle: 'ನಿಮ್ಮ ಕಿಸಾನ್ ಸೇತು ಖಾತೆಗೆ ಲಾಗಿನ್ ಮಾಡಿ',
    loginBtn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಪ್ರವೇಶಿಸಿ',
    newToPlatform: 'ಕಿಸಾನ್ ಸೇತುಗೆ ಹೊಸಬರೇ?',
    registerNow: 'ಈಗಲೇ ನೋಂದಾಯಿಸಿ',
  },
  farmerRegister: {
    ...enTranslations.farmerRegister,
    heroTitle1: 'ಕಿಸಾನ್ ಸೇತುಗೆ ಸೇರಿ',
    heroTitle2: 'ಪ್ರತಿಯೊಬ್ಬ ರೈತರಿಗೆ ನೇರ ಡಿಜಿಟಲ್ ಖರೀದಿ',
    title: 'ರೈತರ ನೋಂದಣಿ',
  },
}

// Malayalam Translations
const mlTranslations: Translations = {
  ...enTranslations,
  brandName: 'കിസാൻ സേതു',
  brandTagline: 'ഡിജിറ്റൽ സംഭരണ പ്ലാറ്റ്‌ഫോം',
  nav: {
    home: 'ഹോം',
    about: 'ഞങ്ങളെക്കുറിച്ച്',
    howItWorks: 'ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു',
    forFarmers: 'കർഷകർക്കായി',
    forCentres: 'സംഭരണ കേന്ദ്രങ്ങൾക്കായി',
    features: 'സവിശേഷതകൾ',
    contact: 'ബന്ധപ്പെടുക',
  },
  loginBtn: 'ലോഗിൻ / സൈൻ ഇൻ',
  home: {
    ...enTranslations.home,
    heroKicker: 'സ്മാർട്ട് സംഭരണം, സംതൃപ്ത കർഷകർ',
    heroTitle1: 'ഡിജിറ്റൽ സംഭരണം,',
    heroTitle2: 'നേരിട്ടും സുതാര്യമായും',
    heroDesc: 'സ്മാർട്ട് സ്ലോട്ട് ബുക്കിംഗ്, ലൈവ് ക്യൂ ട്രാക്കിംഗ്, ബാങ്ക് അക്കൗണ്ടിലേക്ക് നേരിട്ട് എംഎസ്പി തുക.',
    bookSlotBtn: 'സ്ലോട്ട് ബുക്ക് ചെയ്യുക',
    howItWorksBtn: 'പ്രവർത്തനം എങ്ങനെ',
  },
  farmerLogin: {
    ...enTranslations.farmerLogin,
    heroTitle1: 'കിസാൻ സേതു',
    heroTitle2: 'നിങ്ങളുടെ കാർഷിക വിളകളുടെ വിശ്വസ്ത പങ്കാളി',
    welcomeTitle: 'സ്വാഗതം, കർഷക സുഹൃത്തേ!',
    welcomeSubtitle: 'നിങ്ങളുടെ കിസാൻ സേതു അക്കൗണ്ടിലേക്ക് ലോഗിൻ ചെയ്യുക',
    loginBtn: 'ഡാഷ്‌ബോർഡിലേക്ക് പ്രവേശിക്കുക',
    newToPlatform: 'കിസാൻ സേതുവിൽ പുതിയ ആളാണോ?',
    registerNow: 'ഇപ്പോൾ രജിസ്റ്റർ ചെയ്യുക',
  },
  farmerRegister: {
    ...enTranslations.farmerRegister,
    heroTitle1: 'കിസാൻ സേതുവിൽ ചേരുക',
    title: 'കർഷക രജിസ്ട്രേഷൻ',
  },
}

export const TRANSLATIONS: Record<LanguageCode, Translations> = {
  en: enTranslations,
  hi: hiTranslations,
  mr: mrTranslations,
  te: teTranslations,
  ml: mlTranslations,
  bho: bhoTranslations,
  pa: paTranslations,
  kn: knTranslations,
}

