import { useState } from 'react';
import { useSeats } from '../hooks/useSeats';
import { useAuth } from '../hooks/useAuth';

interface CheckinModalProps {
  seatId: string;
  reservedBy: string;
  oneTimeToken: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CheckinModal = ({ seatId, reservedBy, oneTimeToken, onClose, onSuccess }: CheckinModalProps) => {
  const { user } = useAuth();
  const { occupySeat } = useSeats(1); // floor는 임시
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!user || user.uid !== reservedBy) {
      alert('본인 확인 실패');
      return;
    }

    setLoading(true);
    try {
      await occupySeat(seatId, user.uid, oneTimeToken);
      onSuccess();
    } catch (error) {
      alert('입실 확인 실패: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          입실 확인
        </h3>

        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            좌석: {seatId}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            QR 코드 스캔이 완료되었습니다. 본인 확인을 위해 버튼을 눌러주세요.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '확인 중...' : '본인 확인'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckinModal;