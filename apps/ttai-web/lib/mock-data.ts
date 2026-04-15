// ═══════════════════════════════════════════════════════════════
// LARGE-SCALE MOCK DATA GENERATOR — 5 temples × ~1 lakh rows each
// ═══════════════════════════════════════════════════════════════
//
// This file exports:
//   1. TEMPLE_PROFILES — 5 famous Indian temples
//   2. generateLargeTempleData(profile) — produces ~1,00,000 records
//
// Data is generated programmatically via a seeded PRNG (deterministic).
// Same temple profile always produces the same data.
//
// Row distribution per temple:
//   Donation transactions   40,000
//   Donor directory         10,000
//   Booking history          25,000
//   Complaint log            10,000
//   Inventory log             5,000
//   Staff roster                500
//   Priests                     100
//   Festival history            200
//   VIP visits                  500
//   Daily footfall log        3,650  (10 years)
//   Historical comparisons       36  (3 years monthly)
//   Pending decisions            50
//   Seva bookings             8,000
//   Prasadam records          5,000
//   Dharamshala bookings      3,000
//   Parking tokens           10,000
//   Hundi collections         2,000
//   Darshan tokens           15,000
//   Shop sales                5,000
//   Aarti schedule            1,500
//   Vendor contracts            200
//   Utility bills               500
//   CCTV incidents            1,000
//   Lost & found                500
//   Devotee feedback          3,000
//   Payment modes             1,000
//   Donation receipts         4,000
//   ─────────────────────────────────
//   Total                  ~1,50,736  per temple
//   Grand total            ~7,53,680  across 5 temples

import type {
  Temple,
  TempleProfile,
  Donation,
  Booking,
  Festival,
  Complaint,
  InventoryAlert,
  Priest,
  DonorRecord,
  ComplaintDetail,
  StaffMember,
  VIPVisit,
  ReconciliationSummary,
  HistoricalComparison,
  PendingDecision,
  SevaBooking,
  PrasadamRecord,
  DharamshalaBooking,
  ParkingToken,
  HundiCollection,
  DarshanToken,
  ShopSale,
  AartiScheduleEntry,
  VendorContract,
  UtilityBill,
  CCTVIncident,
  LostFoundItem,
  DevoteeFeedback,
  PaymentModeRecord,
  DonationReceipt,
  MonthlyPnL,
  DailyStats,
  Forecast,
  KeyInsight,
} from './temple-types';

// ─── 5 TEMPLE PROFILES ────────────────────────────────────────

export const TEMPLE_PROFILES: TempleProfile[] = [
  {
    id: 'temple-001',
    name: 'Shri Siddhivinayak Mandir',
    deity: 'Lord Ganesha',
    city: 'Mumbai',
    state: 'Maharashtra',
    founded: 1801,
    languages: ['Marathi', 'Hindi', 'English'],
    description: 'One of the most visited Ganesha temples in India, located in Prabhadevi, Mumbai.',
    trustChairman: 'Adv. Aadesh Bandekar',
    onboardedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'temple-002',
    name: 'Kashi Vishwanath Temple',
    deity: 'Lord Shiva',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    founded: 1780,
    languages: ['Hindi', 'Sanskrit', 'English'],
    description: 'One of the twelve Jyotirlingas, the holiest of Shiva temples on the banks of Ganga.',
    trustChairman: 'Sri Nagendra Pandey',
    onboardedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'temple-003',
    name: 'Tirumala Tirupati Balaji Temple',
    deity: 'Lord Venkateswara',
    city: 'Tirupati',
    state: 'Andhra Pradesh',
    founded: 300,
    languages: ['Telugu', 'Tamil', 'Hindi', 'English'],
    description: 'The richest and most visited Hindu temple in the world, atop the seven hills.',
    trustChairman: 'Sri YV Subba Reddy',
    onboardedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'temple-004',
    name: 'Meenakshi Amman Temple',
    deity: 'Goddess Meenakshi',
    city: 'Madurai',
    state: 'Tamil Nadu',
    founded: 1623,
    languages: ['Tamil', 'English'],
    description: 'A historic temple dedicated to Meenakshi (Parvati) and Sundareshwarar (Shiva).',
    trustChairman: 'HR&CE Department',
    onboardedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'temple-005',
    name: 'ISKCON Temple Bangalore',
    deity: 'Lord Krishna',
    city: 'Bangalore',
    state: 'Karnataka',
    founded: 1997,
    languages: ['Kannada', 'Hindi', 'English', 'Sanskrit'],
    description: 'One of the largest Krishna temples in the world, known for its cultural programs.',
    trustChairman: 'Sri Madhu Pandit Dasa',
    onboardedAt: '2026-01-01T00:00:00.000Z',
  },
];

// ─── SEEDED PRNG (mulberry32) ──────────────────────────────────

