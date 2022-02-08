const apiPosts = axios.create({
    baseURL: "https://api.covid19api.com/"
})

async function getSummaryRoute() {
    let response = await apiPosts.get("summary");
    return response.data;
}

async function getCountriesRoute() {
    let response = await apiPosts.get("countries");
    return response.data;
}

function numberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export { getSummaryRoute, getCountriesRoute, numberWithCommas };