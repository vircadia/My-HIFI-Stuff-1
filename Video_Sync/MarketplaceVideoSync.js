(function () {
    var uuid;
    var script = this;
    var pause = "og";
    var self = this;
    var entity;
    var _entityID;
    var originalEntityData;
    var sourceUrl = Script.resolvePath("videoSync.html" + "?" + Date.now());
    script.preload = function (entityID) {
        entity = Entities.getEntityProperties(entityID, ["position", "rotation", "dimensions"]);
        _entityID = entityID;
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
        originalEntityData = entity;
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

    self.intervalID = Script.setInterval(function () {
        entity = Entities.getEntityProperties(_entityID, ["position", "rotation"]);
        if (JSON.stringify(originalEntityData.position) == JSON.stringify(entity.position) && JSON.stringify(originalEntityData.rotation) == JSON.stringify(entity.rotation)) {
        } else {
            Entities.editEntity(uuid, {
                position: entity.position,
                rotation: entity.rotation,
            });
            originalEntityData = entity;
        }
    }, 600);

    Messages.subscribe("videoPlayOnEntity");
    Messages.messageReceived.connect(onMessageReceived);

    script.unload = function (entityID) {
        Messages.unsubscribe("videoPlayOnEntity");
        Entities.deleteEntity(uuid);
        Messages.messageReceived.disconnect(onMessageReceived);
        Entities.webEventReceived.disconnect(onWebEvent);
        Script.clearInterval(self.intervalID);
    }

});
