/**
 * Quyết định mở dropdown / popup lên trên hay xuống dưới ô.
 *
 * Mở lên trên khi phía dưới ô (trong khung nhìn) không đủ chỗ cho popup
 * VÀ phía trên còn rộng hơn phía dưới. Dùng chung cho select, multi-select,
 * date-picker, month-day-picker…
 *
 * Cách dùng: render popup ẩn (visibility: hidden) → setTimeout → gọi hàm này với
 * chiều cao thật của popup → gắn class "*-up" → hiện popup.
 *
 * @param anchor phần tử ô (host của component)
 * @param panelHeight chiều cao popup đã đo (px)
 * @param gap khoảng cách giữa ô và popup (px)
 */
export function shouldDropUp(anchor: HTMLElement, panelHeight: number, gap: number = 8): boolean {
  const rect = anchor.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  return spaceBelow < panelHeight + gap && spaceAbove > spaceBelow;
}
