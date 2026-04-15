// Temple data types — single tenant.

import type { ConnectorConfig } from './connectors/types';

export interface Donation {
  donor: string;
  amount: number;
  date: string;
  purpose: string;
}

export interface Booking {
  devotee: string;
  pujaType: string;
  date: string;
  amount: number;
  status: 'confirmed' | 'pending' | 'completed';
}

export interface Festival {
  name: string;
  date: string;
  expectedFootfall: number;
  preparationStatus: 'on-track' | 'needs-attention' | 'critical';
}

export interface Complaint {
  category: string;
  count: number;
  status: 'open' | 'in-progress' | 'resolved';
}

export interface InventoryAlert {
  item: string;
  current: number;
  minimum: number;
  unit: string;
}

export interface Priest {
  name: string;
  specialization: string;
  available: boolean;
}

export interface TempleProfile {
  id: string;
  name: string;
  deity: string;
  city: string;
  state: string;
  founded: number;
  languages: string[];
  description: string;
  trustChairman: string;
  onboardedAt: string;
}

export interface TempleStats {
  devoteeCount: number;
  monthlyDonationsINR: number;
  monthlyBookingsCount: number;
  activeComplaints: number;
  priestsCount: number;
  staffCount: number;
  dailyFootfall: number;
}

export interface MonthlyFinance {
  revenueINR: number;
  expensesINR: number;
  netSurplusINR: number;
  topExpenseCategory: string;
}

export interface Temple extends TempleProfile {
  stats: TempleStats;
  recentDonations: Donation[];
  upcomingBookings: Booking[];
  upcomingFestivals: Festival[];
  topComplaints: Complaint[];
  inventoryAlerts: InventoryAlert[];
  priests: Priest[];
  monthlyFinance: MonthlyFinance;
  donorDirectory: DonorRecord[];
  complaintLog: ComplaintDetail[];
  staffRoster: StaffMember[];
  vipVisits: VIPVisit[];
  reconciliation: ReconciliationSummary;
  historicalComparisons: HistoricalComparison[];
  pendingDecisions: PendingDecision[];
  sevaBookings: SevaBooking[];
  prasadamRecords: PrasadamRecord[];
  dharamshalaBookings: DharamshalaBooking[];
  parkingTokens: ParkingToken[];
  hundiCollections: HundiCollection[];
  darshanTokens: DarshanToken[];
  shopSales: ShopSale[];
  aartiSchedule: AartiScheduleEntry[];
  vendorContracts: VendorContract[];
  utilityBills: UtilityBill[];
  cctvIncidents: CCTVIncident[];
  lostAndFound: LostFoundItem[];
  devoteeFeedback: DevoteeFeedback[];
  paymentModes: PaymentModeRecord[];
  donationReceipts: DonationReceipt[];
  monthlyPnL: MonthlyPnL[];
  dailyStats: DailyStats[];
  forecasts: Forecast[];
  keyInsights: KeyInsight[];
  connector?: ConnectorConfig;
}

export interface DonorRecord {
  name: string;
  totalDonatedINR: number;
  donationCount: number;
  lastDonationDate: string;
  firstDonationDate: string;
  city: string;
  tier: 'platinum' | 'gold' | 'silver' | 'regular';
  lapsed: boolean;
}

export interface ComplaintDetail {
  id: string;
  category: string;
  description: string;
  datetime: string;
  dayOfWeek: string;
  timeSlot: string;
  status: 'open' | 'in-progress' | 'resolved';
  resolution?: string;
}

export interface StaffMember {
  name: string;
  role: string;
  shift: 'morning' | 'afternoon' | 'evening' | 'full-day';
  available: boolean;
}

export interface VIPVisit {
  name: string;
  designation: string;
  date: string;
  time: string;
  specialRequirements: string;
}

export interface ReconciliationSummary {
  totalTransactions: number;
  reconciledCount: number;
  pendingCount: number;
  mismatchCount: number;
  refundsCount: number;
  refundsMissingReason: number;
  settlementDelayedCount: number;
  manualReceiptsNeedingProof: number;
  reconciliationRate: number;
}

export interface HistoricalComparison {
  metric: string;
  thisMonth: number;
  lastMonth: number;
  changePercent: number;
}

export interface PendingDecision {
  topic: string;
  context: string;
  urgency: 'high' | 'medium' | 'low';
  recommendedAction: string;
}

// ─── NEW TEMPLE DATA CATEGORIES ────────────────────────────

export interface SevaBooking {
  id: string;
  sevaType: string;
  devotee: string;
  date: string;
  participants: number;
  amountINR: number;
  status: 'booked' | 'completed' | 'cancelled';
}

export interface PrasadamRecord {
  date: string;
  prasadamType: string;
  quantityPrepared: number;
  quantityDistributed: number;
  quantityWasted: number;
  unit: string;
  costINR: number;
}

export interface DharamshalaBooking {
  bookingId: string;
  guestName: string;
  roomType: 'single' | 'double' | 'family' | 'dormitory' | 'vip-suite';
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  tariffINR: number;
  status: 'occupied' | 'checked-out' | 'reserved' | 'cancelled';
}

