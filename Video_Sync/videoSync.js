(function () {
    var uuid;
    var script = this;
    var sourceUrl = Script.resolvePath("videoSync.html");
    script.preload = function (entityID) {
        var entity = Entities.getEntityProperties(entityID, ["position", "rotation", "dimensions"]);
        uuid = Entities.addEntity({
            type: "Web",
            dpi: 15,
            sourceUrl: sourceUrl,
            rotation: entity.rotation,
            dimensions: {
                "x": 2.8344976902008057,
                "y": 1.6094951629638672,
                "z": 0.009999999776482582
            },
            position: entity.position
        }, "local");
        webEvent();
    }

    MyAvatar.sessionUUIDChanged.connect(function () {
        Entities.deleteEntity(uuid);
    });

function webEvent() {
    Entities.webEventReceived.connect(function (uuid, event) {
        messageData = JSON.parse(event);
        print("timeStamp " + messageData.timeStamp);
        print("action " + messageData.action);
        print("videoUrl " + messageData.videoUrl);
        print("now video " + messageData.nowVideo);
        Messages.sendMessage("videoPlayOnEntity", event);
    })
}

function onMessageReceived(channel, message, sender, localOnly) {
    if (channel != "videoPlayOnEntity") {
        return;
    }
    Entities.emitScriptEvent(uuid, message);
}

Messages.subscribe("videoPlayOnEntity");
Messages.messageReceived.connect(onMessageReceived);

});
