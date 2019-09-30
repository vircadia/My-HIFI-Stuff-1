var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
var button = tablet.addButton({
    text: "Drop Net"
});

var oldUuid;
var entityPosition;
var entityMessage;
var myDisplayName;

function onClicked() {
    Entities.deleteEntity(oldUuid);
    var loc = Window.prompt("Enter url", "");
    if (loc) {
        Messages.sendMessage("webMe", JSON.stringify({
            sourceUrl: loc,
            displayName: MyAvatar.displayName,
            rotation: MyAvatar.orientation,
            position: Vec3.sum(MyAvatar.position, Quat.getFront(MyAvatar.orientation))
        }));
    }
}

function onMessageReceived(channel, message, sender, localOnly) {
    if (channel != "webMe") {
        return;
    }
    entityMessage = JSON.parse(message);
    entityPosition = entityMessage.position;
    entityUrl = entityMessage.sourceUrl;
    entityRotation = entityMessage.rotation;
    displayName = entityMessage.displayName;
    myDisplayName = MyAvatar.displayName;
    if (displayName == myDisplayName) {
            addWeb();
        } else {
            var confirm = Window.confirm("Would you like to view web entity from " + displayName + "?");
            if (confirm == true) {
                addWeb();
        }
        function addWeb() {
            Entities.deleteEntity(oldUuid);
            entityID = Entities.addEntity({
                type: "Web",
                sourceUrl: entityUrl,
                rotation: entityRotation,
                dimensions: {
                    "x": 2.8344976902008057,
                    "y": 1.594405174255371,
                    "z": 0.009999999776482582
                },
                position: entityPosition
            }, "local");
            oldUuid = entityID;
        }
    }
}

MyAvatar.sessionUUIDChanged.connect(function () {
    Entities.deleteEntity(oldUuid);
});

Messages.subscribe("webMe");
Messages.messageReceived.connect(onMessageReceived);

button.clicked.connect(onClicked);

Script.scriptEnding.connect(function () {
    tablet.removeButton(button);
    Entities.deleteEntity(oldUuid);
    Messages.messageReceived.disconnect(onMessageReceived);
    Messages.unsubscribe(webMe);
});
