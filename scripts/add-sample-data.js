// Firestore에 샘플 좌석 데이터 추가 스크립트
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';

// Firebase 설정 (환경 변수에서 가져옴)
const firebaseConfig = {
  apiKey: "AIzaSyBjOET5XrmR996Ml1CmifkxhnQmuC__FdI",
  authDomain: "grok-project-50.firebaseapp.com",
  projectId: "grok-project-50",
  storageBucket: "grok-project-50.firebasestorage.app",
  messagingSenderId: "347207814610",
  appId: "1:347207814610:web:33220a86e7721786bb0c0b"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 샘플 좌석 데이터 생성
const generateSeats = () => {
  const seats = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  for (let floor = 1; floor <= 5; floor++) {
    for (let row = 0; row < rows.length; row++) {
      for (let col = 1; col <= 10; col++) {
        seats.push({
          id: `floor${floor}-${rows[row]}${col}`,
          floor,
          row: rows[row],
          column: col,
          status: 'available',
          reservedBy: null,
          reservedAt: null,
          occupiedBy: null,
          occupiedAt: null,
          expiresAt: null,
        });
      }
    }
  }
  return seats;
};

// 데이터 추가 함수
const addSampleData = async () => {
  try {
    console.log('샘플 좌석 데이터 추가 중...');

    const seats = generateSeats();

    // 좌석 데이터 추가
    const batchPromises = seats.map(seat =>
      setDoc(doc(db, 'seats', seat.id), seat)
    );

    await Promise.all(batchPromises);
    console.log(`${seats.length}개의 좌석 데이터가 추가되었습니다.`);

    // 샘플 사용자 추가 (관리자)
    await setDoc(doc(db, 'users', 'admin@example.com'), {
      uid: 'admin-uid',
      email: 'admin@example.com',
      displayName: '관리자',
      isAdmin: true,
    });
    console.log('관리자 계정이 추가되었습니다.');

  } catch (error) {
    console.error('데이터 추가 중 오류:', error);
  }
};

// 스크립트 실행
addSampleData();