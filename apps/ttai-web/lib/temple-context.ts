// Build the system-prompt context block for the temple.
//
// IMPORTANT: With large datasets (91K+ rows per temple), we CANNOT
// dump everything into the prompt. Instead we:
//   - Show aggregate stats from the full dataset
//   - Show the top/recent N entries from each category
//   - Show patterns and distributions computed from the full set
//
// The AI sees a SUMMARY of the data, not every row.

import type { Temple } from './temple-types';
import { fmtINR as fmt } from './format';

export function buildTempleContext(temple: Temple): string {
  const today = new Date().toISOString().split('T')[0]!;

  // ── Derived aggregates ──
  const totalDonationValue = temple.recentDonations.reduce((s, d) => s + d.amount, 0);
  const avgDonation = temple.recentDonations.length > 0 ? Math.round(totalDonationValue / temple.recentDonations.length) : 0;
  const totalBookingValue = temple.upcomingBookings.reduce((s, b) => s + b.amount, 0);
  const avgBooking = temple.upcomingBookings.length > 0 ? Math.round(totalBookingValue / temple.upcomingBookings.length) : 0;

  const openComplaints = temple.complaintLog.filter(c => c.status === 'open').length;
  const inProgressComplaints = temple.complaintLog.filter(c => c.status === 'in-progress').length;
  const resolvedComplaints = temple.complaintLog.filter(c => c.status === 'resolved').length;

  const lapsedDonors = temple.donorDirectory.filter(d => d.lapsed);
  const platinumDonors = temple.donorDirectory.filter(d => d.tier === 'platinum');
  const goldDonors = temple.donorDirectory.filter(d => d.tier === 'gold');
  const silverDonors = temple.donorDirectory.filter(d => d.tier === 'silver');
  const regularDonors = temple.donorDirectory.filter(d => d.tier === 'regular');
  const lapsedValue = lapsedDonors.reduce((s, d) => s + d.totalDonatedINR, 0);

  const availableStaff = temple.staffRoster.filter(s => s.available).length;
  const availablePriests = temple.priests.filter(p => p.available).length;

  // Complaint category distribution
  const complaintByCat = new Map<string, number>();
  for (const c of temple.complaintLog) {
    if (c.status !== 'resolved') complaintByCat.set(c.category, (complaintByCat.get(c.category) ?? 0) + 1);
  }
  const topComplaintCats = Array.from(complaintByCat.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Complaint time-slot distribution
  const complaintBySlot = new Map<string, number>();
  for (const c of temple.complaintLog) {
    if (c.status !== 'resolved') complaintBySlot.set(c.timeSlot, (complaintBySlot.get(c.timeSlot) ?? 0) + 1);
  }
  const topSlots = Array.from(complaintBySlot.entries()).sort((a, b) => b[1] - a[1]);

  // Complaint day-of-week distribution
  const complaintByDay = new Map<string, number>();
  for (const c of temple.complaintLog) {
    if (c.status !== 'resolved') complaintByDay.set(c.dayOfWeek, (complaintByDay.get(c.dayOfWeek) ?? 0) + 1);
  }
  const topDays = Array.from(complaintByDay.entries()).sort((a, b) => b[1] - a[1]);

  // Inventory items below minimum
  const criticalInventory = temple.inventoryAlerts.filter(i => i.current < i.minimum).slice(0, 15);

  // Donor city distribution (top 5)
  const donorByCityMap = new Map<string, number>();
  for (const d of temple.donorDirectory) donorByCityMap.set(d.city, (donorByCityMap.get(d.city) ?? 0) + 1);
  const topDonorCities = Array.from(donorByCityMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Booking puja type distribution (top 8)
  const pujaTypeMap = new Map<string, number>();
  for (const b of temple.upcomingBookings) pujaTypeMap.set(b.pujaType, (pujaTypeMap.get(b.pujaType) ?? 0) + 1);
  const topPujaTypes = Array.from(pujaTypeMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return `
═══════════════════════════════════════════════════════════════
TEMPLE PROFILE
═══════════════════════════════════════════════════════════════
Name: ${temple.name}
Deity: ${temple.deity}
Location: ${temple.city}, ${temple.state}
Founded: ${temple.founded} CE
Languages: ${temple.languages.join(', ')}
Trust Chairman: ${temple.trustChairman}
About: ${temple.description}

DATASET SIZE: ${temple.recentDonations.length.toLocaleString('en-IN')} donations, ${temple.donorDirectory.length.toLocaleString('en-IN')} donors, ${temple.upcomingBookings.length.toLocaleString('en-IN')} bookings, ${temple.complaintLog.length.toLocaleString('en-IN')} complaints, ${temple.staffRoster.length} staff, ${temple.priests.length} priests

═══ OPERATIONAL STATS ═══
- Registered Devotees: ${temple.stats.devoteeCount.toLocaleString('en-IN')}
- Monthly Donations: ${fmt(temple.stats.monthlyDonationsINR)}
- Monthly Bookings: ${temple.stats.monthlyBookingsCount.toLocaleString('en-IN')}
- Active Complaints: ${openComplaints} open + ${inProgressComplaints} in-progress = ${openComplaints + inProgressComplaints} active (${resolvedComplaints} resolved)
- Priests: ${temple.priests.length} on roll, ${availablePriests} available
- Staff: ${temple.staffRoster.length} on roster, ${availableStaff} available today
- Daily Footfall: ${temple.stats.dailyFootfall.toLocaleString('en-IN')}

═══ MONTHLY FINANCE ═══
- Revenue: ${fmt(temple.monthlyFinance.revenueINR)}
- Expenses: ${fmt(temple.monthlyFinance.expensesINR)}
- Net Surplus: ${fmt(temple.monthlyFinance.netSurplusINR)}
- Top Expense: ${temple.monthlyFinance.topExpenseCategory}

═══ MONTH-ON-MONTH TRENDS ═══
${temple.historicalComparisons.slice(0, 12).map(h => `- ${h.metric}: ${h.thisMonth.toLocaleString('en-IN')} vs ${h.lastMonth.toLocaleString('en-IN')} (${h.changePercent >= 0 ? '+' : ''}${h.changePercent}%)`).join('\n')}

═══ DONATION SUMMARY (from ${temple.recentDonations.length.toLocaleString('en-IN')} transactions) ═══
- Total value: ${fmt(totalDonationValue)}
- Average donation: ${fmt(avgDonation)}
- Top 10 recent:
${temple.recentDonations.slice(0, 10).map((d, i) => `  ${i + 1}. ${d.donor} — ${fmt(d.amount)} on ${d.date} (${d.purpose})`).join('\n')}

═══ DONOR DIRECTORY (${temple.donorDirectory.length.toLocaleString('en-IN')} donors) ═══
Tier breakdown: Platinum ${platinumDonors.length} | Gold ${goldDonors.length} | Silver ${silverDonors.length} | Regular ${regularDonors.length}
Lapsed donors (90+ days): ${lapsedDonors.length} (dormant value: ${fmt(lapsedValue)})

Top 15 donors:
${temple.donorDirectory.slice(0, 15).map((d, i) => `  ${i + 1}. ${d.name} | ${d.tier.toUpperCase()} | ${fmt(d.totalDonatedINR)} | ${d.donationCount} donations | Last: ${d.lastDonationDate} | ${d.city} | ${d.lapsed ? 'LAPSED' : 'Active'}`).join('\n')}

Top lapsed donors (by value):
${lapsedDonors.slice(0, 10).map((d, i) => `  ${i + 1}. ${d.name} | ${fmt(d.totalDonatedINR)} | Last: ${d.lastDonationDate} | ${d.city}`).join('\n')}

Donor cities: ${topDonorCities.map(([city, count]) => `${city} (${count})`).join(', ')}

═══ BOOKINGS (from ${temple.upcomingBookings.length.toLocaleString('en-IN')} records) ═══
- Total booking value: ${fmt(totalBookingValue)}
- Average booking: ${fmt(avgBooking)}
- Top puja types: ${topPujaTypes.map(([type, count]) => `${type} (${count})`).join(', ')}
- Upcoming 10:
${temple.upcomingBookings.filter(b => b.date >= new Date().toISOString().split('T')[0]!).slice(0, 10).map((b, i) => `  ${i + 1}. ${b.devotee} — ${b.pujaType} on ${b.date} — ${fmt(b.amount)} [${b.status}]`).join('\n')}

═══ COMPLAINT ANALYSIS (from ${temple.complaintLog.length.toLocaleString('en-IN')} complaints) ═══
Status: ${openComplaints} open | ${inProgressComplaints} in-progress | ${resolvedComplaints} resolved

By category (active only):
${topComplaintCats.map(([cat, count]) => `  - ${cat}: ${count}`).join('\n')}

By time slot (active):
${topSlots.map(([slot, count]) => `  - ${slot}: ${count}`).join('\n')}

By day of week (active):
${topDays.map(([day, count]) => `  - ${day}: ${count}`).join('\n')}

Recent 15 complaints:
${temple.complaintLog.slice(0, 15).map(c => `  [${c.id}] ${c.category} | ${c.datetime} (${c.dayOfWeek}, ${c.timeSlot}) | ${c.status}${c.resolution ? ' | ' + c.resolution : ''}\n    "${c.description}"`).join('\n')}

═══ FESTIVALS (${temple.upcomingFestivals.length} on record) ═══
${temple.upcomingFestivals.filter(f => f.date >= new Date().toISOString().split('T')[0]!).slice(0, 8).map(f => `- ${f.name} on ${f.date} | Footfall: ${f.expectedFootfall.toLocaleString('en-IN')} | Prep: ${f.preparationStatus}`).join('\n')}

═══ INVENTORY ALERTS (${criticalInventory.length} items below minimum) ═══
${criticalInventory.length > 0 ? criticalInventory.map(i => `- ${i.item}: ${i.current} ${i.unit} (min: ${i.minimum} ${i.unit})`).join('\n') : 'All levels healthy.'}

═══ STAFF (${temple.staffRoster.length} roster, ${availableStaff} available) ═══
${temple.staffRoster.filter(s => !s.available).slice(0, 10).map(s => `- UNAVAILABLE: ${s.name} (${s.role}, ${s.shift} shift)`).join('\n') || 'All staff available.'}

Key roles on duty:
${temple.staffRoster.filter(s => s.available).slice(0, 15).map(s => `- ${s.name} | ${s.role} | ${s.shift}`).join('\n')}

═══ PRIESTS (${temple.priests.length} total, ${availablePriests} available) ═══
${temple.priests.slice(0, 15).map(p => `- ${p.name} | ${p.specialization} | ${p.available ? 'Available' : 'ON LEAVE'}`).join('\n')}

═══ VIP VISITS (upcoming) ═══
${temple.vipVisits.filter(v => v.date >= new Date().toISOString().split('T')[0]!).slice(0, 5).map(v => `- ${v.name} (${v.designation}) on ${v.date} at ${v.time} — ${v.specialRequirements}`).join('\n') || 'No upcoming VIP visits.'}

═══ AUDIT & RECONCILIATION ═══
- Total Transactions: ${temple.reconciliation.totalTransactions.toLocaleString('en-IN')}
- Reconciled: ${temple.reconciliation.reconciledCount.toLocaleString('en-IN')} (${temple.reconciliation.reconciliationRate}%)
- Pending: ${temple.reconciliation.pendingCount} | Mismatches: ${temple.reconciliation.mismatchCount}
- Refunds: ${temple.reconciliation.refundsCount} (${temple.reconciliation.refundsMissingReason} missing reason)
- Settlements delayed >24h: ${temple.reconciliation.settlementDelayedCount}
- Manual receipts needing proof: ${temple.reconciliation.manualReceiptsNeedingProof}

═══ PENDING TRUSTEE DECISIONS ═══
${temple.pendingDecisions.slice(0, 10).map((d, i) => `${i + 1}. [${d.urgency.toUpperCase()}] ${d.topic}\n   ${d.context}\n   Recommendation: ${d.recommendedAction}`).join('\n')}

═══ SEVA BOOKINGS (from ${temple.sevaBookings.length} records) ═══
${(() => {
  const sevaTypeMap = new Map<string, { count: number; revenue: number }>();
  for (const s of temple.sevaBookings) {
    const entry = sevaTypeMap.get(s.sevaType) ?? { count: 0, revenue: 0 };
    entry.count += 1;
    entry.revenue += s.amountINR;
    sevaTypeMap.set(s.sevaType, entry);
  }
  const topSevas = Array.from(sevaTypeMap.entries()).sort((a, b) => b[1].count - a[1].count).slice(0, 5);
  const totalSevaRevenue = temple.sevaBookings.reduce((s, b) => s + b.amountINR, 0);
  return `Total bookings: ${temple.sevaBookings.length} | Total revenue: ${fmt(totalSevaRevenue)}
Top seva types:
${topSevas.map(([type, { count, revenue }]) => `  - ${type}: ${count} bookings (${fmt(revenue)})`).join('\n')}`;
})()}

═══ PRASADAM STOCK & DISTRIBUTION ═══
${(() => {
  const prasadamTypeMap = new Map<string, { prepared: number; distributed: number; wasted: number; cost: number }>();
  for (const p of temple.prasadamRecords) {
    const entry = prasadamTypeMap.get(p.prasadamType) ?? { prepared: 0, distributed: 0, wasted: 0, cost: 0 };
    entry.prepared += p.quantityPrepared;
    entry.distributed += p.quantityDistributed;
    entry.wasted += p.quantityWasted;
    entry.cost += p.costINR;
    prasadamTypeMap.set(p.prasadamType, entry);
  }
  const topPrasadam = Array.from(prasadamTypeMap.entries()).sort((a, b) => b[1].prepared - a[1].prepared).slice(0, 5);
  const totalPrepared = temple.prasadamRecords.reduce((s, p) => s + p.quantityPrepared, 0);
  const totalDistributed = temple.prasadamRecords.reduce((s, p) => s + p.quantityDistributed, 0);
  const totalWasted = temple.prasadamRecords.reduce((s, p) => s + p.quantityWasted, 0);
  const totalCost = temple.prasadamRecords.reduce((s, p) => s + p.costINR, 0);
  const wastePercent = totalPrepared > 0 ? ((totalWasted / totalPrepared) * 100).toFixed(1) : '0.0';
  return `Total prepared: ${totalPrepared.toLocaleString('en-IN')} | Distributed: ${totalDistributed.toLocaleString('en-IN')} | Waste: ${wastePercent}% | Daily cost: ${fmt(totalCost)}
Top prasadam types:
${topPrasadam.map(([type, d]) => `  - ${type}: ${d.prepared.toLocaleString('en-IN')} prepared, ${d.distributed.toLocaleString('en-IN')} distributed (${fmt(d.cost)})`).join('\n')}`;
})()}

═══ DHARAMSHALA OCCUPANCY (from ${temple.dharamshalaBookings.length} bookings) ═══
${(() => {
  const today = new Date().toISOString().split('T')[0]!;
  const occupied = temple.dharamshalaBookings.filter(b => b.status === 'occupied');
  const roomTypeMap = new Map<string, { count: number; totalTariff: number }>();
  for (const b of temple.dharamshalaBookings) {
    const entry = roomTypeMap.get(b.roomType) ?? { count: 0, totalTariff: 0 };
    entry.count += 1;
    entry.totalTariff += b.tariffINR;
    roomTypeMap.set(b.roomType, entry);
  }
  const avgTariff = temple.dharamshalaBookings.length > 0 ? Math.round(temple.dharamshalaBookings.reduce((s, b) => s + b.tariffINR, 0) / temple.dharamshalaBookings.length) : 0;
  const todayCheckIns = temple.dharamshalaBookings.filter(b => b.checkIn.startsWith(today)).length;
  const todayCheckOuts = temple.dharamshalaBookings.filter(b => b.checkOut.startsWith(today)).length;
  return `Currently occupied: ${occupied.length} rooms | Avg tariff: ${fmt(avgTariff)} | Today's check-ins: ${todayCheckIns} | Check-outs: ${todayCheckOuts}
By room type:
${Array.from(roomTypeMap.entries()).sort((a, b) => b[1].count - a[1].count).map(([type, d]) => `  - ${type}: ${d.count} bookings (avg ${fmt(d.count > 0 ? Math.round(d.totalTariff / d.count) : 0)})`).join('\n')}`;
})()}

═══ PARKING (from ${temple.parkingTokens.length} tokens) ═══
${(() => {
  const today = new Date().toISOString().split('T')[0]!;
  const todayTokens = temple.parkingTokens.filter(p => p.entryTime.startsWith(today));
  const totalRevenue = temple.parkingTokens.reduce((s, p) => s + p.feeINR, 0);
  const avgDuration = temple.parkingTokens.length > 0 ? Math.round(temple.parkingTokens.reduce((s, p) => s + p.durationMinutes, 0) / temple.parkingTokens.length) : 0;
  const lotMap = new Map<string, number>();
  for (const p of temple.parkingTokens) lotMap.set(p.lotId, (lotMap.get(p.lotId) ?? 0) + 1);
  const hourMap = new Map<string, number>();
  for (const p of temple.parkingTokens) {
    const hour = p.entryTime.split('T')[1]?.substring(0, 2) ?? '00';
    hourMap.set(hour, (hourMap.get(hour) ?? 0) + 1);
  }
  const peakHours = Array.from(hourMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);
  return `Today's tokens: ${todayTokens.length} | Total tokens: ${temple.parkingTokens.length} | Avg duration: ${avgDuration} min | Revenue: ${fmt(totalRevenue)}
Lot utilization: ${Array.from(lotMap.entries()).map(([lot, count]) => `${lot}: ${count}`).join(', ')}
Peak hours: ${peakHours.map(([h, count]) => `${h}:00 (${count} entries)`).join(', ')}`;
})()}

═══ HUNDI COLLECTION ═══
${(() => {
  const totalCollected = temple.hundiCollections.reduce((s, h) => s + h.amountINR, 0);
  const locationMap = new Map<string, number>();
  for (const h of temple.hundiCollections) locationMap.set(h.location, (locationMap.get(h.location) ?? 0) + h.amountINR);
  const avgPerCollection = temple.hundiCollections.length > 0 ? Math.round(totalCollected / temple.hundiCollections.length) : 0;
  return `Total collected: ${fmt(totalCollected)} from ${temple.hundiCollections.length} collections | Avg per collection: ${fmt(avgPerCollection)}
By location:
${Array.from(locationMap.entries()).sort((a, b) => b[1] - a[1]).map(([loc, amt]) => `  - ${loc}: ${fmt(amt)}`).join('\n')}`;
})()}

═══ DARSHAN QUEUE ANALYSIS (from ${temple.darshanTokens.length} tokens) ═══
${(() => {
  const typeMap = new Map<string, { count: number; totalWait: number }>();
  for (const d of temple.darshanTokens) {
    const entry = typeMap.get(d.tokenType) ?? { count: 0, totalWait: 0 };
    entry.count += 1;
    entry.totalWait += d.waitMinutes;
    typeMap.set(d.tokenType, entry);
  }
  const totalDarshans = temple.darshanTokens.length;
  // Find peak wait slots by hour
  const slotMap = new Map<string, { count: number; totalWait: number }>();
  for (const d of temple.darshanTokens) {
    const hour = d.expectedDarshanTime.split('T')[1]?.substring(0, 2) ?? d.expectedDarshanTime.substring(0, 5);
    const entry = slotMap.get(hour) ?? { count: 0, totalWait: 0 };
    entry.count += 1;
    entry.totalWait += d.waitMinutes;
    slotMap.set(hour, entry);
  }
  const peakSlots = Array.from(slotMap.entries()).sort((a, b) => (b[1].totalWait / b[1].count) - (a[1].totalWait / a[1].count)).slice(0, 3);
  return `Total darshans: ${totalDarshans}
Avg wait by type:
${Array.from(typeMap.entries()).map(([type, d]) => `  - ${type}: ${Math.round(d.totalWait / d.count)} min avg (${d.count} tokens)`).join('\n')}
Peak wait slots: ${peakSlots.map(([slot, d]) => `${slot}:00 (${Math.round(d.totalWait / d.count)} min avg)`).join(', ')}`;
})()}

═══ TEMPLE SHOP SALES ═══
${(() => {
  const itemMap = new Map<string, { qty: number; revenue: number }>();
  for (const s of temple.shopSales) {
    const entry = itemMap.get(s.itemName) ?? { qty: 0, revenue: 0 };
    entry.qty += s.quantity;
    entry.revenue += s.priceINR * s.quantity;
    itemMap.set(s.itemName, entry);
  }
  const topItems = Array.from(itemMap.entries()).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5);
  const dailyRevenue = temple.shopSales.reduce((s, sale) => s + sale.priceINR * sale.quantity, 0);
  const modeMap = new Map<string, number>();
  for (const s of temple.shopSales) modeMap.set(s.paymentMode, (modeMap.get(s.paymentMode) ?? 0) + s.priceINR * s.quantity);
  const totalShopRev = dailyRevenue || 1;
  return `Daily revenue: ${fmt(dailyRevenue)} | ${temple.shopSales.length} transactions
Top 5 selling items:
${topItems.map(([item, d]) => `  - ${item}: ${d.qty} sold (${fmt(d.revenue)})`).join('\n')}
Payment split: ${Array.from(modeMap.entries()).map(([mode, amt]) => `${mode}: ${((amt / totalShopRev) * 100).toFixed(0)}%`).join(' | ')}`;
})()}

═══ AARTI SCHEDULE (today) ═══
${(() => {
  const today = new Date().toISOString().split('T')[0]!;
  const todayAartis = temple.aartiSchedule.filter(a => a.date.startsWith(today));
  if (todayAartis.length === 0) return 'No aartis scheduled for today.';
  return todayAartis.map(a => `  - ${a.aartiName} at ${a.scheduledTime} | Priest: ${a.priestAssigned} | Expected: ${a.attendeeEstimate} devotees`).join('\n');
})()}

═══ VENDOR CONTRACTS (${temple.vendorContracts.length} vendors) ═══
${(() => {
  const expiringSoon = temple.vendorContracts.filter(v => v.renewalStatus === 'expiring-soon').length;
  const expired = temple.vendorContracts.filter(v => v.renewalStatus === 'expired').length;
  const lowRated = temple.vendorContracts.filter(v => v.performanceRating < 3).length;
  return `Expiring soon: ${expiringSoon} | Expired: ${expired} | Low-rated (<3): ${lowRated}
${lowRated > 0 ? `Low-rated vendors:\n${temple.vendorContracts.filter(v => v.performanceRating < 3).slice(0, 5).map(v => `  - ${v.vendorName} (${v.vendorType}) — rating: ${v.performanceRating}/5`).join('\n')}` : 'All vendors rated 3+ stars.'}`;
})()}

═══ UTILITY BILLS ═══
${(() => {
  const monthlyTotal = temple.utilityBills.reduce((s, b) => s + b.amountINR, 0);
  const overdue = temple.utilityBills.filter(b => b.paymentStatus === 'overdue');
  const typeMap = new Map<string, number>();
  for (const b of temple.utilityBills) typeMap.set(b.billType, (typeMap.get(b.billType) ?? 0) + b.amountINR);
  const topType = Array.from(typeMap.entries()).sort((a, b) => b[1] - a[1])[0];
  return `Monthly total: ${fmt(monthlyTotal)} | Overdue: ${overdue.length} bills${overdue.length > 0 ? ' (' + fmt(overdue.reduce((s, b) => s + b.amountINR, 0)) + ')' : ''}
Top expense: ${topType ? `${topType[0]} (${fmt(topType[1])})` : 'N/A'}`;
})()}

═══ CCTV INCIDENTS ═══
${(() => {
  const total = temple.cctvIncidents.length;
  const severityMap = new Map<string, number>();
  for (const i of temple.cctvIncidents) severityMap.set(i.severity, (severityMap.get(i.severity) ?? 0) + 1);
  const recent = temple.cctvIncidents.slice(0, 5);
  return `Total incidents: ${total}
Severity: ${Array.from(severityMap.entries()).map(([s, c]) => `${s}: ${c}`).join(' | ')}
Recent 5:
${recent.map(i => `  - [${i.severity.toUpperCase()}] ${i.incidentType} on ${i.datetime} (${i.cameraId}) — ${i.description.substring(0, 80)}`).join('\n')}`;
})()}

═══ LOST & FOUND ═══
${(() => {
  const total = temple.lostAndFound.length;
  const unclaimed = temple.lostAndFound.filter(i => i.status === 'unclaimed').length;
  const recent = temple.lostAndFound.slice(0, 5);
  return `Total items: ${total} | Unclaimed: ${unclaimed}
Recent 5:
${recent.map(i => `  - ${i.itemDescription} found at ${i.locationFound} on ${i.dateFound} [${i.status.toUpperCase()}]`).join('\n')}`;
})()}

═══ DEVOTEE FEEDBACK (from ${temple.devoteeFeedback.length} entries) ═══
${(() => {
  if (temple.devoteeFeedback.length === 0) return 'No feedback recorded yet.';
  const avgRating = (temple.devoteeFeedback.reduce((s, f) => s + f.rating, 0) / temple.devoteeFeedback.length).toFixed(1);
  const ratingDist = [5, 4, 3, 2, 1].map(r => `${r}-star: ${temple.devoteeFeedback.filter(f => f.rating === r).length}`);
  const catMap = new Map<string, number>();
  for (const f of temple.devoteeFeedback) catMap.set(f.category, (catMap.get(f.category) ?? 0) + 1);
  const topCats = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const recentComments = temple.devoteeFeedback.filter(f => f.comment).slice(0, 3);
  return `Average rating: ${avgRating}/5 | Distribution: ${ratingDist.join(', ')}
Top categories: ${topCats.map(([cat, count]) => `${cat} (${count})`).join(', ')}
Recent comments:
${recentComments.map(f => `  - [${f.rating}/5] "${f.comment.substring(0, 100)}"`).join('\n')}`;
})()}

═══ PAYMENT MODES ═══
${(() => {
  const modeMap = new Map<string, { amount: number; txns: number; fees: number }>();
  for (const p of temple.paymentModes) {
    const entry = modeMap.get(p.mode) ?? { amount: 0, txns: 0, fees: 0 };
    entry.amount += p.totalAmountINR;
    entry.txns += p.transactionCount;
    entry.fees += p.processorFeesINR;
    modeMap.set(p.mode, entry);
  }
  const totalAmount = temple.paymentModes.reduce((s, p) => s + p.totalAmountINR, 0) || 1;
  const totalFees = temple.paymentModes.reduce((s, p) => s + p.processorFeesINR, 0);
  const pendingSettlements = temple.paymentModes.filter(p => p.settlementStatus === 'pending').length;
  return `Split by mode: ${Array.from(modeMap.entries()).map(([mode, d]) => `${mode} ${((d.amount / totalAmount) * 100).toFixed(0)}%`).join(' | ')}
Total processing fees: ${fmt(totalFees)} | Pending settlements: ${pendingSettlements}`;
})()}

═══ DONATION RECEIPTS (80G) ═══
${(() => {
  const issued = temple.donationReceipts.filter(r => r.receiptStatus === 'issued').length;
  const pending = temple.donationReceipts.filter(r => r.receiptStatus === 'pending').length;
  const overdue = temple.donationReceipts.filter(r => r.receiptStatus === 'overdue').length;
  const duplicate = temple.donationReceipts.filter(r => r.receiptStatus === 'duplicate').length;
  return `Total receipts: ${temple.donationReceipts.length} | Issued: ${issued} | Pending: ${pending} | Overdue: ${overdue} | Duplicates: ${duplicate}`;
})()}
═══════════════════════════════════════════════════════════════
`.trim();
}
