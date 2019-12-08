(function () {
    var speakerUrl = Script.resolvePath("speaker.fbx");
    var speakerInUse = false;
    var entityID;
    var injectorIsRunning = false;
    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    var AppUi = Script.require('appUi');
    var sound;
    var use = "avatar";
    var injectorOptions = {
        position: MyAvatar.position,
        volume: 0.01
    };
    var injector;
    var soundPlayingAt = "avatar";
    startup();
    var ui;
    function startup() {
        ui = new AppUi({
            buttonName: "Play Mp3",
            home: Script.resolvePath("playMp3.html"),
            graphicsDirectory: Script.resolvePath("./"),
        });
    }

    function browseForMp3() {
        var filename = Window.browse("Select mp3", "");
        if (filename != null) {
            sound = SoundCache.getSound(filename);
            okGo(sound);
        }
    }

    function playSound() {
        injectorIsRunning = true;
        injector = Audio.playSound(sound, injectorOptions);
        injector.finished.connect(function () {
            injectorIsRunning = false;
        });
    }

    function onSoundReady() {
        sound.ready.disconnect(onSoundReady);
        playSound();
    }

    function okGo() {
        if (injectorIsRunning) {
            injector.stop();
        }
        if (use == "avatar") {
            var injectorPosition = MyAvatar.position;
        } else if (use == "speaker") {
            entity = Entities.getEntityProperties(entityID, ["position"]);
            var injectorPosition = entity.position;
        }
        injectorOptions.position = injectorPosition;
        if (sound.downloaded) {
            playSound();
        } else {
            sound.ready.connect(onSoundReady);
        }
    }

    function onWebEventReceived(event) {
        messageData = JSON.parse(event);
        if (messageData.action == "newMp3") {
            browseForMp3();
        } else if (messageData.action == "adjustVolume") {
            injectorOptions.volume = parseFloat(messageData.volume);
            injector.options = injectorOptions;
        } else if (messageData.action == "newMp3Url") {
            var filename = messageData.Mp3Url;
            sound = SoundCache.getSound(filename);
            okGo();
        } else if (messageData.action == "stopIt") {
            injector.stop();
            injectorIsRunning = false;
        } else if (messageData.action == "buttonStatus") {
            var readyEvent = {
                "action": "buttonStatusResponse",
                "soundPlayingAt": soundPlayingAt
            };
            tablet.emitScriptEvent(JSON.stringify(readyEvent));
        } else if (messageData.action == "soundPlayAt") {
            if (messageData.soundPlayAt == "speaker") {
                use = "speaker";
                soundPlayingAt = "speaker";
                entityID = Entities.addEntity({
                    type: "Model",
                    modelURL: speakerUrl,
                    position: Vec3.sum(MyAvatar.position, Quat.getFront(MyAvatar.orientation))
                }, "avatar");
                speakerInUse = true;
            } else if (messageData.soundPlayAt == "avatar") {
                use = "avatar";
                soundPlayingAt = "avatar";
                if (speakerInUse) {
                    Entities.deleteEntity(entityID);
                    speakerInUse = false;
                }
            }
        }
    }

    MyAvatar.sessionUUIDChanged.connect(function () {
        use = "avatar";
        speakerInUse = false;
        soundPlayingAt = "avatar";
        injectorIsRunning = false;
        Entities.deleteEntity(entityID);
        injector.stop();
    });

    tablet.webEventReceived.connect(onWebEventReceived);

    Script.scriptEnding.connect(function () {
        tablet.webEventReceived.disconnect(onWebEventReceived);
        if (soundPlayingAt == "speaker") {
            Entities.deleteEntity(entityID);
        }
    });
}());
