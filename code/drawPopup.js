function onEachFeature(feature, layer) {
  const sprengel = feature.properties.WAHLSPRENGEL_NR;

  const spr_erg = wahl_data[selectedElection][sprengel];

  if (spr_erg == undefined) {
    /*console.log(
      `Sprengel ${sprengel} auf der aktuellen Karte existiert in den Wahlergebnissen nicht.`
    );*/
    layer.bindPopup(
      `Kein Wahlergebnis zu diesem Sprengel (${sprengel}) gefunden.`,
      {
        autoPan: false,
      }
    );
    return;
  }

  let wahlberechtigte = wahlberechtigte_data[selectedElection][sprengel];
  let wahlbeteiligung = spr_erg["Gesamt"] / wahlberechtigte;
  wahlbeteiligung = Math.trunc(wahlbeteiligung * 10000) / 100;
  let gesamt = spr_erg["Gesamt"];
  let ungueltig = spr_erg["Ungültig"];
  let ungueltig_anteil = ungueltig / gesamt;
  ungueltig_anteil = Math.trunc(ungueltig_anteil * 10000) / 100;

  vgl_election = wahl_vergleich[selectedElection];
  let vgl_spr_erg = undefined;
  if (vgl_election != "none") vgl_spr_erg = wahl_data[vgl_election][sprengel];

  let vgl_wahlberechtigte = "";
  let vgl_wahlbeteiligung = "";
  let vgl_gesamt = "";
  let vgl_ungueltig = "";
  let vgl_ungueltig_anteil = "";

  if (vgl_spr_erg != undefined) {
    vgl_wahlberechtigte = createSpanSt(
      wahlberechtigte,
      wahlberechtigte_data[vgl_election][sprengel]
    );

    vgl_wahlbeteiligung_value =
      vgl_spr_erg["Gesamt"] / wahlberechtigte_data[vgl_election][sprengel];
    vgl_wahlbeteiligung_value =
      Math.trunc(vgl_wahlbeteiligung_value * 10000) / 100;
    vgl_wahlbeteiligung = createSpanSt(
      wahlbeteiligung,
      vgl_wahlbeteiligung_value
    );

    vgl_gesamt = createSpanSt(gesamt, vgl_spr_erg["Gesamt"]);
  } else {
    vgl_wahlberechtigte = createSpanSt(1, undefined);
    vgl_wahlbeteiligung = createSpanSt(1, undefined);
    vgl_gesamt = createSpanSt(1, undefined);
    vgl_ungueltig = createSpanSt(1, undefined);
    vgl_ungueltig_anteil = createSpanSt(1, undefined);
  }

  content = `<h2>Sprengel: ${sprengel}</h2>
      <table>
      <tr>
        <th>Partei</th>
        <th>Anzahl</th>
        <th>%</th>
      </tr>
      <tr>
        <td>Wahlberechtigte</td>
        <td>${wahlberechtigte} ${vgl_wahlberechtigte}</td>
        <td></td>
      </tr>
      <tr>
        <td>Wahlbeteiligung &nbsp;&nbsp;</td>
        <td>${gesamt} ${vgl_gesamt}</td>
        <td>${wahlbeteiligung} ${vgl_wahlbeteiligung}</td>
      </tr>
      <tr>
        <td>Ungültig</td>
        <td>${ungueltig} ${vgl_ungueltig}</td>
        <td>${ungueltig_anteil} ${vgl_ungueltig_anteil}</td>
      </tr>
      <tr>
        <td>&#xfeff;</td>
        <td> </td>
        <td> </td>
      </tr>
      `;

  let tooltip_erg = {};
  for (party of party_list) {
    if (party in spr_erg) {
      let party_st = spr_erg[party];
      let party_erg = spr_erg[party] / spr_erg["Gültig"];
      party_erg = Math.trunc(party_erg * 10000) / 100;

      let vgl_st = "";
      let vgl_erg = "";
      if (vgl_spr_erg != undefined) {
        vgl_st = createSpanSt(
          party_st,
          wahl_data[vgl_election][sprengel][party]
        );

        vgl_erg_val = vgl_spr_erg[party] / vgl_spr_erg["Gültig"];
        vgl_erg_val = Math.trunc(vgl_erg_val * 10000) / 100;
        vgl_erg = createSpanSt(party_erg, vgl_erg_val);
      } else {
        vgl_st = createSpanSt(1, undefined);
        vgl_erg = createSpanSt(1, undefined);
      }

      content += `
        <tr>
          <td>${namen[party]}</td>
          <td>${party_st} ${vgl_st}</td>
          <td>${party_erg} ${vgl_erg}</td>
        </tr>`;

      tooltip_erg[party] = `${party_st} / ${party_erg}%`;
    }
  }

  content += "</table>";

  layer.bindPopup(content, { autoPan: false });

  //---------------------------------------------
  //tooltip
  if (showTooltipIn != "all") {
    if (!sprengel.startsWith(showTooltipIn)) return;
  }

  const partyInput = selectParteiAuswahl.value;
  const party2 = Object.keys(namen).find((key) => namen[key] === partyInput);
  let party_result = spr_erg[party2] / spr_erg["Gesamt"];
  party_result = Math.trunc(party_result * 10000) / 100;

  let tooltipText = `<span class="tooltip-span tooltip-sprengelname">${String(
    sprengel
  )}</span><span class="tooltip-span tooltip-wahlbeteiligung">${String(
    wahlbeteiligung
  )}%</span>`;

  for (let key in tooltip_erg) {
    if (tooltip_erg.hasOwnProperty(key)) {
      tooltipText += `<span class="tooltip-span tooltip-wahlergebnis tooltip-wahlergebnis-${key}">${String(
        tooltip_erg[key]
      )}</span>`;
    }
  }

  layer.bindTooltip(tooltipText, {
    permanent: true,
    direction: "center",
    opacity: 0.8,
    className: "leaflet-tooltip-custom",
  });
}

function createSpanSt(val, vgl_val) {
  span_str = "(";
  span_classes = "infoVgl";
  diff = val - vgl_val;
  if (diff == undefined || isNaN(diff)) {
    span_str += "-";
  } else if (diff < 0) {
    span_classes += " diffneg";
    diff = diff.toFixed(2);
    diff = parseFloat(diff).toString();
    span_str += diff;
  } else {
    span_str += "+";
    span_classes += " diffpos";
    diff = diff.toFixed(2);
    diff = parseFloat(diff).toString();
    span_str += diff;
  }

  span_str += ")";

  return `<span class="${span_classes}">${span_str}</span>`;
}
