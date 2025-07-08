/*
  MK MUUNTIMET
  Versio 16.0 - Sähkö- ja säteily-yksiköt
*/
document.addEventListener('DOMContentLoaded', () => {
    
    async function main() {
        let yksikot;
        try {
            const response = await fetch('yksikot.json');
            if (!response.ok) {
                throw new Error(`Verkkovirhe: ${response.statusText}`);
            }
            yksikot = await response.json();
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
                    if(a.kerroin === b.kerroin) return a.name.localeCompare(b.name);
                    return a.kerroin - b.kerroin;
                });
                [mistaSelect, mihinSelect].forEach(select => {
                    select.innerHTML = '';
                    const groups = {};
                    yksikkoData.forEach(y => {
                        const groupLabel = y.tyyppi || 'Yleiset yksiköt';
                        if(!groups[groupLabel]) {
                            groups[groupLabel] = document.createElement('optgroup');
                            groups[groupLabel].label = groupLabel.charAt(0).toUpperCase() + groupLabel.slice(1);
                        }
                        const option = new Option(y.name, y.sym);
                        if (y.selite) { option.title = y.selite; }
                        groups[groupLabel].appendChild(option);
                    });
                     Object.keys(groups).sort().forEach(key => select.appendChild(groups[key]));
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
            const elements={input:document.getElementById('teksti-input'),output:document.getElementById('teksti-output'),type:document.getElementById('teksti-tyyppi'),swap:document.getElementById('teksti-swap'),vigenereWrapper:document.getElementById('vigenere-key-wrapper'),vigenereKey:document.getElementById('vigenere-key')};const morseMap={'a':'.-','b':'-...','c':'-.-.','d':'-..','e':'.','f':'..-.','g':'--.','h':'....','i':'..','j':'.---','k':'-.-','l':'.-..','m':'--','n':'-.','o':'---','p':'.--.','q':'--.-','r':'.-.','s':'...','t':'-','u':'..-','v':'...-','w':'.--','x':'-..-','y':'-.--','z':'--..','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.','0':'-----',' ':'/'};const revMorseMap=Object.fromEntries(Object.entries(morseMap).map(a=>a.reverse()));const phoneMap={'a':'2','b':'22','c':'222','d':'3','e':'33','f':'333','g':'4','h':'44','i':'444','j':'5','k':'55','l':'555','m':'6','n':'66','o':'666','p':'7','q':'77','r':'777','s':'7777','t':'8','u':'88','v':'888','w':'9','x':'99','y':'999','z':'9999',' ':'0'};const revPhoneMap=Object.fromEntries(Object.entries(phoneMap).map(a=>a.reverse()));const fns={a1z26:{e:s=>s.toLowerCase().split('').map(c=>(c>='a'&&c<='z')?c.charCodeAt(0)-96:c).join(' '),d:s=>s.split(' ').map(n=>(n>0&&n<27)?String.fromCharCode(parseInt(n)+96):n).join('')},rot13:{e:s=>s.replace(/[a-zA-Z]/g,c=>String.fromCharCode(c.charCodeAt(0)+(c.toLowerCase()<'n'?13:-13)))},atbash:{e:s=>s.replace(/[a-zA-Z]/g,c=>{const base=c<='Z'?'A'.charCodeAt(0):'a'.charCodeAt(0);return String.fromCharCode(base*2+25-c.charCodeAt(0));})},phonepad:{e:s=>s.toLowerCase().split('').map(c=>phoneMap[c]||c).join(' '),d:s=>s.split(' ').map(c=>revPhoneMap[c]||c).join('')},base64:{e:s=>btoa(unescape(encodeURIComponent(s))),d:s=>{try{return decodeURIComponent(escape(atob(s)))}catch(e){return"Virheellinen Base64"}}},morse:{e:s=>s.toLowerCase().split('').map(c=>morseMap[c]||'').join(' '),d:s=>s.split(' ').map(c=>revMorseMap[c]||'').join('')},binary:{e:s=>s.split('').map(c=>c.charCodeAt(0).toString(2).padStart(8,'0')).join(' '),d:s=>s.split(/[\s\r\n]+/).filter(Boolean).map(b=>String.fromCharCode(parseInt(b,2))).join('')},hex:{e:s=>s.split('').map(c=>c.charCodeAt(0).toString(16).padStart(2,'0').toUpperCase()).join(' '),d:s=>s.replace(/[\s\r\n]+/g,'').split(/(..)/).filter(Boolean).map(h=>String.fromCharCode(parseInt(h,16))).join('')},vigenere:{run:(str,key,decode)=>{if(!key)return"Avainsana puuttuu.";key=key.toLowerCase().replace(/[^a-z]/g,'');if(!key)return"Avainsana virheellinen.";let keyIndex=0;let result='';for(let i=0;i<str.length;i++){const charCode=str.charCodeAt(i);if(charCode>=65&&charCode<=90){const keyShift=key.charCodeAt(keyIndex%key.length)-97;const shift=decode?(26-keyShift):keyShift;result+=String.fromCharCode(((charCode-65+shift)%26)+65);keyIndex++}else if(charCode>=97&&charCode<=122){const keyShift=key.charCodeAt(keyIndex%key.length)-97;const shift=decode?(26-keyShift):keyShift;result+=String.fromCharCode(((charCode-97+shift)%26)+97);keyIndex++}else{result+=str[i]}}return result}}};fns.rot13.d=fns.rot13.e;fns.atbash.d=fns.atbash.e;fns.vigenere.e=(s,k)=>fns.vigenere.run(s,k,false);fns.vigenere.d=(s,k)=>fns.vigenere.run(s,k,true);let currentDirection='e';const muunna=()=>{const typeVal=elements.type.value;elements.vigenereWrapper.style.display=typeVal==='vigenere'?'block':'none';const fn=fns[typeVal];const key=elements.vigenereKey.value;if(currentDirection==='e'){elements.output.value=fn.e?fn.e(elements.input.value,key):'Suunta ei tuettu'}else{elements.input.value=fn.d?fn.d(elements.output.value,key):'Suunta ei tuettu'}};elements.input.addEventListener('input',()=>{currentDirection='e';muunna()});elements.output.addEventListener('input',()=>{currentDirection='d';muunna()});elements.type.addEventListener('change',muunna);elements.vigenereKey.addEventListener('input',muunna);elements.swap.addEventListener('click',()=>{const temp=elements.input.value;elements.input.value=elements.output.value;elements.output.value=temp;muunna()});
        };

        const alustaYksikkoSanasto = () => {
            const container = document.getElementById('yksikkosanasto');
            if (!container) return;
            
            const kategoriat = {
                pituus: 'Pituus', massa: 'Massa', apteekkari_massa: 'Massa (Apteekkarin mitat)',
                voima: 'Voima', pinta_ala: 'Pinta-ala', tilavuus: 'Tilavuus', nopeus: 'Nopeus', aika: 'Aika',
                sahko: 'Sähkö ja Magnetismi', sateily: 'Säteily', data: 'Data',
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
        
        // ... (Kaikki muut alustusfunktiot, kuten alustaBmiLaskuri, alustaProsenttiLaskuri jne. tulevat tähän)

        const initializers = [
            { id: 'koordinaatit', func: alustaKoordinaattiMuunnin }, { id: 'paivamaarat', func: alustaPaivamaaraLaskuri },
            { id: 'teksti', func: alustaTekstiMuunnin }, { id: 'aika', func: alustaAikaMuunnin },
            { id: 'pituus', func: () => alustaVakioMuunnin('pituus', yksikot.pituus || []) },
            { id: 'nopeus', func: () => alustaVakioMuunnin('nopeus', yksikot.nopeus || []) },
            { id: 'massa', func: () => alustaVakioMuunnin('massa', yksikot.massa || []) },
            { id: 'pinta-ala', func: () => alustaVakioMuunnin('pinta-ala', yksikot.pinta_ala || []) },
            { id: 'tilavuus', func: () => alustaVakioMuunnin('tilavuus', yksikot.tilavuus || []) },
            { id: 'voima', func: () => alustaVakioMuunnin('voima', yksikot.voima || []) },
            { id: 'energia', func: () => alustaVakioMuunnin('energia', yksikot.energia || []) },
            { id: 'teho', func: () => alustaVakioMuunnin('teho', yksikot.teho || []) },
            { id: 'sahko', func: () => alustaVakioMuunnin('sahko', yksikot.sahko || []) },
            { id: 'sateily', func: () => alustaVakioMuunnin('sateily', yksikot.sateily || []) },
            { id: 'data', func: () => alustaVakioMuunnin('data', yksikot.data || []) },
            { id: 'paine', func: () => alustaVakioMuunnin('paine', yksikot.paine || []) },
            { id: 'kulma', func: () => alustaVakioMuunnin('kulma', yksikot.kulma || []) },
            { id: 'typografia', func: () => alustaVakioMuunnin('typografia', yksikot.typografia || []) },
            { id: 'ruoanlaitto', func: alustaRuoanlaittoMuunnin },
            { id: 'apteekkari_massa', func: () => alustaVakioMuunnin('apteekkari_massa', yksikot.apteekkari_massa || []) },
            { id: 'lampotila', func: alustaLampotilaMuunnin }, { id: 'roomalaiset', func: alustaRoomalainenMuunnin }, 
            { id: 'luvut', func: alustaLukujarjestelmaMuunnin }, { id: "verensokeri", func: alustaVerensokeriMuunnin }, 
            { id: "bmi", func: alustaBmiLaskuri }, { id: "yksikkosanasto", func: alustaYksikkoSanasto }, 
            { id: 'prosentti', func: alustaProsenttiLaskuri }, { id: 'kalorit', func: alustaKaloriLaskuri }, 
            { id: 'numerot', func: alustaNumeroTyokalut }, { id: 'vastus', func: alustaVastusLaskuri }, 
            { id: 'varit', func: alustaVariMuunnin }
        ];

        initializers.forEach(init => {
            try {
                if (document.getElementById(init.id)) init.func();
            } catch (e) {
                console.error(`Virhe muuntimen "${init.id}" alustuksessa:`, e);
                const errorTab = document.querySelector(`.valilehti-nappi[data-valilehti="${init.id}"]`);
                if (errorTab) { errorTab.style.color = 'red'; errorTab.style.textDecoration = 'line-through'; errorTab.title = `Lataus epäonnistui: ${e.message}`; }
            }
        });
    }

    main();
});
