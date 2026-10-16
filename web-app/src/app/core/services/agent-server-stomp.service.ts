import {Injectable} from "@angular/core";


import {AbstractService} from "./abstract.service";

// @ts-ignore
import {StompService} from "./stomp.service";

import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, interval, Observable, Observer} from "rxjs";
import {AuthService} from "@core/services/auth/auth.service";
import {environment} from "@env/environment";
// @ts-ignore
import {v4 as uuidv4} from 'uuid';
import {ToastService} from "./toast-service";
import {TranslateService} from "@ngx-translate/core";


@Injectable({providedIn: 'root'})
export class AgentServerStompService extends AbstractService {

    stompServiceConnected: boolean = false;
    asConnected$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    clientUUID: string = 'clientUUID';
    private reconnectFailCount: number = 0;

    constructor(private http: HttpClient,
                private authService: AuthService,
                private stompService: StompService,
                private toastSvc: ToastService,
                private translateSvc: TranslateService) {
        super(http, toastSvc, translateSvc);
    }

    get SERVICE_URL(): string {
        return "";
    }

    public connectToAgentServer(): void {

        const startConnect = () => {
            this.stompService.startConnect().then(() => {
                console.log('AGENT SERVER connected');
                this.stompService.done('connected');
                this.connectedCallback();
                this.reconnectFailCount = 0;
                this.asConnected$.next(true);
            });
        };
        //global._startConnectToAgentServer = startConnect;

        //this.clientUUID = this.authService.sessionId;
        this.stompService.configure({
            host: "/websocket",
            debug: environment.stompDebug,
            queue: {'connected': false},
            headers: {
                'clientUUID': this.clientUUID,
                'accessToken': this.authService.accessToken,
                'tenant': this.authService.tenant,
                // 'timeZone': this.authService.timeZone
            }
        });

        this.stompService.onError = (error: string) => {
            this.stompServiceConnected = false;
            console.error(`stompService error: ${error}`);
            if (error.indexOf('Lost connection') !== -1) {
                this.asConnected$.next(false);
                this.reconnectFailCount += 1;
                if (this.reconnectFailCount <= 10) {
                    console.log(`[TicketUI] STOMP: Attempting [${this.reconnectFailCount}] to reconnect in 5 seconds`);
                    setTimeout(startConnect, 5000);
                } else {
                    /*this.notificationSvc.smallBox({
                        title: "Lost connection to Agent Server",
                        content: "Try reconnecting or press F5" +
                            "<p class='text-align-right'>" +
                            "<a href-void class='btn btn-primary btn-sm' onclick='global._startConnectToAgentServer()'>Reconnect</a> " +
                            "</p>",
                        color: "#C79121",
                        icon: "fa fa-unlink swing animated"
                    });*/
                }
            }
        };

        startConnect();
    }

    public disconnectFromAgentServer() {
        if (this.stompService.stomp) {
            this.stompService.disconnect().then(() => {
                this.stompServiceConnected = false;
                console.log('AGENT SERVER disconnected');
                this.asConnected$.next(false);
            });
        }
        if (this.stompService.config) {
            this.stompService.pending('connected');
        }
    }

    private connectedCallback(): void {
        this.stompService.subscribe('/user/topic/sample-controller-response', console.log, {id: this.randomSubscriptionId()})
        this.stompService.subscribe('/user/exchange/amq.topic/sample-controller-response', console.log, {id: this.randomSubscriptionId()})
        this.stompService.subscribe('/user/exchange/amq.direct/sample-controller-response', console.log, {id: this.randomSubscriptionId()})

        interval(5000).subscribe((n: any) => {
            this.stompService.send('/app/sample-controller/topic', {});
            this.stompService.send('/app/sample-controller/exchange-topic', {});
            this.stompService.send('/app/sample-controller/exchange-direct', {});
            this.stompService.send('/app/sample-controller/messaging-template-convert-and-send-to-user', {});
        });

        this.stompService.subscribe('/topic/sample-controller-response', console.log, {id: this.randomSubscriptionId()})
        interval(5000).subscribe((n: any) => {
            this.stompService.send('/app/sample-controller/messaging-template-convert-and-send', {});
        });
    }

    private createResourceRequestObservable(resourceURI: string, body: any, destinationTopic: string): Observable<any> {
        return Observable.create((observer: Observer<any>) => {
            const onMessage = (message: any) => {
                observer.next(message);
                observer.complete();
            };
            const sub = this.stompService.subscribe(destinationTopic, onMessage, {id: this.randomSubscriptionId()});
            // this.stompService.send(resourceURI, body);
            setTimeout(() => this.stompService.send(resourceURI, body), 500);
            return () => sub.unsubscribe();
        });
    }

    private randomSubscriptionId(): string {
        return `sub-${uuidv4()}`;
    }

    /*----------------------------------------------------------------------------------------------------------------*/
    public requestDailyAgentStat(): Observable<any> {
        return this.createResourceRequestObservable(
            '/app/stat.daily-agent-statistics',
            {},
            '/user/queue/daily-agent-statistics'
        );
    }
}
