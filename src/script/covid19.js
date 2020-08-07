function covid19() {

    const baseUrl = "https://covid19.mathdro.id/api";

    const renderData = (html) => {
        if (document.querySelector("#content")) {
            document.querySelector("#content").innerHTML = html;
        }
    }

    const showGraph = () => {
        renderData(`<img src="${baseUrl}/og" class="featured-image" alt="summary graph" />`);
    }

    const showDaily = async () => {
        try {
            const response = await fetch(`${baseUrl}/daily`);
            const responseJson = await response.json();
            if (responseJson.error) {
                showResponseMessage(responseJson.message);
            } else {
                console.log(responseJson);

                let temp = [];
                responseJson.forEach(row => {
                    temp.push([
                        new Date(row['reportDate']),
                        row['totalConfirmed'],
                        row['deaths']['total'],
                        (Math.round((((row['deaths']['total'] / row['totalConfirmed']) * 100) + Number.EPSILON) * 100) / 100) + '%',
                        row['deltaConfirmed'],
                        (Math.round((((row['deltaConfirmed'] / row['totalConfirmed']) * 100) + Number.EPSILON) * 100) / 100) + '%',
                    ]);
                });

                let data = new google.visualization.DataTable();
                data.addColumn('date', 'Tanggal');
                data.addColumn('number', 'Terkonfirmasi');
                data.addColumn('number', 'Meninggal');
                data.addColumn('string', '%Meninggal');
                data.addColumn('number', '+Terkonfirmasi');
                data.addColumn('string', '%+Terkonfirmasi');
                data.addRows(temp);
                data.sort([{ column: 0, desc: true }]);

                let table = new google.visualization.Table(document.getElementById('content'));
                table.draw(data, { showRowNumber: true, width: '100%', height: '100%' });
            }
        } catch (error) {
            showResponseMessage(error);
        }
    }

    const loadChart = () => {
        google.charts.load('current', { 'packages': ['table'], 'language': 'id' });
        google.charts.setOnLoadCallback(showDaily);
    }

    const requestData = async (api) => {
        try {
            const response = await fetch(`${baseUrl}/${api}`);
            const responseJson = await response.json();
            if (responseJson.error) {
                showResponseMessage(responseJson.message);
            } else {
                console.log(responseJson);
                renderData(`TODO`);
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
                        <span data-href="og"><i class="fas fa-laptop-house"></i> Home</span>
                    </li>
                    <li>
                        <span data-href="daily"><i class="fas fa-people-arrows"></i> Daily Summary</span>
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

                    const api = event.target.getAttribute("data-href");
                    if (api == 'og') {
                        showGraph();
                    } else if (api == 'daily') {
                        loadChart();
                    } else {
                        requestData(api);
                    }
                })
            });
        }
    };

    const showResponseMessage = (message = "Check your internet connection") => {
        alert(message == "TypeError: Failed to fetch" ? "Check your internet connection" : message);
    };

    document.addEventListener("DOMContentLoaded", () => {
        showMenu();
        showGraph();
    });
}

export default covid19;