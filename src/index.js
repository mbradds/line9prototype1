import * as L from "leaflet";
import * as esri from "esri-leaflet";
import * as Geocoding from "esri-leaflet-geocoder";
import { cerPalette } from "./util.js";
import "leaflet/dist/leaflet.css";
import "esri-leaflet-geocoder/dist/esri-leaflet-geocoder.css";
import "esri-leaflet-geocoder/dist/img/search.png";
// import "esri-leaflet-geocoder/dist/img/loading.gif"; // TODO: add the proper webpack loader for this file
import "leaflet/dist/images/marker-icon.png";
import "leaflet/dist/images/marker-shadow.png";
import "./main.css";

// Initialize map
function leafletBaseMap(config) {
  const map = new L.map(config.div, {
    minZoom: config.minZoom, // will apply to all maps
    maxZoom: config.maxZoom, // will apply to all maps
  }).setView(config.initZoomTo, config.initZoomLevel);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}", {
    foo: "bar",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  return map;
}

// add reset button (dont add the reset button with HTML!)
function addResetBtn(map) {
  const info = L.control({ position: "bottomleft" });
  info.onAdd = function () {
    this._div = L.DomUtil.create("div");
    this._div.innerHTML = `<button type="button" id="reset-map" class="btn btn-default btn-block btn-lg">Reset Map</button>`;
    return this._div;
  };
  info.addTo(map);
}

function resetBtnListener(map, cerPipeLayer) {
  document.getElementById("reset-map").addEventListener("click", () => {
    map.setView(cerPipeLayer.getBounds(), 6);
  });
}

function addSearchControl(map) {
  // Initialize search control
  const searchControl = Geocoding.geosearch({
    position: "topright",
    placeholder: "Enter an address or place e.g. 1 York St",
    useMapBounds: false,
    expanded: false,
    providers: [
      Geocoding.arcgisOnlineProvider({
        apikey:
          "AAPKe15c3f33c2f0463ea089d398c8e033begb778F6eXlI6IT8qkBCa0Mr4NFl6pY9DQ20s7r0J5rq-bkXVc0ssVUjfFx78w8aN",
      }),
    ],
  }).addTo(map);

  const results = L.layerGroup().addTo(map);

  searchControl.on("results", (data) => {
    results.clearLayers();
    // Jackie, start using es6 array methods instead of for loops: https://medium.com/poka-techblog/simplify-your-javascript-use-map-reduce-and-filter-bd02c593cc2d
    data.results.forEach((result) => {
      results.addLayer(L.marker(result.latlng));
    });
  });

  return searchControl;
}

// This general purpose function can be used for other pipeline maps, and will automatically zoom to the pipeline location
function addCERPipeline(map, url, popUpText) {
  const pipelineSystemCER = esri
    .featureLayer({
      url,
    })
    .addTo(map);

  pipelineSystemCER.setStyle({
    color: cerPalette.Flame,
  });

  pipelineSystemCER.bindPopup(
    `<b>${popUpText.header}</b><br>${popUpText.text}`
  );
  return pipelineSystemCER;
}

function addRefineries(map) {
  // add refinery icon
  const refineryIcon = L.icon({
    iconUrl:
      "https://hoglund.maps.arcgis.com/sharing/rest/content/items/184d90a780ad47159dab7c9a1fbcd3ac/data", // refinery icon
    iconSize: [30, 20], // size of the icon
    iconAnchor: [10, 15], // point of the icon which will correspond to marker's location
    popupAnchor: [-3, -10], // point from which the popup should open relative to the iconAnchor
  });
  // add refineries
  const refineries = esri
    .featureLayer({
      url: "https://services5.arcgis.com/EptOMJg420QIUhVN/arcgis/rest/services/Refinery/FeatureServer/0",
      minZoom: 6,
      pointToLayer(geojson, latlng) {
        return L.marker(latlng, { icon: refineryIcon });
      },
    })
    .addTo(map);
  refineries.bindPopup((layer) =>
    L.Util.template(
      "<b>{NAME_EN}</b><br> {Line9_PopUp}",
      layer.feature.properties
    )
  );
  return refineries;
}

function addLegend(map) {
  const legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "legend");
    div.innerHTML =
      "<p><b>Legend</b><br></p>" +
      '<p><a href="#"><img title="oil tanker" alt="oil tanker" src="https://hoglund.maps.arcgis.com/sharing/rest/content/items/43b69aa0b3f847e1bb68e0d8dde88972/data" width="30px"></a>&nbsp;&nbsp;&nbsp;Oil Tanker<br>' +
      '<a href="#"><img title="refinery" alt="refinery" src="https://hoglund.maps.arcgis.com/sharing/rest/content/items/184d90a780ad47159dab7c9a1fbcd3ac/data" width="30px"></a>&nbsp;&nbsp;&nbsp;Refinery<br>' +
      '<a href="#"><img title="pipeline system" alt="pipeline system" src="https://hoglund.maps.arcgis.com/sharing/rest/content/items/887024beb23b4f8c985ebff628974b06/data" width="30px"></a>&nbsp;&nbsp;&nbsp;Enbridge Line 9<br>' +
      '<a href="#"><img title="other pipelines" alt="other pipelines" src="https://hoglund.maps.arcgis.com/sharing/rest/content/items/7464de010e2b45e5a5b152d4297bbd30/data" width="30px"></a>&nbsp;&nbsp;&nbsp;Other Pipeline<br>' +
      "</p>";
    return div;
  };
  legend.addTo(map);
  return legend;
}

