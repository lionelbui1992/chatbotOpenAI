import env from './local.env.json';

export const OPENAI_API_KEY = (env as any).openapi_key;
export const OPENAI_DEFAULT_MODEL: string = (env as any).default_model;
export const OPENAI_DEFAULT_SYSTEM_PROMPT: string = (env as any).default_system_prompt;
export const GOOGLE_CLIENT_ID: string = (env as any).google_client_id;
export const GOOGLE_DEVELOPER_KEY: string = (env as any).google_developer_key;