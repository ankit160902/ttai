// Default temple profile + deterministic operational-data generator.
//
// In single-tenant mode this file provides:
//   1. The default profile used the very first time the app boots
//      (Shri Siddhivinayak Mandir as a placeholder the trustee can edit)
//   2. generateTempleData(profile) — used by the MockConnector to produce
//      a realistic operational dataset from any temple profile.

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
} from './temple-types';

export const DEFAULT_TEMPLE_PROFILE: TempleProfile = {
  id: 'temple',
  name: 'Shri Siddhivinayak Mandir',
  deity: 'Lord Ganesha',
  city: 'Mumbai',
  state: 'Maharashtra',
  founded: 1801,
  languages: ['Marathi', 'Hindi', 'English'],
  description:
    'One of the most well-known Ganesha temples in Mumbai, frequented by devotees from across India.',
  trustChairman: 'Adv. Aadesh Bandekar',
  onboardedAt: new Date('2026-01-01').toISOString(),
};

const INDIAN_NAMES = [
  'Ramesh Sharma', 'Priya Patel', 'Suresh Iyer', 'Kavita Reddy', 'Anil Kumar',
  'Sunita Joshi', 'Vikram Singh', 'Meera Nair', 'Rajesh Gupta', 'Anjali Desai',
  'Manoj Tiwari', 'Lakshmi Krishnan', 'Deepak Verma', 'Pooja Agarwal', 'Sandeep Rao',
  'Geeta Mehta', 'Arvind Pillai', 'Nisha Kapoor', 'Harish Bhat', 'Shobha Menon',
  'Mukesh Shah', 'Asha Bose', 'Vinod Chopra', 'Rekha Saxena', 'Dinesh Panicker',
  'Smita Joshi', 'Pradeep Naik', 'Usha Rao', 'Kishore Kumar', 'Mala Subramanian',
];

const PUJA_TYPES = [
  'Abhishekam', 'Archana', 'Sahasranama Archana', 'Ganapati Homam', 'Navagraha Shanti',
  'Rudra Abhishekam', 'Lakshmi Kubera Homam', 'Satyanarayana Puja', 'Maha Mrityunjaya Japa',
  'Chandi Homam', 'Sudarshana Homam', 'Annaprashan', 'Namakaranam', 'Vivaha',
];

const FESTIVALS_BY_DEITY: Record<string, string[]> = {
  Ganesha: ['Ganesh Chaturthi', 'Ganesh Jayanti', 'Sankashti Chaturthi', 'Diwali', 'New Year Puja'],
  Shiva: ['Maha Shivaratri', 'Shravan Somvar', 'Pradosham', 'Kartik Purnima', 'Diwali'],
  Vishnu: ['Vaikuntha Ekadashi', 'Rama Navami', 'Janmashtami', 'Diwali', 'Akshaya Tritiya'],
  Krishna: ['Janmashtami', 'Radha Ashtami', 'Govardhan Puja', 'Holi', 'Annakut'],
  Venkateswara: ['Brahmotsavam', 'Vaikuntha Ekadashi', 'Rama Navami', 'Diwali', 'Pongal'],
  Hanuman: ['Hanuman Jayanti', 'Diwali', 'Rama Navami', 'Tuesday Special Aarti', 'Sundarkand Path'],
  Ayyappa: ['Mandala Puja', 'Makaravilakku', 'Onam', 'Vishu', 'Maha Shivaratri'],
  Surya: ['Ratha Saptami', 'Chhath Puja', 'Makar Sankranti', 'Magha Saptami', 'Surya Jayanti'],
  Rama: ['Rama Navami', 'Vijayadashami', 'Diwali', 'Hanuman Jayanti', 'Akshaya Tritiya'],
  Lakshmi: ['Lakshmi Puja', 'Diwali', 'Varalakshmi Vratam', 'Akshaya Tritiya', 'Dhanteras'],
};

const DEFAULT_FESTIVALS = ['Navratri', 'Diwali', 'Holi', 'Janmashtami', 'Maha Shivaratri'];

function getFestivalsForDeity(deity: string): string[] {
  for (const key of Object.keys(FESTIVALS_BY_DEITY)) {
    if (deity.includes(key)) return FESTIVALS_BY_DEITY[key]!;
  }
  return DEFAULT_FESTIVALS;
}

