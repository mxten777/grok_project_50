import { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Firebase Admin 초기화
if (!initializeApp.length) {
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

  const { seatId, userId, oneTimeToken } = req.body;

  if (!seatId || !userId || !oneTimeToken) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1회용 토큰 사용 처리
    await db.collection('usedTokens').doc(oneTimeToken).update({
      used: true,
    });

    // 좌석 점유 상태 업데이트
    await db.collection('seats').doc(seatId).update({
      status: 'occupied',
      occupiedBy: userId,
      occupiedAt: new Date(),
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error occupying seat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}