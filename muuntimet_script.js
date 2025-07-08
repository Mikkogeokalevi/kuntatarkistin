/*
  MK MUUNTIMET
  Versio 12.0 - Datan lataus JSON-tiedostosta (Korjattu Yksikkösanasto)
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
                tulosInput.value = (arvo * mistaKerroin / mihinKerroin).toLocaleString('fi-FI', { maximumFractionDigits: 6 });
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
            container.innerHTML = `<div class="muunnin-ryhma"><label for="teksti-tyyppi">Muunnos</label><select id="teksti-tyyppi"><option value="a1z26">A1Z26</option><option value="rot13">ROT13</option><option value="base64">Base64</option><option value="morse">Morse-koodi</option><option value="binary">Teksti ↔ Binääri (ASCII)</option><option value="hex">Teksti ↔ Heksa (ASCII)</option><option value="vigenere">Vigenère-salakirjoitus</option></select></div><div id="vigenere-key-wrapper" class="muunnin-ryhma" style="display:none;"><label for="vigenere-key">Avainsana</label><input type="text" id="vigenere-key"></div><div class="muunnin-ryhma"><label>Selkokieli</label><textarea id="teksti-input" rows="4"></textarea></div><div style="text-align: center; margin-bottom: 15px;"><button class="swap-btn" id="teksti-swap" title="Vaihda suunta">↑↓</button></div><div class="muunnin-ryhma"><label>Salakieli</label><textarea id="teksti-output" rows="4"></textarea></div>`;
            const elements={input:document.getElementById('teksti-input'),output:document.getElementById('teksti-output'),type:document.getElementById('teksti-tyyppi'),swap:document.getElementById('teksti-swap'),vigenereWrapper:document.getElementById('vigenere-key-wrapper'),vigenereKey:document.getElementById('vigenere-key')};const morseMap={'a':'.-','b':'-...','c':'-.-.','d':'-..','e':'.','f':'..-.','g':'--.','h':'....','i':'..','j':'.---','k':'-.-','l':'.-..','m':'--','n':'-.','o':'---','p':'.--.','q':'--.-','r':'.-.','s':'...','t':'-','u':'..-','v':'...-','w':'.--','x':'-..-','y':'-.--','z':'--..','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.','0':'-----',' ':'/'};const revMorseMap=Object.fromEntries(Object.entries(morseMap).map(a=>a.reverse()));const fns={a1z26:{e:s=>s.toLowerCase().split('').map(c=>(c>='a'&&c<='z')?c.charCodeAt(0)-96:c).join(' '),d:s=>s.split(' ').map(n=>(n>0&&n<27)?String.fromCharCode(parseInt(n)+96):n).join('')},rot13:{e:s=>s.replace(/[a-zA-Z]/g,c=>String.fromCharCode(c.charCodeAt(0)+(c.toLowerCase()<'n'?13:-13)))},base64:{e:s=>btoa(unescape(encodeURIComponent(s))),d:s=>{try{return decodeURIComponent(escape(atob(s)))}catch(e){return"Virheellinen Base64"}}},morse:{e:s=>s.toLowerCase().split('').map(c=>morseMap[c]||'').join(' '),d:s=>s.split(' ').map(c=>revMorseMap[c]||'').join('')},binary:{e:s=>s.split('').map(c=>c.charCodeAt(0).toString(2).padStart(8,'0')).join(' '),d:s=>s.split(/[\s\r\n]+/).filter(Boolean).map(b=>String.fromCharCode(parseInt(b,2))).join('')},hex:{e:s=>s.split('').map(c=>c.charCodeAt(0).toString(16).padStart(2,'0').toUpperCase()).join(' '),d:s=>s.replace(/[\s\r\n]+/g,'').split(/(..)/).filter(Boolean).map(h=>String.fromCharCode(parseInt(h,16))).join('')},vigenere:{run:(str,key,decode)=>{if(!key)return"Avainsana puuttuu.";key=key.toLowerCase().replace(/[^a-z]/g,'');if(!key)return"Avainsana virheellinen.";let keyIndex=0;let result='';for(let i=0;i<str.length;i++){const charCode=str.charCodeAt(i);if(charCode>=65&&charCode<=90){const keyShift=key.charCodeAt(keyIndex%key.length)-97;const shift=decode?(26-keyShift):keyShift;result+=String.fromCharCode(((charCode-65+shift)%26)+65);keyIndex++}else if(charCode>=97&&charCode<=122){const keyShift=key.charCodeAt(keyIndex%key.length)-97;const shift=decode?(26-keyShift):keyShift;result+=String.fromCharCode(((charCode-97+shift)%26)+97);keyIndex++}else{result+=str[i]}}return result}}};fns.rot13.d=fns.rot13.e;fns.vigenere.e=(s,k)=>fns.vigenere.run(s,k,false);fns.vigenere.d=(s,k)=>fns.vigenere.run(s,k,true);const muunna=source=>{const typeVal=elements.type.value;elements.vigenereWrapper.style.display=typeVal==='vigenere'?'block':'none';const fn=fns[typeVal];const key=elements.vigenereKey.value;if(source==='input'){elements.output.value=fn.e(elements.input.value,key)}else{elements.input.value=fn.d(elements.output.value,key)}};elements.input.addEventListener('input',()=>muunna('input'));elements.output.addEventListener('input',()=>muunna('output'));elements.type.addEventListener('input',()=>muunna('input'));elements.vigenereKey.addEventListener('input',()=>muunna('input'));
        };

        const alustaTypografiaMuunnin = () => {
            const id = 'typografia'; const container = document.getElementById(id);
            container.innerHTML = `<div class="yksikko-muunnin"><div class="muunnin-ryhma grid-item-arvo" style="grid-column: 1 / -1;"><label for="typo-base">Perusfonttikoko (px)</label><input type="number" id="typo-base" value="16" style="max-width: 150px;"></div><div class="muunnin-ryhma grid-item-arvo"><label for="typografia-arvo">Arvo</label><input type="number" id="typografia-arvo" value="1"></div><div class="muunnin-ryhma grid-item-tulos"><label for="typografia-tulos">Tulos</label><div class="input-wrapper"><input type="text" id="typografia-tulos" readonly><button class="copy-btn" title="Kopioi">📋</button></div></div><div class="muunnin-ryhma grid-item-mista"><label for="typografia-yksikko-mista">Mistä</label><select id="typografia-yksikko-mista"></select></div><button class="swap-btn grid-item-swap" title="Vaihda">↔</button><div class="muunnin-ryhma grid-item-mihin"><label for="typografia-yksikko-mihin">Mihin</label><select id="typografia-yksikko-mihin"></select></div></div>`;
            const arvoInput=document.getElementById(`typografia-arvo`),tulosInput=document.getElementById(`typografia-tulos`),mistaSelect=document.getElementById(`typografia-yksikko-mista`),mihinSelect=document.getElementById(`typografia-yksikko-mihin`),baseInput=document.getElementById('typo-base'),swapBtn=container.querySelector('.swap-btn'),copyBtn=container.querySelector('.copy-btn');
            const typoYksikot = yksikot.typografia;
            [mistaSelect, mihinSelect].forEach(select => {
                typoYksikot.forEach(u => {
                    const option = new Option(u.name, u.sym);
                    if (u.selite) option.title = u.selite;
                    select.add(option);
                });
            });
            mihinSelect.selectedIndex=1;
            const laske=()=>{
                const baseSize=parseFloat(baseInput.value)||16;
                let arvo=parseFloat(arvoInput.value)||0;
                switch(mistaSelect.value){
                    case 'pt': arvo = arvo * 4 / 3; break;
                    case 'em': case 'rem': arvo = arvo * baseSize; break;
                    case 'cic': arvo = arvo * 17.1; break;
                }
                let tulos;
                switch(mihinSelect.value){
                    case 'px': tulos=arvo; break;
                    case 'pt': tulos=arvo * 3 / 4; break;
                    case 'em': case 'rem': tulos = arvo / baseSize; break;
                    case 'cic': tulos = arvo / 17.1; break;
                    default: tulos=arvo;
                }
                tulosInput.value=tulos.toLocaleString('fi-FI',{maximumFractionDigits:3})
            };
            swapBtn.addEventListener('click',()=>{const temp=mistaSelect.selectedIndex;mistaSelect.selectedIndex=mihinSelect.selectedIndex;mihinSelect.selectedIndex=temp;laske()});
            copyBtn.addEventListener('click',()=>{navigator.clipboard.writeText(tulosInput.value).then(()=>{const originalText=copyBtn.textContent;copyBtn.textContent='✅';setTimeout(()=>copyBtn.textContent=originalText,1500)})});
            [arvoInput,mistaSelect,mihinSelect,baseInput].forEach(el=>el.addEventListener('input',laske));
            laske();
        };
        
        const alustaAikaMuunnin = () => {
            const container = document.getElementById('aika');
            container.innerHTML = `<div class="muunnin-ryhma"><label for="aika-arvo">Arvo</label><input type="number" id="aika-arvo" value="1"></div><div class="muunnin-ryhma"><label for="aika-yksikko-mista">Yksikkö</label><select id="aika-yksikko-mista"></select></div><div id="aika-tulokset" class="tulos-box"></div>`;
            const arvoInput=document.getElementById('aika-arvo'),yksikkoSelect=document.getElementById('aika-yksikko-mista'),tuloksetDiv=document.getElementById('aika-tulokset');yksikot.aika.forEach(y=>yksikkoSelect.add(new Option(`${y.plural||y.name} (${y.sym})`,y.sym)));yksikkoSelect.value='h';const laske=()=>{const arvo=parseFloat(arvoInput.value)||0;const mistaKerroin=yksikot.aika.find(y=>y.sym===yksikkoSelect.value)?.kerroin||1;const sekunteina=arvo*mistaKerroin;const d=Math.floor(sekunteina/86400),h=Math.floor((sekunteina%86400)/3600),m=Math.floor((sekunteina%3600)/60),s=sekunteina%60;let html=`<p style="margin: 5px 0;"><strong>Yhteensä:</strong> ${d} pv, ${h} h, ${m} min ja ${s.toFixed(1)} s</p><hr style="border-color: var(--color-border); margin: 10px 0;">`;yksikot.aika.slice().reverse().forEach(y=>{html+=`<p style="margin: 5px 0;"><strong>${y.plural||y.name}:</strong> ${(sekunteina/y.kerroin).toLocaleString('fi-FI',{maximumFractionDigits:4})} ${y.sym}</p>`});tuloksetDiv.innerHTML=html};[arvoInput,yksikkoSelect].forEach(el=>el.addEventListener('input',laske));laske();
        };

        const alustaLampotilaMuunnin = () => {
            const id = 'lampotila';
            alustaVakioMuunnin(id, []);
            const arvoInput=document.getElementById(`${id}-arvo`),tulosInput=document.getElementById(`${id}-tulos`),mistaSelect=document.getElementById(`${id}-yksikko-mista`),mihinSelect=document.getElementById(`${id}-yksikko-mihin`);
            mistaSelect.innerHTML='';mihinSelect.innerHTML='';
            ['Celsius','Fahrenheit','Kelvin'].forEach(key=>{mistaSelect.add(new Option(key,key));mihinSelect.add(new Option(key,key))});
            mihinSelect.value='Fahrenheit';
            const laske=()=>{let arvo=parseFloat(arvoInput.value)||0;let tulos;if(mistaSelect.value==='Fahrenheit')arvo=(arvo-32)*5/9;else if(mistaSelect.value==='Kelvin')arvo=arvo-273.15;if(mihinSelect.value==='Celsius')tulos=arvo;else if(mihinSelect.value==='Fahrenheit')tulos=arvo*9/5+32;else if(mihinSelect.value==='Kelvin')tulos=arvo+273.15;tulosInput.value=tulos.toLocaleString('fi-FI',{maximumFractionDigits:2})};
            [arvoInput,mistaSelect,mihinSelect].forEach(el=>el.addEventListener('input',laske));
            laske();
        };

        const alustaPolttoaineMuunnin = () => {
            const id = 'polttoaine';
            alustaVakioMuunnin(id, []);
            const arvoInput=document.getElementById(`${id}-arvo`),tulosInput=document.getElementById(`${id}-tulos`),mistaSelect=document.getElementById(`${id}-yksikko-mista`),mihinSelect=document.getElementById(`${id}-yksikko-mihin`);
            mistaSelect.innerHTML='';mihinSelect.innerHTML='';
            const units=[{sym:'l100km',name:'L/100km'},{sym:'mpg_us',name:'MPG (US)'},{sym:'mpg_uk',name:'MPG (UK)'}];
            units.forEach(u=>{mistaSelect.add(new Option(u.name,u.sym));mihinSelect.add(new Option(u.name,u.sym))});
            mihinSelect.selectedIndex=1;
            const laske=()=>{const arvo=parseFloat(arvoInput.value);if(isNaN(arvo)||arvo===0){tulosInput.value='0';return}const mista=mistaSelect.value,mihin=mihinSelect.value;let tulos;if(mista===mihin)tulos=arvo;else if(mista==='l100km'){if(mihin==='mpg_us')tulos=235.214/arvo;else tulos=282.481/arvo}else if(mista==='mpg_us'){if(mihin==='l100km')tulos=235.214/arvo;else tulos=arvo*1.20095}else{if(mihin==='l100km')tulos=282.481/arvo;else tulos=arvo/1.20095}tulosInput.value=tulos.toLocaleString('fi-FI',{maximumFractionDigits:2})};
            [arvoInput,mistaSelect,mihinSelect].forEach(el=>el.addEventListener('input',laske));
            laske();
        };

        const alustaRoomalainenMuunnin = () => {
            const container = document.getElementById('roomalaiset');
            container.innerHTML = `<div class="yksikko-muunnin"><div class="muunnin-ryhma grid-item-arvo"><label for="rooma-arabialainen">Numero</label><input type="number" id="rooma-arabialainen" placeholder="esim. 1984"></div><button class="swap-btn grid-item-swap" title="Vaihda">↔</button><div class="muunnin-ryhma grid-item-tulos"><label for="rooma-roomalainen">Roomalainen numero</label><input type="text" id="rooma-roomalainen" placeholder="esim. MCMLXXXIV"></div></div>`;
            const arabInput=document.getElementById('rooma-arabialainen'),roomaInput=document.getElementById('rooma-roomalainen');const arabToRoman=num=>{if(isNaN(num)||num<1||num>3999)return'';const map={M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};let r='';for(let k in map){while(num>=map[k]){r+=k;num-=map[k]}}return r};const romanToArab=str=>{str=str.toUpperCase();const map={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};let r=0;for(let i=0;i<str.length;i++){const c=map[str[i]],n=map[str[i+1]];if(n&&c<n)r-=c;else r+=c}return isNaN(r)||r>3999?'':r};arabInput.addEventListener('input',()=>roomaInput.value=arabToRoman(parseInt(arabInput.value,10)));roomaInput.addEventListener('input',()=>arabInput.value=romanToArab(roomaInput.value));
        };

        const alustaLukujarjestelmaMuunnin = () => {
            const container = document.getElementById('luvut');
            container.innerHTML = `<div class="muunnin-ryhma"><label for="luku-dec">Desimaali (10)</label><input type="text" id="luku-dec" placeholder="esim. 42"></div><div class="muunnin-ryhma"><label for="luku-bin">Binääri (2)</label><input type="text" id="luku-bin" placeholder="esim. 101010"></div><div class="muunnin-ryhma"><label for="luku-oct">Oktaali (8)</label><input type="text" id="luku-oct" placeholder="esim. 52"></div><div class="muunnin-ryhma"><label for="luku-hex">Heksadesimaali (16)</label><input type="text" id="luku-hex" placeholder="esim. 2A"></div>`;
            const inputs={dec:10,bin:2,oct:8,hex:16};Object.keys(inputs).forEach(key=>{document.getElementById(`luku-${key}`).addEventListener('input',e=>{const arvo=e.target.value;const pohja=inputs[key];if(arvo===''){Object.keys(inputs).forEach(otherKey=>{document.getElementById(`luku-${otherKey}`).value=''});return}const desimaaliArvo=parseInt(arvo,pohja);if(isNaN(desimaaliArvo))return;Object.keys(inputs).forEach(otherKey=>{if(key!==otherKey)document.getElementById(`luku-${otherKey}`).value=desimaaliArvo.toString(inputs[otherKey]).toUpperCase()})})});
        };

        const alustaRuoanlaittoMuunnin = () => {
            const id = 'ruoanlaitto';
            const container = document.getElementById(id);
            if (!container) return;
            container.innerHTML = `<div class="muunnin-ryhma"><label for="${id}-ainesosa">Ainesosa</label><select id="${id}-ainesosa"></select></div>
                <div class="yksikko-muunnin" style="grid-template-columns: 1fr 1fr;">
                    <div class="muunnin-ryhma" style="grid-column: 1;"><label for="${id}-dl">Tilavuus (dl)</label><input type="number" id="${id}-dl" value="1"></div>
                    <div class="muunnin-ryhma" style="grid-column: 2;"><label for="${id}-g">Paino (g)</label><input type="number" id="${id}-g"></div>
                </div>`;
            const ainesosaSelect = document.getElementById(`${id}-ainesosa`), dlInput = document.getElementById(`${id}-dl`), gInput = document.getElementById(`${id}-g`);
            yksikot.ruoanlaitto.forEach((item, index) => ainesosaSelect.add(new Option(item.name, index)));
            const laske = (source) => {
                const ainesosa = yksikot.ruoanlaitto[ainesosaSelect.value];
                if (!ainesosa) return;
                if (source === 'dl') {
                    const dl = parseFloat(dlInput.value) || 0;
                    gInput.value = (dl * ainesosa.g_per_dl).toFixed(1);
                } else {
                    const g = parseFloat(gInput.value) || 0;
                    dlInput.value = (g / ainesosa.g_per_dl).toFixed(2);
                }
            };
            [dlInput, ainesosaSelect].forEach(el => el.addEventListener('input', () => laske('dl')));
            gInput.addEventListener('input', () => laske('g'));
            laske('dl');
        };

        const alustaVerensokeriMuunnin = () => {
            const id = 'verensokeri';
            const container = document.getElementById(id);
            if (!container) return;
            container.innerHTML = `<div class="yksikko-muunnin" style="grid-template-columns: 1fr 1fr;">
                <div class="muunnin-ryhma" style="grid-column: 1;"><label for="sokeri-mmol">mmol/L</label><input type="number" id="sokeri-mmol"></div>
                <div class="muunnin-ryhma" style="grid-column: 2;"><label for="sokeri-mgdl">mg/dL</label><input type="number" id="sokeri-mgdl"></div>
            </div>`;
            const mmolInput = document.getElementById('sokeri-mmol'), mgdlInput = document.getElementById('sokeri-mgdl'), KERROIN = 18.018;
            mmolInput.addEventListener('input', () => {
                const arvo = parseFloat(mmolInput.value);
                mgdlInput.value = isNaN(arvo) ? '' : (arvo * KERROIN).toFixed(1);
            });
            mgdlInput.addEventListener('input', () => {
                const arvo = parseFloat(mgdlInput.value);
                mmolInput.value = isNaN(arvo) ? '' : (arvo / KERROIN).toFixed(1);
            });
        };

        const alustaBmiLaskuri = () => {
            const id = 'bmi';
            const container = document.getElementById(id);
            if (!container) return;
            container.innerHTML = `<div class="yksikko-muunnin" style="grid-template-columns: 1fr 1fr;">
                <div class="muunnin-ryhma" style="grid-column: 1;"><label for="bmi-pituus">Pituus (cm)</label><input type="number" id="bmi-pituus"></div>
                <div class="muunnin-ryhma" style="grid-column: 2;"><label for="bmi-paino">Paino (kg)</label><input type="number" id="bmi-paino"></div>
            </div>
            <div id="bmi-tulos" class="bmi-result-box" style="display: none;"></div>`;
            const pituusInput = document.getElementById('bmi-pituus'), painoInput = document.getElementById('bmi-paino'), tulosBox = document.getElementById('bmi-tulos');
            const laske = () => {
                const pituus = parseFloat(pituusInput.value), paino = parseFloat(painoInput.value);
                if (isNaN(pituus) || isNaN(paino) || pituus <= 0 || paino <= 0) {
                    tulosBox.style.display = 'none'; return;
                }
                const pituusM = pituus / 100;
                const bmi = paino / (pituusM * pituusM);
                let selite, color;
                if (bmi < 18.5) { selite = "Merkittävä alipaino"; color = "#0d6efd"; }
                else if (bmi < 25) { selite = "Normaali paino"; color = "#90EE90"; }
                else if (bmi < 30) { selite = "Lievä ylipaino"; color = "#FFD700"; }
                else { selite = "Merkittävä ylipaino"; color = "#dc3545"; }
                tulosBox.innerHTML = `${bmi.toFixed(1)} <span>${selite}</span>`;
                tulosBox.style.backgroundColor = color;
                tulosBox.style.color = (bmi >= 18.5 && bmi < 30) ? 'var(--color-bg)' : 'var(--color-text-primary)';
                tulosBox.style.display = 'block';
            };
            [pituusInput, painoInput].forEach(el => el.addEventListener('input', laske));
        };

        const alustaYksikkoSanasto = () => {
            const container = document.getElementById('yksikkosanasto');
            if (!container) return;
            
            // Korjattu: Käytetään kategorioita, joille on varmasti dataa.
            const kategoriat = {
                pituus: 'Pituus',
                massa: 'Massa (Avoirdupois)',
                apteekkari_massa: 'Massa (Apteekkarin mitat)',
                voima: 'Voima',
                pinta_ala: 'Pinta-ala',
                tilavuus: 'Tilavuus',
                nopeus: 'Nopeus',
                aika: 'Aika',
                data: 'Data',
                paine: 'Paine',
                energia: 'Energia',
                teho: 'Teho',
                kulma: 'Kulma',
                sahko: 'Sähkösuureet',
                sateily: 'Säteily'
            };

            let html = `<input type="text" id="sanasto-haku" placeholder="Hae yksiköitä nimellä tai lyhenteellä...">`;
            html += '<div id="sanasto-lista">';

            for (const avain in kategoriat) {
                // Korjattu: Varmistetaan, että data on olemassa ja se on taulukko (array).
                // Tämä estää skriptin kaatumisen, jos avainta ei löydy yksikot.json-tiedostosta.
                if (yksikot[avain] && Array.isArray(yksikot[avain])) {
                    html += `<div class="yksikko-lista-osio" data-kategoria="${avain}"><h3>${kategoriat[avain]}</h3><ul>`;
                    
                    // Järjestetään yksiköt aakkosjärjestykseen nimen perusteella.
                    const sortedUnits = [...yksikot[avain]].sort((a, b) => a.name.localeCompare(b.name));
                    
                    sortedUnits.forEach(y => {
                        const nimiJaSym = `${y.name.toLowerCase()} ${y.sym?.toLowerCase()}`;
                        html += `<li data-nimi="${nimiJaSym}"><strong>${y.name} (${y.sym || '–'})</strong><span>${y.selite || 'Ei selitettä.'}</span></li>`;
                    });
                    html += '</ul></div>';
                }
            }
            html += '</div>';
            container.innerHTML = html;

            // Haun alustus
            const hakuInput = document.getElementById('sanasto-haku');
            const listanRivit = container.querySelectorAll('#sanasto-lista li');
            const kategoriaOtsikot = container.querySelectorAll('.yksikko-lista-osio');

            hakuInput.addEventListener('input', (e) => {
                const hakusana = e.target.value.toLowerCase().trim();
                
                listanRivit.forEach(li => {
                    const onOsuma = li.dataset.nimi.includes(hakusana);
                    li.style.display = onOsuma ? '' : 'none';
                });

                // Piilota koko kategoria, jos siinä ei ole näkyviä rivejä haun jälkeen.
                kategoriaOtsikot.forEach(osio => {
                    const nakyvatRivit = osio.querySelectorAll('li[style=""]');
                    osio.style.display = nakyvatRivit.length > 0 ? '' : 'none';
                });
            });
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
            { id: 'sahko', func: () => alustaVakioMuunnin('sahko', yksikot.sahko) },
            { id: 'sateily', func: () => alustaVakioMuunnin('sateily', yksikot.sateily) },
            { id: 'lampotila', func: alustaLampotilaMuunnin },
            { id: 'roomalaiset', func: alustaRoomalainenMuunnin },
            { id: 'luvut', func: alustaLukujarjestelmaMuunnin },
            { id: 'ruoanlaitto', func: alustaRuoanlaittoMuunnin },
            { id: 'verensokeri', func: alustaVerensokeriMuunnin },
            { id: 'bmi', func: alustaBmiLaskuri },
            { id: 'prosentti', func: alustaProsenttiLaskuri },
            { id: 'kalorit', func: alustaKaloriLaskuri },
            { id: 'numerot', func: alustaNumeroTyokalut },
            { id: 'vastus', func: alustaVastusLaskuri },
            { id: 'varit', func: alustaVariMuunnin },
            { id: 'yksikkosanasto', func: alustaYksikkoSanasto },
        ];

        initializers.forEach(init => {
            // Lisätään tarkistus, onko funktio olemassa ennen kutsua
            if (typeof init.func === 'function') {
                try {
                    // Tarkistetaan myös, onko välilehden elementti olemassa DOM:ssa
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
            } else {
                 // Merkitään välilehti virheelliseksi, jos funktiota ei ole määritelty
                 console.error(`Alustusfunktiota ei löytynyt muuntimelle: "${init.id}"`);
                 const errorTab = document.querySelector(`.valilehti-nappi[data-valilehti="${init.id}"]`);
                 if (errorTab) {
                    errorTab.style.color = 'red';
                    errorTab.style.textDecoration = 'line-through';
                    errorTab.title = `Alustusfunktiota ei ole määritelty`;
                 }
            }
        });
    }

    main();
});
