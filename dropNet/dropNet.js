Menu.menuItemEvent.connect(onMenuItemEvent);
Menu.addMenu("Drop Net");
Menu.addMenuItem("Drop Net", "Clear all browsers");
var sessionUUID = MyAvatar.sessionUUID;
var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
var button = tablet.addButton({
    text: "Drop Net"
});

function onMenuItemEvent(menuItem) {
    if (menuItem == "Clear all browsers") {
    }
    ClearAllBrowsers();
}

var oldUuids = [
    ""
];
var numberToAssignUuidInArray = 0;
var entityPosition;
var entityMessage;
var myDisplayName;

function onClicked() {
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
            entityID = Entities.addEntity({
                type: "Web",
                sourceUrl: entityMessage.sourceUrl,
                rotation: entityMessage.rotation,
                dimensions: {
                    "x": 2.8344976902008057,
                    "y": 1.594405174255371,
                    "z": 0.009999999776482582
                },
                position: entityMessage.position
            }, "local");
            oldUuids[numberToAssignUuidInArray] = entityID;
            numberToAssignUuidInArray++;
        }
    }
}

MyAvatar.sessionUUIDChanged.connect(function () {
    ClearAllBrowsers();
});

Messages.subscribe("webMe");
Messages.messageReceived.connect(onMessageReceived);

button.clicked.connect(onClicked);

function ClearAllBrowsers() {
    for (i = 0; i < oldUuids.length; i++) {
        Entities.deleteEntity(oldUuids[i]);
    }
    oldUuids = [
        ""
    ];
}

Script.scriptEnding.connect(function () {
    tablet.removeButton(button);
    ClearAllBrowsers();
    Messages.messageReceived.disconnect(onMessageReceived);
    Messages.unsubscribe("webMe");
    Menu.removeMenuItem("Drop Net", "Clear all browsers");
    Menu.removeMenu("Drop Net");
});
