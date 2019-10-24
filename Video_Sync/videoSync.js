(function () {
    var uuid;
    var script = this;
    var stamp = Date.now();
    var pause = "og";
    var sourceUrl = Script.resolvePath("videoSync.html" + "?" + Date.now());
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
                "y": 1.671199917793274,
                "z": 0.009999999776482582
            },
            position: entity.position
        }, "local");
        Entities.webEventReceived.connect(onWebEvent);
    }

    MyAvatar.sessionUUIDChanged.connect(function () {
        Entities.deleteEntity(uuid);
    });

    function onWebEvent(uuid, event) {
        messageData = JSON.parse(event);
        if (pause == "stop") {
            print("Event is paused");
        } else {
            pause = "stop";
            stopPausEvent();
            Messages.sendMessage("videoPlayOnEntity", event);
        }
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
            messageData = JSON.parse(message);
            print("ping time Stamp " + messageData.timeStamp);
            stopPausEvent();
            Entities.emitScriptEvent(uuid, message);
        }
    }

    Messages.subscribe("videoPlayOnEntity");
    Messages.messageReceived.connect(onMessageReceived);

    script.unload = function (entityID) {
        Messages.unsubscribe("videoPlayOnEntity");
        Entities.deleteEntity(uuid);
        Messages.messageReceived.disconnect(onMessageReceived);
        Entities.webEventReceived.disconnect(onWebEvent);
    }

});
