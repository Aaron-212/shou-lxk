import { env } from "cloudflare:workers";
import type { Handle } from "@sveltejs/kit/hooks";

// Adapter 8 exposes bindings through cloudflare:workers instead of event.platform.
// Keep the existing loaders and review actions on the same binding interface.
export const handle: Handle = ({ event, resolve }) => {
  event.platform ??= { env: env as App.Platform["env"] };
  return resolve(event);
};
