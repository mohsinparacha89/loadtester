let graph = document.getElementById('graph');
let pie = document.getElementById('pie');
const heading = document.getElementById('heading');
let apiData;
document.getElementById('button-full-flow').addEventListener('click', showFullFlow);
document.getElementById('button-ms').addEventListener('click', showMs);
document.getElementById('button-java').addEventListener('click', showJava);
showTable();

async function showJava() {
    heading.textContent = 'Java';
    barGraph(await getAllRequestsDataFullFlow('java'));
    // showTable();
    pie.innerHTML = '';

}
async function showFullFlow() {
    heading.textContent = 'Full flow';

    barGraph(await getAllRequestsDataFullFlow('all'));
    pieChart(await getRequestCycleDataFullFLow());
}


async function showMs() {
    heading.textContent = 'Microservice';
    barGraph(await getAllRequestsDataFullFlow('microservice'));
    //  pieChart();
    pie.innerHTML = '';

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
            <td style="text-align:center">${e.correlationId}</td>
            <td style="text-align:center">${e.totalElapsedTime}</td>
            <td style="text-align:center">${e.timeInMicroservice}</td>
            <td style="text-align:center">${e.timeInJava}</td>
            `

            tableRows.appendChild(row);
        })
    });


}

async function barGraph(allrequestData) {
    //console.log(allrequestData)
    let chartSegments = [];
    chartSegments.push(allrequestData.floor);
    let segmentGap = allrequestData.ceiling / 5;
    let allreqs = [];
    for (let i = 0; i < 5; i++) {
        let chartSegment = chartSegments[i] + segmentGap;
        chartSegments.push(chartSegment)
    }

    let segmentData = [];
    let requestTimes = allrequestData.requestTimes;
    let requestCount = 0;



    for (let i = 0; i < chartSegments.length; i++) {
        console.log(chartSegments[i + 1])
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
    console.log(allreqs);

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
                [`${chartSegments[0]} -  ${chartSegments[1]}ms`, segmentData[0]],
                [`${chartSegments[1]} -  ${chartSegments[2]}ms`, segmentData[1]],
                [`${chartSegments[2]} -  ${chartSegments[3]}ms`, segmentData[2]],
                [`${chartSegments[3]} -  ${chartSegments[4]}ms`, segmentData[3]],
                [`> ${chartSegments[4]}ms`, segmentData[4] + segmentData[5]],
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
            name: 'Average Time per request',
            colorByPoint: true,
            data: [{
                name: `${requestCycleData.highest} requests per cycle took ${requestCycleData.highestTime} ms`,
                y: 50,
                sliced: true,
                selected: true
            }, {
                name: `${requestCycleData.randomCycle} requests per cycle took ${requestCycleData.ramdomTime} ms`,
                y: 20
            },
            {
                name: `${requestCycleData.lowest} requests per cycle took ${requestCycleData.lowestTime} ms`,
                y: 30
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
    console.log('type is ' + type)
    allRequestData.forEach(e => {
        if (type === 'microservice') {
            console.log('adding microservice')
            requestTimes.push(e.timeInMicroservice);
        }
        if (type === 'java') {
            console.log('adding java')
            requestTimes.push(e.timeInJava);
        }
        if (type === 'all') {
            console.log('adding all')
            requestTimes.push(e.totalElapsedTime);
        }
    })

    let ceiling = Math.floor(Math.max(...requestTimes) / 100) * 100;
    let floor = Math.floor(Math.min(...requestTimes) / 100) * 100;

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
    return fetch('api-call-data.json')
        .then(res => res.json())


}