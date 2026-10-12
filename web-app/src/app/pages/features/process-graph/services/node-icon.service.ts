import { Injectable } from '@angular/core';
import { NODE_ICON_SRC, PALETTE_END_ICON_SRC } from '../config/node-view.config';
import { NodeType } from '../models/node-type';
import { GraphEditorStore } from '../state/graph-editor.store';

export interface NodeIconAsset {
  id: string;
  name: string;
  /** Đường dẫn asset (icon hệ thống) hoặc data URL (tệp tải lên) */
  src: string;
  isBuiltIn: boolean;
}

/** Loại bước được đổi icon (JOIN tự sinh, không hiện icon riêng) */
export const ICON_NODE_TYPES: NodeType[] = [
  'START', 'USER_TASK', 'SYSTEM_TASK', 'GATEWAY_EXCLUSIVE', 'GATEWAY_PARALLEL',
  'GATEWAY_INCLUSIVE', 'NOTIFICATION', 'SUB_PROCESS', 'END',
];

export const ICON_ACCEPT = ['image/svg+xml', 'image/png', 'image/jpeg'];
export const ICON_MAX_BYTES = 10 * 1024 * 1024;

const STORAGE_KEY = 'processx.nodeIcons.v1';

interface StoredState {
  /** Loại bước → id icon đang dùng */
  overrides: Partial<Record<NodeType, string>>;
  uploads: NodeIconAsset[];
}

/**
 * Icon của từng loại bước: icon hệ thống + tệp người dùng tải lên.
 * Đổi icon một loại → cập nhật Thư viện bước, mọi node cùng loại trên canvas và header drawer.
 * Provide ở GraphEditorComponent (cùng phạm vi với GraphEditorStore); lưu ở localStorage.
 */
@Injectable()
export class NodeIconService {
  readonly builtIns: NodeIconAsset[] = ICON_NODE_TYPES.map((type) => ({
    id: 'builtin:' + type,
    name: NODE_ICON_SRC[type].split('/').pop() || type,
    src: NODE_ICON_SRC[type],
    isBuiltIn: true,
  }));

  private state: StoredState = { overrides: {}, uploads: [] };

  constructor(private store: GraphEditorStore) {
    this.load();
  }

  /** Tệp tải lên (mới nhất trước) + icon hệ thống */
  get assets(): NodeIconAsset[] {
    return [...this.state.uploads].reverse().concat(this.builtIns);
  }

  /** Id icon đang dùng cho loại bước */
  getIconId(type: NodeType): string {
    const id = this.state.overrides[type];
    return id && this.findAsset(id) ? id : 'builtin:' + type;
  }

  /** Icon trên node canvas và header drawer */
  getIconSrc(type: NodeType): string {
    return this.findAsset(this.state.overrides[type] || '')?.src || NODE_ICON_SRC[type];
  }

  /** Icon trên Thư viện bước (Kết thúc mặc định dùng ô vuông riêng) */
  getPaletteIconSrc(type: NodeType): string {
    const custom = this.findAsset(this.state.overrides[type] || '');
    if (custom) return custom.src;
    return type === 'END' ? PALETTE_END_ICON_SRC : NODE_ICON_SRC[type];
  }

  setIcon(type: NodeType, iconId: string): void {
    if (iconId === 'builtin:' + type) delete this.state.overrides[type];
    else this.state.overrides[type] = iconId;
    this.save();
    this.applyToCanvas(type);
  }

  /** Đọc các tệp hợp lệ (SVG/JPG/PNG, ≤ 10MB) thành data URL. Trả về icon đã thêm + tên tệp bị loại. */
  async addFiles(files: File[]): Promise<{ added: NodeIconAsset[]; rejected: string[] }> {
    const added: NodeIconAsset[] = [];
    const rejected: string[] = [];
    for (const file of files) {
      if (!ICON_ACCEPT.includes(file.type) || file.size > ICON_MAX_BYTES) {
        rejected.push(file.name);
        continue;
      }
      const src = await this.readAsDataUrl(file);
      added.push({ id: `upload:${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: file.name, src, isBuiltIn: false });
    }
    this.state.uploads = [...this.state.uploads, ...added];
    this.save();
    return { added, rejected };
  }

  /** Xoá tệp tải lên; loại bước đang dùng tệp này quay về icon hệ thống */
  removeUpload(id: string): void {
    this.state.uploads = this.state.uploads.filter((a) => a.id !== id);
    ICON_NODE_TYPES.forEach((type) => {
      if (this.state.overrides[type] === id) {
        delete this.state.overrides[type];
        this.applyToCanvas(type);
      }
    });
    this.save();
  }

  private applyToCanvas(type: NodeType): void {
    const src = this.getIconSrc(type);
    (this.store.graph?.getNodes() || [])
      .filter((n: any) => n.getData()?.type === type)
      .forEach((n: any) => n.setAttrs({ iconImg: { 'xlink:href': src, href: src } }));
  }

  private findAsset(id: string): NodeIconAsset | undefined {
    return id ? this.assets.find((a) => a.id === id) : undefined;
  }

  private readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.state = { overrides: {}, uploads: [], ...JSON.parse(raw) };
    } catch {
      this.state = { overrides: {}, uploads: [] };
    }
  }

  /** localStorage đầy (tệp lớn) thì chỉ giữ trong phiên hiện tại */
  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // bỏ qua: vẫn dùng được tới khi tải lại trang
    }
  }
}
