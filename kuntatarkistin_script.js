/*
  MIKKOKALEVIN KUNTATARKISTIN
  Versio 27.1 - Korjattu tietojen vienti ja täydennetty versiohistoria
*/

// --- VERSIOHISTORIAN DATA ---
const versiohistoriaData = [
    { versio: "27.1", kuvaus: ["Korjattu tietojen vienti -toiminnallisuus.", "Palautettu täydellinen, käyttäjän kokoama versiohistoria."] },
    { versio: "27.0", kuvaus: ["Lisätty älykäs yhteys kuntalokin ja tehtävälistan välille.", "Lisätty (rikkinäinen) toiminnallisuus tietojen vientiin ja tuontiin."] },
    { versio: "26.x", kuvaus: ["Laajennettu ja järjestelty versiohistoria, muutettu dynaamiseksi."] },
    { versio: "25.0", kuvaus: ["Käyttöliittymän uudistus: välilehdet, moderni typografia ja teemanvalitsin.", "Lisätty 'Täytyy käydä'-listaan kuntahaku ja karttamerkinnät."] },
    { versio: "23.0", kuvaus: ["Lisätty 'Täytyy käydä -lista' hallintatoiminnoilla."] },
    { versio: "22.0", kuvaus: ["Lisätty Kuntalokiin yksittäisen merkinnän poisto ja muokkaus."] },
    { versio: "21.0", kuvaus: ["Lisätty Kuntaloki, johon voi tallentaa sijainteja muistiinpanoilla."] },
    { versio: "20.0", kuvaus: ["Lisätty 'Keskitä minuun' -pikanappi, parannettu zoomausta ja lisätty latausindikaattori.", "Sovellus muistaa nyt valitun karttatyylin."] },
    { versio: "19.0", kuvaus: ["Korjattu kunnan nimen tunnistuslogiikka (paluu display_name-strategiaan)."] },
    { versio: "18.0", kuvaus: ["*Kokeilu (hylätty):* Paluu Nominatim-hakuun, mutta eri logiikalla."] },
    { versio: "17.0", kuvaus: ["*Kokeilu (hylätty):* Oma välityspalvelin (Vercel) CORS-ongelman kiertämiseksi."] },
    { versio: "16.x", kuvaus: ["*Kokeilu (hylätty):* Yrityksiä integroida Maanmittauslaitoksen (MML) API kuntatietojen tarkkuuden varmistamiseksi."] },
    { versio: "15.0", kuvaus: ["Etäisyyslaskuriin lisätty välimatkojen näyttö (esim. piste 1 -> 2)."] },
    { versio: "14.0", kuvaus: ["Parannettu etäisyyslaskuri: tuki usealle pisteelle ja pisteiden siirtelylle."] },
    { versio: "13.0", kuvaus: ["Sijaintihistoria ja valittu karttatyyli tallennetaan selaimeen.", "Sijainnin URL päivittyy osoiteriville, mahdollistaen linkkien jakamisen."] },
    { versio: "12.0", kuvaus: ["Lähtötilanne tässä keskustelussa. Modulaarinen rakenne, useita tiedostoja."] },
    { versio: "10.0", kuvaus: ["Mobiilinäkymän yläosan uudelleenasettelu (logo ja otsikko vierekkäin)."] },
    { versio: "9.9", kuvaus: ["Mobiilioptimointia (reunukset ja marginaalit)."] },
    { versio: "9.8", kuvaus: ["Yleisiä parannuksia (User-Agent, latauksen aikainen napin lukitus)."] },
    { versio: "9.7", kuvaus: ["Tyhjien tietokenttien (katu, postinumero) piilotus tulosnäkymästä."] },
    { versio: "9.6", kuvaus: ["Ensimmäinen versio, jossa useita tiedostoja."] },
    { versio: "9.0", kuvaus: ["Viimeisin yhden tiedoston versio, jossa lisätiedot ja N/E-koordinaatit."] },
    { versio: "8.0", kuvaus: ["Parannettu kuntatietojen hakulogiikkaa (seutukuntien ja taajamien suodatus)."] },
    { versio: "7.0", kuvaus: ["Lisätty tuki geokätköilyssä yleiselle DDM-koordinaattimuodolle."] },
    { versio: "6.0", kuvaus: ["Lisätty manuaalinen koordinaattihaku tekstikentällä."] },
    { versio: "5.0", kuvaus: ["Parannettu mobiilikäytettävyyttä siirtämällä tulokset kartan yläpuolelle."] },
    { versio: "4.0", kuvaus: ["Lisätty interaktiivinen Leaflet.js-kartta."] },
    { versio: "3.0", kuvaus: ["Rikastettu tulosnäkymää lisätiedoilla (katu, postinumero, maa)."] },
    { versio: "2.0", kuvaus: ["Toiminnallisuus integroitu omaan sivupohjaan (ulkoasu ja logo)."] },
    { versio: "1.0", kuvaus: ["Ensimmäinen toimiva prototyyppi (GPS-haku ja kunnan nimi)."] }
];

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
const hakutuloksetContainer = document.getElementById('hakutulokset-container');
const tehtavaListaElem = document.getElementById('tehtava-lista');
const teemaValitsin = document.getElementById('teema-valitsin');
const valilehtiContainer = document.querySelector('.valilehdet');
const valilehtiPaneelit = document.querySelectorAll('.valilehti-paneeli');
const versiohistoriaContainer = document.getElementById('versiohistoria-container');
const vieLokiNappi = document.getElementById('vie-loki');
const tuoLokiInput = document.getElementById('tuo-loki-input');
const vieTehtavalistaNappi = document.getElementById('vie-tehtavalista');
const tuoTehtavalistaInput = document.getElementById('tuo-tehtavalista-input');

