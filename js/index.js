window.onload = function myFunction() {
    /**
     * Load the map as soon as the application loads
     */ 
    let mapOptions = {
        center: new google.maps.LatLng(37.09, -95.7129),
        zoom: 4,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    let map = new google.maps.Map(document.getElementById("map"), mapOptions);
    let flightPath = new google.maps.Polyline({});

    /**
     * Class for location
     */
    let location = function(lat, lng) {
        this.lat = parseFloat(lat);
        this.lng = parseFloat(lng);
    } 
    let source = new location(null, null) 
    let destination = new location(null, null);
    
    /**
     *  Load the information of airports and keep in memory for auto-complete
     *  Avoids multiple server requests 
     */
    let loadedData = [];
    
    function loadData() {
        let promiseObj = new Promise((resolve, reject) => {
            let xobj = new XMLHttpRequest();
            xobj.overrideMimeType("application/json");
            xobj.open('GET', 'data.json', true); 
            xobj.send();
            xobj.onreadystatechange = function() {
                if(xobj.readyState == 4 && xobj.status == "200") {
                    resolve(xobj.response);
                } else if(xobj.status != "200"){
                    reject(null);     
                }
            };
        });
        return promiseObj;
    }

    loadData().then((data) => {
        if(data) {
            loadedData = JSON.parse(data);
        }
    });

    /**
     * Add even listeners for input fields
     */

    let sourceInput = document.getElementById("source");
    let destinationInput = document.getElementById("destination");
    let autoOutputSource = document.getElementById('displaySource');
    let autoOutputDestination = document.getElementById('displayDestination');

    autoOutputSource.addEventListener('click', function(e){
        handleAirportSelection(e, sourceInput, autoOutputSource, source);
    });

    function handleAirportSelection(e, inputField, autoDropdown, locationType) {
        if(e.target && e.target.nodeName == "LI") {
            inputField.value = e.target.innerHTML;
            autoDropdown.innerHTML = '';
            locationType.lat = parseFloat(e.target.getAttribute('lat'));
            locationType.lng = parseFloat(e.target.getAttribute('lng')); 
        }
        return;
    }
        
    
    sourceInput.addEventListener('input', function(event) {
        handleAutoComplete(event, autoOutputSource);
    });

      destinationInput.addEventListener('input', function(event) { 
        handleAutoComplete(event, autoOutputDestination);
    });

    autoOutputDestination.addEventListener('click', function(e){
        handleAirportSelection(e, destinationInput, autoOutputDestination, destination);
    });

  

    function handleAutoComplete(event, outputContainer) {
        if(event.target.value.length < 3) {
            outputContainer.innerHTML = '';
            return;
        }
        let data = loadedData.filter(val => val["search"].indexOf(event.target.value.toLowerCase()) !== -1);
        data.forEach(val => {
            console.log(val["name"]);
            let node = document.createElement("li");
            node.className = "list-group-item text-justify";
            let textNode = document.createTextNode(val["name"] + ',' + val["city"] + ',' + val["state"] );
            node.appendChild(textNode);
            node.setAttribute('lat', val["lat"]);
            node.setAttribute('lng', val["lng"]);
            outputContainer.appendChild(node);
        });
    }

    document.getElementById("calculate").addEventListener('click', function(){
        if(isNaN(source.lat)|| isNaN(source.lng) || isNaN(destination.lat) || isNaN(destination.lng)) {
            alert("Provide both source and destination");
            return;
        }
        flightPath.setMap(null);
        document.getElementById('distanceValue').innerHTML = calculateNauticalMiles(source,destination);
          flightPath = new google.maps.Polyline({
          path: [source,destination],
          geodesic: true,
          strokeColor: '#000000',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });
        flightPath.setMap(map);
    });

    /**
     * Calculate the distance in nautical miles given 
     * a source and destination
     */
    function calculateNauticalMiles(source, dest){
        lat1 = source.lat;
        lat2 = dest.lat;
        lng1 = source.lng;
        lng2 = destination.lng;
        if(lat1=== lat2 && lng1 === lng2) {
            return 0;
        }
        var radlat1 = Math.PI * lat1/180;
        var radlat2 = Math.PI * lat2/180;
        var radlng1 = Math.PI * lng1/180;
        var radlng2 = Math.PI * lng2/180;
        var theta = lng1-lng2;
        var radtheta = Math.PI * theta/180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        dist = dist * 0.8684;
        return dist;
    }
}