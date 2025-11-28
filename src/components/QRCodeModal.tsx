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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    console.log('QR 코드 생성 시작:', { token: token.substring(0, 20) + '...' });

    // DOM이 준비될 때까지 잠시 대기
    const timer = setTimeout(async () => {
      if (!qrRef.current) {
        console.error('QR ref가 준비되지 않음');
        setIsLoading(false);
        return;
      }

      try {
        // 기존 QR 코드 제거
        if (qrCode.current) {
          qrRef.current.innerHTML = '';
        }

        // QR 코드 생성
        qrCode.current = new QRCodeStyling({
          width: 280,
          height: 280,
          data: token,
          dotsOptions: {
            color: '#000000',
            type: 'square',
          },
          backgroundOptions: {
            color: '#ffffff',
          },
          qrOptions: {
            errorCorrectionLevel: 'L', // 더 단순하게
          },
        });

        console.log('QR 코드 객체 생성 완료');
        
        // QR 코드를 DOM에 추가하고 로딩 완료
        await qrCode.current.append(qrRef.current);
        console.log('QR 코드 DOM에 추가 완료');
        setIsLoading(false);

      } catch (error) {
        console.error('QR 코드 생성 에러:', error);
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [token]);

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
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            {isLoading ? (
              <div className="w-[300px] h-[300px] flex items-center justify-center">
                <RefreshCw size={48} className="animate-spin text-gray-400" />
              </div>
            ) : (
              <div ref={qrRef} className="border-2 border-gray-200 dark:border-gray-600 rounded"></div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <RefreshCw size={16} className="mr-2 animate-spin" />
          {isLoading ? 'QR 코드 생성 중...' : 'QR 코드가 자동으로 새로고침됩니다'}
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