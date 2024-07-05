export const OPENAI_ENDPOINT = 'https://ec2-47-129-6-189.ap-southeast-1.compute.amazonaws.com/api';
// export const OPENAI_ENDPOINT = 'http://localhost:9000/api';
// export const OPENAI_ENDPOINT = 'http://47.129.6.189:5000/api';
// export const OPENAI_ENDPOINT = 'https://api.openai.com';
export const AUTH_ENDPOINT = `${OPENAI_ENDPOINT}/v1/auth`;
export const TTS_ENDPOINT = `${OPENAI_ENDPOINT}/v1/audio/speech`;
export const CHAT_COMPLETIONS_ENDPOINT = `${OPENAI_ENDPOINT}/v1/chat/completions`;
export const MODELS_ENDPOINT = `${OPENAI_ENDPOINT}/v1/models`;
