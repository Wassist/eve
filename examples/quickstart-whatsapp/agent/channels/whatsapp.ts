import { wassistChannel } from "@wassist/eve";

export default wassistChannel({
  credentials: {
    apiKey: process.env.WASSIST_API_KEY!,
    webhookSecret: process.env.WASSIST_WEBHOOK_SECRET!,
  },
});
