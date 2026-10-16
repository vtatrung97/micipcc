import { NodeType } from '../models/node-type';

export const NODE_CARD_WIDTH = 240;
export const NODE_CARD_HEIGHT = 72;
export const NODE_CIRCLE_SIZE = 56;

const PAD_X = 12;
const PAD_Y = 16;
const ICON_BOX = 40;
const TEXT_X = PAD_X + ICON_BOX + 12; // 64
const TEXT_WIDTH = NODE_CARD_WIDTH - TEXT_X - 30; // chừa chỗ nút × góc phải
const ROW_HEIGHT = 18;
const ROW_GAP = 4;
const ROWS_TOP = PAD_Y + ICON_BOX + 12; // 68

/** Số dòng nhánh hiển thị tối đa (markup dựng sẵn) */
export const NODE_MAX_ROWS = 16;

/** Tâm Y của phần đầu card (icon + tên) — cổng vào nằm ở đây */
export const NODE_HEADER_CENTER_Y = PAD_Y + ICON_BOX / 2; // 36

const ICON_BASE = 'assets/icons/processx/flow';

/** Icon 24px theo loại bước */
export const NODE_ICON_SRC: Record<NodeType, string> = {
  START: `${ICON_BASE}/start-play.svg`,
  END: `${ICON_BASE}/end-stop.svg`,
  USER_TASK: `${ICON_BASE}/user-task.svg`,
  SYSTEM_TASK: `${ICON_BASE}/system-task.svg`,
  GATEWAY_EXCLUSIVE: `${ICON_BASE}/gateway-exclusive.svg`,
  GATEWAY_PARALLEL: `${ICON_BASE}/gateway-parallel.svg`,
  GATEWAY_INCLUSIVE: `${ICON_BASE}/gateway-inclusive.svg`,
  JOIN: `${ICON_BASE}/join.svg`,
  NOTIFICATION: `${ICON_BASE}/notification.svg`,
  SUB_PROCESS: `${ICON_BASE}/sub-process.svg`,
};

/** Icon riêng cho "Kết thúc" trên Thư viện bước (ô vuông bo góc) */
export const PALETTE_END_ICON_SRC = `${ICON_BASE}/end.svg`;
/** Icon nhóm "Điều kiện" trên Thư viện bước */
export const PALETTE_CONDITION_ICON_SRC = `${ICON_BASE}/condition.svg`;

/** Nền ô icon 40×40 theo loại bước */
export const NODE_ICON_BG: Record<NodeType, string> = {
  START: '#ffffff',
  END: '#ffffff',
  USER_TASK: '#edfdf5',
  SYSTEM_TASK: '#ebf5ff',
  GATEWAY_EXCLUSIVE: '#f5f5f5',
  GATEWAY_PARALLEL: '#f5f5f5',
  GATEWAY_INCLUSIVE: '#f5f5f5',
  JOIN: '#f5f5f5',
  NOTIFICATION: '#f7f0fe',
  SUB_PROCESS: '#fefaec',
};

export const NODE_COLORS = {
  border: '#e3e3e3',
  borderSelected: '#ff5779',
  typeText: '#707070',
  nameText: '#292929',
  rowText: '#707070',
};

/** Đổ bóng card: mặc định / khi hover */
export const NODE_SHADOW = {
  name: 'dropShadow',
  args: { dx: 0, dy: 2, blur: 4, color: '#000000', opacity: 0.08 },
};
export const NODE_SHADOW_HOVER = {
  name: 'dropShadow',
  args: { dx: 0, dy: 2, blur: 5, color: '#000000', opacity: 0.16 },
};

/** Chiều cao card theo số dòng nhánh (0 = card 72) */
export function nodeCardHeight(rowCount: number): number {
  return rowCount > 0
    ? ROWS_TOP + rowCount * ROW_HEIGHT + (rowCount - 1) * ROW_GAP + PAD_Y
    : NODE_CARD_HEIGHT;
}

/** Tâm Y của dòng nhánh thứ i — cổng ra của nhánh đặt ở đây (mép phải card) */
export function nodeRowCenterY(index: number): number {
  return ROWS_TOP + index * (ROW_HEIGHT + ROW_GAP) + ROW_HEIGHT / 2;
}

/** Markup SVG dùng chung cho card */
export function nodeCardMarkup(): any[] {
  const markup: any[] = [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'rect', selector: 'iconBox' },
    { tagName: 'image', selector: 'iconImg' },
    { tagName: 'text', selector: 'typeText' },
    { tagName: 'text', selector: 'nameText' },
    { tagName: 'image', selector: 'closeBtn' },
    { tagName: 'image', selector: 'alertIcon' },
  ];
  for (let i = 0; i < NODE_MAX_ROWS; i++) {
    markup.push({ tagName: 'text', selector: `rowText_${i}` });
  }
  return markup;
}

/** attrs dòng tên + dòng loại; chưa đặt tên thì chỉ hiện loại bước (đậm) giữa card */
export function nodeLabelAttrs(typeTitle: string, label: string): any {
  const hasLabel = !!(label && label.trim());
  return {
    typeText: {
      display: hasLabel ? 'block' : 'none',
      textWrap: {
        text: typeTitle || '',
        width: TEXT_WIDTH,
        height: ROW_HEIGHT,
        ellipsis: true,
      },
    },
    nameText: {
      refY: hasLabel ? 46 : NODE_HEADER_CENTER_Y,
      textWrap: {
        text: hasLabel ? label.trim() : typeTitle || '',
        width: TEXT_WIDTH,
        height: 20,
        ellipsis: true,
      },
    },
  };
}

