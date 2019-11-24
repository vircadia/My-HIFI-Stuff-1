(function () {
    var uuid;
    var script = this;
    var pause = "og";
    var self = this;
    var entity;
    var _entityID;
    var _uuid;
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
            dimensions: entity.dimensions,
            registrationPoint: {
                "x": 0.5,
                "y": 0.5,
                "z": 0
            },
            position: entity.position
        }, "local");
        _uuid = uuid;
        originalEntityData = entity;
        Entities.webEventReceived.connect(onWebEvent);
    }

    MyAvatar.sessionUUIDChanged.connect(function () {
        Entities.deleteEntity(uuid);
    });

    function onWebEvent(uuid, event) {
        if (uuid == _uuid) {
            messageData = JSON.parse(event);
            if (pause == "stop") {
                print("Event is paused");
            } else {
                pause = "stop";
                stopPausEvent();
                Messages.sendMessage("videoPlayOnEntity", event);
            }
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
        entity = Entities.getEntityProperties(_entityID, ["position", "rotation", "dimensions"]);
        if (JSON.stringify(originalEntityData.position) == JSON.stringify(entity.position) && JSON.stringify(originalEntityData.rotation) == JSON.stringify(entity.rotation) && JSON.stringify(originalEntityData.dimensions) == JSON.stringify(entity.dimensions)) {
        } else {
            Entities.editEntity(uuid, {
                position: entity.position,
                rotation: entity.rotation,
                dimensions: entity.dimensions
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
