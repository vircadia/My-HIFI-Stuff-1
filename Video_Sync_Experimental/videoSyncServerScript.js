(function () {
    var timeStamp;
    var messageData;
    var self = this;
    var pingTimer = 0;
    var intervalIsRunning = "no";
    var pause = "og";
    var videoUrl;
    var timeStampInterval;
    var thisTimeout;
    var isLooping = false;
    var videoLength;
    var videoPlaying = false;
    var newVideoSent = false;
    var newVideoSender;
    var restartVideo = false;

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
            isLooping = false;
            videoPlaying = true;
            newVideoSent = true;
            newVideoSender = messageData.myTimeStamp;
            timeStamp = messageData.timeStamp;
            videoUrl = messageData.videoUrl;
            if (intervalIsRunning == "yes") {
                Script.clearInterval(timeStampInterval);
            }
            intervalIsRunning = "yes";
            ping();

        } else if (messageData.action == "play") {
            timeStamp = messageData.timeStamp;
            if (intervalIsRunning == "yes") {
                Script.clearInterval(timeStampInterval);
            }
            intervalIsRunning = "yes";
            ping();

        } else if (messageData.action == "pause") {
            Script.clearInterval(timeStampInterval);
            intervalIsRunning = "no";
        } else if (messageData.action == "sync") {
            timeStamp = messageData.timeStamp;
        } else if (messageData.action == "requestSync") {
            Script.setTimeout(function () {
                var readyEvent = {
                    action: "sync",
                    timeStamp: timeStamp,
                    videoUrl: videoUrl,
                    nowVideo: "false",
                    myTimeStamp: messageData.myTimeStamp
                };
                var message = JSON.stringify(readyEvent);
                Messages.sendMessage("videoPlayOnEntity", message);
            }, 600);

        } else if (messageData.action == "loop") {
            isLooping = true;
            videoLength = messageData.videoLength;
        } else if (messageData.action == "stopLoop") {
            isLooping = false;
        } else if (messageData.action == "requestVideoPlayingStatus") {
            var readyEvent = {
                action: "requestVideoPlayingStatusReply",
                VideoPlayingStatus: videoPlaying
            };
            var message = JSON.stringify(readyEvent);
            Messages.sendMessage("videoPlayOnEntity", message);
        } else if (messageData.action == "RequestVideoLengthAndTimeStampResponse" && messageData.myTimeStamp == newVideoSender) {
            videoLength = messageData.length;
            newVideoSent = false;
        }
    }

    function ping() {
        timeStampInterval = Script.setInterval(function () {
            timeStamp = timeStamp + 1;
            pingTimer = pingTimer + 1;
            if (isLooping && timeStamp > videoLength) {
                var readyEvent = {
                    "action": "play",
                    "timeStamp": 0,
                    "nowVideo": "false"
                };
                Messages.sendMessage("videoPlayOnEntity", JSON.stringify(readyEvent));
            } else if (!isLooping && timeStamp > videoLength) {
                Script.clearInterval(timeStampInterval);
                intervalIsRunning = "no";
                videoPlaying = false;
                var readyEvent = {
                    action: "requestVideoPlayingStatusReply",
                    VideoPlayingStatus: videoPlaying
                };
                var message = JSON.stringify(readyEvent);
                Messages.sendMessage("videoPlayOnEntity", message);
            }
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
        thisTimeout = Script.setTimeout(function () {
            pause = "og";
        }, 500);
    }

    Messages.subscribe("videoPlayOnEntity");
    Messages.messageReceived.connect(onMessageReceived);

    this.unload = function () {
        Messages.unsubscribe("videoPlayOnEntity");
        Messages.messageReceived.disconnect(onMessageReceived);
        if (intervalIsRunning == "yes") {
            Script.clearInterval(timeStampInterval);
        }
        if (pause == "stop") {
            Script.clearTimeout(thisTimeout);
        }
    }
});