let map;
let marker;
let currentTileLayer;
let etaisyysPisteet = [];
let etaisyysMarkerit = [];
let etaisyysViiva;
let sijaintiHistoria = [];
let kuntaloki = [];
let tehtavaLista = [];
let tehtavaMarkerit = [];
let kayttoTila = 'haku';
let viimeisinGpsSijainti = null;
let viimeisinTulosData = null;
let hakuAjastin;

const MAX_ETAISYYS_PISTEET = 30;

const tallennettuHistoria = localStorage.getItem('mk_kuntatarkistin_historia');
if (tallennettuHistoria) sijaintiHistoria = JSON.parse(tallennettuHistoria);
const tallennettuLoki = localStorage.getItem('mk_kuntatarkistin_loki');
if (tallennettuLoki) kuntaloki = JSON.parse(tallennettuLoki);
const tallennettuTehtavalista = localStorage.getItem('mk_kuntatarkistin_tehtavalista');
if (tallennettuTehtavalista) tehtavaLista = JSON.parse(tallennettuTehtavalista);

document.addEventListener('DOMContentLoaded', () => {
    asetaTallennettuTeema();
    const tallennettuTyyli = localStorage.getItem('mk_kuntatarkistin_karttatyyli');
    if (tallennettuTyyli) karttaTyyli.value = tallennettuTyyli;
    initMap();
    paivitaKaikkiListat();
    lueURLJaAsetaSijainti();
});

haeSijaintiNappi.addEventListener('click', haeGPSsijainti);
naytaKoordinaatitNappi.addEventListener('click', haeManuaalisesti);
karttaTyyli.addEventListener('change', vaihdaKarttaTyyli);
teemaValitsin.addEventListener('change', vaihdaTeema);
tyhjennaPisteetNappi.addEventListener('click', tyhjennaEtaisyysPisteet);
tyhjennaHistoriaNappi.addEventListener('click', tyhjennaHistoria);
tyhjennaLokiNappi.addEventListener('click', tyhjennaLoki);
tilaHakuNappi.addEventListener('click', () => vaihdaKayttoTila('haku'));
tilaEtaisyysNappi.addEventListener('click', () => vaihdaKayttoTila('etaisyys'));
tehtavaInput.addEventListener('input', handleTehtavaInput);
document.addEventListener('click', (e) => { if (!tehtavaInput.contains(e.target)) hakutuloksetContainer.innerHTML = ''; });
vieLokiNappi.addEventListener('click', () => vieData(kuntaloki, 'kuntaloki.json'));
tuoLokiInput.addEventListener('change', (e) => tuoData(e, 'loki'));
vieTehtavalistaNappi.addEventListener('click', () => vieData(tehtavaLista, 'tehtavalista.json'));
tuoTehtavalistaInput.addEventListener('change', (e) => tuoData(e, 'tehtavalista'));

