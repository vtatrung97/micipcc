import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class X6GraphService {
  private graphInstance: any = null;
  private selectedCellSubject = new BehaviorSubject<string>('Chưa chọn node/edge nào');
  public selectedCell$: Observable<string> = this.selectedCellSubject.asObservable();

  public registerGraph(graph: any): void {
    this.graphInstance = graph;
  }

  public getGraph(): any {
    return this.graphInstance;
  }

  public setSelectedCell(info: string): void {
    this.selectedCellSubject.next(info);
  }

  public zoomIn(): void {
    if (this.graphInstance) this.graphInstance.zoom(0.15);
  }

  public zoomOut(): void {
    if (this.graphInstance) this.graphInstance.zoom(-0.15);
  }

  public resetZoom(): void {
    if (this.graphInstance) {
      this.graphInstance.zoomTo(1);
      this.graphInstance.centerContent();
    }
  }

  public center(): void {
    if (this.graphInstance) this.graphInstance.centerContent();
  }
}
