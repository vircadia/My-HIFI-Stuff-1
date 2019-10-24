(function () {
    var timeStamp;
    var messageData;
    var self = this;
    var pingTimer = 0;
    var intervalIsRunning = "no";
    var pause = "og";
    var videoUrl;

    function onMessageReceived(channel, message, sender, localOnly) {
        if (channel != "videoPlayOnEntity") {
            return;
        }
        messageData = JSON.parse(message);
        if (pause == "stop") {
        }
        stopPausEvent();
        pause = "stop";
        if (messageData.action == "now") {
            timeStamp = messageData.timeStamp;
            videoUrl = messageData.videoUrl;
            if (intervalIsRunning == "yes") {
                Script.clearInterval(self.intervalID);
            }
            intervalIsRunning = "yes";
            ping();

        } else if (messageData.action == "play") {
            timeStamp = messageData.timeStamp;
            if (intervalIsRunning == "yes") {
                Script.clearInterval(self.intervalID);
            }
            intervalIsRunning = "yes";
            ping();

        } else if (messageData.action == "pause") {
            Script.clearInterval(self.intervalID);
            intervalIsRunning = "no";
        } else if (messageData.action == "sync") {
            timeStamp = messageData.timeStamp;
        } else if (messageData.action == "requestSync") {
            Script.setTimeout(function () {
                var readyEvent = {
                    action: "sync",
                    timeStamp: timeStamp,
                    videoUrl: videoUrl,
                    nowVideo: "false"
                };
                var message = JSON.stringify(readyEvent);
                Messages.sendMessage("videoPlayOnEntity", message);
            }, 600);

        }
    }

    function ping() {
        self.intervalID = Script.setInterval(function () {
            timeStamp = timeStamp + 1;
            pingTimer = pingTimer + 1;
            if (pingTimer == 60) {
                pingTimer = 0;
                messageData.timeStamp = timeStamp;
                messageData.action = "ping";
                var message = JSON.stringify(messageData);
                Messages.sendMessage("videoPlayOnEntity", message);
            }
        }, 1000);
    }

    function stopPausEvent() {
        Script.setTimeout(function () {
            pause = "og";
        }, 500);
    }

    Messages.subscribe("videoPlayOnEntity");
    Messages.messageReceived.connect(onMessageReceived);

    this.unload = function() {
        Script.clearInterval(self.intervalID);
    }
});
