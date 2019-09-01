let graph = document.getElementById('graph');
let pie = document.getElementById('pie');
const heading = document.getElementById('heading');
let apiData;
let flowDiv = document.getElementById('flow-data');
let cycleDiv = document.getElementById('request-cycles');

document.getElementById('button-full-flow').addEventListener('click', showFullFlow);
document.getElementById('button-ms').addEventListener('click', showMs);
document.getElementById('button-java').addEventListener('click', showJava);
document.getElementById('button-api-proxy').addEventListener('click', showApiProxy);
document.getElementById('button-request-cycles').addEventListener('click', showCycleData);

showFullFlow();
showTable();
showCycletable();

async function showApiProxy() {
    flowDiv.style.display = 'block';
    cycleDiv.style.display = 'none';
    heading.textContent = 'Api Proxy';
    pie.innerHTML = '';
    barGraph(await getAllRequestsDataFullFlow('microservice'));

}

async function showJava() {
    flowDiv.style.display = 'block';
    cycleDiv.style.display = 'none';
    heading.textContent = 'Java';
    pie.innerHTML = '';
    barGraph(await getAllRequestsDataFullFlow('java'));

}
async function showFullFlow() {
    flowDiv.style.display = 'block';
    cycleDiv.style.display = 'none';
    heading.textContent = 'Full flow';
    pie.innerHTML = '';
    barGraph(await getAllRequestsDataFullFlow('all'));
}


async function showMs() {
    flowDiv.style.display = 'block';
    cycleDiv.style.display = 'none';
    heading.textContent = 'Microservice';
    pie.innerHTML = '';
    barGraph(await getAllRequestsDataFullFlow('microservice'));

}

async function showTable() {
    const tableRows = document.getElementById('api-calls');
    let i = 0;
    let apiResponse = await getJson();
    apiResponse.forEach(element => {
        element.recordedTimes.forEach(e => {
            const row = document.createElement('tr');
            row.innerHTML = `
            <td style="text-align:center">${++i}</td>
            <td style="text-align:center">${e.cprNumber}</td>
            <td style="text-align:left">${e.correlationId}</td>
            <td style="text-align:center">${e.totalElapsedTime}</td>
            <td style="text-align:center">${e.timeInMicroservice}</td>
            <td style="text-align:center">${e.timeInJava}</td>
            `
            tableRows.appendChild(row);
        })
    });


}


async function showCycleData() {
    flowDiv.style.display = 'none';
    cycleDiv.style.display = 'block';
    pieChart(await getRequestCycleDataFullFLow());
}


