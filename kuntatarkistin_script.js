/*
  MIKKOKALEVIN KUNTATARKISTIN
  Versio 25.0 - UI-uudistus ja teemanvalitsin
*/

// --- ELEMENTTIEN HAKU ---
const haeSijaintiNappi = document.getElementById('haeSijainti');
const tulosAlue = document.getElementById('tulos-alue');
const karttaContainer = document.getElementById('kartta-container');
const koordinaatitInput = document.getElementById('koordinaatit-input');
const naytaKoordinaatitNappi = document.getElementById('naytaKoordinaatit');
const karttaTyyli = document.getElementById('kartta-tyyli');
const tyhjennaPisteetNappi = document.getElementById('tyhjenna-pisteet');
const etaisyysTulos = document.getElementById('etaisyys-tulos');
const historiaLista = document.getElementById('historia-lista');
const tyhjennaHistoriaNappi = document.getElementById('tyhjenna-historia');
const tilaHakuNappi = document.getElementById('tila-haku');
const tilaEtaisyysNappi = document.getElementById('tila-etaisyys');
const etaisyysLaatikko = document.getElementById('etaisyys-laatikko');
const keskitaNappi = document.getElementById('keskitaNappi');
const lokiLista = document.getElementById('loki-lista');
const tyhjennaLokiNappi = document.getElementById('tyhjenna-loki');
const tehtavaInput = document.getElementById('tehtava-input');
const lisaaTehtavaNappi = document.getElementById('lisaa-tehtava-nappi');
const tehtavaListaElem = document.getElementById('tehtava-lista');
const teemaValitsin = document.getElementById('teema-valitsin');
const valilehtiContainer = document.querySelector('.valilehdet');
const valilehtiPaneelit = document.querySelectorAll('.valilehti-paneeli');

let map;
let marker;
let currentTileLayer;
let etaisyysPisteet = [];
let etaisyysMarkerit = [];
let etaisyysViiva;
let sijaintiHistoria = [];
let kuntaloki = [];
let tehtavaLista = [];
let kayttoTila = 'haku';
let viimeisinGpsSijainti = null;
let viimeisinTulosData = null;

const MAX_ETAISYYS_PISTEET = 30;

// Ladataan tallennetut tiedot
const tallennettuHistoria = localStorage.getItem('mk_kuntatarkistin_historia');
if (tallennettuHistoria) sijaintiHistoria = JSON.parse(tallennettuHistoria);

const tallennettuLoki = localStorage.getItem('mk_kuntatarkistin_loki');
if (tallennettuLoki) kuntaloki = JSON.parse(tallennettuLoki);

const tallennettuTehtavalista = localStorage.getItem('mk_kuntatarkistin_tehtavalista');
if (tallennettuTehtavalista) tehtavaLista = JSON.parse(tallennettuTehtavalista);

// --- TAPAHTUMANKUUNTELIJAT ---
document.addEventListener('DOMContentLoaded', () => {
    // Asetetaan teema ja karttatyyli ennen muiden alustusta
    asetaTallennettuTeema();
    const tallennettuTyyli = localStorage.getItem('mk_kuntatarkistin_karttatyyli');
    if (tallennettuTyyli) karttaTyyli.value = tallennettuTyyli;
    
    initMap();
    paivitaHistoria();
    paivitaLoki();
    naytaTehtavalista();
    lueURLJaAsetaSijainti();
});

// Lisätään kaikki kuuntelijat
haeSijaintiNappi.addEventListener('click', haeGPSsijainti);
naytaKoordinaatitNappi.addEventListener('click', haeManuaalisesti);
karttaTyyli.addEventListener('change', vaihdaKarttaTyyli);
teemaValitsin.addEventListener('change', vaihdaTeema);
tyhjennaPisteetNappi.addEventListener('click', tyhjennaEtaisyysPisteet);
tyhjennaHistoriaNappi.addEventListener('click', tyhjennaHistoria);
tyhjennaLokiNappi.addEventListener('click', tyhjennaLoki);
tilaHakuNappi.addEventListener('click', () => vaihdaKayttoTila('haku'));
tilaEtaisyysNappi.addEventListener('click', () => vaihdaKayttoTila('etaisyys'));
lisaaTehtavaNappi.addEventListener('click', lisaaUusiTehtava);
tehtavaInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') lisaaUusiTehtava(); });

