import { getCountriesRoute, numberWithCommas } from '../services/functions.js'
let chart = null;

await getCountriesRoute().then(function (data) {
    let country = getCountries(data);
    document.getElementById("cmbCountry").innerHTML = country;
});

function getCountries(arrayCountries) {
    const countries = arrayCountries.map((nameCountry) => {
        return nameCountry.Country;
    });

    let sortedCountries = countries.sort((a, b) => a > b ? 1 : -1);

    let selectCountrie = sortedCountries.map(arrayCountry => {
        if (arrayCountry == "Brazil")
            return `<option selected value="${arrayCountry}">${arrayCountry}</option>`;
        return `<option value="${arrayCountry}">${arrayCountry}</option>`;
    });
    return selectCountrie.join("");
}

function getArrayOfAvg(arrToAvg, totalDays) {
    let totalDaylies = 0;
    let arrTotalDaylies = [];

    arrToAvg.forEach((value)=>{
        totalDaylies += value;
    })

    for (let i = 0 ; i < arrToAvg.length; i++) {
        arrTotalDaylies.push(totalDaylies / totalDays);
    }

    return arrTotalDaylies;
}


function getFilter() {
    let button = document.getElementById("filtro");

    button.addEventListener("click", () => {
        let country = document.getElementById("cmbCountry").value;
        let dateFrom = document.getElementById("date_start").valueAsDate;
        let dateTo = document.getElementById("date_end").valueAsDate;
        let totalDays = Math.abs(dateTo) - (dateFrom.setDate(dateFrom.getDate() - 1));
        
        totalDays = totalDays / 1000 / 60 / 60 / 24;
        dateFrom.setDate(dateFrom.getDate() + 1);
        dateFrom.setDate(dateFrom.getDate() - 1);
        dateFrom = dateFrom.toISOString().split('T')[0];
        dateTo = dateTo.toISOString().split('T')[0];

        axios.get(`https://api.covid19api.com/country/${country}?from=${dateFrom}T00:00:00Z&to=${dateTo}T00:00:00Z`).then((data) => {
            let totalDeaths = 0;
            let recovered = 0;
            let confirmed = 0;
            let avgDailyArray = [];
            let deathDailyArray = [];
            let confirmedDailyArray = [];
            let recoveredDailyArray = [];

            totalDeaths += data.data.slice(-1)[0].Deaths;
            recovered += data.data.slice(-1)[0].Recovered;
            confirmed += data.data.slice(-1)[0].Confirmed;

            data.data.forEach(function (valor, index, arr) {
                if (index > 0) {
                    deathDailyArray.push(valor.Deaths - arr[index - 1].Deaths);
                    confirmedDailyArray.push(valor.Confirmed - arr[index - 1].Confirmed);
                    recoveredDailyArray.push(valor.Recovered - arr[index - 1].Recovered);
               }
            });

            let totalConfirmados = document.getElementById("kpiconfirmed");
            let totalMortes = document.getElementById("kpideaths");
            let totalRecuperados = document.getElementById("kpirecovered");

            totalConfirmados.innerHTML = numberWithCommas(confirmed);
            totalMortes.innerHTML = numberWithCommas(totalDeaths);
            totalRecuperados.innerHTML = numberWithCommas(recovered);
            
            let option = document.getElementById("cmbData");
            switch (option.value) {
                case "Deaths":
                    avgDailyArray = getArrayOfAvg(deathDailyArray, totalDays);
                    getChartLinhas("Deaths",data.data, avgDailyArray, deathDailyArray);
                break;
                case "Confirmed":
                    avgDailyArray = getArrayOfAvg(confirmedDailyArray, totalDays);
                    getChartLinhas("Confirmed",data.data, avgDailyArray, confirmedDailyArray);
                break;
                case "Recovered":
                    avgDailyArray = getArrayOfAvg(recoveredDailyArray, totalDays);
                    getChartLinhas("Recovered",data.data, avgDailyArray, recoveredDailyArray);
                break;            
            }
        });
    });
}
getFilter();

function getChartLinhas(option, data, averageArray, totalArray) {
    let dataLabels = [];

    data.forEach((valor) => {
        dataLabels.push(valor.Date.replace('T00:00:00Z',''));  
    });

    dataLabels = dataLabels.slice(1, dataLabels.length);

    if(chart) {
        chart.destroy();
    }

    chart = new Chart(document.getElementById("linhas"), {
        type: 'line',
        data: {
            labels: dataLabels,
            datasets: [
                         {
                    data: totalArray,
                    label: option == "Deaths"?  "Número de Mortes" : option == "Confirmed" ? "Total de Confirmados" : "Total de Recuperados",
                    borderColor: "rgb(255,140,13)",
                    backgroundColor: "rgb(255,140,13,0.1)"
                },
                {
                    data: averageArray,
                    label: option == "Deaths"?  "Média de Mortes" : option == "Confirmed" ? "Média de Confirmados" : "Média de Recuperados",
                    borderColor: "rgb(60,186,159)",
                    backgroundColor: "rgb(60,186,159,0.1)"
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top', 
                },
                title: {
                    display: true,
                    text: "Curva diaria de Covid-19"
                },
                layout: {
                    padding: {
                        left: 100,
                        right: 100,
                        top: 50,
                        bottom: 10
                    }
                }
            }
        }
    });
}