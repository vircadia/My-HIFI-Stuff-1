var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
(function () { 
    var AppUi = Script.require('appUi');

    var ui;
    function startup() {
        ui = new AppUi({
            buttonName: "Video Sync", 
            home: Script.resolvePath("tabletVideoSync.html"), 
            graphicsDirectory: Script.resolvePath("./"), 
        });
    }

    function onWebEventReceived(event) {
        messageData = JSON.parse(event);
        print("timeStamp " + messageData.timeStamp);
        print("action " + messageData.action);
        print("videoUrl " + messageData.videoUrl);
        print("now video " + messageData.nowVideo);
        Messages.sendMessage("vPlay", event);
    }

    function onMessageReceived(channel, message, sender, localOnly) {
        if (channel != "vPlay") {
            return;
        }
        tablet.emitScriptEvent(message);
    }

    tablet.webEventReceived.connect(onWebEventReceived);

    Messages.subscribe("vPlay");
    Messages.messageReceived.connect(onMessageReceived);

    startup();
}());
