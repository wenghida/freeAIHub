// 文生文模型选项
export const TEXT_TO_TEXT_MODELS = [
  "gpt-5-nano",
  "llama-fast-roblox",
  "llama-roblox",
  "llamascout",
  "mistral",
  "mistral-nemo-roblox",
  "mistral-roblox",
  "nova-fast",
  "openai",
  "openai-fast",
  "openai-roblox",
  "midijourney",
  "mirexa",
] as const;

export type TextToTextModel = (typeof TEXT_TO_TEXT_MODELS)[number];
