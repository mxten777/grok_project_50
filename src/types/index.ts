// 사용자 관련 타입
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  isAdmin: boolean;
}

// 좌석 관련 타입
export interface Seat {
  id: string;
  floor: number;
  row: string;
  column: number;
  status: 'available' | 'reserved' | 'occupied' | 'expiring';
  reservedBy?: string;
  reservedAt?: Date;
  occupiedBy?: string;
  occupiedAt?: Date;
  expiresAt?: Date;
}

// 예약 관련 타입
export interface Reservation {
  id: string;
  userId: string;
  seatId: string;
  reservedAt: Date;
  expiresAt: Date;
  status: 'active' | 'cancelled' | 'expired';
}

// 1회용 토큰 타입
export interface OneTimeToken {
  token: string;
  seatId: string;
  userId: string;
  createdAt: Date;
  used: boolean;
}

// 블랙리스트 타입
export interface BlacklistEntry {
  id: string;
  userId: string;
  reason: string;
  blockedUntil: Date;
}

// 패널티 타입
export interface Penalty {
  userId: string;
  penaltyUntil: Date;
  reason: string;
}

// JWT 페이로드 타입
export interface QRTokenPayload {
  seatId: string;
  reservedBy: string;
  reservedAt: number;
  exp: number;
  oneTimeToken: string;
}