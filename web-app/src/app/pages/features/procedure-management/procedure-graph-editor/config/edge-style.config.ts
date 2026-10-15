export const EDGE_COLOR = '#a1a1a1';
export const EDGE_ACTIVE_COLOR = '#ed0231'; // khi hover / chọn

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