const map = leafletBaseMap({
  div: "map",
  initZoomTo: [44, -78],
  initZoomLevel: 6,
  minZoom: 4,
  maxZoom: 10,
});
addResetBtn(map);
addSearchControl(map);
resetBtnListener(map);
addCERPipeline(
  map,
  "https://services5.arcgis.com/vNzamREXvX2WcX6d/ArcGIS/rest/services/PIPELINE_PROFILE_LAYER_VIEW/FeatureServer/2",
  {
    header: "Line 9",
    text: "Did you know that Line 9 has been reversed twice? It originally flowed from west to east for 23 years and was reversed in 1999 and then again in 2015. It now flows from west to east again.",
  }
);
addRefineries(map);
addLegend(map);

// add aboriginal lands of Canada (NRCan) https://www.arcgis.com/home/item.html?id=8b9ff056f5144a788fc6d85f72c86c15
const indigenousLands = esri
  .featureLayer({
    url: "https://proxyinternet.nrcan.gc.ca/arcgis/rest/services/CLSS-SATC/CLSS_Administrative_Boundaries/MapServer/0",
    minZoom: 6,
  })
  .addTo(map);

indigenousLands.setStyle({
  color: cerPalette["Dim Grey"],
});

// add crude oil pipelines from EIA
const crudeOilPipelinesEIA = esri
  .featureLayer({
    url: "https://services7.arcgis.com/FGr1D95XCGALKXqM/ArcGIS/rest/services/CrudeOil_Pipelines_US_EIA/FeatureServer/0",
    where: "Pipename = 'Portland Pipeline'",
  })
  .addTo(map);

crudeOilPipelinesEIA.setStyle({
  color: cerPalette.Aubergine,
});

// add oil tanker icon
const oilTankerIcon = L.icon({
  iconUrl:
    "https://hoglund.maps.arcgis.com/sharing/rest/content/items/43b69aa0b3f847e1bb68e0d8dde88972/data", // refinery icon
  iconSize: [40, 16], // size of the icon
  iconAnchor: [10, 15], // point of the icon which will correspond to marker's location
  popupAnchor: [-3, -10], // point from which the popup should open relative to the iconAnchor
});

const oilTanker = esri
  .featureLayer({
    url: "https://services5.arcgis.com/EptOMJg420QIUhVN/arcgis/rest/services/Ships/FeatureServer/0",
    minZoom: 6,
    pointToLayer(geojson, latlng) {
      return L.marker(latlng, { icon: oilTankerIcon });
    },
  })
  .addTo(map);

// add clipped U.S. Mainline data
const usMainline = esri
  .featureLayer({
    url: "https://services5.arcgis.com/EptOMJg420QIUhVN/arcgis/rest/services/Enbridge_U_S__Mainline/FeatureServer/0",
  })
  .addTo(map);
usMainline.setStyle({
  color: cerPalette.Aubergine,
});
const flowDirectionicon = L.icon({
  iconUrl:
    "https://hoglund.maps.arcgis.com/sharing/rest/content/items/78b707a35c4247d5aaa73cac60a1d46e/data", // flow direction icon
  iconSize: [100, 70], // size of the icon
  iconAnchor: [10, 15], // point of the icon which will correspond to marker's location
  popupAnchor: [-3, -10], // point from which the popup should open relative to the iconAnchor
});

// add flow arrow
L.marker([43.7, -77], { icon: flowDirectionicon }).addTo(map);

// Create Pop Ups
indigenousLands.bindPopup((layer) =>
  L.Util.template("<b>{adminAreaNameEng}</b>", layer.feature.properties)
);
crudeOilPipelinesEIA.bindPopup((layer) =>
  L.Util.template(
    "<b>Montreal/{Pipename}</b><br>The only other oil pipeline servicing Quebec refineries is the Montreal Pipeline, but throughputs on the pipeline have been very low since 2016.",
    layer.feature.properties
  )
);

oilTanker.bindPopup(
  "<b>Oil Tankers on the Saint Lawrence river</b><br>The Valero Jean Gaulin Refinery recieves oil from oil tankers on the Saint Lawrence river. It recieves international imports coming from the North Atlantic Ocean and oil from Enbridge Line 9 shipped north from Montreal"
);
usMainline.bindPopup("<b>Enbridge U.S. Mainline</b>");
