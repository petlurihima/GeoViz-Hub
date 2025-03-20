const PUBLIC_VAPID_KEY = process.env.REACT_APP_PUBLIC_KEY;

export const askNotificationPermission = async (setIsSubscribed: (value: boolean) => void) => {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: PUBLIC_VAPID_KEY,
  });

  await fetch("http://localhost:5000/api/subscribe", {
    method: "POST",
    body: JSON.stringify(subscription),
    headers: { "Content-Type": "application/json" },
  });

  setIsSubscribed(true);
};