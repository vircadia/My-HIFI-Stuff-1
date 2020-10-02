(function () {
    var _entity;
    var _entityID;
    var myTimeStamp = Date.now();
    this.preload = function (entityID) {
        _entityID = entityID;
    };

    this.clickDownOnEntity = function () {
        sendAction();
    }

    this.startNearTrigger = function () {
        sendAction();
    };

    this.startFarTrigger = function() {        
        sendAction();
    };

    function sendAction() {
        var readyEvent = {
            "action": "leave",
            "uuid": _entityID,
            "myTimeStamp": myTimeStamp
        };
        videoTimestampRequestSent = true;
        Messages.sendMessage("videoPlayOnEntity", JSON.stringify(readyEvent));
    }

    Messages.subscribe("videoPlayOnEntity");

    Script.scriptEnding.connect(function () {
        Messages.unsubscribe("videoPlayOnEntity");
    });
});
