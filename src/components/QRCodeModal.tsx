import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface QRCodeModalProps {
  token: string;
  seatId: string;
  onClose: () => void;
}

const QRCodeModal = ({ token, seatId, onClose }: QRCodeModalProps) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    console.log('QR 코드 생성 시작 (간단한 방식):', { token: token.substring(0, 20) + '...' });

    const generateSimpleQR = async () => {
      try {
        // QRCode.js를 동적으로 import
        const QRCodeLib = await import('qrcode');
        
        // QR 코드를 Data URL로 생성
        const dataUrl = await QRCodeLib.default.toDataURL(token, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
        
        console.log('QR 코드 생성 완료');
        setQrDataUrl(dataUrl);
        setIsLoading(false);
      } catch (error) {
        console.error('QR 코드 생성 에러:', error);
        // fallback: 텍스트로 토큰 표시
        setIsLoading(false);
      }
    };

    generateSimpleQR();
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
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">QR 코드 생성 중...</p>
                </div>
              </div>
            ) : qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt="QR Code" 
                className="w-[300px] h-[300px] border-2 border-gray-200 dark:border-gray-600 rounded"
              />
            ) : (
              <div className="w-[300px] h-[300px] flex items-center justify-center border-2 border-gray-200 dark:border-gray-600 rounded bg-white">
                <div className="text-center p-4">
                  <p className="text-sm font-mono break-all text-gray-800 mb-2">토큰:</p>
                  <p className="text-xs font-mono break-all text-gray-600">{token}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          {isLoading ? '잠시만 기다려주세요...' : qrDataUrl ? 'QR 코드를 스캔하세요' : '토큰을 직접 입력하세요'}
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