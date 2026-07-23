function sendScan() {
    const serial = document.getElementById('serialInput').value;

    uibuilder.send({
        payload: {
            serial: serial,
            userId: 1
        }
    });
}

uibuilder.onChange('msg', function(msg) {

    if (msg.payload.errormsg) {
        document.getElementById('errorText').innerText =
            msg.payload.errormsg;
    }

    if (msg.payload.lastUpdated) {
        document.getElementById('lastUpdated').innerText =
            new Date(msg.payload.lastUpdated).toString();
    } else {
        document.getElementById('lastUpdated').innerText = "failed";
    }

    if (msg.payload.latestScans) {
        const table = document.getElementById('scanTable');
        table.innerHTML = '';

        msg.payload.latestScans.forEach(scan => {
            const row = `
                <tr>
                    <td>${scan.LogID}</td>
                    <td>${scan.SerialCode}</td>
                    <td>${scan.ScanTime}</td>
                    <td>${scan.Result}</td>
                    <td>${scan.UserID}</td>
                </tr>
            `;
            table.innerHTML += row;
        });
    }
});

uibuilder.onChange('ctrlMsg', function(msg){
    if (msg.uibuilderCtrl === 'client connect') {
        uibuilder.send({
            payload: {
                refresh: true
            }
        });
    }
});