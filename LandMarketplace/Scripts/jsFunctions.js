const baseURL = 'https://axieinfinity.com/marketplace-api/query-assets?sorting=recently_listed';
//const baseURL = 'https://axieinfinity.com/marketplace-api/query-assets?sorting=highest_price';
const rarities = ['common','rare','epic','mystic'];
let itemsDataObj = {};
let landDataObj = {};
let itemsDataArr = [];
let landDataArr = [];
let landAndItems = [];
let tableExists = 0; //Boolean, used to check if Table already exists
const itemsPerPage = 1000;
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
                console.log('-----------');
                console.log('First items query\'s object and array');
                console.log(itemsDataObj);
                console.log(itemsDataArr);
                console.log('-----------');
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
                    console.log('-----------');
                    console.log('Items pages');
                    console.log(allPagesObj);
                    console.log('-----------');
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

function requestLands() {
    let promise = new Promise(async function (resolve, reject) {
        console.log('requestItems called');
        let URL = `${baseURL}&offset=0&count=${itemsPerPage}&item_name=land`;

        // Requesting the 1st page of the Axies collection.
        axios.get(URL)
            .then(response => {
                landDataObj = response;
                landDataArr = landDataObj['data']['results'];
                console.log('-----------');
                console.log('First lands query\'s object and array');
                console.log(landDataObj)
                console.log(landDataArr)
                console.log('-----------');
                resolve();
            })
            .catch(error => {
                console.log(error);
            })
    });
    return promise;
};

function getLandPagesToArray() {
    let promise = new Promise(async function (resolve, reject) {
        if (landDataObj['data']['total'] > itemsPerPage) {
            let allPages = [];

            for (let i = 1; i <= Math.ceil(landDataObj['data']['total'] / itemsPerPage); i++) {
                allPages.push(axios.get(`${baseURL}&offset=${i * itemsPerPage}&count=${itemsPerPage}`));
                console.log(`${baseURL}&offset=${i * itemsPerPage}&count=${itemsPerPage}`);
            }
            await axios.all(allPages)
                .then(allPagesObj => {
                    console.log('-----------');
                    console.log('Lands pages');
                    console.log(allPagesObj);
                    console.log('-----------');
                    allPagesObj.forEach(singlePageObj => {
                        singlePageObj['data']['results'].forEach(singleLand => {
                            landDataArr.push(singleLand);
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

function mergeItemsAndLand() {
    landDataArr.forEach(land => {
        let exists;
        exists = itemsDataArr.findIndex(mixedItems => mixedItems.assetType == 'land' && mixedItems.col == land.col && mixedItems.row == land.row);
        if (exists == -1) {
            landAndItems.push(land);
        }
    });
    landAndItems = landAndItems.concat(itemsDataArr);
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
