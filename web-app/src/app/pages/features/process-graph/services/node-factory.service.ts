import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NodePropertyModel, ConditionBranch, PaletteItem } from '../models/node-property.model';
import { NodeType, isGatewayType } from '../models/node-type';
import { PALETTE_ITEMS } from '../config/palette.config';
import { BPMN_PORT_GROUPS, getNodePortItems, TranslateFn } from '../config/ports.config';
import { GraphEditorStore } from '../state/graph-editor.store';

/** Dựng card node (giao diện, cổng) theo type, sinh mã bước, icon. */
@Injectable()
export class NodeFactoryService {
  constructor(
    private translate: TranslateService,
    private store: GraphEditorStore
  ) {}

  /** Dịch key trong PROCESS_GRAPH.* (xem i18n/vi.json, en.json) */
  private t(key: string, params?: Record<string, any>): string {
    return this.translate.instant('PROCESS_GRAPH.' + key, params);
  }

  /** Hàm dịch truyền vào các hàm thuần trong ports.config */
  private readonly tFn: TranslateFn = (key, params) => this.translate.instant(key, params);


  public truncateLabel(text: string, maxLen: number = 16): string {
    if (!text) return '';
    const trimmed = text.trim();
    return trimmed.length > maxLen
      ? trimmed.slice(0, maxLen - 1) + '…'
      : trimmed;
  }


  /** Định nghĩa hiển thị theo type. START / JOIN không có trên Thư viện bước nên tự dựng. */
  public getPaletteDef(type: NodeType): PaletteItem {
    const found = PALETTE_ITEMS.find((p) => p.type === type);
    if (found) {
      // Tên / tooltip hiển thị lấy theo ngôn ngữ hiện tại
      return {
        ...found,
        typeTitle: this.t(`PALETTE.ITEMS.${type}.TITLE`),
        tooltipText: this.t(`PALETTE.ITEMS.${type}.TOOLTIP`),
      };
    }
    const title = this.t(`NODE_TYPES.${type}`);
    return {
      type,
      category: 'general',
      typeTitle: title,
      defaultName: title,
      icon: type === 'JOIN' ? 'merge' : 'play',
      label: title,
      badge: type,
      bg: '#f8fafc',
      border: '#e2e8f0',
      color: '#475569',
      tooltipText: title,
    };
  }


  public getNodeTypeBg(type: NodeType): string {
    const item = PALETTE_ITEMS.find((p) => p.type === type);
    return item?.bg || '#f0f5ff';
  }


  public getNodeTypeBorder(type: NodeType): string {
    const item = PALETTE_ITEMS.find((p) => p.type === type);
    return item?.border || '#cbd5e1';
  }


  public getNodeTypeColor(type: NodeType): string {
    const item = PALETTE_ITEMS.find((p) => p.type === type);
    return item?.color || '#1677ff';
  }


  public getNodeSvgDataUri(type: NodeType): string {
    const strokeWidth = '1.8';
    const svgMap: Record<NodeType, string> = {
      START: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
      USER_TASK: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
      SYSTEM_TASK: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
      GATEWAY_EXCLUSIVE: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 12l10 10 10-10L12 2z"></path><line x1="9.5" y1="9.5" x2="14.5" y2="14.5"></line><line x1="14.5" y1="9.5" x2="9.5" y2="14.5"></line></svg>`,
      GATEWAY_PARALLEL: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 12l10 10 10-10L12 2z"></path><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`,
      GATEWAY_INCLUSIVE: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 12l10 10 10-10L12 2z"></path><circle cx="12" cy="12" r="3.5"></circle></svg>`,
      JOIN: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v6a3 3 0 0 0 3 3h9"></path><path d="M6 21v-6a3 3 0 0 1 3-3"></path><polyline points="15 9 18 12 15 15"></polyline></svg>`,
      NOTIFICATION: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
      SUB_PROCESS: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="18" r="3"></circle><path d="M9 6h3a6 6 0 0 1 6 6v3"></path><line x1="6" y1="9" x2="6" y2="15"></line></svg>`,
      END: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="3"></rect></svg>`,
    };
    const raw = svgMap[type] || svgMap.USER_TASK;
    return `data:image/svg+xml;utf8,${encodeURIComponent(raw.trim())}`;
  }


