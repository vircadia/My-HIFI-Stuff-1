(function () {
    var playPauseButtonUrl = Script.resolvePath("playPauseButton.js");
    var volumeButtonUrl = Script.resolvePath("volumeButton.js");
    var playButtonFbxUrl = Script.resolvePath("playButton.fbx");
    var pauseButtonURL = Script.resolvePath("pauseButton.fbx");
    var volumeButtonMinusUrl = Script.resolvePath("volumeButtonMinus.fbx");
    var volumeButtonPlusUrl = Script.resolvePath("volumeButtonPlus.fbx");
    var uuid;
    var script = this;
    var self = this;
    var entity;
    var _entityID;
    var _uuid;
    var originalEntityData;
    var hasBeenSynced = false;
    var playButtonUuid;
    var pauseButtonUuid;
    var originalRotation;
    var reorientButtonsInProgress = false;
    var sourceUrl = Script.resolvePath("videoSync.html" + "?" + Date.now());
    script.preload = function (entityID) {
        entity = Entities.getEntityProperties(entityID, ["position", "rotation", "dimensions"]);
        _entityID = entityID;
        uuid = Entities.addEntity({
            type: "Web",
            dpi: 5,
            maxFPS: 60,
            sourceUrl: sourceUrl,
            dimensions: entity.dimensions,
            registrationPoint: {
                "x": 0.5,
                "y": 0.5,
                "z": 0
            },
            position: entity.position
        }, "local");
        entityOrigin = Entities.getEntityProperties(uuid, ["rotation"]);
        originalRotation = entityOrigin.rotation;
        _uuid = uuid;
        originalEntityData = entity;
        Entities.webEventReceived.connect(onWebEvent);
        addButtons();
    }

    MyAvatar.sessionUUIDChanged.connect(function () {
        Entities.deleteEntity(uuid);
    });

    function onWebEvent(uuid, event) {
        if (uuid == _uuid) {
            messageData = JSON.parse(event);
            Messages.sendMessage("videoPlayOnEntity", event);
        }
    }

    function onMessageReceived(channel, message, sender, localOnly) {
        if (channel != "videoPlayOnEntity") {
            return;
        }
        messageData = JSON.parse(message);
        if (messageData.action == "requestTimestamp") {
            if (messageData.uuid == playButtonUuid) {
                sendMessage(message);
            } else if (messageData.uuid == pauseButtonUuid) {
                sendMessage(message);
            }
        } else if (messageData.action == "volumeButton") {
            if (messageData.uuid == volumeButtonMinus) {
                sendMessage(message);
            } else if (messageData.uuid == volumeButtonPlus) {
                sendMessage(message);
            }
        } else if (!hasBeenSynced) {
            if (messageData.action == "sync" && messageData.action != "now") {
                sendMessage(message);
                hasBeenSynced = true;
                editButtons();
            } else if (messageData.action == "now") {
                sendMessage(message);
                hasBeenSynced = true;
                editButtons();
            }
        } else if (messageData.action == "ping" && hasBeenSynced) {
            sendMessage(message);
            console.log("ping " + hasBeenSynced);
        } else if (hasBeenSynced) {
            console.log("else " + hasBeenSynced);
            sendMessage(message);
        }
    }

    function editButtons() {
        Entities.editEntity(playButtonUuid, {
            visible: true,
            script: playPauseButtonUrl,
            userData: JSON.stringify({
                "Button": "play"
            })
        });

        Entities.editEntity(pauseButtonUuid, {
            visible: true,
            script: playPauseButtonUrl,
            userData: JSON.stringify({
                "Button": "pause"
            })
        });
    }

    function addButtons() {
        playButtonUuid = Entities.addEntity({
            type: "Model",
            modelURL: playButtonFbxUrl,
            parentID: uuid,
            position: {
                "x": entity.position.x - entity.dimensions.x / 2 - -0.2,
                "y": entity.position.y - entity.dimensions.y / 2 - 0.2,
                "z": entity.position.z
            },
            dimensions: {
                "x": 0.22840283811092377,
                "y": 0.22654350101947784,
                "z": 0.019338179379701614
            },
            visible: false,
            grab: {
                "grabbable": false,
            }
        }, "local");

        pauseButtonUuid = Entities.addEntity({
            type: "Model",
            modelURL: pauseButtonURL,
            parentID: uuid,
            position: {
                "x": entity.position.x - entity.dimensions.x / 2 - -0.5,
                "y": entity.position.y - entity.dimensions.y / 2 - 0.2,
                "z": entity.position.z
            },
            dimensions: {
                "x": 0.22521905601024628,
                "y": 0.2252190262079239,
                "z": 0.008053923957049847
            },
            visible: false,
            grab: {
                "grabbable": false,
            }
        }, "local");

        volumeButtonMinus = Entities.addEntity({
            type: "Model",
            modelURL: volumeButtonMinusUrl,
            parentID: uuid,
            position: {
                "x": entity.position.x + entity.dimensions.x / 2 - 0.2,
                "y": entity.position.y - entity.dimensions.y / 2 - 0.2,
                "z": entity.position.z
            },
            userData: JSON.stringify({
                "Button": "down"
            }),
            script: volumeButtonUrl,
            grab: {
                "grabbable": false,
            }
        }, "local");

        volumeButtonPlus = Entities.addEntity({
            type: "Model",
            modelURL: volumeButtonPlusUrl,
            parentID: uuid,
            position: {
                "x": entity.position.x + entity.dimensions.x / 2 - 0.5,
                "y": entity.position.y - entity.dimensions.y / 2 - 0.2,
                "z": entity.position.z
            },
            dimensions: {
                "x": 0.22840283811092377,
                "y": 0.22654350101947784,
                "z": 0.019338179379701614
            },
            userData: JSON.stringify({
                "Button": "up"
            }),
            script: volumeButtonUrl,
            grab: {
                "grabbable": false,
            }
        }, "local");

        Entities.editEntity(uuid, {
            rotation: entity.rotation
        });
    }

    function sendMessage(message) {
        Entities.emitScriptEvent(uuid, message);
    }

    self.intervalID = Script.setInterval(function () {
        entity = Entities.getEntityProperties(_entityID, ["position", "rotation", "dimensions"]);
        if (JSON.stringify(originalEntityData.position) == JSON.stringify(entity.position) && JSON.stringify(originalEntityData.rotation) == JSON.stringify(entity.rotation) && JSON.stringify(originalEntityData.dimensions) == JSON.stringify(entity.dimensions)) {
        } else {
            Entities.editEntity(uuid, {
                position: entity.position,
                rotation: entity.rotation,
                dimensions: entity.dimensions
            });
            originalEntityData = entity;
            reorientButtons();
        }
    }, 600);

    function reorientButtons() {
        if (!reorientButtonsInProgress) {
            reorientButtonsInProgress = true;
            Script.setTimeout(function () {
                Entities.editEntity(uuid, {
                    rotation: originalRotation,
                });
    
                Entities.editEntity(playButtonUuid, {
                    position: {
                        "x": entity.position.x - entity.dimensions.x / 2 - -0.2,
                        "y": entity.position.y - entity.dimensions.y / 2 - 0.2,
                        "z": entity.position.z
                    }
                });
    
                Entities.editEntity(pauseButtonUuid, {
                    position: {
                        "x": entity.position.x - entity.dimensions.x / 2 - -0.5,
                        "y": entity.position.y - entity.dimensions.y / 2 - 0.2,
                        "z": entity.position.z
                    }
                });
    
                Entities.editEntity(volumeButtonMinus, {
                    position: {
                        "x": entity.position.x + entity.dimensions.x / 2 - 0.2,
                        "y": entity.position.y - entity.dimensions.y / 2 - 0.2,
                        "z": entity.position.z
                    },
                });
    
                Entities.editEntity(volumeButtonPlus, {
                    position: {
                        "x": entity.position.x + entity.dimensions.x / 2 - 0.5,
                        "y": entity.position.y - entity.dimensions.y / 2 - 0.2,
                        "z": entity.position.z
                    },
                });
    
                Entities.editEntity(uuid, {
                    position: entity.position,
                    rotation: entity.rotation,
                    dimensions: entity.dimensions
                });
                reorientButtonsInProgress = false;
            }, 2000);
        }
    }

    Messages.subscribe("videoPlayOnEntity");
    Messages.messageReceived.connect(onMessageReceived);

    script.unload = function (entityID) {
        Entities.deleteEntity(volumeButtonPlus);
        Entities.deleteEntity(volumeButtonMinus);
        Entities.deleteEntity(pauseButtonUuid);
        Entities.deleteEntity(playButtonUuid);
        Messages.unsubscribe("videoPlayOnEntity");
        Entities.deleteEntity(uuid);
        Messages.messageReceived.disconnect(onMessageReceived);
        Entities.webEventReceived.disconnect(onWebEvent);
        Script.clearInterval(self.intervalID);
    }
});
