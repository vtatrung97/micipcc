import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NodeType } from '../models/node-type';
import { GraphEditorStore } from '../state/graph-editor.store';
import { NodeFactoryService } from './node-factory.service';

/** Cặp Gateway ⇄ JOIN: tự sinh JOIN khi tạo node điều kiện. */
@Injectable()
export class GatewayJoinService {
  constructor(
    private translate: TranslateService,
    private store: GraphEditorStore,
    private factory: NodeFactoryService
  ) {}

  /** Dịch key trong PROCESS_GRAPH.* (xem i18n/vi.json, en.json) */
  private t(key: string, params?: Record<string, any>): string {
    return this.translate.instant('PROCESS_GRAPH.' + key, params);
  }


  // 7. CẶP GATEWAY ⇄ JOIN (JOIN tự sinh khi tạo node điều kiện)
  public linkGatewayJoin(gateway: any, join: any): void {
    if (!gateway || !join) return;
    gateway.setData({ ...(gateway.getData() || {}), joinNodeId: join.id });
    join.setData({ ...(join.getData() || {}), gatewayNodeId: gateway.id });
  }


  /** Tạo node JOIN đi kèm gateway vừa thêm, đặt lệch sang phải */
  public createJoinForGateway(gateway: any): void {
    if (!gateway || !this.store.graph) return;
    const type = gateway.getData()?.type as NodeType;
    const pos = gateway.getPosition();
    const join = this.factory.createCompactCardNode(
      'JOIN',
      pos.x + 360,
      pos.y,
      this.t(`JOIN_LABELS.${type}`),
    );
    this.linkGatewayJoin(gateway, join);
  }
}
