(function () {
    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    var videoSyncInterface = Script.resolvePath("videoSyncInterface.html");
    this.clickDownOnEntity = function (entityID, mouseEvent) {
            console.log(JSON.stringify(mouseEvent));
            tablet.gotoWebScreen(videoSyncInterface);
    };
    function onWebEvent(event) {
        Messages.sendMessage("videoPlayOnEntity", event);
    }

    function onMessageReceived(channel, message, sender, localOnly) {
        if (channel != "videoPlayOnEntity") {
            return;
        }
        messageData = JSON.parse(message);
        console.log(message);
        tablet.emitScriptEvent(message);
    }

    tablet.webEventReceived.connect(onWebEvent);
    Messages.subscribe("videoPlayOnEntity");
    Messages.messageReceived.connect(onMessageReceived);

    this.unload = function (entityID) {
        Messages.unsubscribe("videoPlayOnEntity");
        Messages.messageReceived.disconnect(onMessageReceived);
        tablet.webEventReceived.disconnect(onWebEvent);
    }
});
