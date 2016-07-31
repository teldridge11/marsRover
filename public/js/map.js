var mapTypes = {};

// elevation map
mapTypes['mars_elevation'] = {
  getTileUrl: function(coord, zoom) {
    return getHorizontallyRepeatingTileUrl(coord, zoom, function(coord, zoom) {
      return getMarsTileUrl("http://mw1.google.com/mw-planetary/mars/elevation/", coord, zoom);
    });
  },
  tileSize: new google.maps.Size(256, 256),
  isPng: false,
  maxZoom: 20,
  radius: 3396200,
  name: 'Mars Elevation',
  credit: 'Image Credit: NASA/JPL/GSFC'
};

// visible map
mapTypes['mars_visible'] = {
  getTileUrl: function(coord, zoom) {
    return getHorizontallyRepeatingTileUrl(coord, zoom, function(coord, zoom) {
      return getMarsTileUrl("http://mw1.google.com/mw-planetary/mars/visible/", coord, zoom);
    });
  },
  tileSize: new google.maps.Size(256, 256),
  isPng: false,
  maxZoom: 20,
  radius: 3396200,
  name: 'Mars Visible',
  credit: 'Image Credit: NASA/JPL/ASU/MSSS'
};

// infrared map
mapTypes['mars_infrared'] = {
  getTileUrl: function(coord, zoom) {
    return getHorizontallyRepeatingTileUrl(coord, zoom, function(coord, zoom) {
      return getMarsTileUrl("http://mw1.google.com/mw-planetary/mars/infrared/", coord, zoom);
    });
  },
  tileSize: new google.maps.Size(256, 256),
  isPng: false,
  maxZoom: 20,
  radius: 3396200,
  name: 'Mars Infrared',
  credit: 'Image Credit: NASA/JPL/ASU'
};

// Normalizes the tile URL so that tiles repeat across the x axis (horizontally) like the
// standard Google map tiles.
function getHorizontallyRepeatingTileUrl(coord, zoom, urlfunc) {
  var y = coord.y;
  var x = coord.x;

  // tile range in one direction range is dependent on zoom level
  // 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
  var tileRange = 1 << zoom;

  // don't repeat across y-axis (vertically)
  if (y < 0 || y >= tileRange) {
    return null;
  }

  // repeat across x-axis
  if (x < 0 || x >= tileRange) {
    x = (x % tileRange + tileRange) % tileRange;
  }

  return urlfunc({x:x,y:y}, zoom)
}

function getMarsTileUrl(baseUrl, coord, zoom) {
  var bound = Math.pow(2, zoom);
  var x = coord.x;
  var y = coord.y;
  var quads = ['t'];

  for (var z = 0; z < zoom; z++) {
    bound = bound / 2;
    if (y < bound) {
      if (x < bound) {
        quads.push('q');
      } else {
        quads.push('r');
        x -= bound;
      }
    } else {
      if (x < bound) {
        quads.push('t');
        y -= bound;
      } else {
        quads.push('s');
        x -= bound;
        y -= bound;
      }
    }
  }

  return baseUrl + quads.join('') + ".jpg";
}

var map;
var mapTypeIds = [];

// Setup a copyright/credit line, emulating the standard Google style
var creditNode = document.createElement('div');
creditNode.id = 'credit-control';
creditNode.style.fontSize = '11px';
creditNode.style.fontFamily = 'Arial, sans-serif';
creditNode.style.margin = '0 2px 2px 0';
creditNode.style.whitespace = 'nowrap';
creditNode.index = 0;

function setCredit(credit) {
  creditNode.innerHTML = credit + ' -';
}

function initialize() {

  // push all mapType keys in to a mapTypeId array to set in the mapTypeControlOptions
  for (var key in mapTypes) {
    mapTypeIds.push(key);
  }

  var mapOptions = {
    zoom: 2,
    scrollwheel: false,
    center: new google.maps.LatLng(0, 0),
    mapTypeControlOptions: {
      mapTypeIds: mapTypeIds,
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR
    }
  };
  map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

  // push the credit/copyright custom control
  map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(creditNode);

  // add the new map types to map.mapTypes
  for (key in mapTypes) {
    map.mapTypes.set(key, new google.maps.ImageMapType(mapTypes[key]));
  }

  // handle maptypeid_changed event to set the credit line
  google.maps.event.addListener(map, 'maptypeid_changed', function() {
    setCredit(mapTypes[map.getMapTypeId()].credit);
  });

  // start with the moon map type
  map.setMapTypeId('mars_visible');

  // mark pin on map based on sol input
  document.getElementById('solSubmit').addEventListener('click', function(event) {
  var sol = document.getElementById('solField').value;
  var x = new XMLHttpRequest();
  x.open("GET", "http://mars.jpl.nasa.gov/msl-raw-images/locations.xml", true);
  x.onreadystatechange = function () {
      if (x.readyState == 4 && x.status == 200) {
          var doc = x.responseXML;
          var total = doc.getElementsByTagName("startSol");
          for (var i=0, max = total.length; i<max; i++) {
              if(doc.getElementsByTagName("startSol")[i].childNodes[0].nodeValue.replace(/^0+/, '') == sol) {
                  var lat = doc.getElementsByTagName("lat")[i].childNodes[0].nodeValue;
                  var gLat = Math.round(1000*lat)/1000;
                  var lng = doc.getElementsByTagName("lon")[i].childNodes[0].nodeValue;
                  var gLng = Math.round(1000*lng)/1000;
                  var latLng = {lat: gLat, lng: gLng};
                  var marker = new google.maps.Marker({
                      position: latLng,
                      map: map,
                      title: 'Mars Rover Location'
                  });
                  map.setZoom(8);
                  map.panTo(marker.position);
              }
              i++;
          }
      }
  };
  x.send(null);
  event.preventDefault();
  });
}
