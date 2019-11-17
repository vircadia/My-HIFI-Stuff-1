(function () {
    var uuid;
    var _uuid;
    var script = this;
    var entity;
    var _entityID;
    var originalEntityData;
    var sourceUrl = Script.resolvePath("shareYourImage.html" + "?" + Date.now());
    script.preload = function (entityID) {
        entity = Entities.getEntityProperties(entityID, ["position", "rotation", "dimensions"]);
        _entityID = entityID;
        uuid = Entities.addEntity({
            type: "Web",
            dpi: 15,
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
            Messages.sendMessage("src", event);
        }
    }

    function onMessageReceived(channel, message, sender, localOnly) {
        if (channel != "src") {
            return;
        }
        Entities.emitScriptEvent(uuid, message);
    }

    Messages.subscribe("src");
    Messages.messageReceived.connect(onMessageReceived);

    var intervalID = Script.setInterval(function () {
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

    script.unload = function (entityID) {
        Messages.unsubscribe("src");
        Messages.messageReceived.disconnect(onMessageReceived);
        Entities.deleteEntity(uuid);
        Entities.webEventReceived.disconnect(onWebEvent);
        Script.clearInterval(intervalID);
    }

});
