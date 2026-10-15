import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { DatatablesResponse, WsChatResponse } from "@core/models/response.model";
import { Ticket } from "@core/models/ticket/ticket.model";
import { TicketDetail } from "@core/models/ticket/ticket-detail.model";
import { ChannelId, RightSideBarViewMode, StatusType } from "@core/constant/ticket.enum";
import { FacebookResponseNotifySend } from "@core/models/facebook/facebook-response-notify.send";
import { TicketCommentDetailModel } from "@core/models/ticket/ticket-comment-detail.model";
import { FacebookCommentSendModel } from "@core/models/facebook/facebook-comment-send.model";
import { ParticipantModel } from "@core/models/ticket/participant.model";
import {
    DataReplyMail
} from "@pages/ticket/ticket-detail/frame-body/frame-chat/body/mess-content/content-email/content-email.component";
import { TicketNotify } from "@models/notification/notification.model";
import { TicketNote } from '@core/models/ticket/ticket-note.model';
import { TicketStatusCode } from "@models/ticket/ticket-status.model";

export type TypeReplyMail = "FORWARD" | "REPLY" | "REPLY_ALL";
export type ChannelSelected = {
    ticketId: string,
    channelId: ChannelId,
    sourceId: any,
    customerId: any,
    isTransferChannel: boolean,
    emailTo?: string,
    transferZaloPhone?: string,
    queueId?: string
}

export type MsgScroll = {
    ticketDetailId?: string,
    objectId?: string,
    ticketId: string,
    messageTime: number,
    mainTicketId?: string, // khong du`ng nua
}

export type TicketInputFocus = {
    ticketId: string,
    isFocus: boolean
}



@Injectable({
    providedIn: 'root'
})
export class TicketEventService {

    private rightSideBarChangedSrc = new Subject<RightSideBarViewMode>();
    private rightSideBarDetailChangedSrc = new Subject<"GENERAL_INFO" | "CUSTOMER_INFO" | "CUSTOMER_HISTORY">();
    private ticketListSrc = new Subject<DatatablesResponse<Ticket>>();
    private ticketSelectedSrc = new BehaviorSubject<Ticket | undefined>(undefined);
    private oldTicketSelectedSrc = new BehaviorSubject<Ticket | undefined>(undefined);
    private newMessSrc = new Subject<TicketDetail>();
    private newSupportChatMsgSrc = new Subject<TicketDetail>();
    private newNoteSrc = new Subject<TicketNote>();
    private deleteNoteSrc = new Subject<TicketNote>();
    private replyMessSrc = new Subject<TicketDetail>();
    private replyNoteSrc = new BehaviorSubject<TicketDetail | undefined>(undefined);
    private editNoteSrc = new Subject<TicketDetail>();
    private sendEditNoteSrc = new Subject<TicketDetail>();
    private addTicketNote = new Subject<TicketDetail>();
    private msgIsSeenSrc = new Subject<ParticipantModel>();
    private channelSelectedSrc = new Subject<ChannelSelected>();
    private hideShowCommentSrc = new Subject<boolean>()
    private commentSendSvc = new Subject<FacebookResponseNotifySend>();
    private commentChangeStatusSvc = new Subject();
    private commentLoadingSvc = new Subject<FacebookCommentSendModel>();
    private emailSendSrc = new Subject<TicketDetail>();
    private commentEditSvc = new Subject<TicketCommentDetailModel>();
    private replyMailSrc = new Subject<{ type: TypeReplyMail, parentMail: TicketDetail }>();
    private newTicketSrc = new Subject<TicketNotify>();
    private currentUserSeenTicketSrc = new Subject<string>();
    private currentUserSeenSupportChatSrc = new Subject<string>();
    private firstTimeAgentRepSrc = new Subject<string>();
    private scrollToMsgSrc = new Subject<MsgScroll>();
    private deleteQuoteSrc = new Subject<TicketDetail>();
    private inputChatFocusStateSrc = new Subject<TicketInputFocus>();
    private inputChatFocusSupportChatSrc = new Subject<TicketInputFocus>();
    private addContactToCurrCustomerSrc = new Subject<any>();
    private mergeCustomerSrc = new Subject<any>();
    private deleteContactSrc = new Subject<any>();
    private rightSideBarChangeSrc = new Subject<any>();
    private ticketStatusChangedSrc = new Subject<{ ticketId: string, statusType: StatusType, statusCode: TicketStatusCode }>();
    private ticketChangedSrc = new Subject<{ ticketId: string, description: string }>();
    private ticketConversationStatusSrc = new Subject<{ ticketId: string }>();
    private chatReconnectSrc = new Subject();
    private openIncomingCallModalSrc = new Subject();
    private downloadVideoSrc = new Subject<TicketDetail>();
    private doneDownloadingVideoSrc = new Subject<string>();
    private listKeywordAlert = new BehaviorSubject<string[]>([]);
    private ticketOpenSelectedSrc = new BehaviorSubject<boolean | undefined>(undefined);

