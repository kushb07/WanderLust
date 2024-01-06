mapboxgl.accessToken = 'pk.eyJ1Ijoia3VzaC1iYWphaiIsImEiOiJjbHFneTV0ZXkxYTk5MmtvNm95emJjNGZlIn0.leoeT-6Jq5uyyYUIJZw68g';
const map = new mapboxgl.Map({
container: 'map', // container ID
style : "mapbox://styles/mapbox/streets-v12",   //dark-v11 can be used to craete dark theme in map
center: coordinates, // starting position [lng, lat]
// center: [77.1025 , 28.7041], // starting position [lng, lat]
zoom: 9,// starting zoom
attributionControl: false,
}).addControl(new mapboxgl.AttributionControl({
    customAttribution: 'kush bajaj'
    }));

console.log(process.env.MAP_TOKEN);
// console.log(coordinates);
// Create a default Marker and add it to the map.
const marker = new mapboxgl.Marker({color : "red"})
.setLngLat(coordinates)
.setPopup(new mapboxgl.Popup({offset: 10})
.setHTML(`<h4></h4><p>Exact location provided after booking</p>`)) //listing.geometry.coordinates
.addTo(map);

