let SVGROOT = null;
let AREAIDX_2_ROOMNAME = {};
let ROOMNAME_2_AREAIDX = {};
const AREAS = {}
const FETCH_LATEST_FROM_SERVER_SECS = 5; /* how often to retrieve non-critical data from the server (temp, humidity) */
let OCCUPANCY_TIMEOUT_SECS = 300; /* Occupancy does not report "no people", so we set a timeout to say "no people" off after no readings for some amount of seconds*/

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

const IS_DEMO = true;

function DEMO_ENGAGE() {
    /**
     * Demo enage:
     * Starts with all temperatures set to 23.5c
     * After 3 seconds, all temperatures get a random new value of +/- [0.0, 0.1, 0.2]
     * After 3 seconds: one room get Occupied
     * After 3 seconds: one room gets regular call
     * After 3 seconds: one room gets Emergency call
     */

     function SetTemperatures() {
         const temps = [0.0, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.2];
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
        const nums = [0,1,2];
        const base = 50;
        Object.keys(AREAS).forEach(key => {
            let num = nums[Math.floor(Math.random() * nums.length)];
            let final = base - num
            UpdateHumidity(key, {Data: final});
        });

        function SetOccupied() {
            UpdateOccupied("Libra", {Data: true});
        }

        function SetRegularCall() {
            RequestSecretary("Leo", {Data: true, Timestamp: new Date()});
        }

        function SetUrgentCall() {
            RequestUrgent("Scorpio", {Data: true, Timestamp: new Date()});
        }
    }

    function timerFunc() {
        SetTemperatures();
        SetHumidity();
        SetOccupied();
        SetRegularCall();
        SetUrgentCall();
    }

    setTimeout(() => timerFunc(), 3);
    
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
    const height = 300;
    const width = 659;
    const scale = 1.1;
    let root = selectRoot()
    .attr("viewBox", `0 0 ${width * scale} ${height * scale}`)
    .attr("style", "margin: 0 0 0% 7%")
    .attr("preserveAspectRatio", "none");

    let mg = root.append("g").attr("id", "room").attr("transform", "translate(470,100)");

    const p_path853= mg.append("path")
        .attr("id", "path853")
        .attr("style", "fill:#f1f1f1;stroke-width:0.26458335")
        .attr("d", "m -464.13586,207.85432 c -0.37697,-0.37698 -0.41578,-13.99429 -0.41578,-145.898823 0,-131.904532 0.0388,-145.521847 0.41578,-145.898814 0.37753,-0.377531 30.66303,-0.415774 329.25506,-0.415774 298.59203,0 328.87754,0.03824 329.25507,0.415774 0.37696,0.376967 0.41577,13.994282 0.41577,145.898814 0,131.904533 -0.0388,145.521843 -0.41577,145.898823 -0.37697,0.37698 -14.07848,0.41577 -146.824857,0.41577 -132.746382,0 -146.447883,-0.0388 -146.824861,-0.41577 -0.372507,-0.37251 -0.415766,-3.20823 -0.415766,-27.25209 v -26.83631 h -43.259376 -43.25938 v 6.10281 c 0,3.70085 -0.10779,6.30423 -0.27389,6.61458 -0.41378,0.77318 -2.24359,0.716 -2.67317,-0.0835 -0.24355,-0.4533 -0.34888,-8.80306 -0.44159,-35.00298 -0.11382,-32.168654 -0.0924,-34.437033 0.32944,-34.858858 0.42415,-0.424157 9.68988,-0.451184 154.684358,-0.451184 H 119.64837 v -15.875 -15.875001 H 10.394345 c -99.170174,0 -109.29255,-0.03854 -109.671592,-0.417587 -0.448231,-0.448228 -0.447755,3.082685 -0.01535,-109.979812 l 0.134408,-35.123439 H -215.97367 -332.78913 v 10.583334 10.583333 h 31.06964 c 27.89235,0 31.11216,0.04252 31.48542,0.415774 0.37686,0.376865 0.41577,12.781323 0.41577,132.556255 V 205.09509 h 40.21667 40.21666 v -4.87591 c 0,-5.36265 0.0959,-5.70743 1.5875,-5.70743 1.51281,0 1.5875,0.2943 1.5875,6.25401 0,5.4157 -0.14949,6.44599 -0.93535,6.44599 -0.21315,0 -0.62569,0.23813 -0.91673,0.52917 -0.52782,0.52782 -0.88193,0.52917 -138.0936,0.52917 -124.7058,0 -137.6033,-0.0389 -137.98021,-0.41577 z")

    const p_path851= mg.append("path")
        .attr("id", "path851")
        .attr("style", "fill:#e8e8e8;stroke-width:0.26458335")
        .attr("d", "m -463.96955,207.688 c -0.46298,-0.46297 -0.46298,-291.002033 0,-291.465008 0.46327,-0.463274 657.71422,-0.463274 658.17751,0 0.46296,0.462975 0.46296,291.002038 0,291.465008 -0.24617,0.24617 -33.1905,0.3175 -146.658547,0.3175 -113.468046,0 -146.412376,-0.0713 -146.658544,-0.3175 -0.242782,-0.24278 -0.3175,-6.65575 -0.3175,-27.25208 v -26.93459 h -43.523959 -43.52396 v 6.19607 c 0,3.40784 -0.0723,6.3844 -0.1606,6.61459 -0.23307,0.60737 -2.09958,0.57214 -2.35829,-0.0445 -0.10681,-0.25466 -0.25447,-15.90984 -0.32811,-34.78929 -0.10652,-27.31168 -0.066,-34.408076 0.19834,-34.726568 0.29585,-0.356494 17.21961,-0.400291 154.684173,-0.400291 H 119.91296 V 80.211748 64.072164 H 10.540131 c -91.924322,0 -109.420477,-0.05744 -109.671619,-0.36004 -0.300699,-0.36232 -0.296387,-4.938805 0.103531,-109.905068 l 0.134329,-35.25573 H -215.97367 -333.05372 v 10.847917 10.847917 h 31.16792 c 23.88893,0 31.24207,0.07415 31.48542,0.3175 0.24609,0.246097 0.3175,30.056667 0.3175,132.556254 V 205.35967 h 40.48125 40.48125 v -4.97417 c 0,-5.33905 0.0647,-5.60917 1.34345,-5.60917 1.25859,0 1.31841,0.30748 1.24158,6.38011 -0.0685,5.41359 -0.0938,5.65566 -0.60066,5.74967 -0.29104,0.054 -0.74215,0.32345 -1.0025,0.59877 -0.46313,0.48985 -3.43094,0.50062 -137.99343,0.50062 -106.60731,0 -137.59148,-0.0714 -137.83761,-0.3175 z M -272.9933,74.126331 V -56.842424 h -94.19167 -94.19167 V 74.126331 205.09509 h 94.19167 94.19167 z M 191.61504,152.04613 V 99.261748 h -45.77292 -45.77291 v 25.513392 c 0,22.84122 -0.0436,25.55694 -0.415771,25.92917 -0.369438,0.36944 -2.330291,0.41577 -17.594792,0.41577 H 64.879621 v 26.85521 26.85521 h 63.367709 63.36771 z M 44.506704,134.84821 V 99.261748 h -70.511459 -70.511459 v 35.586462 35.58646 h 70.511459 70.511459 z M 96.894205,123.60342 V 99.261748 H 72.420246 47.946288 v 24.341672 24.34166 H 72.420246 96.894205 Z M 191.61504,7.4513285 V -81.184091 H 157.21921 122.82337 V 7.4513285 96.086748 h 34.39584 34.39583 z M -30.634963,26.369037 V -8.423672 h -32.940626 -32.940625 v 34.792709 34.79271 h 32.940625 32.940626 z M 44.506704,-10.011172 V -81.184091 H 8.5233705 -27.459963 v 71.172919 71.172919 H 8.5233705 44.506704 Z m 75.141666,0 V -81.184091 H 83.665038 47.681704 v 71.172919 71.172919 h 35.983334 35.983332 z m -150.283333,-36.38021 v -34.792709 h -32.676043 -32.676042 v 34.792709 34.79271 h 32.676042 32.676043 z")

    const p_path849= mg.append("path")
        .attr("id", "path849")
        .attr("style", "fill:#dedede;stroke-width:0.26458335")
        .attr("d", "M -464.02247,61.955497 V -83.829925 H -134.8808 194.26087 V 61.955497 207.74092 H 47.549413 -99.162048 v -26.93459 c 0,-20.59634 -0.07472,-27.00929 -0.3175,-27.25208 -0.461698,-0.4617 -86.480382,-0.4617 -86.942082,0 -0.22911,0.22911 -0.3175,2.06567 -0.3175,6.59675 0,6.04689 -0.0196,6.28547 -0.52917,6.44721 -0.29104,0.0924 -0.748,0.0985 -1.0155,0.0136 -0.45614,-0.14478 -0.49715,-0.75745 -0.66106,-9.87356 -0.0961,-5.34556 -0.17491,-21.05991 -0.17513,-34.92077 V 96.615917 h 154.331465 c 119.682791,0 154.402735,-0.07128 154.648965,-0.3175 0.45855,-0.458557 0.45855,-31.714777 0,-32.173334 -0.24593,-0.24592 -24.971194,-0.3175 -109.671597,-0.3175 H -99.165249 l 0.133932,-37.504689 c 0.07366,-20.6275785 0.194416,-53.207683 0.26834,-72.400234 0.09906,-25.723434 0.05583,-34.990216 -0.164544,-35.255729 -0.416296,-0.501133 -233.572319,-0.543651 -234.073279,-0.04269 -0.45605,0.456049 -0.45605,21.133952 0,21.590001 0.24335,0.24335 7.59648,0.3175 31.48542,0.3175 h 31.16791 V 72.750497 c 0,102.499583 0.0714,132.310163 0.3175,132.556253 0.24416,0.24416 9.5838,0.3175 40.42834,0.3175 30.84454,0 40.18417,-0.0733 40.42833,-0.3175 0.22442,-0.22442 0.3175,-1.77564 0.3175,-5.29167 v -4.97416 h 1.06339 1.06341 l -0.0712,5.88351 c -0.0683,5.64536 -0.0926,5.88751 -0.60037,5.98263 -0.29104,0.0545 -0.62439,0.26442 -0.74075,0.46648 -0.18011,0.31272 -20.72236,0.36738 -138.04636,0.36738 h -137.83477 z m 191.29375,12.170834 V -57.107007 h -94.45625 -94.45625 V 74.126331 205.35967 h 94.45625 94.45625 z M 191.87962,152.04613 V 98.997165 h -46.0375 -46.037498 v 25.611665 c 0,19.56741 -0.07493,25.6866 -0.3175,25.92917 -0.240453,0.24046 -4.509664,0.3175 -17.594792,0.3175 H 64.615038 v 27.11979 27.1198 h 63.632292 63.63229 z M 44.771288,134.84821 V 98.997165 h -70.776043 -70.776043 v 35.851045 35.85104 h 70.776043 70.776043 z m 52.3875,-11.24479 V 98.997165 H 72.420246 47.681704 v 24.606255 24.60625 H 72.420246 97.158788 Z M 191.87962,7.4513285 V -81.448674 H 157.21921 122.55879 V 7.4513285 96.351331 h 34.66042 34.66041 z m -222.25,18.9177085 V -8.6882554 H -63.575589 -96.780798 V 26.369037 61.42633 h 33.205209 33.205209 z M 44.771288,-10.011172 V -81.448674 H 8.5233705 -27.724547 V -10.011172 61.42633 H 8.5233705 44.771288 Z m 75.141672,0 V -81.448674 H 83.665038 47.417121 v 71.437502 71.437502 h 36.247917 36.247922 z m -150.28334,-36.38021 v -35.057292 h -32.940626 -32.940625 v 35.057292 35.057293 h 32.940625 32.940626 z")

    const p_path847= mg.append("path")
        .attr("id", "path847")
        .attr("style", "fill:#d2d2d2;stroke-width:0.26458335")
        .attr("d", "m -463.89997,207.41019 c -0.069,-0.1819 -0.095,-65.75558 -0.0578,-145.719276 l 0.0676,-145.388547 H -134.8808 194.12858 V 61.955497 207.60863 H 47.549413 -99.029756 l -0.132292,-27.1198 -0.132291,-27.11979 h -43.656251 -43.65625 l -0.13229,6.48229 -0.13229,6.4823 h -0.92605 -0.92604 l -0.19388,-9.39271 c -0.10663,-5.16599 -0.16616,-20.82271 -0.1323,-34.79271 l 0.0616,-25.400004 154.516668,-0.132291 154.516672,-0.132292 V 80.211748 63.939872 L 10.507746,63.80758 -99.029756,63.675289 -99.100506,26.633621 c -0.048,-25.143297 0.0172,-37.211644 0.203068,-37.570835 0.185685,-0.358883 0.251037,-11.810466 0.203041,-35.586459 l -0.07078,-35.057293 H -215.97559 -333.18601 v 10.980209 10.980208 l 31.35313,0.132292 31.35312,0.132292 0.13229,132.423962 0.13229,132.423963 40.6741,0.067 40.67409,0.067 0.0717,-5.22634 0.0718,-5.22637 h 0.92604 0.92605 l 0.0714,5.6343 0.0714,5.63433 -0.77782,0.27115 c -0.42781,0.14914 -0.84318,0.44143 -0.92303,0.64955 -0.12567,0.32745 -18.66623,0.37838 -137.74515,0.37838 -109.83665,0 -137.62526,-0.0667 -137.72542,-0.33073 z M -272.59643,74.126331 v -131.36563 h -94.58854 -94.58854 l -0.0677,131.101046 c -0.0372,72.105573 -0.0111,131.250033 0.058,131.432143 0.10032,0.2644 19.17032,0.31769 94.65619,0.26459 l 94.53056,-0.0665 z M 192.01191,152.04613 V 98.864873 H 145.84212 99.67233 l -0.132291,25.796877 -0.132292,25.79687 -17.4625,0.1323 -17.462501,0.13229 -0.06818,26.9875 c -0.03749,14.84312 -0.01138,27.13657 0.05805,27.31876 0.1007,0.26432 13.00652,0.31779 63.832764,0.26458 l 63.70653,-0.0667 z M 44.903579,134.84821 V 98.864873 h -70.908334 -70.908334 l -0.06803,35.718747 c -0.03741,19.64532 -0.01138,35.8678 0.05802,36.04997 0.100595,0.26433 14.434979,0.31776 70.976359,0.26458 l 70.850311,-0.0666 z M 97.29108,123.60342 V 98.864873 H 72.420246 47.549413 l -0.06826,24.473957 c -0.03752,13.46068 -0.01138,24.6234 0.05837,24.80605 0.100595,0.2638 5.228934,0.3182 24.939097,0.26458 l 24.812466,-0.0675 z M 192.01191,7.4513285 V -81.580966 h -34.7927 -34.79271 l -0.0677,88.7677112 c -0.0373,48.8222408 -0.0111,88.9169808 0.0582,89.0994218 0.10025,0.264039 7.21204,0.318014 34.86041,0.264584 l 34.7345,-0.06713 z M -30.238088,26.369037 V -8.820547 h -33.337501 -33.3375 l -0.06803,34.925001 c -0.03744,19.208751 -0.01111,35.07429 0.05824,35.256752 0.100489,0.264012 6.9215,0.318037 33.405525,0.264583 l 33.279266,-0.06717 z M 44.903579,-10.011172 V -81.580966 H 8.5233705 -27.856838 l -0.06776,71.305211 c -0.03728,39.217865 -0.01111,71.454462 0.05818,71.636879 0.100303,0.264062 7.529565,0.317992 36.4479948,0.264583 l 36.3220002,-0.06708 z m 75.141671,0 V -81.580966 H 83.665038 47.284829 l -0.06776,71.305211 c -0.03728,39.217865 -0.01111,71.454462 0.05818,71.636879 0.100304,0.264062 7.529566,0.317992 36.447996,0.264583 l 36.322005,-0.06708 z m -150.283338,-36.38021 v -35.189584 h -33.072918 -33.072917 l -0.06802,34.925001 c -0.03744,19.208751 -0.01111,35.074292 0.05824,35.25676 0.100488,0.264006 6.868583,0.318042 33.140941,0.264583 l 33.014683,-0.06717 z")

    const p_path845= mg.append("path")
        .attr("id", "path845")
        .attr("style", "fill:#cdcdcd;stroke-width:0.26458335")
        .attr("d", "M -463.75789,61.955497 V -83.565341 H -134.8808 193.99629 V 61.955497 207.47634 H 47.549413 -98.897464 v -26.83632 c 0,-24.04386 -0.04326,-26.87957 -0.415767,-27.25208 -0.37457,-0.37458 -4.689079,-0.41577 -43.541369,-0.41577 -29.22156,0 -43.29057,0.0883 -43.63733,0.27389 -0.48414,0.25909 -0.51179,0.61652 -0.51179,6.61458 v 6.34069 h -0.75086 -0.75083 l -0.17521,-9.56826 c -0.0963,-5.26255 -0.17518,-20.85974 -0.17518,-34.66042 V 96.880498 h 154.233195 c 139.859205,0 154.271925,-0.03875 154.648965,-0.415774 0.36869,-0.368715 0.41576,-2.208297 0.41576,-16.252976 0,-14.04468 -0.0471,-15.884261 -0.41576,-16.252977 -0.37664,-0.376634 -10.70092,-0.415774 -109.671623,-0.415774 H -98.901089 L -98.767131,26.1706 c 0.07369,-20.5548184 0.194443,-53.065076 0.268341,-72.245013 0.09226,-23.939225 0.04789,-35.03421 -0.141447,-35.388024 -0.272759,-0.509625 -1.588503,-0.515404 -117.335353,-0.515404 -115.46252,0 -117.06325,0.007 -117.3334,0.511773 -0.17554,0.327997 -0.27389,4.264154 -0.27389,10.961309 0,9.146802 0.0518,10.501371 0.41577,10.865311 0.37326,0.373256 3.59307,0.415774 31.48542,0.415774 h 31.06964 V 72.820808 c 0,90.515622 0.0861,132.205432 0.27389,132.556242 0.26896,0.50255 1.0026,0.51179 40.69292,0.51179 31.08423,0 40.49234,-0.0733 40.73652,-0.3175 0.22442,-0.22442 0.3175,-1.77565 0.3175,-5.29167 v -4.97417 h 0.79375 0.79375 v 5.56281 5.56279 l -0.63576,0.24172 c -0.34965,0.13293 -0.71388,0.36812 -0.80936,0.52261 -0.12211,0.19756 -40.98652,0.28091 -137.74133,0.28091 h -137.56772 z m 191.29376,12.170834 V -57.37159 h -94.72084 -94.72083 V 74.126331 205.62425 h 94.72083 94.72084 z M 192.14421,152.04613 V 98.732582 H 145.84212 99.540039 v 25.611668 c 0,19.56741 -0.07493,25.6866 -0.3175,25.92917 -0.240454,0.24046 -4.509665,0.3175 -17.594792,0.3175 H 64.350455 v 27.38437 27.38438 h 63.896875 63.89688 z M 45.035871,134.84821 V 98.732582 h -71.040626 -71.040626 v 36.115628 36.11562 h 71.040626 71.040626 z M 97.423372,123.60342 V 98.732582 H 72.420246 47.417121 v 24.870838 24.87083 H 72.420246 97.423372 Z M 192.14421,7.4513285 V -81.713258 h -34.925 -34.925 V 7.4513285 96.615915 h 34.925 34.925 z M -30.105797,26.369037 V -8.9528387 H -63.575589 -97.045381 V 26.369037 61.690914 h 33.469792 33.469792 z M 45.035871,-10.011172 V -81.713258 H 8.5233705 -27.98913 v 71.702086 71.702086 H 8.5233705 45.035871 Z m 75.141669,0 v -71.702086 h -36.512502 -36.5125 v 71.702086 71.702086 h 36.5125 36.512502 z m -150.283337,-36.38021 v -35.321876 h -33.205209 -33.205208 v 35.321876 35.321877 h 33.205208 33.205209 z")

    const p_path843= mg.append("path")
        .attr("id", "path843")
        .attr("style", "fill:#c1c1c1;stroke-width:0.26458335")
        .attr("d", "m -463.63539,207.14561 c -0.069,-0.18191 -0.095,-65.63652 -0.0578,-145.454696 l 0.0676,-145.123964 H -134.8808 193.864 V 61.955497 207.34404 H 47.549413 -98.765173 l -0.132291,-27.11979 -0.132292,-27.11979 h -43.920834 -43.92083 l -0.1323,6.48229 -0.13229,6.48229 h -0.66146 -0.66145 l -0.19453,-9.26041 c -0.10697,-5.09323 -0.1665,-20.63089 -0.13229,-34.52813 l 0.0622,-25.26771 L -34.206868,96.880498 120.3098,96.748206 V 80.211748 63.675289 L 10.772329,63.542997 -98.765173,63.410705 -98.835922,26.501329 c -0.048,-25.0521265 0.0172,-37.079374 0.203067,-37.438543 0.185711,-0.358904 0.251037,-11.851622 0.203042,-35.718751 l -0.07078,-35.189584 h -117.474997 -117.475 v 11.244792 11.244792 l 31.35312,0.132291 31.35313,0.132292 0.13229,132.423963 0.13229,132.423959 h 40.87813 40.87812 l 0.13229,-5.15937 0.1323,-5.15938 h 0.66145 0.66146 l 0.0715,5.49011 c 0.0678,5.20713 0.0461,5.4901 -0.42201,5.4901 -0.27144,0 -0.70903,0.23813 -0.97242,0.52917 -0.47771,0.52787 -0.81492,0.52917 -137.76494,0.52917 -109.58553,0 -137.31137,-0.0667 -137.41153,-0.33073 z M -272.26543,74.418343 c 0.049,-96.878021 -0.0116,-131.432172 -0.23083,-131.696358 -0.41429,-0.499179 -188.85764,-0.539642 -189.35663,-0.04066 -0.46324,0.463243 -0.46288,262.427125 3.7e-4,262.890385 0.2465,0.24648 21.55877,0.30292 94.91928,0.25135 l 94.6014,-0.0665 z M 192.09129,205.30675 c 0.46204,-0.46204 0.46204,-106.059213 0,-106.521252 -0.4618,-0.461814 -92.03653,-0.461814 -92.498335,0 -0.24257,0.24257 -0.3175,6.361762 -0.3175,25.929172 v 25.61166 H 81.998163 c -13.085127,0 -17.354338,0.077 -17.594792,0.3175 -0.460613,0.46063 -0.460613,54.20231 0,54.66292 0.46228,0.46228 127.225639,0.46228 127.687919,0 z M 45.235261,134.9967 c 0.05334,-28.70484 0,-36.142561 -0.264583,-36.31001 -0.182431,-0.115824 -32.127323,-0.212413 -70.988662,-0.214641 -54.60717,-0.0031 -70.729106,0.06807 -70.97448,0.313449 -0.243814,0.243824 -0.3175,8.645012 -0.3175,36.203822 0,19.73748 0.07959,35.96591 0.176874,36.06319 0.09729,0.0973 32.154865,0.14689 71.239063,0.11025 l 71.06219,-0.0666 z m 52.135194,13.42463 c 0.460322,-0.46032 0.460322,-49.175504 0,-49.635832 -0.460348,-0.460343 -49.440069,-0.460343 -49.900417,0 -0.460322,0.460328 -0.460322,49.175512 0,49.635832 0.460348,0.46035 49.440069,0.46035 49.900417,0 z M 192.09129,96.562998 c 0.46262,-0.462632 0.46262,-177.760706 0,-178.223339 -0.46125,-0.461254 -69.28292,-0.461254 -69.74417,0 -0.46262,0.462633 -0.46262,177.760707 0,178.223339 0.46125,0.461254 69.28292,0.461254 69.74417,0 z M -30.158713,61.637997 c 0.461274,-0.46128 0.461274,-70.0766392 0,-70.537919 -0.461143,-0.4611556 -66.372609,-0.4611556 -66.833751,0 -0.461275,0.4612798 -0.461275,70.076639 0,70.537919 0.461142,0.461156 66.372608,0.461156 66.833751,0 z m 75.141667,0 c 0.462413,-0.462418 0.462413,-142.83592 0,-143.298338 -0.461354,-0.461353 -72.457813,-0.461353 -72.919167,0 -0.462413,0.462418 -0.462413,142.83592 0,143.298338 0.461354,0.461354 72.457813,0.461354 72.919167,0 z m 75.141666,0 c 0.46241,-0.462418 0.46241,-142.83592 0,-143.298338 -0.46135,-0.461353 -72.457812,-0.461353 -72.919166,0 -0.462412,0.462418 -0.462412,142.83592 0,143.298338 0.461354,0.461354 72.457816,0.461354 72.919166,0 z M -30.158713,-11.122422 c 0.49821,-0.498221 0.457173,-70.145538 -0.04159,-70.559472 -0.262969,-0.218251 -9.203267,-0.280033 -33.403646,-0.230834 l -33.044554,0.06718 -0.06713,35.161303 c -0.04919,25.765493 0.01244,35.257238 0.230849,35.520313 0.413755,0.498565 65.82807,0.539507 66.326069,0.04151 z")

    const p_path841= mg.append("path")
        .attr("id", "path841")
        .attr("style", "fill:#bdbdbd;stroke-width:0.26458335")
        .attr("d", "M -463.4933,61.955497 V -83.300758 h 328.6125 328.61251 V 61.955497 207.21175 H 47.549413 -98.632881 v -26.83632 c 0,-24.04386 -0.04326,-26.87956 -0.415766,-27.25207 -0.374624,-0.3746 -4.721593,-0.41578 -43.899193,-0.41578 -23.9159,0 -43.67175,0.0723 -43.90194,0.1606 -0.36581,0.14037 -0.41852,0.97347 -0.41852,6.61459 0,6.0877 -0.0276,6.45398 -0.48625,6.45398 -0.45995,0 -0.4957,-0.5259 -0.66106,-9.72344 -0.0962,-5.34789 -0.175,-20.82601 -0.17521,-34.39583 V 97.145082 h 154.233195 c 139.859205,0 154.271925,-0.03875 154.648965,-0.415775 0.36845,-0.368866 0.41537,-2.23235 0.41537,-16.517559 0,-14.28521 -0.0469,-16.148694 -0.41577,-16.51756 C 119.9143,63.317554 109.59002,63.278414 10.61932,63.278414 H -98.636532 L -98.502547,26.1706 c 0.07371,-20.4092976 0.196664,-52.883596 0.273261,-72.165107 0.07662,-19.281511 0.0744,-35.325183 -0.0048,-35.652605 l -0.14433,-0.595312 H -215.95232 c -106.96799,0 -117.58844,0.03775 -117.73455,0.418514 -0.0883,0.230183 -0.1606,5.281835 -0.1606,11.225893 0,9.472112 0.0514,10.85875 0.41578,11.223152 0.37325,0.373256 3.59306,0.415775 31.48541,0.415775 h 31.06965 l 0.004,132.225525 c 0.002,72.724035 0.0988,132.374725 0.21458,132.557105 0.16751,0.26384 8.58402,0.31787 41.2048,0.26458 l 40.99429,-0.067 0.0717,-5.22552 c 0.0687,-5.00637 0.0937,-5.22553 0.59532,-5.22553 0.50427,0 0.52358,0.19524 0.52358,5.29167 0,4.52731 -0.0573,5.29167 -0.39687,5.29167 -0.21829,0 -0.635,0.23812 -0.92605,0.52917 -0.52781,0.52781 -0.88193,0.52916 -137.71562,0.52916 h -137.1864 z m 191.28444,143.686133 c 0.18774,-0.35078 0.27389,-41.74704 0.27389,-131.611298 0,-118.828623 -0.0389,-131.138458 -0.41577,-131.515315 -0.37642,-0.376423 -9.35205,-0.415774 -94.83423,-0.415774 -85.48218,0 -94.4578,0.03935 -94.83423,0.415774 -0.37685,0.376857 -0.41577,12.695418 -0.41577,131.611314 0,118.915899 0.0389,131.234449 0.41577,131.611319 0.37643,0.37642 9.36495,0.41577 94.97611,0.41577 93.21825,0 94.56422,-0.007 94.83423,-0.51179 z m 464.46647,-0.16856 c 0.3752,-0.37521 0.41576,-5.58776 0.41576,-53.42694 0,-47.83919 -0.0406,-53.051733 -0.41576,-53.426941 -0.37479,-0.374788 -4.95036,-0.415774 -46.41549,-0.415774 -41.46513,0 -46.0407,0.04099 -46.415482,0.415774 -0.372216,0.372227 -0.415766,3.087951 -0.415766,25.929171 v 25.51339 H 81.831846 c -15.2645,0 -17.225354,0.0463 -17.594792,0.41577 -0.37256,0.37256 -0.415766,3.23056 -0.415766,27.49777 0,24.26722 0.04321,27.12522 0.415766,27.49778 0.375682,0.37565 6.549867,0.41577 64.010276,0.41577 57.46041,0 63.6346,-0.0401 64.01028,-0.41577 z M 45.247538,171.1755 c 0.243813,-0.24383 0.3175,-8.65062 0.3175,-36.22902 0,-32.29406 -0.04188,-35.9534 -0.415767,-36.327291 -0.37592,-0.375904 -7.199312,-0.415774 -71.154026,-0.415774 -63.954714,0 -70.778107,0.03987 -71.154027,0.415774 -0.373856,0.37387 -0.415766,4.015571 -0.415766,36.133021 0,24.11483 0.08898,35.88349 0.273897,36.22902 0.269743,0.50402 1.348819,0.51177 71.252293,0.51177 54.85265,0 71.050521,-0.0721 71.295896,-0.3175 z m 52.289234,-22.58786 c 0.372004,-0.372 0.415767,-3.00204 0.415767,-24.98422 0,-21.98218 -0.04376,-24.612224 -0.415767,-24.984231 -0.372057,-0.372038 -3.01408,-0.415774 -25.116526,-0.415774 -22.102445,0 -24.744468,0.04374 -25.116525,0.415774 -0.372005,0.372007 -0.415767,3.002051 -0.415767,24.984231 0,21.98218 0.04376,24.61222 0.415767,24.98422 0.372057,0.37204 3.01408,0.41578 25.116525,0.41578 22.102446,0 24.744469,-0.0437 25.116526,-0.41578 z M 192.25761,96.729307 c 0.37631,-0.376325 0.41576,-8.846934 0.41576,-89.2779785 0,-80.4310455 -0.0395,-88.9016535 -0.41576,-89.2779795 -0.37375,-0.373739 -3.91607,-0.415773 -35.0384,-0.415773 -31.12233,0 -34.66465,0.04203 -35.0384,0.415773 -0.37632,0.376326 -0.41577,8.846934 -0.41577,89.2779795 0,80.4310445 0.0395,88.9016535 0.41577,89.2779785 0.37375,0.37374 3.91607,0.415775 35.0384,0.415775 31.12233,0 34.66465,-0.04203 35.0384,-0.415775 z M -29.992396,61.804306 c 0.373777,-0.373787 0.415766,-3.952142 0.415766,-35.435269 0,-31.483126 -0.04199,-35.0614807 -0.415766,-35.4352682 -0.373566,-0.3735546 -3.78378,-0.4157742 -33.583193,-0.4157742 -29.799413,0 -33.209627,0.04222 -33.583193,0.4157742 -0.373776,0.3737875 -0.415766,3.9521422 -0.415766,35.4352682 0,31.483127 0.04199,35.061482 0.415766,35.435269 0.373566,0.373555 3.78378,0.415774 33.583193,0.415774 29.799413,0 33.209627,-0.04222 33.583193,-0.415774 z m 75.141667,0 c 0.37592,-0.375923 0.415767,-7.259434 0.415767,-71.815478 0,-64.556045 -0.03985,-71.439557 -0.415767,-71.815479 -0.373935,-0.373925 -4.060375,-0.415773 -36.6259005,-0.415773 -32.5655255,0 -36.2519655,0.04185 -36.6259005,0.415773 -0.37592,0.375922 -0.415767,7.259434 -0.415767,71.815479 0,64.556044 0.03985,71.439555 0.415767,71.815478 0.373935,0.373925 4.060375,0.415774 36.6259005,0.415774 32.5655255,0 36.2519655,-0.04185 36.6259005,-0.415774 z m 75.141669,0 c 0.37592,-0.375923 0.41577,-7.259434 0.41577,-71.815478 0,-64.556045 -0.0399,-71.439557 -0.41577,-71.815479 -0.37394,-0.373925 -4.06038,-0.415773 -36.625902,-0.415773 -32.565525,0 -36.251965,0.04185 -36.625901,0.415773 -0.37592,0.375922 -0.415766,7.259434 -0.415766,71.815479 0,64.556044 0.03985,71.439555 0.415766,71.815478 0.373936,0.373925 4.060376,0.415774 36.625901,0.415774 32.565522,0 36.251962,-0.04185 36.625902,-0.415774 z M -29.992396,-10.956113 c 0.373777,-0.373787 0.415766,-3.952142 0.415766,-35.435269 0,-31.483127 -0.04199,-35.061481 -0.415766,-35.435269 -0.373539,-0.373537 -3.772615,-0.415773 -33.460479,-0.415773 -32.399553,0 -33.050057,0.01 -33.318609,0.511772 -0.184838,0.345363 -0.273897,11.867594 -0.273897,35.435269 0,31.395856 0.04199,34.965493 0.415766,35.33927 0.373539,0.373518 3.759729,0.415774 33.318609,0.415774 29.55888,0 32.945071,-0.04226 33.31861,-0.415774 z")

        /** Reception Text */
        const g_reception = mg.append("g")
                .attr("id", "reception_g");
        const reception_tri = g_reception.append('circle')
                            .attr("r", 6)
                            .attr("cx", -260)
                            .attr("cy", 100)
                            .style("fill", "#00B140");


            const reception_text_jp = g_reception.append("text")
                .attr("id", "reception_text_jp")
                .text("受付")
                .attr("font-size", 12)
                .attr("font-family", "verdana")
                .attr("font-weight", 2)
                .attr("fill", "#00B140")
                .attr('x', -230)
                .attr('y', 100);

                const reception_text_en = g_reception.append("text")
                .attr("id", "reception_text_en")
                .text("Reception")
                .attr("font-size", 12)
                .attr("font-family", "verdana")
                .attr("font-weight", 2)
                .attr("fill", "#00B140")
                .attr('x', -250)
                .attr('y', 110);


    /** Entrance Text */
    const g_entrance = mg.append("g")
    .attr("id", "entrance_g");

    const trianglePoints = 
        g_entrance.append('polygon')
            .attr('points', "-175,170 -175,190 -190,180")
            .style('fill', '#00B140');


        const entrance_text_jp = g_entrance.append("text")
            .attr("id", "reception_text_jp")
            .text("入口")
            .attr("font-size", 12)
            .attr("font-family", "verdana")
            .attr("font-weight", 2)
            .attr("fill", "#00B140")
            .attr('x', -155)
            .attr('y', 180);

            const entrance_text_en = g_entrance.append("text")
            .attr("id", "reception_text_en")
            .text("Entrance")
            .attr("font-size", 12)
            .attr("font-family", "verdana")
            .attr("font-weight", 2)
            .attr("fill", "#00B140")
            .attr('x', -170)
            .attr('y', 190);

}

