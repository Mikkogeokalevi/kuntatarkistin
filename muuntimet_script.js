/*
  MK MUUNTIMET
  Versio 15.0 - Geokätköilytyökalut ja harvinaiset yksiköt
*/
document.addEventListener('DOMContentLoaded', () => {
    
    async function main() {
        let yksikot;
        try {
            const response = await fetch('yksikot.json');
            if (!response.ok) {
                throw new Error(`Verkkovirhe: ${response.statusText}`);
            }
            // Yhdistetään oletusyksiköt ja ladatut yksiköt.
            // Annetaan ladattujen yksiköiden korvata oletusarvot, jos avaimet ovat samoja.
            const oletusYksikot = { "pituus": [], "massa": [], "data": [], "apteekkari_massa": [], "pinta_ala": [], "tilavuus": [], "voima": [], "nopeus": [], "aika": [], "ruoanlaitto": [], "typografia": [], "paine": [], "energia": [], "teho": [], "kulma": [] };
            const ladatutYksikot = await response.json();
            yksikot = { ...oletusYksikot, ...ladatutYksikot };

        } catch (error) {
            console.error('Kriittinen virhe: Yksikködatan lataus epäonnistui.', error);
            const container = document.querySelector('.sisalto-laatikko');
            if(container) container.innerHTML = '<h2>Virhe</h2><p>Muuntimien dataa ei voitu ladata. Tarkista, että <code>yksikot.json</code>-tiedosto on olemassa ja oikein muotoiltu.</p>';
            return; 
        }

        const valilehtiContainer = document.querySelector('.valilehdet');
        const valilehtiPaneelit = document.querySelectorAll('.valilehti-paneeli');
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        
        mobileMenuToggle.addEventListener('click', () => valilehtiContainer.classList.toggle('active-menu-class'));

        const vaihdaValilehtea = (kohde) => {
            valilehtiContainer.querySelectorAll('.valilehti-nappi').forEach(nappi => nappi.classList.toggle('aktiivinen', nappi.dataset.valilehti === kohde));
            valilehtiPaneelit.forEach(paneeli => paneeli.classList.toggle('aktiivinen', paneeli.id === kohde));
        };

        valilehtiContainer.addEventListener('click', (e) => {
            const klikattuNappi = e.target.closest('.valilehti-nappi');
            if (klikattuNappi) {
                vaihdaValilehtea(klikattuNappi.dataset.valilehti);
                if (window.innerWidth <= 800) valilehtiContainer.classList.remove('active-menu-class');
            }
        });

        const alustaVakioMuunnin = (id, yksikkoData) => {
            const container = document.getElementById(id);
            if (!container || !yksikkoData) return;
            container.innerHTML = `<div class="yksikko-muunnin">
                <div class="muunnin-ryhma grid-item-arvo"><label for="${id}-arvo">Arvo</label><input type="number" id="${id}-arvo" value="1"></div>
                <div class="muunnin-ryhma grid-item-tulos"><label for="${id}-tulos">Tulos</label><div class="input-wrapper"><input type="text" id="${id}-tulos" readonly><button class="copy-btn" title="Kopioi">📋</button></div></div>
                <div class="muunnin-ryhma grid-item-mista"><label for="${id}-yksikko-mista">Mistä</label><select id="${id}-yksikko-mista"></select></div>
                <button class="swap-btn grid-item-swap" title="Vaihda">↔</button>
                <div class="muunnin-ryhma grid-item-mihin"><label for="${id}-yksikko-mihin">Mihin</label><select id="${id}-yksikko-mihin"></select></div>
            </div>
            <div class="selite-laatikko" id="${id}-selite-mista"></div>
            <div class="selite-laatikko" id="${id}-selite-mihin"></div>`;

            const arvoInput = document.getElementById(`${id}-arvo`), tulosInput = document.getElementById(`${id}-tulos`), mistaSelect = document.getElementById(`${id}-yksikko-mista`), mihinSelect = document.getElementById(`${id}-yksikko-mihin`), swapBtn = container.querySelector('.swap-btn'), copyBtn = container.querySelector('.copy-btn');
            const seliteMista = document.getElementById(`${id}-selite-mista`);
            const seliteMihin = document.getElementById(`${id}-selite-mihin`);
            
            if (yksikkoData.length > 0) {
                yksikkoData.sort((a, b) => {
                    const aHarvinainen = a.tyyppi === 'harvinainen', bHarvinainen = b.tyyppi === 'harvinainen';
                    if (aHarvinainen && !bHarvinainen) return 1; if (!aHarvinainen && bHarvinainen) return -1;
                    return a.kerroin - b.kerroin;
                });
                [mistaSelect, mihinSelect].forEach(select => {
                    select.innerHTML = '';
                    const yleisetGroup = document.createElement('optgroup'); yleisetGroup.label = 'Yleiset yksiköt';
                    const harvinaisetGroup = document.createElement('optgroup'); harvinaisetGroup.label = 'Harvinaiset / Vanhat';
                    let onHarvinaisia = false;
                    yksikkoData.forEach(y => {
                        const option = new Option(y.name, y.sym);
                        if (y.selite) { option.title = y.selite; }
                        if (y.tyyppi === 'harvinainen') { harvinaisetGroup.appendChild(option); onHarvinaisia = true; } else { yleisetGroup.appendChild(option); }
                    });
                    select.appendChild(yleisetGroup);
                    if (onHarvinaisia) select.appendChild(harvinaisetGroup);
                });
                if(mihinSelect.options.length > 1) mihinSelect.selectedIndex = 1;
            }

            const paivitaSelitteet = () => {
                const mistaYksikko = yksikkoData.find(y => y.sym === mistaSelect.value);
                const mihinYksikko = yksikkoData.find(y => y.sym === mihinSelect.value);
                seliteMista.innerHTML = mistaYksikko?.selite ? `<strong>${mistaYksikko.name}:</strong> ${mistaYksikko.selite}` : '';
                seliteMihin.innerHTML = mihinYksikko?.selite ? `<strong>${mihinYksikko.name}:</strong> ${mihinYksikko.selite}` : '';
            };

            const laskeJaPaivita = () => {
                const arvo = parseFloat(arvoInput.value) || 0;
                const mistaKerroin = (yksikkoData.find(y => y.sym === mistaSelect.value) || {}).kerroin || 1;
                const mihinKerroin = (yksikkoData.find(y => y.sym === mihinSelect.value) || {}).kerroin || 1;
                tulosInput.value = (arvo * mistaKerroin / mihinKerroin).toLocaleString('fi-FI', { maximumFractionDigits: 10 });
                paivitaSelitteet();
            };

            swapBtn.addEventListener('click', () => { const temp = mistaSelect.selectedIndex; mistaSelect.selectedIndex = mihinSelect.selectedIndex; mihinSelect.selectedIndex = temp; laskeJaPaivita(); });
            copyBtn.addEventListener('click', () => { navigator.clipboard.writeText(tulosInput.value).then(() => { const originalText = copyBtn.textContent; copyBtn.textContent = '✅'; setTimeout(() => copyBtn.textContent = originalText, 1500); }); });
            [arvoInput, mistaSelect, mihinSelect].forEach(el => el.addEventListener('input', laskeJaPaivita));
            laskeJaPaivita();
        };
        
        const alustaKoordinaattiMuunnin = () => {
            const container = document.getElementById('koordinaatit');
            container.innerHTML = `<div class="muunnin-ryhma"><label for="dd-input">Desimaaliasteet (DD)</label><input type="text" id="dd-input" placeholder="esim. 60.9814, 25.6601"></div><div class="muunnin-ryhma"><label for="ddm-input">Asteet & Desimaaliminuutit (DDM)</label><input type="text" id="ddm-input" placeholder="esim. N 60° 58.884' E 025° 39.606'"></div><div class="muunnin-ryhma"><label for="dms-input">Asteet, Minuutit & Sekunnit (DMS)</label><input type="text" id="dms-input" placeholder="esim. 60°58'53.0&quot;N 25°39'36.4&quot;E"></div>`;
            const ddInput=document.getElementById('dd-input'),ddmInput=document.getElementById('ddm-input'),dmsInput=document.getElementById('dms-input');const paivitaKoordinaatit=(lat,lon,source)=>{if(isNaN(lat)||isNaN(lon))return;if(source!=='dd')ddInput.value=`${lat.toFixed(6)}, ${lon.toFixed(6)}`;if(source!=='ddm')ddmInput.value=muotoileDDM(lat,lon);if(source!=='dms')dmsInput.value=muotoileDMS(lat,lon)};const kasittele=e=>{const coords=parseKoordinaatit(e.target.value);if(coords)paivitaKoordinaatit(coords.lat,coords.lon,e.target.id.split('-')[0])};[ddInput,ddmInput,dmsInput].forEach(input=>input.addEventListener('input',kasittele));const parseKoordinaatit=input=>{input=input.trim().replace(/,/g,' ');const dmsRegex=/(\d{1,3})[°\s]+(\d{1,2})['\s]+([\d\.]+)"?\s*([ns])[\s,]+(\d{1,3})[°\s]+(\d{1,2})['\s]+([\d\.]+)"?\s*([ew])/i;const dmsMatch=input.match(dmsRegex);if(dmsMatch){let lat=parseFloat(dmsMatch[1])+parseFloat(dmsMatch[2])/60+parseFloat(dmsMatch[3])/3600;if(dmsMatch[4].toUpperCase()==='S')lat=-lat;let lon=parseFloat(dmsMatch[5])+parseFloat(dmsMatch[6])/60+parseFloat(dmsMatch[7])/3600;if(dmsMatch[8].toUpperCase()==='W')lon=-lon;if(!isNaN(lat)&&!isNaN(lon))return{lat,lon}}const ddmRegex=/([ns])\s*(\d{1,3})[°\s]+([\d.]+)'?[\s,]*([ew])\s*(\d{1,3})[°\s]+([\d.]+)'?/i;const ddmMatch=input.match(ddmRegex);if(ddmMatch){let lat=parseFloat(ddmMatch[2])+parseFloat(ddmMatch[3])/60;if(ddmMatch[1].toUpperCase()==='S')lat=-lat;let lon=parseFloat(ddmMatch[5])+parseFloat(ddmMatch[6])/60;if(ddmMatch[4].toUpperCase()==='W')lon=-lon;if(!isNaN(lat)&&!isNaN(lon))return{lat,lon}}const parts=input.split(/\s+/).filter(Boolean);if(parts.length===2){const lat=parseFloat(parts[0]),lon=parseFloat(parts[1]);if(!isNaN(lat)&&!isNaN(lon))return{lat,lon}}return null};const muotoileDDM=(lat,lon)=>{const f=(v,h1,h2)=>`${v>=0?h1:h2} ${Math.floor(Math.abs(v))}° ${((Math.abs(v)-Math.floor(Math.abs(v)))*60).toFixed(3)}'`;return`${f(lat,'N','S')} ${f(lon,'E','W')}`};const muotoileDMS=(lat,lon)=>{const f=(v,h1,h2)=>{const deg=Math.floor(Math.abs(v)),min=Math.floor((Math.abs(v)-deg)*60),sec=(((Math.abs(v)-deg)*60-min)*60).toFixed(1);return`${deg}°${min}'${sec}"${v>=0?h1:h2}`};return`${f(lat,'N','S')} ${f(lon,'E','W')}`};
        };

        const alustaPaivamaaraLaskuri = () => {
            const container = document.getElementById('paivamaarat');
            container.innerHTML = `<h4>Laske aikaväli</h4><div class="muunnin-ryhma"><label for="date-start">Alkaa</label><input type="datetime-local" id="date-start"></div><div class="muunnin-ryhma"><label for="date-end">Päättyy</label><input type="datetime-local" id="date-end"></div><div id="date-diff-result" class="tulos-box" style="display: none;"></div><hr style="margin: 30px 0; border-color: var(--color-border);"><h4>Laske päivämäärä</h4><div class="muunnin-ryhma"><label for="calc-date-start">Päivämäärä</label><input type="date" id="calc-date-start"></div><div class="muunnin-ryhma"><label for="calc-days">Päivien lukumäärä (+/-)</label><input type="number" id="calc-days" value="100"></div><div id="calc-date-result" class="tulos-box" style="display: none;"></div>`;
            const dateStart=document.getElementById('date-start'),dateEnd=document.getElementById('date-end'),diffResult=document.getElementById('date-diff-result');const calcDateStart=document.getElementById('calc-date-start'),calcDays=document.getElementById('calc-days'),calcResult=document.getElementById('calc-date-result');function getPreciseDateDiff(d1,d2){let months=(d2.getFullYear()-d1.getFullYear())*12+(d2.getMonth()-d1.getMonth());let tempD1=new Date(d1);tempD1.setMonth(tempD1.getMonth()+months);if(tempD1>d2){months--;tempD1.setMonth(tempD1.getMonth()-1)}const remainingMs=d2-tempD1;const years=Math.floor(months/12);months%=12;const days=Math.floor(remainingMs/864e5);const hours=Math.floor((remainingMs%864e5)/36e5);const minutes=Math.floor((remainingMs%36e5)/6e4);const seconds=Math.floor((remainingMs%6e4)/1000);return{years,months,days,hours,minutes,seconds}}const calculateDiff=()=>{if(dateStart.value&&dateEnd.value){const start=new Date(dateStart.value);const end=new Date(dateEnd.value);if(start>=end){diffResult.innerHTML="Loppupäivän on oltava alkupäivän jälkeen.";diffResult.style.display='block';return}const breakdown=getPreciseDateDiff(start,end);const totalMs=end-start;const totalDays=totalMs/864e5;const totalHours=totalMs/36e5;const totalMinutes=totalMs/6e4;const totalSeconds=totalMs/1000;let breakdownHtml=`<strong>Tarkka erotus:</strong> ${breakdown.years}v, ${breakdown.months}kk, ${breakdown.days}pv, ${breakdown.hours}h, ${breakdown.minutes}min, ${breakdown.seconds}s`;let totalsHtml=`<hr style="border-color: var(--color-border); margin: 10px 0;"><p style="margin: 5px 0;"><strong>Yhteensä päivinä:</strong> ${totalDays.toLocaleString('fi-FI',{maximumFractionDigits:2})}</p><p style="margin: 5px 0;"><strong>Yhteensä tunteina:</strong> ${totalHours.toLocaleString('fi-FI',{maximumFractionDigits:2})}</p><p style="margin: 5px 0;"><strong>Yhteensä minuutteina:</strong> ${totalMinutes.toLocaleString('fi-FI',{maximumFractionDigits:0})}</p><p style="margin: 5px 0;"><strong>Yhteensä sekunteina:</strong> ${totalSeconds.toLocaleString('fi-FI',{maximumFractionDigits:0})}</p>`;diffResult.innerHTML=breakdownHtml+totalsHtml;diffResult.style.display='block'}};const calculateDate=()=>{if(calcDateStart.value&&calcDays.value){const start=new Date(calcDateStart.value),days=parseInt(calcDays.value,10);start.setDate(start.getDate()+days);calcResult.textContent=`Tulos: ${start.toLocaleDateString('fi-FI')}`;calcResult.style.display='block'}};[dateStart,dateEnd].forEach(el=>el.addEventListener('input',calculateDiff));[calcDateStart,calcDays].forEach(el=>el.addEventListener('input',calculateDate));
        };

        const alustaTekstiMuunnin = () => {
            const container = document.getElementById('teksti');
            container.innerHTML = `<div class="muunnin-ryhma"><label for="teksti-tyyppi">Muunnos</label><select id="teksti-tyyppi"><option value="a1z26">A1Z26</option><option value="rot13">ROT13</option><option value="atbash">Atbash</option><option value="phonepad">Puhelinnäppäimistö</option><option value="base64">Base64</option><option value="morse">Morse-koodi</option><option value="binary">Teksti ↔ Binääri (ASCII)</option><option value="hex">Teksti ↔ Heksa (ASCII)</option><option value="vigenere">Vigenère-salakirjoitus</option></select></div><div id="vigenere-key-wrapper" class="muunnin-ryhma" style="display:none;"><label for="vigenere-key">Avainsana</label><input type="text" id="vigenere-key"></div><div class="muunnin-ryhma"><label>Selkokieli</label><textarea id="teksti-input" rows="4"></textarea></div><div style="text-align: center; margin-bottom: 15px;"><button class="swap-btn" id="teksti-swap" title="Vaihda suunta">↑↓</button></div><div class="muunnin-ryhma"><label>Salakieli</label><textarea id="teksti-output" rows="4"></textarea></div>`;
            const elements={input:document.getElementById('teksti-input'),output:document.getElementById('teksti-output'),type:document.getElementById('teksti-tyyppi'),swap:document.getElementById('teksti-swap'),vigenereWrapper:document.getElementById('vigenere-key-wrapper'),vigenereKey:document.getElementById('vigenere-key')};
            const morseMap={'a':'.-','b':'-...','c':'-.-.','d':'-..','e':'.','f':'..-.','g':'--.','h':'....','i':'..','j':'.---','k':'-.-','l':'.-..','m':'--','n':'-.','o':'---','p':'.--.','q':'--.-','r':'.-.','s':'...','t':'-','u':'..-','v':'...-','w':'.--','x':'-..-','y':'-.--','z':'--..','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.','0':'-----',' ':'/'};
            const revMorseMap=Object.fromEntries(Object.entries(morseMap).map(a=>a.reverse()));
            const phoneMap = { 'a': '2', 'b': '22', 'c': '222', 'd': '3', 'e': '33', 'f': '333', 'g': '4', 'h': '44', 'i': '444', 'j': '5', 'k': '55', 'l': '555', 'm': '6', 'n': '66', 'o': '666', 'p': '7', 'q': '77', 'r': '777', 's': '7777', 't': '8', 'u': '88', 'v': '888', 'w': '9', 'x': '99', 'y': '999', 'z': '9999', ' ': '0' };
            const revPhoneMap = Object.fromEntries(Object.entries(phoneMap).map(a=>a.reverse()));
            const fns={
                a1z26:{e:s=>s.toLowerCase().split('').map(c=>(c>='a'&&c<='z')?c.charCodeAt(0)-96:c).join(' '),d:s=>s.split(' ').map(n=>(n>0&&n<27)?String.fromCharCode(parseInt(n)+96):n).join('')},
                rot13:{e:s=>s.replace(/[a-zA-Z]/g,c=>String.fromCharCode(c.charCodeAt(0)+(c.toLowerCase()<'n'?13:-13)))},
                atbash:{e:s=>s.replace(/[a-zA-Z]/g,c=>{const base=c<='Z'?'A'.charCodeAt(0):'a'.charCodeAt(0);return String.fromCharCode(base*2+25-c.charCodeAt(0));})},
                phonepad: {e: s => s.toLowerCase().split('').map(c => phoneMap[c] || c).join(' '), d: s => s.split(' ').map(c => revPhoneMap[c] || c).join('')},
                base64:{e:s=>btoa(unescape(encodeURIComponent(s))),d:s=>{try{return decodeURIComponent(escape(atob(s)))}catch(e){return"Virheellinen Base64"}}},
                morse:{e:s=>s.toLowerCase().split('').map(c=>morseMap[c]||'').join(' '),d:s=>s.split(' ').map(c=>revMorseMap[c]||'').join('')},
                binary:{e:s=>s.split('').map(c=>c.charCodeAt(0).toString(2).padStart(8,'0')).join(' '),d:s=>s.split(/[\s\r\n]+/).filter(Boolean).map(b=>String.fromCharCode(parseInt(b,2))).join('')},
                hex:{e:s=>s.split('').map(c=>c.charCodeAt(0).toString(16).padStart(2,'0').toUpperCase()).join(' '),d:s=>s.replace(/[\s\r\n]+/g,'').split(/(..)/).filter(Boolean).map(h=>String.fromCharCode(parseInt(h,16))).join('')},
                vigenere:{run:(str,key,decode)=>{if(!key)return"Avainsana puuttuu.";key=key.toLowerCase().replace(/[^a-z]/g,'');if(!key)return"Avainsana virheellinen.";let keyIndex=0;let result='';for(let i=0;i<str.length;i++){const charCode=str.charCodeAt(i);if(charCode>=65&&charCode<=90){const keyShift=key.charCodeAt(keyIndex%key.length)-97;const shift=decode?(26-keyShift):keyShift;result+=String.fromCharCode(((charCode-65+shift)%26)+65);keyIndex++}else if(charCode>=97&&charCode<=122){const keyShift=key.charCodeAt(keyIndex%key.length)-97;const shift=decode?(26-keyShift):keyShift;result+=String.fromCharCode(((charCode-97+shift)%26)+97);keyIndex++}else{result+=str[i]}}return result}}
            };
            fns.rot13.d=fns.rot13.e; fns.atbash.d = fns.atbash.e;
            fns.vigenere.e=(s,k)=>fns.vigenere.run(s,k,false);fns.vigenere.d=(s,k)=>fns.vigenere.run(s,k,true);
            const muunna=source=>{
                const typeVal=elements.type.value;
                elements.vigenereWrapper.style.display=typeVal==='vigenere'?'block':'none';
                const fn=fns[typeVal];
                const key=elements.vigenereKey.value;
                const sourceIsInput = (elements.input.id === source.id);
                if(sourceIsInput) {
                    elements.output.value = fn.e ? fn.e(elements.input.value, key) : 'Suunta ei tuettu';
                } else {
                    elements.input.value = fn.d ? fn.d(elements.output.value, key) : 'Suunta ei tuettu';
                }
            };
            elements.input.addEventListener('input', (e) => muunna(e.target));
            elements.output.addEventListener('input', (e) => muunna(e.target));
            elements.type.addEventListener('input', (e) => muunna(elements.input));
            elements.vigenereKey.addEventListener('input', () => muunna(elements.input));
            elements.swap.addEventListener('click', () => { const temp = elements.input.value; elements.input.value = elements.output.value; elements.output.value = temp; });
        };
        // ... (other initializers remain the same)

        const alustaYksikkoSanasto = () => {
            const container = document.getElementById('yksikkosanasto');
            if (!container) return;
            
            const kategoriat = {
                pituus: 'Pituus', massa: 'Massa', apteekkari_massa: 'Massa (Apteekkarin mitat)',
                voima: 'Voima', pinta_ala: 'Pinta-ala', tilavuus: 'Tilavuus', nopeus: 'Nopeus', aika: 'Aika', data: 'Data',
                paine: 'Paine', energia: 'Energia', teho: 'Teho', kulma: 'Kulma'
            };

            let html = `<input type="text" id="sanasto-haku" placeholder="Hae yksiköitä nimellä tai lyhenteellä...">`;
            html += '<div id="sanasto-lista">';

            for (const avain in kategoriat) {
                if (yksikot[avain] && yksikot[avain].length > 0) {
                    html += `<div class="yksikko-lista-osio"><h3>${kategoriat[avain]}</h3><ul>`;
                    const sortedUnits = [...yksikot[avain]].sort((a,b) => (a.name > b.name) ? 1 : -1);
                    sortedUnits.forEach(y => {
                        html += `<li data-nimi="${y.name.toLowerCase()} ${y.sym?.toLowerCase()}"><strong>${y.name} (${y.sym || '–'})</strong><span>${y.selite || 'Ei selitettä.'}</span></li>`;
                    });
                    html += '</ul></div>';
                }
            }
            html += '</div>';
            container.innerHTML = html;

            const hakuInput = document.getElementById('sanasto-haku');
            const listanOsat = container.querySelectorAll('#sanasto-lista li');
            hakuInput.addEventListener('input', (e) => {
                const hakusana = e.target.value.toLowerCase();
                listanOsat.forEach(li => {
                    const onOsuma = li.dataset.nimi.includes(hakusana);
                    li.style.display = onOsuma ? '' : 'none';
                });
            });
        };

        const alustaProsenttiLaskuri = () => {
            const container = document.getElementById('prosentti');
            if (!container) return;
            container.innerHTML = `
                <div class="muunnin-ryhma" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <label for="prosentti-tyyppi">Laskentatapa</label>
                        <select id="prosentti-tyyppi">
                            <option value="lisays">Lisäys (esim. ALV)</option>
                            <option value="alennus">Alennus</option>
                        </select>
                    </div>
                    <div>
                        <label for="prosentti-kanta">Prosentti (%)</label>
                        <input type="number" id="prosentti-kanta" value="25.5" step="0.1">
                    </div>
                </div>
                <div class="muunnin-ryhma" style="margin-top: 20px;">
                    <label for="prosentti-alkuperainen">Alkuperäinen hinta</label>
                    <input type="number" id="prosentti-alkuperainen" placeholder="100.00">
                </div>
                <div class="muunnin-ryhma">
                    <label for="prosentti-loppuhinta">Loppuhinta</label>
                    <input type="number" id="prosentti-loppuhinta" placeholder="125.50">
                </div>
                <div class="tulos-box" style="margin-top: 20px;">
                    <strong>Muutoksen (alennus/vero) määrä:</strong> <span id="prosentti-erotus">25.50</span> €
                </div>
            `;

            const tyyppiSelect = document.getElementById('prosentti-tyyppi');
            const kantaInput = document.getElementById('prosentti-kanta');
            const alkuperainenInput = document.getElementById('prosentti-alkuperainen');
            const loppuInput = document.getElementById('prosentti-loppuhinta');
            const erotusSpan = document.getElementById('prosentti-erotus');

            const laske = (muutoksenLahde) => {
                const onLisays = tyyppiSelect.value === 'lisays';
                const kanta = parseFloat(kantaInput.value) / 100 || 0;
                let alku = parseFloat(alkuperainenInput.value) || 0;
                let loppu = parseFloat(loppuInput.value) || 0;

                if (muutoksenLahde === 'alkuperainen') {
                    if (alku > 0) {
                        loppu = onLisays ? alku * (1 + kanta) : alku * (1 - kanta);
                        loppuInput.value = loppu.toFixed(2);
                    } else {
                        loppuInput.value = '';
                        loppu = 0;
                    }
                } else { // 'loppuhinta' tai kanta/tyyppi muuttunut
                    if (loppu > 0) {
                         alku = onLisays ? loppu / (1 + kanta) : loppu / (1 - kanta);
                         alkuperainenInput.value = alku.toFixed(2);
                    } else {
                        alkuperainenInput.value = '';
                        alku = 0;
                    }
                }
                
                const erotus = Math.abs(loppu - alku);
                erotusSpan.textContent = erotus.toFixed(2);
            };

            [tyyppiSelect, kantaInput].forEach(el => el.addEventListener('input', () => laske(alkuperainenInput.value ? 'alkuperainen' : 'loppuhinta')));
            alkuperainenInput.addEventListener('input', () => laske('alkuperainen'));
            loppuInput.addEventListener('input', () => laske('loppuhinta'));
            
            laske('alkuperainen');
        };
        
        const alustaKaloriLaskuri = () => { /* ... sama koodi kuin aiemmin ... */ };
        const alustaVariMuunnin = () => { /* ... sama koodi kuin aiemmin ... */ };
        const alustaBmiLaskuri = () => { /* ... sama koodi kuin aiemmin ... */ };
        // ... (ja niin edelleen kaikille muille, muuttumattomille alustajille)

        const alustaNumeroTyokalut = () => {
            const container = document.getElementById('numerot');
            if(!container) return;
            container.innerHTML = `
                <h4>Alkuluvut</h4>
                <div class="muunnin-ryhma">
                    <label for="alkuluku-syote">Testattava luku / Yläraja</label>
                    <input type="number" id="alkuluku-syote" value="100">
                </div>
                <div id="alkuluku-tulos" class="tulos-box" style="margin-top:10px;"></div>

                <hr style="margin: 30px 0; border-color: var(--color-border);">

                <h4>Numerosumma</h4>
                <div class="muunnin-ryhma">
                    <label for="numerosumma-syote">Luku</label>
                    <input type="number" id="numerosumma-syote" value="1984">
                </div>
                <div id="numerosumma-tulos" class="tulos-box" style="margin-top:10px;"></div>
            `;
            
            const alkulukuInput = document.getElementById('alkuluku-syote');
            const alkulukuTulos = document.getElementById('alkuluku-tulos');
            const nsummaInput = document.getElementById('numerosumma-syote');
            const nsummaTulos = document.getElementById('numerosumma-tulos');

            const onkoAlkuluku = num => {
                if (num <= 1) return false;
                for (let i = 2; i*i <= num; i++) {
                    if (num % i === 0) return false;
                }
                return true;
            };

            const laskeAlkuluvut = () => {
                const luku = parseInt(alkulukuInput.value);
                if (isNaN(luku)) {
                    alkulukuTulos.innerHTML = ''; return;
                }
                let tulosHtml = `<p>${luku} on ${onkoAlkuluku(luku) ? '' : '<strong>ei</strong> ole'} alkuluku.</p>`;
                if (luku > 1 && luku <= 100000) {
                     const loydetyt = [];
                     for(let i = 2; i <= luku; i++) {
                         if (onkoAlkuluku(i)) loydetyt.push(i);
                     }
                     tulosHtml += `<hr style="border-color: var(--color-border); margin: 10px 0;"><p>Alkuluvut ${luku} asti: ${loydetyt.join(', ')}</p>`;
                }
                alkulukuTulos.innerHTML = tulosHtml;
            };

            const laskeNumerosumma = () => {
                const lukuStr = nsummaInput.value;
                if (lukuStr === '') { nsummaTulos.innerHTML = ''; return; }
                const ristiSumma = lukuStr.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
                
                let iteroitu = ristiSumma;
                while (iteroitu > 9) {
                    iteroitu = iteroitu.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
                }
                nsummaTulos.innerHTML = `<p>Ristisumma: <strong>${ristiSumma}</strong></p><p>Iteroitu numerosumma: <strong>${iteroitu}</strong></p>`;
            };

            alkulukuInput.addEventListener('input', laskeAlkuluvut);
            nsummaInput.addEventListener('input', laskeNumerosumma);
            laskeAlkuluvut();
            laskeNumerosumma();
        };

        const alustaVastusLaskuri = () => {
            const container = document.getElementById('vastus');
            if(!container) return;

            const colorMap = [
                { name: 'Musta', value: 0, multiplier: 1, tolerance: null, color: '#000000' },
                { name: 'Ruskea', value: 1, multiplier: 10, tolerance: 1, color: '#A52A2A' },
                { name: 'Punainen', value: 2, multiplier: 100, tolerance: 2, color: '#FF0000' },
                { name: 'Oranssi', value: 3, multiplier: 1000, tolerance: null, color: '#FFA500' },
                { name: 'Keltainen', value: 4, multiplier: 10000, tolerance: null, color: '#FFFF00' },
                { name: 'Vihreä', value: 5, multiplier: 100000, tolerance: 0.5, color: '#008000' },
                { name: 'Sininen', value: 6, multiplier: 1000000, tolerance: 0.25, color: '#0000FF' },
                { name: 'Violetti', value: 7, multiplier: 10000000, tolerance: 0.1, color: '#EE82EE' },
                { name: 'Harmaa', value: 8, multiplier: 100000000, tolerance: 0.05, color: '#808080' },
                { name: 'Valkoinen', value: 9, multiplier: 1000000000, tolerance: null, color: '#FFFFFF' },
                { name: 'Kulta', value: null, multiplier: 0.1, tolerance: 5, color: '#FFD700' },
                { name: 'Hopea', value: null, multiplier: 0.01, tolerance: 10, color: '#C0C0C0' },
            ];
            
            let optionsHtml = colorMap.map((c, i) => `<option value="${i}" style="background-color: ${c.color}; color: ${i > 7 ? '#000' : '#FFF'};">${c.name}</option>`).join('');

            container.innerHTML = `
                <div class="muunnin-ryhma">
                    <label for="vastus-renkaat">Renkaiden määrä</label>
                    <select id="vastus-renkaat"><option value="4">4</option><option value="5">5</option></select>
                </div>
                <div id="vastus-valitsimet" style="display:grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-top:15px;"></div>
                <div id="vastus-tulos" class="tulos-box" style="margin-top:20px;"></div>
            `;
            
            const renkaatSelect = document.getElementById('vastus-renkaat');
            const valitsimetDiv = document.getElementById('vastus-valitsimet');
            const tulosDiv = document.getElementById('vastus-tulos');

            const luoValitsimet = () => {
                const count = parseInt(renkaatSelect.value);
                valitsimetDiv.innerHTML = '';
                for(let i = 1; i <= count; i++) {
                    valitsimetDiv.innerHTML += `
                        <div class="muunnin-ryhma">
                            <label style="font-size: 0.8em; text-align:center;">Rengas ${i}</label>
                            <select id="vastus-rengas-${i}">${optionsHtml}</select>
                        </div>`;
                }
                // Piilota viimeinen valitsin, jos renkaita on 4
                if(count === 4) {
                   const five = document.createElement('div');
                   valitsimetDiv.appendChild(five);
                }

                document.querySelectorAll('#vastus-valitsimet select').forEach(s => {
                    s.addEventListener('change', laskeVastus);
                    // Aseta oletusvärit
                    const ringId = parseInt(s.id.split('-')[2]);
                    if (count === 4) {
                        if (ringId === 1) s.value = 4; // Keltainen
                        if (ringId === 2) s.value = 7; // Violetti
                        if (ringId === 3) s.value = 2; // Punainen
                        if (ringId === 4) s.value = 10; // Kulta
                    } else {
                         if (ringId === 1) s.value = 2; // Punainen
                         if (ringId === 2) s.value = 0; // Musta
                         if (ringId === 3) s.value = 0; // Musta
                         if (ringId === 4) s.value = 1; // Ruskea
                         if (ringId === 5) s.value = 1; // Ruskea
                    }
                });
                laskeVastus();
            };
            
            const formatOhms = (ohms) => {
                if (ohms >= 1e9) return (ohms / 1e9).toPrecision(3) + ' GΩ';
                if (ohms >= 1e6) return (ohms / 1e6).toPrecision(3) + ' MΩ';
                if (ohms >= 1e3) return (ohms / 1e3).toPrecision(3) + ' kΩ';
                return ohms.toPrecision(3) + ' Ω';
            };

            const laskeVastus = () => {
                const count = parseInt(renkaatSelect.value);
                const values = [];
                for(let i = 1; i <= count; i++) {
                    values.push(parseInt(document.getElementById(`vastus-rengas-${i}`).value));
                }
                
                let arvoStr = '';
                let kerroinIdx, toleranssiIdx;

                if (count === 4) {
                    arvoStr = `${colorMap[values[0]].value}${colorMap[values[1]].value}`;
                    kerroinIdx = values[2];
                    toleranssiIdx = values[3];
                } else { // 5-rengasta
                    arvoStr = `${colorMap[values[0]].value}${colorMap[values[1]].value}${colorMap[values[2]].value}`;
                    kerroinIdx = values[3];
                    toleranssiIdx = values[4];
                }

                const arvo = parseInt(arvoStr);
                const kerroin = colorMap[kerroinIdx].multiplier;
                const toleranssi = colorMap[toleranssiIdx].tolerance;

                if(isNaN(arvo) || kerroin === null) {
                    tulosDiv.textContent = 'Virheellinen valinta.'; return;
                }

                const lopullinenArvo = arvo * kerroin;
                tulosDiv.innerHTML = `Arvo: <strong>${formatOhms(lopullinenArvo)}</strong>` + 
                                   (toleranssi !== null ? ` ±${toleranssi}%` : '');
            };

            renkaatSelect.addEventListener('change', luoValitsimet);
            luoValitsimet();
        };


        const initializers = [
            { id: 'koordinaatit', func: alustaKoordinaattiMuunnin },
            { id: 'paivamaarat', func: alustaPaivamaaraLaskuri },
            { id: 'teksti', func: alustaTekstiMuunnin },
            { id: 'aika', func: alustaAikaMuunnin },
            { id: 'pituus', func: () => alustaVakioMuunnin('pituus', yksikot.pituus) },
            { id: 'nopeus', func: () => alustaVakioMuunnin('nopeus', yksikot.nopeus) },
            { id: 'massa', func: () => alustaVakioMuunnin('massa', yksikot.massa) },
            { id: 'pinta-ala', func: () => alustaVakioMuunnin('pinta_ala', yksikot.pinta_ala) },
            { id: 'tilavuus', func: () => alustaVakioMuunnin('tilavuus', yksikot.tilavuus) },
            { id: 'voima', func: () => alustaVakioMuunnin('voima', yksikot.voima) },
            { id: 'apteekkari_massa', func: () => alustaVakioMuunnin('apteekkari_massa', yksikot.apteekkari_massa) },
            { id: 'polttoaine', func: alustaPolttoaineMuunnin },
            { id: 'typografia', func: alustaTypografiaMuunnin },
            { id: 'paine', func: () => alustaVakioMuunnin('paine', yksikot.paine) },
            { id: 'energia', func: () => alustaVakioMuunnin('energia', yksikot.energia) },
            { id: 'teho', func: () => alustaVakioMuunnin('teho', yksikot.teho) },
            { id: 'data', func: () => alustaVakioMuunnin('data', yksikot.data) },
            { id: 'kulma', func: () => alustaVakioMuunnin('kulma', yksikot.kulma) },
            { id: 'roomalaiset', func: alustaRoomalainenMuunnin },
            { id: 'luvut', func: alustaLukujarjestelmaMuunnin },
            { id: "ruoanlaitto", func: alustaRuoanlaittoMuunnin },
            { id: "verensokeri", func: alustaVerensokeriMuunnin },
            { id: "bmi", func: alustaBmiLaskuri },
            { id: "yksikkosanasto", func: alustaYksikkoSanasto },
            { id: 'prosentti', func: alustaProsenttiLaskuri },
            { id: 'kalorit', func: alustaKaloriLaskuri },
            { id: 'numerot', func: alustaNumeroTyokalut },
            { id: 'vastus', func: alustaVastusLaskuri },
            { id: 'varit', func: alustaVariMuunnin },
        ];

        initializers.forEach(init => {
            try {
                if (document.getElementById(init.id)) {
                   init.func();
                }
            } catch (e) {
                console.error(`Virhe muuntimen "${init.id}" alustuksessa:`, e);
                const errorTab = document.querySelector(`.valilehti-nappi[data-valilehti="${init.id}"]`);
                if (errorTab) {
                    errorTab.style.color = 'red';
                    errorTab.style.textDecoration = 'line-through';
                    errorTab.title = `Lataus epäonnistui: ${e.message}`;
                }
            }
        });
    }

    main();
});
