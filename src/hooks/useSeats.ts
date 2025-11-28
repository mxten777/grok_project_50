import { useEffect } from 'react';
import { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useSeatsStore } from '../store/seats';
import type { Seat } from '../types';

export const useSeats = (floor: number) => {
  const { seats, loading, setSeats, setLoading } = useSeatsStore();

  useEffect(() => {
    if (!floor) return;

    setLoading(true);

    const q = query(collection(db, 'seats'), where('floor', '==', floor));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const seatsData: Seat[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Seat[];

      setSeats(floor, seatsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [floor, setSeats, setLoading]);

  const reserveSeat = async (seatId: string, userId: string) => {
    // QR 생성 API 호출
    const response = await fetch('/api/generate-qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seatId, userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate QR');
    }

    const { token } = await response.json();
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
    await updateDoc(doc(db, 'seats', seatId), {
      status: 'available',
      occupiedBy: null,
      occupiedAt: null,
      reservedBy: null,
      reservedAt: null,
      expiresAt: null,
    });
  };

  return {
    seats: seats[floor] || [],
    loading,
    reserveSeat,
    occupySeat,
    leaveSeat,
  };
};