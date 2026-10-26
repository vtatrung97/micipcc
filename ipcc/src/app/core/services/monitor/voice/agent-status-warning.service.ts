import {ChangeDetectorRef, Injectable} from '@angular/core';
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";

import {SERVICES} from "@env/environment";
import {TranslateService} from "@ngx-translate/core";
import {forkJoin, Observable} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {KeysPipe} from "@shared/pipes/keys.pipe";
import {AgentServerStompService} from "@core/services/rx-stomp/agent-server/agent-server-stomp.service";
import {QueueDigitalService} from "@core/services/queue/queue-digital/queue-digital.service";
import {QueueControllerService} from "@pages/settings/queue/queue/queue-controller.service";
import {AgentService} from "@core/services/monitor/voice/agent.service";
import {AsRestService} from "@core/services/monitor/as-rest.service";
import {GroupService} from "@core/services/ccms-service/group.service";
import {NotificationEventService} from "@core/services/notification/notification-event.service";
import {AgentVoiceStatus} from "@models/acd/agent.model";

@Injectable({providedIn: 'root'})
export class AgentStatusWarningService extends AbstractService {

    constructor(
        private http: HttpClient,
        private authSvc: AuthService,
        private toastSvc: ToastService,
        private translateSvc: TranslateService,
        private keysPipe: KeysPipe,
        public translate: TranslateService,
        private stomp: AgentServerStompService,
        private queueDigitalService: QueueDigitalService,
        private queueControllerService: QueueControllerService,
        private agentService: AgentService,
        private asRestSrv: AsRestService,
        private groupSrv: GroupService,
        private notificationEventService: NotificationEventService
    ) {
        super(http, toastSvc, translateSvc);
    }

    get SERVICE_URL(): string {
        return "";
    }


    checkWarning() {

        forkJoin([
            this.groupSrv.getAllGroups(),
            this.agentService.listAgent()]
        ).subscribe(results => {

            let agents = results[1].data;
            let listGroup = results[0].data

            listGroup.forEach((group:any) => {
                group.ancestor = []
                let parentGroupId = group.parentGroup
                while (parentGroupId) {
                    let groupParent = this.getGroupById(parentGroupId, listGroup)
                    if (groupParent) {
                        group.ancestor.push(parentGroupId)
                        parentGroupId = groupParent.parentGroup
                    } else {
                        parentGroupId = null
                    }
                }
            })


            let groupId = agents.find((agent:any) => {
                 return agent.agentId == this.authSvc.userId
            })?.groupId



            let highestAncestorGroupId = this.getGreatestAncestorGroupId(groupId, listGroup)

            this.initAgentInGroup(listGroup, agents)

            let a = this.getGroupById(highestAncestorGroupId, listGroup)
            if (a.totalAgent) {
                a.numberNoAnswerAgentPercent = Math.round(a.numberNoAnswerAgent / a.totalAgent * 100)
                a.numberOutboundAgentPercent = Math.round(a.numberOutboundAgent / a.totalAgent * 100)
                a.numberNotAvailableAgentPercent = Math.round(a.numberNotAvailableAgent / a.totalAgent * 100)

                if (a.numberOutboundAgentPercent >= 5 || a.numberNotAvailableAgentPercent >= 5 || a.numberNoAnswerAgent > 0) {
                    this.toastSvc.show("", {type: "UNIT_STATUS", extraData: a});
                }
            }


        });
    }

    getGroupById(id: any, listGroup: any[]) {
        return listGroup.find((group) => group.id == id)
    }

    getGreatestAncestorGroupId(id: any, listGroup: any): any {
        let group = this.getGroupById(id, listGroup)
        if (group.parentGroup?.trim()) {
            return this.getGreatestAncestorGroupId(group.parentGroup, listGroup)
        } else {
            return id
        }
    }

    initAgentInGroup(listGroup: any[], listAgents: any[]){
        listGroup.forEach((group: any) => {
            // Tính lại số lượng các trạng thái của agent trong queue
            this.updateGroupStatus(group, listAgents, listGroup)

        })
    }

