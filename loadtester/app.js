
let graph = document.getElementById('graph');
let pie = document.getElementById('pie');
const heading = document.getElementById('heading');
let apiData;
document.getElementById('button-full-flow').addEventListener('click', showFullFlow);
document.getElementById('button-ms').addEventListener('click', showMs);
document.getElementById('button-java').addEventListener('click', showJava);


function showJava() {
    heading.textContent = 'Java';
    const categoryList = [43, 46, 55, 89, 56];
    barGraph(categoryList);
    pieChart(getRequestCycleData());

}
function showFullFlow() {
    heading.textContent = 'Full flow';
    const categoryList = [43, 46, 55, 89, 56];
    barGraph(categoryList);
    pieChart(getRequestCycleData());
    showTable();
}


function showMs() {
    heading.textContent = 'Microservice';
    const categoryList = [43, 46, 55, 89, 56];
    barGraph(categoryList);
    pieChart(getRequestCycleData());

}

async function showTable() {
    const tableRows = document.getElementById('api-calls');
    let i = 0;
    let apiResponse = await getJson();
    apiResponse.forEach(element => {
        element.recordedTimes.forEach(e => {
            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${++i}</td>
            <td>${e.cprNumber}</td>
            <td>Correlation</td>
            <td>${e.totalElapsedTime}</td>
            <td>${e.timeInMicroservice}</td>
            <td>${e.timeInJava}</td>
            `

            tableRows.appendChild(row);
        })
    });


}

function barGraph(categoryList) {
    Highcharts.chart(graph, {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Accumulative time'
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'category',
            labels: {
                rotation: 0,
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif',
                    fontWeight: 'bold'
                }
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Number of requets'
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            pointFormat: 'Number of requests: <b>{point.y:.1f}</b>'
        },
        series: [{
            name: 'Population',
            data: [
                ['100-200 ms', categoryList[0]],
                ['200-300 ms', categoryList[1]],
                ['300-400 ms', categoryList[2]],
                ['400-500 ms', categoryList[3]],
                ['>500 ms', categoryList[4]],
            ],
            dataLabels: {
                enabled: true,
                rotation: -90,
                color: '#FFFFFF',
                align: 'right',
                y: 40, // 10 pixels down from the top
                style: {
                    fontSize: '17px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        }]
    });
}


function pieChart(requestCycleData) {
    Highcharts.chart(pie, {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: 'Averge time for requests cycles'
        },
        subtitle: {
            text: `Total request cycles ${requestCycleData.totalCycles} `
        },

        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>'
                }
            }
        },
        series: [{
            name: 'Brands',
            colorByPoint: true,
            data: [{
                name: `${requestCycleData.highest} requests per cycle took ${requestCycleData.highestTime}`,
                y: 50,
                sliced: true,
                selected: true
            }, {
                name: `${requestCycleData.randomCycle} requests per cycle took ${requestCycleData.ramdomTime}`,
                y: 20
            },
            {
                name: `${requestCycleData.lowest} requests per cycle took ${requestCycleData.lowestTime}`,
                y: 30
            }]
        }]
    });

}



async function getRequestCycleData() {
    let apiResponse = await getJson();
    let requestsPerCycle = 0;

    const requestCycle = {
        totalCycles: 500,
        highest: 8,
        lowest: 3,
        highestTime: '800 ms',
        lowestTime: '355 ms',
        randomCycle: 6,
        ramdomTime: '345 ms'

    }

    return requestCycle;
}


async function getJson() {
    return fetch('api-call-data.json')
        .then(res => res.json())


}