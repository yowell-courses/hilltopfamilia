/**
 * The site on Cloudflare: dist/ as static assets, and this Worker in front of the few paths site.ts answers (the
 * preview cards, and a page asked for with ?c=). The cards live in the shortener's D1 database (tinier/migrations/),
 * read and written through tinier/d1.ts; what is read is kept at the edge (caches.default).
 */
import { brakeKey } from '../tinier/brake.ts';
import { D1Store } from '../tinier/d1.ts';
import { handleDraft, type Ai } from './draft.ts';
import { handleSite } from './site.ts';

declare global {
  interface Env {
    /**
     * The secret the daily counts of cards are kept under: `wrangler secret put BRAKE_KEY` in production (the site's
     * own, beside the shortener's), .dev.vars on this machine. Never in the repo; brakeKey() refuses without it.
     */
    BRAKE_KEY: string;
    /** Workers AI (wrangler.jsonc "ai"): the optional drafting assistant of /studio (site/draft.ts). */
    AI?: Ai;
    /** Optional secret: `wrangler secret put GEMINI_API_KEY`; when set, /studio drafts with Gemini instead of Workers AI. */
    GEMINI_API_KEY?: string;
    /** Optional: a different Workers AI model than site/draft.ts MODEL. */
    DRAFT_MODEL?: string;
    /** Rate limit for /api/draft (wrangler.jsonc "ratelimits"). */
    DRAFT_LIMIT?: { limit(options: { key: string }): Promise<{ success: boolean }> };
  }
}

export default {
  async fetch(req, env) {
    if (new URL(req.url).pathname === '/api/draft') {
      if (env.DRAFT_LIMIT && req.method === 'POST') {
        const { success } = await env.DRAFT_LIMIT.limit({ key: req.headers.get('cf-connecting-ip') ?? 'unknown' });
        if (!success) return Response.json({ error: 'Too many requests. Please wait a minute and try again.' }, { status: 429 });
      }
      return handleDraft(req, { ai: env.AI, geminiKey: env.GEMINI_API_KEY, model: env.DRAFT_MODEL });
    }
    return handleSite(req, {
      assets: env.ASSETS,
      store: new D1Store(env.DB),
      key: brakeKey(env.BRAKE_KEY, 'wrangler.jsonc', '.dev.vars', 'npm run site:dev'),
      edge: caches.default,
      now: Date.now(),
    });
  },
} satisfies ExportedHandler<Env>;