function makeRng(seed: number) {
  return function rng() {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return hash;
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

function intBetween(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function dateStr(daysOffset: number): string {
  const d = new Date('2026-04-14');
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0]!;
}

// ─── REFERENCE DATA ARRAYS ────────────────────────────────────

const FIRST_NAMES = ['Ramesh', 'Suresh', 'Anil', 'Vijay', 'Deepak', 'Manoj', 'Rajesh', 'Sandeep', 'Harish', 'Mukesh', 'Vinod', 'Dinesh', 'Ashok', 'Kishore', 'Pradeep', 'Nitin', 'Hemant', 'Tushar', 'Sachin', 'Rahul', 'Ganesh', 'Vikram', 'Sunil', 'Prakash', 'Kiran', 'Mohan', 'Rohan', 'Ajay', 'Sanjay', 'Amit'];
const LAST_NAMES = ['Sharma', 'Patel', 'Iyer', 'Reddy', 'Kumar', 'Joshi', 'Singh', 'Nair', 'Gupta', 'Desai', 'Tiwari', 'Krishnan', 'Verma', 'Agarwal', 'Rao', 'Mehta', 'Pillai', 'Kapoor', 'Bhat', 'Menon', 'Shah', 'Bose', 'Chopra', 'Saxena', 'Panicker', 'Naik', 'Sawant', 'Patil', 'Shinde', 'Kulkarni'];
const FEMALE_FIRST = ['Priya', 'Kavita', 'Sunita', 'Meera', 'Anjali', 'Lakshmi', 'Pooja', 'Geeta', 'Nisha', 'Shobha', 'Asha', 'Rekha', 'Smita', 'Usha', 'Mala', 'Pallavi', 'Vaishali', 'Nandini', 'Shweta', 'Sarita', 'Anita', 'Sneha', 'Manisha', 'Madhuri', 'Rashmi'];
const CITIES = ['Mumbai', 'Pune', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Ahmedabad', 'Kolkata', 'Jaipur', 'Nashik', 'Thane', 'Nagpur', 'Lucknow', 'Indore', 'Bhopal', 'Chandigarh', 'Coimbatore', 'Surat', 'Vadodara', 'Mysore'];
const DONATION_PURPOSES = ['General Donation', 'Annadanam', 'Aarti Sponsorship', 'Festival Fund', 'Temple Maintenance', 'Priest Dakshina', 'Gold Ornament Fund', 'Prasad Sponsorship', 'Flower Garland Offering', 'Education Fund', 'Medical Camp Fund', 'Renovation Fund', 'Lighting Fund', 'Security Upgrade', 'Digital Infrastructure'];
const PUJA_TYPES = ['Abhishekam', 'Archana', 'Sahasranama Archana', 'Ganapati Homam', 'Navagraha Shanti', 'Rudra Abhishekam', 'Lakshmi Kubera Homam', 'Satyanarayana Puja', 'Maha Mrityunjaya Japa', 'Chandi Homam', 'Sudarshana Homam', 'Annaprashan', 'Namakaranam', 'Vivaha', 'Grihapravesh', 'Ayushya Homam', 'Kumbh Vivah', 'Pitru Tarpan'];
const COMPLAINT_CATEGORIES = ['Long Darshan Queue', 'Parking Congestion', 'Cleanliness', 'Donation Receipt Delay', 'Overcrowding', 'Noise Disturbance', 'Footwear Stand Issues', 'Staff Behaviour', 'Prasad Quality', 'Safety Concern', 'Accessibility Issue', 'Online Booking Error', 'Refund Not Received', 'VIP Line Misuse', 'Water/Restroom'];
const COMPLAINT_DESCS: Record<string, string[]> = {
  'Long Darshan Queue': ['Wait exceeded 2 hours', 'No shade in queue area', 'Senior citizen lane not operational', 'Queue management staff absent', 'Online and walk-in in same queue'],
  'Parking Congestion': ['No parking after 9 AM', 'Attendant demanded extra payment', 'Two-wheeler area blocked', 'Auto stand blocking entrance', 'Disabled parking occupied by staff'],
  'Cleanliness': ['Prasad counter dirty', 'Restrooms not cleaned', 'Garbage overflow at entrance', 'Ants on counter', 'Flower waste piled near sanctum'],
  'Donation Receipt Delay': ['80G receipt not received', 'Wrong PAN on receipt', 'Receipt machine broken', 'Online receipt delayed 2 weeks', 'Duplicate receipt issued'],
  'Overcrowding': ['Stampede-like during aarti', 'Children separated in rush', 'No crowd barriers at gate', 'Emergency exit blocked', 'Overcapacity in main hall'],
  'Noise Disturbance': ['Construction during darshan', 'Loudspeaker excessive', 'Vendor noise at entrance', 'Generator running during puja', 'Traffic noise from new road'],
  'Footwear Stand Issues': ['Lost footwear', 'Stand unmanned', 'Charged extra for storage', 'Shoes returned wet', 'Wrong pair given'],
  'Staff Behaviour': ['Rude response at counter', 'Staff on phone during duty', 'Ignored elderly devotee', 'Shouted at child', 'Refused to help with directions'],
  'Prasad Quality': ['Stale ladoo', 'Packaging torn', 'Quantity less than paid', 'Foreign object found', 'Taste different from usual'],
  'Safety Concern': ['Wet floor no warning sign', 'Broken step at entrance', 'Electrical wire exposed', 'Fire extinguisher expired', 'CCTV not working'],
  'Accessibility Issue': ['No ramp for wheelchair', 'Elevator out of order', 'Braille signage missing', 'No hearing loop at counter', 'Steps too steep for elderly'],
  'Online Booking Error': ['Payment deducted but no confirmation', 'Double booking', 'Wrong date assigned', 'Cannot cancel online', 'OTP not received'],
  'Refund Not Received': ['Cancelled 2 weeks ago no refund', 'Partial refund only', 'Refund to wrong account', 'No response to refund request', 'Refund promised but not processed'],
  'VIP Line Misuse': ['Non-VIP in VIP queue', 'No pass verification', 'VIP queue longer than regular', 'Staff family using VIP line', 'Politicians bypassing all queues'],
  'Water/Restroom': ['No drinking water available', 'Restroom locked', 'Only 1 restroom for 1000 devotees', 'No soap in restroom', 'Water cooler broken'],
};
const TIME_SLOTS = ['6 AM – 9 AM', '9 AM – 12 PM', '12 PM – 3 PM', '3 PM – 6 PM', '6 PM – 9 PM'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const STAFF_ROLES = ['Queue Manager', 'Security Guard', 'Prasad Counter', 'Ticket Counter', 'Cleaning Staff', 'Help Desk', 'Parking Attendant', 'Flower Counter', 'CCTV Operator', 'First Aid', 'Volunteer Coordinator', 'Kitchen Staff', 'Electrician', 'Sound Operator', 'Gate Manager', 'Accounts Clerk', 'Store Keeper', 'Water Supply', 'Gardener', 'Driver'];
const PRIEST_SPECS = ['Abhishekam', 'Rudra Path', 'Homam', 'Archana', 'Vivaha Samskara', 'Vastu Shanti', 'Navagraha Puja', 'Satyanarayana Katha', 'Veda Parayana', 'Festival Coordination', 'Daily Aarti', 'Ganesh Puja', 'Shiva Puja', 'Vishnu Puja', 'Devi Puja', 'Yantra Puja', 'Pitru Karma', 'Annaprashan', 'Upanayanam', 'Grihapravesh'];
const VIP_NAMES = ['Shri Narendra Modi', 'Smt. Nirmala Sitharaman', 'Shri Amit Shah', 'Shri Devendra Fadnavis', 'Shri Yogi Adityanath', 'Smt. Smriti Irani', 'Shri Nitin Gadkari', 'Shri Rajnath Singh', 'Shri Ratan Tata', 'Shri Mukesh Ambani', 'Smt. Nita Ambani', 'Shri Azim Premji', 'Shri Amitabh Bachchan', 'Shri Sachin Tendulkar', 'Sri Sri Ravi Shankar', 'Swami Chidananda', 'Sadhguru Jaggi Vasudev', 'Shri Baba Ramdev', 'Smt. Sudha Murty', 'Dr. APJ Abdul Kalam Foundation'];
const VIP_DESIGS = ['Prime Minister', 'Finance Minister', 'Home Minister', 'Chief Minister', 'Governor', 'MP', 'MLA', 'Mayor', 'Industrialist', 'Philanthropist', 'Actor', 'Cricketer', 'Spiritual Leader', 'Foundation Chair', 'Business Leader'];
const INVENTORY_ITEMS = ['Camphor', 'Ghee', 'Coconut', 'Marigold Garlands', 'Incense Sticks', 'Prasad Boxes', 'Sandalwood Paste', 'Kumkum', 'Turmeric', 'Rice', 'Sugar', 'Milk', 'Curd', 'Honey', 'Banana', 'Betel Leaves', 'Betel Nuts', 'Cotton Wicks', 'Matchboxes', 'Cloth for Deity', 'Thread (Mauli)', 'Modak Moulds', 'Oil Lamps', 'Silver Foil', 'Saffron'];
const INVENTORY_UNITS = ['kg', 'L', 'pcs', 'boxes', 'packets', 'bundles', 'bottles'];
const FESTIVALS_BY_DEITY: Record<string, string[]> = {
  'Lord Ganesha': ['Ganesh Chaturthi', 'Sankashti Chaturthi', 'Ganesh Jayanti', 'Vinayak Chaturthi', 'Maghi Ganeshotsav', 'Diwali', 'Navratri', 'Makar Sankranti'],
  'Lord Shiva': ['Maha Shivaratri', 'Shravan Somvar', 'Pradosham', 'Kartik Purnima', 'Diwali', 'Navratri', 'Makar Sankranti', 'Arudra Darshanam'],
  'Lord Venkateswara': ['Brahmotsavam', 'Vaikuntha Ekadashi', 'Rama Navami', 'Janmashtami', 'Diwali', 'Pongal', 'Rathasapthami', 'Teppotsavam'],
  'Goddess Meenakshi': ['Meenakshi Thirukalyanam', 'Navratri', 'Aadi Festival', 'Thai Poosam', 'Diwali', 'Pongal', 'Chithirai Festival', 'Float Festival'],
  'Lord Krishna': ['Janmashtami', 'Radha Ashtami', 'Govardhan Puja', 'Holi', 'Annakut', 'Diwali', 'Ratha Yatra', 'Kartik Purnima'],
};

const DECISION_TOPICS = [
  'Digital Queue Token System', 'Prasad Home Delivery Service', 'Flower Vendor Contract', 'Volunteer Recruitment Drive',
  'CCTV System Upgrade', 'Online Donation Gateway Migration', 'Temple Website Redesign', 'Solar Panel Installation',
  'Parking Lot Expansion', 'Mobile App Development', 'Annadanam Kitchen Expansion', 'Fire Safety Audit',
  'New Restroom Block Construction', 'LED Lighting Upgrade', 'Sound System Replacement', 'Heritage Conservation Plan',
  'Staff Uniform Policy', 'Devotee Feedback Kiosk', 'Accessibility Ramp Construction', 'Temple Museum Creation',
];

const SEVA_TYPES = ['Anna Seva', 'Go Seva', 'Pushpa Seva', 'Deepa Seva', 'Vastra Seva', 'Abhishekam Seva', 'Archana Seva', 'Naivedyam Seva', 'Suprabhata Seva', 'Prasadam Distribution Seva'];
const PRASADAM_TYPES = ['Modak', 'Laddu', 'Panchaamrit', 'Kheer', 'Puri-Sabzi', 'Pulao', 'Sweet Rice', 'Halwa', 'Boondi', 'Shrikhand'];
const ROOM_TYPES = ['single', 'double', 'family', 'dormitory', 'vip-suite'] as const;
const VEHICLE_TYPES = ['two-wheeler', 'four-wheeler', 'auto', 'bus', 'bicycle'] as const;
const SHOP_ITEMS = [
  { name: 'Bhagavad Gita Book', cat: 'Books' }, { name: 'Temple Photo Frame', cat: 'Photos' },
  { name: 'Deity Idol (Small)', cat: 'Idols' }, { name: 'Rudraksha Mala', cat: 'Accessories' },
  { name: 'Devotional CD', cat: 'Media' }, { name: 'Silk Dhoti', cat: 'Clothing' },
  { name: 'Brass Diya', cat: 'Pooja Items' }, { name: 'Kumkum Box', cat: 'Pooja Items' },
  { name: 'Incense Gift Pack', cat: 'Pooja Items' }, { name: 'Calendar', cat: 'Prints' },
  { name: 'Temple T-Shirt', cat: 'Clothing' }, { name: 'Chandan Paste', cat: 'Pooja Items' },
  { name: 'Silver Coin', cat: 'Precious' }, { name: 'Copper Lota', cat: 'Vessels' },
  { name: 'Hanuman Chalisa Book', cat: 'Books' },
];
const AARTI_NAMES = ['Mangala Aarti', 'Abhishekam Aarti', 'Madhyanha Aarti', 'Sandhya Aarti', 'Shayan Aarti', 'Special Festival Aarti'];
const VENDOR_TYPES_LIST = ['Flowers', 'Food Supplies', 'Cleaning Services', 'Security Services', 'Electrical Maintenance', 'Plumbing', 'Prasadam Ingredients', 'Packaging Materials', 'Printing Services', 'Transport'];
const UTILITY_TYPES_LIST = ['Electricity', 'Water', 'Gas', 'Internet', 'Waste Disposal'];
const INCIDENT_TYPES_LIST = ['Theft Attempt', 'Vandalism', 'Unauthorized Entry', 'Medical Emergency', 'Fire Alarm', 'Crowd Surge', 'Equipment Damage', 'Suspicious Activity'];
const PAYMENT_MODES_LIST = ['cash', 'upi', 'credit-card', 'bank-transfer', 'cheque'] as const;
const HUNDI_LOCATIONS = ['Main Sanctum Hundi', 'South Gate Hundi', 'North Gate Hundi', 'Annadanam Hall Hundi', 'Online Donation Box'];
const PARKING_LOTS = ['Lot-A (Main)', 'Lot-B (South)', 'Lot-C (Overflow)', 'Lot-D (VIP)', 'Lot-E (Two-Wheeler)'];
const LOST_ITEMS = ['Mobile Phone', 'Wallet', 'Gold Chain', 'Spectacles', 'Handbag', 'Umbrella', 'Footwear', 'Watch', 'Keys', 'Child Toy', 'Water Bottle', 'Camera'];
const FEEDBACK_CATEGORIES = ['Darshan Experience', 'Prasadam Quality', 'Cleanliness', 'Staff Behavior', 'Queue Management', 'Parking', 'Facilities', 'Online Services', 'Safety', 'Accessibility'];
const CAMERA_IDS = ['CAM-MAIN-01', 'CAM-MAIN-02', 'CAM-SOUTH-01', 'CAM-NORTH-01', 'CAM-PARK-01', 'CAM-PARK-02', 'CAM-SHOP-01', 'CAM-KITCHEN-01', 'CAM-ENTRY-01', 'CAM-ENTRY-02'];

// ─── GENERATOR ─────────────────────────────────────────────────

function makeName(rng: () => number): string {
  if (rng() > 0.5) return pick(rng, FIRST_NAMES) + ' ' + pick(rng, LAST_NAMES);
  return pick(rng, FEMALE_FIRST) + ' ' + pick(rng, LAST_NAMES);
}

export function generateLargeTempleData(profile: TempleProfile): Temple {
  const rng = makeRng(seedFromString(profile.id + profile.name));

  // ── 40,000 DONATION TRANSACTIONS (3+ years history) ──
  const recentDonations: Donation[] = Array.from({ length: 40_000 }, (_, i) => ({
    donor: (rng() > 0.5 ? 'Shri ' : 'Smt. ') + makeName(rng),
    amount: intBetween(rng, 100, 5_00_000),
    date: dateStr(-Math.floor(i / 30) - intBetween(rng, 0, 30)),
    purpose: pick(rng, DONATION_PURPOSES),
  }));

  // ── 10,000 DONORS ──
  const donorDirectory: DonorRecord[] = Array.from({ length: 10_000 }, () => {
    const total = intBetween(rng, 500, 10_00_000);
    const daysSinceLast = intBetween(rng, 1, 400);
    return {
      name: (rng() > 0.5 ? 'Shri ' : 'Smt. ') + makeName(rng),
      totalDonatedINR: total,
      donationCount: intBetween(rng, 1, 50),
      lastDonationDate: dateStr(-daysSinceLast),
      firstDonationDate: dateStr(-intBetween(rng, 365, 3650)),
      city: pick(rng, CITIES),
      tier: total >= 2_00_000 ? 'platinum' as const : total >= 50_000 ? 'gold' as const : total >= 10_000 ? 'silver' as const : 'regular' as const,
      lapsed: daysSinceLast > 90,
    };
  }).sort((a, b) => b.totalDonatedINR - a.totalDonatedINR);

  // ── 25,000 BOOKINGS (2+ years) ──
  const upcomingBookings: Booking[] = Array.from({ length: 25_000 }, (_, i) => ({
    devotee: (rng() > 0.5 ? 'Shri ' : 'Smt. ') + makeName(rng) + (rng() > 0.7 ? ' Family' : ''),
    pujaType: pick(rng, PUJA_TYPES),
    date: dateStr(-Math.floor(i / 20) + intBetween(rng, -15, 15)),
    amount: intBetween(rng, 251, 51_000),
    status: pick(rng, ['confirmed', 'confirmed', 'completed', 'pending', 'completed'] as const),
  }));

  // ── 10,000 COMPLAINTS (2+ years) ──
  const complaintLog: ComplaintDetail[] = Array.from({ length: 10_000 }, (_, i) => {
    const cat = pick(rng, COMPLAINT_CATEGORIES);
    const descs = COMPLAINT_DESCS[cat] ?? ['General issue reported'];
    const daysAgo = Math.floor(i / 10) + intBetween(rng, 0, 10);
    const hour = intBetween(rng, 6, 21);
    return {
      id: `CMP-${String(10_000 + i)}`,
      category: cat,
      description: pick(rng, descs),
      datetime: dateStr(-daysAgo) + 'T' + String(hour).padStart(2, '0') + ':' + String(intBetween(rng, 0, 59)).padStart(2, '0'),
      dayOfWeek: DAYS[daysAgo % 7]!,
      timeSlot: pick(rng, TIME_SLOTS),
      status: pick(rng, ['open', 'in-progress', 'resolved', 'resolved', 'resolved'] as const),
      resolution: rng() > 0.4 ? pick(rng, ['Addressed by manager', 'Escalated to trustee', 'Staff warned', 'Volunteer deployed', 'Resolved with devotee', 'Infrastructure fix applied', 'Process updated', 'Vendor notified', 'Refund processed', 'Apology issued']) : undefined,
    };
  });

  // ── 5,000 INVENTORY MOVEMENT LOGS ──
  const inventoryAlerts: InventoryAlert[] = Array.from({ length: 5_000 }, () => {
    const min = intBetween(rng, 10, 500);
    return {
      item: pick(rng, INVENTORY_ITEMS),
      current: intBetween(rng, 0, min * 2),
      minimum: min,
      unit: pick(rng, INVENTORY_UNITS),
    };
  });

  // ── 500 STAFF ──
  const staffRoster: StaffMember[] = Array.from({ length: 500 }, () => ({
    name: makeName(rng),
    role: pick(rng, STAFF_ROLES),
    shift: pick(rng, ['morning', 'afternoon', 'evening', 'full-day'] as const),
    available: rng() > 0.15,
  }));

  // ── 100 PRIESTS ──
  const priests: Priest[] = Array.from({ length: 100 }, () => ({
    name: 'Pandit ' + pick(rng, FIRST_NAMES) + ' ' + pick(rng, ['Sharma', 'Iyer', 'Bhat', 'Joshi', 'Shastri', 'Acharya', 'Dikshit', 'Trivedi', 'Dwivedi', 'Mishra']),
    specialization: pick(rng, PRIEST_SPECS),
    available: rng() > 0.2,
  }));

  // ── 200 FESTIVALS (historical + upcoming) ──
  const festNames = FESTIVALS_BY_DEITY[profile.deity] ?? ['Navratri', 'Diwali', 'Holi', 'Janmashtami', 'Maha Shivaratri'];
  const upcomingFestivals: Festival[] = Array.from({ length: 200 }, (_, i) => ({
    name: pick(rng, festNames),
    date: dateStr(-365 * 3 + i * 5 + intBetween(rng, 0, 5)),
    expectedFootfall: intBetween(rng, 5_000, 2_00_000),
    preparationStatus: pick(rng, ['on-track', 'on-track', 'needs-attention', 'critical'] as const),
  }));

  // ── 500 VIP VISITS ──
  const vipVisits: VIPVisit[] = Array.from({ length: 500 }, (_, i) => ({
    name: pick(rng, VIP_NAMES),
    designation: pick(rng, VIP_DESIGS),
    date: dateStr(-365 * 2 + i * 2 + intBetween(rng, 0, 3)),
    time: pick(rng, ['6:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM']),
    specialRequirements: pick(rng, ['Private darshan', 'Security detail required', 'CSR discussion', 'Donation ceremony', 'Media photo-op', 'Family visit (10+ members)', 'Wheelchair access', 'Discourse/speech in hall', 'Gold ornament donation', 'Foundation stone ceremony']),
  }));

  // ── COMPLAINT CATEGORIES (aggregated from log) ──
  const catCounts = new Map<string, number>();
  for (const c of complaintLog) {
    if (c.status !== 'resolved') catCounts.set(c.category, (catCounts.get(c.category) ?? 0) + 1);
  }
  const topComplaints: Complaint[] = Array.from(catCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([category, count]) => ({ category, count, status: count > 50 ? 'open' as const : 'in-progress' as const }));

  // ── RECONCILIATION ──
  const totalTxns = recentDonations.length + upcomingBookings.length;
  const reconRate = 94 + rng() * 5;
  const reconciliation: ReconciliationSummary = {
    totalTransactions: totalTxns,
    reconciledCount: Math.floor(totalTxns * reconRate / 100),
    pendingCount: intBetween(rng, 100, 500),
    mismatchCount: intBetween(rng, 10, 100),
    refundsCount: intBetween(rng, 50, 300),
    refundsMissingReason: intBetween(rng, 5, 50),
    settlementDelayedCount: intBetween(rng, 5, 40),
    manualReceiptsNeedingProof: intBetween(rng, 50, 400),
    reconciliationRate: Math.round(reconRate * 10) / 10,
  };

  // ── 36 HISTORICAL COMPARISONS (3 years monthly) ──
  const historicalComparisons: HistoricalComparison[] = [];
  const metrics = ['Donations (₹)', 'Bookings', 'Footfall', 'New Devotees', 'Complaints', 'Avg Booking Value (₹)'];
  for (let month = 0; month < 6; month++) {
    for (const metric of metrics) {
      const thisM = intBetween(rng, 10_000, 50_00_000);
      const change = -20 + rng() * 40;
      const lastM = Math.round(thisM / (1 + change / 100));
      historicalComparisons.push({ metric, thisMonth: thisM, lastMonth: lastM, changePercent: Math.round(change * 10) / 10 });
    }
  }

  // ── 50 PENDING DECISIONS ──
  const pendingDecisions: PendingDecision[] = Array.from({ length: 50 }, () => ({
    topic: pick(rng, DECISION_TOPICS),
    context: 'Operational data indicates this requires trustee attention. ' + pick(rng, [
      'Vendor quotes received.', 'Devotee feedback trending negative.', 'Budget allocation pending.',
      'Compliance deadline approaching.', 'Competitor temple has implemented this.', 'Cost-benefit analysis complete.',
      'Staff have requested this.', 'Multiple complaints related to this.', 'Safety audit flagged this.',
      'Revenue opportunity identified.', 'Festival season requires this before peak.', 'Donor has offered partial sponsorship.',
    ]),
    urgency: pick(rng, ['high', 'medium', 'medium', 'low'] as const),
    recommendedAction: pick(rng, [
      'Approve pilot program.', 'Schedule trustee review meeting.', 'Request detailed vendor proposal.',
      'Allocate budget from surplus.', 'Assign staff lead for implementation.', 'Defer to next quarter.',
      'Approve with conditions.', 'Seek competitive quotes.', 'Conduct feasibility study first.',
    ]),
  }));

  // ── MONTHLY FINANCE ──
  const monthlyDonations = recentDonations.slice(0, 1000).reduce((sum, d) => sum + d.amount, 0);
  const revenueINR = monthlyDonations + intBetween(rng, 5_00_000, 50_00_000);
  const expensesINR = Math.floor(revenueINR * (0.35 + rng() * 0.3));

  // ── AGGREGATE STATS ──
  const openComplaints = complaintLog.filter(c => c.status !== 'resolved').length;

  // ── 8,000 SEVA BOOKINGS ──
  const sevaBookings: SevaBooking[] = Array.from({ length: 8_000 }, (_, i) => ({
    id: `SEVA-${String(10_000 + i)}`,
    sevaType: pick(rng, SEVA_TYPES),
    devotee: (rng() > 0.5 ? 'Shri ' : 'Smt. ') + makeName(rng),
    date: dateStr(-Math.floor(i / 8) + intBetween(rng, -5, 5)),
    participants: intBetween(rng, 1, 20),
    amountINR: intBetween(rng, 500, 25_000),
    status: pick(rng, ['booked', 'completed', 'completed', 'cancelled'] as const),
  }));

  // ── 5,000 PRASADAM RECORDS ──
  const prasadamRecords: PrasadamRecord[] = Array.from({ length: 5_000 }, (_, i) => {
    const prepared = intBetween(rng, 100, 5000);
    const distributed = Math.min(prepared, intBetween(rng, 80, prepared));
    return {
      date: dateStr(-Math.floor(i / 5)),
      prasadamType: pick(rng, PRASADAM_TYPES),
      quantityPrepared: prepared,
      quantityDistributed: distributed,
      quantityWasted: Math.max(0, prepared - distributed - intBetween(rng, 0, 20)),
      unit: 'pcs',
      costINR: intBetween(rng, 500, 15_000),
    };
  });

  // ── 3,000 DHARAMSHALA BOOKINGS ──
  const dharamshalaBookings: DharamshalaBooking[] = Array.from({ length: 3_000 }, (_, i) => {
    const daysAgo = Math.floor(i / 3);
    return {
      bookingId: `DH-${String(5_000 + i)}`,
      guestName: (rng() > 0.5 ? 'Shri ' : 'Smt. ') + makeName(rng),
      roomType: pick(rng, ROOM_TYPES),
      roomNumber: `${pick(rng, ['A', 'B', 'C', 'D'])}${intBetween(rng, 101, 320)}`,
      checkIn: dateStr(-daysAgo),
      checkOut: dateStr(-daysAgo + intBetween(rng, 1, 5)),
      tariffINR: intBetween(rng, 200, 5_000),
      status: pick(rng, ['occupied', 'checked-out', 'checked-out', 'reserved', 'cancelled'] as const),
    };
  });

  // ── 10,000 PARKING TOKENS ──
  const parkingTokens: ParkingToken[] = Array.from({ length: 10_000 }, (_, i) => {
    const dur = intBetween(rng, 15, 480);
    return {
      tokenId: `PKG-${String(20_000 + i)}`,
      vehicleType: pick(rng, VEHICLE_TYPES),
      entryTime: dateStr(-Math.floor(i / 30)) + 'T' + String(intBetween(rng, 5, 20)).padStart(2, '0') + ':00',
      exitTime: dateStr(-Math.floor(i / 30)) + 'T' + String(intBetween(rng, 8, 22)).padStart(2, '0') + ':00',
      durationMinutes: dur,
      feeINR: intBetween(rng, 10, 200),
      lotId: pick(rng, PARKING_LOTS),
    };
  });

  // ── 2,000 HUNDI COLLECTIONS ──
  const hundiCollections: HundiCollection[] = Array.from({ length: 2_000 }, (_, i) => ({
    hundiId: `HND-${String(1_000 + i)}`,
    location: pick(rng, HUNDI_LOCATIONS),
    collectionDate: dateStr(-Math.floor(i / 2)),
    amountINR: intBetween(rng, 5_000, 5_00_000),
    collectedBy: makeName(rng),
    verifiedBy: makeName(rng),
  }));

  // ── 15,000 DARSHAN TOKENS ──
  const darshanTokens: DarshanToken[] = Array.from({ length: 15_000 }, (_, i) => {
    const wait = intBetween(rng, 5, 240);
    const hour = intBetween(rng, 5, 20);
    return {
      tokenId: `DAR-${String(30_000 + i)}`,
      tokenType: pick(rng, ['regular', 'regular', 'regular', 'vip', 'senior-citizen', 'disabled', 'online-booking'] as const),
      issueTime: dateStr(-Math.floor(i / 20)) + 'T' + String(hour).padStart(2, '0') + ':00',
      expectedDarshanTime: dateStr(-Math.floor(i / 20)) + 'T' + String(Math.min(22, hour + Math.floor(wait / 60))).padStart(2, '0') + ':00',
      actualDarshanTime: dateStr(-Math.floor(i / 20)) + 'T' + String(Math.min(22, hour + Math.floor((wait + intBetween(rng, -10, 30)) / 60))).padStart(2, '0') + ':00',
      waitMinutes: wait,
      date: dateStr(-Math.floor(i / 20)),
    };
  });

  // ── 5,000 SHOP SALES ──
  const shopSales: ShopSale[] = Array.from({ length: 5_000 }, (_, i) => {
    const item = pick(rng, SHOP_ITEMS);
    return {
      transactionId: `SHP-${String(10_000 + i)}`,
      itemName: item.name,
      category: item.cat,
      quantity: intBetween(rng, 1, 5),
      priceINR: intBetween(rng, 50, 5_000),
      paymentMode: pick(rng, ['cash', 'upi', 'card'] as const),
      date: dateStr(-Math.floor(i / 5)),
    };
  });

  // ── 1,500 AARTI SCHEDULE ──
  const aartiSchedule: AartiScheduleEntry[] = Array.from({ length: 1_500 }, (_, i) => {
    const aarti = pick(rng, AARTI_NAMES);
    const hour = aarti.includes('Mangala') ? 5 : aarti.includes('Madhyanha') ? 12 : aarti.includes('Sandhya') ? 18 : aarti.includes('Shayan') ? 21 : intBetween(rng, 6, 20);
    return {
      aartiName: aarti,
      scheduledTime: String(hour).padStart(2, '0') + ':00',
      actualStartTime: String(hour).padStart(2, '0') + ':' + String(intBetween(rng, 0, 15)).padStart(2, '0'),
      priestAssigned: 'Pandit ' + pick(rng, FIRST_NAMES) + ' ' + pick(rng, LAST_NAMES),
      attendeeEstimate: intBetween(rng, 50, 5_000),
      date: dateStr(-Math.floor(i / 6)),
    };
  });

  // ── 200 VENDOR CONTRACTS ──
  const fmt = (n: number) => '\u20B9' + n.toLocaleString('en-IN');
  const vendorContracts: VendorContract[] = Array.from({ length: 200 }, () => ({
    vendorName: pick(rng, LAST_NAMES) + ' ' + pick(rng, ['Enterprises', 'Services', 'Suppliers', 'Trading Co.', 'Industries', 'Agency']),
    vendorType: pick(rng, VENDOR_TYPES_LIST),
    contractStart: dateStr(-intBetween(rng, 30, 730)),
    contractEnd: dateStr(intBetween(rng, -30, 365)),
    ratePerUnit: fmt(intBetween(rng, 100, 50_000)) + '/month',
    paymentTerms: pick(rng, ['Monthly advance', 'Quarterly', 'On delivery', 'Net 30', 'Net 60']),
    renewalStatus: pick(rng, ['active', 'active', 'expiring-soon', 'expired', 'renewed'] as const),
    performanceRating: Math.round((3 + rng() * 2) * 10) / 10,
  }));

  // ── 500 UTILITY BILLS ──
  const utilityBills: UtilityBill[] = Array.from({ length: 500 }, (_, i) => ({
    billType: pick(rng, UTILITY_TYPES_LIST),
    billDate: dateStr(-Math.floor(i / 2) * 7),
    amountINR: intBetween(rng, 5_000, 2_00_000),
    unitConsumption: intBetween(rng, 100, 10_000),
    unit: pick(rng, ['kWh', 'KL', 'cu.m', 'GB', 'trips']),
    paymentStatus: pick(rng, ['paid', 'paid', 'pending', 'overdue'] as const),
  }));

  // ── 1,000 CCTV INCIDENTS ──
  const cctvIncidents: CCTVIncident[] = Array.from({ length: 1_000 }, (_, i) => ({
    incidentId: `CCTV-${String(1_000 + i)}`,
    incidentType: pick(rng, INCIDENT_TYPES_LIST),
    cameraId: pick(rng, CAMERA_IDS),
    datetime: dateStr(-Math.floor(i / 2)) + 'T' + String(intBetween(rng, 0, 23)).padStart(2, '0') + ':' + String(intBetween(rng, 0, 59)).padStart(2, '0'),
    severity: pick(rng, ['low', 'low', 'medium', 'high', 'critical'] as const),
    description: pick(rng, ['Unauthorized person in restricted area', 'Suspicious package near gate', 'Crowd surge detected', 'Devotee fell and injured', 'Equipment tampering detected', 'Fire alarm triggered in kitchen', 'Theft attempt at footwear stand', 'Vandalism on temple wall']),
    actionTaken: pick(rng, ['Security dispatched', 'Police notified', 'First aid provided', 'Area cordoned off', 'Under investigation', 'Resolved on site', 'Escalated to trustee', 'False alarm confirmed']),
  }));

  // ── 500 LOST & FOUND ──
  const lostAndFound: LostFoundItem[] = Array.from({ length: 500 }, (_, i) => ({
    itemId: `LF-${String(500 + i)}`,
    itemDescription: pick(rng, LOST_ITEMS),
    locationFound: pick(rng, ['Main Hall', 'South Gate', 'Parking Lot A', 'Prasad Counter', 'Queue Area', 'Restroom', 'Garden', 'Temple Shop']),
    dateFound: dateStr(-intBetween(rng, 0, 365)),
    claimedBy: rng() > 0.4 ? makeName(rng) : '',
    claimedDate: rng() > 0.4 ? dateStr(-intBetween(rng, 0, 30)) : '',
    status: pick(rng, ['unclaimed', 'claimed', 'claimed', 'disposed'] as const),
  }));

  // ── 3,000 DEVOTEE FEEDBACK ──
  const devoteeFeedback: DevoteeFeedback[] = Array.from({ length: 3_000 }, (_, i) => ({
    feedbackId: `FB-${String(3_000 + i)}`,
    date: dateStr(-Math.floor(i / 5)),
    rating: pick(rng, [1, 2, 3, 3, 4, 4, 4, 5, 5, 5]) as 1 | 2 | 3 | 4 | 5,
    feedbackType: pick(rng, ['experience', 'suggestion', 'compliment', 'complaint'] as const),
    comment: pick(rng, ['Very peaceful darshan', 'Queue was too long', 'Prasadam was delicious', 'Staff was helpful', 'Need more restrooms', 'Beautiful temple maintenance', 'Parking was a nightmare', 'Online booking was smooth', 'Aarti was mesmerizing', 'Cleanliness needs improvement', 'Loved the annadanam', 'Security was excellent']),
    category: pick(rng, FEEDBACK_CATEGORIES),
  }));

  // ── 1,000 PAYMENT MODE RECORDS ──
  const paymentModes: PaymentModeRecord[] = Array.from({ length: 1_000 }, (_, i) => ({
    date: dateStr(-Math.floor(i / 5)),
    mode: pick(rng, PAYMENT_MODES_LIST),
    transactionCount: intBetween(rng, 10, 500),
    totalAmountINR: intBetween(rng, 10_000, 10_00_000),
    processorFeesINR: intBetween(rng, 0, 5_000),
    settlementStatus: pick(rng, ['settled', 'settled', 'pending'] as const),
  }));

  // ── 4,000 DONATION RECEIPTS (80G) ──
  const donationReceipts: DonationReceipt[] = Array.from({ length: 4_000 }, (_, i) => ({
    receiptId: `RCT-${String(10_000 + i)}`,
    donorName: (rng() > 0.5 ? 'Shri ' : 'Smt. ') + makeName(rng),
    donorPAN: `${pick(rng, ['A', 'B', 'C'])}${pick(rng, ['A', 'B', 'C', 'D', 'E'])}${pick(rng, ['P', 'R', 'S', 'T'])}${pick(rng, ['P', 'K', 'M'])}${pick(rng, ['A', 'B', 'C', 'D'])}${intBetween(rng, 1000, 9999)}${pick(rng, ['A', 'B', 'C', 'D', 'E', 'F'])}`,
    amountINR: intBetween(rng, 500, 5_00_000),
    donationDate: dateStr(-Math.floor(i / 4)),
    receiptStatus: pick(rng, ['issued', 'issued', 'issued', 'pending', 'overdue', 'duplicate'] as const),
    issueDate: dateStr(-Math.floor(i / 4) + intBetween(rng, 0, 7)),
  }));

  // ── 36 MONTHS OF P&L ──
  const monthlyPnL: MonthlyPnL[] = [];
  const pnlMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let back = 35; back >= 0; back--) {
    const d = new Date('2026-04-01');
    d.setMonth(d.getMonth() - back);
    const monthLabel = `${pnlMonthNames[d.getMonth()]} ${d.getFullYear()}`;
    const growth = 1 + (35 - back) * (0.008 + rng() * 0.004);
    const seasonal = [0.9, 0.85, 1.0, 1.1, 1.05, 0.95, 1.15, 1.2, 1.1, 1.0, 1.25, 1.35][d.getMonth()] ?? 1;
    const baseRev = intBetween(rng, 40_00_000, 1_20_00_000) * growth * seasonal;
    const donations = Math.round(baseRev * (0.42 + rng() * 0.08));
    const bookings = Math.round(baseRev * (0.18 + rng() * 0.05));
    const sevas = Math.round(baseRev * (0.08 + rng() * 0.03));
    const dharamshala = Math.round(baseRev * (0.04 + rng() * 0.02));
    const parking = Math.round(baseRev * (0.02 + rng() * 0.01));
    const shop = Math.round(baseRev * (0.03 + rng() * 0.02));
    const hundi = Math.round(baseRev * (0.12 + rng() * 0.04));
    const prasadamContribution = Math.round(baseRev * (0.04 + rng() * 0.02));
    const miscellaneous = Math.round(baseRev * (0.02 + rng() * 0.02));
    const revTotal = donations + bookings + sevas + dharamshala + parking + shop + hundi + prasadamContribution + miscellaneous;

    const priestSalaries = Math.round(revTotal * (0.08 + rng() * 0.02));
    const staffSalaries = Math.round(revTotal * (0.10 + rng() * 0.03));
    const annadanamKitchen = Math.round(revTotal * (0.09 + rng() * 0.03));
    const maintenance = Math.round(revTotal * (0.05 + rng() * 0.02));
    const utilities = Math.round(revTotal * (0.04 + rng() * 0.01));
    const festivalPreparations = Math.round(revTotal * ((d.getMonth() === 9 || d.getMonth() === 10 || d.getMonth() === 8) ? 0.12 : 0.03) * (0.8 + rng() * 0.4));
    const security = Math.round(revTotal * (0.03 + rng() * 0.01));
    const cleaning = Math.round(revTotal * (0.025 + rng() * 0.01));
    const vendorPayments = Math.round(revTotal * (0.04 + rng() * 0.02));
    const administration = Math.round(revTotal * (0.03 + rng() * 0.01));
    const expTotal = priestSalaries + staffSalaries + annadanamKitchen + maintenance + utilities + festivalPreparations + security + cleaning + vendorPayments + administration;

    const netSurplus = revTotal - expTotal;
    monthlyPnL.push({
      month: monthLabel,
      revenue: { donations, bookings, sevas, dharamshala, parking, shop, hundi, prasadamContribution, miscellaneous, total: revTotal },
      expenses: { priestSalaries, staffSalaries, annadanamKitchen, maintenance, utilities, festivalPreparations, security, cleaning, vendorPayments, administration, total: expTotal },
      netSurplusINR: netSurplus,
      marginPercent: Math.round((netSurplus / revTotal) * 1000) / 10,
    });
  }

  // ── 365 DAYS OF DAILY STATS ──
  const dailyStats: DailyStats[] = [];
  const notableEvents = ['Normal operations', 'Normal operations', 'Normal operations', 'Normal operations', 'VIP visit recorded', 'Festival day — high footfall', 'Power outage — 2 hours', 'Annadanam expanded for charity', 'Corporate group booking', 'Media coverage — crowd surge', 'Senior citizen camp', 'School darshan visit'];
  for (let back = 364; back >= 0; back--) {
    const d = new Date('2026-04-14');
    d.setDate(d.getDate() - back);
    const iso = d.toISOString().split('T')[0]!;
    const dow = DAYS[(d.getDay() + 6) % 7]!;
    const weekendBoost = (d.getDay() === 0 || d.getDay() === 6) ? 1.6 : 1.0;
    const seasonalBoost = [0.9, 0.85, 1.0, 1.1, 1.05, 0.95, 1.15, 1.2, 1.1, 1.0, 1.25, 1.35][d.getMonth()] ?? 1;
    const footfall = Math.round(intBetween(rng, 3_000, 15_000) * weekendBoost * seasonalBoost);
    const donationsINR = Math.round(intBetween(rng, 1_00_000, 15_00_000) * weekendBoost * seasonalBoost);
    const bookingsCount = Math.round(intBetween(rng, 50, 400) * weekendBoost * seasonalBoost);
    dailyStats.push({
      date: iso,
      dayOfWeek: dow,
      footfall,
      donationsINR,
      bookingsCount,
      complaintsOpened: intBetween(rng, 0, 25),
      complaintsResolved: intBetween(rng, 0, 20),
      avgDarshanWaitMinutes: Math.round(intBetween(rng, 15, 120) * weekendBoost),
      prasadamServed: Math.round(footfall * (0.3 + rng() * 0.3)),
      hundiCollectionINR: intBetween(rng, 20_000, 3_00_000),
      incidentsReported: rng() > 0.85 ? intBetween(rng, 1, 4) : 0,
      notableEvent: rng() > 0.85 ? pick(rng, notableEvents) : 'Normal operations',
    });
  }

  // ── 12-MONTH FORECAST ──
  const forecasts: Forecast[] = [];
  const recentAvgRev = monthlyPnL.slice(-6).reduce((s, m) => s + m.revenue.total, 0) / 6;
  const recentAvgExp = monthlyPnL.slice(-6).reduce((s, m) => s + m.expenses.total, 0) / 6;
  const recentAvgFootfall = dailyStats.slice(-90).reduce((s, d) => s + d.footfall, 0) / 90 * 30;
  const recentAvgBookings = dailyStats.slice(-90).reduce((s, d) => s + d.bookingsCount, 0) / 90 * 30;
  const festNamesForecast = FESTIVALS_BY_DEITY[profile.deity] ?? ['Navratri', 'Diwali'];
  for (let ahead = 1; ahead <= 12; ahead++) {
    const d = new Date('2026-04-01');
    d.setMonth(d.getMonth() + ahead);
    const monthLabel = `${pnlMonthNames[d.getMonth()]} ${d.getFullYear()}`;
    const seasonal = [0.9, 0.85, 1.0, 1.1, 1.05, 0.95, 1.15, 1.2, 1.1, 1.0, 1.25, 1.35][d.getMonth()] ?? 1;
    const growth = 1 + ahead * 0.01;
    const projRev = Math.round(recentAvgRev * seasonal * growth);
    const projExp = Math.round(recentAvgExp * seasonal * (1 + ahead * 0.008));
    const festThisMonth = pick(rng, festNamesForecast);
    forecasts.push({
      month: monthLabel,
      projectedRevenueINR: projRev,
      projectedExpensesINR: projExp,
      projectedSurplusINR: projRev - projExp,
      projectedFootfall: Math.round(recentAvgFootfall * seasonal * growth),
      projectedBookings: Math.round(recentAvgBookings * seasonal * growth),
      dominantFestival: festThisMonth,
      confidence: ahead <= 3 ? 'high' : ahead <= 6 ? 'medium' : 'low',
      notes: ahead <= 3 ? 'Near-term — based on last 6 months trend' : ahead <= 6 ? 'Mid-term — includes seasonal swing' : 'Long-term — directional only, review quarterly',
    });
  }

  // ── KEY INSIGHTS (pre-computed) ──
  const lastMonth = monthlyPnL[monthlyPnL.length - 1]!;
  const prevMonth = monthlyPnL[monthlyPnL.length - 2]!;
  const yearAgo = monthlyPnL[Math.max(0, monthlyPnL.length - 13)]!;
  const lapsedCountIns = donorDirectory.filter(d => d.lapsed).length;
  const lapsedValueIns = donorDirectory.filter(d => d.lapsed).reduce((s, d) => s + d.totalDonatedINR, 0);
  const platCount = donorDirectory.filter(d => d.tier === 'platinum').length;
  const openCompIns = complaintLog.filter(c => c.status !== 'resolved').length;
  const avgWaitLast30 = Math.round(dailyStats.slice(-30).reduce((s, d) => s + d.avgDarshanWaitMinutes, 0) / 30);
  const expiringVendors = vendorContracts.filter(v => v.renewalStatus === 'expiring-soon').length;
  const criticalStock = inventoryAlerts.filter(i => i.current < i.minimum * 0.5).length;
  const momRevChange = Math.round(((lastMonth.revenue.total - prevMonth.revenue.total) / prevMonth.revenue.total) * 1000) / 10;
  const yoyRevChange = Math.round(((lastMonth.revenue.total - yearAgo.revenue.total) / yearAgo.revenue.total) * 1000) / 10;

  const keyInsights: KeyInsight[] = [
    {
      id: 'INS-001',
      category: 'revenue',
      headline: `Month-on-month revenue ${momRevChange >= 0 ? 'up' : 'down'} ${Math.abs(momRevChange)}%`,
      detail: `Last month ${fmt(lastMonth.revenue.total)} vs prior ${fmt(prevMonth.revenue.total)}.`,
      metricValue: `${momRevChange >= 0 ? '+' : ''}${momRevChange}%`,
      direction: momRevChange >= 1 ? 'up' : momRevChange <= -1 ? 'down' : 'flat',
      urgency: momRevChange < -5 ? 'high' : momRevChange < 0 ? 'medium' : 'low',
      recommendedAction: momRevChange < 0 ? 'Investigate drop: check bookings pipeline and donor reactivation.' : 'Maintain momentum; double down on top-performing revenue stream.',
    },
    {
      id: 'INS-002',
      category: 'revenue',
      headline: `Year-on-year revenue ${yoyRevChange >= 0 ? 'up' : 'down'} ${Math.abs(yoyRevChange)}%`,
      detail: `This month ${fmt(lastMonth.revenue.total)} vs same month last year ${fmt(yearAgo.revenue.total)}.`,
      metricValue: `${yoyRevChange >= 0 ? '+' : ''}${yoyRevChange}%`,
      direction: yoyRevChange >= 1 ? 'up' : yoyRevChange <= -1 ? 'down' : 'flat',
      urgency: yoyRevChange < -10 ? 'high' : 'low',
      recommendedAction: 'Review strategic drivers behind YoY shift in trustee meeting.',
    },
    {
      id: 'INS-003',
      category: 'devotee',
      headline: `${lapsedCountIns.toLocaleString('en-IN')} lapsed donors holding ${fmt(lapsedValueIns)} dormant value`,
      detail: `${platCount} platinum donors at risk if lapsed. Reactivation campaign could recover 10-20% of dormant value.`,
      metricValue: fmt(lapsedValueIns),
      direction: 'down',
      urgency: 'high',
      recommendedAction: 'Launch personalized reactivation journey for top 50 lapsed platinum/gold donors.',
    },
    {
      id: 'INS-004',
      category: 'cost',
      headline: `Top expense category: ${lastMonth.expenses.annadanamKitchen > lastMonth.expenses.staffSalaries ? 'Annadanam Kitchen' : 'Staff Salaries'}`,
      detail: `Annadanam ${fmt(lastMonth.expenses.annadanamKitchen)} (${Math.round(lastMonth.expenses.annadanamKitchen / lastMonth.expenses.total * 100)}%), Staff ${fmt(lastMonth.expenses.staffSalaries)} (${Math.round(lastMonth.expenses.staffSalaries / lastMonth.expenses.total * 100)}%).`,
      metricValue: fmt(Math.max(lastMonth.expenses.annadanamKitchen, lastMonth.expenses.staffSalaries)),
      direction: 'flat',
      urgency: 'medium',
      recommendedAction: 'Review vendor rates on prasadam ingredients and prasadam wastage — ~15% prep-to-distribution gap is visible in data.',
    },
    {
      id: 'INS-005',
      category: 'operations',
      headline: `Avg darshan wait last 30 days: ${avgWaitLast30} min`,
      detail: `Weekend peaks push wait above 90 min on multiple days. Darshan token batching could cut it by 20-30%.`,
      metricValue: `${avgWaitLast30} min`,
      direction: avgWaitLast30 > 60 ? 'up' : 'flat',
      urgency: avgWaitLast30 > 90 ? 'high' : avgWaitLast30 > 60 ? 'medium' : 'low',
      recommendedAction: 'Pilot slot-based token system for Saturday 5-8 PM window.',
    },
    {
      id: 'INS-006',
      category: 'risk',
      headline: `${openCompIns.toLocaleString('en-IN')} active complaints unresolved`,
      detail: `Top categories: ${topComplaints.slice(0, 3).map(t => t.category).join(', ')}. Oldest complaints > 30 days old.`,
      metricValue: openCompIns.toString(),
      direction: 'up',
      urgency: openCompIns > 500 ? 'high' : 'medium',
      recommendedAction: 'Assign complaint-clearing sprint; target 80% resolution in 2 weeks.',
    },
    {
      id: 'INS-007',
      category: 'risk',
      headline: `${expiringVendors} vendor contracts expiring within 30 days`,
      detail: 'Unrenewed contracts at risk: flowers, cleaning, prasadam ingredients.',
      metricValue: expiringVendors.toString(),
      direction: 'flat',
      urgency: expiringVendors > 10 ? 'high' : 'medium',
      recommendedAction: 'Trigger vendor renewal workflow; get 3 competitive quotes per category.',
    },
    {
      id: 'INS-008',
      category: 'risk',
      headline: `${criticalStock} inventory items at critical low`,
      detail: 'Items below 50% of minimum threshold — stockout risk during next festival.',
      metricValue: criticalStock.toString(),
      direction: 'down',
      urgency: criticalStock > 100 ? 'high' : criticalStock > 30 ? 'medium' : 'low',
      recommendedAction: 'Raise emergency PO for camphor, ghee, marigold garlands before festival week.',
    },
    {
      id: 'INS-009',
      category: 'opportunity',
      headline: `Next festival projected footfall: ${upcomingFestivals.filter(f => new Date(f.date) > new Date('2026-04-14')).slice(0, 1).map(f => f.expectedFootfall.toLocaleString('en-IN')).join('') || 'TBD'}`,
      detail: 'Premium puja packages + targeted platinum-tier outreach could lift per-devotee revenue by 15-20%.',
      metricValue: 'Festival',
      direction: 'up',
      urgency: 'medium',
      recommendedAction: 'Pre-launch premium festival booking pack 4 weeks ahead; open VIP darshan slots.',
    },
    {
      id: 'INS-010',
      category: 'opportunity',
      headline: `Forecast next 3 months: ${fmt(forecasts.slice(0, 3).reduce((s, f) => s + f.projectedSurplusINR, 0))} cumulative surplus`,
      detail: `Based on trailing 6-month average, seasonal swing, and ${((35 - 0) * 1.0).toFixed(1)}% trailing growth.`,
      metricValue: fmt(forecasts.slice(0, 3).reduce((s, f) => s + f.projectedSurplusINR, 0)),
      direction: 'up',
      urgency: 'low',
      recommendedAction: 'Earmark 20% of projected surplus for capex: parking expansion and digital kiosks.',
    },
  ];

  return {
    ...profile,
    stats: {
      devoteeCount: donorDirectory.length + intBetween(rng, 50_000, 5_00_000),
      monthlyDonationsINR: monthlyDonations,
      monthlyBookingsCount: intBetween(rng, 500, 10_000),
      activeComplaints: openComplaints,
      priestsCount: priests.length,
      staffCount: staffRoster.length,
      dailyFootfall: intBetween(rng, 5_000, 1_00_000),
    },
    recentDonations,
    upcomingBookings,
    upcomingFestivals,
    topComplaints,
    inventoryAlerts,
    priests,
    monthlyFinance: {
      revenueINR,
      expensesINR,
      netSurplusINR: revenueINR - expensesINR,
      topExpenseCategory: pick(rng, ['Priest Salaries', 'Annadanam', 'Maintenance', 'Festival Preparations', 'Utilities', 'Security', 'Cleaning Services']),
    },
    donorDirectory,
    complaintLog,
    staffRoster,
    vipVisits,
    reconciliation,
    historicalComparisons,
    pendingDecisions,
    sevaBookings,
    prasadamRecords,
    dharamshalaBookings,
    parkingTokens,
    hundiCollections,
    darshanTokens,
    shopSales,
    aartiSchedule,
    vendorContracts,
    utilityBills,
    cctvIncidents,
    lostAndFound,
    devoteeFeedback,
    paymentModes,
    donationReceipts,
    monthlyPnL,
    dailyStats,
    forecasts,
    keyInsights,
    connector: {
      type: 'mock',
      credentials: {},
      lastSyncedAt: new Date().toISOString(),
      lastSyncStatus: 'success',
    },
  };
}

// Row count summary per temple
export function getRowCounts(temple: Temple): Record<string, number> {
  return {
    'Donation Transactions': temple.recentDonations.length,
    'Donor Directory': temple.donorDirectory.length,
    'Booking History': temple.upcomingBookings.length,
    'Complaint Log': temple.complaintLog.length,
    'Inventory Log': temple.inventoryAlerts.length,
    'Staff Roster': temple.staffRoster.length,
    'Priests': temple.priests.length,
    'Festival History': temple.upcomingFestivals.length,
    'VIP Visits': temple.vipVisits.length,
    'Historical Comparisons': temple.historicalComparisons.length,
    'Pending Decisions': temple.pendingDecisions.length,
    'Complaint Categories': temple.topComplaints.length,
    'Seva Bookings': temple.sevaBookings.length,
    'Prasadam Records': temple.prasadamRecords.length,
    'Dharamshala Bookings': temple.dharamshalaBookings.length,
    'Parking Tokens': temple.parkingTokens.length,
    'Hundi Collections': temple.hundiCollections.length,
    'Darshan Tokens': temple.darshanTokens.length,
    'Shop Sales': temple.shopSales.length,
    'Aarti Schedule': temple.aartiSchedule.length,
    'Vendor Contracts': temple.vendorContracts.length,
    'Utility Bills': temple.utilityBills.length,
    'CCTV Incidents': temple.cctvIncidents.length,
    'Lost & Found': temple.lostAndFound.length,
    'Devotee Feedback': temple.devoteeFeedback.length,
    'Payment Modes': temple.paymentModes.length,
    'Donation Receipts': temple.donationReceipts.length,
    'Monthly P&L': temple.monthlyPnL.length,
    'Daily Stats': temple.dailyStats.length,
    'Forecasts': temple.forecasts.length,
    'Key Insights': temple.keyInsights.length,
    'Reconciliation': 1,
    'Monthly Finance': 1,
    'Stats': 1,
    'Profile': 1,
    'TOTAL': temple.recentDonations.length + temple.donorDirectory.length + temple.upcomingBookings.length + temple.complaintLog.length + temple.inventoryAlerts.length + temple.staffRoster.length + temple.priests.length + temple.upcomingFestivals.length + temple.vipVisits.length + temple.historicalComparisons.length + temple.pendingDecisions.length + temple.topComplaints.length + temple.sevaBookings.length + temple.prasadamRecords.length + temple.dharamshalaBookings.length + temple.parkingTokens.length + temple.hundiCollections.length + temple.darshanTokens.length + temple.shopSales.length + temple.aartiSchedule.length + temple.vendorContracts.length + temple.utilityBills.length + temple.cctvIncidents.length + temple.lostAndFound.length + temple.devoteeFeedback.length + temple.paymentModes.length + temple.donationReceipts.length + temple.monthlyPnL.length + temple.dailyStats.length + temple.forecasts.length + temple.keyInsights.length + 4,
  };
}
