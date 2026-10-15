import {Injectable, NgZone} from "@angular/core";
import {AbstractService} from "./abstract.service";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "./auth/auth.service";
import {Observable} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {ToastService} from "./toast-service";
import {SERVICES} from "@env/environment";
import {TranslateService} from "@ngx-translate/core";
import {AgentQueueModel} from "@core/models/monitor/agent-monitor.model";
import {QueueModel} from "@core/models/monitor/queue-monitor.model";

@Injectable({ providedIn: 'root' })
export class ServerTimeService extends AbstractService {
    private timeDiff: number = 0
    constructor(private http: HttpClient, private authSvc: AuthService, private toastSvc: ToastService, private translate: TranslateService, private ngZone: NgZone,) {
        super(http, toastSvc, translate);


    }

    public getServerTimeApi():  Observable<ResponseEnvelope<any>>{
        return this.getRequest(`${this.SERVICE_URL}`);
    }

    public async initServerTime(){
        if (!this.timeDiff) {
            let timeRes = await this.getServerTimeApi().toPromise()
            let localTime = new Date().getTime()
            let serverTime = timeRes.data
            this.timeDiff = serverTime - localTime
            if (Math.abs(this.timeDiff) >= 60000*5) {
                this.toastSvc.showWarning(this.translate.instant("Thời gian hệ thống và thời gian trên máy tính của bạn đang bị chênh lệch hơn 5 phút, vui lòng đặt lại giờ trên máy tính và tải lại trang để hệ thống hoạt động đúng! "));
            }
        }

        setInterval(() => {
              this.getServerTimeApi().subscribe((res) => {
                  let localTime = new Date().getTime()
                  let serverTime = res.data
                  this.timeDiff = serverTime - localTime

                  if (Math.abs(this.timeDiff) >= 60000*5) {
                      this.toastSvc.showWarning(this.translate.instant("Thời gian hệ thống và thời gian trên máy tính của bạn đang bị chênh lệch hơn 5 phút, vui lòng đặt lại giờ trên máy tính và tải lại trang để hệ thống hoạt động đúng! "));
                  }
              })
        }, 60000*5)
    }

    public getServerTime() {
        return new Date().getTime() + this.timeDiff
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/server-time`;
    }
}
