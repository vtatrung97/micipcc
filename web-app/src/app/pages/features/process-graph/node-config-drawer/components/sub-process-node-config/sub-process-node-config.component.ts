import { Component, Input, OnInit } from '@angular/core';
import { NodePropertyModel } from '../../../graph-editor.component';
import { GraphBridgeService } from '../../../services/graph-bridge.service';
import { TemplateService, ProcessTemplateItem } from '@core/services/template.service';

@Component({
  selector: 'app-sub-process-node-config',
  templateUrl: './sub-process-node-config.component.html',
  styleUrls: ['./sub-process-node-config.component.scss']
})
export class SubProcessNodeConfigComponent implements OnInit {
  @Input() nodeProps!: NodePropertyModel;

  availableTemplates: ProcessTemplateItem[] = [];

  constructor(
    private bridgeService: GraphBridgeService,
    private templateService: TemplateService
  ) {}

  ngOnInit(): void {
    this.templateService.templates$.subscribe(list => {
      this.availableTemplates = list || [];
    });
  }

  public onPropChange(field?: keyof NodePropertyModel | 'all'): void {
    if (!this.nodeProps) return;
    const value = field && field !== 'all' ? this.nodeProps[field] : this.nodeProps;
    this.bridgeService.updateNodeProp(this.nodeProps.id, field || 'all', value, this.nodeProps);
  }
}
