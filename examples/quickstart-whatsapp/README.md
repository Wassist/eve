# quickstart-whatsapp

A minimal [Vercel eve](https://github.com/vercel/eve) agent that answers WhatsApp via [`@wassist/eve`](https://www.npmjs.com/package/@wassist/eve).

The whole thing is four files:

```
agent/
├── agent.ts                    # model config
├── instructions.md             # system prompt
└── channels/
    └── whatsapp.ts             # the @wassist/eve channel
```

## One-click deploy

### Before you click Deploy

Vercel will prompt you for two environment variables at clone time, so grab them from [wassist.app](https://wassist.app) first:

1. **`WASSIST_API_KEY`** — **Settings → API keys** → **Create API key** → copy the value.
2. **`WASSIST_WEBHOOK_SECRET`** — **Settings → Webhooks** → **Create webhook**. The signing secret is generated when you create the webhook, so you need to create one even though your agent isn't deployed yet. Use a placeholder URL like `https://placeholder.example.com/eve/v1/wassist` — you'll update it post-deploy in the [next section](#after-deploying). Copy the signing secret that's generated.

### Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FWassist%2Feve&root-directory=examples%2Fquickstart-whatsapp&project-name=wassist-eve-quickstart&env=WASSIST_API_KEY,WASSIST_WEBHOOK_SECRET)

| Variable | Source |
|---|---|
| `WASSIST_API_KEY` | from step 1 above |
| `WASSIST_WEBHOOK_SECRET` | from step 2 above |

## After deploying

1. Copy your deployment URL — e.g. `https://wassist-eve-quickstart.vercel.app`.
2. Open the **dummy webhook you created earlier** in the [Wassist dashboard](https://wassist.app) under **Settings → Webhooks** and replace the placeholder URL with your real deployment:

   ```
   https://<your-deployment>.vercel.app/eve/v1/wassist
   ```

   Don't regenerate the signing secret — keep using the one you set as `WASSIST_WEBHOOK_SECRET` during deploy.
3. Send a WhatsApp message to your connected Wassist number. The agent replies.

## Running locally

```bash
git clone https://github.com/Wassist/eve.git
cd eve/examples/quickstart-whatsapp
cp .env.example .env.local
# Fill in WASSIST_API_KEY, WASSIST_WEBHOOK_SECRET, ANTHROPIC_API_KEY
npm install
npm run dev
```

Then expose port 3000 via [ngrok](https://ngrok.com) (or [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)) and register the public URL with `/eve/v1/wassist` appended in the Wassist dashboard:

```bash
ngrok http 3000
# Copy the https://<id>.ngrok.app URL, then in Wassist set:
# Webhook URL: https://<id>.ngrok.app/eve/v1/wassist
```

## Customising

- **System prompt:** edit [`agent/instructions.md`](agent/instructions.md).
- **Model:** edit [`agent/agent.ts`](agent/agent.ts) — eve supports any model the framework can resolve (`anthropic/...`, `openai/...`, etc.). Update your env vars to match.
- **Add tools:** drop typed functions into `agent/tools/` per the [eve docs](https://github.com/vercel/eve).
- **Channel options:** see the [`@wassist/eve` configuration reference](../../README.md#configuration) — e.g. override `route` or `baseUrl`.

## Links

- [`@wassist/eve` on npm](https://www.npmjs.com/package/@wassist/eve)
- [Wassist docs](https://docs.wassist.app)
- [Vercel eve docs](https://github.com/vercel/eve)
