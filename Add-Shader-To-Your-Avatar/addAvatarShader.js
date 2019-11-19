Menu.menuItemEvent.connect(onMenuItemEvent);
Menu.addMenu("Avatar Shader");
Menu.addMenuItem("Avatar Shader", "Add avatars shader");
var sessionUUID = MyAvatar.sessionUUID;

function onMenuItemEvent(menuItem) {
    if (menuItem == "Add avatars shader") {
        url = Window.prompt("Enter shader url", "");
        if (url) {
            Entities.addEntity({
                parentID: sessionUUID,
                position: MyAvatar.position,
                priority: 2,
                materialURL: "materialData",
                name: "Avatar Shader",
                materialData: JSON.stringify({ "materials": [{        "model": "hifi_shader_simple",        "procedural": {          "version": 3,          "fragmentShaderURL": url       }    }]}),
                type: "Material"
            }, "avatar");
        }
    }
}

Script.scriptEnding.connect(function () {
    Menu.menuItemEvent.disconnect(onMenuItemEvent);
    Menu.removeMenuItem("Avatar Shader", "Add avatars shader");
    Menu.removeMenu("Avatar Shader");
});
