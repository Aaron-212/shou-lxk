import { env } from "cloudflare:workers";

// Adapter 8 exposes bindings through cloudflare:workers. Older adapters and
// callers may still supply bindings through event.platform.
export const getBindings = (platform: App.Platform | undefined): App.Platform["env"] =>
  platform?.env ?? (env as App.Platform["env"]);
