// Connector framework — the contract every SaaS adapter must implement.
//
// The whole point of this layer is that the AI assistant doesn't care
// where a temple's data came from. The Temple JSON file is the canonical
// store. Connectors are responsible for populating that store from a
// real backend (Dharma Stack, REST API, Google Sheets, etc).
//
// Adding a new SaaS = one new file in this folder + one entry in the
// CONNECTOR_CATALOG. Nothing else changes.

import type {
  TempleProfile,
  TempleStats,
  Donation,
  Booking,
  Festival,
  Complaint,
  InventoryAlert,
  Priest,
  MonthlyFinance,
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
} from '../temple-types';

export type ConnectorType = 'mock' | 'dharma-stack' | 'rest' | 'google-sheets';

/**
 * Stored on the Temple JSON. Persists which connector a tenant uses
 * along with its credentials and last-sync metadata.
 */
export interface ConnectorConfig {
  type: ConnectorType;
  credentials: Record<string, string>;
  options?: Record<string, unknown>;
  lastSyncedAt?: string;
  lastSyncStatus?: 'success' | 'error' | 'never';
  lastSyncError?: string;
}

/**
 * The slice of a Temple that connectors must produce. Excludes profile
 * fields (id, name, deity, etc) since those come from the trustee at
 * onboarding time, not from the source system.
 */
export interface TempleOperationalData {
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
}

export interface ConnectorTestResult {
  ok: boolean;
  message: string;
  details?: Record<string, unknown>;
}

export interface TempleDataConnector {
  type: ConnectorType;
  testConnection(): Promise<ConnectorTestResult>;
  fetchOperationalData(profile: TempleProfile): Promise<TempleOperationalData>;
}

export interface ConnectorCatalogEntry {
  type: ConnectorType;
  label: string;
  description: string;
  credentialFields: Array<{
    key: string;
    label: string;
    placeholder?: string;
    type?: 'text' | 'password' | 'number';
    required?: boolean;
  }>;
}
