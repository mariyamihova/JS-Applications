function getInfo() {
    let stopId = $('#stopId').val();
    let list = $('#buses');
    let url = `https://judgetests.firebaseio.com/businfo/${stopId}.json`;
    let request = {
        method: 'GET',
        url: url,
        success: displayBusInfo,
        error: () => $('#stopName').text('Error')
    };

    $.ajax(request);

    function displayBusInfo(busInfo) {
        let busStopName = busInfo['name'];
        $('#stopName').text(busStopName);
        let buses = busInfo['buses'];
        list.empty();
        for (let bus in buses) {
            list.append(`<li>Bus ${bus} arrives in ${buses[bus]} minutes </li>`)
        }

    }
}
