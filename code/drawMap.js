let geoJsonLayer;
let bezirkeLayer;
let layer;
let map;

function initLeaflet() {
  // Creating map options
  var mapOptions = {
    center: [47.073, 15.441],
    zoom: 12.3,
    wheelPxPerZoomLevel: 400,
    zoomSnap: 0.01,
    inertia: false,
  };

  // Creating a map object
  map = new L.map("map", mapOptions);
  map.doubleClickZoom.disable();

  // Creating a Layer object
  layer = new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");

  map.addLayer(layer);

  geoJsonLayer = new L.geoJSON(wahl_sprengelkarte[selectedElection], {
    onEachFeature: onEachFeature,
  });
  geoJsonLayer.addTo(map);

  bezirkeLayer = new L.geoJSON(bezirksgrenzen, { interactive: false });
  bezirkeLayer.addTo(map);

  /*map.on("click", function (e) {
    //var coords = e.latlng;
    //console.log("Longitude: " + coords.lng + ", Latitude: " + coords.lat);
  });*/
}

function reloadGeoJsonLayer() {
  geoJsonLayer.remove();
  geoJsonLayer = new L.geoJSON(wahl_sprengelkarte[selectedElection], {
    onEachFeature: onEachFeature,
  });
  geoJsonLayer.addTo(map);
  bezirkeLayer.bringToFront();
}

function drawMap() {
  if (globalMode <= 2) {
    geoJsonLayer.setStyle(drawResult);
  } else if (globalMode === 3) {
    geoJsonLayer.setStyle(drawParty);
  } else if (globalMode === 4) {
    geoJsonLayer.setStyle(drawWahlbeteiligung);
  }

  bezirkeLayer.setStyle(drawBezirke);

  if (hintergrund) layer.setOpacity(1);
  else layer.setOpacity(0);

  changeTooltipContent();
}

function drawBezirke(feature) {
  let lines = bezirkeLines;
  if (!bezirksGrenzenEnabled) lines = 0;
  return {
    color: lineColors[lineColorIndex],
    weight: lines,
    opacity: "1",
    fillOpacity: 0,
  };
}

//erster, zweiter, dritter Platz
function drawResult(feature) {
  const color = getResultColor(feature, globalMode + 1);
  let lines = sprengelLines;
  return {
    color: lineColors[lineColorIndex],
    weight: lines,
    opacity: "1",
    fillColor: color,
    fillOpacity: transparenzSettings[transparenzIndex],
  };
}

//Parteiergebnis
function drawParty(feature) {
  const party = selectParteiAuswahl.value;
  //const party = Object.keys(namen).find((key) => namen[key] === partyInput);

  //console.log(partyInput, party);
  let color;
  if (globalSetting === 0) {
    color = getPartyColor(feature, party);
  } else if (globalSetting === 2) {
    color = getVergleichColor(feature, party);
  } else {
    color = getTopXColor(feature, party, selectedElection);
  }

  let lines = sprengelLines;
  return {
    color: lineColors[lineColorIndex],
    weight: lines,
    opacity: "1",
    fillColor: color,
    fillOpacity: transparenzSettings[transparenzIndex],
  };
}

function drawWahlbeteiligung(feature) {
  const color = getWahlbeteiligungColor(feature);
  let lines = sprengelLines;
  return {
    color: lineColors[lineColorIndex],
    weight: lines,
    opacity: "1",
    fillColor: color,
    fillOpacity: transparenzSettings[transparenzIndex],
  };
}

function drawTooltip() {
  var styleSheet = document.styleSheets[0];
  if (showSprengelNamen) {
    showSprengelNamen = false;
    styleSheet.insertRule(
      ".leaflet-tooltip-custom { display: none; }",
      styleSheet.cssRules.length
    );
  } else {
    showSprengelNamen = true;
    for (var i = 0; i < styleSheet.cssRules.length; i++) {
      if (
        styleSheet.cssRules[i].cssText.includes(
          ".leaflet-tooltip-custom { display: none; }"
        )
      ) {
        styleSheet.deleteRule(i);
        break;
      }
    }
    /*var currentZoom = map.getZoom();
    map.setZoom(currentZoom + 0.01);
    setTimeout(function () {
      map.setZoom(currentZoom);
    }, 300);*/
  }
}

function reloadTooltip() {
  /*var styleSheet = document.styleSheets[0];
  if (!showSprengelNamen) {
    styleSheet.insertRule(
      ".leaflet-tooltip-custom { display: none; }",
      styleSheet.cssRules.length
    );
  } else {
    for (var i = 0; i < styleSheet.cssRules.length; i++) {
      if (
        styleSheet.cssRules[i].cssText.includes(
          ".leaflet-tooltip-custom { display: none; }"
        )
      ) {
        styleSheet.deleteRule(i);
        break;
      }
    }*/
  /*var currentZoom = map.getZoom();
  map.setZoom(currentZoom + 0.01);
  setTimeout(function () {
    map.setZoom(currentZoom);
  }, 300);*/
  //}
}

function changeTooltipContent() {
  const tooltips = document.querySelectorAll(".tooltip-span");

  // Hide all tooltips
  tooltips.forEach((tooltip) => {
    if (globalMode == 4) {
      if (tooltip.classList.contains("tooltip-wahlbeteiligung")) {
        tooltip.style.display = "inline";
      } else {
        tooltip.style.display = "none";
      }
    } else if (globalMode == 3 && globalSetting != 2) {
      const partyInput = selectParteiAuswahl.value;
      const party = Object.keys(namen).find((key) => namen[key] === partyInput);
      const party_class = `tooltip-wahlergebnis-${party}`;
      if (
        tooltip.classList.contains("tooltip-wahlergebnis") &&
        tooltip.classList.contains(party_class)
      ) {
        tooltip.style.display = "inline";
      } else {
        tooltip.style.display = "none";
      }
    } else {
      if (tooltip.classList.contains("tooltip-sprengelname")) {
        tooltip.style.display = "inline";
      } else {
        tooltip.style.display = "none";
      }
    }
  });
}
