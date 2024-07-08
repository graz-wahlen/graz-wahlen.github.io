function getResultColor(feature, placement) {
  const sprengel = feature.properties.WAHLSPRENGEL_NR;

  if (!(sprengel in wahl_data[selectedElection])) {
    console.log(
      `Sprengel ${sprengel} auf dieser Karte existiert bei der Wahl ${selectedElection} nicht.`
    );
    return "#ffffff";
  }

  erg = Object.entries(wahl_data[selectedElection][sprengel]);
  erg.splice(0, 3);
  erg.sort((a, b) => {
    return b[1] - a[1];
  });

  let winner = erg[placement - 1][0];
  if (erg[placement - 1][1] == erg[placement][1]) {
    winner = "default";
  }

  return farben[winner];
}
function getPartyColor(feature, party) {
  const sprengel = feature.properties.WAHLSPRENGEL_NR;
  if (!(sprengel in wahl_data[selectedElection])) {
    console.log(
      `Sprengel ${sprengel} auf dieser Karte existiert bei der Wahl ${selectedElection} nicht.`
    );
    return "#ffffff";
  }

  let spr_erg = wahl_data[selectedElection][sprengel];
  if (spr_erg[party] == -1) {
    return farben["default"];
  }

  if (spr_erg[party] == undefined) {
    return farben["default2"];
  }

  const color = farben[party];
  let colorrgb = hexToRgb(color);
  if (globalErgebnisStimmen == 0) {
    party_erg = spr_erg[party] / spr_erg["Gültig"];
    const maxRatio = wahl_party_minmax[party]["ergebnis"]["max"];
    const minRatio = wahl_party_minmax[party]["ergebnis"]["min"];
    colorrgb = ratioColorMinMax(colorrgb, party_erg, minRatio, maxRatio);
    //colorrgb = ratioColor(colorrgb, party_erg, maxRatio);
  } else {
    const maxVotes = wahl_party_minmax[party]["stimmen"]["max"];
    const minVotes = wahl_party_minmax[party]["stimmen"]["min"];
    colorrgb = ratioColorMinMax(colorrgb, spr_erg[party], minVotes, maxVotes);
    //colorrgb = ratioColor(colorrgb, spr_erg[party], maxVotes);
  }

  return rgbToHex(...colorrgb);
}

function getTopXColor(feature, party, election_name) {
  const sprengel = feature.properties.WAHLSPRENGEL_NR;
  if (!(sprengel in wahl_data[selectedElection])) {
    console.log(
      `Sprengel ${sprengel} auf dieser Karte existiert bei der Wahl ${selectedElection} nicht.`
    );
    return "#ffffff";
  }

  let topXsetting = 0.0;
  topXsetting = 1 - inputTopX.value / 100;
  topXsetting = topXsetting.toFixed(1);
  console.log(topXsetting);

  if (globalErgebnisStimmen === 0) {
    if (
      wahl_party_data[party][sprengel]["ergebnis"] >
      wahl_party_minmax[party]["ergebnis"][topXsetting]
    ) {
      return farben[party];
    } else {
      return farben["default2"];
    }
  } else if (globalErgebnisStimmen === 1) {
    if (
      wahl_party_data[party][sprengel]["stimmen"] >
      wahl_party_minmax[party]["stimmen"][topXsetting]
    ) {
      return farben[party];
    } else {
      return farben["default2"];
    }
  }
}

function getVergleichColor(feature, party) {
  const sprengel = feature.properties.WAHLSPRENGEL_NR;
  if (!(sprengel in wahl_data[selectedElection])) {
    console.log(
      `Sprengel ${sprengel} auf dieser Karte existiert bei der Wahl ${selectedElection} nicht.`
    );
    return "#ffffff";
  }
  const spr_erg = wahl_data[selectedElection][sprengel];

  vgl_election = wahl_vergleich[selectedElection];
  let vgl_spr_erg = undefined;
  if (vgl_election != "none") {
    vgl_spr_erg = wahl_data[vgl_election][sprengel];
    if (vgl_spr_erg == undefined) return farben["default"];
  } else {
    return farben["default"];
  }

  if (vgl_spr_erg[party] == undefined) {
    return farben["default"];
  }

  if (globalErgebnisStimmen === 1) {
    let max_value = wahl_party_minmax[party]["stimmen"]["max"] / 2;
    let diff = spr_erg[party] - vgl_spr_erg[party];
    console.log(max_value, diff);

    if (diff < 0) {
      diff = diff * -1;
      if (diff > max_value) diff = max_value;
      let color = "#ff0000";
      let colorrgb = hexToRgb(color);
      colorrgb = ratioColorMinMax(colorrgb, diff, 0, max_value);
      return rgbToHex(...colorrgb);
    } else {
      if (diff > max_value) diff = max_value;
      let color = "#008000";
      let colorrgb = hexToRgb(color);
      colorrgb = ratioColorMinMax(colorrgb, diff, 0, max_value);
      return rgbToHex(...colorrgb);
    }
  } else {
    let max_value = wahl_party_minmax[party]["ergebnis"]["max"] / 2;
    let party_erg = spr_erg[party] / spr_erg["Gültig"];
    let vgl_party_erg = vgl_spr_erg[party] / vgl_spr_erg["Gültig"];
    let diff = party_erg - vgl_party_erg;
    if (diff < 0) {
      diff = diff * -1;
      if (diff > max_value) diff = max_value;
      let color = "#ff0000";
      let colorrgb = hexToRgb(color);
      colorrgb = ratioColorMinMax(colorrgb, diff, 0, max_value);
      return rgbToHex(...colorrgb);
    } else {
      if (diff > max_value) diff = max_value;
      let color = "#008000";
      let colorrgb = hexToRgb(color);
      colorrgb = ratioColorMinMax(colorrgb, diff, 0, max_value);
      return rgbToHex(...colorrgb);
    }
  }
}

function getWahlbeteiligungColor(feature) {
  const sprengel = feature.properties.WAHLSPRENGEL_NR;
  if (!(sprengel in wahl_data[selectedElection])) {
    console.log(
      `Sprengel ${sprengel} auf dieser Karte existiert bei der Wahl ${selectedElection} nicht.`
    );
    return "#ffffff";
  }

  let spr_erg = wahl_data[selectedElection][sprengel];

  const wahlbeteiligung =
    spr_erg["Gesamt"] / wahlberechtigte_data[selectedElection][sprengel];

  const colorrgb = hexToRgb("#218644"); //33,134,68
  const color = ratioColorMinMax(
    colorrgb,
    wahlbeteiligung,
    wahlbeteiligung_minmax[0],
    wahlbeteiligung_minmax[1]
  );

  return rgbToHex(...color);
}

//only used for debugging
function checkSprengel() {
  sprengel_in_sprengelkarte = [];
  sprengel_in_wahldata = [];

  wahl_sprengelkarte[selectedElection].features.forEach((feature) => {
    sprengel = feature.properties.WAHLSPRENGEL_NR;
    sprengel_in_sprengelkarte.push(sprengel);
  });

  for (key of Object.keys(wahl_party_data["FPÖ"])) {
    sprengel_in_wahldata.push(key);
  }

  const onlyInList1 = sprengel_in_sprengelkarte
    .filter((element) => !sprengel_in_wahldata.includes(element))
    .sort();

  const onlyInList2 = sprengel_in_wahldata
    .filter((element) => !sprengel_in_sprengelkarte.includes(element))
    .sort();

  console.log("In Karte aber nicht in Data");
  console.log(onlyInList1);
  console.log("In Data aber nicht in Karte");
  console.log(onlyInList2);
}
