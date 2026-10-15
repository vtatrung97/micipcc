function loadJsAsync(src, callback) {
    var s = document.createElement('script');
    s.type = "text/javascript";
    s.src = src;
    s.addEventListener('load', function (e) { callback(null, e); }, false);
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(s);
}
function openPortal(domainData) {
    console.log(domainData)
    loadJsAsync('http://10.60.157.189:8888/assets/js/IpccChat.js', function() {
    // loadJsAsync('http://localhost:4200/assets/js/IpccChat.js', function() {
        embedIpccChat(domainData);
    })
};