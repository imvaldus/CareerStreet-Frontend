// AlertComponent.tsx
import Swal from "sweetalert2";
import { MessageUtils } from "@/utils/messageUtils";

export type OrderItem = {
  serviceName: string;
  quantity: number;
  price: number;
  total: number;
};

type AlertType = 'success' | 'error' | 'warning' | 'info';

const AlertComponent = {
  showMessage: (
    title: string,
    message?: string | Record<string, string | number>,
    type: AlertType = 'info',
    lang: 'vi' | 'en' = 'vi'
  ) => {
    let finalTitle: string;
    let finalMessage: string | undefined;

    // Check if title starts with message code pattern (e.g., "MSG_", "ERR_")
    if (title.includes('_')) {
      finalTitle = MessageUtils.getMessage(title, lang, typeof message === 'object' ? message : undefined);
      type = MessageUtils.getType(title);
    } else {
      finalTitle = title;
      finalMessage = typeof message === 'string' ? message : undefined;
    }

    Swal.fire({
      title: finalTitle,
      text: finalMessage,
      icon: type,
      confirmButtonText: "OK",
    });
  },

  success: (title: string, message?: string | Record<string, string | number>, lang: 'vi' | 'en' = 'vi') => {
    AlertComponent.showMessage(title, message, 'success', lang);
  },

  error: (title: string, message?: string | Record<string, string | number>, lang: 'vi' | 'en' = 'vi') => {
    AlertComponent.showMessage(title, message, 'error', lang);
  },

  warning: (title: string, message?: string | Record<string, string | number>, lang: 'vi' | 'en' = 'vi') => {
    AlertComponent.showMessage(title, message, 'warning', lang);
  },

  info: (title: string, message?: string | Record<string, string | number>, lang: 'vi' | 'en' = 'vi') => {
    AlertComponent.showMessage(title, message, 'info', lang);
  }
};

export default AlertComponent;