let nappiaKasitelty = false;
const handleKeskitys = (e) => {
    if (nappiaKasitelty) return;
    nappiaKasitelty = true; e.preventDefault(); keskitäKartta();
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
    if (kohde !== 'haku') { setTimeout(() => map.invalidateSize(), 1); }
});

function vaihdaTeema(event) { const teema = event.target.value; document.body.dataset.theme = teema; localStorage.setItem('mk_kuntatarkistin_teema', teema); }
function asetaTallennettuTeema() { const tallennettuTeema = localStorage.getItem('mk_kuntatarkistin_teema') || 'sinertava'; document.body.dataset.theme = tallennettuTeema; teemaValitsin.value = tallennettuTeema; }
function setButtonsDisabled(disabled) { haeSijaintiNappi.disabled = disabled; naytaKoordinaatitNappi.disabled = disabled; }
function naytaViesti(viesti, tyyppi = 'info') { const div = document.createElement('div'); div.className = tyyppi === 'error' ? 'virhe-viesti' : 'onnistui-viesti'; div.textContent = viesti; document.body.appendChild(div); setTimeout(() => div.remove(), 4000); }
function initMap() { map = L.map('kartta-container').setView([60.98, 25.66], 10); vaihdaKarttaTyyli(); map.on('click', onMapClick); }
function vaihdaKarttaTyyli() { if (currentTileLayer) map.removeLayer(currentTileLayer); const tyyli = karttaTyyli.value; let uusiTaso; switch(tyyli) { case 'cartodb': uusiTaso = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap contributors &copy; CARTO' }); break; case 'satellite': uusiTaso = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles &copy; Esri' }); break; case 'terrain': uusiTaso = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { attribution: 'Map data: &copy; OpenStreetMap, &copy; OpenTopoMap' }); break; default: uusiTaso = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }); } currentTileLayer = uusiTaso.addTo(map); localStorage.setItem('mk_kuntatarkistin_karttatyyli', tyyli); }
function parseCoordinates(input) { input = input.trim(); const ddmRegex = /([ns])\s*(\d{1,3})[°\s]+([\d.]+)'?[\s,]*([ew])\s*(\d{1,3})[°\s]+([\d.]+)'?/i; const ddmMatch = input.match(ddmRegex); if (ddmMatch) { let lat_deg = parseFloat(ddmMatch[2]), lat_min = parseFloat(ddmMatch[3]), lat = lat_deg + lat_min / 60; if (ddmMatch[1].toUpperCase() === 'S') lat = -lat; let lon_deg = parseFloat(ddmMatch[5]), lon_min = parseFloat(ddmMatch[6]), lon = lon_deg + lon_min / 60; if (ddmMatch[4].toUpperCase() === 'W') lon = -lon; return { lat, lon }; } else { const parts = input.split(/[,;\s]/).filter(Boolean); if (parts.length === 2) { const lat = parseFloat(parts[0]), lon = parseFloat(parts[1]); if (!isNaN(lat) && !isNaN(lon)) return { lat, lon }; } } return null; }
function formatCoordinatesToDDM(lat, lon) { const formatPart = (value, hemi1, hemi2) => { const hemisphere = value >= 0 ? hemi1 : hemi2; const absValue = Math.abs(value); const degrees = Math.floor(absValue); const minutes = (absValue - degrees) * 60; const paddedDegrees = (hemi1 === 'E') ? degrees.toString().padStart(3, '0') : degrees; return `${hemisphere} ${paddedDegrees}° ${minutes.toFixed(3)}'`; }; return `${formatPart(lat, 'N', 'S')} ${formatPart(lon, 'E', 'W')}`; }
function luoKopioiNappi(teksti) { const nappi = document.createElement('button'); nappi.className = 'kopioi-nappi'; nappi.textContent = 'Kopioi'; nappi.onclick = () => { navigator.clipboard.writeText(teksti).then(() => naytaViesti('Kopioitu leikepöydälle!', 'success'), () => naytaViesti('Kopiointi epäonnistui', 'error')); }; return nappi; }
function paivitaKaikkiListat() { paivitaHistoria(); paivitaLoki(); naytaTehtavalista(); naytaVersiohistoria(); }
function laskeKahdenPisteenEtaisyys(lat1, lon1, lat2, lon2) {const R = 6371;const dLat = (lat2 - lat1) * Math.PI / 180;const dLon = (lon2 - lon1) * Math.PI / 180;const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));return R * c;}
function paivitaEtaisyysPolkuJaTulos() {if (etaisyysViiva) map.removeLayer(etaisyysViiva);let kokonaisEtaisyys = 0;let segmenttiHtml = '';for (let i = 1; i < etaisyysPisteet.length; i++) {const [lat1, lon1] = etaisyysPisteet[i-1];const [lat2, lon2] = etaisyysPisteet[i];const segmentinEtaisyys = laskeKahdenPisteenEtaisyys(lat1, lon1, lat2, lon2);kokonaisEtaisyys += segmentinEtaisyys;segmenttiHtml += `<p>Piste ${i} &rarr; ${i + 1}: <strong>${segmentinEtaisyys.toFixed(2)} km</strong></p>`;}if (etaisyysPisteet.length > 1) {etaisyysViiva = L.polyline(etaisyysPisteet, {color: 'red', weight: 3}).addTo(map);}document.getElementById('etaisyys-pisteet').innerHTML = `<p>Pisteitä: ${etaisyysPisteet.length}/${MAX_ETAISYYS_PISTEET}</p>`;etaisyysTulos.innerHTML = kokonaisEtaisyys > 0 ? `<div class="etaisyys-tulos"><p><strong>Etäisyys: ${kokonaisEtaisyys.toFixed(2)} km</strong></p><hr style="border-color: #90EE9044; border-style: dashed; margin: 8px 0;">${segmenttiHtml}</div>` : '';}
function lisaaEtaisyyspiste(lat, lon) {if (etaisyysPisteet.length >= MAX_ETAISYYS_PISTEET) {naytaViesti(`Maksimimäärä saavutettu.`, 'error');return;}const pisteIndex = etaisyysPisteet.length;etaisyysPisteet.push([lat, lon]);const uusiMarker = L.marker([lat, lon], {draggable: true,icon: L.divIcon({ className: 'etaisyys-marker', html: `<div style="background: red; color: white; border-radius: 50%; width: 20px; height: 20px; text-align: center; line-height: 20px; font-weight: bold;">${pisteIndex + 1}</div>`, iconSize: [20, 20] })}).addTo(map).on('dragend', function(event) {const newPosition = event.target.getLatLng();etaisyysPisteet[pisteIndex] = [newPosition.lat, newPosition.lng];paivitaEtaisyysPolkuJaTulos();});etaisyysMarkerit.push(uusiMarker);paivitaEtaisyysPolkuJaTulos();}
function tyhjennaEtaisyysPisteet() {etaisyysPisteet = [];etaisyysMarkerit.forEach(m => map.removeLayer(m));etaisyysMarkerit = [];if (etaisyysViiva) map.removeLayer(etaisyysViiva);etaisyysTulos.innerHTML = '';document.getElementById('etaisyys-pisteet').innerHTML = '<p>Klikkaa karttaa.</p>';}
function vaihdaKayttoTila(uusiTila) {kayttoTila = uusiTila;if (uusiTila === 'haku') {tilaHakuNappi.classList.add('aktiivinen-tila');tilaEtaisyysNappi.classList.remove('aktiivinen-tila');etaisyysLaatikko.style.display = 'none';} else {tilaHakuNappi.classList.remove('aktiivinen-tila');tilaEtaisyysNappi.classList.add('aktiivinen-tila');etaisyysLaatikko.style.display = 'block';}}
function haeGPSsijainti() {if (!("geolocation" in navigator)) return naytaViesti('GPS ei käytettävissä', 'error');setButtonsDisabled(true);tulosAlue.innerHTML = '<div class="lataus-spinner"></div><p style="text-align: center;">Haetaan GPS...</p>';navigator.geolocation.getCurrentPosition(onGPSSuccess, onGPSError, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });}
function haeManuaalisesti() {const coords = parseCoordinates(koordinaatitInput.value);if (coords) {map.setView([coords.lat, coords.lon], 14);paivitaSijaintitiedot(coords.lat, coords.lon, "Manuaalinen haku");} else {naytaViesti("Virheelliset koordinaatit", 'error');}}
function onGPSSuccess(position) {const { latitude: lat, longitude: lon } = position.coords;viimeisinGpsSijainti = [lat, lon];keskitaNappi.style.display = 'block';map.setView([lat, lon], 15);paivitaSijaintitiedot(lat, lon, "Oma sijainti");}
function onMapClick(e) {const { lat, lng: lon } = e.latlng;if (kayttoTila === 'etaisyys') {lisaaEtaisyyspiste(lat, lon);} else {paivitaSijaintitiedot(lat, lon, "Klikattu sijainti");}}
function keskitäKartta() {if (viimeisinGpsSijainti) {map.setView(viimeisinGpsSijainti, 15);naytaViesti("Kartta keskitetty!");} else {naytaViesti("Sijaintia ei haettu.", "error");}}
async function paivitaSijaintitiedot(lat, lon, paikanNimi) {setButtonsDisabled(true);tulosAlue.innerHTML = '<div class="lataus-spinner"></div><p style="text-align: center;">Haetaan tietoja...</p>';if (marker) marker.setLatLng([lat, lon]);else marker = L.marker([lat, lon]).addTo(map);const koordinaatitDDM = formatCoordinatesToDDM(lat, lon);marker.bindPopup(`<b>${paikanNimi}</b><br>${koordinaatitDDM}`).openPopup();const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&accept-language=fi`;try {const response = await fetch(nominatimUrl, { headers: { 'User-Agent': 'MikkokalevinKuntatarkistin/1.0' } });if (!response.ok) throw new Error(`Osoitehaku epäonnistui`);const data = await response.json();const address = data.address;let paatinimi = 'Kuntaa ei löytynyt';if (data.display_name) {paatinimi = data.display_name.split(',')[0].trim();} else {paatinimi = address.municipality || address.town || address.village || address.city || 'Kuntaa ei löytynyt';}
viimeisinTulosData = { kunta: paatinimi, koordinaatit: koordinaatitDDM };const tie = address?.road;const postinumero = address?.postcode;const maa = address?.country || 'Ei saatavilla';const kokoNimi = data?.display_name || 'Ei lisätietoja';
let htmlOutput = `<div id="tehtavalista-huomautus-container"></div><p class="kunta-iso">${paatinimi}</p>`;
htmlOutput += `<div class="koordinaatti-rivi"><strong>Koordinaatit (DDM):</strong> ${koordinaatitDDM}</div>`;if (tie) htmlOutput += `<p><strong>Katu:</strong> ${tie}</p>`;if (postinumero) htmlOutput += `<p><strong>Postinumero:</strong> ${postinumero}</p>`;htmlOutput += `<p><strong>Maa:</strong> ${maa}</p>`;htmlOutput += `<hr style="border-color: #90EE9044; border-style: dashed;"><p><strong>Tarkka sijainti:</strong> ${kokoNimi}</p>`;tulosAlue.innerHTML = htmlOutput;
tarkistaOnkoTehtavalistalla(paatinimi);
const tallennaNappi = document.createElement('button');tallennaNappi.textContent = 'Tallenna kuntalokiin';tallennaNappi.className = 'nappi nappi-keltainen tallenna-loki-nappi';tallennaNappi.onclick = tallennaViimeisinTulosLokiin;tulosAlue.appendChild(tallennaNappi);const koordinaattiRivi = tulosAlue.querySelector('.koordinaatti-rivi');if (koordinaattiRivi) koordinaattiRivi.appendChild(luoKopioiNappi(koordinaatitDDM));lisaaHistoriaan(paatinimi, koordinaatitDDM, paikanNimi);updateURL(lat, lon, map.getZoom());} catch (error) {console.error("Virhe:", error);const virheviesti = `<p style="text-align: center; color: #FFB3B3;">Hups, virhe.<br><small>${error.message}</small></p>`;tulosAlue.innerHTML = virheviesti;naytaViesti(error.message, 'error');} finally {setButtonsDisabled(false);}}
function lisaaHistoriaan(kunta, koordinaatit, tyyppi) { const uusiSijainti = { kunta, koordinaatit, tyyppi, aika: new Date().toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' }) }; sijaintiHistoria.unshift(uusiSijainti); if (sijaintiHistoria.length > 5) sijaintiHistoria.pop(); localStorage.setItem('mk_kuntatarkistin_historia', JSON.stringify(sijaintiHistoria)); paivitaHistoria(); }
function paivitaHistoria() { historiaLista.innerHTML = sijaintiHistoria.length === 0 ? '<p>Ei haettuja sijainteja</p>' : sijaintiHistoria.map((item, index) => `<div class="historia-item" onclick="siirryHistoriaSijaintiin(${index})"><strong>${item.kunta}</strong><br>${item.koordinaatit} - ${item.tyyppi} (${item.aika})</div>`).join(''); }
window.siirryHistoriaSijaintiin = function(index) { const sijainti = sijaintiHistoria[index]; const coords = parseCoordinates(sijainti.koordinaatit); if (coords) { map.setView([coords.lat, coords.lon], 13); paivitaSijaintitiedot(coords.lat, coords.lon, sijainti.tyyppi); } }
function tyhjennaHistoria() { if(confirm("Haluatko varmasti tyhjentää historian?")) { sijaintiHistoria = []; localStorage.removeItem('mk_kuntatarkistin_historia'); paivitaHistoria(); naytaViesti('Historia tyhjennetty.'); } }
function tallennaViimeisinTulosLokiin() { if (viimeisinTulosData) { tallennaLokiin(viimeisinTulosData.kunta, viimeisinTulosData.koordinaatit); } else { naytaViesti("Ei tallennettavaa.", "error"); } }
function tallennaLokiin(kunta, koordinaatit) { const muistiinpano = prompt("Lisää muistiinpano:", ""); if (muistiinpano === null) return; 
const onTehtavalistallaIndeksi = tehtavaLista.findIndex(item => item.nimi.toLowerCase() === kunta.toLowerCase() && !item.kayty); if (onTehtavalistallaIndeksi > -1) { if (confirm(`"${kunta}" on tehtävälistallasi. Merkitäänkö se käydyksi?`)) { tehtavaLista[onTehtavalistallaIndeksi].kayty = true; tallennaJaPaivitaTehtavalista(); } }
const uusiMerkinta = { kunta, koordinaatit, muistiinpano, aika: new Date() }; kuntaloki.unshift(uusiMerkinta); localStorage.setItem('mk_kuntatarkistin_loki', JSON.stringify(kuntaloki)); paivitaLoki(); naytaViesti(`${kunta} tallennettu lokiin!`, 'success'); }
function paivitaLoki() { if (kuntaloki.length === 0) { lokiLista.innerHTML = '<p>Lokisi on tyhjä.</p>'; return; } lokiLista.innerHTML = kuntaloki.map((item, index) => { const pvm = new Date(item.aika).toLocaleDateString('fi-FI'); return `<div class="loki-item"><div class="loki-item-header"><strong>${item.kunta}</strong><div class="loki-item-actions"><button class="loki-nappi" title="Muokkaa" onclick="muokkaaLokimerkintaa(${index})">✏️</button><button class="loki-nappi" title="Poista" onclick="poistaLokimerkinta(${index})">🗑️</button></div></div><div class="loki-tiedot">${pvm} - ${item.koordinaatit}</div>${item.muistiinpano ? `<div class="loki-muistiinpano">${item.muistiinpano}</div>` : ''}</div>`; }).join(''); }
window.muokkaaLokimerkintaa = function(index) { const nykyinen = kuntaloki[index].muistiinpano || ""; const uusi = prompt("Muokkaa muistiinpanoa:", nykyinen); if (uusi !== null) { kuntaloki[index].muistiinpano = uusi; localStorage.setItem('mk_kuntatarkistin_loki', JSON.stringify(kuntaloki)); paivitaLoki(); naytaViesti("Päivitetty!"); } };
window.poistaLokimerkinta = function(index) { const kunta = kuntaloki[index].kunta; if (confirm(`Poistetaanko ${kunta}?`)) { kuntaloki.splice(index, 1); localStorage.setItem('mk_kuntatarkistin_loki', JSON.stringify(kuntaloki)); paivitaLoki(); naytaViesti("Poistettu."); } };
function tyhjennaLoki() { if (kuntaloki.length === 0) return; if (confirm("Haluatko tyhjentää koko lokin?")) { kuntaloki = []; localStorage.removeItem('mk_kuntatarkistin_loki'); paivitaLoki(); naytaViesti('Loki tyhjennetty.'); } }
function handleTehtavaInput(e) { clearTimeout(hakuAjastin); const sana = e.target.value; if (sana.length < 3) { hakutuloksetContainer.innerHTML = ''; return; } hakuAjastin = setTimeout(() => { haeEhdotuksia(sana); }, 300); }
async function haeEhdotuksia(sana) { const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(sana)}&format=json&countrycodes=fi&limit=5&featuretype=administrative`; try { const response = await fetch(url, { headers: { 'User-Agent': 'MikkokalevinKuntatarkistin/1.0' } }); if (!response.ok) return; const data = await response.json(); const ehdotukset = data.filter(item => ['administrative'].includes(item.type) && (item.addresstype === 'city' || item.addresstype === 'town' || item.addresstype === 'municipality')); naytaEhdotukset(ehdotukset); } catch (error) { console.error("Haku epäonnistui:", error); } }
function naytaEhdotukset(ehdotukset) { if (ehdotukset.length === 0) { hakutuloksetContainer.innerHTML = ''; return; } hakutuloksetContainer.innerHTML = ehdotukset.map(item => `<div class="hakutulos-item" data-nimi="${item.display_name.split(',')[0]}" data-lat="${item.lat}" data-lon="${item.lon}">${item.display_name}</div>`).join(''); hakutuloksetContainer.querySelectorAll('.hakutulos-item').forEach(item => { item.addEventListener('click', () => { lisaaUusiTehtava({ nimi: item.dataset.nimi, lat: parseFloat(item.dataset.lat), lon: parseFloat(item.dataset.lon) }); }); }); }
function lisaaUusiTehtava(tehtavaObj) { if (!tehtavaObj || !tehtavaObj.nimi) return; tehtavaLista.push({ ...tehtavaObj, kayty: false }); tallennaJaPaivitaTehtavalista(); tehtavaInput.value = ""; hakutuloksetContainer.innerHTML = ''; tehtavaInput.focus(); }
function naytaTehtavalista() { tehtavaMarkerit.forEach(m => map.removeLayer(m)); tehtavaMarkerit = []; if (tehtavaLista.length === 0) { tehtavaListaElem.innerHTML = '<p>Listasi on tyhjä.</p>'; return; } tehtavaLista.sort((a, b) => { if (a.kayty !== b.kayty) return a.kayty ? 1 : -1; return a.nimi.localeCompare(b.nimi); }); tehtavaListaElem.innerHTML = tehtavaLista.map((item, index) => { if (item.lat && item.lon) { const iconHtml = `<div style="background-color: ${item.kayty ? 'var(--color-accent-green)' : 'var(--color-accent-blue)'}; width: 1.5rem; height: 1.5rem; border-radius: 50%; text-align: center; color: white; line-height: 1.5rem; font-size: 1rem; border: 2px solid var(--color-surface);">📍</div>`; const tehtavaIcon = L.divIcon({ html: iconHtml, className: '' }); const marker = L.marker([item.lat, item.lon], { icon: tehtavaIcon }).addTo(map).bindTooltip(item.nimi); tehtavaMarkerit.push(marker); } return `<div class="tehtava-item ${item.kayty ? 'kayty' : ''}"><input type="checkbox" onchange="vaihdaTehtavanTila(${index})" ${item.kayty ? 'checked' : ''} title="Merkitse käydyksi"><span>${item.nimi}</span><div class="loki-item-actions"><button class="loki-nappi" title="Muokkaa" onclick="muokkaaTehtavaa(${index})">✏️</button><button class="loki-nappi" title="Poista" onclick="poistaTehtava(${index})">🗑️</button></div></div>`; }).join(''); }
function tallennaJaPaivitaTehtavalista() { localStorage.setItem('mk_kuntatarkistin_tehtavalista', JSON.stringify(tehtavaLista)); naytaTehtavalista(); }
window.vaihdaTehtavanTila = function(index) { tehtavaLista[index].kayty = !tehtavaLista[index].kayty; tallennaJaPaivitaTehtavalista(); };
window.muokkaaTehtavaa = function(index) { const nykyinen = tehtavaLista[index].nimi; const uusi = prompt("Muokkaa nimeä:", nykyinen); if (uusi && uusi.trim() !== "") { tehtavaLista[index].nimi = uusi.trim(); tallennaJaPaivitaTehtavalista(); }};
window.poistaTehtava = function(index) { const nimi = tehtavaLista[index].nimi; if (confirm(`Poistetaanko "${nimi}"?`)) { tehtavaLista.splice(index, 1); tallennaJaPaivitaTehtavalista(); }};
function tarkistaOnkoTehtavalistalla(kunta) { const onListalla = tehtavaLista.find(item => item.nimi.toLowerCase() === kunta.toLowerCase() && !item.kayty); const container = document.getElementById('tehtavalista-huomautus-container'); if(onListalla) { container.innerHTML = `<div class="tehtavalista-huomautus">Tämä kunta on "Täytyy käydä" -listallasi!</div>`; } else { container.innerHTML = ''; } }
function naytaVersiohistoria() { versiohistoriaContainer.innerHTML = versiohistoriaData.map(item => `<div class="versio-item"><h4>Versio ${item.versio}</h4><ul>${item.kuvaus.map(p => `<li>${p}</li>`).join('')}</ul></div>`).join(''); }
function vieData(data, tiedostonimi) { if (data.length === 0) { naytaViesti("Lista on tyhjä, ei mitään vietävää.", "error"); return; } const jsonString = JSON.stringify(data, null, 2); const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" }); const linkki = document.createElement("a"); const url = URL.createObjectURL(blob); linkki.setAttribute("href", url); linkki.setAttribute("download", tiedostonimi); linkki.style.visibility = 'hidden'; document.body.appendChild(linkki); linkki.click(); document.body.removeChild(linkki); URL.revokeObjectURL(url); }
function tuoData(event, tyyppi) { const tiedosto = event.target.files[0]; if (!tiedosto) return; const lukija = new FileReader(); lukija.onload = function(e) { try { const data = JSON.parse(e.target.result); if (tyyppi === 'loki') { if (confirm("Haluatko korvata nykyisen lokin tuodulla tiedolla?")) { kuntaloki = data; localStorage.setItem('mk_kuntatarkistin_loki', JSON.stringify(kuntaloki)); paivitaLoki(); naytaViesti("Kuntaloki tuotu onnistuneesti!", "success"); } } else if (tyyppi === 'tehtavalista') { if (confirm("Haluatko korvata nykyisen tehtävälistan tuodulla tiedolla?")) { tehtavaLista = data; tallennaJaPaivitaTehtavalista(); naytaViesti("Tehtävälista tuotu onnistuneesti!", "success"); } } } catch (error) { naytaViesti("Virheellinen tai korruptoitunut tiedosto.", "error"); } finally { event.target.value = null; } }; lukija.readAsText(tiedosto); }
function onGPSError(error) {let virheViesti = 'Tapahtui tuntematon virhe.';switch (error.code) {case error.PERMISSION_DENIED: virheViesti = 'Et antanut lupaa sijainnin käyttöön.'; break;case error.POSITION_UNAVAILABLE: virheViesti = 'Sijaintitieto ei ole saatavilla.'; break;case error.TIMEOUT: virheViesti = 'Sijainnin haku kesti liian kauan.'; break;}tulosAlue.innerHTML = `<p>${virheViesti}</p>`;naytaViesti(virheViesti, 'error');setButtonsDisabled(false);}
function updateURL(lat, lon, zoom) {const ddmCoords = formatCoordinatesToDDM(lat, lon);const hash = `#${encodeURIComponent(ddmCoords)}/${zoom}`;if (history.replaceState) {history.replaceState(null, null, hash);} else {window.location.hash = hash;}}
function lueURLJaAsetaSijainti() {if (window.location.hash) {try {const hash = decodeURIComponent(window.location.hash.substring(1));const parts = hash.split('/');if (parts.length === 2) {const coordsString = parts[0];const zoom = parseInt(parts[1], 10);const coords = parseCoordinates(coordsString);if (coords && !isNaN(zoom)) {map.setView([coords.lat, coords.lon], zoom);paivitaSijaintitiedot(coords.lat, coords.lon, "Jaettu sijainti");naytaViesti("Sijainti ladattu linkistä!");}}} catch (e) {console.error("Virhe URL-hajautteen lukemisessa:", e);}}}