function drag() {

    function dragstarted() {
      d3.select(this).attr("stroke", "black");
    }
  
    function dragged(event, d) {
      d3.select(this).raise().attr("cx", d.x = event.x).attr("cy", d.y = event.y);
    }
  
    function dragended() {
      d3.select(this).attr("stroke", null);
    }
  
    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
  }

function AddRoom(room, adds) {
    
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
        .text("32.3 °C")
        .attr("id", `${room.Id}_temperture`)
        .attr("x", (roomPeopleX + (parseFloat(roomPeopleRect.attr('width')) / 2) + 5))
        .attr("y", roomPeopleY + 38)
        .attr("fill", "black")
        .attr("font-size", 8 * 0.9)
        // .attr("font-weight", "bold")
        .attr("font-family", "verdana")
        .attr("text-anchor", "end");

    const temperatureIcon = roomG.append("svg:image")
        .attr("id", `${room.Id}_temp_icon`)
        .attr("x", parseFloat(roomTemperatureNum.attr('x')) -40)
        .attr("y", roomPeopleY + 30)
        .attr('width', 10)
        .attr('height', 10)
        .attr("xlink:href", "temperature.png");

       


    const roomHumidityNum = roomG.append("text")
        .text("0 %")
        .attr("id", `${room.Id}_humidity`)
        .attr("x", parseFloat(roomTemperatureNum.attr('x')))
        .attr("y", parseFloat(roomTemperatureNum.attr('y')) + 10)
        .attr("fill", "black")
        .attr("font-size", 8 * 0.9)
        .attr("font-family", "verdana")
        .attr("text-anchor", "end");

    const humidityIcon = roomG.append("svg:image")
        .attr("id", `${room.Id}_hum_icon`)
        .attr("x", parseFloat(roomTemperatureNum.attr('x')) -40)
        .attr("y", parseFloat(roomTemperatureNum.attr('y')) + 2)
        .attr('width', 10)
        .attr('height', 10)
        .attr("xlink:href", "humidity.png");


    const calling = roomG.append("text")
        .text(REQUEST_NORMAL)
        .attr("id", `${room.Id}_calling`)
        .attr('x', (roomPeopleX + (parseFloat(roomPeopleRect.attr('width')) / 2)) - 10)
        .attr('y', parseFloat(roomHumidityNum.attr('y')) + 10)
        .attr("fill", "red")
        .attr("font-size", 8 * 0.7)
        .attr("font-family", "verdana")
        .attr('text-anchor', "middle")
        .attr("hidden", HIDDEN);

    const roomText = roomG.append("text")
        .text(room.Name)
        .attr("x", parseFloat(calling.attr('x')))
        .attr("y", room.Label.Y)
        .attr("fill", "black")
        .attr("font-size", 8 * room.Label.Scale)
        .attr("font-weight", "bold")
        .attr("font-family", "verdana")
        .attr("text-anchor", "middle");

    /** add Co2 */
    let Co2Icon = null;
    let Co2Text = null;
    let Co2IconFlash = null;
    if (room.CO2.X !== 0) {

        /* push calling down more */
        calling.attr("y", parseFloat(roomHumidityNum.attr('y')) + 25)

        const roomCo2Icon = roomG.append("g").attr("id", `${room.Id}_co2`);
        
        console.log(room.CO2);
        Co2Icon = roomCo2Icon.append("svg:image")
        .attr("id", `${room.Id}_co2_icon`)
        .attr('x', room.CO2.X)
        .attr('y', room.CO2.Y + 52)
        .attr('width', 10)
        .attr('height', 10)
        .attr("xlink:href", "co2.png");

        Co2Text = roomCo2Icon.append("text")
        .text("1,200 ppm")
        .attr("id", `${room.Id}_co2_text`)
        .attr("x", room.CO2.X + 15)
        .attr("y", room.CO2.Y + 60)
        .attr("fill", "black")
        .attr("font-size", 8 * 0.9)
        .attr("font-family", "verdana")
        .attr("text-anchor", "start");

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

    const areaName = reading["AreaName"];
    switch(reading["DataType"]) {
        case "Temperature":
            UpdateTemperature(areaName, reading);
            break;
        case "Humidity":
            UpdateHumidity(areaName, reading);
            break;
        case "Motion Detected": // TODO figure out what an occupied event looks like
            UpdateOccupied(areaName, reading);
            break;
        case "Button press":
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
        case "CO2":
            UpdateCo2Data(areaName, reading);
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

function UpdateOccupied(roomName, reading) {
    console.log(`${roomName}:: occupied? ${reading.Data}`);
    if (reading.Data) {
        console.log(roomName + ": Reseting occupied-disable timer");
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

function UpdateCo2Data(roomName, reading) {
    updateEntryInTable(roomName, "co2data", reading.Data, reading["Timestamp"]);
    console.log(`${roomName}:: CO2 update received`);
    let d = Math.ceil(reading.Data);
    if (d >= 1000) {
        /* set Warning *red* */
        if (AREAS[roomName].CO2.Icon != null) {
            AREAS[roomName].CO2.Icon.attr("fill", "red");
            AREAS[roomName].CO2.Text.attr("fill", "red");
            AREAS[roomName].CO2.FlashTimerFunc.start();
        }
    }
    else if (d >= 700) {
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
    let dataText = text;
    if (typeof(text) === 'number') {
        dataText = Number(text).toLocaleString();
    }
    if (type === "co2data") {
        entry.innerText = dataText + " ppm";
        if (text >= 1000) {
            entry.style = "color: red";
        }
        else if (text >= 700) {
            entry.style = "color: orange";
        }
        else {
            entry.style = "color: black";
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
        return td;
    }
    const tr = document.createElement("tr");
    tr.id = `${room.Id}_tr`;

    tr.append(maketd(room.Name, "name", "tableRoomName")); /* room name */
    tr.append(maketd(getOccupiedText(), "occupied", "available")); /* room occupied? */
    tr.append(maketd("0 °C", "temperature")); /* last known temperature */
    tr.append(maketd("0%", "humidity")); /* last known humidity */
    tr.append(maketd("-", "co2data")); /* last known CO2 update - not all rooms have this */
    tr.append(maketd("-", "calldate")); /* last known call date */
    tr.append(maketd("-", "urgentcalldate")); /* last known urgent call date */

    document.getElementById("roomTableBody").append(tr);
}


async function FetchUpdates() {
    const lrd = new Date();
    document.getElementById("lastRequestedDate").innerText = lrd;
    q =`/fetch?datefrom=${LastFetchDate.toISOString()}`;
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
    if(latestTimestamp !== "" && latestTimestamp !== undefined) {
        document.getElementById("lastDataAtDate").innerText = new Date(latestTimestamp);
    }
    LastFetchDate = lrd;
}


async function main() {

    SVGROOT = selectRoot();
    const room2 = AddFloor();
    
    const LenovoRooms = [
        new Room("Scorpio",
            new Pos(250, -125, 1), /* room absolute position */
            new Pos(40, 0, 1), /* Label offset, relative to room offset */
        ),
        new Room("Leo",
            new Pos(180, -125, 1), /* room absolute position */
            new Pos(10,0, 1), /* Label offset, relative to room offset */
        ), 
        new Room("Aries",
            new Pos(112, -125, 1), /* room absolute position */
            new Pos(10, 0, 1), /* Label offset, relative to room offset */
        ),
        new Room("Sagittarius",
            new Pos(18, -125, 1), /* room absolute position */
            new Pos(18, 0, 1), /* Label offset, relative to room offset */
            new Pos(5, 0, 0.7), /* People offset */
        ),
        new Room("Capricorn",
            new Pos(-76, -125, 1), /* room absolute position */
            new Pos(18, 0, 1), /* Label offset, relative to room offset */
            new Pos(5, 0, 0.7), /* People offset */
        ),
        new Room("Taurus",
            new Pos(-153, -125, 1), /* room absolute position */
            new Pos(5, 0, 1), /* Label offset, relative to room offset */
            new Pos(5, 0, 0.7), /* People offset */
        ),
        new Room("Gemini",
            new Pos(-153, -31, 1), /* room absolute position */
            new Pos(5, 0, 1), /* Label offset, relative to room offset */
            new Pos(5, 0, 0.7), /* People offset */
        ),
        new Room("Cancer",
            new Pos(-153, 44, 1), /* room absolute position */
            new Pos(5, 0, 1), /* Label offset, relative to room offset */
            new Pos(5, 0, 0.7), /* People offset */
        ),
        new Room("Aquarius",
            new Pos(-50, -31, 1), /* room absolute position */
            new Pos(10, 0, 1), /* Label offset, relative to room offset */
        ),
        new Room("Pisces",
            new Pos(18, -31, 1), /* room absolute position */
            new Pos(7, 0, 1), /* Label offset, relative to room offset */
            new Pos(5, 0, 0.7), /* People offset */
        ),
        new Room("Libra",
            new Pos(-50, 86, 1), /* room absolute position */
            new Pos(10, 0, 1), /* Label offset, relative to room offset */
        ),
    ];

    const IFLabRooms = [
        new Room("IFLab",
            new Pos(-250, -75, 1), /* room absolute position */
            new Pos(40, 0, 1), /* Label offset, relative to room offset */
            new Pos(), /* People offset */
            new Pos(), /* dimensions */
            new Pos(40, 2, 0,7), /* CO2 */
        ),
        new Room("Seminar",
            new Pos(-400, -50, 1), /* room absolute position */
            new Pos(10,0, 1), /* Label offset, relative to room offset */
            new Pos(), /* People offset */
            new Pos(), /* dimensions */
            new Pos(10, 2, 0,7), /* CO2 */
        ), 
        new Room("Oceania",
            new Pos(-95, -75, 1), /* room absolute position */
            new Pos(10, 0, 1), /* Label offset, relative to room offset */
            new Pos(), /* People offset */
            new Pos(), /* dimensions */
            new Pos(10, 1, 0,7), /* CO2 */
        ),
        new Room("Japan",
            new Pos(-110, 0, 1), /* room absolute position */
            new Pos(18, 0, 1), /* Label offset, relative to room offset */
            new Pos(5, 0, 0.7), /* People offset */
            new Pos(), /* dimensions */
            new Pos(23, 0, 0,7), /* CO2 */
        ),
        new Room("Africa",
            new Pos(-40, -75, 1), /* room absolute position */
            new Pos(18, 0, 1), /* Label offset, relative to room offset */
            new Pos(5, 0, 0.7), /* People offset */
            new Pos(), /* dimensions */
            new Pos(23, 2, 0,7), /* CO2 */
        ),
        new Room("NAmerica",
            new Pos(125, -75, 1), /* room absolute position */
            new Pos(5, 0, 1), /* Label offset, relative to room offset */
            new Pos(5, 0, 0.7), /* People offset */
            new Pos(), /* dimensions */
            new Pos(10, 2, 0,7), /* CO2 */
        ),
        new Room("SAmerica",
            new Pos(50, -75, 1), /* room absolute position */
            new Pos(5, 0, 1), /* Label offset, relative to room offset */
            new Pos(5, 0, 0.7), /* People offset */
            new Pos(), /* dimensions */
            new Pos(10, 2, 0,7), /* CO2 */
        ),
        new Room("Europe",
            new Pos(50, 105, 0.65), /* room absolute position */
            new Pos(5, 0, 1), /* Label offset, relative to room offset */
            new Pos(5, 0, 0.7), /* People offset */
            new Pos(), /* dimensions */
            new Pos(10, 0, 0,7), /* CO2 */
        ),
        new Room("Asia",
            new Pos(-60, 105, 1), /* room absolute position */
            new Pos(10, 0, 1), /* Label offset, relative to room offset */
            new Pos(), /* People offset */
            new Pos(), /* dimensions */
            new Pos(10, 2, 0,7), /* CO2 */
        ),
        new Room("Pangea",
            new Pos(110, 105, 1), /* room absolute position */
            new Pos(7, 0, 1), /* Label offset, relative to room offset */
            new Pos(5, 0, 0.7), /* People offset */
            new Pos(), /* dimensions */
            new Pos(12, 2, 0,7), /* CO2 */
        ),
    ];

    const rooms = IFLabRooms;

    /** add CO2 data */
    // for (let i = 0; i < rooms.length; i++) {
    //     rooms[i].CO2 = new Pos(rooms[i].Label.X, rooms[i].Label.Y, 0,7);
    // }
    /* Adjust individual rooms */
    // rooms[1].CO2 = new Pos(10,300,0.7);
    // rooms[2].CO2 = new Pos(10,300,0.7);

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