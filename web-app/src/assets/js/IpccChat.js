function embedIpccChat(data) {
    console.log('log', data);
    let iframe = document.createElement('iframe');
    try {
        iframe.id = 'ipcc_chat_iframe';
        iframe.style.border = 'none';
        iframe.style.width = '0%';
        iframe.style.height = '0%';
        iframe.style.position = 'fixed';
        iframe.style.bottom = '0';
        iframe.style.right = '0';
        iframe.style.zIndex = 9999;
        iframe.style.border = '15px';
        iframe.style.visibility = 'hidden';
        let isMobileDevice = isMobileAgent(data.mobile_app);
        if (!isMobileDevice) {
            iframe.style.cssText += ";border-radius: 10px";
        }

        let src = data.url + '#/chatclient/';

        let color = data.color == undefined ? "" : data.color;
        let queryString = "?domain=" + data.domain + "&username=" + data.username
            + "&color=" + color + "&internal=" + data.internal + "&close_box=" + data.close_box;
        iframe.src = src + encodeURIComponent(btoa(queryString));
        document.body.appendChild(iframe);

        // Create IE + others compatible event handler
        let eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
        let eventer = window[eventMethod];
        let messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";


        // Listen to message from child window

        eventer(messageEvent, function (e) {
            let key = e.message ? "message" : "data";
            let data = e[key];
            let iframe = document.getElementById('ipcc_chat_iframe');
            let innerDoc = (iframe.contentWindow || iframe.contentDocument);

            if (data == "openChatBox") {
                iframe.style.visibility = 'hidden';
                if (isMobileDevice) {
                    document.body.setAttribute('style', 'position:fixed');
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                    iframe.style.right = '0px';
                    iframe.style.bottom = '0px';
                    iframe.style.zoom = '100%';

                } else {
                    iframe.style.border = '1px';
                    iframe.style.width = '325px';
                    iframe.style.height = '420px';
                    iframe.style.bottom = '0px';
                    iframe.style.right = '10px';
                    iframe.style.cssText += ";border-radius: 10px";
                    iframe.style.cssText += ";border-left: 1px solid #c9d0da; border-right: 1px solid #c9d0da";
                }
                iframe.style.visibility = 'visible';
                innerDoc.postMessage('parent_finished_changing_size_open', '*');

            } else if (data == "closeChatBox") {
                iframe.style.visibility = 'hidden';
                if (isMobileDevice) {
                    document.body.setAttribute('style', 'position:static');
                }
                iframe.style.border = '0px';
                iframe.style.width = '190px';
                iframe.style.height = '35px';
                iframe.style.bottom = '20px';
                iframe.style.right = '25px';
                iframe.style.visibility = 'visible';

                innerDoc.postMessage('parent_finished_changing_size_close', '*');

            } else if (data == "openSurveyBox") {
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.right = '0px';
            } else if (data == "closeSurveyBox") {
                iframe.style.width = '0%';
                iframe.style.height = '0%';
                iframe.style.right = '0px';

            } else if (data == "openSurveyQA") {
                if (isMobileDevice) {
                    document.body.setAttribute('style', 'position:fixed');
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                    iframe.style.right = '0px';
                    iframe.style.bottom = '0px';
                    iframe.style.zoom = '100%';
                } else {
                    iframe.style.border = '1px';
                    iframe.style.width = '325px';
                    iframe.style.height = '420px';
                    iframe.style.bottom = '0px';
                    iframe.style.right = '10px';
                    iframe.style.cssText += ";border-radius: 10px";
                    iframe.style.cssText += ";border-left: 1px solid #c9d0da; border-right: 1px solid #c9d0da";
                }

            } else if (data == "closeSurveyQA") {
                if (isMobileDevice) {
                    document.body.setAttribute('style', 'position:static');
                }
                iframe.style.border = '0px';
                iframe.style.width = '320px';
                iframe.style.height = '50px';
                iframe.style.bottom = '20px';
                iframe.style.right = '25px';
            } else if (data == "ban") {
                iframe.parentNode.removeChild(iframe);
            }
        }, false);
    } catch (e) {
        iframe.parentNode.removeChild(iframe);
    }
}

function loadJsAsync(src, callback) {
    let s = document.createElement('script');
    s.type = "text/javascript";
    s.src = src;
    s.addEventListener('load', function (e) {
        callback(null, e);
    }, false);
    let head = document.getElementsByTagName('head')[0];
    head.appendChild(s);
}