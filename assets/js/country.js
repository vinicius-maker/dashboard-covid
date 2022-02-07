fetch("https://api.covid19api.com/countries")
    .then((resp) => {
        return resp.json();
    })
    .then(function (data) {
        let country = getCountries(data);

        document.getElementById("cmbCountry").innerHTML = country;
    });

function getCountries(arrayCountries) {

    const Countries = arrayCountries.map(function (nameCountry) {
        return nameCountry.Country;
    })

    let select = Countries.map(arrayCountry => {

        return item = `<option value="${arrayCountry}">${arrayCountry}</option>`;

    });
    return select.join("");
}

function addListeners(){

let item = document.getElementById('filtro')
    item.addEventListener('click', function(event){
        Array.from(document.getElementById('filtro')).forEach((el) => el.classList.remove('active'));
        this.parentElement.classList.add('active');
        covid[event.target.dataset.modulo].start();       
    });
}
//addListeners();

function getFilter() {
    let button = document.getElementById("filtro");

    button.addEventListener("click", (evt) => {
        let country = document.getElementById("cmbCountry").value;
        let dateFrom = document.getElementById("date_start").value;
        let dateTo = document.getElementById("date_end").value;
        let newDateFrom = new Date(dateFrom)
        console.log("teste data " + newDateFrom);

        let totalDias = Math.abs(new Date(dateFrom.split("T")[0]) - new Date(dateTo.split("T")[0])) / 1000 / 60 / 60 / 24;

        //console.log("TESTE DE DATA " + totalDias);


        axios.get(`https://api.covid19api.com/country/${country}?from=${dateFrom}T00:00:00Z&to=${dateTo}T00:00:00Z`)
            .then(function (data) {
                let deaths = 0;
                let recovered = 0;
                let confirmed= 0; 
                let mortesDiarias = 0;
                let mediaMortesDiarias = 0;
                let mortesDiariasArray = [];
                let mediaDiariasArray = [];
                
                data.data.forEach((valor, index) => {
                if (index == 0) {
                    mortesDiarias = valor.Deaths;
                } else {
                    mortesDiarias += valor.Deaths - data.data[index -1].Deaths;
                    mediaMortesDiarias = mortesDiarias / index;
                    mortesDiariasArray.push(mortesDiarias);
                    mediaDiariasArray.push(mediaMortesDiarias);
                }

                console.log("mortes diarias: " + mortesDiarias);
                console.log("medias: " + mortesDiarias);
                
                deaths += valor.Deaths
                recovered += valor.Recovered
                confirmed += valor.Confirmed
                })

                let totalConfirmados = document.getElementById("kpiconfirmed");
                let totalMortes = document.getElementById("kpideaths");
                let totalRecuperados = document.getElementById("kpirecovered");
                totalConfirmados.innerHTML = confirmed
                totalMortes.innerHTML = deaths
                totalRecuperados.innerHTML = recovered

                getGraficoLinhas(data.data, totalDias, deaths, mediaDiariasArray, mortesDiariasArray)

            })
    })

}
getFilter();

function getGraficoLinhas(data, totalDias, deaths, mediaDiariasArray, mortesDiariasArray) {
    let dataLabels = []
    let totalMortes = [];
    let mediaDiaria = [];
    console.log(deaths);
    data.forEach((valor) => {
        console.log(valor);
        dataLabels.push(valor.Date.replace('T00:00:00Z',''));
        totalMortes.push(valor.Deaths)
        mediaDiaria.push(deaths / totalDias)
    });

    //let mediaMortes = totalMortes / totalDias;
    console.log("Total de mortes " + totalMortes);
    console.log("Media de mortes " + mediaDiaria);



    new Chart(document.getElementById("linhas"),{
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
                    data: mortesDiariasArray,
                    label: "Numero de Obitos",
                    borderColor: "rgb(255,140,13)",
                    backgroundColor: "rgb(255,140,13,0.1)"
                },
                {
                    data: mediaDiariasArray,
                    label: "Media de Obitos",
                    borderColor: "rgb(60,186,159)",
                    backgroundColor: "rgb(60,186,159,0.1)"
                }
            ]
        },
        options:{
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
                    padding:{
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
getGraficoLinhas()