export interface ParkingToken {
  tokenId: string;
  vehicleType: 'two-wheeler' | 'four-wheeler' | 'auto' | 'bus' | 'bicycle';
  entryTime: string;
  exitTime: string;
  durationMinutes: number;
  feeINR: number;
  lotId: string;
}

export interface HundiCollection {
  hundiId: string;
  location: string;
  collectionDate: string;
  amountINR: number;
  collectedBy: string;
  verifiedBy: string;
}

export interface DarshanToken {
  tokenId: string;
  tokenType: 'regular' | 'vip' | 'senior-citizen' | 'disabled' | 'online-booking';
  issueTime: string;
  expectedDarshanTime: string;
  actualDarshanTime: string;
  waitMinutes: number;
  date: string;
}

export interface ShopSale {
  transactionId: string;
  itemName: string;
  category: string;
  quantity: number;
  priceINR: number;
  paymentMode: 'cash' | 'upi' | 'card';
  date: string;
}

export interface AartiScheduleEntry {
  aartiName: string;
  scheduledTime: string;
  actualStartTime: string;
  priestAssigned: string;
  attendeeEstimate: number;
  date: string;
}

export interface VendorContract {
  vendorName: string;
  vendorType: string;
  contractStart: string;
  contractEnd: string;
  ratePerUnit: string;
  paymentTerms: string;
  renewalStatus: 'active' | 'expiring-soon' | 'expired' | 'renewed';
  performanceRating: number;
}

export interface UtilityBill {
  billType: string;
  billDate: string;
  amountINR: number;
  unitConsumption: number;
  unit: string;
  paymentStatus: 'paid' | 'pending' | 'overdue';
}

export interface CCTVIncident {
  incidentId: string;
  incidentType: string;
  cameraId: string;
  datetime: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  actionTaken: string;
}

export interface LostFoundItem {
  itemId: string;
  itemDescription: string;
  locationFound: string;
  dateFound: string;
  claimedBy: string;
  claimedDate: string;
  status: 'unclaimed' | 'claimed' | 'disposed';
}

export interface DevoteeFeedback {
  feedbackId: string;
  date: string;
  rating: 1 | 2 | 3 | 4 | 5;
  feedbackType: 'experience' | 'suggestion' | 'compliment' | 'complaint';
  comment: string;
  category: string;
}

export interface PaymentModeRecord {
  date: string;
  mode: 'cash' | 'upi' | 'credit-card' | 'bank-transfer' | 'cheque';
  transactionCount: number;
  totalAmountINR: number;
  processorFeesINR: number;
  settlementStatus: 'settled' | 'pending';
}

export interface DonationReceipt {
  receiptId: string;
  donorName: string;
  donorPAN: string;
  amountINR: number;
  donationDate: string;
  receiptStatus: 'issued' | 'pending' | 'overdue' | 'duplicate';
  issueDate: string;
}

// ─── FINANCE, DAILY STATS, FORECASTS, INSIGHTS ─────────────

export interface MonthlyPnL {
  month: string;
  revenue: {
    donations: number;
    bookings: number;
    sevas: number;
    dharamshala: number;
    parking: number;
    shop: number;
    hundi: number;
    prasadamContribution: number;
    miscellaneous: number;
    total: number;
  };
  expenses: {
    priestSalaries: number;
    staffSalaries: number;
    annadanamKitchen: number;
    maintenance: number;
    utilities: number;
    festivalPreparations: number;
    security: number;
    cleaning: number;
    vendorPayments: number;
    administration: number;
    total: number;
  };
  netSurplusINR: number;
  marginPercent: number;
}

export interface DailyStats {
  date: string;
  dayOfWeek: string;
  footfall: number;
  donationsINR: number;
  bookingsCount: number;
  complaintsOpened: number;
  complaintsResolved: number;
  avgDarshanWaitMinutes: number;
  prasadamServed: number;
  hundiCollectionINR: number;
  incidentsReported: number;
  notableEvent: string;
}

export interface Forecast {
  month: string;
  projectedRevenueINR: number;
  projectedExpensesINR: number;
  projectedSurplusINR: number;
  projectedFootfall: number;
  projectedBookings: number;
  dominantFestival: string;
  confidence: 'high' | 'medium' | 'low';
  notes: string;
}

export interface KeyInsight {
  id: string;
  category: 'revenue' | 'cost' | 'devotee' | 'operations' | 'risk' | 'opportunity';
  headline: string;
  detail: string;
  metricValue: string;
  direction: 'up' | 'down' | 'flat';
  urgency: 'high' | 'medium' | 'low';
  recommendedAction: string;
}

// Lightweight snapshot for client-side rendering (pages import this instead
// of defining their own inline subset of Temple).
export type TempleSnapshot = Pick<
  Temple,
  | 'id' | 'name' | 'deity' | 'city' | 'state' | 'description'
  | 'founded' | 'trustChairman' | 'languages'
  | 'stats' | 'monthlyFinance' | 'upcomingFestivals' | 'connector'
>;

// Patch shape for editing the temple's profile via /api/temple PATCH.
export interface UpdateTempleInput {
  name?: string;
  deity?: string;
  city?: string;
  state?: string;
  founded?: number;
  languages?: string[];
  description?: string;
  trustChairman?: string;
  connector?: ConnectorConfig;
}
