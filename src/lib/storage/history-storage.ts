/**
 * 历史记录管理
 * 为各个功能页面提供历史记录存储和查询功能
 */

import { LocalStorage } from './local-storage';

export interface HistoryItem {
  id: string;
  timestamp: number;
  data: any;
  type: string;
  title?: string;
}

export interface TextToImageHistoryItem extends HistoryItem {
  type: 'text-to-image';
  data: {
    prompt: string;
    width: number;
    height: number;
    model: string;
    style: string;
    imageUrl: string;
  };
}

export interface TextToTextHistoryItem extends HistoryItem {
  type: 'text-to-text';
  data: {
    input: string;
    output: string;
    model: string;
  };
}

export interface TextToSpeechHistoryItem extends HistoryItem {
  type: 'text-to-speech';
  data: {
    text: string;
    voice: string;
    speed: number;
    pitch: number;
    audioUrl: string;
  };
}

export interface SpeechToTextHistoryItem extends HistoryItem {
  type: 'speech-to-text';
  data: {
    fileName?: string;
    audioUrl?: string;
    text: string;
    duration?: number;
  };
}

export type HistoryData = 
  | TextToImageHistoryItem
  | TextToTextHistoryItem
  | TextToSpeechHistoryItem
  | SpeechToTextHistoryItem;

export interface HistoryStorageOptions {
  maxItems?: number; // 最大历史记录数
  maxAge?: number; // 最大保存时间（毫秒）
}

export class HistoryStorage {
  private storage: LocalStorage;
  private maxItems: number;
  private maxAge: number;

  constructor(options: HistoryStorageOptions = {}) {
    this.storage = new LocalStorage({
      prefix: 'freeai-hub-history',
      version: '1.0.0',
    });
    this.maxItems = options.maxItems || 50;
    this.maxAge = options.maxAge || 30 * 24 * 60 * 60 * 1000; // 默认30天
  }

  /**
   * 添加历史记录
   */
  add<T extends HistoryData>(item: Omit<T, 'id' | 'timestamp'>): string {
    const historyItem: T = {
      ...item as any,
      id: this.generateId(),
      timestamp: Date.now(),
    } as T;

    const key = this.getKey(item.type);
    const history = this.getHistory(item.type);
    
    // 添加到开头
    history.unshift(historyItem);
    
    // 限制数量
    if (history.length > this.maxItems) {
      history.splice(this.maxItems);
    }
    
    // 保存
    this.storage.set(key, history);
    
    return historyItem.id;
  }

  /**
   * 获取历史记录
   */
  get(type: string): HistoryData[] {
    return this.getHistory(type);
  }

  /**
   * 删除单条历史记录
   */
  remove(type: string, id: string): boolean {
    const key = this.getKey(type);
    const history = this.getHistory(type);
    const newHistory = history.filter(item => item.id !== id);
    
    if (history.length !== newHistory.length) {
      this.storage.set(key, newHistory);
      return true;
    }
    
    return false;
  }

  /**
   * 清空某类型的所有历史记录
   */
  clear(type: string): boolean {
    const key = this.getKey(type);
    return this.storage.remove(key);
  }

  /**
   * 清空所有历史记录
   */
  clearAll(): boolean {
    return this.storage.clear();
  }

  /**
   * 搜索历史记录
   */
  search(type: string, query: string): HistoryData[] {
    const history = this.getHistory(type);
    const searchTerm = query.toLowerCase();
    
    return history.filter(item => {
      const searchableText = this.getSearchableText(item);
      return searchableText.includes(searchTerm);
    });
  }

  /**
   * 按时间范围获取历史记录
   */
  getByDateRange(type: string, startDate: Date, endDate: Date): HistoryData[] {
    const history = this.getHistory(type);
    const start = startDate.getTime();
    const end = endDate.getTime();
    
    return history.filter(item => 
      item.timestamp >= start && item.timestamp <= end
    );
  }

  /**
   * 获取历史记录数量
   */
  count(type: string): number {
    const history = this.getHistory(type);
    return history.length;
  }

  /**
   * 检查某类型是否有历史记录
   */
  has(type: string): boolean {
    const key = this.getKey(type);
    return this.storage.has(key) && this.count(type) > 0;
  }

  /**
   * 导出历史记录
   */
  export(type: string): string {
    const history = this.getHistory(type);
    return JSON.stringify(history, null, 2);
  }

  /**
   * 导入历史记录
   */
  import(type: string, data: string): boolean {
    try {
      const history = JSON.parse(data) as HistoryData[];
      
      // 验证数据格式
      if (!Array.isArray(history)) {
        return false;
      }
      
      const validHistory = history.filter(item => 
        item.id && item.timestamp && item.type === type
      );
      
      // 限制数量
      if (validHistory.length > this.maxItems) {
        validHistory.splice(this.maxItems);
      }
      
      const key = this.getKey(type);
      this.storage.set(key, validHistory);
      
      return true;
    } catch (error) {
      console.error('Failed to import history:', error);
      return false;
    }
  }

  /**
   * 获取内部存储键名
   */
  private getKey(type: string): string {
    return type;
  }

  /**
   * 获取历史记录数组
   */
  private getHistory(type: string): HistoryData[] {
    const key = this.getKey(type);
    const history = this.storage.get<HistoryData[]>(key, []);
    
    // 检查history是否为null
    if (!history) {
      return [];
    }
    
    // 过滤过期记录
    const now = Date.now();
    const validHistory = history.filter(item => 
      now - item.timestamp <= this.maxAge
    );
    
    // 如果有过期记录，更新存储
    if (validHistory.length !== history.length) {
      this.storage.set(key, validHistory);
    }
    
    return validHistory;
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取可搜索的文本内容
   */
  private getSearchableText(item: HistoryData): string {
    switch (item.type) {
      case 'text-to-image':
        const tti = item as TextToImageHistoryItem;
        return `${tti.data.prompt} ${tti.data.model} ${tti.data.style}`.toLowerCase();
      
      case 'text-to-text':
        const ttt = item as TextToTextHistoryItem;
        return `${ttt.data.input} ${ttt.data.output} ${ttt.data.model}`.toLowerCase();
      
      case 'text-to-speech':
        const tts = item as TextToSpeechHistoryItem;
        return `${tts.data.text} ${tts.data.voice}`.toLowerCase();
      
      case 'speech-to-text':
        const stt = item as SpeechToTextHistoryItem;
        return `${stt.data.text} ${stt.data.fileName || ''}`.toLowerCase();
      
      default:
        return '';
    }
  }
}

// 创建默认实例
export const historyStorage = new HistoryStorage({
  maxItems: 50,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30天
});

// 快捷方法
export const history = {
  add: <T extends HistoryData>(item: Omit<T, 'id' | 'timestamp'>) => historyStorage.add<T>(item),
  get: (type: string) => historyStorage.get(type),
  remove: (type: string, id: string) => historyStorage.remove(type, id),
  clear: (type: string) => historyStorage.clear(type),
  clearAll: () => historyStorage.clearAll(),
  search: (type: string, query: string) => historyStorage.search(type, query),
  count: (type: string) => historyStorage.count(type),
  has: (type: string) => historyStorage.has(type),
  export: (type: string) => historyStorage.export(type),
  import: (type: string, data: string) => historyStorage.import(type, data),
};