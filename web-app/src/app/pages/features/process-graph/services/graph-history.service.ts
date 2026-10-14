import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GraphEditorStore } from '../state/graph-editor.store';

/** Undo / Redo bằng snapshot graph.toJSON(). */
@Injectable()
export class GraphHistoryService {
  private historyStack: any[] = [];
  private redoStack: any[] = [];
  private readonly MAX_STACK_SIZE = 25;

  constructor(
    private translate: TranslateService,
    private store: GraphEditorStore
  ) {}

  /** Dịch key trong PROCESS_GRAPH.* (xem i18n/vi.json, en.json) */
  private t(key: string, params?: Record<string, any>): string {
    return this.translate.instant('PROCESS_GRAPH.' + key, params);
  }


  // 3. FLOATING TOOLBAR CONTROLS
  public pushHistorySnapshot(): void {
    if (this.store.isUndoRedoAction || !this.store.graph) return;
    const snapshot = this.store.graph.toJSON();
    if (this.historyStack.length >= this.MAX_STACK_SIZE) {
      this.historyStack.shift();
    }
    this.historyStack.push(snapshot);
    this.redoStack = [];
    this.updateCanUndoRedo();
  }


  public undo(): void {
    if (!this.store.canUndo || !this.store.graph) return;
    const currentSnapshot = this.store.graph.toJSON();
    this.redoStack.push(currentSnapshot);

    const prevSnapshot = this.historyStack.pop();
    if (prevSnapshot) {
      this.store.isUndoRedoAction = true;
      this.store.graph.fromJSON(prevSnapshot);
      this.store.isUndoRedoAction = false;
      this.store.updateCounts();
    }
    this.updateCanUndoRedo();
    this.store.selectedCellInfo = this.t('STATUS.UNDO');
  }


  public redo(): void {
    if (!this.store.canRedo || !this.store.graph) return;
    const nextSnapshot = this.redoStack.pop();
    if (nextSnapshot) {
      const currentSnapshot = this.store.graph.toJSON();
      this.historyStack.push(currentSnapshot);

      this.store.isUndoRedoAction = true;
      this.store.graph.fromJSON(nextSnapshot);
      this.store.isUndoRedoAction = false;
      this.store.updateCounts();
    }
    this.updateCanUndoRedo();
    this.store.selectedCellInfo = this.t('STATUS.REDO');
  }


  /** Xoá lịch sử (vd: sau khi nạp xong flow ở chế độ xem) */
  public reset(): void {
    this.historyStack = [];
    this.redoStack = [];
    this.updateCanUndoRedo();
  }

  public updateCanUndoRedo(): void {
    this.store.canUndo = this.historyStack.length > 0;
    this.store.canRedo = this.redoStack.length > 0;
  }
}
