// Utility to parse Appwrite OAuth callback deep links
// Supports formats like:
// movieflix://auth-success?userId=xxx&secret=yyy
// movieflix://auth-cancel

export type OAuthParseResult =
  | { type: 'success'; userId?: string; secret?: string }
  | { type: 'cancel' }
  | { type: 'ignore' };

export function parseAppwriteOAuthCallback(url: string): OAuthParseResult {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname || parsed.host;
    const path = parsed.pathname?.replace(/^\/+/, ''); // remove leading slashes

    if (host === 'auth-success' || path === 'auth-success') {
      const userId = parsed.searchParams.get('userId') || undefined;
      const secret = parsed.searchParams.get('secret') || undefined;
      return { type: 'success', userId, secret };
    }

    if (host === 'auth-cancel' || path === 'auth-cancel') {
      return { type: 'cancel' };
    }
  } catch (e) {
    // Fallback: best-effort parse for non-standard URLs
    if (url.startsWith('movieflix://auth-success')) {
      const qs = url.split('?')[1] || '';
      const params = new URLSearchParams(qs);
      const userId = params.get('userId') || undefined;
      const secret = params.get('secret') || undefined;
      return { type: 'success', userId, secret };
    }
    if (url.startsWith('movieflix://auth-cancel')) {
      return { type: 'cancel' };
    }
  }
  return { type: 'ignore' };
}
