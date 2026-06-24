/**
 * `@wassist/eve` — the Wassist channel for [Vercel eve](https://github.com/vercel/eve).
 *
 * Drop this into your eve agent's `channels/` directory and your agent answers
 * WhatsApp via the Wassist platform.
 *
 * @example
 * ```ts
 * // agent/channels/whatsapp.ts
 * import { wassistChannel } from "@wassist/eve";
 *
 * export default wassistChannel({
 *   credentials: {
 *     apiKey: process.env.WASSIST_API_KEY!,
 *     webhookSecret: process.env.WASSIST_WEBHOOK_SECRET!,
 *   },
 * });
 * ```
 */

import { defineChannel, POST } from "eve/channels";
import { Wassist, type WassistEvent } from "@wassist/sdk";

/**
 * Credentials issued by the Wassist dashboard.
 *
 * Both values are available at https://wassist.app under **Settings**:
 * - `apiKey`        → Settings → API keys
 * - `webhookSecret` → Settings → Webhooks → Signing secret
 */
export interface WassistChannelCredentials {
  readonly apiKey: string;
  readonly webhookSecret: string;
}

/** Configuration for {@link wassistChannel}. */
export interface WassistChannelConfig {
  /**
   * Wassist API key + webhook signing secret. If omitted, the channel falls
   * back to `process.env.WASSIST_API_KEY` and `process.env.WASSIST_WEBHOOK_SECRET`
   * and throws a descriptive error if either is missing.
   */
  readonly credentials?: Partial<WassistChannelCredentials>;
  /**
   * The HTTP path the channel listens on. Whatever you set here must be the
   * webhook URL you register in the Wassist dashboard, e.g.
   * `https://my-agent.vercel.app/eve/v1/wassist`.
   *
   * @default "/eve/v1/wassist"
   */
  readonly route?: string;
  /**
   * Override the Wassist API base URL. Only needed for self-hosted Wassist
   * deployments or local development against a non-prod backend.
   *
   * @default "https://backend.wassist.app"
   */
  readonly baseUrl?: string;
}

function resolveCredentials(
  config: WassistChannelConfig,
): WassistChannelCredentials {
  const apiKey = config.credentials?.apiKey ?? process.env.WASSIST_API_KEY;
  const webhookSecret =
    config.credentials?.webhookSecret ?? process.env.WASSIST_WEBHOOK_SECRET;

  if (!apiKey) {
    throw new Error(
      "[@wassist/eve] Missing Wassist API key. Pass `credentials.apiKey` to " +
        "`wassistChannel({ ... })` or set `WASSIST_API_KEY` in your environment. " +
        "Get one at https://wassist.app → Settings → API keys.",
    );
  }
  if (!webhookSecret) {
    throw new Error(
      "[@wassist/eve] Missing Wassist webhook secret. Pass " +
        "`credentials.webhookSecret` to `wassistChannel({ ... })` or set " +
        "`WASSIST_WEBHOOK_SECRET` in your environment. " +
        "Get one at https://wassist.app → Settings → Webhooks.",
    );
  }

  return { apiKey, webhookSecret };
}

/**
 * Create a Wassist channel for an eve agent.
 *
 * Mounts a `POST <route>` endpoint that receives signed Wassist webhooks,
 * dispatches inbound user messages into the eve runtime, and ships the
 * agent's reply back to the user over WhatsApp.
 *
 * @param config - Credentials and routing overrides. See {@link WassistChannelConfig}.
 * @returns An eve channel definition. `export default` it from your
 *   `agent/channels/<name>.ts` file.
 */
export function wassistChannel(config: WassistChannelConfig = {}) {
  const route = config.route ?? "/eve/v1/wassist";
  const { apiKey, webhookSecret } = resolveCredentials(config);

  const wassist = new Wassist({
    apiKey,
    ...(config.baseUrl ? { baseUrl: config.baseUrl } : {}),
  });

  return defineChannel({
    kindHint: "wassist",
    routes: [
      POST(route, async (req, { send }) => {
        const signature = req.headers.get("X-Wassist-Signature");
        if (!signature) {
          return new Response("Missing X-Wassist-Signature header", {
            status: 400,
          });
        }

        const rawBody = await req.text();
        let event: WassistEvent;
        try {
          event = await wassist.webhooks.constructEventAsync(
            rawBody,
            signature,
            webhookSecret,
          );
        } catch (err) {
          return new Response(
            `Invalid Wassist webhook signature: ${(err as Error).message}`,
            { status: 400 },
          );
        }

        if (event.event === "message.received") {
          send(event.message.body, {
            continuationToken: event.conversationId,
            auth: null,
          });
        }

        return Response.json({ ok: true });
      }),
    ],
    events: {
      async "message.completed"(event, channel) {
        const conversationId = channel.continuationToken.split(":").pop();
        if (!conversationId) return;

        await wassist.conversations.messages.send(conversationId, {
          type: "unified",
          unified: {
            text: event.message ?? "",
          },
        });
      },
      async "turn.started"(_event, channel) {
        const conversationId = channel.continuationToken.split(":").pop();
        if (!conversationId) return;

        await wassist.conversations.typing(conversationId);
      },
    },
  });
}
