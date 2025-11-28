import { format, formatDistanceToNow, isAfter, addMinutes } from 'date-fns';

// 날짜 포맷팅 유틸리티
export const formatDate = (date: Date | number) => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm:ss');
};

export const formatRelativeTime = (date: Date | number) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// 시간 비교 유틸리티
export const isExpired = (date: Date | number) => {
  return isAfter(new Date(), new Date(date));
};

// 패널티 시간 계산 (10분 후)
export const getPenaltyUntil = (from: Date = new Date()) => {
  return addMinutes(from, 10);
};