// Deterministic seeded PRNG (mulberry32). Same profile in → same data out,
// so refreshes don't shuffle the numbers around if the source is unchanged.
function makeRng(seed: number) {
  return function rng() {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

function intBetween(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function seedFromString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function dateFromOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0]!;
}

/**
 * Produce a realistic Temple object from a profile. Used by MockConnector,
 * and by the single-temple store on first boot.
 */
export function generateTempleData(profile: TempleProfile): Temple {
  const rng = makeRng(seedFromString(profile.name + profile.deity));

  const recentDonations: Donation[] = Array.from({ length: 8 }, (_, i) => ({
    donor: pick(rng, INDIAN_NAMES),
    amount: intBetween(rng, 501, 1_00_000),
    date: dateFromOffset(-i - 1),
    purpose: pick(rng, ['General Donation', 'Annadanam', 'Aarti Sponsorship', 'Festival Fund', 'Temple Maintenance', 'Priest Dakshina']),
  }));

  const upcomingBookings: Booking[] = Array.from({ length: 8 }, (_, i) => ({
    devotee: pick(rng, INDIAN_NAMES),
    pujaType: pick(rng, PUJA_TYPES),
    date: dateFromOffset(i + 1),
    amount: intBetween(rng, 501, 25_000),
    status: pick(rng, ['confirmed', 'pending', 'confirmed'] as const),
  }));

  const festivalNames = getFestivalsForDeity(profile.deity);
  const upcomingFestivals: Festival[] = festivalNames.slice(0, 4).map((name, i) => ({
    name,
    date: dateFromOffset(intBetween(rng, 7, 90) + i * 15),
    expectedFootfall: intBetween(rng, 1000, 100_000),
    preparationStatus: pick(rng, ['on-track', 'on-track', 'needs-attention', 'critical'] as const),
  }));

  const topComplaints: Complaint[] = [
    { category: 'Long Darshan Queue', count: intBetween(rng, 0, 12), status: pick(rng, ['open', 'in-progress'] as const) },
    { category: 'Cleanliness in Prasad Counter', count: intBetween(rng, 0, 8), status: pick(rng, ['open', 'resolved'] as const) },
    { category: 'Footwear Stand Issues', count: intBetween(rng, 0, 6), status: pick(rng, ['in-progress', 'resolved'] as const) },
    { category: 'Donation Receipt Delay', count: intBetween(rng, 0, 5), status: pick(rng, ['open', 'in-progress'] as const) },
  ].filter((c) => c.count > 0);

  const inventoryAlerts: InventoryAlert[] = [
    { item: 'Camphor', current: intBetween(rng, 0, 5), minimum: 10, unit: 'kg' },
    { item: 'Ghee', current: intBetween(rng, 0, 8), minimum: 15, unit: 'L' },
    { item: 'Coconut', current: intBetween(rng, 50, 200), minimum: 100, unit: 'pcs' },
    { item: 'Marigold Garlands', current: intBetween(rng, 10, 80), minimum: 50, unit: 'pcs' },
    { item: 'Incense Sticks', current: intBetween(rng, 5, 30), minimum: 20, unit: 'boxes' },
  ].filter((i) => i.current < i.minimum);

  const priests: Priest[] = Array.from({ length: 5 }, () => ({
    name: 'Pandit ' + pick(rng, ['Ramesh', 'Suresh', 'Krishna', 'Vishnu', 'Govind', 'Madhav', 'Narayan', 'Anant']) + ' ' + pick(rng, ['Sharma', 'Iyer', 'Bhat', 'Joshi', 'Shastri', 'Acharya']),
    specialization: pick(rng, ['Rudra Abhishekam', 'Vivaha Samskara', 'Vastu Shanti', 'Navagraha Puja', 'Satyanarayana Katha', 'Veda Parayana']),
    available: rng() > 0.3,
  }));

  const monthlyDonationsINR = intBetween(rng, 5_00_000, 5_00_00_000);
  const revenueINR = monthlyDonationsINR + intBetween(rng, 1_00_000, 20_00_000);
  const expensesINR = Math.floor(revenueINR * (0.4 + rng() * 0.3));

  // ── TA-02: Donor directory (30 donors with history) ──
  const CITIES = ['Mumbai', 'Pune', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Ahmedabad', 'Kolkata', 'Jaipur', 'Nashik', 'Thane', 'Nagpur'];
  const donorDirectory: DonorRecord[] = Array.from({ length: 30 }, () => {
    const total = intBetween(rng, 1_000, 5_00_000);
    const count = intBetween(rng, 1, 24);
    const daysSinceLast = intBetween(rng, 1, 180);
    return {
      name: pick(rng, INDIAN_NAMES),
      totalDonatedINR: total,
      donationCount: count,
      lastDonationDate: dateFromOffset(-daysSinceLast),
      firstDonationDate: dateFromOffset(-intBetween(rng, 180, 730)),
      city: pick(rng, CITIES),
      tier: total >= 2_00_000 ? 'platinum' as const : total >= 50_000 ? 'gold' as const : total >= 10_000 ? 'silver' as const : 'regular' as const,
      lapsed: daysSinceLast > 90,
    };
  }).sort((a, b) => b.totalDonatedINR - a.totalDonatedINR);

  // ── TA-05: Individual complaint log (20 complaints) ──
  const COMPLAINT_CATS = [
    { cat: 'Long Darshan Queue', descs: ['Wait exceeded 2 hours during peak', 'Queue management absent at gate 3', 'Senior citizens struggled in long queue', 'No shade provided in queue area'] },
    { cat: 'Cleanliness', descs: ['Prasad counter area was dirty', 'Restrooms not cleaned since morning', 'Garbage overflow near south entrance', 'Flower waste piled near sanctum'] },
    { cat: 'Donation Receipt Delay', descs: ['Receipt not received after online donation', '80G receipt delayed by 2 weeks', 'Counter staff could not print receipt', 'Duplicate receipt issued'] },
    { cat: 'Parking', descs: ['No parking available after 9 AM', 'Parking attendant misbehaved', 'Two-wheeler parking blocked', 'VIP parking misused by staff'] },
    { cat: 'Crowding', descs: ['Overcrowding during aarti time', 'No crowd control at evening slot', 'Children separated from parents in rush', 'Stampede-like situation near main hall'] },
    { cat: 'Noise', descs: ['Loudspeaker volume excessive', 'Construction noise during darshan', 'Vendors creating disturbance at entrance'] },
  ];
  const TIME_SLOTS = ['6 AM – 9 AM', '9 AM – 12 PM', '12 PM – 3 PM', '3 PM – 6 PM', '6 PM – 9 PM'];
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const complaintLog: ComplaintDetail[] = Array.from({ length: 20 }, (_, i) => {
    const catObj = pick(rng, COMPLAINT_CATS);
    const daysAgo = intBetween(rng, 0, 30);
    return {
      id: `CMP-${String(1000 + i)}`,
      category: catObj.cat,
      description: pick(rng, catObj.descs),
      datetime: dateFromOffset(-daysAgo) + 'T' + String(intBetween(rng, 6, 21)).padStart(2, '0') + ':00',
      dayOfWeek: DAYS[daysAgo % 7]!,
      timeSlot: pick(rng, TIME_SLOTS),
      status: pick(rng, ['open', 'open', 'in-progress', 'resolved', 'resolved'] as const),
      resolution: rng() > 0.5 ? pick(rng, ['Addressed by queue manager', 'Escalated to trustee', 'Staff warned', 'Extra volunteer deployed', 'Resolved with devotee']) : undefined,
    };
  });

  // ── TA-01/TA-06: Staff roster (15 staff) ──
  const STAFF_ROLES = ['Queue Manager', 'Security Guard', 'Prasad Counter', 'Ticket Counter', 'Cleaning Staff', 'Help Desk', 'Parking Attendant', 'Flower Garland Counter', 'CCTV Operator', 'First Aid', 'Volunteer Coordinator', 'Kitchen Staff', 'Electrician', 'Sound Operator', 'Gate Manager'];
  const staffRoster: StaffMember[] = STAFF_ROLES.map((role) => ({
    name: pick(rng, INDIAN_NAMES),
    role,
    shift: pick(rng, ['morning', 'afternoon', 'evening', 'full-day'] as const),
    available: rng() > 0.15,
  }));

  // ── TA-01: VIP visits (3 upcoming) ──
  const vipVisits: VIPVisit[] = [
    { name: pick(rng, ['Shri Raj Thackeray', 'Smt. Smita Deshmukh', 'Shri Nitin Gadkari', 'Dr. Mohan Bhagwat', 'Shri Amitabh Bachchan']), designation: pick(rng, ['MLA', 'MP', 'Mayor', 'Spiritual Leader', 'Business Leader']), date: dateFromOffset(intBetween(rng, 1, 5)), time: pick(rng, ['9:00 AM', '11:00 AM', '4:00 PM']), specialRequirements: pick(rng, ['Private darshan requested', 'Security detail of 4', 'Wheelchair access needed', 'Photo-op with trustees']) },
    { name: pick(rng, ['Smt. Rekha Jain', 'Shri Ajay Piramal', 'Dr. Pratap Reddy', 'Shri Ratan Tata Foundation Rep']), designation: pick(rng, ['Industrialist', 'Philanthropist', 'Board Member', 'Foundation Trustee']), date: dateFromOffset(intBetween(rng, 6, 10)), time: pick(rng, ['10:00 AM', '3:00 PM', '5:30 PM']), specialRequirements: pick(rng, ['Wants to discuss CSR partnership', 'Annadanam sponsorship discussion', 'Donation of gold ornaments', 'Temple tour for family of 12']) },
    { name: pick(rng, ['Swami Chidananda Saraswati', 'Sri Sri Ravi Shankar', 'Sadhguru Jaggi Vasudev']), designation: 'Spiritual Leader', date: dateFromOffset(intBetween(rng, 3, 14)), time: '6:00 AM', specialRequirements: pick(rng, ['Early morning special puja', 'Private meditation in sanctum', 'Discourse in temple hall for devotees']) },
  ];

  // ── TA-03: Reconciliation summary ──
  const totalTxns = intBetween(rng, 2000, 8000);
  const reconRate = 95 + rng() * 4.5; // 95–99.5%
  const reconciledCount = Math.floor(totalTxns * reconRate / 100);
  const reconciliation: ReconciliationSummary = {
    totalTransactions: totalTxns,
    reconciledCount,
    pendingCount: intBetween(rng, 10, 60),
    mismatchCount: intBetween(rng, 2, 15),
    refundsCount: intBetween(rng, 5, 30),
    refundsMissingReason: intBetween(rng, 1, 10),
    settlementDelayedCount: intBetween(rng, 0, 8),
    manualReceiptsNeedingProof: intBetween(rng, 10, 60),
    reconciliationRate: Math.round(reconRate * 10) / 10,
  };

  // ── TA-04: Historical comparisons (month-on-month) ──
  function trend(thisM: number): { thisMonth: number; lastMonth: number; changePercent: number } {
    const change = -15 + rng() * 35; // -15% to +20%
    const lastM = Math.round(thisM / (1 + change / 100));
    return { thisMonth: thisM, lastMonth: lastM, changePercent: Math.round(change * 10) / 10 };
  }
  const mDonations = monthlyDonationsINR;
  const mBookings = intBetween(rng, 100, 5000);
  const mFootfall = intBetween(rng, 15_000, 500_000);
  const historicalComparisons: HistoricalComparison[] = [
    { metric: 'Donations (₹)', ...trend(mDonations) },
    { metric: 'Bookings', ...trend(mBookings) },
    { metric: 'Footfall', ...trend(mFootfall) },
    { metric: 'New Devotees', ...trend(intBetween(rng, 50, 2000)) },
    { metric: 'Complaints', ...trend(intBetween(rng, 5, 40)) },
    { metric: 'Avg Booking Value (₹)', ...trend(intBetween(rng, 500, 5000)) },
  ];

  // ── TA-04: Pending trustee decisions ──
  const pendingDecisions: PendingDecision[] = [
    { topic: 'Queue Management System Upgrade', context: 'Saturday queue times have exceeded 2 hours consistently. Vendor has proposed a digital token system at ₹4.5 lakh.', urgency: 'high', recommendedAction: 'Approve pilot for 2 Saturdays before full deployment.' },
    { topic: 'Digital Prasad Delivery Expansion', context: 'Online devotees requesting prasad delivery has grown 40% MoM. Current manual process cannot scale.', urgency: 'medium', recommendedAction: 'Partner with a logistics provider for same-city delivery; add ₹150 delivery charge.' },
    { topic: 'Annual Vendor Contract Renewal', context: 'Flower vendor contract expires in 3 weeks. Current vendor has increased rates by 18%. Alternative vendor quoted 8% lower.', urgency: 'high', recommendedAction: 'Negotiate with current vendor using alternative quote as leverage; switch if no concession.' },
    { topic: 'Volunteer Recruitment Drive', context: 'Festival season starts in 6 weeks. Current volunteer strength is 60% of requirement for peak days.', urgency: 'medium', recommendedAction: 'Launch WhatsApp campaign to devotee database; target 50 new volunteers in 3 weeks.' },
  ];

  const devoteeCount = intBetween(rng, 5_000, 200_000);
  const monthlyBookingsCount = intBetween(rng, 100, 5000);
  const activeComplaints = complaintLog.filter((c) => c.status !== 'resolved').length;

  return {
    ...profile,
    stats: {
      devoteeCount,
      monthlyDonationsINR,
      monthlyBookingsCount,
      activeComplaints,
      priestsCount: intBetween(rng, 5, 40),
      staffCount: staffRoster.length,
      dailyFootfall: intBetween(rng, 500, 50_000),
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
      topExpenseCategory: pick(rng, ['Priest Salaries', 'Annadanam', 'Maintenance', 'Festival Preparations', 'Utilities']),
    },
    donorDirectory,
    complaintLog,
    staffRoster,
    vipVisits,
    reconciliation,
    historicalComparisons,
    pendingDecisions,
    sevaBookings: [],
    prasadamRecords: [],
    dharamshalaBookings: [],
    parkingTokens: [],
    hundiCollections: [],
    darshanTokens: [],
    shopSales: [],
    aartiSchedule: [],
    vendorContracts: [],
    utilityBills: [],
    cctvIncidents: [],
    lostAndFound: [],
    devoteeFeedback: [],
    paymentModes: [],
    donationReceipts: [],
  };
}
