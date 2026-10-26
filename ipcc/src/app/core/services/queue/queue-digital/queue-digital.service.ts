import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ResponseEnvelope } from "@core/models/response.model";
import { AbstractService } from "@core/services/abstract.service";
import { AuthService } from "@core/services/auth/auth.service";
import { ToastService } from "@core/services/toast-service";
import { Observable } from "rxjs";
import {
    ServiceQueues,
    ServiceQueueAgent, QueueParam, QueueDigitalFilterForm
} from "@core/models/queue/queue-digital/queue-digital.model";
import { TranslateService } from "@ngx-translate/core";
import { SERVICES } from "@env/environment";
import { QueueAgentStatusFilterForm, QueueFilterForm } from "@core/models/monitor/queue-monitor.model";
import { AgentAndQueueFilterForm } from "@core/models/monitor/agent-monitor.model";
import { TokenService } from "../../../../init/token.service";
import { SCOPE } from "../../../../app.constants";

@Injectable({ providedIn: 'root' })
export class QueueDigitalService extends AbstractService {

    credentials: any = {};

    listTicketScopes: string[] = [];

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private toastSvc: ToastService,
        private translate: TranslateService
    ) {
        super(http, toastSvc, translate);
        this.listTicketScopes = TokenService.getListScopes('acd-service');
    }

    get SERVICE_URL(): string {
        return `${SERVICES.ACD_SERVICE_API.url}/api/v1`;
    }

    get GET_QUEUE_AGENT_URL(): string {
        if (this.listTicketScopes.includes(SCOPE.QUEUE.VIEW_ALL_QUEUE))
            return `${this.SERVICE_URL}/queue-agents/list`;
        else if (this.listTicketScopes.includes(SCOPE.QUEUE.VIEW_QUEUE_SUPERVISOR))
            return `${this.SERVICE_URL}/queue-agents/monitor-list`;
        return '';
    }

    get GET_QUEUE_URL(): string {
        if (this.listTicketScopes.includes(SCOPE.QUEUE.VIEW_ALL_QUEUE))
            return `${this.SERVICE_URL}/queue/list`;
        else if (this.listTicketScopes.includes(SCOPE.QUEUE.VIEW_QUEUE_SUPERVISOR))
            return `${this.SERVICE_URL}/queue/monitor-list`;
        return '';
    }

    get GET_AGENT_STATUS_URL(): string {
        if (this.listTicketScopes.includes(SCOPE.QUEUE.VIEW_ALL_QUEUE))
            return `${this.SERVICE_URL}/queue/agent-status`;
        else if (this.listTicketScopes.includes(SCOPE.QUEUE.VIEW_QUEUE_SUPERVISOR))
            return `${this.SERVICE_URL}/queue/monitor-agent-status`;
        return '';
    }

    getListQueueAjax() {
        return `${this.SERVICE_URL}/queues/by-props`;
    }

    getQueueByChannelIds(channelIds?: any, groupId?: string): Observable<ResponseEnvelope<any>> {
        let filterForm: QueueDigitalFilterForm = {
            channelList: channelIds,
            groupId: groupId
        }
        return this.getRequest(`${this.getListQueueAjax()}`, { params: filterForm });
    }

    getListQueue(params: ServiceQueues): Observable<ResponseEnvelope<ServiceQueues[]>> {
        return this.getRequest(`${this.SERVICE_URL}/queues`, { params: params });
    }

    getListQueueParamBySourceCodeAndQueueManager(sourceCode: string, queueManagerId: string): Observable<ResponseEnvelope<any[]>> {
        return this.getRequest(`${this.SERVICE_URL}/queues/queue-to-transfer-agent?sourceCode=${sourceCode}&queueManagerId=${queueManagerId}`);
    }

    getListQueueAgent(queueId: string) {
        return `${this.SERVICE_URL}/queue-agents?queueId=${queueId}`;
    }

    getQueueById(queueId?: string): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/queues/${queueId}`)
    }

    getAlgorithm(paramId: number): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/params-queue-value?paramId=${paramId}`)
    }

    updateQueueParams(object: { queueId: string; paramId: string; value: any }[]): Observable<ResponseEnvelope<QueueParam>> {
        return this.putRequest(`${this.SERVICE_URL}/queue-params`, object)
    }

    updatePriority(object: object): Observable<ResponseEnvelope<any>> {
        return this.putRequest(`${this.SERVICE_URL}/queue-agents`, object)
    }

    createQueueAgents(object: ServiceQueueAgent[]): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/queue-agents`, object)
    }

    createQueueMonitor(object: any[]): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/queue-supervisors`, object)
    }

    createQueueBO(object: any[]): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/queues/bo`, object)
    }

    getQueueNotBoTransfer(groupId: string, channelId: number): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/queues/queue-to-transfer/${groupId}/${channelId}`)
    }

    getQueueBoTransfer(groupId: string): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/queues/queue-to-transfer-bo/${groupId}`)
    }

    public exportQueueAgent(queueId: string): Observable<any> {
        return this.getRequestFile(`${this.SERVICE_URL}/queue-agents/export?queueId=${queueId}`)
    }

    public validateQueueAgent(queueId: string, isDelete: boolean, formData: any) {
        return this.postRequest(`${this.SERVICE_URL}/queue-agents/validate?queueId=${queueId}&isDelete=${isDelete}`, formData)
    }

    public validateQueueMonitor(queueId: string, isDelete: boolean, formData: any) {
        return this.postRequest(`${this.SERVICE_URL}/queue-supervisors/validate?queueId=${queueId}&isDelete=${isDelete}`, formData)
    }

    public importQueueAgents(filePath: string, queueAgents: ServiceQueueAgent[]) {
        return this.postRequest(`${this.SERVICE_URL}/queue-agents/import?filePath=${filePath}`, queueAgents)
    }

    public importQueueMonitor(filePath: string, queueAgents: ServiceQueueAgent[]) {
        return this.postRequest(`${this.SERVICE_URL}/queue-supervisors/import?filePath=${filePath}`, queueAgents)
    }

    public deleteQueueAgentsFromFile(filePath: string, queueAgents: ServiceQueueAgent[]) {
        return this.postRequest(`${this.SERVICE_URL}/queue-agents/delete-file?filePath=${filePath}`, queueAgents)
    }

    public deleteQueueAgents(queueId: string, agentIds: string[]) {
        return this.postRequest(`${this.SERVICE_URL}/queue-agents/delete?queueId=${queueId}`, agentIds)
    }

    public deleteQueueMonitor(queueId: string, monitorIds: string[]) {
        return this.postRequest(`${this.SERVICE_URL}/queue-supervisors/delete?queueId=${queueId}`, monitorIds)
    }

    public getListQueuesAgents(param: AgentAndQueueFilterForm): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.GET_QUEUE_AGENT_URL}`, { params: param });
    }

    public getListQueues(param: QueueFilterForm): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.GET_QUEUE_URL}`, { params: param });
    }

    public getListAgentStatusInQueue(param: QueueAgentStatusFilterForm): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.GET_AGENT_STATUS_URL}`, { params: param });
    }
    getListQueueMonitor(queueId: string) {
        return `${this.SERVICE_URL}/queue-supervisors?queueId=${queueId}`;
    }

    getListEmailFromSend() {
        return this.getRequest(`${this.SERVICE_URL}/queue/email-from-send`);
    }

    getListQueueByQueueId(queueId: string[]) {
        return this.getRequest(`${this.SERVICE_URL}/queue/get-queue-report?queueId=${queueId}`);
    }

    public exportQueueSupervisor(queueId: string): Observable<any> {
        return this.getRequestFile(`${this.SERVICE_URL}/queue-supervisors/export?queueId=${queueId}`)
    }

    public deleteQueueSupervisorsFromFile(filePath: string, queueAgents: ServiceQueueAgent[]) {
        return this.postRequest(`${this.SERVICE_URL}/queue-supervisors/delete-file?filePath=${filePath}`, queueAgents)
    }

    public getListAgentFromGroup(groupId: string) {
        return this.getRequest(`${this.SERVICE_URL}/agent/filter-data?groupId=${groupId}`);
    }

    public getListQueueFromGroup(groupId: string) {
        return this.getRequest(`${this.SERVICE_URL}/queue/filter-data?groupId=${groupId}`);
    }

    public createQueueAgentManyData(object: any): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/queue-agents/add-many-data`, object)
    }

}
