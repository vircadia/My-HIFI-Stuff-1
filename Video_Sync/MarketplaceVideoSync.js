(function () {
    var SoundUrl = "http://192.168.0.8/javascript/beep.mp3?jhg";
    var sound = SoundCache.getSound(SoundUrl);
    var index = 0;
    var position = [
    ];
    var timer;
    var recOn = "off";
    var playing = "off";
    var timerB;
    this.preload = function (EntityID) {
        _entitya1 = EntityID;
    };
    function rec() {
        print("rec");
        index = 0;
        if (sound.downloaded) {
            playSound();
        } else {
            sound.ready.connect(onSoundReady);
        }
        timer = Script.setInterval(function () {
            var recordedPositions = Entities.getEntityProperties(_entitya1, ["position", "rotation"]);
            position[index] = {};
            position[index].position = recordedPositions.position;
            position[index].rotation = recordedPositions.rotation;
            index++
            if (index == 500) {
                print("dun");
                Script.clearInterval(timer);
                play();
            }
        }, 60);
    }
    function play() {
        if (sound.downloaded) {
            playSound();
        } else {
            sound.ready.connect(onSoundReady);
        }
        recOn = "off";
        playing = "on";
        index = 0;
        timerB = Script.setInterval(function () {
            Entities.editEntity(_entitya1, {
                position: position[index].position,
                rotation: position[index].rotation
            });
            index++
            if (index == 500) {
                index = 0;
            }
        }, 60);
    }
    this.clickDownOnEntity = function (_entitya1, mouseEvent) {
        if (recOn == "off" && playing == "off") {
            rec();
            recOn = "on";
        }
        if (playing == "on") {
            Script.clearInterval(timerB);
            Script.setTimeout(function () {
                playing = "off";
            }, 500);
            if (sound.downloaded) {
                playSound();
            } else {
                sound.ready.connect(onSoundReady);
            }
        }
    };
    this.startNearTrigger = function (_entitya1) {
        if (recOn == "off" && playing == "off") {
            rec();
            recOn = "on";
        }
        if (playing == "on") {
            Script.clearInterval(timerB);
            Script.setTimeout(function () {
                playing = "off";
            }, 500);
            if (sound.downloaded) {
                playSound();
            } else {
                sound.ready.connect(onSoundReady);
            }
        }
    };
    this.startFarTrigger = function (_entitya1) {
        if (recOn == "off" && playing == "off") {
            rec();
            recOn = "on";
        }
        if (playing == "on") {
            Script.clearInterval(timerB);
            Script.setTimeout(function () {
                playing = "off";
            }, 500);
            if (sound.downloaded) {
                playSound();
            } else {
                sound.ready.connect(onSoundReady);
            }
        }
    };

    function playSound() {
        var injectorOptions = {
            position: MyAvatar.position
        };
        var injector = Audio.playSound(sound, injectorOptions);
    }

    function onSoundReady() {
        sound.ready.disconnect(onSoundReady);
        playSound();
    }

    Script.unload = function (entityID) {
        if (recOn == "on") {
            Script.clearInterval(timer);
        }
        if (playing == "on") {
            Script.clearInterval(timerB);
        }
    }

});