let nappiaKasitelty = false;
const handleKeskitys = (e) => {
    if (nappiaKasitelty) return;
    nappiaKasitelty = true;
    e.preventDefault();
    keskitäKartta();
    setTimeout(() => { nappiaKasitelty = false; }, 300);
};
keskitaNappi.addEventListener('mousedown', handleKeskitys);
keskitaNappi.addEventListener('touchstart', handleKeskitys);

valilehtiContainer.addEventListener('click', (e) => {
    const klikattuNappi = e.target.closest('.valilehti-nappi');
    if (!klikattuNappi) return;
    const kohde = klikattuNappi.dataset.valilehti;
    valilehtiContainer.querySelectorAll('.valilehti-nappi').forEach(nappi => nappi.classList.remove('aktiivinen'));
    valilehtiPaneelit.forEach(paneeli => paneeli.classList.remove('aktiivinen'));
    klikattuNappi.classList.add('aktiivinen');
    document.getElementById(kohde).classList.add('aktiivinen');
    if (kohde === 'etaisyys') { setTimeout(() => map.invalidateSize(), 1); }
});

// --- TEEMANVAIHTO ---
function vaihdaTeema(event) {
    const teema = event.target.value;
    document.body.dataset.theme = teema;
    localStorage.setItem('mk_kuntatarkistin_teema', teema);
}
function asetaTallennettuTeema() {
    const tallennettuTeema = localStorage.getItem('mk_kuntatarkistin_teema') || 'sinertava';
    document.body.dataset.theme = tallennettuTeema;
    teemaValitsin.value = tallennettuTeema;
}


