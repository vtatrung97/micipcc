import {TimeConverterUtil} from "@shared/util/time-converter.util";
import {AgentCallStatus, AgentVoiceStatus, CallStatus} from "@models/acd/agent.model";
import {translate} from "@angular/localize/tools";

export function renderBadge(type: "ratio" | "time", value: number, valueDanger: number, borderless: boolean = false) {
    if(!value && type == "ratio") return `<div class="badge badge-soft-outline-danger fs-14">0%</div>`
    let valueDisplay= type == "time" ? TimeConverterUtil.secondsToTime(value) : value + '%';

    let badge : string = "";
    if (value >= valueDanger) {
        badge = `<div class="badge badge-soft-outline-danger fs-14">${valueDisplay}</div>`
    } else {
        badge = `<div class="badge badge-soft-outline-info fs-14"">${valueDisplay}</div>`
    }
    return badge

    // return `
    //     <div class="d-flex align-items-center" style="height: 20px">
    //         ${badge}
    //     </div> `
}

export function renderWaringText(type: "ratio" | "time", value: number, valueDanger: number) {
    value = value ? value : 0
    let valueDisplay= type == "time" ? TimeConverterUtil.secondsToTime(value) : value;
    let badge : string = "";
    if (value >= valueDanger && valueDanger) {
        badge = `<div class="badge-borderless-danger fs-14">${valueDisplay}</div>`
    } else {
        badge = `<div>${valueDisplay}</div>`
    }
    return badge

    // return `
    //     <div class="d-flex align-items-center" style="height: 20px">
    //         ${badge}
    //     </div> `
}

export function renderAgentStatusBadge(status: string | undefined, duration: number, borderless: boolean = false) : string {
    let badge = '';
    let value;
    let badgeStyle = ''
    if (borderless) {
        badgeStyle = "badge-borderless-status"
    } else {
        badgeStyle = "badge-outline-status"
    }
    switch (status) {
        case AgentVoiceStatus.available:
            value = duration != 0 ? duration : 'Available';
            badge = `<div class="badge ${badgeStyle}-available fs-14">${value}</div>`;
            break;
        case AgentVoiceStatus.not_available:
            value = duration != 0 ? duration : 'Not available';
            badge = `<div class="badge ${badgeStyle}-not-available fs-14">${value}</div>`;
            break;
        case AgentVoiceStatus.lunch:
            value = duration != 0 ? duration : 'At lunch';
            badge = `<div class="badge ${badgeStyle}-at-lunch fs-14">${value}</div>`;
            break;
        case AgentVoiceStatus.meeting:
            value = duration != 0 ? duration : 'Meeting';
            badge = `<div class="badge ${badgeStyle}-meeting fs-14">${value}</div>`;
            break;
        case AgentVoiceStatus.no_acd:
            value = duration != 0 ? duration : 'No ACD';
            badge = `<div class="badge ${badgeStyle}-no-acd fs-14">${value}</div>`;
            break;
        case AgentVoiceStatus.web_exit:
            value = duration != 0 ? duration : 'WebApp Only';
            badge = `<div class="badge ${badgeStyle}-log-out fs-14">${value}</div>`;
            break;
        case AgentVoiceStatus.webphone_after:
        case AgentVoiceStatus.web_logout:
        case AgentVoiceStatus.logged_out:
            value = duration != 0 ? duration : 'Logout';
            badge = `<div class="badge ${badgeStyle}-log-out fs-14">${value}</div>`;
            break;
        case AgentVoiceStatus.web_enter:
            value = duration != 0 ? duration : 'Web Enter';
            badge = `<div class="badge ${badgeStyle}-log-out fs-14">${value}</div>`;
            break;
        case AgentVoiceStatus.logged_in:
        case AgentVoiceStatus.inbound:
        case AgentVoiceStatus.ready:
        case AgentVoiceStatus.resume:
        case AgentVoiceStatus.wrapup:
            value = duration != 0 ? duration : 'Available Inbound';
            badge = `<div class="badge ${badgeStyle}-inbound fs-14">${value}</div>`;
            break;
        case AgentVoiceStatus.outbound:
            value = duration != 0 ? duration : 'Available Outbound';
            badge = `<div class="badge ${badgeStyle}-outbound fs-14">${value}</div>`;
            break;
        case AgentVoiceStatus.training:
            value = duration != 0 ? duration : 'Training';
            badge = `<div class="badge ${badgeStyle}-training fs-14">${value}</div>`;
            break;
        case AgentVoiceStatus.go_out:
            value = duration != 0 ? duration : 'Go out';
            badge = `<div class="badge ${badgeStyle}-go-out fs-14">${value}</div>`;
            break;
        case AgentVoiceStatus.typing:
            value = duration != 0 ? duration : 'Typing';
            badge = `<div class="badge ${badgeStyle}-typing fs-14">${value}</div>`;
            break;
        case AgentVoiceStatus.sleeping:
            value = duration != 0 ? duration : 'Sleeping';
            badge = `<div class="badge ${badgeStyle}-sleeping fs-14">${value}</div>`;
            break;
        case AgentVoiceStatus.no_answer:
            value = duration != 0 ? duration : 'No answer';
            badge = `<div class="badge ${badgeStyle}-no-answer fs-14">${value}</div>`;
            break;
        case AgentVoiceStatus.connecting:
        case AgentVoiceStatus.connected:
            value = duration != 0 ? duration : 'Available Inbound';
            badge = `<div class="badge ${badgeStyle}-training fs-14">${value}</div>`;
            break;
        // case AgentVoiceStatus.connected:
        //     value = duration != 0 ? duration : 'Available Inbound';
        //     badge = `<div class="badge ${badgeStyle}-training fs-14">${value}</div>`;
        //     break;
        case AgentVoiceStatus.outbound_connecting:
        case AgentVoiceStatus.outbound_connected:
            value = duration != 0 ? duration : 'Available Outbound';
            badge = `<div class="badge ${badgeStyle}-training fs-14">${value}</div>`;
            break;
        // case AgentVoiceStatus.outbound_connected:
        //     value = duration != 0 ? duration : 'Available Outbound';
        //     badge = `<div class="badge ${badgeStyle}-training fs-14">${value}</div>`;
        //     break;
        default:
            break;
    }
    return `<div class="" style="height: 20px">${badge}</div>`
}

