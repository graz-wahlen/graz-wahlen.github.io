let globalMode = 0; //ersterplatz, zweiterplatz, dritterplatz, parteiergebnis, wahlbeteiligung 0-4
let globalErgebnisStimmen = 0; //0:ergebnis, 1:stimmen
let globalSetting = 0; //verlauf, topX, vergleich 0-4

const transparenzSettings = [1, 0.75, 0.5, 0.25, 0];
let transparenzIndex = 0;

let showSprengelNamen = true;

sprengelLines = 1; //1, screenshot 4 (130% zoom)
bezirkeLines = 4; //4, screenshot 8

const lineColors = [
  "#ffffff",
  "#000000",
  "#808080",
  "#aa0000",
  "#205ca5",
  "#51a51e",
];

let lineColorIndex = 0;

let bezirksGrenzenEnabled = true;
let hintergrund = true;

let selectedElection = "ew2024";