async function showCycletable() {
    const cycleTable = document.getElementById('cycle-table');
    let i = 0;
    let apiResponse = await getJson();
    apiResponse.forEach(e => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td style="text-align:center">${++i}</td>
        <td style="text-align:center">${e.requests}</td>
        <td style="text-align:center">${e.totalElapsedTime}</td>
        `
        cycleTable.appendChild(row);
    })

}
async function barGraph(allrequestData) {
    let chartSegments = [];
    chartSegments.push(allrequestData.floor);


    let segmentGap = (allrequestData.ceiling - allrequestData.floor) / 5;
    let allreqs = [];
    for (let i = 0; i < 5; i++) {
        let chartSegment = chartSegments[i] + segmentGap;
        chartSegments.push(chartSegment)
    }
    let segmentData = [];
    let requestTimes = allrequestData.requestTimes;
    let requestCount = 0;



    for (let i = 0; i < chartSegments.length; i++) {
        for (let j = 0; j < requestTimes.length; j++) {
            if (chartSegments[i + 1] !== undefined) {
                if (((requestTimes[j] < chartSegments[i + 1]) && (requestTimes[j] >= chartSegments[i]))) {
                    requestCount += 1;
                    allreqs.push(requestTimes[j]);
                }
            }
            else {
                if (requestTimes[j] >= chartSegments[i]) {
                    requestCount += 1;
                    allreqs.push(requestTimes[j]);
                }
            }
        }

        segmentData.push(requestCount);
        requestCount = 0;
    }

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
            title: {
                text: 'Time in ms',
                style: {
                    fontSize: '12px',
                    fontFamily: 'Verdana, sans-serif',
                    fontWeight: 'bold'
                }

            },
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
                text: 'Number of requets',
                style: {
                    fontSize: '12px',
                    fontFamily: 'Verdana, sans-serif',
                    fontWeight: 'bold'
                }
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
                [`${chartSegments[0]} -  ${chartSegments[1]} `, segmentData[0]],
                [`${chartSegments[1]} -  ${chartSegments[2]} `, segmentData[1]],
                [`${chartSegments[2]} -  ${chartSegments[3]} `, segmentData[2]],
                [`${chartSegments[3]} -  ${chartSegments[4]} `, segmentData[3]],
                [`${chartSegments[4]} - ${chartSegments[5]}`, segmentData[4]],
                [`> ${chartSegments[5]} `, segmentData[5]]
            ],
            dataLabels: {
                enabled: true,
                rotation: -90,
                color: '#FFFFFF',
                align: 'right',
                y: 10, // 10 pixels down from the top
                style: {
                    fontSize: '12px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        }]
    });
}


function pieChart(requestCycleData) {

    let totalChartTime = requestCycleData.highestTime + requestCycleData.lowestTime + requestCycleData.ramdomTime;

    Highcharts.chart(pie, {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: 'Sample requests cycles'
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
            name: 'Ratio to 3 cycles',
            colorByPoint: true,
            data: [{
                name: `${requestCycleData.highest} requests per cycle took ${requestCycleData.highestTime} ms`,
                y: Math.floor(requestCycleData.highestTime / totalChartTime * 100),
                sliced: true,
                selected: true
            }, {
                name: `${requestCycleData.randomCycle} requests per cycle took ${requestCycleData.ramdomTime} ms`,
                y: Math.floor(requestCycleData.ramdomTime / totalChartTime * 100)
            },
            {
                name: `${requestCycleData.lowest} requests per cycle took ${requestCycleData.lowestTime} ms`,
                y: Math.floor(requestCycleData.lowestTime / totalChartTime * 100)
            }]
        }]
    });

}



async function getRequestCycleDataFullFLow() {
    let apiResponse = await getJson();
    let totalCycles = apiResponse.length;
    let highestRequestCycle = apiResponse.find((obj) => { return obj.totalElapsedTime === Math.max(...apiResponse.map(c => c.totalElapsedTime)) });
    let lowestRequestCycle = apiResponse.find((obj) => { return obj.totalElapsedTime === Math.min(...apiResponse.map(c => c.totalElapsedTime)) });

    apiResponse.splice(apiResponse.indexOf(highestRequestCycle), 1);
    apiResponse.splice(apiResponse.indexOf(lowestRequestCycle), 1);

    let randomRequestCycle = apiResponse[Math.floor(Math.random() * apiResponse.length)];

    const requestCycle = {
        totalCycles: totalCycles,
        highest: highestRequestCycle.requests,
        lowest: lowestRequestCycle.requests,
        highestTime: highestRequestCycle.totalElapsedTime,
        lowestTime: lowestRequestCycle.totalElapsedTime,
        randomCycle: randomRequestCycle.requests,
        ramdomTime: randomRequestCycle.totalElapsedTime
    }

    return requestCycle;
}

async function getAllRequestsDataFullFlow(type) {
    const allRequestData = await getAllRequestData();
    let requestTimes = [];


    switch (type) {
        case 'microservice':
            allRequestData.forEach(e => { requestTimes.push(e.timeInMicroservice) });
            break;
        case 'java':
            allRequestData.forEach(e => { requestTimes.push(e.timeInJava) });
            break;
        default:
            allRequestData.forEach(e => { requestTimes.push(e.totalElapsedTime) });
    }

    let totalRequestTime = 0;

    requestTimes.forEach(e => {
        totalRequestTime += e;
    })

    let averageRequestTime = totalRequestTime / requestTimes.length;

    let standardDeviation = Math.sqrt(requestTimes.reduce(function (sq, n) {
        return sq + Math.pow(n - averageRequestTime, 2);
    }, 0) / (requestTimes.length - 1))



    let highest = Math.min(...requestTimes);
    let cutOff = averageRequestTime + standardDeviation;
    let ceiling = highest > 100 ? Math.ceil(cutOff / 100) * 100 : Math.ceil(cutOff / 10) * 10;
    let lowest = Math.min(...requestTimes);
    let floor = lowest > 100 ? Math.floor(lowest / 100) * 100 : Math.floor(lowest / 10) * 10;

    return requestData = {
        ceiling,
        floor,
        requestTimes,
    }

}


async function getAllRequestData() {
    let apiResponse = await getJson();
    let allRequest = [];

    apiResponse.forEach(requestCycle => {
        requestCycle.recordedTimes.forEach(request => {
            allRequest.push(request);
        });
    });
    return allRequest;
}


async function getJson() {
    return apiCallData;
    // return fetch('result.json')
    //     .then(res => res.json())


}