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
      name: 'smooth'
    },
    router: {
      name: 'manhattan',
      args: {
        padding: 16
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
    maxScale: 2
  }
};
