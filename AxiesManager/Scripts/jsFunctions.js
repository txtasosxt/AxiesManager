let URLaxies
let rowSelections = []

function loadingScreenInit() {
    // Setting up the "loader" popup
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
    $('#pageReloadWarning').css('display', 'inline');
    $('button#loadAxiesBtn').css('display', 'none');
    $('input#ethAddressInput').addClass('input-disabled');
    $('input#ethAddressInput').attr('readonly', true);
}

// Request Axie Infinity API for Axies list
function requestAxies() {
    const BASE_URL = 'https://axieinfinity.com/api/addresses/';
    let offset = 0; // offset = page
    let stage = '4'; // stage1 = Egg, 2 = Larva, 3 = Petite, 4 = Adult
    URLaxies = BASE_URL + ethAddress + '/axies?stage=' + stage;
    // example: https://axieinfinity.com/api/addresses/0x9FD0078c676AEaFAa41F55dE4c12fa9E080c8b22/axies?stage=3&stage=4

    let promise = new Promise(function (resolve, reject) {
        console.log('requestAxies called')
        // Requesting the 1st page of the Axies collection.
        axios.get(URLaxies)
            .then(response => {
                axiesDataObj = response;
                axiesDataArr = axiesDataObj['data']['axies'];
                resolve('Promise done!');
            })
            .catch(error => {
                console.log(error);
            })
    });
    return promise;
}

function getAllPagesToArray() {
    let promise = new Promise(async function (resolve, reject) {
        console.log('getAllPagesToArray called');
        $('#loader p').text('Some are coming from the edges of Lunacia...');
        if (axiesDataObj['data']['totalPages'] > 1) {
            console.log('User has multiple pages of Axies');
            let allPages = [];

            for (let i = 1; i <= (axiesDataObj['data']['totalPages'] - 1); i++) {
                allPages.push(axios.get(URLaxies + '&offset=' + i * 12));
            }
            await axios.all(allPages)
                .then(allPagesObj => {
                    allPagesObj.forEach(singlePageObj => {
                        singlePageObj['data']['axies'].forEach(singleAxie => {
                            axiesDataArr.push(singleAxie);
                        })
                    })
                })
                .catch(error => {
                    console.log(error);
                });
        }
        let axiesImages = await paintAxies();
        for (let i = 0; i < axiesDataArr.length; i++) {
            axiesDataArr[i]['img'] = axiesImages[i];
        }
        resolve('Promise done!');
    });
    return promise;
}

function loadAxiesExtendedData() {
    let promise = new Promise(async function (resolve, reject) {
        console.log('loadAxiesExtendedData called');
        let extendedData_MovesStats = await getMovesStats();
        //let extendedData_pendingEXP = getpendingEXP();
        for (let i = 0; i < axiesDataArr.length; i++) {
            axiesDataArr[i]['parts']['stats'] = {
                'accuracy': extendedData_MovesStats[i]['accuracy'],
                'attack': extendedData_MovesStats[i]['attack'],
                'defense': extendedData_MovesStats[i]['defense'],
                'effects': extendedData_MovesStats[i]['effects']
            }
        }
        resolve('Promise done!');
    });
    return promise;
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
    const URLparts = 'https://axieinfinity.com/api/body-parts';
    axios.get(URLparts)
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
    $('table.dataTable thead tr').first().before('<tr role="row" class="headerFilters"></tr>');
    $('#axiesTable thead th').each(function () {
        var title = $(this).text().replace(/\s/g, '');
        $('<th class="columnSearchField searchField' + title + '"><input class="" type="text" placeholder="Search ' + title + '" /></th>').appendTo('.headerFilters').first();
    });

    // Apply the search on 'keyup'
    let filterInputSelected = $('.headerFilters th input').first()
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

    // The following works without internal table scrolling
    /*
    $('#axiesTable thead tr').before('<tr role="row" id="headerFilters"></tr>');
    $('#axiesTable thead th').each(function () {
        var title = $(this).text();
        $('<th><input type="text" class="columnSearchField" placeholder="Search ' + title + '" /></th>').appendTo('#headerFilters');
    });

    // Apply the search on 'keyup'
    let filterInputSelected = $('#headerFilters th input').first()
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
    });*/
}

// Checks if more than 2 rows have been selected and diselects the first one 
function rowSelector() {
    let table = $('#axiesTable').DataTable();

    table.on('select', function (event, dt, type, sel) {
        if (rowSelections.length == 2) {
            dt.rows(rowSelections[0]).deselect()
        }
        rowSelections.push(sel[0])
    });

    table.on('deselect', function (event, dt, type, sel) {
        let index = rowSelections.indexOf(sel[0]);
        if (index !== -1) {
            rowSelections.splice(index, 1);
        }
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
    return extendedData_MovesStats;
}

function moveAxieClassToParentElement() {
    $('#axiesTable td a').each(function (elemClass) {
        elemClass = $(this).attr('class');
        $(this).removeClass(elemClass)
        $(this).parent().addClass(elemClass);
    })
}

function getBattleTeams() {
    let promise = new Promise(function (resolve, reject) {
        console.log('getBattleTeams called')
        const BASE_URL = 'https://api.axieinfinity.com/v1/battle/teams/';
        let offset = 0; // offset = page
        let count = 9999; // Number of teams to load
        let noLimit = '1'; // Bollean, 1 = no limit in the amount of teams to load
        let URLteams = BASE_URL + '?address=' + ethAddress + '&offset=' + offset + '&count=' + count + '&no_limit=' + noLimit;
        // example: https://api.axieinfinity.com/v1/battle/teams/?address=0x9FD0078c676AEaFAa41F55dE4c12fa9E080c8b22&offset=0&count=9999&no_limit=true

        axios.get(URLteams)
            .then(response => {
                battleTeams = response;
                resolve('Promise done!');
            })
            .catch(error => {
                console.log(error);
            })
    });
    return promise;
}

function loadBattleTeams() {
    let promise = new Promise(function (resolve, reject) {     
        console.log('loadBattleTeams called');

        for (let i = 0; i < axiesDataArr.length; i++) {
            axiesDataArr[i]['battleTeam'] = {
                name: 'None',
                teamID: '',
                axieTeamPosition: null
            },
            battleTeams['data']['teams'].forEach(elementLVL1 => {
                elementLVL1['teamMembers'].forEach(elementLVL2 => {
                    if (elementLVL2['axieId'] == axiesDataArr[i]['id']) {
                        axiesDataArr[i]['battleTeam'] = {
                            name: elementLVL1['name'],
                            teamID: elementLVL1['teamId'],
                            axieTeamPosition: elementLVL2['position']
                        }
                        if (elementLVL1['name'] == 0) {
                            axiesDataArr[i]['battleTeam']['name'] = 'Unnamed Team'
                        }
                        console.log('Team Name: ' + elementLVL1['name'])
                        console.log('Team ID: ' + elementLVL1['teamId'])
                        console.log('Axie ID: ' + axiesDataArr[i]['id'])
                        console.log('-------------')
                    }
                })
            })
        }
        resolve('Promise done!');
    });
    return promise;
}

function openBreedingCalc() {
    let table = $('#axiesTable').DataTable();
    let axie1 = table.rows(rowSelections).data()[0]['id'];
    let axie2 = table.rows(rowSelections).data()[1]['id'];
    let showDetails = ''
    if (document.getElementById("showDetailsCheck").checked == true) {
        showDetails = '&showDetails=true'
    }
    else {
        showDetails = ''
    }
    window.open('https://freakitties.github.io/axie/calc.html?sireId=' + axie1 + '&matronId=' + axie2 + showDetails, '_blank');
}