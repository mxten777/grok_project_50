import { create } from 'zustand';
import type { Seat } from '../types';

interface SeatsState {
  seats: Record<string, Seat[]>; // floor -> seats
  loading: boolean;
  setSeats: (floor: number, seats: Seat[]) => void;
  updateSeat: (floor: number, seatId: string, updates: Partial<Seat>) => void;
  setLoading: (loading: boolean) => void;
}

export const useSeatsStore = create<SeatsState>((set) => ({
  seats: {},
  loading: false,
  setSeats: (floor, seats) => set((state) => ({
    seats: { ...state.seats, [floor]: seats },
  })),
  updateSeat: (floor, seatId, updates) => set((state) => {
    const floorSeats = state.seats[floor];
    if (!floorSeats) return state;

    const updatedSeats = floorSeats.map(seat =>
      seat.id === seatId ? { ...seat, ...updates } : seat
    );

    return {
      seats: { ...state.seats, [floor]: updatedSeats },
    };
  }),
  setLoading: (loading) => set({ loading }),
}));