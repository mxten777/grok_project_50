# 도서관 좌석 예약 시스템

QR코드 기반 실시간 좌석 배정 시스템입니다.

## 기술 스택

- **Frontend**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS v3.4+
- **Backend**: Firebase (Authentication, Firestore) + Vercel Serverless Functions
- **State Management**: Zustand
- **Routing**: React Router DOM v6
- **QR Code**: qr-code-styling
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 주요 기능

- 🔐 Firebase Authentication (이메일/비밀번호, Google 로그인)
- 📱 반응형 디자인 (모바일 퍼스트)
- 🌙 다크모드 자동 지원
- 📊 실시간 좌석 상태 동기화
- 🔄 QR 코드 생성 및 스캔
- 👨‍💼 관리자 대시보드
- ⏰ 자동 예약 취소 및 패널티 시스템
- 🛡️ JWT 기반 보안 검증

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. Firebase 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Authentication 활성화 (이메일/비밀번호, Google 제공업체)
3. Firestore Database 생성
4. 프로젝트 설정에서 API 키 및 구성 정보 확인

### 3. 환경 변수 설정

`.env` 파일을 생성하고 다음 변수를 설정하세요:

```env
# Firebase 설정
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# JWT 시크릿 (Vercel 환경 변수로 설정)
JWT_SECRET=your_jwt_secret_key

# Firebase Admin (Vercel 환경 변수로 설정)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key
```

### 4. Firebase 보안 규칙 설정

Firestore Security Rules에 다음 규칙을 적용하세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자 문서 - 본인만 읽기/쓰기
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 좌석 문서 - 인증된 사용자만 읽기, 서버만 쓰기
    match /seats/{seatId} {
      allow read: if request.auth != null;
      allow write: if false; // 서버에서만 업데이트
    }

    // 예약 문서 - 본인만 생성, 서버만 수정
    match /reservations/{reservationId} {
      allow create: if request.auth != null && request.auth.uid == resource.data.userId;
      allow read, update, delete: if false; // 서버에서만 관리
    }

    // 1회용 토큰 - 서버에서만 쓰기, 클라이언트는 읽기만
    match /usedTokens/{tokenId} {
      allow read: if request.auth != null;
      allow write: if false; // 서버에서만 생성/업데이트
    }

    // 블랙리스트 - 관리자만
    match /blacklist/{entryId} {
      allow read, write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

### 5. 로컬 개발

```bash
npm run dev
```

### 6. Vercel 배포

1. [Vercel](https://vercel.com)에서 새 프로젝트 생성
2. GitHub 리포지토리 연결
3. 환경 변수 설정 (위의 .env 내용)
4. 배포

## 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── QRCodeModal.tsx  # QR 코드 생성 모달
│   └── CheckinModal.tsx # 입실 확인 모달
├── hooks/              # 커스텀 훅
│   ├── useAuth.ts      # 인증 훅
│   └── useSeats.ts     # 좌석 관리 훅
├── lib/                # 라이브러리 설정
│   └── firebase.ts     # Firebase 설정
├── pages/              # 페이지 컴포넌트
│   ├── Login.tsx       # 로그인 페이지
│   ├── Home.tsx        # 메인 페이지
│   ├── Floor.tsx       # 층별 좌석 페이지
│   └── Checkin.tsx     # QR 체크인 페이지
├── store/              # Zustand 스토어
│   ├── auth.ts         # 인증 상태
│   └── seats.ts        # 좌석 상태
├── types/              # TypeScript 타입 정의
│   └── index.ts        # 공통 타입
├── utils/              # 유틸리티 함수
│   └── date.ts         # 날짜 처리 유틸리티
└── App.tsx             # 메인 앱 컴포넌트
```

## API 엔드포인트

### `/api/generate-qr`
- **Method**: POST
- **Body**: `{ seatId: string, userId: string }`
- **Response**: `{ token: string }`
- **설명**: QR 코드용 JWT 토큰 생성

### `/api/checkin`
- **Method**: POST
- **Body**: `{ token: string }`
- **Response**: `{ seatId: string, reservedBy: string, oneTimeToken: string }`
- **설명**: JWT 토큰 검증

### `/api/occupy`
- **Method**: POST
- **Body**: `{ seatId: string, userId: string, oneTimeToken: string }`
- **Response**: `{ success: boolean }`
- **설명**: 좌석 점유 완료

## 보안 기능

- JWT 기반 QR 코드 검증
- 1회용 토큰 시스템
- 10분 자동 취소 + 5분 패널티
- IP/디바이스 기반 차단
- 관리자 알림 시스템

## 라이선스

MIT License