export function renderCallStatusBadge(status: string | undefined, duration: number, borderless: boolean = false, highlight: boolean = false) : string {
    let badge = '';
    let value;
    let badgeStyle = '';
    let highlightCls = '';
    if (borderless) {
        badgeStyle = "badge-borderless-status"
    } else {
        badgeStyle = "badge-outline-status"
    }
    if (highlight) highlightCls = 'text-danger emphasize-text';
    switch (status) {
        case AgentCallStatus.ringing:
            value = duration != 0 ? duration : 'Ringing';
            badge = `<div class="badge ${badgeStyle}-training ${highlightCls} fs-14">${value}</div>`;
            break;
        case AgentCallStatus.answering:
            value = duration != 0 ? duration : 'Answering';
            badge = `<div class="badge ${badgeStyle}-training ${highlightCls} fs-14">${value}</div>`;
            break;
        default:
            break;
    }
    return `<div class="" style="height: 20px">${badge}</div>`
}

export function renderCallStatus(status: string | undefined) : string {
    let statusDisplay : string = '';
    switch (status) {
        case CallStatus.IN_IVR:
            statusDisplay = 'In Ivr';
            break;
        case CallStatus.MENU:
            statusDisplay = 'Menu';
            break;
        case CallStatus.QUEUEING:
            statusDisplay = 'Queueing';
            break;
        case CallStatus.RINGING:
            statusDisplay = 'Ringing';
            break;
        case CallStatus.ANSWERING:
            statusDisplay = 'Answering';
            break;
        case CallStatus.MISSED:
            statusDisplay = 'Missed';
            break;
        case CallStatus.HOLDING:
            statusDisplay = 'Holding';
            break;
        default: break;
    }
    return statusDisplay;
}
