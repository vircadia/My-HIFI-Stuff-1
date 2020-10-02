(function () {
    var videoTimestampRequestSent = false;
    var _entity;
    var _entityID;
    var myTimeStamp = Date.now();
    this.preload = function (entityID) {
        _entityID = entityID;
        var entity = Entities.getEntityProperties(entityID, ["userData"]);
        _entity = JSON.parse(entity.userData);
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
            "action": "requestTimestamp",
            "uuid": _entityID,
            "myTimeStamp": myTimeStamp
        };
        videoTimestampRequestSent = true;
        Messages.sendMessage("videoPlayOnEntity", JSON.stringify(readyEvent));
    }

    Messages.subscribe("videoPlayOnEntity");
    Messages.messageReceived.connect(onMessageReceived);

    function onMessageReceived(channel, message, sender, localOnly) {
        if (channel != "videoPlayOnEntity") {
            return;
        }
        if (!videoTimestampRequestSent) {
            return;
        } else {
            messageData = JSON.parse(message);
            if (messageData.action == "requestTimestampResponse") {
                if (messageData.myTimeStamp == myTimeStamp) {
                    videoTimestampRequestSent = false;
                    var readyEvent = {
                        "action": _entity.Button,
                        "timeStamp": messageData.timeStamp,
                        "nowVideo": "false"
                    };
                    Messages.sendMessage("videoPlayOnEntity", JSON.stringify(readyEvent));
                }
            }
        }
    }

    Script.scriptEnding.connect(function () {
        Messages.unsubscribe("videoPlayOnEntity");
        Messages.messageReceived.disconnect(onMessageReceived);
    });
});
