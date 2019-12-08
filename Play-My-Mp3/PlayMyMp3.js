(function () {
    var speakerUrl = Script.resolvePath("speaker.fbx");
    var speakerInUse = "no";
    var entityID;
    var injectorIsRunning = "no";
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
            home: Script.resolvePath("playMp3.html?93"),
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
        injectorIsRunning = "yes";
        injector = Audio.playSound(sound, injectorOptions);
    }

    function onSoundReady() {
        sound.ready.disconnect(onSoundReady);
        playSound();
    }

    function okGo() {
        if (injectorIsRunning == "yes") {
            injector.stop();
        }
        if (use == "avatar") {
            var thePositionAt = MyAvatar.position;
        } else if (use == "speaker") {
            entity = Entities.getEntityProperties(entityID, ["position"]);
            var thePositionAt = entity.position;
        }
        injectorOptions.position = thePositionAt;
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
            injectorIsRunning = "no";
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
                speakerInUse = "yes";
            } else if (messageData.soundPlayAt == "avatar") {
                use = "avatar";
                soundPlayingAt = "avatar";
                if (speakerInUse == "yes") {
                    Entities.deleteEntity(entityID);
                    speakerInUse = "no";
                }
            }
        }
    }

    MyAvatar.sessionUUIDChanged.connect(function () {
        injector.stop();
        use = avatar;
        if (speakerInUse == "yes") {
            Entities.deleteEntity(entityID);
            speakerInUse = "no";
        }
    });

    tablet.webEventReceived.connect(onWebEventReceived);

    Script.scriptEnding.connect(function () {
        tablet.webEventReceived.disconnect(onWebEventReceived);
        if (speakerInUse == "yes") {
            Entities.deleteEntity(entityID);
        }
    });
}());
