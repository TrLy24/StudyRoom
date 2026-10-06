import { getDb } from './db';
import { Booking } from '../types';

const NETWORK_DELAY = 300; // giả lập độ trễ mạng như gọi API thật

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export type BookResult =
  | { ok: true; booking: Booking }
  | { ok: false; reason: 'SLOT_TAKEN' | 'USER_OVERLAP'; message: string };

export async function apiFetchBookings(): Promise<Booking[]> {
  const db = await getDb();
  await delay(NETWORK_DELAY);
  return db.getAllAsync<Booking>('SELECT * FROM bookings ORDER BY createdAt ASC');
}

export async function apiCreateBooking(input: {
  roomId: string;
  date: string;
  slot: string;
  userId: string;
  notificationId?: string | null;
}): Promise<BookResult> {
  const db = await getDb();

  // Luật 1: một người không thể ở 2 phòng cùng lúc
  const overlap = await db.getFirstAsync<Booking>(
    'SELECT * FROM bookings WHERE userId = ? AND date = ? AND slot = ?',
    [input.userId, input.date, input.slot]
  );
  if (overlap) {
    await delay(NETWORK_DELAY);
    return {
      ok: false,
      reason: 'USER_OVERLAP',
      message: 'Bạn đã có phòng khác trong khung giờ này.',
    };
  }

  const booking: Booking = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    roomId: input.roomId,
    date: input.date,
    slot: input.slot,
    userId: input.userId,
    createdAt: Date.now(),
    notificationId: input.notificationId ?? undefined,
  };

  try {
    // Luật 2: chống trùng khung giờ — nhờ UNIQUE(roomId, date, slot),
    // nếu có 2 lệnh INSERT cùng phòng-ngày-giờ, chỉ 1 cái thành công,
    // cái còn lại sẽ NÉM LỖI ngay tại database, không cần "khoá" tay trong code.
    await db.runAsync(
      'INSERT INTO bookings (id, roomId, date, slot, userId, createdAt, notificationId) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [booking.id, booking.roomId, booking.date, booking.slot, booking.userId, booking.createdAt, booking.notificationId ?? null]
    );
  } catch {
    await delay(NETWORK_DELAY);
    const taken = await db.getFirstAsync<Booking>(
      'SELECT * FROM bookings WHERE roomId = ? AND date = ? AND slot = ?',
      [input.roomId, input.date, input.slot]
    );
    return {
      ok: false,
      reason: 'SLOT_TAKEN',
      message:
        taken?.userId === input.userId
          ? 'Bạn đã đặt khung giờ này rồi.'
          : 'Rất tiếc, có người đã đặt khung giờ này trước bạn.',
    };
  }

  await delay(NETWORK_DELAY);
  return { ok: true, booking };
}

export async function apiCancelBooking(bookingId: string): Promise<string | undefined> {
  const db = await getDb();
  const row = await db.getFirstAsync<Booking>('SELECT * FROM bookings WHERE id = ?', [bookingId]);
  await db.runAsync('DELETE FROM bookings WHERE id = ?', [bookingId]);
  await delay(NETWORK_DELAY);
  return row?.notificationId ?? undefined;
}