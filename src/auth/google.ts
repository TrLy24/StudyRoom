import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Alert } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

// ─── CẤU HÌNH GOOGLE OAUTH ────────────────────────────────────────────────────
//
// Bước 1: Truy cập https://console.cloud.google.com/
// Bước 2: Tạo project → APIs & Services → Credentials → Create OAuth 2.0 Client ID
// Bước 3: Tạo 3 Client ID:
//   - Android (package: com.yourcompany.studyroom)
//   - iOS (bundle: com.yourcompany.studyroom)
//   - Web (thêm redirect URI: https://auth.expo.io/@your-username/StudyRoom)
// Bước 4: Điền vào bên dưới:
//
const ANDROID_CLIENT_ID = '';   // e.g. '123456789-xxxx.apps.googleusercontent.com'
const IOS_CLIENT_ID     = '';   // e.g. '123456789-yyyy.apps.googleusercontent.com'
const WEB_CLIENT_ID     = '';   // e.g. '123456789-zzzz.apps.googleusercontent.com'
// ──────────────────────────────────────────────────────────────────────────────

export const IS_GOOGLE_CONFIGURED =
  ANDROID_CLIENT_ID.trim() !== '' && IOS_CLIENT_ID.trim() !== '' && WEB_CLIENT_ID.trim() !== '';

export function useGoogleAuth() {
  return Google.useAuthRequest({
    androidClientId: IS_GOOGLE_CONFIGURED ? ANDROID_CLIENT_ID : 'studyroom-placeholder.apps.googleusercontent.com',
    iosClientId: IS_GOOGLE_CONFIGURED ? IOS_CLIENT_ID : 'studyroom-placeholder.apps.googleusercontent.com',
    webClientId: IS_GOOGLE_CONFIGURED ? WEB_CLIENT_ID : 'studyroom-placeholder.apps.googleusercontent.com',
    redirectUri: makeRedirectUri({ scheme: 'studyroom', path: 'redirect' }),
  });
}

export function showGoogleSetupAlert() {
  Alert.alert(
    '⚙️ Cần cấu hình Google OAuth',
    'Để đăng nhập bằng Google, bạn cần:\n\n' +
      '1. Tạo project trên Google Cloud Console\n' +
      '2. Bật Google+ API / People API\n' +
      '3. Tạo OAuth 2.0 Client IDs\n' +
      '4. Điền Client IDs vào file src/auth/google.ts\n\n' +
      'Trong lúc đó, hãy dùng tài khoản Demo bên dưới.',
    [{ text: 'Đã hiểu', style: 'default' }]
  );
}

export interface GoogleProfile {
  id: string;
  name: string;
  email: string;
  picture: string;
  given_name?: string;
  family_name?: string;
}

export async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile> {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch Google profile');
  return res.json();
}
