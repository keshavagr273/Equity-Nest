// L-2 FIX: Removed the `@ts-ignore` suppression. URLSearchParams requires
// Record<string, string>, but process.env values are string | undefined.
// The fix is to provide explicit string fallbacks so the type is always string.
export const getGoogleOAuthURL = () => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

  const options: Record<string, string> = {
    redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ?? '',
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };

  const qs = new URLSearchParams(options);

  return `${rootUrl}?${qs.toString()}`;
};
