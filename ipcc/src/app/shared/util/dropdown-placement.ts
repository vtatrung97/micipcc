/**
 * Trả true (mở popup lên trên) khi phía dưới ô không đủ chỗ VÀ phía trên rộng hơn phía dưới.
 * Cách dùng: render popup ẩn → setTimeout → gọi hàm với chiều cao đã đo (px) → gắn class "*-up".
 */
export function shouldDropUp(anchor: HTMLElement, panelHeight: number, gap: number = 8): boolean {
  const rect = anchor.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  return spaceBelow < panelHeight + gap && spaceAbove > spaceBelow;
}
