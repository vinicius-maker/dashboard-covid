let chart = null;

fetch("https://api.covid19api.com/countries")
    .then((resp) => {
        return resp.json();
    })
    .then(function (data) {
        let country = getCountries(data);

        document.getElementById("cmbCountry").innerHTML = country;
    });

function getCountries(arrayCountries) {

    const countries = arrayCountries.map(function (nameCountry) {
        return nameCountry.Country;
    })

    let sortedCountries = countries.sort((a, b) => a > b ? 1 : -1)

    let select = sortedCountries.map(arrayCountry => {
        if (arrayCountry == "Brazil")
            return item = `<option selected value="${arrayCountry}">${arrayCountry}</option>`;
        return item = `<option value="${arrayCountry}">${arrayCountry}</option>`;
    });
    return select.join("");
}

function getArrayOfAvg(arrToAvg, totalDays) {

    let totalDaylies = 0;
    let arrTotalDaylies = [];

    arrToAvg.forEach((value)=>{
        totalDaylies += value;
    })

    for (let i = 0 ; i < arrToAvg.length; i++) {
        arrTotalDaylies.push(totalDaylies / totalDays )
    }

    return arrTotalDaylies;
    

}


function getFilter() {
    let button = document.getElementById("filtro");

    button.addEventListener("click", (evt) => {
        let country = document.getElementById("cmbCountry").value;
        let dateFrom = document.getElementById("date_start").valueAsDate;
        let dateTo = document.getElementById("date_end").valueAsDate;

        let totalDays = Math.abs(dateTo) - (dateFrom.setDate(dateFrom.getDate() - 1));

        totalDays = totalDays / 1000 / 60 / 60 / 24;

        dateFrom.setDate(dateFrom.getDate() + 1);

        // configuração para pegar a data anterior ao que o usuário setou
        dateFrom.setDate(dateFrom.getDate() - 1);
        dateFrom = dateFrom.toISOString().split('T')[0];
        dateTo = dateTo.toISOString().split('T')[0];



        axios.get(`https://api.covid19api.com/country/${country}?from=${dateFrom}T00:00:00Z&to=${dateTo}T00:00:00Z`)
            .then(function (data) {
                let totalDeaths = 0;
                let recovered = 0;
                let confirmed = 0;
                let avgDailyArray = [];
                let deathDailyArray = [];
                let confirmedDailyArray = [];
                let recoveredDailyArray = [];

                console.log("Tamanho do retorno " + data.data.length)

                    console.log("slice " + JSON.stringify(data.data.slice(-1)));
                        totalDeaths += data.data.slice(-1)[0].Deaths;
                        recovered += data.data.slice(-1)[0].Recovered;
                        confirmed += data.data.slice(-1)[0].Confirmed;            

                data.data.forEach(function (valor, index, arr) {
                    if (index > 0) {
                        deathDailyArray.push(valor.Deaths - arr[index - 1].Deaths);
                        confirmedDailyArray.push(valor.Confirmed - arr[index - 1].Confirmed);
                        recoveredDailyArray.push(valor.Recovered - arr[index - 1].Recovered);
                   }
                })
                //Recuperação da média de mortes

                console.log("Array de Total de confirmados", confirmedDailyArray);

                let totalConfirmados = document.getElementById("kpiconfirmed");
                let totalMortes = document.getElementById("kpideaths");
                let totalRecuperados = document.getElementById("kpirecovered");
                totalConfirmados.innerHTML = confirmed;
                totalMortes.innerHTML = totalDeaths;
                totalRecuperados.innerHTML = recovered;

                
                let option = document.getElementById("cmbData");
                
                if(option.value == "Deaths") {
                    avgDailyArray = getArrayOfAvg(deathDailyArray, totalDays);
                    getGraficoLinhas("Deaths",data.data, totalDeaths, avgDailyArray, deathDailyArray);
                } else if ( option.value == "Confirmed") {
                    avgDailyArray = getArrayOfAvg(confirmedDailyArray, totalDays);
                    getGraficoLinhas("Confirmed",data.data, totalDeaths, avgDailyArray, confirmedDailyArray);
                }
                else if ( option.value == "Recovered") {
                    avgDailyArray = getArrayOfAvg(recoveredDailyArray, totalDays);
                    getGraficoLinhas("Recovered",data.data, totalDeaths, avgDailyArray, recoveredDailyArray);

                }


            })
    })

}
getFilter();

function getGraficoLinhas(option, data, totalDeaths, averageArray, totalArray) {
    let dataLabels = []

    data.forEach((valor) => {
        dataLabels.push(valor.Date.replace('T00:00:00Z',''));  
    });

    dataLabels = dataLabels.slice(1, dataLabels.length )

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
                    label: option == "Deaths"?  "Numero de mortes" : option == "Confirmed" ? "Total Confirmados" : "Total de recuperados",
                    borderColor: "rgb(255,140,13)",
                    backgroundColor: "rgb(255,140,13,0.1)"
                },
                {
                    data: averageArray,
                    label: option == "Deaths"?  "Média Mortes" : option == "Confirmed" ? "Média Confirmados" : "Média de recuperados",
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
                    position: 'top', //top, bottom, left, right

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
    })
   
}