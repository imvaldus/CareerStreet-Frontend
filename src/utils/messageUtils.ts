import { parse } from 'csv-parse/sync';

interface MessageItem {
  code: string;
  vi: string;
  en: string;
  type: string;
}

type LanguageKey = 'vi' | 'en';

export class MessageUtils {
  private static messages: Map<string, MessageItem> = new Map();
  private static initialized = false;

  private static initialize() {
    if (this.initialized) return;
    
    // Đọc nội dung từ file CSV
    const messagesText = require('!!raw-loader!@/constants/messages.csv').default;
    const records = parse(messagesText, {
      columns: true,
      skip_empty_lines: true,
      comment: '#'
    });

    // Lưu vào Map
    records.forEach((record: MessageItem) => {
      this.messages.set(record.code, record);
    });

    this.initialized = true;
  }

  static getMessage(code: string, lang: LanguageKey = 'vi', params?: Record<string, string | number>): string {
    this.initialize();
    const message = this.messages.get(code);
    if (!message) {
      console.warn(`Message code not found: ${code}`);
      return code;
    }
    
    let text = message[lang];
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        text = text.replace(`{${key}}`, String(value));
      });
    }
    return text;
  }

  static getType(code: string): 'success' | 'error' | 'warning' | 'info' {
    this.initialize();
    const message = this.messages.get(code);
    return (message?.type || 'info') as 'success' | 'error' | 'warning' | 'info';
  }
}