// Native daily-challenge reminder via Capacitor Local Notifications.
//
// This is native-only glue (iOS/Android app shell). On the web build
// `Capacitor.isNativePlatform()` is false and every function here is a safe
// no-op, so the desktop/mobile-web experience is completely unaffected — the
// menu toggle simply does nothing until the app runs inside the native wrap.
//
// The reminder is a *local* notification scheduled on-device (no backend, no
// push server): a single repeating notification at a fixed time of day that
// nudges the player to keep their daily-challenge streak alive.

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

/** Stable id so re-scheduling replaces rather than stacks the reminder. */
const DAILY_REMINDER_ID = 1;

/** Default fire time: 9:00 local. */
const DEFAULT_HOUR = 9;
const DEFAULT_MINUTE = 0;

/** True only inside the native app shell; false on web. */
export function notificationsSupported(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Ask the OS for permission to post notifications. Returns true if granted.
 * No-op (false) on web.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  const res = await LocalNotifications.requestPermissions();
  return res.display === 'granted';
}

/**
 * Schedule (or replace) the repeating daily reminder. Requests permission
 * first; returns false if unsupported or permission denied.
 */
export async function scheduleDailyReminder(
  hour = DEFAULT_HOUR,
  minute = DEFAULT_MINUTE,
): Promise<boolean> {
  if (!notificationsSupported()) return false;
  const perm = await LocalNotifications.requestPermissions();
  if (perm.display !== 'granted') return false;

  // Clear any prior copy so toggling never stacks duplicates.
  await cancelDailyReminder();
  await LocalNotifications.schedule({
    notifications: [
      {
        id: DAILY_REMINDER_ID,
        title: 'Dope Wars 98',
        body: "Today's daily challenge is live — keep your streak going.",
        // `on` with hour/minute (no day) repeats every day at that time.
        schedule: { on: { hour, minute }, allowWhileIdle: true },
      },
    ],
  });
  return true;
}

/** Cancel the daily reminder if one is scheduled. No-op on web. */
export async function cancelDailyReminder(): Promise<void> {
  if (!notificationsSupported()) return;
  await LocalNotifications.cancel({
    notifications: [{ id: DAILY_REMINDER_ID }],
  });
}

/** Whether the daily reminder is currently pending. False on web. */
export async function isDailyReminderScheduled(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  const pending = await LocalNotifications.getPending();
  return pending.notifications.some((n) => n.id === DAILY_REMINDER_ID);
}