/** attrs của các dòng nhánh (chữ căn phải sát cổng ra) */
export function nodeRowAttrs(rows: string[]): any {
  const attrs: any = {};
  for (let i = 0; i < NODE_MAX_ROWS; i++) {
    attrs[`rowText_${i}`] =
      i < rows.length
        ? {
            display: 'block',
            refY: nodeRowCenterY(i),
            textWrap: {
              text: rows[i],
              width: NODE_CARD_WIDTH - TEXT_X,
              height: ROW_HEIGHT,
              ellipsis: true,
            },
          }
        : { display: 'none' };
  }
  return attrs;
}

/** attrs đầy đủ của card khi tạo mới */
export function nodeCardAttrs(
  type: NodeType,
  typeTitle: string,
  label: string,
  rows: string[],
  iconSrc: string = NODE_ICON_SRC[type],
): any {
  const attrs: any = {
    body: {
      refWidth: '100%',
      refHeight: '100%',
      rx: 12,
      ry: 12,
      fill: '#ffffff',
      stroke: NODE_COLORS.border,
      strokeWidth: 1,
      filter: NODE_SHADOW,
      cursor: 'pointer',
    },
    iconBox: {
      x: PAD_X,
      y: PAD_Y,
      width: ICON_BOX,
      height: ICON_BOX,
      rx: 8,
      ry: 8,
      fill: NODE_ICON_BG[type] || '#f5f5f5',
      stroke: 'none',
      cursor: 'pointer',
    },
    iconImg: {
      x: PAD_X + 8,
      y: PAD_Y + 8,
      width: 24,
      height: 24,
      'xlink:href': iconSrc,
      href: iconSrc,
      cursor: 'pointer',
    },
    typeText: {
      refX: TEXT_X,
      refY: 25,
      fontFamily: 'Inter, sans-serif',
      fontSize: 12,
      fontWeight: 400,
      fill: NODE_COLORS.typeText,
      textAnchor: 'start',
      textVerticalAnchor: 'middle',
      cursor: 'pointer',
    },
    nameText: {
      refX: TEXT_X,
      fontFamily: 'Inter, sans-serif',
      fontSize: 14,
      fontWeight: 600,
      fill: NODE_COLORS.nameText,
      textAnchor: 'start',
      textVerticalAnchor: 'middle',
      cursor: 'pointer',
    },
    // Nút × góc phải trên: xoá bước (event 'node:delete' → graph-canvas.service)
    closeBtn: {
      x: NODE_CARD_WIDTH - 26,
      y: 12,
      width: 16,
      height: 16,
      'xlink:href': `${ICON_BASE}/node-close.svg`,
      href: `${ICON_BASE}/node-close.svg`,
      cursor: 'pointer',
      event: 'node:delete',
    },
    // Cảnh báo vàng góc phải trên (gateway còn nhánh chưa nối)
    alertIcon: {
      x: NODE_CARD_WIDTH - 18,
      y: -8,
      width: 24,
      height: 24,
      'xlink:href': `${ICON_BASE}/node-alert.svg`,
      href: `${ICON_BASE}/node-alert.svg`,
      display: 'none',
    },
  };

  const rowBase = {
    refX: NODE_CARD_WIDTH - PAD_X,
    fontFamily: 'Inter, sans-serif',
    fontSize: 12,
    fontWeight: 400,
    fill: NODE_COLORS.rowText,
    textAnchor: 'end',
    textVerticalAnchor: 'middle',
    cursor: 'pointer',
  };
  const rowAttrs = nodeRowAttrs(rows);
  for (let i = 0; i < NODE_MAX_ROWS; i++) {
    attrs[`rowText_${i}`] = { ...rowBase, ...rowAttrs[`rowText_${i}`] };
  }

  return mergeAttrs(attrs, nodeLabelAttrs(typeTitle, label));
}

/** Markup + attrs của START / END: hình tròn 56 với icon 24 ở giữa, tên (nếu có) bên dưới */
export function nodeCircleView(
  type: 'START' | 'END',
  label: string,
  iconSrc: string = NODE_ICON_SRC[type],
): { markup: any[]; attrs: any } {
  const r = NODE_CIRCLE_SIZE / 2;
  return {
    markup: [
      { tagName: 'circle', selector: 'body' },
      { tagName: 'image', selector: 'iconImg' },
      { tagName: 'text', selector: 'nameText' },
    ],
    attrs: {
      body: {
        cx: r,
        cy: r,
        r: r - 0.5,
        fill: '#ffffff',
        stroke: NODE_COLORS.border,
        strokeWidth: 1,
        filter: NODE_SHADOW,
        cursor: 'pointer',
      },
      iconImg: {
        x: r - 12,
        y: r - 12,
        width: 24,
        height: 24,
        'xlink:href': iconSrc,
        href: iconSrc,
        cursor: 'pointer',
      },
      nameText: {
        refX: r,
        refY: '100%',
        refY2: 8,
        text: label || '',
        fontFamily: 'Inter, sans-serif',
        fontSize: 12,
        fontWeight: 500,
        fill: NODE_COLORS.typeText,
        textAnchor: 'middle',
        textVerticalAnchor: 'top',
        display: label ? 'block' : 'none',
        cursor: 'pointer',
      },
    },
  };
}

function mergeAttrs(base: any, extra: any): any {
  const out = { ...base };
  Object.keys(extra).forEach((key) => {
    out[key] = { ...(base[key] || {}), ...extra[key] };
  });
  return out;
}
