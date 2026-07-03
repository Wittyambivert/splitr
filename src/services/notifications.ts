import { Platform } from 'react-native';

export async function registerForPushNotifications(): Promise<string | null> {
  const { getExpoPushTokenAsync, requestPermissionsAsync, getPermissionsAsync } = await import('expo-notifications');

  const existingStatus = (await getPermissionsAsync()).status;
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  const tokenData = await getExpoPushTokenAsync({
    projectId: process.env.EXPO_PUBLIC_EXPO_PROJECT_ID,
  });

  return tokenData.data;
}

export async function sendPaymentReminder(
  pushToken: string,
  debtorName: string,
  amount: string,
  groupName: string,
): Promise<void> {
  const message = {
    to: pushToken,
    sound: 'default' as const,
    title: 'Payment Reminder',
    body: `${debtorName} owes you ${amount} for ${groupName}`,
    data: { type: 'payment_reminder' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}
