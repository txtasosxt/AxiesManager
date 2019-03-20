// Request Axie Infinity API for Axies list
function requestAxies() {
    const BASE_URL = 'https://axieinfinity.com/api/';
    let offset = 0; // offset = page
    let stage = '4'; // stage1 = Egg, 2 = Larva, 3 = Petite, 4 = Adult
    URL = BASE_URL + 'addresses/' + ethAddress + '/axies?stage=' + stage;
    // example: https://axieinfinity.com/api/addresses/0x9FD0078c676AEaFAa41F55dE4c12fa9E080c8b22/axies?stage=3&stage=4

    $('#loader').dialog({
        modal: true,
        resizable: false,
        draggable: false,
        minWidth: 400,
        show: { effect: 'puff' },
        hide: { effect: 'explode', duration: 1000 }
    });
    $("#axiesLoadingProgressBar").progressbar({ value: false });

    $('#loader p').text('Calling out all Axies...');
    axios.get(URL)
        .then(response => {
            axiesDataObj = response;
            axiesDataArr = axiesDataObj['data']['axies'];
            loadAllPagesToArray();
        })
        .catch(error => {
            console.log(error);
        })
}

async function paintAxies() {
    $('#loader p').text('Lining them all up...');
    const BASE_URL = 'https://api.axieinfinity.com/v1/figure/';
    axiesImagesInitURL = [];
    axiesImagesURL = [];

    for (let i = 0; i < axiesDataArr.length; i++) {
        axiesImagesInitURL.push(BASE_URL + axiesDataArr[i]['id']);
    }
    let promiseArray = await axiesImagesInitURL.map(url => axios.get(url));
    await axios.all(promiseArray)
        .then(results => {
            for (let i in results) {
                axiesImagesURL.push(results[i]['data']['static']['idle'])
            }
        })
    return axiesImagesURL;
}

function getBodyParts() {
    const URL = 'https://axieinfinity.com/api/body-parts';
    axios.get(URL)
        .then((response) => {
            return response;
        })
        .catch((error) => {
            console.log(error);
        });
}

function addTableSearchFields() {
    // Capturing the table before the insertion of the search fields in the header
    var table = $('#axiesTable').DataTable();

    // Setup - Add a text input before each header cell
    $('#axiesTable thead tr').before('<tr role="row" id="headerFilters"></tr>');
    $('#axiesTable thead th').each(function () {
        var title = $(this).text();
        $('<th><input id="searchField' + title + '" type="text" class="columnSearchField" placeholder="Search ' + title + '" /></th>').appendTo('#headerFilters');
    });

    // Apply the search on 'keyup'
    let filterInputSelected = $('input', table.column(0).header().parentElement.previousSibling.firstChild);
    table.columns().every(function () {
        var that = this; //that = the 'this column'

        filterInputSelected.on('keyup change', function () {
            if (that.search() !== this.value) {
                that
                    .search(this.value)
                    .draw()
            }
        });
        filterInputSelected = $(filterInputSelected).parent().next().find('input');
    });
}

function getMovesStats() {
    let extendedData_MovesStats = [];
    let attackPartsCount = [];
    for (let i = 0; i < axiesDataArr.length; i++) {
        extendedData_MovesStats.push({
            'accuracy': 0, 'attack': 0, 'defense': 0, 'effects': []
        })
        attackPartsCount.push(0);
        let parts = axiesDataArr[i]['parts'];
        for (let i2 = 0; i2 < parts.length; i2++) {
            if (parts[i2]['moves'][0] !== undefined) {
                if (parts[i2]['moves'][0]['attack'] > 0) {
                    attackPartsCount[i]++;
                    extendedData_MovesStats[i]['accuracy'] += parts[i2]['moves'][0]['accuracy'];
                    extendedData_MovesStats[i]['attack'] += parts[i2]['moves'][0]['attack'];
                }
                extendedData_MovesStats[i]['defense'] += parts[i2]['moves'][0]['defense'];
                if (parts[i2]['moves'][0]['effects'][0] !== undefined) {
                    extendedData_MovesStats[i]['effects'].push(parts[i2]['moves'][0]['effects'][0]['description']);
                }
            }
        }
        extendedData_MovesStats[i]['accuracy'] /= attackPartsCount[i];
    }
    console.log(extendedData_MovesStats);
    return extendedData_MovesStats;
}

function moveAxieClassToParentElement() {
    $('#axiesTable td a').each(function (elemClass) {
        elemClass = $(this).attr('class');
        $(this).removeClass(elemClass)
        $(this).parent().addClass(elemClass);
    })
}

function requestBattleTeams() {
    const BASE_URL = 'https://axieinfinity.com/api/';
    let offset = 0; // offset = page
    let stage = '4'; // stage1 = Egg, 2 = Larva, 3 = Petite, 4 = Adult
    URL = BASE_URL + 'addresses/' + ethAddress + '/axies?stage=' + stage;
}