  public generateNodeKey(type: NodeType, label: string): string {
    const prefixMap: Record<NodeType, string> = {
      START: 'STA',
      USER_TASK: 'TSK',
      SYSTEM_TASK: 'ACT',
      GATEWAY_EXCLUSIVE: 'GWX',
      GATEWAY_PARALLEL: 'GWP',
      GATEWAY_INCLUSIVE: 'GWI',
      JOIN: 'JON',
      NOTIFICATION: 'NTF',
      SUB_PROCESS: 'SUB',
      END: 'END',
    };
    const prefix = prefixMap[type] || 'STEP';
    const cleanLabel = (label || '')
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 15);
    return cleanLabel
      ? `${prefix}_${cleanLabel}`
      : `${prefix}_${Math.floor(1000 + Math.random() * 9000)}`;
  }


  // 2. MINI COMPACT CARD NODE FACTORY (CHUẨN GIAO DIỆN 168px x 48px - 2 DÒNG PHÂN CẤP)
  public createCompactCardNode(
    type: NodeType,
    x: number,
    y: number,
    label?: string,
    customData?: any,
  ): any {
    if (!this.store.graph) return null;

    const itemDef = this.getPaletteDef(type);
    const nodeLabel =
      label !== undefined
        ? label
        : customData?.label !== undefined
          ? customData.label
          : '';

    // 1. TRIGGER BPMN EVENT: Circle 42px, subtle shadow, red inner circle with white play triangle, single out port on right
    if (type === 'START') {
      const portItems = getNodePortItems('START', customData, 42, this.tFn);
      const node = this.store.graph.addNode({
        id: customData?.id,
        shape: 'rect',
        x,
        y,
        width: 42,
        height: 42,
        markup: [
          { tagName: 'circle', selector: 'shadowCircle' },
          { tagName: 'circle', selector: 'body' },
          { tagName: 'circle', selector: 'innerCircle' },
          { tagName: 'polygon', selector: 'playTriangle' },
          { tagName: 'text', selector: 'nameText' },
        ],
        attrs: {
          shadowCircle: {
            cx: 21,
            cy: 21,
            r: 20,
            fill: '#ffffff',
            stroke: '#e2e8f0',
            strokeWidth: 1.5,
            cursor: 'pointer',
          },
          body: {
            cx: 21,
            cy: 21,
            r: 18,
            fill: '#ffffff',
            stroke: 'none',
            cursor: 'pointer',
          },
          innerCircle: {
            cx: 21,
            cy: 21,
            r: 12,
            fill: '#ef4444',
            stroke: 'none',
            cursor: 'pointer',
          },
          playTriangle: {
            points: '18,15 18,27 27,21',
            fill: '#ffffff',
            cursor: 'pointer',
          },
          nameText: {
            ref: 'shadowCircle',
            refX: 21,
            refY: '100%',
            refY2: 6,
            text: nodeLabel || '',
            fontSize: 11,
            fontWeight: 500,
            fill: '#475569',
            textAnchor: 'middle',
            textVerticalAnchor: 'top',
            cursor: 'pointer',
            display: nodeLabel ? 'block' : 'none',
          },
        },
        ports: {
          groups: BPMN_PORT_GROUPS,
          items: portItems,
        },
      });
      const initialData: NodePropertyModel = {
        id: node.id,
        nodeKey: customData?.nodeKey || this.generateNodeKey(type, nodeLabel),
        type,
        typeTitle: itemDef.typeTitle,
        label: nodeLabel,
        icon: '▶',
        description: customData?.description || '',
        triggerEvent:
          customData?.triggerEvent || 'Inbound Call (Tổng đài 1800xxxx)',
        ...customData,
      };
      node.setData(initialData);
      return node;
    }

    // 2. END BPMN EVENT: Circle 42px, red ring with red stop square, single in port on left
    if (type === 'END') {
      const portItems = getNodePortItems('END', customData, 42, this.tFn);
      const node = this.store.graph.addNode({
        id: customData?.id,
        shape: 'rect',
        x,
        y,
        width: 42,
        height: 42,
        markup: [
          { tagName: 'circle', selector: 'shadowCircle' },
          { tagName: 'circle', selector: 'body' },
          { tagName: 'circle', selector: 'innerRing' },
          { tagName: 'rect', selector: 'centerSquare' },
          { tagName: 'text', selector: 'nameText' },
        ],
        attrs: {
          shadowCircle: {
            cx: 21,
            cy: 21,
            r: 20,
            fill: '#ffffff',
            stroke: '#e2e8f0',
            strokeWidth: 1.5,
            cursor: 'pointer',
          },
          body: {
            cx: 21,
            cy: 21,
            r: 18,
            fill: '#ffffff',
            stroke: 'none',
            cursor: 'pointer',
          },
          innerRing: {
            cx: 21,
            cy: 21,
            r: 12,
            fill: '#ffffff',
            stroke: '#ef4444',
            strokeWidth: 2,
            cursor: 'pointer',
          },
          centerSquare: {
            x: 16,
            y: 16,
            width: 10,
            height: 10,
            rx: 2,
            fill: '#ef4444',
            stroke: 'none',
            cursor: 'pointer',
          },
          nameText: {
            ref: 'shadowCircle',
            refX: 21,
            refY: '100%',
            refY2: 6,
            text: nodeLabel || '',
            fontSize: 11,
            fontWeight: 500,
            fill: '#475569',
            textAnchor: 'middle',
            textVerticalAnchor: 'top',
            cursor: 'pointer',
            display: nodeLabel ? 'block' : 'none',
          },
        },
        ports: {
          groups: BPMN_PORT_GROUPS,
          items: portItems,
        },
      });
      const initialData: NodePropertyModel = {
        id: node.id,
        nodeKey: customData?.nodeKey || this.generateNodeKey(type, nodeLabel),
        type,
        typeTitle: itemDef.typeTitle,
        label: nodeLabel,
        icon: '⏹',
        description: customData?.description || '',
        ...customData,
      };
      node.setData(initialData);
      return node;
    }

    const isCondition = isGatewayType(type);
    const isApprovalTask = type === 'USER_TASK' && !!customData?.isApprovalStep;
    const isActionException =
      type === 'SYSTEM_TASK' && !!customData?.hasExceptionPort;

    let branches: ConditionBranch[] = isCondition
      ? customData?.branches && customData.branches.length > 0
        ? [...customData.branches]
        : [
            {
              id: 'br-1',
              name: this.t('CANVAS.DEFAULT_CASE_NAME'),
              value: 'du_thong_tin',
              expression: '${flow.variables.du_thong_tin == true}',
              variableSource: 'flow.variables',
              isDefault: false,
            },
            {
              id: 'br-default',
              name: this.t('CANVAS.DEFAULT_BRANCH'),
              value: 'default',
              expression: 'default',
              variableSource: 'flow.variables',
              isDefault: true,
            },
          ]
      : [];

    if (isCondition) {
      const defaultIdx = branches.findIndex((b) => b.isDefault);
      if (defaultIdx === -1) {
        branches.push({
          id: 'br-default',
          name: this.t('CANVAS.DEFAULT_BRANCH'),
          value: 'default',
          expression: 'default',
          variableSource: 'flow.variables',
          isDefault: true,
        });
      } else if (defaultIdx !== branches.length - 1) {
        const [defBr] = branches.splice(defaultIdx, 1);
        branches.push(defBr);
      }
    }

    const cardWidth = 180;
    const nodeHeight = isCondition
      ? 44 + branches.length * 20 + 6
      : isApprovalTask || isActionException
        ? 90
        : 48;

    // Dynamic SVG markup
    const markup: any[] = [
      { tagName: 'rect', selector: 'body' },
      { tagName: 'rect', selector: 'iconBox' },
      { tagName: 'image', selector: 'iconImg' },
      { tagName: 'text', selector: 'nameText' },
      { tagName: 'circle', selector: 'warningBg' },
      { tagName: 'text', selector: 'warningText' },
      { tagName: 'text', selector: 'moreBtn' },
    ];

    // Pre-declare rowText_0 through rowText_15 for multi-row nodes
    for (let i = 0; i < 16; i++) {
      markup.push({ tagName: 'text', selector: `rowText_${i}` });
    }

    const attrs: any = {
      body: {
        refWidth: '100%',
        refHeight: '100%',
        rx: 10,
        ry: 10,
        fill: '#ffffff',
        stroke: '#e2e8f0',
        strokeWidth: 1.2,
        cursor: 'pointer',
      },
      iconBox: {
        ref: 'body',
        refX: 9,
        refY: isCondition ? 7 : 9,
        width: 30,
        height: 30,
        rx: 7,
        ry: 7,
        fill: isCondition ? '#f8fafc' : itemDef.bg,
        stroke: isCondition ? '#e2e8f0' : itemDef.border || '#e2e8f0',
        strokeWidth: 1,
      },
      iconImg: {
        ref: 'body',
        refX: 15,
        refY: isCondition ? 13 : 15,
        width: 18,
        height: 18,
        'xlink:href': this.getNodeSvgDataUri(type),
        href: this.getNodeSvgDataUri(type),
      },
      nameText: {
        ref: 'body',
        refX: 46,
        refY: isCondition ? 22 : 24,
        text: this.truncateLabel(
          nodeLabel || itemDef.typeTitle,
          isCondition ? 15 : 20,
        ),
        fontSize: isCondition ? 12 : 12.5,
        fontWeight: isCondition ? 600 : 500,
        fill: '#1e293b',
        textAnchor: 'start',
        textVerticalAnchor: 'middle',
      },
      warningBg: {
        ref: 'body',
        refX: cardWidth - 28,
        refY: 16,
        r: 6,
        fill: '#eab308',
        stroke: 'none',
        display: isCondition ? 'block' : 'none',
      },
      warningText: {
        ref: 'body',
        refX: cardWidth - 28,
        refY: 16,
        text: '!',
        fontSize: 9,
        fontWeight: 800,
        fill: '#ffffff',
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
        display: isCondition ? 'block' : 'none',
      },
      moreBtn: {
        ref: 'body',
        refX: cardWidth - 14,
        refY: isCondition ? 16 : 24,
        text: '⋮',
        fontSize: 16,
        fontWeight: 700,
        fill: '#94a3b8',
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
        cursor: 'pointer',
      },
    };

    for (let i = 0; i < 16; i++) {
      if (isCondition) {
        if (i < branches.length) {
          const br = branches[i];
          const displayText =
            br.isDefault
            ? this.t('CANVAS.DEFAULT_BRANCH')
            : br.name || br.defaultLabel || this.t('CANVAS.BRANCH_N', { index: i + 1 });
          attrs[`rowText_${i}`] = {
            ref: 'body',
            refX: cardWidth - 14,
            refY: 48 + i * 20,
            text: this.truncateLabel(displayText, 18),
            fontSize: 11,
            fontWeight: 400,
            fill: '#64748b',
            textAnchor: 'end',
            textVerticalAnchor: 'middle',
            display: 'block',
          };
        } else {
          attrs[`rowText_${i}`] = {
            ref: 'body',
            refX: 14,
            refY: 48 + i * 20,
            fontSize: 11,
            fontWeight: 400,
            fill: '#64748b',
            textAnchor: 'start',
            textVerticalAnchor: 'middle',
            display: 'none',
          };
        }
      } else if (isActionException) {
        if (i === 0) {
          attrs[`rowText_${i}`] = {
            ref: 'body',
            refX: cardWidth - 14,
            refY: 60,
            text: this.t('CANVAS.SUCCESS'),
            fontSize: 11,
            fontWeight: 400,
            fill: '#64748b',
            textAnchor: 'end',
            textVerticalAnchor: 'middle',
            display: 'block',
          };
        } else if (i === 1) {
          attrs[`rowText_${i}`] = {
            ref: 'body',
            refX: cardWidth - 14,
            refY: 82,
            text: this.t('CANVAS.FAILURE'),
            fontSize: 11,
            fontWeight: 400,
            fill: '#64748b',
            textAnchor: 'end',
            textVerticalAnchor: 'middle',
            display: 'block',
          };
        } else {
          attrs[`rowText_${i}`] = {
            ref: 'body',
            refX: 14,
            refY: 60 + i * 22,
            fontSize: 11,
            fontWeight: 400,
            fill: '#475569',
            textAnchor: 'start',
            textVerticalAnchor: 'middle',
            display: 'none',
          };
        }
      } else {
        attrs[`rowText_${i}`] = {
          ref: 'body',
          refX: 14,
          refY: 60 + i * 22,
          fontSize: 11,
          fontWeight: 400,
          fill: '#475569',
          textAnchor: 'start',
          textVerticalAnchor: 'middle',
          display: 'none',
        };
      }
    }

    const portItems = getNodePortItems(
      type,
      {
        ...customData,
        branches,
        isApprovalStep: isApprovalTask,
        hasExceptionPort: isActionException,
      },
      cardWidth,
      this.tFn,
    );

    const node = this.store.graph.addNode({
      id: customData?.id,
      shape: 'rect',
      x,
      y,
      width: cardWidth,
      height: nodeHeight,
      markup,
      attrs,
      ports: {
        groups: BPMN_PORT_GROUPS,
        items: portItems,
      },
    });

    const initialData: NodePropertyModel = {
      id: node.id,
      nodeKey: customData?.nodeKey || this.generateNodeKey(type, nodeLabel),
      type,
      typeTitle: itemDef.typeTitle,
      label: nodeLabel,
      icon: itemDef.icon,
      description: customData?.description || '',
      isApprovalStep: isApprovalTask,

      // Action fields (US-34, BR-INT-01..05, REQ-11)
      actionSource: customData?.actionSource || 'library',
      actionLibraryId:
        customData?.actionLibraryId ||
        (type === 'SYSTEM_TASK' ? 'act-ipcc-api' : undefined),
      actionMethod: customData?.actionMethod || 'POST',
      actionEndpoint:
        customData?.actionEndpoint ||
        (type === 'SYSTEM_TASK'
          ? 'https://ipcc.vnpt.vn/api/v2/call/dispatch'
          : ''),
      requestBodyMapping:
        customData?.requestBodyMapping ||
        (type === 'SYSTEM_TASK'
          ? '{\n  "callId": "${flow.variables.call_id}",\n  "queue": "HOTLINE_1800"\n}'
          : ''),
      responseMapping:
        customData?.responseMapping ||
        (type === 'SYSTEM_TASK'
          ? 'flow.variables.ticket_id = response.data.ticketId;'
          : ''),
      slaSeconds:
        customData?.slaSeconds !== undefined ? customData?.slaSeconds : 3,
      retryCount:
        customData?.retryCount !== undefined ? customData?.retryCount : 3,
      retryInterval: customData?.retryInterval || '5s',
      circuitBreakerTimeoutMs:
        customData?.circuitBreakerTimeoutMs !== undefined
          ? customData?.circuitBreakerTimeoutMs
          : 3000,

      // Condition fields (Exclusive Gateway - Multi-branch)
      branches:
        customData?.branches ||
        (isCondition
          ? [
              {
                id: 'br-default',
                name: this.t('CANVAS.DEFAULT_BRANCH'),
                value: 'default',
                expression: 'default',
                variableSource: 'flow.variables',
                isDefault: true,
              },
            ]
          : undefined),
      servicePivotSource: customData?.servicePivotSource || 'flow.variables',
      conditionVariable: customData?.conditionVariable || 'flow.variables.cuoc',
      conditionRule: customData?.conditionRule || 'cuoc_phat_sinh > 500000',

      // General task/trigger fields
      timeout: customData?.timeout || '30 phút',
      sla: customData?.sla || '2h SLA',
      assignee: customData?.assignee || 'Điện thoại viên (FO/BO)',
      triggerEvent:
        customData?.triggerEvent || 'Inbound Call (Tổng đài 1800xxxx)',
      ...customData,
    };
    node.setData(initialData);
    return node;
  }
}
