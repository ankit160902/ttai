// Shared connector utilities — eliminates duplication across 4 connector files.

import type { TempleProfile } from '../temple-types';
import type { TempleOperationalData } from './types';
import { generateTempleData } from '../temple-seed';

/**
 * Build stub operational data from a profile using the mock generator.
 * Used by all non-mock connectors when the real source is unavailable.
 * Pass a `tag` string to label the stub data so the AI knows it's not real.
 */
export function buildStubData(
  profile: TempleProfile,
  tag: string
): TempleOperationalData {
  const full = generateTempleData(profile);
  return {
    stats: full.stats,
    recentDonations: full.recentDonations.map((d) => ({
      ...d,
      purpose: `${tag} ${d.purpose}`,
    })),
    upcomingBookings: full.upcomingBookings,
    upcomingFestivals: full.upcomingFestivals,
    topComplaints: full.topComplaints,
    inventoryAlerts: full.inventoryAlerts,
    priests: full.priests,
    monthlyFinance: full.monthlyFinance,
    donorDirectory: full.donorDirectory,
    complaintLog: full.complaintLog,
    staffRoster: full.staffRoster,
    vipVisits: full.vipVisits,
    reconciliation: full.reconciliation,
    historicalComparisons: full.historicalComparisons,
    pendingDecisions: full.pendingDecisions,
    sevaBookings: full.sevaBookings,
    prasadamRecords: full.prasadamRecords,
    dharamshalaBookings: full.dharamshalaBookings,
    parkingTokens: full.parkingTokens,
    hundiCollections: full.hundiCollections,
    darshanTokens: full.darshanTokens,
    shopSales: full.shopSales,
    aartiSchedule: full.aartiSchedule,
    vendorContracts: full.vendorContracts,
    utilityBills: full.utilityBills,
    cctvIncidents: full.cctvIncidents,
    lostAndFound: full.lostAndFound,
    devoteeFeedback: full.devoteeFeedback,
    paymentModes: full.paymentModes,
    donationReceipts: full.donationReceipts,
  };
}

/**
 * Extract operational data from a full Temple object.
 * Used by MockConnector to avoid manually listing every field.
 */
export function toOperationalData(
  full: ReturnType<typeof generateTempleData>
): TempleOperationalData {
  const {
    id: _id, name: _name, deity: _deity, city: _city, state: _state,
    founded: _founded, languages: _languages, description: _desc,
    trustChairman: _tc, onboardedAt: _oa, connector: _conn,
    ...operational
  } = full;
  return operational as TempleOperationalData;
}
