L.Google.prototype.addTo =
function(map) {
    map.addLayer(this);
    console.log(this._container);
    return this;
};
L.Google.prototype.getContainer = function() {
    return this._container;
};

$(function() {
    //var layerids = ["americanredcross.fy5019k9", "osm"];
    var layerids = (location.search.split('?')[1] || '')
        .split('/')[0]
        .split('&');
        
    var createLayer = function(layerid) {
        if (typeof layerid == 'undefined' || layerid == ""){
            // return OSM as default
            return new L.TileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png');
        }
        
        var split = layerid.split('.');
        switch(split[0]) {
            case 'bing':
                return new L.BingLayer('AjCTNNlzpfcDOc0G58A4Hzx1N0OGrO8IXpFj1TVqlPG7sUxc8LqXbClnVK9RLk4q');
            case 'google':
                return new L.Google(split[1] || 'ROADMAP');
            case 'osm':
                return new L.TileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png');
            default:
                return L.mapbox.tileLayer(layerid);
        }

    };
    
    L.mapbox.accessToken = 'pk.eyJ1Ijoicm9kZWtydWlzIiwiYSI6ImVrZFNfNlkifQ.Pm-LFhTZIDqDFQtbcKZJCg';
    
    //defining cities array
    var areas;

    //lets get the json
    $.ajax({
        type: 'GET',
        url: 'data/areas.json',
        contentType: 'application/json',
        dataType: 'json',
        timeout: 10000,
        success: function(json) {
            areas = json;
            console.log('Success');
        },
        error: function(e) {
            console.log(e);
            console.log('Error');
        }
    });
    
    var range = document.getElementById('range');

    //option for cities
    //changes location of map to selected lat/long
    $('#navigation').change(function() {
        var place = $('#navigation option:selected').text();

        $.each(areas, function(index, item) {
            if (place == item.city) {
                var latlng = L.latLng(item.lat, item.lon);
                map.setView(latlng, 14);
            //replacing the pre-tracing city mapbox layer
                console.log('the current selection is ' + place);
                // remove the current left layer from the map
                map.removeLayer(left);
                
                // Add new left layer
                left = createLayer(item.mapboxID).addTo(map);
                clip();
            }
        });

    });

    //Bisecting the map
    var hash = L.hash(map);

    var left = createLayer(layerids[0]).addTo(map);
    var right = createLayer(layerids[1]).addTo(map);

    // Remove classes Google.js adds.
    left.getContainer().className =
        left.getContainer().className.replace(/\bleaflet-top\b/,'').replace(/\bleaflet-left\b/,'');
    right.getContainer().className =
        right.getContainer().className.replace(/\bleaflet-top\b/,'').replace(/\bleaflet-left\b/,'');

    // Clip as you move map or range slider.
    function clip() {
        var nw = map.containerPointToLayerPoint([0, 0]),
            se = map.containerPointToLayerPoint(map.getSize()),
            clipX = nw.x + (se.x - nw.x) * range.value;
        left.getContainer().style.clip = 'rect(' + [nw.y, clipX, se.y, nw.x].join('px,') + 'px)';
        right.getContainer().style.clip = 'rect(' + [nw.y, se.x, se.y, clipX].join('px,') + 'px)';
    }

    range['oninput' in range ? 'oninput' : 'onchange'] = clip;
    map.on('move', clip);
});