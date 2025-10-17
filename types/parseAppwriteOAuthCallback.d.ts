export type OAuthParseResult =
  | { type: 'success'; userId?: string; secret?: string }
  | { type: 'cancel' }
  | { type: 'ignore' };

export function parseAppwriteOAuthCallback(url: string): OAuthParseResult;
