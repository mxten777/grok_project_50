import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

interface QRTokenPayload {
  seatId: string;
  reservedBy: string;
  reservedAt: number;
  exp: number;
  oneTimeToken: string;
}

// Firebase Admin 초기화
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

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Missing token' });
  }

  try {
    // JWT 검증
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as QRTokenPayload;

    const { seatId, reservedBy, oneTimeToken, exp } = payload;

    // 만료 확인
    if (Date.now() / 1000 > exp) {
      return res.status(400).json({ error: 'Token expired' });
    }

    // 1회용 토큰 확인
    const tokenDoc = await db.collection('usedTokens').doc(oneTimeToken).get();
    if (!tokenDoc.exists || tokenDoc.data()?.used) {
      return res.status(400).json({ error: 'Token already used' });
    }

    // 좌석 상태 확인
    const seatDoc = await db.collection('seats').doc(seatId).get();
    const seatData = seatDoc.data();
    if (!seatData || seatData.status !== 'reserved' || seatData.reservedBy !== reservedBy) {
      return res.status(400).json({ error: 'Invalid seat reservation' });
    }

    // 여기서는 검증만 하고, 실제 점유는 클라이언트에서 본인 확인 버튼 누를 때 함
    res.status(200).json({ seatId, reservedBy, oneTimeToken });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}