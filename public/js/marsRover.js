// queries API for images and updates the UI
document.addEventListener('DOMContentLoaded', marsRoverImages);
function marsRoverImages() {
    document.getElementById('solSubmit').addEventListener('click', function(event) {
    document.getElementById('data').style.display = 'block';
    var sol = document.getElementById('solField').value;
    var req = new XMLHttpRequest();
    var payload = {sol: null, camera:null, image:null};
    req.open("GET", "https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=" + sol + "&api_key=DEMO_KEY", true);
    req.addEventListener('load',function(){
      if(req.status >= 200 && req.status < 400){
          var response = JSON.parse(req.responseText);
          document.getElementById('sol').textContent = response.photos[0].sol;
          document.getElementById('earthDate').textContent = response.photos[0].earth_date;
          var imgs = document.getElementById('images')
          while(imgs.firstChild) {
              imgs.removeChild(imgs.firstChild);
          }
          for(image in response.photos) {
              var camera = document.createElement("div");
              camera.textContent = response.photos[image].camera.full_name;
              camera.style.paddingTop = "30px";
              document.getElementById("images").appendChild(camera);
              var br = document.createElement("br");
              document.getElementById("images").appendChild(br);
              var elem = document.createElement("img");
              elem.src = response.photos[image].img_src;
              document.getElementById("images").appendChild(elem);
              document.getElementById("images").appendChild(br);
              document.getElementById("images").appendChild(br);
          }
      } else {
        console.log("Error in network request: " + request.statusText);
      }});
    req.send(JSON.stringify(payload));
    event.preventDefault();
    });
}

// sets the solar day range for input field
document.addEventListener('DOMContentLoaded', solRange);
function solRange() {
    var req = new XMLHttpRequest();
    var payload = {};
    req.open("GET", "https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity?api_key=NC0CdKejj0Ipny4wxRgZCrEeYZ4eBgRs5gvvfjZl", true);
    req.addEventListener('load',function(){
      if(req.status >= 200 && req.status < 400){
          var response = JSON.parse(req.responseText);
          document.getElementById('solFieldLabel').textContent = "Enter a Mars solar day (1-" + response.rover.max_sol + "):";
      } else {
        console.log("Error in network request: " + request.statusText);
      }});
    req.send(JSON.stringify(payload));
    event.preventDefault();
}

// updates UI with weather data
function weatherData(response) {
  if(response.results[0]){
    document.getElementById('weather').textContent = response.results[0].atmo_opacity;
    document.getElementById('lowTemp').textContent = response.results[0].min_temp_fahrenheit + "\u00B0F";
    document.getElementById('highTemp').textContent = response.results[0].max_temp_fahrenheit + "\u00B0F";
    document.getElementById('humidity').textContent = response.results[0].abs_humidity;
    document.getElementById('pressure').textContent = response.results[0].pressure;
    document.getElementById('wind_speed').textContent = response.results[0].wind_speed;
  } else {
    document.getElementById('weather').textContent = "";
    document.getElementById('lowTemp').textContent = "";
    document.getElementById('highTemp').textContent = "";
    document.getElementById('humidity').textContent = "";
    document.getElementById('pressure').textContent = "";
    document.getElementById('wind_speed').textContent = "";
  }
}

// queries API for weather data
document.addEventListener('DOMContentLoaded', getSol);
function getSol() {
  document.getElementById('solSubmit').addEventListener('click', function(event) {
    var sol = document.getElementById('solField').value;
    var script = document.createElement('script');
    script.src = "http://marsweather.ingenology.com/v1/archive/?sol=" + sol + "&format=jsonp&callback=weatherData";
    document.getElementsByTagName('head')[0].appendChild(script);
  });
}
