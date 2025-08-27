// AI图像生成提示词关键维度常量
// 每个维度提供具体常量值，用于构建高质量的AI图像生成提示词

// 内容主体（Subject）- 图像的主要内容
export const IMAGE_PROMPT_SUBJECTS = [
  "portrait",
  "landscape",
  "animal",
  "architectural",
  "still life",
  "fantasy creature",
  "sci-fi robot",
  "historical figure",
  "mythical beast",
  "abstract form",
  "other",
] as const;

export type ImagePromptSubject = (typeof IMAGE_PROMPT_SUBJECTS)[number];

// 风格类型（Style）- 艺术和视觉风格
export const IMAGE_PROMPT_STYLES = [
  "realistic",
  "oil painting",
  "watercolor",
  "pencil sketch",
  "digital art",
  "anime",
  "cyberpunk",
  "impressionist",
  "surrealist",
  "pixel art",
  "other",
] as const;

export type ImagePromptStyle = (typeof IMAGE_PROMPT_STYLES)[number];

// 质量描述（Quality）- 图像质量和细节程度
export const IMAGE_PROMPT_QUALITIES = [
  "high resolution",
  "4K",
  "ultra detailed",
  "sharp focus",
  "masterpiece",
  "professional",
  "cinematic",
  "octane render",
  "unreal engine",
  "HDR",
  "other",
] as const;

export type ImagePromptQuality = (typeof IMAGE_PROMPT_QUALITIES)[number];

// 构图（Composition）- 视角和构图方式
export const IMAGE_PROMPT_COMPOSITIONS = [
  "front view",
  "side view",
  "aerial view",
  "close up",
  "wide angle",
  "macro",
  "panoramic",
  "symmetrical",
  "rule of thirds",
  "centered",
  "other",
] as const;

export type ImagePromptComposition = (typeof IMAGE_PROMPT_COMPOSITIONS)[number];

// 光照（Lighting）- 光源和光照效果
export const IMAGE_PROMPT_LIGHTING = [
  "natural light",
  "studio lighting",
  "golden hour",
  "neon lighting",
  "dramatic lighting",
  "backlighting",
  "soft lighting",
  "hard lighting",
  "volumetric lighting",
  "rim lighting",
  "other",
] as const;

export type ImagePromptLighting = (typeof IMAGE_PROMPT_LIGHTING)[number];

// 色彩（Color）- 色调和色彩方案
export const IMAGE_PROMPT_COLORS = [
  "vibrant",
  "pastel",
  "monochrome",
  "warm colors",
  "cool colors",
  "complementary colors",
  "neon palette",
  "earthy tones",
  "jewel tones",
  "matte colors",
  "other",
] as const;

export type ImagePromptColor = (typeof IMAGE_PROMPT_COLORS)[number];

// 情绪氛围（Mood）- 情感和氛围表达
export const IMAGE_PROMPT_MOODS = [
  "serene",
  "dramatic",
  "mysterious",
  "joyful",
  "melancholic",
  "energetic",
  "romantic",
  "epic",
  "peaceful",
  "chaotic",
  "other",
] as const;

export type ImagePromptMood = (typeof IMAGE_PROMPT_MOODS)[number];

// 环境背景（Environment）- 背景设置和环境条件
export const IMAGE_PROMPT_ENVIRONMENTS = [
  "forest",
  "ocean",
  "mountain",
  "cityscape",
  "desert",
  "space",
  "underwater",
  "castle",
  "futuristic city",
  "dreamlike realm",
  "other",
] as const;

export type ImagePromptEnvironment = (typeof IMAGE_PROMPT_ENVIRONMENTS)[number];

// 导出所有维度的联合类型
export type ImagePromptDimension =
  | ImagePromptSubject
  | ImagePromptStyle
  | ImagePromptQuality
  | ImagePromptComposition
  | ImagePromptLighting
  | ImagePromptColor
  | ImagePromptMood
  | ImagePromptEnvironment;
