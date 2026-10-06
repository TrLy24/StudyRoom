import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiCancelBooking, apiCreateBooking, apiFetchBookings } from './mockServer';
import { cancelBookingReminder } from '../notifications';

export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: apiFetchBookings,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: apiCreateBooking,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: apiCancelBooking,
    onSuccess: async (notificationId) => {
      if (notificationId) {
        try {
          await cancelBookingReminder(notificationId);
        } catch {
          // Bỏ qua lỗi hủy notification
        }
      }
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}