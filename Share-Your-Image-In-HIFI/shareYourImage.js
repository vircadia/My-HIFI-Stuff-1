(function () {
    var uuid;
    var script = this;
    var entity;
    var _entityID;
    var originalEntityData;
    var v = { x: 0, y: 0.1, z: 0 };
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
            position: Vec3.sum(v, entity.position)
        }, "local");
        originalEntityData = entity;
        Entities.webEventReceived.connect(onWebEvent);
    }

    MyAvatar.sessionUUIDChanged.connect(function () {
        Entities.deleteEntity(uuid);
    });

    function onWebEvent(uuid, event) {
        Messages.sendMessage("src", event);
    }

    function onMessageReceived(channel, message, sender, localOnly) {
        if (channel != "src") {
            return;
        }
        messageData = JSON.parse(message);
        Entities.emitScriptEvent(uuid, message);
    }

    Messages.subscribe("src");
    Messages.messageReceived.connect(onMessageReceived);

    var intervalID = Script.setInterval(function () {
        entity = Entities.getEntityProperties(_entityID, ["position", "rotation", "dimensions"]);
        if (JSON.stringify(originalEntityData.position) == JSON.stringify(entity.position) && JSON.stringify(originalEntityData.rotation) == JSON.stringify(entity.rotation) && JSON.stringify(originalEntityData.dimensions) == JSON.stringify(entity.dimensions)) {
        } else {
            Entities.editEntity(uuid, {
                position: Vec3.sum(v, entity.position),
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
