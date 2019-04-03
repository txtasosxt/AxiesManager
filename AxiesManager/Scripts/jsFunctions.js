let URLaxies;
let rowSelections = [];
let test = [];

//// Axie Data [START] ////
function requestAxies() {
    const BASE_URL = 'https://axieinfinity.com/api/addresses/';
    let offset = 0; // offset = page
    let stage; // stage1 = Egg, 2 = Larva, 3 = Petite, 4 = Adult
    let ampersandRequired = false;
    if ($("#checkbox-filter-adult").is(':checked')) {
        stage = '4';
        ampersandRequired = true;
    }
    if ($("#checkbox-filter-petite").is(':checked')) {
        if (ampersandRequired) {
            stage += '&stage='
        }
        stage += '3';
        ampersandRequired = true;
    }
    if ($("#checkbox-filter-lavra").is(':checked')) {
        if (ampersandRequired) {
            stage += '&stage='
        }
        stage += '2';
        ampersandRequired = true;
    }
    console.log(stage);
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
                'effects': extendedData_MovesStats[i]['effects'],
                'attackBeastBug': extendedData_MovesStats[i]['attackBeastBug'],
                'attackPlantReptile': extendedData_MovesStats[i]['attackPlantReptile'],
                'attackAquaticBird': extendedData_MovesStats[i]['attackAquaticBird'],
                'attackScore': extendedData_MovesStats[i]['attackScore']
            }
        }
        resolve('Promise done!');
    });
    return promise;
}

function getMovesStats() {
    let extendedData_MovesStats = [];
    let attackPartsCount = [];
    for (let i = 0; i < axiesDataArr.length; i++) {
        extendedData_MovesStats.push({
            'accuracy': 0, 'attack': 0, 'defense': 0, 'effects': [], 'attackBeastBug': 0, 'attackPlantReptile': 0, 'attackAquaticBird': 0, 'attackScore': 0
        })
        attackPartsCount.push(0);
        let parts = axiesDataArr[i]['parts'];
        for (let i2 = 0; i2 < parts.length; i2++) {
            if (parts[i2]['moves'][0] !== undefined) {
                if (parts[i2]['moves'][0]['attack'] > 0) {
                    attackPartsCount[i]++;
                    extendedData_MovesStats[i]['accuracy'] += parts[i2]['moves'][0]['accuracy'];
                    extendedData_MovesStats[i]['attack'] += parts[i2]['moves'][0]['attack'];
                    if (parts[i2]['class'] == 'beast' || parts[i2]['class'] == 'bug') {
                        extendedData_MovesStats[i]['attackBeastBug'] += parts[i2]['moves'][0]['attack'];
                    } else if (parts[i2]['class'] == 'plant' || parts[i2]['class'] == 'reptile') {
                        extendedData_MovesStats[i]['attackPlantReptile'] += parts[i2]['moves'][0]['attack'];
                    } else if (parts[i2]['class'] == 'aquatic' || parts[i2]['class'] == 'bird') {
                        extendedData_MovesStats[i]['attackAquaticBird'] += parts[i2]['moves'][0]['attack'];
                    }
                    extendedData_MovesStats[i]['attackScore'] += calculateTrueAttack(axiesDataArr[i]['stats']['skill'], axiesDataArr[i]['stats']['morale'], parts[i2]['moves'][0]['attack'], parts[i2]['moves'][0]['accuracy'])
                }
                extendedData_MovesStats[i]['defense'] += parts[i2]['moves'][0]['defense'];
                if (parts[i2]['moves'][0]['effects'][0] !== undefined) {
                    let effectTitle = parts[i2]['moves'][0]['effects'][0]['name'];
                    let effectPart = capitalize(parts[i2]['type']);
                    let effectDescr = parts[i2]['moves'][0]['effects'][0]['description'];
                    extendedData_MovesStats[i]['effects'].push(effectPart + ' : (' + effectTitle + ') ' + effectDescr);
                }
            }
        }
        extendedData_MovesStats[i]['accuracy'] /= attackPartsCount[i];
    }
    return extendedData_MovesStats;
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

// Not used yet
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
//// Axie Data [END] ////


//// Team Data [START] ////
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
            axiesDataArr[i]['battleTeam'] = [];
            battleTeams['data']['teams'].forEach(elementLVL1 => {
                elementLVL1['teamMembers'].forEach(elementLVL2 => {
                    if (elementLVL2['axieId'] == axiesDataArr[i]['id']) {
                        if (elementLVL1['name'] == '') {
                            elementLVL1['name'] = 'Unnamed Team'
                        }
                        axiesDataArr[i]['battleTeam'].push({
                            name: elementLVL1['name'],
                            teamID: elementLVL1['teamId'],
                            axieTeamPosition: elementLVL2['position']
                        })
                    }
                })
            })
            if (axiesDataArr[i]['battleTeam'].length == 0) {
                axiesDataArr[i]['battleTeam'].push({
                    name: '[NONE]',
                    teamID: '',
                    axieTeamPosition: null
                });
            }
        }
        resolve('Promise done!');
    });
    return promise;
}
//// Team Data [END] ////


