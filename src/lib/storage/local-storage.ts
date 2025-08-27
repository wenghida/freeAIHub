/**
 * 本地存储工具类
 * 提供类型安全的localStorage操作API
 */

export interface StorageOptions {
  prefix?: string;
  version?: string;
  maxAge?: number; // 毫秒，过期时间
}

export interface StorageItem<T> {
  data: T;
  timestamp: number;
  version?: string;
}

export class LocalStorage {
  private prefix: string;
  private version: string;
  private maxAge?: number;

  constructor(options: StorageOptions = {}) {
    this.prefix = options.prefix || 'freeai-hub';
    this.version = options.version || '1.0.0';
    this.maxAge = options.maxAge;
  }

  /**
   * 生成完整的存储键名
   */
  private getKey(key: string): string {
    return `${this.prefix}:${this.version}:${key}`;
  }

  /**
   * 检查localStorage是否可用
   */
  private isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * 检查数据是否过期
   */
  private isExpired(timestamp: number): boolean {
    if (!this.maxAge) return false;
    return Date.now() - timestamp > this.maxAge;
  }

  /**
   * 设置数据到localStorage
   */
  set<T>(key: string, data: T): boolean {
    if (!this.isStorageAvailable()) {
      console.warn('LocalStorage is not available');
      return false;
    }

    try {
      const item: StorageItem<T> = {
        data,
        timestamp: Date.now(),
        version: this.version,
      };

      const serialized = JSON.stringify(item);
      localStorage.setItem(this.getKey(key), serialized);
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  }

  /**
   * 从localStorage获取数据
   */
  get<T>(key: string, defaultValue?: T): T | null {
    if (!this.isStorageAvailable()) {
      return defaultValue ?? null;
    }

    try {
      const item = localStorage.getItem(this.getKey(key));
      if (!item) {
        return defaultValue ?? null;
      }

      const parsed: StorageItem<T> = JSON.parse(item);

      // 检查数据版本
      if (parsed.version !== this.version) {
        this.remove(key);
        return defaultValue ?? null;
      }

      // 检查是否过期
      if (this.isExpired(parsed.timestamp)) {
        this.remove(key);
        return defaultValue ?? null;
      }

      return parsed.data;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      this.remove(key);
      return defaultValue ?? null;
    }
  }

  /**
   * 从localStorage删除数据
   */
  remove(key: string): boolean {
    if (!this.isStorageAvailable()) {
      return false;
    }

    try {
      localStorage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
      return false;
    }
  }

  /**
   * 清空所有以prefix开头的数据
   */
  clear(): boolean {
    if (!this.isStorageAvailable()) {
      return false;
    }

    try {
      const keys = Object.keys(localStorage);
      const prefix = this.getKey('');

      keys.forEach(key => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  }

  /**
   * 检查key是否存在
   */
  has(key: string): boolean {
    if (!this.isStorageAvailable()) {
      return false;
    }

    return localStorage.getItem(this.getKey(key)) !== null;
  }

  /**
   * 获取所有存储的键名
   */
  keys(): string[] {
    if (!this.isStorageAvailable()) {
      return [];
    }

    try {
      const keys = Object.keys(localStorage);
      const prefix = this.getKey('');
      const prefixLength = prefix.length;

      return keys
        .filter(key => key.startsWith(prefix))
        .map(key => key.substring(prefixLength));
    } catch (error) {
      console.error('Failed to get keys from localStorage:', error);
      return [];
    }
  }

  /**
   * 获取存储大小（字节数）
   */
  size(key: string): number {
    if (!this.isStorageAvailable()) {
      return 0;
    }

    try {
      const item = localStorage.getItem(this.getKey(key));
      return item ? item.length : 0;
    } catch (error) {
      console.error('Failed to get size from localStorage:', error);
      return 0;
    }
  }

  /**
   * 获取剩余存储空间（估算）
   */
  remainingSpace(): number {
    if (!this.isStorageAvailable()) {
      return 0;
    }

    try {
      let totalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.getKey(''))) {
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += key.length + value.length;
          }
        }
      }

      // 估算localStorage总容量为5MB
      const maxSize = 5 * 1024 * 1024;
      return Math.max(0, maxSize - totalSize);
    } catch (error) {
      console.error('Failed to calculate remaining space:', error);
      return 0;
    }
  }
}

// 创建默认实例
export const defaultStorage = new LocalStorage({
  prefix: 'freeai-hub',
  version: '1.0.0',
});

// 快捷方法
export const storage = {
  set: <T>(key: string, data: T) => defaultStorage.set(key, data),
  get: <T>(key: string, defaultValue?: T) => defaultStorage.get(key, defaultValue),
  remove: (key: string) => defaultStorage.remove(key),
  clear: () => defaultStorage.clear(),
  has: (key: string) => defaultStorage.has(key),
  keys: () => defaultStorage.keys(),
  size: (key: string) => defaultStorage.size(key),
  remainingSpace: () => defaultStorage.remainingSpace(),
};