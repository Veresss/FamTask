// Sound generator using Web Audio API for a crisp, friendly chime
export function playChimeSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.2); // D6

    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  } catch {
    // Audio might fail if user hasn't interacted yet
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return 'denied';
  }
}

export function sendBrowserNotification(title: string, options?: NotificationOptions): boolean {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: 'https://api.iconify.design/lucide:check-circle-2.svg?color=%234f46e5',
        badge: 'https://api.iconify.design/lucide:home.svg?color=%234f46e5',
        ...options,
      });
      playChimeSound();
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
