class Logger {
  private basePrefix: string;
  private dynamicPrefix: string | null = null;

  constructor(basePrefix: string, dynamicPrefix?: string) {
    this.basePrefix = basePrefix;
    if (dynamicPrefix) {
      this.dynamicPrefix = dynamicPrefix;
    }
  }

  private formatMessage(message: any[]): any[] {
    const prefix = this.dynamicPrefix ? `${this.basePrefix} - ${this.dynamicPrefix}` : this.basePrefix;
    const color = this.getColorForPrefix(this.dynamicPrefix || '');
    return [`%c${prefix}`, `color: ${color}; font-weight: bold;`, ...message.map(this.serialize)];
  }

  private serialize(value: any): any {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (e) {
      return value;
    }
  }

  private getColorForPrefix(prefix: string): string {
    const hash = this.hashString(prefix);
    return this.hashToColor(hash);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  private hashToColor(hash: number): string {
    const hue = hash % 360; // 色相值在 0-360 之间
    const saturation = 70 + (hash % 30); // 饱和度在 70-100% 之间
    const lightness = 50 + (hash % 20); // 亮度在 50-70% 之间
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  log(...message: any[]): void {
    if (typeof window !== 'undefined') {
      console.log(...this.formatMessage(message));
    } else {
      console.log(this.basePrefix, ...message.map(this.serialize));
    }
  }

  info(...message: any[]): void {
    if (typeof window !== 'undefined') {
      console.info(...this.formatMessage(message));
    } else {
      console.info(this.basePrefix, ...message.map(this.serialize));
    }
  }

  warn(...message: any[]): void {
    if (typeof window !== 'undefined') {
      console.warn(...this.formatMessage(message));
    } else {
      console.warn(this.basePrefix, ...message.map(this.serialize));
    }
  }

  error(...message: any[]): void {
    if (typeof window !== 'undefined') {
      console.error(...this.formatMessage(message));
    } else {
      console.error(this.basePrefix, ...message.map(this.serialize));
    }
  }
}

// 工厂函数，用于创建带有动态前缀的 Logger 实例
function createLogger(dynamicPrefix: string) {
  return new Logger("[APP]", dynamicPrefix);
}

// 创建代理对象，支持 logger.log(ref) 和 logger("aaa:bbb").log(ref)
const defaultLogger = new Logger("[APP]");
const logger = new Proxy(createLogger, {
  apply(target, thisArg, argumentsList) {
    return target(...argumentsList);
  },
  get(target, prop) {
    if (prop in target) {
      return target[prop];
    }
    return (defaultLogger as any)[prop];
  }
});

// 导出默认的 Logger 实例和工厂函数
export default logger;