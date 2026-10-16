import {Injectable} from '@angular/core';

declare let $: any;
declare let BrowserNotification: any;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  ringDialog: any = null;

  smallBox(data: { title: string; content: any; color: string; timeout?: number; icon: string; }, cb?: undefined) {
    $.smallBox(data, cb)
  }

  bigBox(data: any, cb?: any) {
    $.bigBox(data, cb)
  }

  smartMessageBox(data: any, cb?: any) {
    $.SmartMessageBox(data, cb)
  }
  // [ duongtb
  notify(options: { title: any; body: any; icon?: string; }): any {

    if (typeof options === 'object') {
      if (options.title === undefined) {
        options.title = '';
      }
      if (options.body === undefined) {
        options.body = '';
      }
    }
    let notification = BrowserNotification.notify(options);
    return notification;
  }


  /**
   * @author dathv1
   * @param body
   */
  newEmailNotify(body: string) {
    let iconNotify = "/assets/img/email.png";
    const titleNotify = "New Email";
    this.notify({
      title: titleNotify,
      body: body,
      icon: iconNotify
    });
  }

  close(notification: undefined) {
    if (notification !== undefined) {
      BrowserNotification.close(notification);
    }
  }

  alertBox(message: any) {
    this.smallBox({
      title: "Alert",
      content: message,
      color: "#3276b1",
      timeout: 6000,
      icon: "fa fa-info"
    });
  }

  successBox(message: any) {
    this.smallBox({
      title: "Sucess",
      content: message,
      color: "#83C75D",
      timeout: 6000,
      icon: "fa fa-check"
    });
  }

  alertBoxNoTimeout(message: any) {
    this.smallBox({
      title: "Alert",
      content: message,
      color: "#3276b1",
      icon: "fa fa-info"
    });
  }

  closeDialog(dlgId: string) {
    try {
      $("#" + dlgId).dialog("close");
    } catch (e) {
      // @ts-ignore
      console.log("err not existed " + e.message);
    }
  }

  showDialog(dlgId: string) {
    try {

      if (this.ringDialog == null) {
        this.ringDialog = $("#" + dlgId).dialog({
          width: 500,
          dialogClass: "alert",
          closeText: "",
          position: {my: "right bottom", at: "right", of: "body"},

          create: function (event: { target: any; }) {
            $(event.target).parent().css({'position': 'fixed'});
          }
        });
      }
      $("#" + dlgId).dialog('open');
    } catch (e) {
      // @ts-ignore
      console.log("err show dialog >>>>>>>>>>>" + e.message);
    }
  }

  // ] end duongtb


  showDialogNotCloseAble(dlgId: string) {
    $("#" + dlgId).dialog({
      width: 500,
      dialogClass: "alert",
      closeText: "",
      position: {my: "left bottom", at: "left", of: window},
      create: function (event: { target: any; }) {
        $(event.target).parent().css({'position': 'fixed'});
      }
    }).dialog("widget").find('.ui-dialog-titlebar-close').hide();
  }

}
