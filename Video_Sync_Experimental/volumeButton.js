(function () {
    var _entity;
    var _entityID;
    this.preload = function (entityID) {
        _entityID = entityID;
        var entity = Entities.getEntityProperties(entityID, ["userData"]);
        _entity = JSON.parse(entity.userData);
    }

    this.clickDownOnEntity = function () {
        var readyEvent = {
            "action": "volumeButton",
            "volume": _entity.Button,
            "uuid": _entityID
        };
        Messages.sendMessage("videoPlayOnEntity", JSON.stringify(readyEvent));
    }
});
