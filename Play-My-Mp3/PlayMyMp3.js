(function () {
    var injectorIsRunning = "no";
    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    var AppUi = Script.require('appUi');
    var sound;
    var injectorOptions = {
        position: MyAvatar.position,
        volume: 0.01
    };
    var injector;
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
        sound = SoundCache.getSound(filename);
        okGo(sound);
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
        injectorOptions.position = MyAvatar.position;
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
        }
    }

    MyAvatar.sessionUUIDChanged.connect(function () {
        injector.stop();
    });

    tablet.webEventReceived.connect(onWebEventReceived);

    Script.scriptEnding.connect(function () {
        tablet.webEventReceived.disconnect(onWebEventReceived);
    });
}());
