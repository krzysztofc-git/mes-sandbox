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

    function emit(type, msg) {
        const callback = listeners.get(type);

        if (callback) {
            callback(msg);
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

            console.log("Mock uibuilder received:", msg);

            if (msg.payload?.refresh) {
                if (!errorMsg) {
                    emit("msg", {
                        payload: {
                            errormsg: errorMsg,
                            lastUpdated: Date.now(),
                            latestScans: mockScans
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

            mockScans.push(newScan);

            emit("msg", {
                payload: {
                    errormsg: errorMsg,
                    lastUpdated: Date.now(),
                    latestScans: mockScans
                }
            });
        }
    };
})();