    private menuChangeSrc = new Subject();
    private aiSuggestionSrc = new Subject<WsChatResponse>();
    private isReadonlySubject = new BehaviorSubject<boolean>(false);

    aiSuggestion$ = this.aiSuggestionSrc.asObservable();
    isReadonly$ = this.isReadonlySubject.asObservable();
    menuChange$ = this.menuChangeSrc.asObservable()

    rightSideBarChanged$ = this.rightSideBarChangedSrc.asObservable();
    rightSideBarDetailChanged$ = this.rightSideBarDetailChangedSrc.asObservable();
    ticketSelected$ = this.ticketSelectedSrc.asObservable();
    oldTicketSelected$ = this.oldTicketSelectedSrc.asObservable();
    newMess$ = this.newMessSrc.asObservable();
    newSupportChatMsg$ = this.newSupportChatMsgSrc.asObservable();
    newNote$ = this.newNoteSrc.asObservable();
    deleteNote$ = this.deleteNoteSrc.asObservable();
    replyMess$ = this.replyMessSrc.asObservable();
    replyNote$ = this.replyNoteSrc.asObservable();
    editNote$ = this.editNoteSrc.asObservable();
    sendEditNote$ = this.sendEditNoteSrc.asObservable();
    addTicketNote$ = this.addTicketNote.asObservable();
    channelSelected$ = this.channelSelectedSrc.asObservable();
    hideShowComment$ = this.hideShowCommentSrc.asObservable()
    commentSent$ = this.commentSendSvc.asObservable();
    commentChangeStatus$ = this.commentChangeStatusSvc.asObservable();
    commentLoading$ = this.commentLoadingSvc.asObservable();
    commentEdit$ = this.commentEditSvc.asObservable();
    msgIsSeen$ = this.msgIsSeenSrc.asObservable();
    replyMail$ = this.replyMailSrc.asObservable();
    emailSend$ = this.emailSendSrc.asObservable();
    newTicket$ = this.newTicketSrc.asObservable();
    currentUserSeenTicket$ = this.currentUserSeenTicketSrc.asObservable();
    currentUserSeenSupportChat$ = this.currentUserSeenSupportChatSrc.asObservable();
    firstTimeAgentRep$ = this.firstTimeAgentRepSrc.asObservable();
    scrollToMsg$ = this.scrollToMsgSrc.asObservable();
    deleteQuote$ = this.deleteQuoteSrc.asObservable();
    inputChatFocusState$ = this.inputChatFocusStateSrc.asObservable();
    inputChatFocusSupportChat$ = this.inputChatFocusSupportChatSrc.asObservable();
    addContactToCurrCustomer$ = this.addContactToCurrCustomerSrc.asObservable();
    mergeCustomer$ = this.mergeCustomerSrc.asObservable();
    deleteContact$ = this.deleteContactSrc.asObservable()
    rightSideBarChange$ = this.rightSideBarChangeSrc.asObservable()
    ticketStatusChanged$ = this.ticketStatusChangedSrc.asObservable();
    ticketConversationStatus$ = this.ticketConversationStatusSrc.asObservable();
    chatReconnect$ = this.chatReconnectSrc.asObservable();
    openIncomingCallModal$ = this.openIncomingCallModalSrc.asObservable();
    downloadVideo$ = this.downloadVideoSrc.asObservable();
    doneDownloadingVideo$ = this.doneDownloadingVideoSrc.asObservable();
    listKeywordAlert$ = this.listKeywordAlert.asObservable();
    ticketOpentSelected$ = this.ticketOpenSelectedSrc.asObservable();

    storedMessage: TicketDetail[] = [];

    announceRightSideBarChanged(dest: RightSideBarViewMode | undefined) {
        this.rightSideBarChangedSrc.next(dest);
    }

    announceRightSideBarDetailChanged(dest: "GENERAL_INFO" | "CUSTOMER_INFO" | "CUSTOMER_HISTORY") {
        this.rightSideBarDetailChangedSrc.next(dest);
    }

    announceTicketListChanged(ticketList: DatatablesResponse<Ticket>) {
        this.ticketListSrc.next(ticketList);
    }

    announceTicketSelected(ticket: Ticket) {
        this.ticketSelectedSrc.next(ticket);
    }

    announceOldTicketSelectedSrc(ticket: Ticket) {
        this.oldTicketSelectedSrc.next(ticket);
    }

