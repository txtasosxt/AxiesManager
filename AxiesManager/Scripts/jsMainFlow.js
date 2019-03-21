let ethAddress;
let axiesDataObj = {};
let axiesDataArr = [];
let battleTeams = {};
let tableExists = 0; //Boolean, used to check if Table already exists

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
        ethAddress = result[0];

        // Get Ethereum address after the window is loaded and check every 1sec for changed address
        ///let intervalEthAddressCheck = setInterval(checkEthAddressChange, 1000);
    });
});

// Checks for address change (setInterval from .ts)
function checkEthAddressChange() {
    web3.eth.getAccounts(function (error, result) {
        if (result[0] == ethAddress) {
            return;
        } else {
            updateEthAddress();
        }
        console.log('checkEthAddressChange DONE');
    });
};

// Gets the Ethereum address from MetaMask
function updateEthAddress(address) {
    if (address !== undefined) {
        ///clearInterval(intervalEthAddressCheck);
        ethAddress = address;
        $('#ethAddressInput').val(ethAddress);
        functionsFlow();
    }
    else {
        setTimeout(function () { // web3.eth.getAccounts returns lower case in 1st run if not within setTimeout (bug?)
            web3.eth.getAccounts(function (error, result) {
                console.log(result[0]);
                // Only update if address changed or on init
                if (ethAddress === null || ethAddress !== result[0]) {
                    ethAddress = result[0];
                    $('#ethAddressInput').val(result[0]);
                    if (ethAddress === undefined) {
                        console.log('No Ethereum address');
                    } else {
                        document.getElementById('ethAddressField').innerHTML = result[0];
                        functionsFlow();
                    };
                    return (ethAddress);
                    console.log('updateEthAddress DONE');
                };
            });
        }, 0);
    }
};

function functionsFlow() {
    console.log('functionsFlow called')
    loadingScreenInit();
    // START of setting chained promises
    let promise1 = new Promise(function (resolve, reject) {
        requestAxies() // (1) Get the 1st page
            .then(() => {
                return getAllPagesToArray(); // (2) Get all the pages
            })
            .then(() => {
                return loadAxiesExtendedData(); // (3) Get parts stats and load datatable
            })
            .then(() => {
                resolve();
            })
    })
    let promise2 = new Promise(function (resolve, reject) {
        getBattleTeams() // Get all the teams
            .then(() => {
                resolve();
            })
    })
    // END of setting chained promises
    Promise.all([promise1, promise2])
        .then(() =>  {
            return loadBattleTeams(); // Load all the teams data into the "axiesDataArr" Array
        })
        .then(() =>  {
            loadDatatable();
        })
}

function loadDatatable() {
    console.log('loadDatatable called');
    if (tableExists == 0) {
        console.log('IF was TRUE (no table found)')
        $('#loader').removeClass('visible');
        $('#loader').dialog('close');
        $('#axiesLoadingProgressBar').progressbar('destroy');

        $('#axiesTable').DataTable({
            autoWidth: false,
            processing: true,
            order: [0, 'desc'],
            paging: true,
            pageLength: 100,
            //deferRender: true,
            //scrollY: 300,
            scrollCollapse: true,
            //scrollX: true,
            data: axiesDataArr,
            columns: [
                {
                    data: function (data, type, row) {
                        return '<a class=' + data['class'] + ' style="display: block;" href="https://axieinfinity.com/axie/' + data['id'] + '" target="_blank"><img style="display: block;" width="150" src="' + data['img'] + '" /></a><span>' + data['id'] + '</span>';
                    },
                    title: 'ID', className: 'axieThumbnail', width: '135px',
                },
                { data: 'name', title: 'Name', width: '132px', className: 'centerAligned' },
                { data: 'class', title: 'Class', width: '55px' },
                { data: 'stats.hp', title: 'HP', width: '55px', className: 'centerAligned' },
                { data: 'stats.speed', title: 'Speed', width: '55px', className: 'centerAligned' },
                { data: 'stats.skill', title: 'Skill', width: '55px', className: 'centerAligned' },
                { data: 'stats.morale', title: 'Morale', width: '55px', className: 'centerAligned' },
                { data: 'parts.stats.attack', title: 'Total Attack', width: '55px', className: 'centerAligned' },
                {
                    data: function (data, type, row) {
                        return Math.round(data['parts']['stats']['accuracy']) + ' %';
                    },
                    title: 'Average Accuracy', width: '55px', className: 'centerAligned'
                },
                { data: 'parts.stats.defense', title: 'Total Defense', width: '55px', className: 'centerAligned' },
                {
                    data: function (data, type, row) {
                        return '<a style="display: block;" href="https://axieinfinity.com/team/' + data['battleTeam']['teamID'] + '" target="_blank">' + data['battleTeam']['name'] + '</a>';
                    },
                    title: 'Team', className: 'axieBattleTeam', width: '100px',
                },
                {
                    data: 'birthDate', title: 'Birth Date (Local)', type: 'date',
                    className: 'date', width: 'auto', searchable: false,
                    render: function (data, type, row) {
                        var timestamp = data;
                        var offset = new Date().getTimezoneOffset() * 60; // Offset in seconds
                        var pubDate = new Date((timestamp + offset) * 1000).toLocaleString();
                        return pubDate;
                    }
                }
            ],


            // Run the following when the datatable initialization is completed
            initComplete: () => {
                addTableSearchFields();
                moveAxieClassToParentElement();
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