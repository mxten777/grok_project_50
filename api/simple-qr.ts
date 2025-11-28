import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('Simple QR API called');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { seatNumber, floorId, userId } = req.body;
  console.log('Request data:', { seatNumber, floorId, userId });

  if (!seatNumber || !floorId || !userId) {
    return res.status(400).json({ error: 'Missing seatNumber, floorId, or userId' });
  }

  // seatId 생성 (floorId + seatNumber)
  const seatId = `${floorId}-${seatNumber}`;

  try {
    // JWT Secret 확인
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not found');
      return res.status(500).json({ error: 'JWT secret missing' });
    }

    console.log('JWT_SECRET exists');

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

    // JWT 서명
    const token = jwt.sign(payload, process.env.JWT_SECRET!);
    console.log('JWT token signed successfully');

    console.log('Simple QR generation successful - no Firestore operations');
    res.status(200).json({ 
      token,
      message: 'QR code generated successfully (without Firestore)',
      seatId,
      seatNumber,
      floorId,
      userId,
      expiresAt: new Date(expiresAt).toISOString()
    });
  } catch (error) {
    console.error('Error in simple QR generation:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}