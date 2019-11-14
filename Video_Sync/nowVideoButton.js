(function () {
    this.preload = function (EntityID) {
        _entitya1 = EntityID;
    };
    function playMovies() {
        var readyEvent = {
            "action": "now",
            "timeStamp": 0,
            "videoUrl": "Video URL here",
        };
        var message = JSON.stringify(readyEvent);
        Messages.sendMessage("videoPlayOnEntity", message);
    }
    this.clickDownOnEntity = function (_entitya1, mouseEvent) {
        playMovies();
    };
    this.startNearTrigger = function (_entitya1) {
        playMovies();
    };
    this.startFarTrigger = function(_entitya1) {        
        playMovies();
    };
});
