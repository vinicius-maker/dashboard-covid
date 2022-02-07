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

    let sortedCountries = countries.sort((a,b)=> a > b? 1 : -1)

    let select = sortedCountries.map(arrayCountry => {
        if(arrayCountry == "Brazil")
            return item = `<option selected value="${arrayCountry}">${arrayCountry}</option>`;
        return item = `<option value="${arrayCountry}">${arrayCountry}</option>`;


    });
    return select.join("");
}

// function addListeners(){

// let item = document.getElementById('filtro')
//     item.addEventListener('click', function(event){
//         Array.from(document.getElementById('filtro')).forEach((el) => el.classList.remove('active'));
//         this.parentElement.classList.add('active');
//         covid[event.target.dataset.modulo].start();       
//     });
// }
// //addListeners();

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


        console.log("TESTE DE DATA ", dateFrom);


        axios.get(`https://api.covid19api.com/country/${country}?from=${dateFrom}T00:00:00Z&to=${dateTo}T00:00:00Z`)
            .then(function (data) {

                console.log(data);

                let totalDeaths = 0;
                let recovered = 0;
                let confirmed = 0;
                let mortesDiarias = 0;
                let mediaMortesDiarias = 0;
                let mortesDiariasArray = [];
                let mediaDiariasArray = [];

                let avgDailyDeathArray = 0;

                let getDeathDailyArray = [];

                data.data.forEach((valor, index) => {
                    // if (index == 0) {
                    //     mortesDiarias = valor.Deaths;
                    // } else {
                    //     mortesDiarias += valor.Deaths - data.data[index - 1].Deaths;
                    //     mediaMortesDiarias = mortesDiarias / index;
                    //     mortesDiariasArray.push(mortesDiarias);
                    //     mediaDiariasArray.push(mediaMortesDiarias);
                    // }

                    // console.log("mortes diarias: " + mortesDiarias);
                    // console.log("medias: " + mediaMortesDiarias);      

                    // totalDeaths += valor.Deaths;
                    recovered += valor.Recovered;
                    confirmed += valor.Confirmed;
                });

                data.data.forEach(function (valor, index, arr) {
                    if (index > 0) {
                        getDeathDailyArray = valor.Deaths - arr[index - 1].Deaths;
                        console.log("cheguei no if, valor", getDeathDailyArray);

                        totalDeaths += getDeathDailyArray;

                        console.log("mortes totais", totalDeaths);

                    }
                })
                //Recuperação da média de mortes
                avgDailyDeathArray = totalDeaths / totalDays;

                console.log("média corrigido", avgDailyDeathArray);

                let totalConfirmados = document.getElementById("kpiconfirmed");
                let totalMortes = document.getElementById("kpideaths");
                let totalRecuperados = document.getElementById("kpirecovered");
                totalConfirmados.innerHTML = confirmed;
                totalMortes.innerHTML = totalDeaths;
                totalRecuperados.innerHTML = recovered;

                getGraficoLinhas(data.data, totalDays, totalDeaths, avgDailyDeathArray, getDeathDailyArray)

            })
    })

}
getFilter();

function getGraficoLinhas(dataAPI, totalDays, totalDeaths, avgDailyDeathArray, getDeathDailyArray) {
    let dataLabels = []
    let totalMortes = [];
    let mediaDiaria = [];

    console.log("Vamos plotar " + avgDailyDeathArray + " " + getDeathDailyArray)

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
                    data: [getDeathDailyArray],
                    label: "Numero de Obitos",
                    borderColor: "rgb(255,140,13)",
                    backgroundColor: "rgb(255,140,13,0.1)"
                },
                {
                    data: [avgDailyDeathArray],
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
