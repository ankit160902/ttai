// Temple login credentials — hardcoded for demo.
// In production, this would come from a database with hashed passwords.

export interface TempleCredential {
  loginId: string;
  password: string;
  templeId: string;
  templeName: string;
}

export const TEMPLE_CREDENTIALS: TempleCredential[] = [
  { loginId: 'siddhivinayak', password: 'ttai@001', templeId: 'temple-001', templeName: 'Shri Siddhivinayak Mandir' },
  { loginId: 'kashivishwanath', password: 'ttai@002', templeId: 'temple-002', templeName: 'Kashi Vishwanath Temple' },
  { loginId: 'tirupati', password: 'ttai@003', templeId: 'temple-003', templeName: 'Tirumala Tirupati Balaji Temple' },
  { loginId: 'meenakshi', password: 'ttai@004', templeId: 'temple-004', templeName: 'Meenakshi Amman Temple' },
  { loginId: 'iskcon', password: 'ttai@005', templeId: 'temple-005', templeName: 'ISKCON Temple Bangalore' },
];

export function validateLogin(
  loginId: string,
  password: string
): { valid: true; templeId: string; templeName: string } | { valid: false } {
  const match = TEMPLE_CREDENTIALS.find(
    (c) => c.loginId === loginId.trim().toLowerCase() && c.password === password
  );
  if (match) {
    return { valid: true, templeId: match.templeId, templeName: match.templeName };
  }
  return { valid: false };
}
