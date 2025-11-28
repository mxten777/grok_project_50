import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { randomBytes } from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('QR Generate API called:', req.method, req.body);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { seatNumber, floorId, userId } = req.body;
  console.log('Request data:', { seatNumber, floorId, userId });

  if (!seatNumber || !floorId || !userId) {
    console.log('Missing required fields:', { seatNumber: !!seatNumber, floorId: !!floorId, userId: !!userId });
    return res.status(400).json({ error: 'Missing seatNumber, floorId, or userId' });
  }

  // seatId 생성 (floorId + seatNumber)
  const seatId = `${floorId}-${seatNumber}`;

  try {
    // 환경 변수 확인
    if (!process.env.FIREBASE_ADMIN_KEY) {
      console.error('FIREBASE_ADMIN_KEY not found');
      return res.status(500).json({ error: 'Firebase configuration missing' });
    }
    
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not found');
      return res.status(500).json({ error: 'JWT secret missing' });
    }

    console.log('Environment variables OK');

    // Firebase Admin 초기화 (함수 내에서)
    let db;
    try {
      if (getApps().length === 0) {
        console.log('Initializing Firebase Admin...');
        const firebaseAdminKey = process.env.FIREBASE_ADMIN_KEY;
        const serviceAccount = JSON.parse(firebaseAdminKey);
        console.log('Service account parsed, project:', serviceAccount.project_id);
        
        initializeApp({
          credential: cert(serviceAccount),
        });
        console.log('Firebase Admin initialized successfully');
      }
      
      db = getFirestore();
      console.log('Firestore connected');
    } catch (firebaseError) {
      console.error('Firebase initialization error:', firebaseError);
      return res.status(500).json({ 
        error: 'Firebase initialization failed',
        details: firebaseError instanceof Error ? firebaseError.message : 'Unknown firebase error'
      });
    }

    // 1회용 토큰 생성
    const oneTimeToken = randomBytes(32).toString('hex');
    console.log('Generated one-time token');

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

    console.log('JWT payload prepared');

    // JWT 서명 (환경 변수의 시크릿 키 사용)
    const token = jwt.sign(payload, process.env.JWT_SECRET!);
    console.log('JWT token signed');

    // Firestore에 1회용 토큰 저장
    try {
      await db.collection('usedTokens').doc(oneTimeToken).set({
        seatId,
        userId,
        createdAt: new Date(),
        used: false,
      });
      console.log('Token saved to Firestore');

      // 좌석 예약 상태 업데이트
      await db.collection('seats').doc(seatId).update({
        status: 'reserved',
        reservedBy: userId,
        reservedAt: new Date(reservedAt),
        expiresAt: new Date(expiresAt),
      });
      console.log('Seat status updated');
    } catch (firestoreError) {
      console.error('Firestore operation error:', firestoreError);
      return res.status(500).json({ 
        error: 'Firestore operation failed',
        details: firestoreError instanceof Error ? firestoreError.message : 'Unknown firestore error'
      });
    }

    console.log('QR generation successful');
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error generating QR:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}