    updateGroupStatus(group: any, listAllAgents: any, listGroup:any) {
        group.numberAvailableAgent = 0;
        group.numberOutboundAgent = 0;
        group.numberNoAnswerAgent = 0;
        group.numberAtLunchAgent = 0;
        group.numberMeetingAgent = 0;
        group.numberTrainingAgent = 0;
        group.numberGoOutAgent = 0;
        group.numberTypingAgent = 0;
        group.numberServingAgent = 0;
        group.numberLoggedInAgent = 0;
        group.numberNotAvailableAgent = 0;
        group.numberSleepingAgent = 0;
        group.numberLoggedOutAgent = 0;
        group.totalAgent = 0;


        group.numberReadyAgent = 0;
        group.numberRingingAgent = 0;
        group.numberAnsweringAgent = 0;
        group.numberDialNoAnswerAgent = 0;

        group.listAgent = []
        listAllAgents.forEach((agent:any) => {
            if (agent.groupId == group.id || this.getGroupById(agent.groupId, listGroup)?.ancestor?.includes(group.id)) {
                group.listAgent.push(agent)
                if (agent.userStatus  && agent.userStatus != AgentVoiceStatus.logged_out) {
                    group.totalAgent ++;
                }
            }
        })


        group.listAgent.forEach((agent: any) => {
            if (agent.userStatus) {
                switch (agent.userStatus){
                    case AgentVoiceStatus.inbound:
                    case AgentVoiceStatus.logged_in:
                    case AgentVoiceStatus.ready:
                    case AgentVoiceStatus.resume:
                    case AgentVoiceStatus.available:
                        group.numberServingAgent++;
                        group.numberLoggedInAgent++;
                        group.numberReadyAgent++;
                        group.numberAvailableAgent++;
                        break;
                    case AgentVoiceStatus.wrapup:
                        group.numberServingAgent++;
                        group.numberLoggedInAgent++;
                        group.numberAvailableAgent++;
                        break;
                    case AgentVoiceStatus.outbound:
                        group.numberLoggedInAgent++;
                        group.numberOutboundAgent++;
                        break;
                    case AgentVoiceStatus.connecting:
                        group.numberRingingAgent++;
                        group.numberServingAgent++;
                        group.numberLoggedInAgent++;
                        group.numberAvailableAgent++;
                        break;
                    case AgentVoiceStatus.connected:
                        group.numberAnsweringAgent++;
                        group.numberServingAgent++;
                        group.numberLoggedInAgent++;
                        group.numberAvailableAgent++;
                        break;
                    case AgentVoiceStatus.no_answer:
                        group.numberLoggedInAgent++;
                        group.numberNoAnswerAgent++;
                        break;
                    case AgentVoiceStatus.lunch:
                        group.numberLoggedInAgent++;
                        group.numberAtLunchAgent++;
                        break;
                    case AgentVoiceStatus.meeting:
                        group.numberLoggedInAgent++;
                        group.numberMeetingAgent++;
                        break;
                    case AgentVoiceStatus.training:
                        group.numberLoggedInAgent++;
                        group.numberTrainingAgent++;
                        break;
                    case AgentVoiceStatus.go_out:
                        group.numberLoggedInAgent++;
                        group.numberGoOutAgent++;
                        break;
                    case AgentVoiceStatus.typing:
                        group.numberLoggedInAgent++;
                        group.numberTypingAgent++;
                        break;
                    case AgentVoiceStatus.not_available:
                        group.numberNotAvailableAgent++;
                        break;
                    case AgentVoiceStatus.sleeping:
                        group.numberSleepingAgent++;
                        break;
                    case AgentVoiceStatus.logged_out:
                    case null:
                        group.numberLoggedOutAgent++;
                        break
                    default:
                        group.numberLoggedOutAgent++;
                        break;
                }
            }
        })



    }


}
