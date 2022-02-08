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


function getDeathsAvg(arrDeaths, totalDays) {

    let totalDayliesDeaths = 0;
    let arrTotalDayliesDeaths = [];

    arrDeaths.forEach((value)=>{
        totalDayliesDeaths += value;
    })

    for (let i = 0 ; i < arrDeaths.length; i++) {
        arrTotalDayliesDeaths.push(totalDayliesDeaths / totalDays )
    }

    return arrTotalDayliesDeaths;
    

}

function getConfirmedsAvg(arrConfirmeds, totalDays) {

    let totalDayliesConfirmeds = 0;
    let arrTotalDayliesConfirmeds= [];

    arrConfirmeds.forEach((value)=>{
        totalDayliesConfirmeds += value;
    })

    for (let i = 0 ; i < arrConfirmeds.length; i++) {
        arrTotalDayliesConfirmeds.push(totalDayliesConfirmeds / totalDays )
    }
    return arrTotalDayliesConfirmeds;    

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
                let avgDailyDeathArray = [];
                let deathDailyArray = [];
                let confirmedDailyArray = [];
                let avgDailyConfirmedArray = [];

                console.log("Tamanho do retorno " + data.data.length)

                    console.log("slice " + JSON.stringify(data.data.slice(-1)));
                        totalDeaths += data.data.slice(-1)[0].Deaths;
                        recovered += data.data.slice(-1)[0].Recovered;
                        confirmed += data.data.slice(-1)[0].Confirmed;
                

                data.data.forEach(function (valor, index, arr) {
                    if (index > 0) {
                        deathDailyArray.push(valor.Deaths - arr[index - 1].Deaths);
                        confirmedDailyArray.push(valor.Confirmed - arr[index - 1].Confirmed);

                   }
                })
                //Recuperação da média de mortes

                console.log("TOTAL DE MORTES", totalDeaths);

                let totalConfirmados = document.getElementById("kpiconfirmed");
                let totalMortes = document.getElementById("kpideaths");
                let totalRecuperados = document.getElementById("kpirecovered");
                totalConfirmados.innerHTML = confirmed;
                totalMortes.innerHTML = totalDeaths;
                totalRecuperados.innerHTML = recovered;

                avgDailyDeathArray = getDeathsAvg(deathDailyArray, totalDays);
                avgDailyConfirmedArray = getConfirmedsAvg(confirmedDailyArray, totalDays);

                getGraficoLinhas(data.data, totalDays, totalDeaths, avgDailyDeathArray, deathDailyArray, confirmedDailyArray, avgDailyConfirmedArray);

            })
    })

}
getFilter();

function getGraficoLinhas(data, totalDays, totalDeaths, avgDailyDeathArray, getDeathDailyArray) {
    let dataLabels = []
    let totalMortes = [];
    let mediaDiaria = [];

    console.log(getDeathDailyArray);

    data.forEach((valor) => {
        console.log(valor);
        dataLabels.push(valor.Date.replace('T00:00:00Z',''));
        totalMortes.push(totalDeaths)
        mediaDiaria.push(avgDailyDeathArray)
    });

    dataLabels = dataLabels.slice(1, dataLabels.length )

    new Chart(document.getElementById("linhas"), {
        type: 'line',
        data: {
            labels: dataLabels,
            datasets: [
                /*{
                    data: [1123, 1109, 1008, 1208, 1423, 1114, 1036],
                    label: "Casos Confirmados",
                    borderColor: "rgb(60,186,159)",
                    backgroundColor: "rgb(60,186,159,0.1)"
                },
                {
                    data: [1123, 1109, 1008, 1208, 1423, 1114, 1036],
                    label: "Media Casos Confirmados",
                    borderColor: "rgb(60,186,159)",
                    backgroundColor: "rgb(60,186,159,0.1)"
                },*/
                {
                    data: getDeathDailyArray,
                    label: "Numero de Obitos",
                    borderColor: "rgb(255,140,13)",
                    backgroundColor: "rgb(255,140,13,0.1)"
                },
                {
                    data: avgDailyDeathArray,
                    label: "Media de Obitos",
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