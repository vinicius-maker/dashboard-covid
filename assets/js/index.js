import { getSummaryRoute, numberWithCommas } from '../services/functions.js'

await getSummaryRoute().then(function(data){
    let totalConfirmed = data.Global.TotalConfirmed;
    let totalDeaths = data.Global.TotalDeaths;
    let totalRecover = data.Global.TotalRecovered;
    let update_Date = {
        day:  new Date().getDate(),
        month:  new Date().getMonth(),
        year:  new Date().getFullYear(),
        hours:  new Date().getHours(),
        minutes:  new Date().getMinutes(),
    }

    document.getElementById("confirmed").innerHTML = numberWithCommas(totalConfirmed);
    document.getElementById("death").innerHTML = numberWithCommas(totalDeaths);
    document.getElementById("recovered").innerHTML = numberWithCommas(totalRecover);
    document.getElementById("date").innerHTML = "Data de atualização: " 
        + update_Date.day.toString().padStart(2, '0') + '.' 
            + update_Date.month.toString().padStart(2, '0') + '.' 
                + update_Date.year.toFixed().split(0)[1] + ' '
                    + update_Date.hours.toString().padStart(2, '0') + ':'
                        + update_Date.minutes.toString().padStart(2, '0');

    getTopCoutries(data)
    getChartPizza(data)
    getChartBarra(data)                        
})

function getTopCoutries(data){
    let paises = data.Countries.sort((a, b) => parseInt(b.TotalDeaths ? b.TotalDeaths : 0) - parseInt(a.TotalDeaths ? a.TotalDeaths : 0));    let values = {countries:[], total:[], colors:[] }
    for(var i = 0; i < 10; i++){
        values.countries.push(paises[i].Country);
        values.total.push(paises[i].TotalDeaths);  
    }
    return values;
}

function getChartPizza(data) {
    new Chart(document.getElementById("pizza"),{
        type: 'pie',
        data: {
            labels: ["Confirmados", "Recuperados", "Mortes"],
            datasets: [{
                data: [data.Global.NewConfirmed, data.Global.NewRecovered, data.Global.NewDeaths],
                backgroundColor: ["#3e95cd", "#3c8523", "#42F39f"]
            }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: "Distruibuição de novos casos"
                }
            }
        }
    })
}

function getChartBarra(data) {
    let countriesMoreDeaths = getTopCoutries(data)
    let countries = countriesMoreDeaths.countries;
    let totalDeaths = countriesMoreDeaths.total;

    new Chart(document.getElementById("barras"), {
        type: 'bar',
        data: {
            labels: countries,
            datasets:[
                {
                    label: "Países",
                    data: totalDeaths,
                    backgroundColor: '#8a2be2'
                }
            ]
        },
        options: {
            reponsive: true,
            plugins:{
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: "Total de Mortes por pais - Top 10"
                }
            }
        }
    })  
}