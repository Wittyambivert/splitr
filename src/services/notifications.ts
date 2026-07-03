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
