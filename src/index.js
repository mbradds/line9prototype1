import "./main.css";

console.log("starting new project!");
const cerPalette = {
  "Night Sky": "#054169",
  Sun: "#FFBE4B",
  Ocean: "#5FBEE6",
  Forest: "#559B37",
  Flame: "#FF821E",
  Aubergine: "#871455",
  "Dim Grey": "#8c8c96",
  "Cool Grey": "#42464B",
  hcBlue: "#7cb5ec",
  hcGreen: "#90ed7d",
  hcPink: "#f15c80",
  hcRed: "#f45b5b",
  hcAqua: "#2b908f",
  hcPurple: "#8085e9",
  hcLightBlue: "#91e8e1",
};

const featureColors = {
  Wetland: cerPalette["Ocean"],
  "Traditional Land Use Site": cerPalette["hcPurple"],
  "Heritage Resources Site": cerPalette["Aubergine"],
  "Paleontological Feature": cerPalette["hcPink"],
  // add other colors here
};
// Initialize map
var map = L.map("map", { center: [44, -78], zoom: 6 });

// add basemap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}", {
  foo: "bar",
  attribution:
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// add aboriginal lands of Canada (NRCan) https://www.arcgis.com/home/item.html?id=8b9ff056f5144a788fc6d85f72c86c15
var indigenousLands = L.esri.featureLayer({
  url: 'https://proxyinternet.nrcan.gc.ca/arcgis/rest/services/CLSS-SATC/CLSS_Administrative_Boundaries/MapServer/0'
}).addTo(map);

indigenousLands.setStyle({
  color: '#8c8c96'
})

var crudeOilPipelinesEIA = L.esri.featureLayer({
  url:'https://services7.arcgis.com/FGr1D95XCGALKXqM/ArcGIS/rest/services/CrudeOil_Pipelines_US_EIA/FeatureServer/0'
}).addTo(map);

crudeOilPipelinesEIA.setStyle({
  color: '#871455'
})

// Reset Button working on this
function resetMap() {
  this.circles.eachLayer((layer) => {
    layer.setStyle({ fillOpacity: 0.7 });
  });
  this.reZoom();
}

// Create Pop Up
indigenousLands.bindPopup(function (layer) {
  return L.Util.template('<b>{adminAreaNameEng}</b>', layer.feature.properties);
});
crudeOilPipelinesEIA.bindPopup(function (layer) {
  return L.Util.template('<b>{Pipename}, {Opername}</b>', layer.feature.properties);
});
