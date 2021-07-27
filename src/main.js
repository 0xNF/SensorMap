let SVGROOT = null;
const ROOM_NAMES = ["Scorpio", "Leo", "Aries", "Sagittarius", "Capricorn", "Taurus", "Gemini", "Cancer", "Aquarius", "Pisceslol"];
let AREAIDX_2_ROOMNAME = {};
let ROOMNAME_2_AREAIDX = {};
const AREAS = {}
const FETCH_LATEST_FROM_SERVER_SECS = 5; /* how often to retrieve non-critical data from the server (temp, humidity) */
const OCCUPANCY_TIMEOUT_SECS = 240; /* Occupancy does not report "no people", so we set a timeout to say "no people" off after no readings for some amount of seconds*/

let LastFetchDate = new Date();

const COLOR_FREE = "#69c245";
const COLOR_OCCUPIED = "red";
const VISIBLE = null;
const HIDDEN = "hidden";
const ROOM_FREE_JP = "空き"
const ROOM_FREE_EN = "Available";
const ROOM_OCCUPIED_JP = "在室"
const ROOM_OCCUPIED_EN = "In Use";
const REQUEST_NORMAL = "呼出中　Calling";
const REQUEST_URGENT = "緊急 Urgent";

const IS_DEMO = false;

function DEMO_ENGAGE() {
    console.log("ayy");
    /**
     * Demo enage:
     * Starts with all temperatures set to 23.5c
     * After 3 seconds, all temperatures get a random new value of +/- [0.0, 0.1, 0.2]
     * After 3 seconds: one room get Occupied
     * After 3 seconds: one room gets regular call
     * After 3 seconds: one room gets Emergency call
     */
     function SetTemperatures() {
         const temps = [0.0, 0.2, 0.3, 0.5, 0.7, 0.8, 1, 1.2];
         const base = 24.3;
         Object.keys(AREAS).forEach(key => {
             let num = temps[Math.floor(Math.random() * temps.length)];
             let pm = (Math.round(Math.random() * 10000) % 2) == 0;
             let modifier = pm ? num : 0 - num;
             let final = base + modifier;

             console.log(`key: ${key}. num: ${num}. modifier: ${modifier}. final: ${final}`);
             
             UpdateTemperature(key, {Data: final});
         });
     }

     function SetHumidity() {
        const nums = [0,1,2,-1];
        const base = 50;
        Object.keys(AREAS).forEach(key => {
            let num = nums[Math.floor(Math.random() * nums.length)];
            let final = base - num
            UpdateHumidity(key, {Data: final});
        });
    }

    function SetOccupied() {
        UpdateOccupied("Libra", {Data: true});
    }

    function SetRegularCall() {
        RequestSecretary("Leo", {Data: true, Timestamp: new Date()});
    }

    function SetUrgentCall() {
        RequestUrgent("Scorpio", {Data: true, Timestamp: new Date()});
    }
    

    function timerFunc() {
        SetTemperatures();
        SetHumidity();
        SetOccupied();
        SetRegularCall();
        SetUrgentCall();
    }

    setTimeout(() => timerFunc(), 3000);
    
}

