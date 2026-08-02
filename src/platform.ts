import { Capacitor } from '@capacitor/core';

/** True only inside the native app shell (iOS/Android); false on the web build. */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}
