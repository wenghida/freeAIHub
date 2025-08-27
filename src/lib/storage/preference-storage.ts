/**
 * 用户偏好设置管理
 * 保存用户的界面偏好和常用设置
 */

import { LocalStorage } from './local-storage';

// 文本转图像偏好设置
export interface TextToImagePreferences {
  defaultPrompt: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultModel: string;
  defaultStyle: string;
  recentPrompts: string[];
  favoritePrompts: string[];
  promptHistorySize: number;
}

// 文本转文本偏好设置
export interface TextToTextPreferences {
  defaultText: string;
  defaultMode: string;
  defaultTargetLanguage: string;
  defaultStyle: string;
  recentTexts: string[];
  favoriteTexts: string[];
  textHistorySize: number;
}

// 文本转语音偏好设置
export interface TextToSpeechPreferences {
  defaultText: string;
  defaultVoice: string;
  defaultSpeed: number;
  defaultPitch: number;
  recentTexts: string[];
  favoriteVoices: string[];
  textHistorySize: number;
}

// 语音转文本偏好设置
export interface SpeechToTextPreferences {
  defaultLanguage: string;
  autoPlay: boolean;
  showConfidence: boolean;
  recentFiles: string[];
  maxFileSize: number;
}

// 通用界面偏好设置
export interface UIPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  sidebarCollapsed: boolean;
  showTips: boolean;
  autoSave: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
}

// 所有偏好设置的联合类型
export interface AllPreferences {
  textToImage: TextToImagePreferences;
  textToText: TextToTextPreferences;
  textToSpeech: TextToSpeechPreferences;
  speechToText: SpeechToTextPreferences;
  ui: UIPreferences;
}

// 默认偏好设置
const defaultPreferences: AllPreferences = {
  textToImage: {
    defaultPrompt: '',
    defaultWidth: 512,
    defaultHeight: 512,
    defaultModel: 'flux',
    defaultStyle: 'photorealistic',
    recentPrompts: [],
    favoritePrompts: [],
    promptHistorySize: 10,
  },
  textToText: {
    defaultText: '',
    defaultMode: 'translate',
    defaultTargetLanguage: 'zh',
    defaultStyle: 'formal',
    recentTexts: [],
    favoriteTexts: [],
    textHistorySize: 10,
  },
  textToSpeech: {
    defaultText: '',
    defaultVoice: 'zh-CN-XiaoxiaoNeural',
    defaultSpeed: 1.0,
    defaultPitch: 0,
    recentTexts: [],
    favoriteVoices: [],
    textHistorySize: 10,
  },
  speechToText: {
    defaultLanguage: 'auto',
    autoPlay: false,
    showConfidence: true,
    recentFiles: [],
    maxFileSize: 50 * 1024 * 1024, // 50MB
  },
  ui: {
    theme: 'auto',
    language: 'zh-CN',
    fontSize: 'medium',
    sidebarCollapsed: false,
    showTips: true,
    autoSave: true,
    soundEnabled: true,
    animationsEnabled: true,
  },
};

export interface PreferenceStorageOptions {
  autoSave?: boolean;
  validate?: boolean;
}

export class PreferenceStorage {
  private storage: LocalStorage;
  private autoSave: boolean;
  private validate: boolean;
  private preferences: AllPreferences;
  private listeners: Map<string, Set<(preferences: any) => void>>;

  constructor(options: PreferenceStorageOptions = {}) {
    this.storage = new LocalStorage({
      prefix: 'freeai-hub-preferences',
      version: '1.0.0',
    });
    this.autoSave = options.autoSave ?? true;
    this.validate = options.validate ?? true;
    this.listeners = new Map();
    
    // 加载保存的偏好设置
    this.preferences = this.loadPreferences();
  }

  /**
   * 获取指定类型的偏好设置
   */
  get<K extends keyof AllPreferences>(key: K): AllPreferences[K] {
    return this.preferences[key];
  }

  /**
   * 设置指定类型的偏好设置
   */
  set<K extends keyof AllPreferences>(key: K, value: Partial<AllPreferences[K]>): void {
    const current = this.preferences[key];
    this.preferences[key] = { ...current, ...value };
    
    if (this.autoSave) {
      this.savePreferences();
    }
    
    this.notifyListeners(key, this.preferences[key]);
  }

