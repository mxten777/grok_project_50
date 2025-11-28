import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('Testing environment variables...');
    
    const firebaseKey = process.env.FIREBASE_ADMIN_KEY;
    const jwtSecret = process.env.JWT_SECRET;
    
    console.log('FIREBASE_ADMIN_KEY exists:', !!firebaseKey);
    console.log('FIREBASE_ADMIN_KEY length:', firebaseKey?.length || 0);
    console.log('JWT_SECRET exists:', !!jwtSecret);
    console.log('JWT_SECRET length:', jwtSecret?.length || 0);
    
    if (firebaseKey) {
      try {
        const parsed = JSON.parse(firebaseKey);
        console.log('Firebase key parsed successfully');
        console.log('Project ID:', parsed.project_id);
      } catch (error) {
        console.error('Firebase key parsing failed:', error);
        return res.status(500).json({ 
          error: 'Firebase key parsing failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    res.status(200).json({ 
      firebaseKeyExists: !!firebaseKey,
      firebaseKeyLength: firebaseKey?.length || 0,
      jwtSecretExists: !!jwtSecret,
      jwtSecretLength: jwtSecret?.length || 0,
      success: true
    });
  } catch (error) {
    console.error('Test environment error:', error);
    res.status(500).json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}