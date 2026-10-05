/** Style dây nối dùng chung cho mọi edge (kéo tay, flow mẫu, vẽ lại từ response) */
export const EDGE_COLOR = '#94a3b8';
export const EDGE_ACTIVE_COLOR = '#1677ff';

/** attrs cho edge mới: nét liền xám + mũi tên đặc ở đầu đích */
export function edgeAttrs(): any {
  return {
    line: {
      stroke: EDGE_COLOR,
      strokeWidth: 1.5,
      targetMarker: {
        name: 'block',
        width: 8,
        height: 8,
        fill: EDGE_COLOR,
        stroke: EDGE_COLOR,
      },
    },
  };
}
