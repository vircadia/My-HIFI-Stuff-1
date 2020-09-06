(function () {
    var _entity;
    var _entityID;
    var HasHoveredOverVolumeButton = false;
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

    this.hoverOverEntity = function (entityID, mouseEvent) {
        if (!HasHoveredOverVolumeButton) {
            var readyEvent = {
                "action": "HasHoveredOverVolumeButton",
                "uuid": _entityID
            };
            HasHoveredOverVolumeButton = true;
            Messages.sendMessage("videoPlayOnEntity", JSON.stringify(readyEvent));
            Script.setTimeout(function() {
                HasHoveredOverVolumeButton = false;
            }, 5000);
        }
    };

});