  /**
   * 重置指定类型的偏好设置为默认值
   */
  reset<K extends keyof AllPreferences>(key: K): void {
    this.preferences[key] = JSON.parse(JSON.stringify(defaultPreferences[key]));
    
    if (this.autoSave) {
      this.savePreferences();
    }
    
    this.notifyListeners(key, this.preferences[key]);
  }

  /**
   * 重置所有偏好设置为默认值
   */
  resetAll(): void {
    this.preferences = JSON.parse(JSON.stringify(defaultPreferences));
    
    if (this.autoSave) {
      this.savePreferences();
    }
    
    // 通知所有监听器
    Object.keys(this.preferences).forEach(key => {
      this.notifyListeners(key as keyof AllPreferences, this.preferences[key as keyof AllPreferences]);
    });
  }

  /**
   * 添加偏好设置变更监听器
   */
  addListener<K extends keyof AllPreferences>(
    key: K,
    listener: (preferences: AllPreferences[K]) => void
  ): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    
    this.listeners.get(key)!.add(listener);
    
    // 返回取消监听的函数
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  /**
   * 保存偏好设置到本地存储
   */
  save(): boolean {
    return this.savePreferences();
  }

  /**
   * 从本地存储加载偏好设置
   */
  load(): void {
    this.preferences = this.loadPreferences();
  }

  /**
   * 导出偏好设置为JSON字符串
   */
  export(): string {
    return JSON.stringify(this.preferences, null, 2);
  }

  /**
   * 从JSON字符串导入偏好设置
   */
  import(data: string): boolean {
    try {
      const imported = JSON.parse(data);
      
      // 验证数据格式
      if (this.validate) {
        const valid = this.validatePreferences(imported);
        if (!valid) {
          console.error('Invalid preferences format');
          return false;
        }
      }
      
      this.preferences = { ...defaultPreferences, ...imported };
      
      if (this.autoSave) {
        this.savePreferences();
      }
      
      // 通知所有监听器
      Object.keys(this.preferences).forEach(key => {
        this.notifyListeners(key as keyof AllPreferences, this.preferences[key as keyof AllPreferences]);
      });
      
      return true;
    } catch (error) {
      console.error('Failed to import preferences:', error);
      return false;
    }
  }

  /**
   * 获取所有偏好设置
   */
  getAll(): AllPreferences {
    return { ...this.preferences };
  }

  /**
   * 添加最近使用的项目
   */
  addRecentItem<K extends keyof AllPreferences>(
    key: K,
    item: string,
    options: { maxItems?: number } = {}
  ): void {
    const preferences = this.preferences[key];
    const recentKey = this.getRecentKey(key);
    
    if (!recentKey || !preferences || !(recentKey in preferences)) {
      return;
    }
    
    const recentItems = preferences[recentKey as keyof AllPreferences[K]] as string[];
    const maxItems = options.maxItems || this.getHistorySize(key);
    
    // 移除已存在的相同项目
    const filtered = recentItems.filter(i => i !== item);
    
    // 添加到开头
    filtered.unshift(item);
    
    // 限制数量
    if (filtered.length > maxItems) {
      filtered.splice(maxItems);
    }
    
    this.set(key, { [recentKey]: filtered } as Partial<AllPreferences[K]>);
  }

  /**
   * 添加收藏项目
   */
  addFavorite<K extends keyof AllPreferences>(
    key: K,
    item: string
  ): void {
    const preferences = this.preferences[key];
    const favoriteKey = this.getFavoriteKey(key);
    
    if (!favoriteKey || !preferences || !(favoriteKey in preferences)) {
      return;
    }
    
    const favoriteItems = preferences[favoriteKey as keyof AllPreferences[K]] as string[];
    
    if (!favoriteItems.includes(item)) {
      const newFavorites = [...favoriteItems, item];
      this.set(key, { [favoriteKey]: newFavorites } as Partial<AllPreferences[K]>);
    }
  }