// ... loput funktioista ...
function setButtonsDisabled(disabled) {haeSijaintiNappi.disabled = disabled;naytaKoordinaatitNappi.disabled = disabled;}
function naytaViesti(viesti, tyyppi = 'info') {const div = document.createElement('div');div.className = tyyppi === 'error' ? 'virhe-viesti' : 'onnistui-viesti';div.textContent = viesti;document.body.appendChild(div);setTimeout(() => div.remove(), 4000);}
function initMap() {map = L.map('kartta-container').setView([60.98, 25.66], 10);vaihdaKarttaTyyli();map.on('click', onMapClick);}
function vaihdaKarttaTyyli() {if (currentTileLayer) map.removeLayer(currentTileLayer);const tyyli = karttaTyyli.value;let uusiTaso;switch(tyyli) {case 'cartodb': uusiTaso = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap contributors &copy; CARTO' }); break;case 'satellite': uusiTaso = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles &copy; Esri' }); break;case 'terrain': uusiTaso = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { attribution: 'Map data: &copy; OpenStreetMap, &copy; OpenTopoMap' }); break;default: uusiTaso = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' });}currentTileLayer = uusiTaso.addTo(map);localStorage.setItem('mk_kuntatarkistin_karttatyyli', tyyli);}
function parseCoordinates(input) {input = input.trim();const ddmRegex = /([ns])\s*(\d{1,3})[°\s]+([\d.]+)'?[\s,]*([ew])\s*(\d{1,3})[°\s]+([\d.]+)'?/i;const ddmMatch = input.match(ddmRegex);if (ddmMatch) {let lat_deg = parseFloat(ddmMatch[2]), lat_min = parseFloat(ddmMatch[3]), lat = lat_deg + lat_min / 60;if (ddmMatch[1].toUpperCase() === 'S') lat = -lat;let lon_deg = parseFloat(ddmMatch[5]), lon_min = parseFloat(ddmMatch[6]), lon = lon_deg + lon_min / 60;if (ddmMatch[4].toUpperCase() === 'W') lon = -lon;return { lat, lon };} else {const parts = input.split(/[,;\s]/).filter(Boolean);if (parts.length === 2) {const lat = parseFloat(parts[0]), lon = parseFloat(parts[1]);if (!isNaN(lat) && !isNaN(lon)) return { lat, lon };}}return null;}
function formatCoordinatesToDDM(lat, lon) {const formatPart = (value, hemi1, hemi2) => {const hemisphere = value >= 0 ? hemi1 : hemi2;const absValue = Math.abs(value);const degrees = Math.floor(absValue);const minutes = (absValue - degrees) * 60;const paddedDegrees = (hemi1 === 'E') ? degrees.toString().padStart(3, '0') : degrees;return `${hemisphere} ${paddedDegrees}° ${minutes.toFixed(3)}'`;};return `${formatPart(lat, 'N', 'S')} ${formatPart(lon, 'E', 'W')}`;}
function luoKopioiNappi(teksti) {const nappi = document.createElement('button');nappi.className = 'kopioi-nappi';nappi.textContent = 'Kopioi';nappi.onclick = () => {navigator.clipboard.writeText(teksti).then(() => naytaViesti('Kopioitu leikepöydälle!', 'success'), () => naytaViesti('Kopiointi epäonnistui', 'error'));};return nappi;}
function laskeKahdenPisteenEtaisyys(lat1, lon1, lat2, lon2) {const R = 6371;const dLat = (lat2 - lat1) * Math.PI / 180;const dLon = (lon2 - lon1) * Math.PI / 180;const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));return R * c;}
function paivitaEtaisyysPolkuJaTulos() {if (etaisyysViiva) map.removeLayer(etaisyysViiva);let kokonaisEtaisyys = 0;let segmenttiHtml = '';for (let i = 1; i < etaisyysPisteet.length; i++) {const [lat1, lon1] = etaisyysPisteet[i-1];const [lat2, lon2] = etaisyysPisteet[i];const segmentinEtaisyys = laskeKahdenPisteenEtaisyys(lat1, lon1, lat2, lon2);kokonaisEtaisyys += segmentinEtaisyys;segmenttiHtml += `<p class="segmentti-rivi">Piste ${i} &rarr; ${i + 1}: <strong>${segmentinEtaisyys.toFixed(2)} km</strong></p>`;}if (etaisyysPisteet.length > 1) {etaisyysViiva = L.polyline(etaisyysPisteet, {color: 'red', weight: 3}).addTo(map);}document.getElementById('etaisyys-pisteet').innerHTML = `<p>Pisteitä asetettu: ${etaisyysPisteet.length}/${MAX_ETAISYYS_PISTEET}</p>`;etaisyysTulos.innerHTML = kokonaisEtaisyys > 0 ? `<div class="etaisyys-tulos"><p><strong>Kokonaisetäisyys: ${kokonaisEtaisyys.toFixed(2)} km</strong></p><hr style="border-color: #90EE9044; border-style: dashed; margin: 8px 0;">${segmenttiHtml}</div>` : '';}
function lisaaEtaisyyspiste(lat, lon) {if (etaisyysPisteet.length >= MAX_ETAISYYS_PISTEET) {naytaViesti(`Maksimimäärä (${MAX_ETAISYYS_PISTEET}) pisteitä saavutettu.`, 'error');return;}const pisteIndex = etaisyysPisteet.length;etaisyysPisteet.push([lat, lon]);const uusiMarker = L.marker([lat, lon], {draggable: true,icon: L.divIcon({ className: 'etaisyys-marker', html: `<div style="background: red; color: white; border-radius: 50%; width: 20px; height: 20px; text-align: center; line-height: 20px; font-weight: bold;">${pisteIndex + 1}</div>`, iconSize: [20, 20] })}).addTo(map).on('dragend', function(event) {const newPosition = event.target.getLatLng();etaisyysPisteet[pisteIndex] = [newPosition.lat, newPosition.lng];paivitaEtaisyysPolkuJaTulos();});etaisyysMarkerit.push(uusiMarker);paivitaEtaisyysPolkuJaTulos();}
function lisaaHistoriaan(kunta, koordinaatit, tyyppi) {const uusiSijainti = { kunta, koordinaatit, tyyppi, aika: new Date().toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' }) };sijaintiHistoria.unshift(uusiSijainti);if (sijaintiHistoria.length > 5) sijaintiHistoria.pop();localStorage.setItem('mk_kuntatarkistin_historia', JSON.stringify(sijaintiHistoria));paivitaHistoria();}
function paivitaHistoria() {historiaLista.innerHTML = sijaintiHistoria.length === 0 ? '<p>Ei vielä haettuja sijainteja</p>' : sijaintiHistoria.map((item, index) => `<div class="historia-item" onclick="siirryHistoriaSijaintiin(${index})"><strong>${item.kunta}</strong><br>${item.koordinaatit} - ${item.tyyppi} (${item.aika})</div>`).join('');}
window.siirryHistoriaSijaintiin = function(index) {const sijainti = sijaintiHistoria[index];const coords = parseCoordinates(sijainti.koordinaatit);if (coords) {map.setView([coords.lat, coords.lon], 13);paivitaSijaintitiedot(coords.lat, coords.lon, sijainti.tyyppi);}}
function tyhjennaHistoria() {sijaintiHistoria = [];localStorage.removeItem('mk_kuntatarkistin_historia');paivitaHistoria();naytaViesti('Historia tyhjennetty');}
function tyhjennaEtaisyysPisteet() {etaisyysPisteet = [];etaisyysMarkerit.forEach(m => map.removeLayer(m));etaisyysMarkerit = [];if (etaisyysViiva) map.removeLayer(etaisyysViiva);etaisyysTulos.innerHTML = '';document.getElementById('etaisyys-pisteet').innerHTML = '<p>Klikkaa karttaa lisätäksesi reittipisteitä.</p>';}
function vaihdaKayttoTila(uusiTila) {kayttoTila = uusiTila;if (uusiTila === 'haku') {tilaHakuNappi.classList.add('aktiivinen-tila');tilaEtaisyysNappi.classList.remove('aktiivinen-tila');etaisyysLaatikko.style.display = 'none';} else {tilaHakuNappi.classList.remove('aktiivinen-tila');tilaEtaisyysNappi.classList.add('aktiivinen-tila');etaisyysLaatikko.style.display = 'block';}}
function haeGPSsijainti() {if (!("geolocation" in navigator)) return naytaViesti('GPS ei ole käytettävissä', 'error');setButtonsDisabled(true);tulosAlue.innerHTML = '<div class="lataus-spinner"></div><p style="text-align: center;">Haetaan GPS-sijaintia...</p>';navigator.geolocation.getCurrentPosition(onGPSSuccess, onGPSError, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });}
function haeManuaalisesti() {const coords = parseCoordinates(koordinaatitInput.value);if (coords) {map.setView([coords.lat, coords.lon], 14);paivitaSijaintitiedot(coords.lat, coords.lon, "Manuaalinen haku");} else {naytaViesti("Koordinaattien muoto on virheellinen", 'error');}}
function onGPSSuccess(position) {const { latitude: lat, longitude: lon } = position.coords;viimeisinGpsSijainti = [lat, lon];keskitaNappi.style.display = 'block';map.setView([lat, lon], 15);paivitaSijaintitiedot(lat, lon, "Oma sijainti");}
function onMapClick(e) {const { lat, lng: lon } = e.latlng;if (kayttoTila === 'etaisyys') {lisaaEtaisyyspiste(lat, lon);} else {paivitaSijaintitiedot(lat, lon, "Klikattu sijainti");}}
function keskitäKartta() {if (viimeisinGpsSijainti) {map.setView(viimeisinGpsSijainti, 15);naytaViesti("Kartta keskitetty omaan sijaintiin!");} else {naytaViesti("Omaa sijaintia ei ole vielä haettu.", "error");}}
async function paivitaSijaintitiedot(lat, lon, paikanNimi) {setButtonsDisabled(true);tulosAlue.innerHTML = '<div class="lataus-spinner"></div><p style="text-align: center;">Haetaan sijaintitietoja...</p>';if (marker) marker.setLatLng([lat, lon]);else marker = L.marker([lat, lon]).addTo(map);const koordinaatitDDM = formatCoordinatesToDDM(lat, lon);marker.bindPopup(`<b>${paikanNimi}</b><br>${koordinaatitDDM}`).openPopup();const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&accept-language=fi`;try {const response = await fetch(nominatimUrl, { headers: { 'User-Agent': 'MikkokalevinKuntatarkistin/1.0' } });if (!response.ok) throw new Error(`Osoitehaku epäonnistui (status: ${response.status})`);const data = await response.json();const address = data.address;let paatinimi = 'Kuntaa ei löytynyt';if (data.display_name) {paatinimi = data.display_name.split(',')[0].trim();} else {paatinimi = address.municipality || address.town || address.village || address.city || 'Kuntaa ei löytynyt';}
viimeisinTulosData = { kunta: paatinimi, koordinaatit: koordinaatitDDM };const tie = address?.road;const postinumero = address?.postcode;const maa = address?.country || 'Ei saatavilla';const kokoNimi = data?.display_name || 'Ei lisätietoja saatavilla';let htmlOutput = `<p class="kunta-iso">${paatinimi}</p>`;htmlOutput += `<div class="koordinaatti-rivi"><strong>Koordinaatit (DDM):</strong> ${koordinaatitDDM}</div>`;if (tie) htmlOutput += `<p><strong>Katu:</strong> ${tie}</p>`;if (postinumero) htmlOutput += `<p><strong>Postinumero:</strong> ${postinumero}</p>`;htmlOutput += `<p><strong>Maa:</strong> ${maa}</p>`;htmlOutput += `<hr style="border-color: #90EE9044; border-style: dashed;"><p><strong>Tarkka sijainti:</strong> ${kokoNimi}</p>`;tulosAlue.innerHTML = htmlOutput;const tallennaNappi = document.createElement('button');tallennaNappi.textContent = 'Tallenna kuntalokiin';tallennaNappi.className = 'nappi nappi-keltainen tallenna-loki-nappi';tallennaNappi.onclick = tallennaViimeisinTulosLokiin;tulosAlue.appendChild(tallennaNappi);const koordinaattiRivi = tulosAlue.querySelector('.koordinaatti-rivi');if (koordinaattiRivi) koordinaattiRivi.appendChild(luoKopioiNappi(koordinaatitDDM));lisaaHistoriaan(paatinimi, koordinaatitDDM, paikanNimi);updateURL(lat, lon, map.getZoom());} catch (error) {console.error("Virhe haettaessa tietoja:", error);const virheviesti = `<p style="text-align: center; color: #FFB3B3;">Hups, virhe haettaessa tietoja.<br><small>${error.message}</small></p>`;tulosAlue.innerHTML = virheviesti;naytaViesti(error.message, 'error');} finally {setButtonsDisabled(false);}}
function tallennaViimeisinTulosLokiin() {if (viimeisinTulosData) {tallennaLokiin(viimeisinTulosData.kunta, viimeisinTulosData.koordinaatit);} else {naytaViesti("Ei tallennettavaa sijaintia.", "error");}}
function tallennaLokiin(kunta, koordinaatit) {const muistiinpano = prompt("Lisää muistiinpano (esim. GC-koodi) tai jätä tyhjäksi:", "");if (muistiinpano === null) return; const uusiMerkinta = { kunta, koordinaatit, muistiinpano, aika: new Date() };kuntaloki.unshift(uusiMerkinta);localStorage.setItem('mk_kuntatarkistin_loki', JSON.stringify(kuntaloki));paivitaLoki();naytaViesti(`${kunta} tallennettu lokiin!`, 'success');}
function paivitaLoki() {if (kuntaloki.length === 0) {lokiLista.innerHTML = '<p>Lokisi on tyhjä.</p>';return;}
lokiLista.innerHTML = kuntaloki.map((item, index) => {const pvm = new Date(item.aika).toLocaleDateString('fi-FI');return `<div class="loki-item"><div class="loki-item-header"><strong>${item.kunta}</strong><div class="loki-item-actions"><button class="loki-nappi" title="Muokkaa muistiinpanoa" onclick="muokkaaLokimerkintaa(${index})">✏️</button><button class="loki-nappi" title="Poista merkintä" onclick="poistaLokimerkinta(${index})">🗑️</button></div></div><div class="loki-tiedot">${pvm} - ${item.koordinaatit}</div>${item.muistiinpano ? `<div class="loki-muistiinpano">${item.muistiinpano}</div>` : ''}</div>`;}).join('');}
window.muokkaaLokimerkintaa = function(index) {const nykyinenMuistiinpano = kuntaloki[index].muistiinpano || "";const uusiMuistiinpano = prompt("Muokkaa muistiinpanoa:", nykyinenMuistiinpano);if (uusiMuistiinpano !== null) {kuntaloki[index].muistiinpano = uusiMuistiinpano;localStorage.setItem('mk_kuntatarkistin_loki', JSON.stringify(kuntaloki));paivitaLoki();naytaViesti("Muistiinpano päivitetty!");}};
window.poistaLokimerkinta = function(index) {const kunta = kuntaloki[index].kunta;if (confirm(`Haluatko varmasti poistaa lokimerkinnän kunnalle ${kunta}?`)) {kuntaloki.splice(index, 1);localStorage.setItem('mk_kuntatarkistin_loki', JSON.stringify(kuntaloki));paivitaLoki();naytaViesti("Merkintä poistettu.");}};
function tyhjennaLoki() {if (kuntaloki.length === 0) {naytaViesti("Loki on jo tyhjä.");return;}if (confirm("Haluatko varmasti tyhjentää koko kuntalokin? Toimintoa ei voi perua.")) {kuntaloki = [];localStorage.removeItem('mk_kuntatarkistin_loki');paivitaLoki();naytaViesti('Kuntaloki tyhjennetty.');}}
function lisaaUusiTehtava() {const nimi = tehtavaInput.value.trim();if (nimi === "") {naytaViesti("Kirjoita kunnan nimi.", "error");return;}tehtavaLista.push({ nimi: nimi, kayty: false });tallennaJaPaivitaTehtavalista();tehtavaInput.value = "";tehtavaInput.focus();}
function naytaTehtavalista() {if (tehtavaLista.length === 0) {tehtavaListaElem.innerHTML = '<p>Listasi on tyhjä.</p>';return;}
tehtavaLista.sort((a, b) => {if (a.kayty !== b.kayty) {return a.kayty ? 1 : -1;}return a.nimi.localeCompare(b.nimi);});tehtavaListaElem.innerHTML = tehtavaLista.map((item, index) => {return `<div class="tehtava-item ${item.kayty ? 'kayty' : ''}"><input type="checkbox" onchange="vaihdaTehtavanTila(${index})" ${item.kayty ? 'checked' : ''} title="Merkitse käydyksi"><span>${item.nimi}</span><div class="loki-item-actions"><button class="loki-nappi" title="Muokkaa nimeä" onclick="muokkaaTehtavaa(${index})">✏️</button><button class="loki-nappi" title="Poista tehtävä" onclick="poistaTehtava(${index})">🗑️</button></div></div>`;}).join('');}
function tallennaJaPaivitaTehtavalista() {localStorage.setItem('mk_kuntatarkistin_tehtavalista', JSON.stringify(tehtavaLista));naytaTehtavalista();}
window.vaihdaTehtavanTila = function(index) {tehtavaLista[index].kayty = !tehtavaLista[index].kayty;tallennaJaPaivitaTehtavalista();};
window.muokkaaTehtavaa = function(index) {const nykyinenNimi = tehtavaLista[index].nimi;const uusiNimi = prompt("Muokkaa kunnan nimeä:", nykyinenNimi);if (uusiNimi && uusiNimi.trim() !== "") {tehtavaLista[index].nimi = uusiNimi.trim();tallennaJaPaivitaTehtavalista();}};
window.poistaTehtava = function(index) {const nimi = tehtavaLista[index].nimi;if (confirm(`Haluatko varmasti poistaa kohteen "${nimi}" listalta?`)) {tehtavaLista.splice(index, 1);tallennaJaPaivitaTehtavalista();}};
function onGPSError(error) {let virheViesti = 'Tapahtui tuntematon virhe.';switch (error.code) {case error.PERMISSION_DENIED: virheViesti = 'Et antanut lupaa sijainnin käyttöön.'; break;case error.POSITION_UNAVAILABLE: virheViesti = 'Sijaintitieto ei ole saatavilla.'; break;case error.TIMEOUT: virheViesti = 'Sijainnin haku kesti liian kauan.'; break;}tulosAlue.innerHTML = `<p>${virheViesti}</p>`;naytaViesti(virheViesti, 'error');setButtonsDisabled(false);}
function updateURL(lat, lon, zoom) {const ddmCoords = formatCoordinatesToDDM(lat, lon);const hash = `#${encodeURIComponent(ddmCoords)}/${zoom}`;if (history.replaceState) {history.replaceState(null, null, hash);} else {window.location.hash = hash;}}
function lueURLJaAsetaSijainti() {if (window.location.hash) {try {const hash = decodeURIComponent(window.location.hash.substring(1));const parts = hash.split('/');if (parts.length === 2) {const coordsString = parts[0];const zoom = parseInt(parts[1], 10);const coords = parseCoordinates(coordsString);if (coords && !isNaN(zoom)) {map.setView([coords.lat, coords.lon], zoom);paivitaSijaintitiedot(coords.lat, coords.lon, "Jaettu sijainti");naytaViesti("Sijainti ladattu jaetusta linkistä!");}}} catch (e) {console.error("Virhe URL-hajautteen lukemisessa:", e);}}}
