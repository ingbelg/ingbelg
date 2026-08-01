/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly RESEND_API_KEY?: string;
  readonly CONTACT_NOTIFY_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