  /**
   * 移除收藏项目
   */
  removeFavorite<K extends keyof AllPreferences>(
    key: K,
    item: string
  ): void {
    const preferences = this.preferences[key];
    const favoriteKey = this.getFavoriteKey(key);
    
    if (!favoriteKey || !preferences || !(favoriteKey in preferences)) {
      return;
    }
    
    const favoriteItems = preferences[favoriteKey as keyof AllPreferences[K]] as string[];
    const newFavorites = favoriteItems.filter(i => i !== item);
    
    if (newFavorites.length !== favoriteItems.length) {
      this.set(key, { [favoriteKey]: newFavorites } as Partial<AllPreferences[K]>);
    }
  }

  /**
   * 从本地存储加载偏好设置
   */
  private loadPreferences(): AllPreferences {
    const saved = this.storage.get<AllPreferences>('preferences');
    
    if (saved) {
      return { ...defaultPreferences, ...saved };
    }
    
    return JSON.parse(JSON.stringify(defaultPreferences));
  }

  /**
   * 保存偏好设置到本地存储
   */
  private savePreferences(): boolean {
    return this.storage.set('preferences', this.preferences);
  }

  /**
   * 验证偏好设置格式
   */
  private validatePreferences(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }
    
    // 检查必需的结构
    const requiredKeys = ['textToImage', 'textToText', 'textToSpeech', 'speechToText', 'ui'];
    return requiredKeys.every(key => key in data);
  }

  /**
   * 通知监听器
   */
  private notifyListeners<K extends keyof AllPreferences>(key: K, preferences: AllPreferences[K]): void {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(listener => listener(preferences));
    }
  }

  /**
   * 获取最近使用项目的键名
   */
  private getRecentKey<K extends keyof AllPreferences>(key: K): string | null {
    const keyMap: Record<string, string> = {
      textToImage: 'recentPrompts',
      textToText: 'recentTexts',
      textToSpeech: 'recentTexts',
      speechToText: 'recentFiles',
    };
    
    return keyMap[key as string] || null;
  }

  /**
   * 获取收藏项目的键名
   */
  private getFavoriteKey<K extends keyof AllPreferences>(key: K): string | null {
    const keyMap: Record<string, string> = {
      textToImage: 'favoritePrompts',
      textToText: 'favoriteTexts',
      textToSpeech: 'favoriteVoices',
    };
    
    return keyMap[key as string] || null;
  }

  /**
   * 获取历史记录大小
   */
  private getHistorySize<K extends keyof AllPreferences>(key: K): number {
    const sizeMap: Record<string, number> = {
      textToImage: this.preferences.textToImage.promptHistorySize,
      textToText: this.preferences.textToText.textHistorySize,
      textToSpeech: this.preferences.textToSpeech.textHistorySize,
      speechToText: 10,
    };
    
    return sizeMap[key as string] || 10;
  }
}

// 创建默认实例
export const preferenceStorage = new PreferenceStorage({
  autoSave: true,
  validate: true,
});

// 快捷方法
export const preferences = {
  get: <K extends keyof AllPreferences>(key: K) => preferenceStorage.get(key),
  set: <K extends keyof AllPreferences>(key: K, value: Partial<AllPreferences[K]>) => preferenceStorage.set(key, value),
  reset: <K extends keyof AllPreferences>(key: K) => preferenceStorage.reset(key),
  resetAll: () => preferenceStorage.resetAll(),
  addListener: <K extends keyof AllPreferences>(
    key: K,
    listener: (preferences: AllPreferences[K]) => void
  ) => preferenceStorage.addListener(key, listener),
  save: () => preferenceStorage.save(),
  load: () => preferenceStorage.load(),
  export: () => preferenceStorage.export(),
  import: (data: string) => preferenceStorage.import(data),
  getAll: () => preferenceStorage.getAll(),
  addRecent: <K extends keyof AllPreferences>(
    key: K,
    item: string,
    options?: { maxItems?: number }
  ) => preferenceStorage.addRecentItem(key, item, options),
  addFavorite: <K extends keyof AllPreferences>(key: K, item: string) => preferenceStorage.addFavorite(key, item),
  removeFavorite: <K extends keyof AllPreferences>(key: K, item: string) => preferenceStorage.removeFavorite(key, item),
};