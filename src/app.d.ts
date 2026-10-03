/// <reference types="@cloudflare/workers-types" />

declare global {
  namespace App {
    interface PageState {
      detailFromApp?: boolean;
    }

    interface Platform {
      env: {
        DB: D1Database;
        MAINTENANCE_MODE?: string;
        TURNSTILE_SITE_KEY?: string;
        TURNSTILE_SECRET_KEY?: string;
      };
    }
  }
}

export {};
