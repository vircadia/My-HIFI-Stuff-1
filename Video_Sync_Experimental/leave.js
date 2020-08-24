(function () {
    var _entityID;
    var myTimeStamp = Date.now();
    this.preload = function (entityID) {
        _entityID = entityID;
    };

    this.clickDownOnEntity = function () {
        var readyEvent = {
            "action": "leave",
            "uuid": _entityID,
            "myTimeStamp": myTimeStamp
        };
        videoTimestampRequestSent = true;
        Messages.sendMessage("videoPlayOnEntity", JSON.stringify(readyEvent));
    }

    Messages.subscribe("videoPlayOnEntity");

    this.unload = function () {
        Messages.unsubscribe("videoPlayOnEntity");
    }
});
