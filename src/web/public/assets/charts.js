
let SVGROOT = null;


async function FetchUpdates() {
    const lrd = new Date();
    document.getElementById("lastRequestedDate").innerText = lrd;
    q =`/fetch?datefrom=${LastFetchDate.toISOString()}`;
    console.log("PRINTING")
    console.log(q)
    const fetched = await fetch(q, {"method": "GET"});
    const json = await fetched.json();

    let latestTimestamp = "";
    Object.keys(json).forEach((roomName) => {
        json[roomName].forEach(reading => {
            recieveData(reading);
            latestTimestamp = reading["Timestamp"];
        });
    });
    document.getElementById("lastDataAtDate").innerText = new Date(latestTimestamp);
    LastFetchDate = lrd;
}

function addCharts() {
    const height = 220;
    const width = 415;
    const scale = 1.4;
    let root = selectRoot()
    .attr("viewBox", `0 0 ${width * scale} ${height * scale}`)
    .attr("style", "margin: 0 0 0% 7%")
    .attr("preserveAspectRatio", "none");


}

function selectRoot() {
    const id = `svgAll`;
    let rootElem = document.getElementById(id);
    if (rootElem == null) {
        return d3.select(`#root`).append("svg").attr("id", `${id}`);
    } else {
        return d3.select(`#${id}`);
    }
}


async function main(){
    SVGROOT = selectRoot();

    addCharts()
}

main()