import { useEffect, useState } from 'react';
import type { Seat } from '../types';

export const useSeats = (floor: number) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!floor) return;

    // Mock 좌석 데이터 생성
    const generateSeats = () => {
      const seatData: Seat[] = [];
      const rows = ['A', 'B', 'C', 'D', 'E'];
      
      rows.forEach(row => {
        for (let col = 1; col <= 20; col++) {
          const seatNumber = col.toString().padStart(2, '0');
          seatData.push({
            id: `${floor}F-${row}${seatNumber}`,
            floor,
            row,
            column: col,
            status: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'reserved' : 'occupied') : 'available',
          });
        }
      });
      return seatData;
    };

    // 실제 데이터 로딩 시뮬레이션
    const loadData = async () => {
      const data = generateSeats();
      setSeats(data);
      setLoading(false);
    };

    loadData();
  }, [floor]);

  const reserveSeat = async (seatId: string, userId: string) => {
    // seatId를 seatNumber와 floorId로 분리
    const [floorId, seatNumber] = seatId.split('-');
    
    // QR 생성 API 호출 (simple 버전)
    const response = await fetch('/api/generate-qr-simple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seatNumber, floorId, userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate QR');
    }

    const { token } = await response.json();
    console.log('QR 생성 성공:', { seatId, token: token.substring(0, 20) + '...' });
    return token;
  };

  const occupySeat = async (seatId: string, userId: string, oneTimeToken: string) => {
    const response = await fetch('/api/occupy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seatId, userId, oneTimeToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to occupy seat');
    }
  };

  const leaveSeat = async (seatId: string) => {
    // 로컬 상태에서 좌석 상태 업데이트 (실제로는 API 호출해야 함)
    setSeats(currentSeats => 
      currentSeats.map(seat => 
        seat.id === seatId 
          ? { ...seat, status: 'available' as const }
          : seat
      )
    );
  };

  return {
    seats,
    loading,
    reserveSeat,
    occupySeat,
    leaveSeat,
  };
};