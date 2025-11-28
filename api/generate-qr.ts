import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { randomBytes } from 'crypto';

// Firebase Admin 초기화 (서버에서만)
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { seatId, userId } = req.body;

  if (!seatId || !userId) {
    return res.status(400).json({ error: 'Missing seatId or userId' });
  }

  try {
    // 1회용 토큰 생성
    const oneTimeToken = randomBytes(32).toString('hex');

    // 예약 시간 설정
    const reservedAt = Date.now();
    const expiresAt = reservedAt + 2 * 60 * 60 * 1000; // 2시간

    // JWT 페이로드
    const payload = {
      seatId,
      reservedBy: userId,
      reservedAt,
      exp: Math.floor(expiresAt / 1000),
      oneTimeToken,
    };

    // JWT 서명 (환경 변수의 시크릿 키 사용)
    const token = jwt.sign(payload, process.env.JWT_SECRET!);

    // Firestore에 1회용 토큰 저장
    await db.collection('usedTokens').doc(oneTimeToken).set({
      seatId,
      userId,
      createdAt: new Date(),
      used: false,
    });

    // 좌석 예약 상태 업데이트
    await db.collection('seats').doc(seatId).update({
      status: 'reserved',
      reservedBy: userId,
      reservedAt: new Date(reservedAt),
      expiresAt: new Date(expiresAt),
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error generating QR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}