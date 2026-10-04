import type { Telegraf } from 'telegraf';
import type { BotContext } from '@/interfaces/common';

/**
 * telegraf gọi getUpdates với `timeout: 50` giây (long polling), xem
 * node_modules/telegraf/lib/core/network/polling.js
 */
const LONG_POLL_TIMEOUT_SECONDS = 50;

/** Thời gian chờ thêm trước khi coi kết nối long-poll là đã chết. */
const DEADLINE_GRACE_SECONDS = 30;

/** Mặc định: 80 giây. */
export const POLLING_DEADLINE_MS = (LONG_POLL_TIMEOUT_SECONDS + DEADLINE_GRACE_SECONDS) * 1000;

/** Chỉ cần 3 hàm log này để module không phụ thuộc winston/config (dễ test). */
export interface PollingLog {
  info(message: string): void;
  warn(message: string): void;
  error(message: string, error?: unknown): void;
}

type CallApiOptions = { signal?: AbortSignal };

const describeError = (error: unknown): string => {
  if (error instanceof Error) {
    const code = (error as { code?: string | number }).code;
    return code === undefined ? `${error.name}: ${error.message}` : `${error.name} (code=${code}): ${error.message}`;
  }
  return String(error);
};

/**
 * Lỗi do Telegram trả về (TelegramError) có `response.error_code`; lỗi mạng thì không.
 * Dựa vào đây thay vì `instanceof` để không phải import thêm từ telegraf.
 */
const telegramErrorCode = (error: unknown): number | undefined => {
  const response = (error as { response?: { error_code?: unknown } } | undefined)?.response;
  return typeof response?.error_code === 'number' ? response.error_code : undefined;
};

/**
 * Bọc lỗi thành `FetchError` — đây là điều kiện retry duy nhất mà vòng lặp polling
 * của telegraf hiểu (`if (err.name === 'FetchError') { ... retry sau 5s }`).
 */
const asRetryableError = (error: unknown): Error => {
  const source = error instanceof Error ? error : new Error(String(error));
  const retryable = new Error(source.message);
  retryable.name = 'FetchError';
  retryable.cause = error;
  return retryable;
};

/**
 * Vá hai lỗi khiến bot "mất kết nối Telegram" mà không tự kết nối lại khi chạy polling.
 *
 * 1. Bun thay `require('node-fetch')` bằng một shim gọi native fetch, nên option
 *    `timeout` của node-fetch (telegraf đặt 500000ms trong client.js) bị bỏ qua.
 *    Nếu socket long-poll bị treo (mất mạng giữa chừng, TCP half-open) thì request không
 *    có deadline nào do ứng dụng kiểm soát: không lỗi, không log, bot câm cho tới khi tầng
 *    mạng tự ngắt kết nối. Đo trên Bun: treo ít nhất 5 phút, phần còn lại tuỳ may mắn.
 *    -> Tự đặt deadline bằng AbortController (API timeout hoạt động trên cả Bun lẫn Node).
 *
 * 2. Lỗi mạng trên Bun có dạng `Error` với `code = 'ECONNRESET'` (kèm `TypeError` khi
 *    bị abort), không phải `FetchError` của node-fetch. Vì telegraf chỉ retry
 *    `FetchError`, lỗi mạng bị ném ra khỏi vòng lặp polling và giết luôn polling.
 *    -> Chuẩn hoá mọi lỗi không phải 401 thành `FetchError` để telegraf tự retry.
 *
 * Lỗi 409 Conflict cũng được chuẩn hoá: khi mạng trở lại, Telegram có thể vẫn giữ
 * long-poll cũ ở phía server và trả 409 cho request mới (telegraf 4.16.3 coi 409 là
 * lỗi chết người, xem telegraf/telegraf#2084). Retry 5 giây một lần sẽ tự khỏi.
 */
export const installPollingDeadline = (
  bot: Telegraf<BotContext>,
  log: PollingLog,
  deadlineMs: number = POLLING_DEADLINE_MS,
): void => {
  // `callApi` là generic method nên phải cast khi bọc lại.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const telegram = bot.telegram as any;
  const callApi = telegram.callApi.bind(telegram);

  telegram.callApi = async (
    method: string,
    payload: Record<string, unknown> = {},
    options: CallApiOptions = {},
  ): Promise<unknown> => {
    if (method !== 'getUpdates') return callApi(method, payload, options);

    const outerSignal = options.signal;
    const controller = new AbortController();
    const forwardAbort = () => controller.abort();

    if (outerSignal) {
      if (outerSignal.aborted) controller.abort();
      else outerSignal.addEventListener('abort', forwardAbort);
    }

    let timedOut = false;
    const deadline = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, deadlineMs);

    try {
      return await callApi(method, payload, { ...options, signal: controller.signal });
    } catch (error) {
      // bot.stop() -> báo đúng kiểu AbortError để telegraf dừng vòng lặp polling gọn gàng
      if (outerSignal?.aborted) {
        const aborted = new Error('Polling stopped');
        aborted.name = 'AbortError';
        throw aborted;
      }

      const telegramCode = telegramErrorCode(error);

      // 409 Conflict: long-poll cũ phía Telegram chưa đóng hẳn -> đáng retry
      if (telegramCode !== undefined && telegramCode !== 409) {
        // Các mã khác đã có telegraf lo: 429 và 5xx được nó retry (tôn trọng retry_after),
        // còn 400/401/403/404 là lỗi vĩnh viễn thì ném ra cho lớp giám sát xử lý.
        throw error;
      }

      if (timedOut) {
        log.warn(
          `getUpdates không phản hồi sau ${Math.round(deadlineMs / 1000)}s, đã huỷ kết nối cũ và thử lại`,
        );
      } else {
        log.warn(`getUpdates lỗi mạng (${describeError(error)}), thử lại sau 5s`);
      }

      throw asRetryableError(error);
    } finally {
      clearTimeout(deadline);
      if (outerSignal) outerSignal.removeEventListener('abort', forwardAbort);
    }
  };
};
