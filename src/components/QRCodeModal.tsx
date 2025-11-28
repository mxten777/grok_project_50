import { useEffect, useRef, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { X, RefreshCw } from 'lucide-react';

interface QRCodeModalProps {
  token: string;
  seatId: string;
  onClose: () => void;
}

const QRCodeModal = ({ token, seatId, onClose }: QRCodeModalProps) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    if (!qrRef.current) return;

    // QR 코드 생성
    qrCode.current = new QRCodeStyling({
      width: 300,
      height: 300,
      data: token,
      image: '/library-logo.png', // 로고 이미지 (public 폴더에 추가 필요)
      dotsOptions: {
        color: '#000000',
        type: 'rounded',
      },
      backgroundOptions: {
        color: '#ffffff',
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 10,
      },
      qrOptions: {
        errorCorrectionLevel: 'H',
      },
    });

    qrCode.current.append(qrRef.current);

    // 3초마다 QR 새로고침 (움직이는 효과)
    const interval = setInterval(() => {
      setRefreshCount(prev => prev + 1);
      if (qrCode.current) {
        qrCode.current.update({
          data: token + `?refresh=${Date.now()}`, // 약간 변경해서 새로고침
        });
      }
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [token, refreshCount]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            좌석 예약 QR 코드
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            좌석: {seatId}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            스마트폰으로 QR을 스캔하여 입실하세요
          </p>
        </div>

        <div className="flex justify-center mb-4">
          <div ref={qrRef} className="border-2 border-gray-200 dark:border-gray-600 rounded"></div>
        </div>

        <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <RefreshCw size={16} className="mr-2 animate-spin" />
          QR 코드가 자동으로 새로고침됩니다
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          * QR 코드는 2시간 동안 유효합니다<br/>
          * 10분 이내에 입실하지 않으면 예약이 취소됩니다
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;