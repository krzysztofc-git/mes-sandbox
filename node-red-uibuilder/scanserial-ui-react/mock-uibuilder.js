(() => {
    const listeners = new Map();

    const mockScans = [
        {
            LogID: 1,
            SerialID: 101,
            ScanTime: "2020-01-01T12:00:00.000Z",
            Result: "OK",
            UserID: 1
        },
        {
            LogID: 2,
            SerialID: 102,
            ScanTime: "2020-01-01T12:00:00.000Z",
            Result: "SCRAPPED",
            UserID: 1
        },
        {
            LogID: 3,
            SerialID: 103,
            ScanTime: "2020-01-01T12:00:00.000Z",
            Result: "NOT FOUND",
            UserID: 1
        }
    ];

    mockScans.reverse();

    const mockUsers = [
        {
            UserID: 1,
            Username: "User 1"
        },
        {
            UserID: 2,
            Username: "User 2"
        }
    ];

    const mockStations = [
        {
            StationID: 1,
            StationName: "Assembly"
        },
        {
            StationID: 2,
            StationName: "Test"
        }
    ];

    function emit(type, msg) {
        const callback = listeners.get(type);

        if (callback) {
            callback(msg);
            console.log("Emit msg.payload:", msg.payload);
        }
    }

    window.uibuilder = {
        onChange(type, callback) {
            listeners.set(type, callback);

            if (type === 'ctrlMsg') {
                setTimeout(() => {
                    callback({
                        uibuilderCtrl: "client connect"
                    });
                }, 1000);
            }
        },

        send(msg) {
            const getRandomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
            const errorMsg = getRandomChoice(["", "Error"]);

            if (msg.payload?.refresh) {
                if (!errorMsg) {
                    emit("msg", {
                        payload: {
                            errormsg: errorMsg,
                            lastUpdated: Date.now(),
                            latestScans: mockScans,
                            users: mockUsers,
                            stations: mockStations,
                            result: msg.payload.result
                        }
                    });
                } else {
                    emit("msg", {
                        payload: {
                            errormsg: errorMsg,
                        }
                    });
                }
                

                return;
            }

            // simulate scan
            const hashStr2ID = (str) => [...str].reduce((sum, char) => sum + char.charCodeAt(0), 0);

            const newScan = {
                LogID: mockScans.length + 1,
                SerialID: hashStr2ID(msg.payload.serial),
                ScanTime: new Date().toISOString(),
                Result: getRandomChoice(["OK", "SCRAPPED", "NOT FOUND"]),
                UserID: msg.payload.userId
            };

            mockScans.unshift(newScan);

            const randomSerial = getRandomChoice([0,1,2]);
            const result = {
                message: ["Serial is OK.", "Serial has scrapped status.", "Serial was not found."][randomSerial],
                type: ["success", "warning", "error"][randomSerial],
                productName: ["Product 1", "Product 2", "Product 3"][randomSerial]
            };

            emit("msg", {
                payload: {
                    errormsg: errorMsg,
                    lastUpdated: Date.now(),
                    latestScans: mockScans,
                    users: mockUsers,
                    stations: mockStations,
                    result
                }
            });
        }
    };
})();