import { useParams, Link } from 'react-router-dom';
import { useSeats } from '../hooks/useSeats';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';
import QRCodeModal from '../components/QRCodeModal';

const Floor = () => {
  const { floor } = useParams<{ floor: string }>();
  const floorNum = parseInt(floor || '1');
  const { seats, loading, reserveSeat } = useSeats(floorNum);
  const { user } = useAuth();
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  const handleSeatClick = async (seatId: string) => {
    if (!user) return;

    try {
      const token = await reserveSeat(seatId, user.uid);
      setQrToken(token);
      setSelectedSeat(seatId);
      setShowQR(true);
    } catch (error) {
      alert('좌석 예약 실패: ' + (error as Error).message);
    }
  };

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-gray-200 dark:bg-gray-600';
      case 'reserved': return 'bg-green-200 dark:bg-green-700';
      case 'occupied': return 'bg-red-200 dark:bg-red-700';
      case 'expiring': return 'bg-yellow-200 dark:bg-yellow-700';
      default: return 'bg-gray-200 dark:bg-gray-600';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link to="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
            ← 홈으로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">
            {floorNum}층 좌석 배치도
          </h1>
        </div>

        <div className="grid grid-cols-10 gap-4 p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
          {seats.map((seat) => (
            <button
              key={seat.id}
              onClick={() => seat.status === 'available' && handleSeatClick(seat.id)}
              disabled={seat.status !== 'available'}
              className={`aspect-square rounded-lg border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-sm font-medium transition-colors ${getSeatColor(seat.status)} ${
                seat.status === 'available' ? 'hover:bg-blue-100 dark:hover:bg-blue-800 cursor-pointer' : 'cursor-not-allowed'
              }`}
            >
              {seat.row}{seat.column}
            </button>
          ))}
        </div>

        <div className="mt-6 flex space-x-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded mr-2"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">빈 좌석</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-200 dark:bg-green-700 rounded mr-2"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">예약됨</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-200 dark:bg-red-700 rounded mr-2"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">사용 중</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-200 dark:bg-yellow-700 rounded mr-2"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">곧 만료</span>
          </div>
        </div>
      </div>

      {showQR && qrToken && selectedSeat && (
        <QRCodeModal
          token={qrToken}
          seatId={selectedSeat}
          onClose={() => {
            setShowQR(false);
            setQrToken(null);
            setSelectedSeat(null);
          }}
        />
      )}
    </div>
  );
};

export default Floor;