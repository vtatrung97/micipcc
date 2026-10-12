import { validateBpmnConnection } from './ports.config';

export const DEFAULT_GRAPH_OPTIONS = {
  grid: {
    size: 15,
    visible: true,
    type: 'mesh',
    args: {
      color: '#e2e8f0',
      thickness: 1
    }
  },
  background: {
    color: '#ffffff'
  },
  connecting: {
    snap: true,
    allowBlank: false,
    allowMulti: false,
    allowLoop: false,
    highlight: true,
    connector: {
      name: 'rounded',
      args: {
        radius: 8
      }
    },
    router: {
      name: 'manhattan',
      args: {
        step: 10,
        padding: 10,
        startDirections: ['right', 'bottom'],
        endDirections: ['left', 'top']
      }
    },
    attrs: {
      line: {
        stroke: '#94a3b8',
        strokeWidth: 1.5,
        targetMarker: {
          name: 'block',
          width: 7,
          height: 7,
          fill: '#94a3b8'
        }
      }
    },
    validateConnection(params: any) {
      return validateBpmnConnection(params);
    }
  },
  panning: {
    enabled: true,
    modifiers: 'space'
  },
  mousewheel: {
    enabled: true,
    zoomAtMousePosition: true,
    modifiers: 'ctrl',
    minScale: 0.5,
    maxScale: 5
  }
};