function Timer(fn, t, onStop = () => {}) { 
    /* https://stackoverflow.com/questions/8126466/how-do-i-reset-the-setinterval-timer */
    var timerObj = null; 

    this.stop = function() {
        if (timerObj) {
            clearInterval(timerObj);
            timerObj = null;
            onStop();
        }
        return this;
    }

    // start timer using current settings (if it's not already running)
    this.start = function() {
        if (!timerObj) {
            this.stop();
            timerObj = setInterval(fn, t);
        }
        return this;
    }

    // start with new or original interval, stop current interval
    this.reset = function(newT = t) {
        t = newT;
        return this.stop().start();
    }
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

function AddFloor() {
    const height = 220;
    const width = 415;
    const scale = 1.4;
    let root = selectRoot()
    .attr("viewBox", `0 0 ${width * scale} ${height * scale}`)
    .attr("style", "margin: 0 0 0% 7%")
    .attr("preserveAspectRatio", "none");

    let mg = root.append("g").attr("id", "room").attr("transform", "translate(155.7829,136.4631)");

    const p36_fill = mg.append("path")
        .attr("id", "p46")
        .attr("style", "fill:#f0f0f0;stroke-width:0.26458335")
        .attr("d", "m -154.65842,156.07463 -0.59531,-0.58862 V 10.049932 c 0,-138.246012 0.0229,-145.447512 0.46302,-145.667442 0.43368,-0.2167 43.19908,-0.22737 397.0005,-0.099 l 130.10206,0.0472 0.40368,0.78061 c 0.36038,0.69692 0.40367,16.2753 0.40367,145.306023 V 154.94269 l -0.59531,0.87448 -0.59532,0.87445 -123.33367,0.003 c -112.22117,0.003 -123.34814,-0.0359 -123.49427,-0.41672 -0.23114,-0.60235 -0.19026,-3.09388 0.0572,-3.48353 0.16634,-0.26196 12.886,-0.34393 61.57772,-0.39687 l 61.36807,-0.0675 0.0665,-84.64629 c 0.0616,-78.304183 0.0994,-84.682503 0.50404,-85.129686 0.41195,-0.455184 1.16892,-0.483402 12.96752,-0.483402 h 12.53005 l -0.0695,-9.458854 -0.0695,-9.458854 -81.44891,-0.132292 -81.44889,-0.132291 -0.5058,-0.624623 c -0.47766,-0.589884 -0.50578,-1.169927 -0.50578,-10.428828 v -9.804198 l -69.254691,0.176164 c -38.0900796,0.09689 -79.821635,0.176189 -92.736792,0.176221 l -23.482103,5.5e-5 0.06648,104.973437 0.06648,104.973441 10.962754,0.0691 c 8.594609,0.0542 11.008516,-0.003 11.174595,-0.26458 0.116512,-0.18351 0.213664,-16.8947 0.215892,-37.13591 0.0039,-35.314532 0.0236,-36.819927 0.487905,-37.240106 0.445048,-0.402762 3.263318,-0.437883 35.139015,-0.437883 29.511308,0 34.731392,0.05574 35.168751,0.375526 0.503073,0.367834 0.5163,1.135893 0.645882,37.504683 l 0.132292,37.12917 27.781251,0.13229 27.781251,0.13229 0.07727,2.05052 0.07728,2.05052 -114.244989,-0.0159 -114.244993,-0.0161 z M -49.817272,58.401964 c -1.274905,-0.450795 -2.649466,-1.871543 -2.983063,-3.083303 -0.146458,-0.53199 -0.192032,-19.655121 -0.114282,-47.9519111 0.124828,-45.4289079 0.146447,-47.0841519 0.62115,-47.5588539 0.476858,-0.476858 2.59126,-0.49182 69.497503,-0.49182 59.177186,0 69.078834,0.05348 69.519273,0.375525 0.503616,0.368234 0.514929,1.098751 0.582464,37.613156 0.05392,29.153622 0.140078,37.323334 0.396875,37.632417 0.447659,0.538811 0.629997,17.846088 0.208349,19.776186 -0.389266,1.781879 -1.528556,3.128013 -3.100758,3.663715 -1.122328,0.382415 -7.493135,0.421235 -67.404329,0.41072 -56.33612,-0.0099 -66.322064,-0.0672 -67.223182,-0.385831 z M 128.55667,55.448682 c -0.16034,-0.16034 -0.26707,-7.684643 -0.11092,-7.818448 0.0364,-0.03117 3.81662,-0.120467 8.40053,-0.198437 l 8.33437,-0.141764 0.13229,-17.727083 0.13229,-17.727083 32.64768,-0.06719 c 23.90691,-0.0492 32.74381,0.01259 33.00678,0.230833 0.2958,0.245501 0.35909,3.393307 0.35909,17.86042 v 17.562396 h 10.02178 c 8.22378,0 10.07642,0.06585 10.3264,0.367069 0.2059,0.248095 0.28072,1.555877 0.23085,4.034896 l -0.0738,3.667826 -51.61513,0.06681 c -28.38834,0.03674 -51.69483,-0.01286 -51.79219,-0.110244 z M 109.50926,36.40127 c -0.0988,-0.0988 -0.17965,-12.042232 -0.17965,-26.5409598 0,-20.1504702 0.0748,-26.4361242 0.3175,-26.6788182 0.24471,-0.244726 11.88654,-0.3175 50.79069,-0.3175 49.63057,0 50.47776,0.0085 50.74708,0.511773 0.16904,0.315838 0.2739,3.195561 0.2739,7.5217257 0,6.0199084 -0.0587,7.0686744 -0.41577,7.4257269 -0.37438,0.3743854 -4.48286,0.4157742 -41.27325,0.4157742 h -40.85747 l -0.0679,18.8515622 -0.0679,18.851562 -9.54378,0.0694 c -5.2491,0.03817 -9.62464,-0.01146 -9.72344,-0.110244 z m 120.20577,-8.276365 c -2.20962,-0.674566 -4.44685,-2.585881 -5.59472,-4.779663 -0.52332,-1.000163 -0.6213,-1.571554 -0.61235,-3.571875 0.0119,-2.674684 0.43836,-3.807794 2.14304,-5.694686 1.2581,-1.39256 2.32193,-2.014082 4.32634,-2.527585 3.87744,-0.993355 7.98983,1.061188 9.72933,4.860731 0.53923,1.17782 0.67464,1.879603 0.66456,3.44391 -0.0109,1.694534 -0.13502,2.204034 -0.90265,3.705759 -1.55067,3.033564 -4.4807,4.843547 -7.75105,4.788088 -0.73758,-0.01252 -1.6387,-0.113615 -2.0025,-0.224679 z m -1.0368,-27.67413049 c -1.80763,-0.50541502 -2.88361,-1.16897678 -4.12681,-2.54506941 -1.56107,-1.727917 -2.10452,-3.1866416 -2.10452,-5.6490049 0,-2.5969672 0.64331,-4.1882222 2.4275,-6.0046842 1.74098,-1.772444 3.3978,-2.446928 6.03125,-2.455275 1.78732,-0.0057 2.34972,0.107738 3.61434,0.728776 4.07824,2.002737 5.97303,7.0633987 4.14208,11.0627398 -0.9348,2.0418345 -2.11166,3.2734646 -4.03066,4.21818586 -2.01049,0.98975597 -3.96224,1.20099934 -5.95318,0.64433185 z")

    const p38_edges = mg.append("path")
        .attr("id", "p38")
        .attr("style", "fill:#d6d6d6;stroke-width:0.26458335")
        .attr("d","m -153.80364,156.18219 c 0.11272,-0.35515 -0.004,-0.6023 -0.37904,-0.80307 l -0.54189,-0.29001 V 10.248367 c 0,-143.843747 0.004,-144.842677 0.52133,-145.119757 0.36174,-0.1936 12.49055,-0.24169 39.62135,-0.1571 21.50502,0.0671 139.826912,0.15865 262.93754,0.20355 l 223.83751,0.0816 0.133,48.021876 0.13301,48.021875 0.13229,-48.021875 c 0.0728,-26.412026 0.13221,17.224375 0.13213,96.969791 -1.8e-4,129.166593 -0.0148,134.451243 -0.13356,48.418749 l -0.13337,-96.572915 -0.0656,96.423571 -0.0656,96.423568 -0.57528,0.61236 c -0.31642,0.33681 -0.43548,0.61237 -0.26459,0.61237 0.1709,0 0.3107,0.11907 0.3107,0.26459 0,0.176 -41.23089,0.26458 -123.16354,0.26458 -81.93265,0 -123.16355,-0.0886 -123.16355,-0.26458 0,-0.14552 0.11906,-0.26459 0.26459,-0.26459 0.14552,0 0.26458,-0.65484 0.26458,-1.4552 v -1.45521 h 61.21866 c 51.08408,0 61.26774,-0.0592 61.5152,-0.35735 0.21738,-0.26191 0.31435,-22.99578 0.36314,-85.129686 l 0.0665,-84.77234 12.8323,-0.132292 12.83229,-0.132292 0.0694,-10.036556 c 0.0543,-7.853539 -0.003,-10.082667 -0.26458,-10.248553 -0.18367,-0.116596 -36.90742,-0.21382 -81.6083,-0.216048 -73.52951,-0.0037 -81.31395,-0.04367 -81.69011,-0.419825 -0.36332,-0.363328 -0.41576,-1.678937 -0.41576,-10.430018 v -10.014246 l -0.84307,-0.185169 c -1.20991,-0.265739 -184.907373,0.163846 -185.622042,0.434086 l -0.595312,0.225108 V 47.230568 c 0,81.617302 0.07162,105.461712 0.3175,105.707592 0.396774,0.39677 22.606771,0.45273 23.230417,0.0585 0.348679,-0.2204 0.412941,-4.77443 0.529167,-37.50062 l 0.132292,-37.249777 34.499823,-0.06714 c 25.2763956,-0.04919 34.595809,0.01251 34.858855,0.230833 0.299186,0.248301 0.359032,6.458233 0.359032,37.254324 0,28.39105 0.07359,37.02994 0.3175,37.27386 0.242885,0.24288 6.802732,0.3175 27.913543,0.3175 h 27.596042 v 1.45521 c 0,0.80036 0.119063,1.4552 0.264584,1.4552 0.14552,0 0.264583,0.11907 0.264583,0.26459 0,0.17597 -38.19414,0.26458 -114.053251,0.26458 -112.738773,0 -114.051373,-0.006 -113.890413,-0.51305 z m 75.984659,-3.2793 c 0.337732,-0.33777 0.417697,-115.448168 0.08063,-116.077972 -0.271163,-0.506674 -0.88727,-0.515093 -37.695589,-0.515093 -36.72519,0 -37.42501,0.0095 -37.69382,0.511773 -0.29387,0.549108 -0.40313,114.469922 -0.11083,115.559982 0.0857,0.31964 0.35197,0.63386 0.5917,0.69829 0.8154,0.21915 74.606313,0.0446 74.827905,-0.17698 z m 94.020875,-0.44098 c 0.154853,-0.24498 0.252408,-14.13526 0.254911,-36.29517 0.0037,-32.285505 -0.03779,-35.940128 -0.411724,-36.314058 -0.373486,-0.373489 -3.738965,-0.415774 -33.090311,-0.415774 -22.017411,0 -32.841458,0.08933 -33.18631,0.273891 -0.50215,0.268742 -0.511773,0.955093 -0.511773,36.499351 0,34.22066 0.02564,36.24049 0.46302,36.49687 0.311219,0.18243 11.244181,0.2518 33.347175,0.21158 28.898702,-0.0526 32.914556,-0.10792 33.135012,-0.45669 z M -77.632995,34.127012 c 0.208505,-0.778026 0.208505,-70.791765 0,-71.569791 l -0.159536,-0.595312 h -37.643959 c -34.08229,0 -37.65916,0.0396 -37.80456,0.418515 -0.20993,0.547066 -0.20993,71.37632 0,71.923385 0.1454,0.378918 3.72227,0.418516 37.80456,0.418516 h 37.643959 z m 325.190175,-73.481471 0.67868,-0.258035 v -46.696198 c 0,-45.896368 -0.009,-46.700888 -0.51178,-46.970088 -0.34483,-0.18456 -11.16888,-0.27389 -33.18629,-0.27389 -29.35137,0 -32.71684,0.0423 -33.09033,0.41577 -0.37484,0.37484 -0.41537,4.97866 -0.41172,46.765104 0.003,25.492131 0.0915,46.480307 0.19844,46.640387 0.10692,0.160081 0.37298,0.35904 0.59126,0.442132 0.71964,0.273939 65.00747,0.210188 65.73174,-0.06518 z m 123.02684,0.09743 c 0.37943,-0.145608 0.41851,-4.530032 0.41851,-46.970089 V -133.0366 l -0.67868,-0.25804 c -0.9294,-0.35336 -118.8924,-0.35336 -119.8218,0 l -0.67869,0.25804 v 46.652586 c 0,35.93257 0.0729,46.725546 0.3175,46.97009 0.24509,0.245073 13.97106,0.3175 60.17107,0.3175 32.91946,0 60.0419,-0.07227 60.27209,-0.1606 z M 179.3119,-86.456841 v -46.963539 l -33.07292,-0.0682 c -30.85872,-0.0636 -33.09506,-0.0381 -33.40364,0.3813 -0.26162,0.35555 -0.33073,10.15997 -0.33073,46.921464 0,25.559602 0.0798,46.551834 0.1774,46.649407 0.0976,0.09757 15.12922,0.147183 33.40365,0.110241 l 33.22624,-0.06716 z m -257.052022,46.319477 c 0.296209,-0.553474 0.401431,-91.721806 0.107127,-92.819996 l -0.159536,-0.59531 h -37.641409 -37.64141 l -0.15954,0.59531 c -0.2943,1.09819 -0.18908,92.266522 0.10713,92.819996 0.26881,0.502272 0.96863,0.511773 37.69382,0.511773 36.725194,0 37.425009,-0.0095 37.693818,-0.511773 z M 16.328564,-96.643299 V -133.1558 l -46.021426,-0.0669 c -36.642528,-0.0533 -46.064314,6.6e-4 -46.231885,0.26458 -0.243081,0.38285 -0.299956,71.910477 -0.05769,72.541831 0.146111,0.380754 4.392182,0.413112 46.235939,0.352366 l 46.075057,-0.06689 z m 94.692526,35.961693 c 0.0883,-0.230182 0.1606,-16.586697 0.1606,-36.34781 0,-29.916714 -0.06,-35.979124 -0.35875,-36.227024 -0.26342,-0.21863 -12.616098,-0.27995 -46.500509,-0.23083 l -46.141784,0.0669 -0.06801,36.247915 c -0.03741,19.936353 -0.01138,36.396744 0.05784,36.578645 0.10002,0.262842 9.625782,0.330729 46.407936,0.330729 41.959127,0 46.297077,-0.03909 46.442677,-0.418515 z M -50.094973,57.898078 c -1.063789,-0.463357 -2.176701,-1.814639 -2.369299,-2.876772 -0.08498,-0.468659 -0.08755,-5.257419 -0.0057,-10.64169 0.08185,-5.38427 0.207,-26.387599 0.27812,-46.6740655 0.09316,-26.5738025 0.211809,-36.9838915 0.424447,-37.2401035 0.245755,-0.296103 11.801327,-0.355621 69.045113,-0.355621 67.700284,0 68.754146,0.0078 69.023857,0.511773 0.185009,0.345694 0.273891,12.374244 0.273891,37.0660789 0,36.1536771 0.0058,36.5616801 0.529167,37.2270331 0.507164,0.644753 0.529166,1.073357 0.529166,10.307476 0,10.202847 -0.01844,10.372622 -1.283306,11.813125 -1.141179,1.299649 2.46089,1.235657 -68.929736,1.224573 -54.865933,-0.0085 -66.852082,-0.07275 -67.515705,-0.361807 z M 16.460855,-1.7808668 c 0,-35.5572582 -0.0096,-36.2437572 -0.511773,-36.5124992 -0.673893,-0.360657 -65.593094,-0.375304 -66.163229,-0.01492 -0.348975,0.220586 -0.405741,4.554958 -0.470344,35.9131364 -0.04041,19.6142506 -0.0084,35.9301646 0.07119,36.2575866 l 0.144656,0.595307 h 33.464752 33.464752 z m 68.527086,0 c 0,-35.5572582 -0.0096,-36.2437572 -0.511773,-36.5124992 -0.7126,-0.381371 -65.20344,-0.381371 -65.91604,0 -0.502131,0.268734 -0.511773,0.953243 -0.511773,36.3361121 0,19.8342199 0.07937,36.1415929 0.17639,36.2386059 0.09701,0.09701 15.158419,0.176389 33.469793,0.176389 H 84.987941 Z M 129.17336,51.666487 v -3.16417 l 8.21198,-0.07698 c 6.95388,-0.06518 8.25037,-0.137776 8.46262,-0.47385 0.15115,-0.239371 0.25225,-7.353273 0.25468,-17.92552 l 0.004,-17.528646 h 32.13966 32.13968 l 0.0733,17.705162 c 0.0403,9.737839 0.17248,17.804323 0.29361,17.925521 0.12112,0.121198 4.79433,0.254172 10.38489,0.2955 l 10.16466,0.07514 v 3.166004 3.166004 h -51.06459 -51.06458 z m -18.98515,-41.8811412 0.0674,-25.9953118 50.0724,-0.06683 50.07239,-0.06683 v 7.012144 7.0121435 h -40.63092 c -27.50196,0 -40.79632,0.088503 -41.14271,0.2738913 -0.49861,0.2668403 -0.51178,0.7574042 -0.51178,19.0500002 v 18.776108 h -8.99713 -8.99713 z M 230.1119,27.346686 c -2.10214,-0.552847 -4.07088,-2.137259 -5.10688,-4.109918 -0.59727,-1.137232 -0.70659,-1.676009 -0.70281,-3.463401 0.004,-1.844001 0.10573,-2.301481 0.79042,-3.55136 0.939,-1.714082 2.77719,-3.245096 4.46286,-3.717051 1.64666,-0.46104 4.49921,-0.236919 5.84808,0.459472 2.57842,1.331172 4.08747,3.841801 4.09266,6.808939 0.005,3.099363 -1.58555,5.669705 -4.33237,6.999417 -1.31665,0.637384 -3.75664,0.914564 -5.05196,0.573902 z m -0.62661,-27.57399888 c -3.82741,-0.7385976 -6.23824,-3.64323042 -6.23824,-7.51598692 0,-3.1255092 1.51368,-5.5648222 4.30326,-6.9347052 1.23291,-0.605451 1.83634,-0.734335 3.35534,-0.716656 3.13473,0.03649 5.37057,1.408819 6.73108,4.131472 0.6776,1.3559839 0.8086,1.9257985 0.80373,3.4960026 -0.007,2.2429708 -0.53869,3.5793177 -2.0969,5.2697909 -1.70961,1.85469737 -4.39857,2.74474511 -6.85827,2.27008262 z")
        ;

    const p34_reception = mg.append("path")
        .attr("id", "p34")
        .attr("style", "fill:#a4a4a4;stroke-width:0.26458335")
        .attr("d", "m -49.552688,57.686509 c -1.067274,-0.372951 -1.975509,-1.219779 -2.41535,-2.25204 -0.493625,-1.158489 -0.535194,-19.640143 -0.04527,-20.130061 0.245324,-0.245324 16.029551,-0.3175 69.434228,-0.3175 63.316251,0 69.152645,0.03592 69.544699,0.427972 0.381442,0.381439 0.419452,1.467339 0.349628,9.98802 -0.08945,10.91529 -0.08085,10.87083 -2.323271,12.007445 l -1.174489,0.595313 -66.28821,-0.02088 c -45.496503,-0.01435 -66.537175,-0.1079 -67.08196,-0.298273 z");

    const reception_text = mg.append("text")
        .attr("id", "reception_text")
        .text("受付 Reception")
        .attr("font-size", 12)
        .attr("font-family", "verdana")
        .attr("font-weight", 2)
        .attr("fill", "white")
        .attr('x', -27)
        .attr('y', 50);
}

function AddRoom(room) {
    
    const roomG = d3.select("#room").append("g")
        .attr("id", room.Id)
        .attr("transform", `translate(${room.Room.X},${room.Room.Y})scale(${room.Room.Scale})`);

    const roomPeopleX = room.People.X + room.Label.X ;
    const roomPeopleY = room.People.Y + room.Label.Y + 5;

    const roomPeople = roomG.append("g")
        .attr("transform", `translate(${roomPeopleX},${roomPeopleY})scale(${room.People.Scale})`)
        .attr("id", `${room.Id}_people_g`);
        
    const roomPeopleRect = roomPeople.append("rect")
        .attr("id", `${room.Id}_people_rect`)
        .attr("style", "fill: #69c245")
        .attr("width", 70)
        .attr("height", 41)
        .attr("ry", 5.7);

    const roomPeopleTextJP = roomPeople.append("text")
        .text("空き")
        .attr("id", `${room.Id}_people_JP`)
        .attr("style", "fill: white")
        .attr("x", 22)
        .attr("y", 20)
        .attr("font-size", 14)

    const roomPeopleTextEN = roomPeople.append("text")
        .text(ROOM_FREE_EN)
        .attr("id", `${room.Id}_people_EN`)
        .attr("style", "fill: white")
        .attr("x", (parseFloat(roomPeopleRect.attr('width')) / 2))
        .attr("y", parseFloat(roomPeopleTextJP.attr('y')) + 10)
        .attr("font-size", 8)
        .attr("text-anchor", "middle");

        
    const roomTemperatureNum = roomG.append("text")
        .text("0 °C")
        .attr("id", `${room.Id}_temperture`)
        .attr("x", (roomPeopleX + (parseFloat(roomPeopleRect.attr('width')) / 2) + 5))
        .attr("y", roomPeopleY + 38)
        .attr("fill", "black")
        .attr("font-size", 8 * 0.9)
        // .attr("font-weight", "bold")
        .attr("font-family", "verdana")
        .attr("text-anchor", "end");



    const roomHumidityNum = roomG.append("text")
        .text("0 %")
        .attr("id", `${room.Id}_humidity`)
        .attr("x", parseFloat(roomTemperatureNum.attr('x')))
        .attr("y", parseFloat(roomTemperatureNum.attr('y')) + 10)
        .attr("fill", "black")
        .attr("font-size", 8 * 0.9)
        .attr("font-family", "verdana")
        .attr("text-anchor", "end");

    const callingPushY = roomHumidityNum.attr('y');
    const calling = roomG.append("text")
        .text(REQUEST_NORMAL)
        .attr("id", `${room.Id}_calling`)
        .attr('x', (roomPeopleX + (parseFloat(roomPeopleRect.attr('width')) / 2)) - 10)
        .attr('y', parseFloat(callingPushY) + 10)
        .attr("fill", "red")
        .attr("font-size", 8 * 0.7)
        .attr("font-family", "verdana")
        .attr('text-anchor', "middle")
        .attr("hidden", HIDDEN);

        /** add Co2 */
        let Co2Icon = null;
        let Co2Text = null;
        let Co2IconFlash = null;
        if (room.CO2.X !== 0) {

            /* push calling down more */
            calling.attr("y", parseFloat(roomHumidityNum.attr('y')) + 20)

            const roomCo2Icon = roomG.append("g").attr("id", `${room.Id}_co2`);
            
            Co2Icon = roomCo2Icon.append("svg:image")
            .attr("id", `${room.Id}_co2_icon`)
            .attr('x', room.Label.X)
            .attr('y', room.Label.Y + 55)
            .attr('width', 10)
            .attr('height', 10)
            .attr("xlink:href", "co2.png");

            Co2Text = roomG.append("text")
            .text("0 ppm")
            .attr("id", `${room.Id}_co2_text`)
            .attr("x", (parseFloat(roomTemperatureNum.attr('y')) - 5))
            .attr("y", room.Label.Y + 63)
            .attr("fill", "black")
            .attr("font-size", 8 * 0.9)
            .attr("font-family", "verdana")
            .attr("text-anchor", "middle");

            let flashSubTimerCo2 = null;
            const flashOnFlashOffCo2 = () => {
                const flashOffSecs = 0.5;
                Co2Text.attr("hidden", null);
                flashSubTimerCo2 = setTimeout(() => { /* then start timer to turn back to black */
                    Co2Text.attr("hidden", HIDDEN);
                    }, 1000 * flashOffSecs);
            }
            Co2IconFlash = new Timer(flashOnFlashOffCo2, 1000 * 1, () => {
                clearTimeout(flashSubTimerCo2); 
                Co2Text.attr("hidden", null);
            });
        }



    const roomText = roomG.append("text")
        .text(room.Name)
        .attr("x", parseFloat(calling.attr('x')))
        .attr("y", room.Label.Y)
        .attr("fill", "black")
        .attr("font-size", 8 * room.Label.Scale)
        .attr("font-weight", "bold")
        .attr("font-family", "verdana")
        .attr("text-anchor", "middle");
        
        

    const pTimer = new Timer(() => {UpdateOccupied(room.Name, {Data: false})}, 1000 * OCCUPANCY_TIMEOUT_SECS);
    pTimer.start(); /* immediately start the people-to-black timer */

    /* When engaged, this timer flashes the call button repeatedly */
    let flashSubTimer = null;
    const flashOnFlashOff = () => {
        const flashOffSecs = 0.5;
        calling.attr("hidden", null);
        flashSubTimer = setTimeout(() => { /* then start timer to turn back to black */
                calling.attr("hidden", HIDDEN);
            }, 1000 * flashOffSecs);
    }
    /* we do not start this timer automatically. It is only when the duress button is pressed */
    const bTimer = new Timer(flashOnFlashOff, 1000 * 1, () => {clearTimeout(flashSubTimer); calling.attr("hidden", null)});

    roomObj =  {
        roomId: room.Id,
        room: roomG,
        people: {
            rect: roomPeopleRect,
            textEn: roomPeopleTextEN,
            textJp: roomPeopleTextJP,
        },
        peopleTimer: pTimer,
        buttonTimer: {
            mainTimer: bTimer,
            subTimers: [flashSubTimer]
        },
        calling: calling,
        temperatureNum: roomTemperatureNum,
        humidityNum: roomHumidityNum,
        CO2: {
            Icon: Co2Icon,
            Text: Co2Text,
            FlashTimerFunc: Co2IconFlash,
        },
    };

    return roomObj;
}

function addElementToRoom(parent, id, pos, path, baseFill = "black") {
    console.log(pos);
    if (pos.Scale <= 0) {
        console.log("scale is zero");
        return d3.select("nill");
    }
    const element = parent.append("g")
    .attr("id", id)
    .attr("transform", `scale(${pos.Scale})translate(${pos.X},${pos.Y})`);

    element.append("path")
        .attr("fill", baseFill)
        .attr("d", path);

    return element;
}

class Pos {
    constructor(x, y, scale = 0.7) {
        this.X = x || 0;
        this.Y = y || 0;
        this.Scale = scale;
    }
};

class Room {
    constructor(name, roomPos, labelPos, peoplePos, roomDimensions, co2Pos) {
        this.Id =  name.toLowerCase().replace(/ /g, '_')|| "-1";
        this.Name = name || "n/a";
        this.Room = roomPos; /* the coordinates that will act as the (0,0) for the room, for the other Pos objects */
        this.Label = labelPos || new Pos();
        this.People = peoplePos || new Pos();
        this.Dimensions = roomDimensions || new Pos();
        this.CO2 = co2Pos || new Pos();
    }
}

async function LoadSVG(fname) {
    let data = await d3.xml(fname);
    svgRoot.node().append(data.documentElement);
    return 0;
}

function recieveData(reading) {

    const areaName = reading["AreaName"];//AREAIDX_2_ROOMNAME[reading["areaIndex"]];

    if(Object.keys(AREAS).indexOf(areaName) == -1) {
        return;
    }

    switch(reading["DataType"]) {
        case "24ce6d4d-ff08-46b5-ab6c-d8fdd50eea94":
            UpdateTemperature(areaName, reading);
            break;
        case "4723d025-a1f2-431c-8e75-a9ba350ceae5":
            UpdateHumidity(areaName, reading);
            break;
        case "fafd5c5c-6415-4def-83d3-986913546c67": // TODO figure out what an occupied event looks like
            UpdateOccupied(areaName, reading);
            break;
        case "7e87a819-135e-40d3-9d5f-c0330f38ec4e":
            UpdateCO2(areaName, reading)
        case "e2233655-dadc-45f0-a4f0-5ac31b3874f3":
                switch (reading.Data) {
                    case 1: // single press
                        RequestSecretary(areaName, reading);
                        break;
                    case 2: // double press
                        RequestUrgent(areaName, reading);
                        break;
                    case 0: // long press start
                        RequestDisable(areaName, reading);
                        break;
                    case 255: // long press release
                        ButtonLongRelease(areaName, reading); /* unused */
                        break;
                    }
            break;
        default:
            break;
    }
}

function getOccupiedText(occupied = false) {
    occupiedText = `${ROOM_FREE_JP} ${ROOM_FREE_EN}`;
    if (occupied) {
        occupiedText = `${ROOM_OCCUPIED_JP} ${ROOM_OCCUPIED_EN}`;
    }
    return occupiedText;
}

function UpdateTemperature(roomName, reading) {
    console.log(`${roomName}:: Temperature is ${reading.Data}C`);
    changeTemperatureIcon(roomName, reading.Data);
    const tempText = changeTemperatureText(roomName, reading.Data);
    updateEntryInTable(roomName, "temperature", tempText, reading["Timestamp"]);
}

function UpdateHumidity(roomName, reading) {
    console.log(`${roomName}:: Humidity is ${reading.Data}%`);
    changeHumidityicon(roomName, reading.Data);
    const humidText = changeHumidityText(roomName, reading.Data);
    updateEntryInTable(roomName, "humidity", humidText, reading["Timestamp"]);
}

// function UpdateCO2(roomName, reading) {
//     console.log(`${roomName}:: CO2 is ${reading.Data}%`);
//     changeHumidityicon(roomName, reading.Data);
//     const co2Text = changeCo2Text(roomName, reading.Data);
//     updateEntryInTable(roomName, "co2", co2Text, reading["Timestamp"]);
// }

function UpdateCO2(roomName, reading) {
    updateEntryInTable(roomName, "co2", reading.Data + " ppm", reading["Timestamp"]);
    console.log(`${roomName}:: CO2 update received`);
    let d = Math.ceil(reading.Data);
    if (d >= 1800) {
        /* set Warning *red* */
        if (AREAS[roomName].CO2.Icon != null) {
            AREAS[roomName].CO2.Icon.attr("fill", "red");
            AREAS[roomName].CO2.Text.attr("fill", "red");
            AREAS[roomName].CO2.FlashTimerFunc.start();
        }
    }
    else if (d >= 1200) {
        /* set Notice (yellow) */
        if (AREAS[roomName].CO2.Icon != null) {
            AREAS[roomName].CO2.Icon.attr("fill", "orange");
            AREAS[roomName].CO2.Text.attr("fill", "orange");
            AREAS[roomName].CO2.FlashTimerFunc.stop();
        }
    }
    else {
        if (AREAS[roomName].CO2.Icon != null) {
            AREAS[roomName].CO2.Icon.attr("fill", "black");
            AREAS[roomName].CO2.Text.attr("fill", "black");
            AREAS[roomName].CO2.FlashTimerFunc.stop();
        }
    }
    if(AREAS[roomName].CO2.Text != null) {
        const dtext = Number(d).toLocaleString();
        AREAS[roomName].CO2.Text.text(`${dtext} ppm`);
    }
}


function UpdateOccupied(roomName, reading) {
    console.log(`${roomName}:: occupied? ${reading.Data}`);
    if (reading.Data) {
        console.log("Reseting occupied-disable timer");
        AREAS[roomName].peopleTimer.reset();
    } else {
        AREAS[roomName].peopleTimer.stop();
    }
    updateRoomOccupiedIcon(roomName, reading.Data);
    updateEntryInTable(roomName, "occupied", getOccupiedText(reading.Data), reading["Timestamp"]);
}

function RequestSecretary(roomName, reading) {
    console.log(`${roomName}:: Secretary has been requested`);
    setRoomCall(roomName, true);
    console.log(reading.Timestamp)
    const timestring = new Date(reading.Timestamp).toLocaleString([], {hour: '2-digit', minute:'2-digit', hour12: false});
    updateEntryInTable(roomName, "calldate", timestring, reading["Timestamp"]);
}

function RequestUrgent(roomName, reading) {
    console.log(`${roomName}:: Urgent request received`);
    setRoomCallUrgent(roomName, true);
    const timestring = new Date(reading.Timestamp).toLocaleString([], {hour: '2-digit', minute:'2-digit', hour12: false});
    updateEntryInTable(roomName, "urgentcalldate", timestring, reading["Timestamp"]);
}

function RequestDisable(roomName, reading) {
    console.log(`${roomName}:: Call button is being turned off`);
    AREAS[roomName].buttonTimer.mainTimer.stop();
    setRoomCall(roomName, false);
}

function ButtonLongRelease(roomName, reading) {
    /* unused */
    // console.log(`${roomName}:: Long release received, but ignored because NYI`);
}


/* returns the old color */
function changeTemperatureIcon(roomName, data) {
    return; /* disabled for now -- temperature icon is null because we dont want to display that particular svg atm*/
    color = data > 23 ? "red" : "black";
    const oldColor = AREAS[roomName].temp.select("path").attr("fill");
    AREAS[roomName].temp.select("path").attr("fill", color);
    return oldColor;[]
}

function changeTemperatureText(roomName, data) {
    const s = `${data} °C`;
    AREAS[roomName].temperatureNum.text(s);
    return s;
}

function changeHumidityText(roomName, data) {
    const s = `${data} %`;
    AREAS[roomName].humidityNum.text(s);
    return s;
}

function changeCo2Text(roomName, data) {
    const s = `${data} ppm`;
    const rn = AREAS[roomName].co2Num;
    if (rn != null) {
        rn.text(s);
    }
    return s;
}

function changeHumidityicon(roomName, data) {

}

function updateRoomOccupiedIcon(roomName, occupied) {
    let color = COLOR_FREE;
    let textJp = ROOM_FREE_JP;
    let textEn = ROOM_FREE_EN;
    if (occupied) {
        color = COLOR_OCCUPIED;
        textJp = ROOM_OCCUPIED_JP;
        textEn = ROOM_OCCUPIED_EN;
    }
    AREAS[roomName].people.rect.attr("style", `fill: ${color}`);
    AREAS[roomName].people.textEn.text(textEn);
    AREAS[roomName].people.textJp.text(textJp);
}

function setRoomCall(roomName, callOn) {
    let t = AREAS[roomName].buttonTimer;
    t.mainTimer.stop();
    let visibility = HIDDEN;
    const calling = AREAS[roomName].calling;
    if (callOn) {
        calling.text(REQUEST_NORMAL);
        visibility = VISIBLE;
    }
    calling.attr("hidden", visibility);
}

function setRoomCallUrgent(roomName, callOn) {
   const timer = AREAS[roomName].buttonTimer;
   let timerF = timer.mainTimer.stop;
   let visibility = HIDDEN;
   const calling = AREAS[roomName].calling;
   if (callOn) {
       calling.text(REQUEST_URGENT);
       visibility = VISIBLE;
       timerF = timer.mainTimer.start;
   }
   timerF();
   calling.attr("hidden", visibility);
}

function updateEntryInTable(roomName, type, text, timestamp) {
    const entry = document.getElementById(`${AREAS[roomName].roomId}_td_${type}`);
    entry.innerText = text;
    /* room occupued stuff only */
    if (type === "occupied") {
        if (text.indexOf(ROOM_OCCUPIED_EN) !== -1) {
            entry.className = "unavailable";
        }
        else {
            entry.className = "available";
        }
    }
}

function showView(view) {
    if (view == "map") {
        document.getElementById("root").removeAttribute("hidden");
        document.getElementById("viewTable").setAttribute("hidden", HIDDEN);
    }
    else {
        document.getElementById("root").setAttribute("hidden", HIDDEN);
        document.getElementById("viewTable").removeAttribute("hidden");
    }
}


function assignRoomIdMap() {
    forwards = {};
    backwards = {}

    forwards["Seminar Room"] = "";
    forwards["Leo"] = "";
    forwards["Aries"] = "";
    forwards["Sagittarius"] = "";
    forwards["Capricorn"] = "";
    forwards["Taurus"] = "";
    forwards["Gemini"] = "";
    forwards["Cancer"] = "";
    forwards["Aquarius"] = "";
    forwards["Pisces"] = "";
    forwards["Libra"] = "";

    backwards[""] = "Seminar Room";
    backwards[""] = "Leo";
    backwards[""] = "Aries";
    backwards[""] = "Sagittarius";
    backwards[""] = "Capricorn";
    backwards[""] = "Taurus";
    backwards[""] = "Gemini";
    backwards[""] = "Cancer";
    backwards[""] = "Aquarius";
    backwards[""] = "Pisces";
    backwards[""] = "Libra";

    return [forwards, backwards];
}

function addRoomToTable(room) {
    /* make homegrown */
    function maketd(val, type, classNames) {

        const td = document.createElement("td");
        td.id = `${room.Id}_td_${type}`;
        td.innerText = val;

        if (classNames) {
            td.className = classNames;
        }

        // const ttDiv = document.createElement("div");
        // ttDiv.classList = "tooltip";
        // ttDiv.id = `${room.Id}_${type}_tooltip`;
        // ttDiv.innerText = val;

        // const ttSpan = document.createElement("span");
        // ttSpan.className = "tooltiptext";
        // ttSpan.id = `${room.Id}_${type}_text`;
        // ttSpan.innerText = "last known date";

        // ttDiv.append(ttSpan);

        // td.append(ttDiv);

        return td;
    }
    const tr = document.createElement("tr");
    tr.id = `${room.Id}_tr`;

    tr.append(maketd(room.Name, "name", "tableRoomName")); /* room name */
    tr.append(maketd(getOccupiedText(), "occupied", "available")); /* room occupied? */
    tr.append(maketd("0 °C", "temperature")); /* last known temperature */
    tr.append(maketd("0%", "humidity")); /* last known humidity */
    tr.append(maketd("0ppm", "co2")); /* last known CO2 reading */
    tr.append(maketd("n/a", "calldate")); /* last known call date */
    tr.append(maketd("n/a", "urgentcalldate")); /* last known urgent call date */

    document.getElementById("roomTableBody").append(tr);
}


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


async function main() {

    SVGROOT = selectRoot();
    const room2 = AddFloor();

    [AREAIDX_2_ROOMNAME, ROOMNAME_2_AREAIDX] = assignRoomIdMap();
    
    
    const rooms = [
        new Room(ROOM_NAMES[0] || "Scorpio",
            new Pos(250, -125, 1), /* room absolute position */
            new Pos(40, 0, 1), /* Label offset, relative to room offset */
        ),
        new Room(ROOM_NAMES[1] || "Leo",
            new Pos(180, -125, 1), /* room absolute position */
            new Pos(10,0, 1), /* Label offset, relative to room offset */
        ), 
        new Room(ROOM_NAMES[2] || "Aries",
            new Pos(112, -125, 1), /* room absolute position */
            new Pos(10, 0, 1), /* Label offset, relative to room offset */
        ),
        new Room(ROOM_NAMES[3] || "Sagittarius",
            new Pos(18, -125, 1), /* room absolute position */
            new Pos(18, 0, 1), /* Label offset, relative to room offset */
            new Pos(5, 0, 0.7), /* People offset */
        ),
        new Room(ROOM_NAMES[4] || "Capricorn",
            new Pos(-76, -125, 1), /* room absolute position */
            new Pos(18, 0, 1), /* Label offset, relative to room offset */
            new Pos(5, 0, 0.7), /* People offset */
        ),
        new Room(ROOM_NAMES[5] || "Taurus",
            new Pos(-153, -125, 1), /* room absolute position */
            new Pos(5, 0, 1), /* Label offset, relative to room offset */
            new Pos(5, 0, 0.7), /* People offset */
        ),
        new Room(ROOM_NAMES[6] || "Gemini",
            new Pos(-153, -31, 1), /* room absolute position */
            new Pos(5, 0, 1), /* Label offset, relative to room offset */
            new Pos(5, 0, 0.7), /* People offset */
        ),
        new Room(ROOM_NAMES[7] || "Cancer",
            new Pos(-153, 44, 1), /* room absolute position */
            new Pos(5, 0, 1), /* Label offset, relative to room offset */
            new Pos(5, 0, 0.7), /* People offset */
        ),
        new Room(ROOM_NAMES[8] || "Aquarius",
            new Pos(-50, -31, 1), /* room absolute position */
            new Pos(10, 0, 1), /* Label offset, relative to room offset */
        ),
        new Room(ROOM_NAMES[9] || "Pisces",
            new Pos(18, -31, 1), /* room absolute position */
            new Pos(7, 0, 1), /* Label offset, relative to room offset */
            new Pos(5, 0, 0.7), /* People offset */
        ),
        new Room(ROOM_NAMES[10] || "Libra",
            new Pos(-50, 86, 1), /* room absolute position */
            new Pos(10, 0, 1), /* Label offset, relative to room offset */
        ),
    ];

    /** add CO2 data */
    rooms[1].CO2 = new Pos(10,300,0.7);
    rooms[2].CO2 = new Pos(10,300,0.7);

    rooms.forEach((x) => {
        AREAS[x.Name] = AddRoom(x)
        addRoomToTable(x);
    });

    console.log(AREAS);
    showView("map");

    LastFetchDate = new Date();
    LastFetchDate = new Date(LastFetchDate.setDate(LastFetchDate.getDate() - 1));
    fetchTimer = setInterval(FetchUpdates, FETCH_LATEST_FROM_SERVER_SECS * 1000);

    if (IS_DEMO) {
        DEMO_ENGAGE();
    }
}

main();