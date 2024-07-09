function getPartyList(wahl_data, election_name) {
  party_names = Object.keys(wahl_data[election_name]["0101"]);
  if (election_name.startsWith("br")) {
    for (let i = 2; i <= 17; i++) {
      //andere Bezirke durchsuchen bei Bezirksratswahl
      first_sprengel = i.toString().padStart(2, "0") + "01";

      temp_data = wahl_data[election_name][first_sprengel];
      if (temp_data === undefined) continue; //seltener Fall (brgraz98), dass XX01 nicht existiert

      temp_party_names = Object.keys(temp_data);

      temp_party_names.forEach((item) => {
        if (!party_names.includes(item)) party_names.push(item);
      });
    }
  }

  no_party = ["Gesamt", "Ungültig", "Gültig"];
  party_names = party_names.filter((item) => !no_party.includes(item));

  return party_names;
}

function getPartyLists(wahl_data, election_name) {
  party_results = {};
  party_names = getPartyList(wahl_data, election_name);

  party_names.forEach((party_name) => {
    party_results[party_name] = {};
  });
  for (sprengel in wahl_data[election_name]) {
    party_names.forEach((party_name) => {
      party_results[party_name][sprengel] = {};

      //betrifft Parteien die in bestimmten Bezirken bei der BR-Wahl nicht kandidiert haben
      if (wahl_data[election_name][sprengel][party_name] === undefined) {
        party_results[party_name][sprengel]["ergebnis"] = -1;
        party_results[party_name][sprengel]["stimmen"] = -1;
      } else {
        party_results[party_name][sprengel]["ergebnis"] =
          wahl_data[election_name][sprengel][party_name] /
          wahl_data[election_name][sprengel]["Gültig"];

        party_results[party_name][sprengel]["stimmen"] =
          wahl_data[election_name][sprengel][party_name];
      }
    });
  }
  return party_results;
}

function getPartyMinmax(wahl_party_data) {
  let wahl_party_minmax = {};

  for (key of Object.keys(wahl_party_data)) {
    values_ergebnis = [];
    values_stimmen = [];
    for (sprengel of Object.keys(wahl_party_data[key])) {
      if (!isRealSprengel(sprengel)) continue;
      erg = Number(wahl_party_data[key][sprengel]["ergebnis"]);
      sti = Number(wahl_party_data[key][sprengel]["stimmen"]);
      if (erg == -1) continue;

      values_ergebnis.push(erg);
      values_stimmen.push(sti);
    }

    values_ergebnis.sort(function (a, b) {
      return a - b;
    });
    values_stimmen.sort(function (a, b) {
      return a - b;
    });

    values_ergebnis = filterOutliersIQR(values_ergebnis, 5);
    values_stimmen = filterOutliersIQR(values_stimmen, 5);

    wahl_party_minmax[key] = {};
    wahl_party_minmax[key]["ergebnis"] = {};
    wahl_party_minmax[key]["stimmen"] = {};
    wahl_party_minmax[key]["ergebnis"]["min"] = values_ergebnis[0];
    wahl_party_minmax[key]["ergebnis"]["max"] =
      values_ergebnis[values_ergebnis.length - 1];
    wahl_party_minmax[key]["stimmen"]["min"] = values_stimmen[0];
    wahl_party_minmax[key]["stimmen"]["max"] =
      values_stimmen[values_stimmen.length - 1];

    for (let i = 1; i <= 9; i += 1) {
      factor = i / 10;
      index = parseInt(values_ergebnis.length * factor - 1);

      wahl_party_minmax[key]["ergebnis"][factor] = values_ergebnis[index];
      wahl_party_minmax[key]["stimmen"][factor] = values_stimmen[index];
    }
  }
  console.log(wahl_party_minmax);
  console.log(wahl_party_data);
  return wahl_party_minmax;
}

function filterOutliersIQR(arr, value) {
  // Calculate Q1 and Q3
  const q1 = arr[Math.floor(arr.length / 4)];
  const q3 = arr[Math.floor((arr.length * 3) / 4)];
  const iqr = q3 - q1;

  // Determine the lower and upper bounds
  const lowerBound = q1 - value * iqr;
  const upperBound = q3 + value * iqr;

  if (upperBound == 0) {
    return arr;
  }

  // Filter the array
  return arr.filter((x) => x >= lowerBound && x <= upperBound);
}

function getWahlbeteiligungMinmax(
  wahlberechtigte_data,
  wahl_data,
  election_name
) {
  let max_wahlbet = 0;
  let min_wahlbet = 1;
  for (sprengel of Object.keys(wahl_data[election_name])) {
    let wahlbet =
      wahl_data[election_name][sprengel]["Gültig"] /
      wahlberechtigte_data[election_name][sprengel];
    if (wahlbet > 1) continue;

    if (wahlbet > max_wahlbet) max_wahlbet = wahlbet;
    else if (wahlbet < min_wahlbet) min_wahlbet = wahlbet;
  }
  return [min_wahlbet, max_wahlbet];
}

//color funtions
function ratioColor(colorrgb, ratio, maxRatio) {
  let relativeRatio = 1 - ratio / maxRatio;
  const diff = [255 - colorrgb[0], 255 - colorrgb[1], 255 - colorrgb[2]];

  colorrgb = [
    Math.trunc(colorrgb[0] + diff[0] * relativeRatio),
    Math.trunc(colorrgb[1] + diff[1] * relativeRatio),
    Math.trunc(colorrgb[2] + diff[2] * relativeRatio),
  ];
  return colorrgb;
}

function ratioColorMinMax(colorrgb, ratio, minRatio, maxRatio) {
  let minMaxDiff = maxRatio - minRatio;
  let ratioDiff = ratio - minRatio;
  let relativeRatio = ratioDiff / minMaxDiff;

  const diff = [255 - colorrgb[0], 255 - colorrgb[1], 255 - colorrgb[2]];

  colorrgb = [
    Math.trunc(255 - diff[0] * relativeRatio),
    Math.trunc(255 - diff[1] * relativeRatio),
    Math.trunc(255 - diff[2] * relativeRatio),
  ];
  return colorrgb;
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function getAllParties(wahl_data) {
  party_list = ["FPÖ", "ÖVP", "SPÖ", "GRÜNE", "NEOS", "KPÖ"];
  no_party = ["Gesamt", "Ungültig", "Gültig"];
  for (election of Object.keys(wahl_data)) {
    for (party of getPartyList(wahl_data, election)) {
      if (party_list.includes(party)) continue;
      party_list.push(party);
    }
  }

  return party_list;
}

function isRealSprengel(sprengel) {
  if (
    sprengel.endsWith("80") ||
    sprengel.endsWith("98") ||
    sprengel.endsWith("99")
  )
    return false;
  if (sprengel.startsWith("28") || sprengel.startsWith("29")) return false;
  return true;
}
