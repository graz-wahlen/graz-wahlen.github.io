//buttons
const btnErsterPlatz = document.querySelector(".erster-platz");
const btnZweiterPlatz = document.querySelector(".zweiter-platz");
const btnDritterPlatz = document.querySelector(".dritter-platz");
const btnParteiergebnis = document.querySelector(".parteiergebnis");
const btnWahlbeteiligung = document.querySelector(".wahlbeteiligung");
const selectWahlAuswahl = document.querySelector("#wahlauswahl");
const selectParteiAuswahl = document.querySelector("#parteiauswahl");
const btnErgebnis = document.querySelector(".ergebnis");
const btnStimmen = document.querySelector(".stimmen");
const btnVerlauf = document.querySelector(".verlauf");
const btnTopX = document.querySelector(".topX");
const inputTopX = document.querySelector("#input-topX");
const vergleich2017 = document.querySelector(".vergleich2017");
//bottom buttons
const transparenz = document.querySelector(".transparenz");
const linecolor = document.querySelector(".line-color");
const bezirksgrentenBtn = document.querySelector(".bezirke-grenzen");
const hintergrundBtn = document.querySelector(".hintergrund");
const tooltipBtn = document.querySelector(".sprengelnamen");

btnErsterPlatz.addEventListener("click", () => {
  globalMode = 0;
  drawMap();
  drawButtons();
});
btnZweiterPlatz.addEventListener("click", () => {
  globalMode = 1;
  drawMap();
  drawButtons();
});
btnDritterPlatz.addEventListener("click", () => {
  globalMode = 2;
  drawMap();
  drawButtons();
});

btnParteiergebnis.addEventListener("click", () => {
  globalMode = 3;
  drawMap();
  drawButtons();
});

btnWahlbeteiligung.addEventListener("click", () => {
  globalMode = 4;
  drawMap();
  drawButtons();
});

selectWahlAuswahl.addEventListener("change", () => {
  selectedElection = selectWahlAuswahl.value;
  reloadGeoJsonLayer();
  prepareData();
  if (showSprengelNamen) drawTooltip();
  drawSelectParty();
  drawMap();
  drawButtons();
});

document.addEventListener("keydown", function (event) {
  if (event.key === "p") {
    //takeScreenshot();
  } else {
    changeSelectOnKeyPress(event);
  }
});

selectParteiAuswahl.addEventListener("change", () => {
  globalMode = 3;
  drawMap();
  drawButtons();
});

btnErgebnis.addEventListener("click", () => {
  globalMode = 3;
  globalErgebnisStimmen = 0;
  drawMap();
  drawButtons();
});

btnStimmen.addEventListener("click", () => {
  globalMode = 3;
  globalErgebnisStimmen = 1;
  drawMap();
  drawButtons();
});

btnVerlauf.addEventListener("click", () => {
  globalMode = 3;
  globalSetting = 0;
  drawMap();
  drawButtons();
});

btnTopX.addEventListener("click", () => {
  globalMode = 3;
  globalSetting = 1;
  drawMap();
  drawButtons();
});

inputTopX.addEventListener("change", () => {
  const value = parseInt(inputTopX.value);
  if (isNaN(value)) {
    inputTopX.value = 10;
  }
  if (value % 10 != 0) {
    inputTopX.value = value - (value % 10);
  }

  if (value > 90) inputTopX.value = 90;
  if (value < 10) inputTopX.value = 10;

  drawMap();
  drawButtons();
});

vergleich2017.addEventListener("click", () => {
  globalMode = 3;
  globalSetting = 2;
  drawMap();
  drawButtons();
});

transparenz.addEventListener("click", () => {
  transparenzIndex = (transparenzIndex + 1) % transparenzSettings.length;
  drawMap();
});

linecolor.addEventListener("click", () => {
  lineColorIndex = (lineColorIndex + 1) % lineColors.length;
  drawMap();
});

bezirksgrentenBtn.addEventListener("click", () => {
  bezirksGrenzenEnabled = !bezirksGrenzenEnabled;
  drawMap();
});

hintergrundBtn.addEventListener("click", () => {
  hintergrund = !hintergrund;
  drawMap();
});

tooltipBtn.addEventListener("click", () => {
  drawTooltip();
});

const buttons = [
  btnErsterPlatz,
  btnZweiterPlatz,
  btnDritterPlatz,
  btnParteiergebnis,
  btnWahlbeteiligung,
  btnErgebnis,
  btnStimmen,
  btnVerlauf,
  btnTopX,
  vergleich2017,
];

let wahl_data; //contains all election results
let wahlberechtigte_data; //contains the number of wahlberechtigte for all elections

async function fetchData() {
  try {
    const response = await fetch("data/wahlen95_24.json");
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    wahl_data = await response.json();
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }
  try {
    const response = await fetch("data/wahlberechtigte.json");
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    wahlberechtigte_data = await response.json();
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }
}

let wahl_party_data; //contains results for one election and grouped by party
let wahl_party_minmax; //minimum and maximum values for each party in one election (ergebnis, stimmen)
let wahlbeteiligung_minmax; //minimum and maximum values for each party in one election (ergebnis, stimmen)
let party_list; //list of all parties

function prepareData() {
  wahl_party_data = getPartyLists(wahl_data, selectedElection);
  wahl_party_minmax = getPartyMinmax(wahl_party_data);
  wahlbeteiligung_minmax = getWahlbeteiligungMinmax(
    wahlberechtigte_data,
    wahl_data,
    selectedElection
  );
  party_list = getAllParties(wahl_data);
  //checkSprengel();
}

async function initAll() {
  await fetchData();
  prepareData();
  initLeaflet();
  drawMap();
  drawButtons();
  drawTooltip();
  drawSelectWahl();
  drawSelectParty();
}
initAll();