    announceNewMess(mess: TicketDetail) {
        if (mess.channelId != ChannelId.SupportChat) {

            const newMsgId = mess.objectId || mess.ticketDetailId || mess.uiGenMsgId;
            // 2. Kiểm tra xem ID này đã tồn tại trong mảng storedMessage chưa
            const isExist = this.storedMessage?.some((m: any) => {
                const currentId = m.objectId || m.ticketDetailId || m.uiGenMsgId;
                return currentId && newMsgId && currentId === newMsgId;
            });

            // 3. Nếu CHƯA tồn tại thì mới push và phát event
            if (!isExist) {
                this.storedMessage.push(mess);
            }
            this.newMessSrc.next(mess);

        } else {
            this.newSupportChatMsgSrc.next(mess);
        }

    }

    announceDeleteNote() {
        this.deleteNoteSrc.next();
    }

    announceNewNote(note: any) {
        this.newNoteSrc.next(note);
    }

    announceReplyNote(note: any) {
        this.replyNoteSrc.next(note);
    }

    announceEditNote(note: any) {
        this.editNoteSrc.next(note);
    }

    announceSendEditNote(note: any) {
        this.sendEditNoteSrc.next(note);
    }

    announceReplyMess(mess: TicketDetail) {
        this.replyMessSrc.next(mess);
    }

    announceAddTicketNote(mess: TicketDetail) {
        this.addTicketNote.next(mess);
    }

    announceChannelSelected(channel: ChannelSelected) {
        this.channelSelectedSrc.next(channel)
    }

    announceHideShowComment(event: boolean) {
        this.hideShowCommentSrc.next(event);
    }

    announceCommentSend(data: FacebookResponseNotifySend) {
        this.commentSendSvc.next(data);
    }

    announceEmailSend(data: TicketDetail) {
        this.emailSendSrc.next(data);
    }

    announceCommentLoading(mess: FacebookCommentSendModel | undefined) {
        this.commentLoadingSvc.next(mess);
    }

    announceCommentEdit(mess: TicketCommentDetailModel) {
        this.commentEditSvc.next(mess);
    }

    announceMsgIsSeen(data: ParticipantModel) {
        this.msgIsSeenSrc.next(data)
    }

    announceChangeStatus() {
        this.commentChangeStatusSvc.next();
    }

    announceReplyMail(data: DataReplyMail) {
        this.replyMailSrc.next(data)
    }

    announceNewTicket(data: TicketNotify) {
        this.newTicketSrc.next(data)
    }

    announceCurrentUserSeenTicket(ticketId: string) {
        this.currentUserSeenTicketSrc.next(ticketId)
    }

    announceCurrentUserSeenSupportChat(ticketId: string) {
        this.currentUserSeenSupportChatSrc.next(ticketId)
    }

    announceFirstAgentRep(ticketId: string) {
        this.firstTimeAgentRepSrc.next(ticketId)
    }

    announceScrollToMsg(msg: MsgScroll) {
        this.scrollToMsgSrc.next(msg);
    }


    announceDeleteQuote(mess: any) {
        this.deleteQuoteSrc.next(mess)
    }

    announceInputChatFocusChange(focusState: TicketInputFocus) {
        this.inputChatFocusStateSrc.next(focusState)
    }

    announceInputChatSupportChatFocusChange(focusState: TicketInputFocus) {
        this.inputChatFocusSupportChatSrc.next(focusState)
    }

    announceAddContactToCurrCustomer(contact: any) {
        this.addContactToCurrCustomerSrc.next(contact)
    }

    announceMergeCustomer(customer?: any) {
        this.mergeCustomerSrc.next(customer)
    }

    announceDeleteContact(contact: any) {
        this.deleteContactSrc.next(contact)
    }

    announceRightSideBarChange(width: any) {
        this.rightSideBarChangeSrc.next(width)
    }

    announceTicketStatusChanged(data: { ticketId: string, statusType: StatusType, statusCode: TicketStatusCode }) {
        this.ticketStatusChangedSrc.next(data);
    }

    announceTicketChanged(data: { ticketId: string, description: string }) {
        this.ticketChangedSrc.next(data);
    }

    announceConversationClosed(data: { ticketId: string }) {
        this.ticketConversationStatusSrc.next(data);
    }

    announceChatReconnect() {
        this.chatReconnectSrc.next()
    }

    announceOpenIncomingCallModal() {
        this.openIncomingCallModalSrc.next()
    }

    announceMenuChange() {
        this.menuChangeSrc.next()
    }

    announceDownloadVideo(data: TicketDetail) {
        this.downloadVideoSrc.next(data)
    }

    announceDoneDownloadingVideo(data: string) {
        this.doneDownloadingVideoSrc.next(data)
    }

    announceOpenTicketSelected(isOpent: boolean) {
        this.ticketOpenSelectedSrc.next(isOpent);
    }

    getListKeywordAlert(data: string[]) {
        this.listKeywordAlert.next(data);
    }

    announceAiSuggestion(msg: WsChatResponse) {
        this.aiSuggestionSrc.next(msg);
    }

    setIsReadonly(value: boolean) {
        this.isReadonlySubject.next(value);
    }

    getIsReadonly(): boolean {
        return this.isReadonlySubject.value;
    }
}
