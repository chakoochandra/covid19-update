import moment from "moment";

function covid19() {

    const baseUrl = "https://covid19.mathdro.id/api";

    document.addEventListener("DOMContentLoaded", () => {
        document.getElementById('content').innerHTML = showLoadingProgress();
        showMenu();
        loadChart(showGraph, ['corechart', 'line']);
    });

    const renderData = (html) => {
        document.querySelector("#content").innerHTML = html;
    }

    const loadChart = (callback, packages = ['table']) => {
        google.charts.load('current', { 'packages': packages });
        google.charts.setOnLoadCallback(callback);
    }

    const showLoadingProgress = () => {
        return `
            <div class="progress">
                <div class="progress-bar progress-bar-striped progress-bar-animated bg-dark" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>
            </div>
        `;
    }

    const showResponseMessage = (message = "Check your internet connection") => {
        alert(message == "TypeError: Failed to fetch" ? "Check your internet connection" : message);
    };

    const fetchAPI = async (api) => {
        // console.log('--------- fetchAPI ' + api);
        try {
            const response = await fetch(`${baseUrl}/${api}`);
            const responseJson = await response.json();
            if (responseJson.error) {
                showResponseMessage(responseJson.message);
            } else {
                // console.log(responseJson);
                return responseJson;
            }
        } catch (error) {
            showResponseMessage(error);
        }
    };

    const showMenu = () => {
        if (document.querySelector("#topnav")) {
            document.querySelector("#topnav").innerHTML = `
            <nav>
                <ul>
                    <li class="active">
                        <span data-api="og"><i class="fas fa-laptop-house"></i> Home</span>
                    </li>
                    <li>
                        <span data-api="daily"><i class="fas fa-chart-line"></i> Summary</span>
                    </li>
                    <li>
                        <span data-api="countries"><i class="far fa-flag"></i> Countries</span>
                    </li>
                </ul>
            </nav>
            `;

            //click menu logic
            document.querySelectorAll("li").forEach(button => {
                button.addEventListener("click", event => {
                    //remove previous active class
                    document.querySelector("li.active").classList.remove("active");
                    //then assign new active menu
                    event.target.parentElement.classList.add("active");
                    //show loading progress
                    document.getElementById('content').innerHTML = showLoadingProgress();

                    const api = event.target.getAttribute("data-api");
                    if (api == 'og') {
                        loadChart(showGraph, ['corechart', 'line']);
                    } else if (api == 'daily') {
                        loadChart(showDaily);
                    } else if (api == 'countries') {
                        loadChart(showCountries);
                    }
                })
            });
        }
    };

    const showGraph = async () => {
        renderData(`<img src="${baseUrl}/og" class="featured-image" alt="summary graph" />`);

        $('#content').append(`<div id="chart-deltaconfirmed" style="margin-top: 20px;"></div>`);

        let rows = [];
        (await fetchAPI('daily')).forEach(row => {
            rows.push([
                new Date(row['reportDate']),
                row['deltaConfirmed'],
            ]);
        });

        let data = new google.visualization.DataTable();
        data.addColumn('date', 'X');
        data.addColumn('number', '+Confirmed');
        data.addRows(rows);
        data.sort([{ column: 0, desc: true }]);

        const options = {
            hAxis: {
                title: 'Date',
            },
            vAxis: {
                title: 'Delta Confirmed',
            },
        };

        (new google.visualization.LineChart(document.getElementById('chart-deltaconfirmed'))).draw(data, options);
    }

    const showDaily = async () => {
        let rows = [];
        (await fetchAPI('daily')).forEach(row => {
            rows.push([
                { v: new Date(row['reportDate']), f: `<span class="daily" data-api="${row['reportDate']}">${moment(row['reportDate']).format("LL")}</span>` },
                row['totalConfirmed'],
                row['deaths']['total'],
                `${(Math.round((((row['deaths']['total'] / row['totalConfirmed']) * 100) + Number.EPSILON) * 100) / 100)}%`,
                row['deltaConfirmed'],
                `${(Math.round((((row['deltaConfirmed'] / row['totalConfirmed']) * 100) + Number.EPSILON) * 100) / 100)}%`,
            ]);
        });

        let data = new google.visualization.DataTable();
        data.addColumn('date', 'Date');
        data.addColumn('number', 'Confirmed');
        data.addColumn('number', 'Death');
        data.addColumn('string', '%Death');
        data.addColumn('number', '+Confirmed');
        data.addColumn('string', '%+Confirmed');
        data.addRows(rows);
        data.sort([{ column: 0, desc: true }]);

        (new google.visualization.Table(document.getElementById('content'))).draw(data, { showRowNumber: false, width: '100%', height: ($(window).height() - 250), allowHtml: true, });

        $('#content').prepend(`<span class="badge badge-pill badge-dark">Click the date to show details</span>`);

        //click date logic
        document.querySelectorAll("span.daily").forEach(button => {
            button.addEventListener("click", event => {
                const date = event.target.getAttribute("data-api");

                $("#my-modal").modal('show');
                document.getElementById('my-modal-title').innerHTML = `Total until ${moment(date).format("LL")}`;
                document.getElementById('my-modal-body').innerHTML = showLoadingProgress();

                loadChart(function () { showDetail(date); });
            })
        });
    }

    const showCountries = async () => {
        let rows = [];
        const countries = (await fetchAPI('countries'))['countries'];
        for (var idx in countries) {
            if (countries[idx]['iso3']) {
                rows.push([
                    { v: countries[idx]['name'], f: `<img src="https://www.countryflags.io/${countries[idx]['iso2']}/flat/32.png"> <span class="iso3" data-api="${countries[idx]['iso3']}">${countries[idx]['name']}</span>` },
                ]);
            }
        }

        let data = new google.visualization.DataTable();
        data.addColumn('string', 'Country');
        data.addRows(rows);

        document.getElementById('content').innerHTML = `
            <div id="country-list" style="float: left; width: 35%; margin: 5px;"></div>
            <div id="country-detail" style="float: left; width: 62%; margin: 5px;"></div>
        `;

        (new google.visualization.Table(document.getElementById('country-list'))).draw(data, { showRowNumber: false, width: '100%', height: ($(window).height() - 250), allowHtml: true, cssClassNames: { tableCell: 'nameClass', headerCell: 'noHeader' } });

        $('#country-list').prepend(`<span style="font-size: 85%;">Click country name to show detail</span>`);

        //click detail logic
        document.querySelectorAll("span.iso3").forEach(button => {
            button.addEventListener("click", event => {
                document.getElementById('country-detail').innerHTML = showLoadingProgress();
                loadChart(function () { showCountryDetailStatus(event.target.getAttribute("data-api")); });
            })
        });
    }

    const showCountryDetailStatus = async (api) => {
        let rows = [];
        (await fetchAPI(`countries/${api}/confirmed`)).forEach(row => {
            rows.push([
                row['provinceState'],
                parseInt(row['confirmed'] || 0),
                parseInt(row['deaths'] || 0),
                parseInt(row['recovered'] || 0),
            ]);
        });

        let data = new google.visualization.DataTable();
        data.addColumn('string', 'Province');
        data.addColumn('number', 'Confirmed');
        data.addColumn('number', 'Death');
        data.addColumn('number', 'Recovered');
        data.addRows(rows);
        data.sort([{ column: 1, desc: true }, { column: 2, desc: true }, { column: 3, desc: true }]);

        (new google.visualization.Table(document.getElementById('country-detail'))).draw(data, { showRowNumber: false, width: '100%', height: '100%', allowHtml: true, });
    }

    const showDetail = async (date) => {
        let rows = [];
        (await fetchAPI(`daily/${date}`)).forEach(row => {
            rows.push([
                row['countryRegion'],
                row['provinceState'],
                parseInt(row['confirmed'] || 0),
                parseInt(row['deaths'] || 0),
                parseInt(row['recovered'] || 0),
                Math.round((parseFloat(row['incidenceRate']) + Number.EPSILON) * 100) / 100,
                Math.round((parseFloat(row['case-fatalityRatio']) + Number.EPSILON) * 100) / 100,
            ]);
        });

        let data = new google.visualization.DataTable();
        data.addColumn('string', 'Country');
        data.addColumn('string', 'Province');
        data.addColumn('number', 'Confirmed');
        data.addColumn('number', 'Death');
        data.addColumn('number', 'Recovered');
        data.addColumn('number', 'Incident Rate');
        data.addColumn('number', 'Fatality Ratio');
        data.addRows(rows);
        data.sort([{ column: 2, desc: true }, { column: 3, desc: true }, { column: 4, desc: true }, { column: 0 }, { column: 1 }]);

        (new google.visualization.Table(document.getElementById('my-modal-body'))).draw(data, { showRowNumber: true, width: '100%', height: ($(window).height() - 250), allowHtml: true, });
    }
}

export default covid19;