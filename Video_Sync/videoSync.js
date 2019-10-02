(function () {
    var uuid;
    var script = this;
    var pause = "og";
    var sourceUrl = Script.resolvePath("videoSync.html");
    script.preload = function (entityID) {
        var entity = Entities.getEntityProperties(entityID, ["position", "rotation", "dimensions"]);
        uuid = Entities.addEntity({
            type: "Web",
            dpi: 15,
            maxFPS: 60,
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
            if (pause == "stop") {
                print("Event is paused");
            } else {
                pause = "stop";
                stopPausEvent();
                print("timeStamp " + messageData.timeStamp);
                print("action " + messageData.action);
                print("videoUrl " + messageData.videoUrl);
                print("now video " + messageData.nowVideo);
                Messages.sendMessage("videoPlayOnEntity", event);
            }
        })
    }

    function stopPausEvent() {
        Script.setTimeout(function () {
            pause = "og";
            print("go");
        }, 500);
    }

    function onMessageReceived(channel, message, sender, localOnly) {
        if (channel != "videoPlayOnEntity") {
            return;
        }
        if (pause == "stop") {
            print("Event is paused");
        } else {
            Entities.emitScriptEvent(uuid, message);
        }
    }

    Messages.subscribe("videoPlayOnEntity");
    Messages.messageReceived.connect(onMessageReceived);

});
