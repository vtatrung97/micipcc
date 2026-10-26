import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RemoteLoaderService } from '@core/services/remote-loader.service';

@Component({
  selector: 'app-procedure-management',
  templateUrl: './procedure-management.component.html'
})
export class ProcedureManagementComponent implements OnInit {
  isLoading = true;
  isLoaded = false;

  constructor(
    private remoteLoader: RemoteLoaderService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.isLoading = true;
      await this.remoteLoader.loadProcessXScripts();
      this.isLoaded = true;
      this.isLoading = false;
      this.cdr.detectChanges();
    } catch (err) {
      console.error('[Host IPCC] Nạp Procedure Management thất bại:', err);
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }
}
