import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleBookingReminder(input: {
  bookingId: string;
  roomName: string;
  date: string;
  slot: string;
  minutesBefore?: number;
}): Promise<string | null> {
  const minutesBefore = input.minutesBefore ?? 15;
  const startTime = input.slot.split('-')[0];
  const [hour, minute] = startTime.split(':').map(Number);
  const [y, m, d] = input.date.split('-').map(Number);

  const target = new Date(y, m - 1, d, hour, minute);
  target.setMinutes(target.getMinutes() - minutesBefore);

  if (target.getTime() <= Date.now()) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Sắp đến giờ đặt phòng',
      body: `${input.roomName} • ${startTime} còn ${minutesBefore} phút nữa bắt đầu`,
      data: { bookingId: input.bookingId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: target,
    },
  });
  return id;
}

export async function cancelBookingReminder(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export function getAndroidChannel() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}