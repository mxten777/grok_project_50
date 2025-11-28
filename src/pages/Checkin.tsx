import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CheckinModal from '../components/CheckinModal';

const Checkin = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('t');
  const [verified, setVerified] = useState(false);
  const [seatData, setSeatData] = useState<{
    seatId: string;
    reservedBy: string;
    oneTimeToken: string;
  } | null>(null);
  const [loading, setLoading] = useState(!token);
  const [error, setError] = useState<string | null>(token ? null : '유효하지 않은 QR 코드입니다.');

  useEffect(() => {
    if (!token) {
      return;
    }

    // JWT 검증 API 호출
    fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setSeatData(data);
          setVerified(true);
        }
      })
      .catch(() => {
        setError('검증 중 오류가 발생했습니다.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">QR 코드 검증 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
            오류
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.close()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  if (verified && seatData) {
    return (
      <CheckinModal
        seatId={seatData.seatId}
        reservedBy={seatData.reservedBy}
        oneTimeToken={seatData.oneTimeToken}
        onClose={() => window.close()}
        onSuccess={() => {
          alert('입실이 완료되었습니다!');
          window.close();
        }}
      />
    );
  }

  return null;
};

export default Checkin;