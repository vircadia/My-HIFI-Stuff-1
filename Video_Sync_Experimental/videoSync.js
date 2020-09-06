(function () {
    var playPauseButtonUrl = Script.resolvePath("playPauseButton.js");
    var volumeButtonUrl = Script.resolvePath("volumeButton.js");
    var videoSyncInterface = Script.resolvePath("videoSyncInterface.js");
    var leaveButtonUrl = Script.resolvePath("leave.js");
    var playButtonFbxUrl = Script.resolvePath("playButton.fbx");
    var pauseButtonURL = Script.resolvePath("pauseButton.fbx");
    var volumeButtonMinusUrl = Script.resolvePath("volumeButtonMinus.fbx");
    var volumeButtonPlusUrl = Script.resolvePath("volumeButtonPlus.fbx");
    var videoInterfaceButton = Script.resolvePath("videoInterfaceButton.fbx");
    var leaveButtonFbxUrl = Script.resolvePath("leave.fbx");
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
    var leaveButtonUuid;
    var originalRotation;
    var reorientButtonsInProgress = false;
    var HtmlTimeStamp;
    var volumeButtonMinus;
    var volumeSliderUuid;
    var HasHoveredOverVolumeButton = false;
    var haveLeft = false;
    var HasHoveredOverVolumeButtonTimeout;

    var sourceUrl = Script.resolvePath("videoSync.html" + "?" + Date.now());
    var volumeSliderSourceUrl = Script.resolvePath("volumeSlider.html" + "?" + Date.now());
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
        if (uuid == _uuid || volumeSliderUuid == uuid) {
            messageData = JSON.parse(event);
            if (messageData.action == "requestSync") {
                HtmlTimeStamp = messageData.myTimeStamp;
                if (haveLeft) {
                    makeControlButtonsVisible();
                    haveLeft = false;
                }
            }
            if (messageData.action == "volumeSlider") {
                sendMessage(event);
                if (HasHoveredOverVolumeButton) {
                    Script.clearTimeout(HasHoveredOverVolumeButtonTimeout);
                    HasHoveredOverVolumeButtonTimeout = Script.setTimeout(function () {
                        Entities.editEntity(volumeSliderUuid, {
                            visible: false
                        });
                        HasHoveredOverVolumeButton = false;
                    }, 10000);
                }
            } else if (messageData.action == "volumeChanged") {
                Entities.emitScriptEvent(volumeSliderUuid, event);
            } else {
                Messages.sendMessage("videoPlayOnEntity", event);
            }
        }
    }

    function onMessageReceived(channel, message, sender, localOnly) {
        if (channel != "videoPlayOnEntity") {
            return;
        }
        messageData = JSON.parse(message);
        if (messageData.action == "requestTimestamp") {
            if (messageData.uuid == playButtonUuid || messageData.uuid == pauseButtonUuid) {
                sendMessage(message);
            }
        } else if (messageData.action == "requestVideoPlayingStatusReply") {
            sendMessage(message);
        } else if (messageData.action == "volumeButton") {
            if (messageData.uuid == volumeButtonMinus || messageData.uuid == volumeButtonPlus) {
                sendMessage(message);
            }
        } else if (messageData.action == "HasHoveredOverVolumeButton") {
            if (messageData.uuid == volumeButtonMinus || messageData.uuid == volumeButtonPlus) {
                if (!HasHoveredOverVolumeButton) {
                    Entities.editEntity(volumeSliderUuid, {
                        visible: true
                    });
                    HasHoveredOverVolumeButton = true
                    HasHoveredOverVolumeButtonTimeout = Script.setTimeout(function () {
                        Entities.editEntity(volumeSliderUuid, {
                            visible: false
                        });
                        HasHoveredOverVolumeButton = false;
                    }, 10000);
                } else if (HasHoveredOverVolumeButton) {
                    Script.clearTimeout(HasHoveredOverVolumeButtonTimeout);
                    HasHoveredOverVolumeButtonTimeout = Script.setTimeout(function () {
                        Entities.editEntity(volumeSliderUuid, {
                            visible: false
                        });
                        HasHoveredOverVolumeButton = false;
                    }, 10000);
                }
            }

        } else if (messageData.action == "leave" && messageData.uuid == leaveButtonUuid) {
            var readyEvent = {
                action: "videoEnd",
                sender: "Button"
            };
            sendMessage(JSON.stringify(readyEvent));
            haveLeft = true;
            makeControlButtonsNotVisible();
        } else if (!hasBeenSynced) {
            if (messageData.action == "sync" && messageData.action != "now") {
                if (messageData.myTimeStamp == HtmlTimeStamp) {
                    sendMessage(message);
                    hasBeenSynced = true;
                    makeControlButtonsVisible();
                }
            } else if (messageData.action == "now" && hasBeenSynced) {
                sendMessage(message);
                hasBeenSynced = true;
                makeControlButtonsVisible();
            }
        } else if (messageData.action == "ping" && hasBeenSynced) {
            sendMessage(message);
        } else if (hasBeenSynced) {
            sendMessage(message);
        }
    }

    function makeControlButtonsVisible() {
        if (Entities.canRez() == true) {

            Entities.editEntity(videoInterfaceButton, {
                visible: true,
                script: videoSyncInterface,
                userData: JSON.stringify({
                    "Button": "pause"
                })
            });

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

        Entities.editEntity(leaveButtonUuid, {
            visible: true,
            script: leaveButtonUrl
        });
    }

    function makeControlButtonsNotVisible() {

        if (Entities.canRez() == true) {

            Entities.editEntity(videoInterfaceButton, {
                visible: false,
                script: ""
            });

            Entities.editEntity(playButtonUuid, {
                visible: false,
                script: ""
            });

            Entities.editEntity(pauseButtonUuid, {
                visible: false,
                script: ""
            });

        }


        Entities.editEntity(leaveButtonUuid, {
            visible: false,
            script: ""
        });
    }

    function addButtons() {
        if (Entities.canRez() == true) { // We check to see if the user has edit rights to ensure only trusted users are given video controls (easily..)
            videoInterfaceButton = Entities.addEntity({
                type: "Model",
                modelURL: videoInterfaceButton,
                parentID: uuid,
                position: {
                    "x": entity.position.x - entity.dimensions.x / 2 - -0.5,
                    "y": entity.position.y + entity.dimensions.y / 2 + 0.4,
                    "z": entity.position.z
                },
                userData: JSON.stringify({
                    "Button": "up"
                }),
                visible: false,
                grab: {
                    "grabbable": false,
                }
            }, "local");

            playButtonUuid = Entities.addEntity({
                type: "Model",
                modelURL: playButtonFbxUrl,
                parentID: uuid,
                position: {
                    "x": entity.position.x - entity.dimensions.x / 2 - -0.5,
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
                    "x": entity.position.x - entity.dimensions.x / 2 - -0.8,
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
        }

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

        leaveButtonUuid = Entities.addEntity({
            type: "Model",
            modelURL: leaveButtonFbxUrl,
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

        volumeSliderUuid = Entities.addEntity({
            type: "Web",
            dpi: 8,
            sourceUrl: volumeSliderSourceUrl,
            parentID: uuid,
            visible: false,
            dimensions: {
                "x": 1.3687,
                "y": 0.3429,
                "z": 0.0010
            },
            registrationPoint: {
                "x": 0.5,
                "y": 0.5,
                "z": 0
            },
            position: {
                "x": entity.position.x + entity.dimensions.x / 2 - 1.4,
                "y": entity.position.y - entity.dimensions.y / 2 - 0.2,
                "z": entity.position.z
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

                if (Entities.canRez() == true) {

                    Entities.editEntity(videoInterfaceButton, {
                        position: {
                            "x": entity.position.x - entity.dimensions.x / 2 - -0.5,
                            "y": entity.position.y + entity.dimensions.y / 2 + 0.4,
                            "z": entity.position.z
                        },
                    });

                    Entities.editEntity(playButtonUuid, {
                        position: {
                            "x": entity.position.x - entity.dimensions.x / 2 - -0.5,
                            "y": entity.position.y - entity.dimensions.y / 2 - 0.2,
                            "z": entity.position.z
                        }
                    });

                    Entities.editEntity(pauseButtonUuid, {
                        position: {
                            "x": entity.position.x - entity.dimensions.x / 2 - -0.8,
                            "y": entity.position.y - entity.dimensions.y / 2 - 0.2,
                            "z": entity.position.z
                        },
                    });

                }

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

                Entities.editEntity(leaveButtonUuid, {
                    position: {
                        "x": entity.position.x - entity.dimensions.x / 2 - -0.2,
                        "y": entity.position.y - entity.dimensions.y / 2 - 0.2,
                        "z": entity.position.z
                    },
                });

                Entities.editEntity(volumeSliderUuid, {
                    position: {
                        "x": entity.position.x + entity.dimensions.x / 2 - 1.4,
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
            }, 1000);
        }
    }

    Messages.subscribe("videoPlayOnEntity");
    Messages.messageReceived.connect(onMessageReceived);

    script.unload = function (entityID) {
        if (Entities.canRez() == true) {
            Entities.deleteEntity(videoInterfaceButton);
            Entities.deleteEntity(playButtonUuid);
            Entities.deleteEntity(pauseButtonUuid);
        }
        Entities.deleteEntity(volumeButtonPlus);
        Entities.deleteEntity(volumeButtonMinus);
        Entities.deleteEntity(volumeSliderUuid);
        Messages.unsubscribe("videoPlayOnEntity");
        Entities.deleteEntity(uuid);
        Messages.messageReceived.disconnect(onMessageReceived);
        Entities.webEventReceived.disconnect(onWebEvent);
        Script.clearInterval(self.intervalID);
        if (HasHoveredOverVolumeButton) {
            Script.clearTimeout(HasHoveredOverVolumeButtonTimeout);
        }
    }
});
