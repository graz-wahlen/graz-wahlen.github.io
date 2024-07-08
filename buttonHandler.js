const secondRowIndex = 5; //index in const buttons where the second row starts

function drawButtons() {
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("btn-active");
  }
  if (globalMode === 0) {
    btnErsterPlatz.classList.add("btn-active");
  } else if (globalMode === 1) {
    btnZweiterPlatz.classList.add("btn-active");
  } else if (globalMode === 2) {
    btnDritterPlatz.classList.add("btn-active");
  } else if (globalMode === 3) {
    btnParteiergebnis.classList.add("btn-active");
    if (globalErgebnisStimmen === 0) {
      btnErgebnis.classList.add("btn-active");
    } else {
      btnStimmen.classList.add("btn-active");
    }

    if (globalSetting === 0) {
      btnVerlauf.classList.add("btn-active");
    } else if (globalSetting === 1) {
      btnTopX.classList.add("btn-active");
    } else if (globalSetting === 2) {
      vergleich2017.classList.add("btn-active");
    }
  } else if (globalMode === 4) {
    btnWahlbeteiligung.classList.add("btn-active");
  }

  if (globalMode != 3) {
    for (let i = secondRowIndex; i < buttons.length; i++) {
      buttons[i].classList.add("btn-disabled");
    }
  } else {
    for (let i = secondRowIndex; i < buttons.length; i++) {
      buttons[i].classList.remove("btn-disabled");
    }
  }
}

function drawSelectWahl() {
  for (election of Object.keys(wahl_data)) {
    var option = document.createElement("option");
    option.text = election;
    option.value = election;
    selectWahlAuswahl.add(option);

    if (election == "ew2004") break;
  }

  for (var i = 0; i < selectWahlAuswahl.options.length; i++) {
    if (selectWahlAuswahl.options[i].value === selectedElection) {
      selectWahlAuswahl.options[i].selected = true;
      break;
    }
  }
}

function drawSelectParty() {
  const current_party = selectParteiAuswahl.value;
  selectParteiAuswahl.innerHTML = "";
  election_party_list = getPartyList(wahl_data, selectedElection);
  election_party_list.forEach((element) => {
    var option = document.createElement("option");
    option.text = namen[element];
    option.value = element;
    selectParteiAuswahl.add(option);
    if (element == current_party) {
      selectParteiAuswahl.value = element;
    }
  });
}

function changeSelectOnKeyPress(event) {
  var currentIndex = selectWahlAuswahl.selectedIndex;
  var optionsLength = selectWahlAuswahl.options.length;
  if (event.key === "y") {
    if (currentIndex > 0) {
      selectWahlAuswahl.selectedIndex = currentIndex - 1;
    }
  } else if (event.key === "x") {
    if (currentIndex < optionsLength - 1) {
      selectWahlAuswahl.selectedIndex = currentIndex + 1;
    }
  } else {
    return;
  }

  selectedElection = selectWahlAuswahl.value;

  //duplicate code (script.js)
  reloadGeoJsonLayer();
  prepareData();
  if (showSprengelNamen) drawTooltip();
  drawSelectParty();
  drawMap();
  drawButtons();
}
