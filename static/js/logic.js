//Map title layer addded
let greyscale = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

//setting url for JSON
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

//make JSON request
d3.json(url).then(function (data) {
    console.log(data);

    createFeatures(data.features);
});
//making size easier to view
function markerSize(magnitude) {
    return magnitude * 50000;
};
//creating function to choose the color of the marker based on depth returned
function chooseColor(depth) {
    if(depth<10) return '#44ce1b';
    else if (depth < 30) return '#bbdb44';
    else if (depth < 50) return '#f7e379';
    else if (depth < 70) return '#f2a134';
    else if (depth < 90) return '#e51f1f';
    else return '#8B0000';
}

function createFeatures(earthquakeData) {
//creating quake popups
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)} 
        </p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }

    //run oneachlayer for every feature
    var earthquakes = L.geoJson(earthquakeData, {
        onEachFeature: onEachFeature,

        pointToLayer: function (feature, latlng){

            //marker style
            var markers = {
                radius: markerSize(feature.properties.mag),
                fillColor: chooseColor(feature.geometry.coordinates[2]),
                fillOpacity: .33,
                color:"white",
                stroke: true,
                weight: 1
            }
            return L.circle(latlng,markers);
        }
    });

    createMap(earthquakes);
}

function createMap(earthquakes) {

    //baselayers
    var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
    var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    var baseMaps = {
        "Topo": topo,
        "Streets": street
    };

    //overlays to keep earthquake markers
    var overlayMaps = {
        Earthquakes:earthquakes
    };

    //create the map and add the street and quake layers
    var myMap = L.map("map",{
        center: [37,-95],
        zoom:2,
        layers:[street,earthquakes]
    });

    //layer control
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    //make a legend for color of circles
    var legend = L.control({position:'bottomright'});

    legend.onAdd = function(myMap){
        var div = L.DomUtil.create("div","legend");
        div.innerHTML += "<h3 style='text-align: center'>Depth in (km)</h3>";
        div.innerHTML += '<i style="background: #44ce1b"></i><span><10</span><br>';
        div.innerHTML += '<i style="background: #bbdb44"></i><span>10-30 </span><br>';
        div.innerHTML += '<i style="background: #f7e379"></i><span>30-50 </span><br>';
        div.innerHTML += '<i style="background: #f2a134"></i><span>50-70 </span><br>';
        div.innerHTML += '<i style="background: #e51f1f"></i><span>70-90 </span><br>';
        div.innerHTML += '<i style="background: #8B0000"></i><span>>90 </span><br>';
        return div;
    };

    legend.addTo(myMap);
}