//// Data Formating and Tool Functions [START] ////
function capitalize(string) {
    if (typeof string !== 'string') {
        return '';
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function calculateTrueAttack(axSkill, axMorale, moveAtk, moveAcc) {
    let acc = (axSkill * 0.333 + moveAcc) / 100;
    let trAt = moveAtk * acc;
    let crCh = axMorale * 0.5 / 100;
    let crAt = trAt * crCh;
    return Math.round((trAt + crAt) * 100);
}
//// Data Formating and Tool Functions [END] ////


//// Links & Redirections [START] ////
function openBreedingCalc() {
    let table = $('#axiesTable').DataTable();
    let axie1 = table.rows(rowSelections).data()[0]['id'];
    let axie2 = ''
    if (table.rows(rowSelections).data().length > 1) {
        axie2 = table.rows(rowSelections).data()[1]['id']
    }
    let showDetails = ''
    if ($('#showDetailsCheck').prop('checked') == true) {
        showDetails = '&showDetails=true'
    }
    window.open('https://freakitties.github.io/axie/calc.html?sireId=' + axie1 + '&matronId=' + axie2 + showDetails, '_blank');
}
//// Links & Redirections [END] ////


//// DOM Formating and jQuery UI [START] ////
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
    $('#loadAxiesBtnContainer').css('display', 'none');
    $('input#ethAddressInput').addClass('input-disabled');
    $('input#ethAddressInput').attr('readonly', true);
}

function addTableSearchFields() {
    // Capturing the table before the insertion of the search fields in the header
    var table = $('#axiesTable').DataTable();

    // Setup - Add a text input before each header cell
    $('table.dataTable thead tr').first().before('<tr role="row" class="headerFilters"></tr>');
    $('#axiesTable thead th').each(function () {
        var title = $(this).text().replace(/\s/g, '');
        $('<th class="columnSearchField searchField' + title + '"><input class="" type="search" placeholder="Search ' + title + '" /></th>').appendTo('.headerFilters').first();
    });

    // Apply the search on 'keyup'
    let filterInputSelected = $('.headerFilters th input').first()
    table.columns().every(function () {
        var that = this; //that = the 'this column'

        filterInputSelected.on('keyup change', function (key) {
            if (that.search() !== this.value) {
                that
                    .search(this.value)
                    .draw()
            }
        });
        filterInputSelected = $(filterInputSelected).parent().next().find('input');
    });
}

function moveAxieClassToParentElement() {
    $('#axiesTable td a').each(function (elemClass) {
        elemClass = $(this).attr('class');
        $(this).removeClass(elemClass)
        $(this).parent().addClass(elemClass);
    })
}

function enablePartsEffectsTooltips() {
    $(".movesEffectsTooltip").tooltip({
        show: {
            effect: "slideDown",
            duration: 200
        },
        hide: {
            effect: "slideUp",
            delay: 200,
            duration: 200
        },
        position: {
            my: "right-7 top-4"
        },
        classes: {
            "ui-tooltip": "tooltipWindow"
        }
    });
}

function attackBarsInit() {
    const allCanvas = $('.classAttackBar')

    for (let i = 0; i < allCanvas.length; i++) {
        let thisCanvas = $('.classAttackBar').eq(i);
        let classAttack = [thisCanvas.data('beast_bug'), thisCanvas.data('plant_reptile'), thisCanvas.data('aquatic_bird')];
        //let thisCanvas2d = thisCanvas.getContext('2d');

        new Chart(thisCanvas, {
            type: 'horizontalBar',
            data: {
                labels: ['Beast / Bug', 'Plant / Reptile', 'Aquatic / Bird'],
                datasets: [{
                    label: 'Total Attack',
                    data: classAttack,
                    backgroundColor: [
                        'rgba(255, 183, 15, 0.3)',
                        'rgba(107, 191, 0, 0.3)',
                        'rgba(0, 183, 206, 0.3)',
                    ],
                    borderColor: [
                        'rgba(255, 183, 15, 1)',
                        'rgba(107, 191, 0, 1)',
                        'rgba(0, 183, 206, 1)',
                    ],
                    borderWidth: 1,
                }]
            },
            options: {
                tooltips: {
                    titleFontSize: 11,
                    bodyFontSize: 10,
                    position: 'nearest'
                },
                legend: {
                    display: false
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            mirror: true,
                            fontColor: '#000'
                        },
                        gridLines: {
                            display: false
                        },
                        barPercentage: 1
                    }],
                    xAxes: [{
                        ticks: {
                            suggestedMin: 0,
                            suggestedMax: 100,
                            display: false
                        },
                        gridLines: {
                            display: false
                        }
                    }]
                }
            }
        });
    }
}

// Checks if more than 2 rows have been selected and diselects the first one 
function rowSelector() {
    let table = $('#axiesTable').DataTable();

    table.on('select', function (event, dt, type, sel) {
        if (sel !== undefined) { // If sel == undefined then the selection it's a text selection, not a row selection
            if (rowSelections.length == 2) {
                dt.rows(rowSelections[0]).deselect()
            }
            rowSelections.push(sel[0])
            if (rowSelections.length > 0 && $("button#breedingCalcBtn").button("option", "disabled") == true) {
                $('button#breedingCalcBtn').button('enable');
                $('#showDetailsCheck').checkboxradio('enable');
            }
        }
    });
    table.on('deselect', function (event, dt, type, sel) {
        if (sel !== undefined) { // If sel == undefined then the selection it's a text selection, not a row selection
            let index = rowSelections.indexOf(sel[0]);
            if (index !== -1) {
                rowSelections.splice(index, 1);
            }
            if (rowSelections.length == 0 && $("button#breedingCalcBtn").button("option", "disabled") == false) {
                $('button#breedingCalcBtn').button('disable');
                $('#showDetailsCheck').checkboxradio('disable');
            }
        }
    });
}
//// DOM Formating and jQuery UI [END] ////