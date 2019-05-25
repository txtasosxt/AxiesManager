//const baseURL = 'https://axieinfinity.com/marketplace-api/query-assets?sorting=recently_listed';
const baseURL = 'https://axieinfinity.com/marketplace-api/query-assets?sorting=highest_price';
const rarities = ['common','rare','epic','mystic'];
let itemsDataObj = {};
let landDataObj = {};
let itemsDataArr = [];
let landDataArr = [];
let landAndItems = [];
let tableExists = 0; //Boolean, used to check if Table already exists
const itemsPerPage = 900;
let accountTotalMorale = 0;
let accountTotalAttack = 0;
const setParameters = {
    reqDaysForPetite: 3,
    reqDaysForAdult: 5
};

//// Axie Data [START] ////
function requestItems() {
    let promise = new Promise(async function (resolve, reject) {
        console.log('requestItems called');
        let URL = `${baseURL}&offset=0&count=${itemsPerPage}`;

        // Requesting the 1st page of the Axies collection.
        axios.get(URL)
            .then(response => {
                itemsDataObj = response;
                itemsDataArr = itemsDataObj['data']['results'];
                console.log(itemsDataObj)
                console.log(itemsDataArr)
                resolve();
            })
            .catch(error => {
                console.log(error);
            })
        /*let allRaritieURLs = [];
        rarities.forEach(rarity => {
            let URL = `${baseURL}&rarity=${rarity}&offset=0&count=${itemsPerPage}`;
            allRaritieURLs.push(axios.get(URL));
        });
        await axios.all(allRaritieURLs)
            .then(allPagesObj => {
                console.log(allPagesObj);
                allPagesObj.forEach(singlePageObj => {
                    singlePageObj['data']['results'].forEach(singleAxie => {
                        itemsDataArr.push(singleAxie);
                    })
                })
            })
            .catch(error => {
                console.log(error);
            });*/
    });
    return promise;
};

function getItemPagesToArray() {
    let promise = new Promise(async function (resolve, reject) {
        /*console.log('getAllPagesToArray called');
        if (itemsDataObj['data']['total'] > itemsPerPage) {
            let allPages = [];

            for (let i = 1; i <= Math.ceil(axiesDataObj['data']['total'] / axiesPerPage); i++) {
                allPages.push(axios.get(URL + '&offset=' + i * axiesPerPage));
            }
            await axios.all(allPages)
                .then(allPagesObj => {
                    allPagesObj.forEach(singlePageObj => {
                        singlePageObj['data']['results'].forEach(singleAxie => {
                            axiesDataArr.push(singleAxie);
                        })
                    })
                })
                .catch(error => {
                    console.log(error);
                });
        }
        calculateElapsedListingTime();
        resolve('Promise done!');
    });*/

        if (itemsDataObj['data']['total'] > itemsPerPage) {
            let allPages = [];

            for (let i = 1; i <= Math.ceil(itemsDataObj['data']['total'] / itemsPerPage); i++) {
                allPages.push(axios.get(`${baseURL}&offset=${i * itemsPerPage}&count=${itemsPerPage}`));
                console.log(`${baseURL}&offset=${i * itemsPerPage}&count=${itemsPerPage}`);
            }
            await axios.all(allPages)
                .then(allPagesObj => {
                    console.log(allPagesObj);
                    allPagesObj.forEach(singlePageObj => {
                        singlePageObj['data']['results'].forEach(singleAxie => {
                            itemsDataArr.push(singleAxie);
                        })
                    })
                })
                .catch(error => {
                    console.log(error);
                });
        }
        resolve('Promise done!');
    });
    return promise;
};

function getLandPagesToArray() {
    let promise = new Promise(async function (resolve, reject) {
        /*if (itemsDataObj['data']['total'] > itemsPerPage) {
            let allPages = [];

            for (let i = 1; i <= Math.ceil(itemsDataObj['data']['total'] / itemsPerPage); i++) {
                allPages.push(axios.get(`${URL}&offset=${i * itemsPerPage}&count=${itemsPerPage}`));
                console.log(`${URL}&offset=${i * itemsPerPage}&count=${itemsPerPage}`);
            }
            await axios.all(allPages)
                .then(allPagesObj => {
                    console.log(allPagesObj);
                    allPagesObj.forEach(singlePageObj => {
                        singlePageObj['data']['results'].forEach(singleAxie => {
                            itemsDataArr.push(singleAxie);
                        })
                    })
                })
                .catch(error => {
                    console.log(error);
                });
        }*/
        resolve('Promise done!');
    });
    return promise;
};

function mergeItemsAndLand() {

};


//// Data Formating and Manipulation Functions [START] ////
function calculateElapsedListingTime() {
    const timeNow = Math.round(Date.now() / 1000);
    itemsDataArr.forEach(axie => {
        axie.elapsedTime = timeNow - axie.startingTimestamp
    })
};

function capitalize(string) {
    if (typeof string !== 'string') {
        return '';
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
};

//// Data Formating and Manipulation Functions [END] ////


//// Prices and Marketplace [START] ////
function axieValueCalculator(axie, attackRating, defenseRating) {
    let valueRating = 0;
    let expMdf = 0.1;
    let atkRatingMdf = 1;
    let defRatingMdf = 1;

    return valueRating;
};
//// Prices and Marketplace [END] ////


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
};
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
    $('#loader p').text('Loading all marketplace items...');
    $('#pageReloadWarning').css('display', 'inline');
    $('#loadAxiesBtnContainer').css('display', 'none');
    $('input#ethAddressInput').addClass('input-disabled');
    $('input#ethAddressInput').attr('readonly', true);
};

function addTableSearchFields() {
    // Capturing the table before the insertion of the search fields in the header
    var table = $('#axiesTable').DataTable();

    // Setup - Add a text input before each header cell
    $('table.dataTable thead tr').first().before('<tr role="row" class="headerFilters"></tr>');
    $('#axiesTable thead th').each(function () {
        var title = $(this).text().replace(/\s/g, '');
        $('<th class="columnSearchField searchField' + title + '"><input class="" type="search" placeholder="' + title + ' Search" /></th>').appendTo('.headerFilters').first();
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
};

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
};

function attackBarsInit(selectedElement, attackBeastBug, attackPlantReptile, attackAquaticBird) {
    let thisCanvas = selectedElement;
    let classAttack = [attackBeastBug, attackPlantReptile, attackAquaticBird];
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
};

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
};

function uiLoadingFinish() {
    $('#loader').removeClass('visible');
    $('#loader').dialog('close');
    if ($("#axiesLoadingProgressBar").progressbar()) {
        $('#axiesLoadingProgressBar').progressbar('destroy');
    }
};
//// DOM Formating and jQuery UI [END] ////

//// Other Functions & Queries [START] ////
function abortFunctionsFlow(errorMsg) {
    $('#pageReloadWarning').css('display', 'none');
    $('#loadAxiesBtnContainer').css('display', 'block');
    $('input#ethAddressInput').removeClass('input-disabled');
    $('input#ethAddressInput').attr('readonly', false);
    itemsDataObj = {};
    landDataObj = {};
    itemsDataArr = [];
    landDataArr = [];
    landAndItems = [];
    $('#loader p').text(errorMsg);
    setTimeout(uiLoadingFinish, 2500);
};
//// Other Functions & Queries [END] ////
