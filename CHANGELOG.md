# Changelog

## 0.1.0

Initial release.

- `wassistChannel(config)` — the Wassist channel factory for [Vercel eve](https://github.com/vercel/eve). Drop it into `agent/channels/whatsapp.ts` (or any name you like) and your eve agent answers WhatsApp.
- Verifies inbound webhooks via `wassist.webhooks.constructEventAsync` (Stripe-style HMAC-SHA256, Web Crypto — works on Node, Vercel Edge, Cloudflare Workers, Deno).
- Dispatches `message.received` events into the eve runtime, keyed by Wassist conversation ID as the eve continuation token.
- Sends agent replies back over WhatsApp on `message.completed`.
- Triggers WhatsApp typing indicators on `turn.started`.
- Configurable `route` (default `/eve/v1/wassist`), `baseUrl`, and `credentials`. Falls back to `WASSIST_API_KEY` / `WASSIST_WEBHOOK_SECRET` env vars with descriptive errors if both are missing.
- Runnable [`examples/quickstart-whatsapp`](./examples/quickstart-whatsapp) — minimal eve agent with a Deploy-to-Vercel button.
