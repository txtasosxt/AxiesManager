// Initialise jQueryUI elements
window.addEventListener('load', async function () {
    $('button').button({
        disabled: true,
    });
    $("#showDetailsCheck").checkboxradio({
        disabled: true,
    });
    $('button#loadAxiesBtn').button('enable');
    $.widget("ui.tooltip", $.ui.tooltip, {
        options: {
            content: function () {
                return $(this).prop('title');
            }
        }
    });
    $("#loadAxiesBtnContainer input").checkboxradio({
        icon: false
    });
})

// Initialise MetaMask
window.addEventListener('load', async function () {
    if (window.ethereum) {
        // new privacy mode
        window.web3 = new Web3(ethereum);
        try {
            // Request account access if needed
            await ethereum.enable();
        } catch (error) {
            console.log(error);
        }
    } else if (window.web3) {
        // Old way of asking for web3
        window.web3 = new Web3(web3.currentProvider);
    }
    web3.eth.getAccounts(function (error, result) {
        $('#ethAddressInput').val(result[0]);
    });
});

// Saves the Ethereum address and starts the program
function updateEthAddress() {
    functionsFlow();
}

function functionsFlow() {
    console.log('functionsFlow called')
    loadingScreenInit();
    // START of setting chained promises
    let promiseAxies = new Promise(function (resolve, reject) {
        requestAxies() // (1) Get the 1st page
            .then(() => {
                return getAllPagesToArray(); // (2) Get all the pages
            })
            .then(() => {
                resolve();
            })
            .then(() => {
                loadDatatable();
            })
            .catch(error => {
                console.log(error);
            })
    })
}

function loadDatatable() {
    console.log('loadDatatable called');
    if (tableExists == 0) {
        uiLoadingFinish();
        $('#axiesTable').DataTable({
            serverSide: false,
            responsive: false,
            processing: false,
            order: [0, 'desc'],
            paging: true,
            pageLength: 100,
            deferRender: false,
            autoWidth: true,
            fixedHeader: true,
            data: axiesDataArr,
            columns: [
                {
                    data: function (data, type, row) {
                        if (type === 'sort' || type === 'filter') {
                            if (data['assetType'] == 'land') {
                                return [data['col'], data['row']];
                            } else {
                                return data['tokenId'];
                            }
                        }
                        if (data['assetType'] == 'land') {
                            return `<a class="movesEffectsTooltip"  href="https://land.axieinfinity.com/land/${data['col']}/${data['row']}" target="_blank"><span>LAND ${data['col']} : ${data['row']}</span></a>`;
                        } else {
                            return `<a class="movesEffectsTooltip" href="https://land.axieinfinity.com/item/${data['alias']}/${data['tokenId']}" target="_blank"><span>${data['tokenId']}</span></a>`;
                        }
                    },
                    title: 'ID', width: '150px', className: 'centerAligned'
                },
                { data: 'assetType', title: 'Type', width: '55px', className: 'centerAligned' },
                {
                    data: function (data, type, row) {
                        if (type === 'sort' || type === 'filter') {
                            if (data['assetType'] == 'land') {
                                return data['landType'];
                            } else {
                                return data['name'];
                            }
                        }
                        if (data['assetType'] == 'land') {
                            return data['landType'];
                        } else {
                            return data['name'];
                        }
                    },
                    title: 'Name', width: '250px', className: 'centerAligned'
                },
                {
                    data: function (data, type, row) {
                        if (type === 'sort' || type === 'filter') {
                            if (data['assetType'] == 'land') {
                                return '';
                            } else {
                                return data['rarity'];
                            }
                        }
                        if (data['assetType'] == 'land') {
                            return '-';
                        } else {
                            return data['rarity'];
                        }
                    },
                    title: 'Rarity', width: '70px', className: 'axieClass'
                },
                {
                    data: function (data, type, row) {
                        return Math.round(data['currentPrice'] / 10000000000) / 100000000;
                    },
                    title: 'Current Price', width: '100px', className: 'centerAligned'
                },
                {
                    data: function (data, type, row) {
                        return Math.round(data['endingPrice'] / 10000000000) / 100000000;
                    },
                    title: 'Ending Price', width: '100px', className: 'centerAligned'
                },
                {
                    data: 'startingTimestamp', title: 'Post Time', type: 'date',
                    className: 'date', width: '150px', searchable: false,
                    render: function (data, type, row) {
                        var timestamp = data;
                        var pubDate = new Date((timestamp) * 1000).toLocaleString();
                        return pubDate;
                    }
                },
                {
                    data: function (data, type, row) {
                        if (type === 'sort' || type === 'filter') {
                            if (data['assetType'] == 'land') {
                                return '';
                            } else {
                                return data['effects'];
                            }
                        }
                        if (data['assetType'] == 'land') {
                            return '-';
                        } else {
                            return data['effects'];
                        }
                    },
                    title: 'Effects', width: 'auto'
                },
            ],
            columnDefs: [
                {
                    //orderSequence: ['desc', 'asc'], targets: ['_all']
                }
            ],
            // Run the following when the datatable initialization is completed
            initComplete: () => {
                addTableSearchFields();
                //enablePartsEffectsTooltips();
                //rowSelector();
                tableExists = 1;
            }
        });
    } else {
        console.log('IF was FALSE (table found)')
        $('#axiesTable').DataTable({
            destroy: true
        });
        $('#axiesTable tbody').remove();
        tableExists = 0;
        loadDatatable();
    }
}
