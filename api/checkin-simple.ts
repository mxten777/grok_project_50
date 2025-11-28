import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

interface QRTokenPayload {
  seatId: string;
  reservedBy: string;
  reservedAt: number;
  exp: number;
  oneTimeToken: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('Simple Checkin API called:', req.method, req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;
  console.log('Token received:', !!token);

  if (!token) {
    return res.status(400).json({ error: 'Missing token' });
  }

  try {
    // 환경 변수 확인
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not found');
      return res.status(500).json({ error: 'JWT secret missing' });
    }

    console.log('JWT_SECRET found');

    // JWT 검증
    console.log('Verifying JWT token...');
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as QRTokenPayload;
    console.log('JWT verified successfully:', payload);

    const { seatId, reservedBy, oneTimeToken, exp } = payload;

    // 만료 확인
    const now = Math.floor(Date.now() / 1000);
    console.log('Token expiry check:', { now, exp, expired: now > exp });
    
    if (now > exp) {
      return res.status(400).json({ error: 'Token expired' });
    }

    console.log('Token is valid and not expired');

    // Firebase 없이 검증 완료 응답
    res.status(200).json({ 
      success: true,
      message: 'Token verified successfully (without Firebase)',
      seatId, 
      reservedBy, 
      oneTimeToken: oneTimeToken.substring(0, 8) + '...',
      expiresAt: new Date(exp * 1000).toISOString(),
      remainingTime: exp - now
    });

  } catch (error) {
    console.error('Error verifying token:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ error: 'Invalid token', details: error.message });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}