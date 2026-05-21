"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    PrayerChat?: {
      init: (config: { embedCode: string; apiUrl: string }) => void;
    };
  }
}

const EMBED_CODE = "prayer-chat-bot-4mK1H7afXdx10vthN8QU_vT9";
const BASE_URL = "https://chatbot-java-spring-ai.onrender.com";

export default function PrayerChatBot() {
  useEffect(() => {
    // Avoid loading the script more than once
    if (document.querySelector(`script[src="${BASE_URL}/js/chatbot-widget.js"]`)) {
      if (window.PrayerChat?.init) {
        window.PrayerChat.init({ embedCode: EMBED_CODE, apiUrl: `${BASE_URL}/api` });
      }
      return;
    }

    const script = document.createElement("script");
    script.src = `${BASE_URL}/js/chatbot-widget.js`;
    script.async = true;

    script.onerror = () => {
      const el =
        document.getElementById(`prayer-chat-chatbot-${EMBED_CODE}`) ??
        document.querySelector(`[data-embed-code="${EMBED_CODE}"]`);
      if (el) {
        el.innerHTML = `<p style="padding:12px;background:#fff3cd;border:1px solid #ffc107;border-radius:8px;font-family:sans-serif;font-size:14px;">
          Chat could not load. Check browser console (F12) or Content-Security-Policy.
        </p>`;
      }
    };

    script.onload = () => {
      if (window.PrayerChat?.init) {
        window.PrayerChat.init({ embedCode: EMBED_CODE, apiUrl: `${BASE_URL}/api` });
      } else {
        const el =
          document.getElementById(`prayer-chat-chatbot-${EMBED_CODE}`) ??
          document.querySelector(`[data-embed-code="${EMBED_CODE}"]`);
        if (el) {
          el.innerHTML = `<p style="padding:12px;background:#f8d7da;border:1px solid #f5c6cb;border-radius:8px;font-family:sans-serif;font-size:14px;">
            Chat failed to start. Open console (F12) for details.
          </p>`;
        }
      }
    };

    document.head.appendChild(script);
  }, []);

  return (
    <div
      id={`prayer-chat-chatbot-${EMBED_CODE}`}
      data-embed-code={EMBED_CODE}
    />
  );
}
