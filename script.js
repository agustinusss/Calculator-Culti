document.addEventListener('DOMContentLoaded', () => {
    // --- Navigation Logic ---
    const navTools = document.querySelectorAll('.nav-tool');
    const toolSections = document.querySelectorAll('.tool-section');
    const dummyTitle = document.getElementById('dummy-title');

    navTools.forEach(nav => {
        nav.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active class from all nav items and sections
            navTools.forEach(n => n.classList.remove('active'));
            toolSections.forEach(s => s.classList.remove('active'));

            // Add active class to clicked nav
            nav.classList.add('active');

            // Show target section
            const targetId = nav.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                targetSection.classList.add('active');

                // If it's the dummy section, update its title
                if (targetId === 'dummy-section') {
                    dummyTitle.textContent = nav.getAttribute('data-title');
                }
            }
            
            // Close dropdowns when an item is clicked
            document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
        });
    });

    // --- Dropdown Click Logic ---
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const btn = dropdown.querySelector('.dropbtn');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const isActive = dropdown.classList.contains('active');
                
                // Close all others
                dropdowns.forEach(d => d.classList.remove('active'));
                
                if (!isActive) {
                    dropdown.classList.add('active');
                }
            });
        }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            dropdowns.forEach(d => d.classList.remove('active'));
        }
    });

    // --- Input Validation Security ---
    const secureInputs = document.querySelectorAll('.secure-input');

    secureInputs.forEach(input => {
        // Prevent typing non-numeric characters (except dot)
        input.addEventListener('keypress', (e) => {
            const charCode = (e.which) ? e.which : e.keyCode;
            // Allow: backspace, delete, tab, escape, enter and .
            if ([46, 8, 9, 27, 13, 110, 190].indexOf(charCode) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (charCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right, down, up
                (charCode >= 35 && charCode <= 40)) {

                // Don't allow multiple dots
                if ((charCode === 46 || charCode === 110 || charCode === 190) && input.value.indexOf('.') !== -1) {
                    e.preventDefault();
                }
                return;
            }
            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (charCode < 48 || charCode > 57)) && (charCode < 96 || charCode > 105)) {
                e.preventDefault();
            }
        });

        // Paste validation (remove non-numeric chars)
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = (e.originalEvent || e).clipboardData.getData('text/plain');

            // Sanitize: allow only numbers and a single decimal point
            let sanitized = text.replace(/[^0-9.]/g, '');
            const parts = sanitized.split('.');
            if (parts.length > 2) {
                sanitized = parts[0] + '.' + parts.slice(1).join('');
            }

            document.execCommand('insertText', false, sanitized);
        });
    });

    // --- Pet Absorb Analysis Logic ---
    const hpSekarangInput = document.getElementById('hp-sekarang');
    const hpMaksimalInput = document.getElementById('hp-maksimal');
    const atkSekarangInput = document.getElementById('atk-sekarang');
    const atkMaksimalInput = document.getElementById('atk-maksimal');

    const petInputs = [hpSekarangInput, hpMaksimalInput, atkSekarangInput, atkMaksimalInput];

    const outHp = document.getElementById('out-hp');
    const outAtk = document.getElementById('out-atk');
    const elixirList = document.getElementById('elixir-list');

    const placeholder = document.querySelector('.results-placeholder');
    const content = document.querySelector('.results-content');

    const elixirRates = [
        { name: "Perfect", rate: 0.0034 / 2, class: 'perfect', points: 5 },
        { name: "Scarce", rate: 0.00404 / 2, class: 'scarce', points: 6 },
        { name: "Epic", rate: 0.0062 / 2, class: 'epic', points: 8 },
        { name: "Legendary", rate: 0.00794 / 2, class: 'legendary', points: 10 },
        { name: "Immo", rate: 0.01247 / 2, class: 'immo', points: 14 },
        { name: "Myth", rate: 0.02041 / 2, class: 'myth', points: 20 },
        { name: "Eternal", rate: 0.03154 / 2, class: 'eternal', points: 28 },
        { name: "Celestial", rate: 0.04535 / 2, class: 'celestial', points: 36 }
    ];

    function calculateElixirs() {
        const hpSekarang = parseFloat(hpSekarangInput.value);
        const hpMaksimal = parseFloat(hpMaksimalInput.value);
        const atkSekarang = parseFloat(atkSekarangInput.value);
        const atkMaksimal = parseFloat(atkMaksimalInput.value);

        // Check if all inputs have valid numbers
        if (isNaN(hpSekarang) || isNaN(hpMaksimal) || isNaN(atkSekarang) || isNaN(atkMaksimal)) {
            placeholder.style.display = 'block';
            content.style.display = 'none';
            return;
        }

        // Validate values (current should generally not exceed max)
        let isValid = true;

        petInputs.forEach(input => input.classList.remove('invalid'));

        if (hpSekarang > hpMaksimal) {
            hpSekarangInput.classList.add('invalid');
            hpMaksimalInput.classList.add('invalid');
            isValid = false;
        }

        if (atkSekarang > atkMaksimal) {
            atkSekarangInput.classList.add('invalid');
            atkMaksimalInput.classList.add('invalid');
            isValid = false;
        }

        if (!isValid) {
            placeholder.textContent = "Current value cannot be greater than Maximum value.";
            placeholder.style.display = 'block';
            content.style.display = 'none';
            return;
        }

        // Calculations
        const kurangHp = Math.max(0, hpMaksimal - hpSekarang);
        const kurangAtk = Math.max(0, atkMaksimal - atkSekarang);

        const targetKurang = Math.max(kurangHp, kurangAtk);

        // Update Progress Bars
        const hpPercent = (hpMaksimal > 0) ? Math.min(100, Math.max(0, (hpSekarang / hpMaksimal) * 100)) : 0;
        const atkPercent = (atkMaksimal > 0) ? Math.min(100, Math.max(0, (atkSekarang / atkMaksimal) * 100)) : 0;

        document.getElementById('hp-bar').style.width = hpPercent + '%';
        document.getElementById('hp-percent').textContent = hpPercent.toFixed(1) + '%';

        document.getElementById('atk-bar').style.width = atkPercent + '%';
        document.getElementById('atk-percent').textContent = atkPercent.toFixed(1) + '%';

        // Update UI
        outHp.textContent = kurangHp.toFixed(3);
        outAtk.textContent = kurangAtk.toFixed(3);

        elixirList.innerHTML = '';

        if (targetKurang <= 0) {
            placeholder.textContent = "Your pet is already maxed out!";
            placeholder.style.display = 'block';
            content.style.display = 'none';
            return;
        }

        // Show content
        placeholder.style.display = 'none';
        content.style.display = 'block';

        // Calculate bottles for each elixir
        elixirRates.forEach(elixir => {
            const totalBotol = Math.ceil(targetKurang / elixir.rate);
            const totalPoints = totalBotol * elixir.points;

            const item = document.createElement('div');
            item.className = `elixir-item ${elixir.class}`;
            item.innerHTML = `
                <div class="elixir-name">${elixir.name}</div>
                <div class="elixir-details">
                    <span class="elixir-count">${totalBotol.toLocaleString()}</span>
                    <span class="elixir-points">Points: ${totalPoints.toLocaleString()}</span>
                </div>
            `;
            elixirList.appendChild(item);
        });
    }

    // Attach event listeners for real-time calculation
    petInputs.forEach(input => {
        input.addEventListener('input', calculateElixirs);
    });

    // ===== WING LOGIC =====
    const WING_LEVEL_MULT = 0.0000555555555555556;
    
    const wingRarities = {
      scarce:       { value: 6,  name: 'Scarce',       badge: 'rb-scarce' },
      epic:         { value: 7,  name: 'Epic',         badge: 'rb-epic' },
      legendary:    { value: 8,  name: 'Legendary',    badge: 'rb-legendary' },
      immortal:     { value: 9,  name: 'Immortal',     badge: 'rb-immortal' },
      mythical:     { value: 10, name: 'Mythical',     badge: 'rb-mythical' },
      eternal:      { value: 11, name: 'Eternal',      badge: 'rb-eternal' },
      celestial:    { value: 12, name: 'Celestial',    badge: 'rb-celestial' },
      primordial:   { value: 13, name: 'Primordial',   badge: 'rb-primordial' },
      transcendent: { value: 14, name: 'Transcendent', badge: 'rb-transcendent' },
    };
    
    function wingBase(level, rarityVal) {
      if (rarityVal <= 5) return 0;
      const t1 = 0.05 + (level - 1) * WING_LEVEL_MULT;
      const t2 = 1 + (rarityVal - 5) * 0.1;
      const t3 = 6.25;
      const t4 = (rarityVal - 5) / 7;
      return t1 * t2 * t3 * t4;
    }
    
    function populateWingSelects() {
      ['coeff-rarity', 'atbm-rarity'].forEach(id => {
        const sel = document.getElementById(id);
        if(!sel) return;
        sel.innerHTML = '';
        for (const [key, r] of Object.entries(wingRarities)) {
          const o = document.createElement('option');
          o.value = key; o.textContent = r.name;
          sel.appendChild(o);
        }
      });
    }
    
    function updateBadge(badgeId, rarityKey) {
      const el = document.getElementById(badgeId);
      const r = wingRarities[rarityKey];
      if(el) {
          el.className = `rarity-badge mt-2 ${r.badge}`;
          el.textContent = r.name;
      }
    }
    
    function calcCoefficient() {
      const pct    = parseFloat(document.getElementById('coeff-pct').value) || 0;
      const level  = parseInt(document.getElementById('coeff-level').value) || 1;
      const rKey   = document.getElementById('coeff-rarity').value;
      if (!rKey) return;
      const rVal   = wingRarities[rKey].value;
      const base   = wingBase(level, rVal);
      const coeff  = base !== 0 ? (pct / 100) / base : 0;
      const el = document.getElementById('coeff-result');
      el.textContent = coeff.toFixed(5);
      updateBadge('coeff-badge', rKey);
    }
    
    function calcATBM() {
      const coeff  = parseFloat(document.getElementById('atbm-coeff').value) || 0;
      const level  = parseInt(document.getElementById('atbm-level').value) || 1;
      const rKey   = document.getElementById('atbm-rarity').value;
      if (!rKey) return;
      const rVal   = wingRarities[rKey].value;
      const base   = wingBase(level, rVal);
      const atbm   = coeff * base * 100;
      const el = document.getElementById('atbm-result');
      el.textContent = atbm.toFixed(3) + '%';
      updateBadge('atbm-badge', rKey);
    }
    
    ['coeff-pct','coeff-level','coeff-rarity'].forEach(id => {
      const el = document.getElementById(id);
      if(el) el.addEventListener('input', calcCoefficient);
    });
    ['atbm-coeff','atbm-level','atbm-rarity'].forEach(id => {
      const el = document.getElementById(id);
      if(el) el.addEventListener('input', calcATBM);
    });

    // ===== ELIXIR LOGIC =====
    const elixirRaritiesObj = [
      { id:'common',    name:'Common',    val:1,  checked:true },
      { id:'good',      name:'Good',      val:2,  checked:true },
      { id:'sturdy',    name:'Sturdy',    val:3,  checked:false },
      { id:'rare',      name:'Rare',      val:4,  checked:false },
      { id:'perfect',   name:'Perfect',   val:5,  checked:false },
      { id:'scarce',    name:'Scarce',    val:6,  checked:false },
      { id:'epic',      name:'Epic',      val:8,  checked:false },
      { id:'legendary', name:'Legendary', val:10, checked:false },
      { id:'immortal',  name:'Immortal',  val:14, checked:false },
      { id:'myth',      name:'Myth',      val:20, checked:false },
      { id:'eternal',   name:'Eternal',   val:28, checked:false },
      { id:'celestial',   name:'Celestial',   val:36, checked:false },
    ];
    
    const elixirColorsObj = {
      common:'#a0a0a0', good:'#5cbf5c', sturdy:'#00dddd',
      rare:'#32cd32', perfect:'#3090ff', scarce:'#c080d0',
      epic:'#ff8c00', legendary:'#9932cc', immortal:'#ff1493',
      myth:'#ff4500', eternal:'#f0c040', celestial: '#ff4d4d',
    };
    
    const elixirStatsObj = [
      { id:'attack',   name:'Attack',             pct:false },
      { id:'crit',     name:'Crit Hit Dmg',       pct:true, dec:2 },
      { id:'talisman', name:'Talisman Dmg',       pct:true, dec:3 },
      { id:'hp',       name:'HP',                 pct:false },
      { id:'skill',    name:'Skill Dmg',          pct:true, dec:3 },
    ];
    
    const elixirAbsorbObj = {
      common:    { attack:215,  crit:0.01, talisman:0.001, hp:20000,  skill:0.002 },
      good:      { attack:430,  crit:0.02, talisman:0.002, hp:40000,  skill:0.004 },
      sturdy:    { attack:615,  crit:0.03, talisman:0.003, hp:60000,  skill:0.006 },
      rare:      { attack:860,  crit:0.04, talisman:0.004, hp:80000,  skill:0.008 },
      perfect:   { attack:1075,  crit:0.05, talisman:0.005, hp:100000,  skill:0.010 },
      scarce:    { attack:1290,  crit:0.06, talisman:0.006, hp:120000,  skill:0.012 },
      epic:      { attack:1720, crit:0.08, talisman:0.008, hp:160000, skill:0.016 },
      legendary: { attack:2150, crit:0.10, talisman:0.010, hp:200000, skill:0.020 },
      immortal:  { attack:3010, crit:0.14, talisman:0.014, hp:280000, skill:0.028 },
      myth:      { attack:4300, crit:0.20, talisman:0.020, hp:400000, skill:0.040 },
      eternal:   { attack:6020, crit:0.28, talisman:0.028, hp:560000, skill:0.056 },
      celestial: { attack:7740, crit:0.36, talisman:0.036, hp:720000, skill:0.072 },
    };
    
    function fmtNum(n) {
      if (n >= 1e9) return (n/1e9).toFixed(1).replace(/\.0$/,'')+'B';
      if (n >= 1e6) return (n/1e6).toFixed(1).replace(/\.0$/,'')+'M';
      if (n >= 1e3) return (n/1e3).toFixed(1).replace(/\.0$/,'')+'K';
      return n.toLocaleString();
    }
    
    function initElixirObj() {
      const cb = document.getElementById('elixir-checkboxes');
      if(!cb) return;
      elixirRaritiesObj.forEach(r => {
        const label = document.createElement('label');
        label.style.display = 'flex';
        label.style.alignItems = 'center';
        label.style.gap = '0.5rem';
        label.style.cursor = 'pointer';
        label.style.padding = '0.5rem 1rem';
        label.style.borderRadius = '0.5rem';
        label.style.border = '1px solid ' + (r.checked ? elixirColorsObj[r.id] : 'var(--border-color)');
        label.style.background = r.checked ? `var(--overlay)` : 'transparent';
        label.innerHTML = `<input type="checkbox" id="eck-${r.id}" ${r.checked?'checked':''} style="display:none;"><span>${r.name}</span>`;
        label.querySelector('input').addEventListener('change', e => {
          label.style.border = '1px solid ' + (e.target.checked ? elixirColorsObj[r.id] : 'var(--border-color)');
          label.style.background = e.target.checked ? `var(--overlay)` : 'transparent';
          renderElixirSectionsObj();
          calcElixirObj();
        });
        cb.appendChild(label);
      });
      renderElixirSectionsObj();
      calcElixirObj();
    }
    
    function renderElixirSectionsObj() {
      const container = document.getElementById('elixir-sections');
      if(!container) return;
      container.innerHTML = '';
      elixirRaritiesObj.forEach(r => {
        const checked = document.getElementById(`eck-${r.id}`)?.checked;
        if (!checked) return;
        const card = document.createElement('div');
        card.className = 'glass-inner';
        card.style.marginTop = '0';
        card.innerHTML = `
          <h3 style="color:${elixirColorsObj[r.id]}; border-bottom: 1px solid ${elixirColorsObj[r.id]}44;">
            ${r.name} <span style="font-size:0.8rem;opacity:0.7;">(×${r.val} pts)</span>
          </h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-top: 1rem;">
            ${elixirStatsObj.map(s => `
              <div class="input-group">
                <label style="font-size: 0.75rem;">${s.name}</label>
                <input type="number" class="secure-input" style="padding: 0.5rem;" id="eq-${r.id}-${s.id}" value="0" min="0">
              </div>
            `).join('')}
          </div>
        `;
        container.appendChild(card);
        elixirStatsObj.forEach(s => {
          document.getElementById(`eq-${r.id}-${s.id}`).addEventListener('input', calcElixirObj);
        });
      });
    }
    
    function calcElixirObj() {
      const pts = {}; const abs = {};
      elixirStatsObj.forEach(s => { pts[s.id] = 0; abs[s.id] = 0; });
    
      elixirRaritiesObj.forEach(r => {
        if (!document.getElementById(`eck-${r.id}`)?.checked) return;
        elixirStatsObj.forEach(s => {
          const qty = parseInt(document.getElementById(`eq-${r.id}-${s.id}`)?.value) || 0;
          pts[s.id] += qty * r.val;
          abs[s.id] += qty * elixirAbsorbObj[r.id][s.id];
        });
      });
    
      const ptContainer = document.getElementById('elixir-points-totals');
      if(ptContainer) ptContainer.innerHTML = elixirStatsObj.map(s => `
        <div class="missing-stat">
          <span>${s.name}</span>
          <strong class="text-accent">${pts[s.id].toLocaleString()}</strong>
        </div>
      `).join('');
    
      const abContainer = document.getElementById('elixir-absorb-totals');
      if(abContainer) abContainer.innerHTML = elixirStatsObj.map(s => {
        let val;
        if (s.pct) val = abs[s.id].toFixed(s.dec) + '%';
        else val = fmtNum(abs[s.id]);
        return `
          <div class="missing-stat">
            <span>${s.name}</span>
            <strong class="text-accent">${val}</strong>
          </div>
        `;
      }).join('');
    }

    // ===== WORLD CALC =====
    const worldDifficultiesObj = {
      Easy:   Array.from({length:20}, (_,i) => ({ id: i+1,   name: `World Easy ${i+1}` })),
      Normal: Array.from({length:20}, (_,i) => ({ id: i+21,  name: `World Normal ${i+1}` })),
      Hard:   Array.from({length:20}, (_,i) => ({ id: i+41,  name: `World Hard ${i+1}` })),
      Expert: Array.from({length:20}, (_,i) => ({ id: i+61,  name: `World Expert ${i+1}` })),
      Master: Array.from({length:20}, (_,i) => ({ id: i+81,  name: `World Master ${i+1}` })),
      Hell: Array.from({length:20}, (_,i) => ({ id: i+101,  name: `World Hell ${i+1}` })),
      Legend: Array.from({length:10}, (_,i) => ({ id: i+121,  name: `World Legend ${i+1}` })),
    };
    
    const worldStatsObj = {
      1:{xp:500,ore:1,coins:1500},2:{xp:500,ore:1,coins:1500},3:{xp:500,ore:1,coins:1500},4:{xp:500,ore:2,coins:1500},5:{xp:500,ore:2,coins:1500},
      6:{xp:550,ore:2,coins:1500},7:{xp:550,ore:2,coins:2000},8:{xp:550,ore:3,coins:2600},9:{xp:600,ore:3,coins:3200},10:{xp:600,ore:3,coins:3200},
      11:{xp:700,ore:3,coins:3500},12:{xp:1000,ore:3,coins:3500},13:{xp:1000,ore:4,coins:3500},14:{xp:1000,ore:4,coins:3800},15:{xp:1000,ore:4,coins:4000},
      16:{xp:1000,ore:4,coins:4100},17:{xp:1500,ore:4,coins:4200},18:{xp:1500,ore:5,coins:4600},19:{xp:2000,ore:5,coins:5000},20:{xp:2000,ore:5,coins:7600},
      21:{xp:2500,ore:5,coins:8600},22:{xp:2500,ore:5,coins:9300},23:{xp:3000,ore:5,coins:10000},24:{xp:3000,ore:6,coins:10600},25:{xp:3500,ore:6,coins:11300},
      26:{xp:3500,ore:6,coins:12000},27:{xp:3500,ore:6,coins:13300},28:{xp:4500,ore:6,coins:14000},29:{xp:4500,ore:7,coins:14600},30:{xp:5000,ore:7,coins:16000},
      31:{xp:5000,ore:7,coins:16600},32:{xp:5000,ore:7,coins:17300},33:{xp:5500,ore:7,coins:18000},34:{xp:5500,ore:7,coins:18600},35:{xp:6000,ore:8,coins:19300},
      36:{xp:6500,ore:8,coins:20600},37:{xp:6500,ore:8,coins:20600},38:{xp:6500,ore:8,coins:22600},39:{xp:7000,ore:9,coins:22600},40:{xp:7500,ore:9,coins:26000},
      41:{xp:8500,ore:9,coins:50000},42:{xp:8500,ore:9,coins:52600},43:{xp:9500,ore:9,coins:56000},44:{xp:9500,ore:9,coins:57300},45:{xp:10000,ore:10,coins:59300},
      46:{xp:10000,ore:10,coins:61300},47:{xp:10000,ore:10,coins:63300},48:{xp:11000,ore:10,coins:64600},49:{xp:11000,ore:10,coins:66600},50:{xp:11000,ore:11,coins:67600},
      51:{xp:12000,ore:11,coins:70600},52:{xp:12000,ore:11,coins:72600},53:{xp:12000,ore:12,coins:74600},54:{xp:13000,ore:11,coins:76600},55:{xp:13000,ore:11,coins:78000},
      56:{xp:16500,ore:12,coins:79300},57:{xp:18500,ore:12,coins:81300},58:{xp:20500,ore:12,coins:82000},59:{xp:25000,ore:12,coins:84600},60:{xp:27500,ore:12,coins:86600},
      61:{xp:31500,ore:13,coins:100400},62:{xp:32300,ore:13,coins:101000},63:{xp:32800,ore:13,coins:101200},64:{xp:33200,ore:13,coins:101600},65:{xp:33700,ore:13,coins:103000},
      66:{xp:34200,ore:13,coins:104900},67:{xp:35000,ore:14,coins:106500},68:{xp:35500,ore:14,coins:108700},69:{xp:35900,ore:14,coins:110300},70:{xp:36900,ore:14,coins:112300},
      71:{xp:41800,ore:14,coins:125300},72:{xp:42300,ore:15,coins:127500},73:{xp:43100,ore:15,coins:129900},74:{xp:44100,ore:15,coins:132000},75:{xp:44400,ore:15,coins:134400},
      76:{xp:46000,ore:15,coins:137100},77:{xp:46300,ore:16,coins:139700},78:{xp:47200,ore:16,coins:143700},79:{xp:48100,ore:16,coins:145200},80:{xp:49400,ore:16,coins:148300},
      81:{xp:50000,ore:16,coins:152800},82:{xp:52000,ore:16,coins:154800},83:{xp:52800,ore:16,coins:157200},84:{xp:53600,ore:16,coins:160400},85:{xp:54400,ore:16,coins:163600},
      86:{xp:55600,ore:16,coins:167600},87:{xp:57200,ore:16,coins:171200},88:{xp:58400,ore:16,coins:174400},89:{xp:59200,ore:16,coins:180600},90:{xp:60000,ore:17,coins:181600},
      91:{xp:60800,ore:18,coins:183080},92:{xp:62800,ore:19,coins:187080},93:{xp:64800,ore:19,coins:191080},94:{xp:65000,ore:19,coins:195080},95:{xp:66800,ore:19,coins:201080},
      96:{xp:68800,ore:19,coins:203080},97:{xp:70800,ore:19,coins:205480},98:{xp:73000,ore:19,coins:211080},99:{xp:76560,ore:19,coins:215080},100:{xp:78800,ore:19,coins:219080},
      101:{xp:76000,ore:19,coins:224000},102:{xp:74000,ore:19,coins:226000},103:{xp:78000,ore:19,coins:230000},104:{xp:78000,ore:19,coins:232000},105:{xp:78000,ore:19,coins:238000},
      106:{xp:80000,ore:19,coins:240000},107:{xp:82000,ore:19,coins:244000},108:{xp:82000,ore:19,coins:246000},109:{xp:84000,ore:19,coins:252000},110:{xp:86000,ore:19,coins:254000},
      111:{xp:86000,ore:19,coins:258000},112:{xp:86000,ore:19,coins:262000},113:{xp:88000,ore:19,coins:264000},114:{xp:90000,ore:19,coins:268000},115:{xp:90000,ore:19,coins:274000},
      116:{xp:92000,ore:19,coins:274000},117:{xp:92000,ore:19,coins:280000},118:{xp:93120,ore:19,coins:282000},119:{xp:94190,ore:19,coins:288000},120:{xp:96000,ore:19,coins:290000},
      121:{xp:96000,ore:19,coins:292000},122:{xp:96000,ore:19,coins:298000},123:{xp:98000,ore:19,coins:300000},124:{xp:100000,ore:19,coins:304000},125:{xp:100000,ore:19,coins:308000},
      126:{xp:100000,ore:19,coins:312000},127:{xp:102000,ore:19,coins:314000},128:{xp:104000,ore:19,coins:318000},129:{xp:104000,ore:19,coins:322000},130:{xp:106000,ore:19,coins:326000},
    };
    
    let comparisonDataObj = [];
    
    function initWorldObj() {
      const diff = document.getElementById('difficulty-select');
      if(!diff) return;
      Object.keys(worldDifficultiesObj).forEach(d => {
        const o = document.createElement('option'); o.value=d; o.textContent=d; diff.appendChild(o);
      });
      diff.addEventListener('change', populateWorldOptionsObj);
      populateWorldOptionsObj();
    
      const inputs = ['clear-time','gold-drop','ore-drop','exp-gain','extra-gold','extra-exp'];
      inputs.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('input', calcWorldObj);
      });
      document.getElementById('world-select')?.addEventListener('change', calcWorldObj);
      document.getElementById('compare-btn')?.addEventListener('click', addCompareObj);
      document.getElementById('clear-compare-btn')?.addEventListener('click', () => { comparisonDataObj=[]; renderCompareObj(); });
      calcWorldObj();
    }
    
    function populateWorldOptionsObj() {
      const diff = document.getElementById('difficulty-select').value;
      const ws = document.getElementById('world-select');
      ws.innerHTML = '';
      (worldDifficultiesObj[diff] || []).forEach(w => {
        const o = document.createElement('option');
        o.value = w.id;
        o.textContent = w.name;
        ws.appendChild(o);
      });
      calcWorldObj();
    }
    
    function calcWorldObj() {
      const worldId   = parseInt(document.getElementById('world-select').value);
      const stats     = worldStatsObj[worldId];
      if (!stats) return;
    
      const clearTime   = parseFloat(document.getElementById('clear-time').value) || 0;
      const expGainRate = parseFloat(document.getElementById('exp-gain').value) / 100 || 1;
      const oreDropRate = parseFloat(document.getElementById('ore-drop').value) / 100 || 1;
      const goldDropRate= parseFloat(document.getElementById('gold-drop').value) / 100 || 1;
      const extraExp    = parseFloat(document.getElementById('extra-exp').value) || 0;
      const extraGold   = parseFloat(document.getElementById('extra-gold').value) || 0;
    
      const timeFactor  = clearTime > 0 ? 3600 / (clearTime + 5) : 0;
      
      const xph   = timeFactor * (stats.xp * expGainRate + (extraExp * 460));
      const oreh  = timeFactor * stats.ore * oreDropRate;
      const goldh = timeFactor * (stats.coins * goldDropRate + (extraGold * 460));
      const clears= timeFactor;
    
      document.getElementById('base-exp').textContent   = stats.xp.toLocaleString();
      document.getElementById('base-ore').textContent   = stats.ore.toLocaleString();
      document.getElementById('base-gold').textContent  = stats.coins.toLocaleString();
    
      document.getElementById('result-xp').textContent    = Math.round(xph).toLocaleString();
      document.getElementById('result-ore').textContent   = Math.round(oreh).toLocaleString();
      document.getElementById('result-gold').textContent  = Math.round(goldh).toLocaleString();
      document.getElementById('result-clears').textContent= clears.toFixed(1);
    }
    
    function addCompareObj() {
      const ws = document.getElementById('world-select');
      const name = ws.options[ws.selectedIndex]?.textContent || 'Custom';
      comparisonDataObj.push({
        name,
        xp:     document.getElementById('result-xp').textContent,
        ore:    document.getElementById('result-ore').textContent,
        gold:   document.getElementById('result-gold').textContent,
        clears: document.getElementById('result-clears').textContent,
        time:   document.getElementById('clear-time').value,
      });
      renderCompareObj();
    }
    
    function renderCompareObj() {
      const c = document.getElementById('compare-container');
      if (!comparisonDataObj.length) { c.innerHTML='<p class="text-muted">No worlds added yet.</p>'; return; }
      c.innerHTML = `
        <div class="compare-table-wrap">
          <table class="compare-table">
            <thead><tr><th>World</th><th>Exp/h</th><th>Ore/h</th><th>Gold/h</th><th>Clears/h</th><th>Time(s)</th></tr></thead>
            <tbody>${comparisonDataObj.map(d=>`
              <tr>
                <td>${d.name}</td>
                <td>${d.xp}</td>
                <td>${d.ore}</td>
                <td>${d.gold}</td>
                <td>${d.clears}</td>
                <td>${d.time}</td>
              </tr>
            `).join('')}</tbody>
          </table>
        </div>
      `;
    }

    // ===== WING SIMULATOR =====
    const simStagesObj = [
      { from:'Scarce',     to:'Epic',         wc:1,  base:0.003   },
      { from:'Epic',       to:'Legendary',    wc:2,  base:0.002   },
      { from:'Legendary',  to:'Immortal',     wc:4,  base:0.001   },
      { from:'Immortal',   to:'Mythic',       wc:6,  base:0.0004  },
      { from:'Mythic',     to:'Eternal',      wc:8,  base:0.0002  },
      { from:'Eternal',    to:'Celestial',    wc:10, base:0.00001 },
      { from:'Celestial',  to:'Primordial',   wc:10, base:0.000002},
      { from:'Primordial', to:'Transcendent', wc:10, base:0.000001},
    ];
    
    let simStateObj = null;
    let simAutoTimerObj = null;
    
    function simInitObj() {
      const startIdx = parseInt(document.getElementById('sim-start-rarity').value);
      const targetIdx= parseInt(document.getElementById('sim-target-rarity').value);
      const wc       = parseInt(document.getElementById('sim-wc').value) || 0;
    
      if (targetIdx <= startIdx) {
        alert('Target must be higher than Starting rarity!'); return;
      }
    
      simStateObj = {
        stageIdx: startIdx,
        targetIdx,
        wcLeft: wc,
        wcTotal: wc,
        currentRate: simStagesObj[startIdx].base,
        attempts: 0,
        stageStats: {},
        done: false,
        outOfWC: false,
      };
    
      for (let i = startIdx; i < targetIdx; i++) {
        simStateObj.stageStats[i] = { wc: 0, attempts: 0 };
      }
    
      document.getElementById('sim-status-card').style.display = '';
      document.getElementById('sim-log').innerHTML = '';
      simRenderStatusObj();
      renderSimStageStatsObj();
    }
    
    function simAttemptObj() {
      if (!simStateObj || simStateObj.done || simStateObj.outOfWC) return;
    
      const stage = simStagesObj[simStateObj.stageIdx];
    
      if (simStateObj.wcLeft < stage.wc) {
        simStateObj.outOfWC = true;
        simLogObj(`❌ Out of WC! Stopped at <span style="color:#ef4444">${stage.from}</span>`, 'fail');
        simRenderStatusObj();
        renderSimStageStatsObj();
        stopAutoObj();
        return;
      }
    
      simStateObj.wcLeft -= stage.wc;
      simStateObj.attempts++;
      simStateObj.stageStats[simStateObj.stageIdx].wc += stage.wc;
      simStateObj.stageStats[simStateObj.stageIdx].attempts++;
    
      const roll = Math.random();
      if (roll < simStateObj.currentRate) {
        simLogObj(`✅ <span style="color:#22c55e">${stage.from} → ${stage.to}</span> (rate: ${(simStateObj.currentRate*100).toFixed(4)}%)`, 'success');
        simStateObj.stageIdx++;
        if (simStateObj.stageIdx >= simStateObj.targetIdx) {
          simStateObj.done = true;
          simLogObj(`🎉 <span style="color:#f59e0b">Reached ${simStagesObj[simStateObj.targetIdx-1].to}! Done!</span>`, 'done');
          stopAutoObj();
        } else {
          simStateObj.currentRate = simStagesObj[simStateObj.stageIdx].base;
        }
      } else {
        simStateObj.currentRate += stage.base;
        simLogObj(`💢 Failed. Rate now <span style="color:#ef4444">${(simStateObj.currentRate*100).toFixed(4)}%</span>`, 'fail');
      }
    
      simRenderStatusObj();
      renderSimStageStatsObj();
    }
    
    function simLogObj(msg, type) {
      const log = document.getElementById('sim-log');
      const line = document.createElement('div');
      line.innerHTML = `<span style="color:var(--text-muted)">#${simStateObj.attempts}</span> ${msg}`;
      log.appendChild(line);
      log.scrollTop = log.scrollHeight;
    }
    
    function simRenderStatusObj() {
      if (!simStateObj) return;
      const stage = simStagesObj[Math.min(simStateObj.stageIdx, simStagesObj.length-1)];
      document.getElementById('sim-cur-rarity').textContent = simStateObj.done ? simStagesObj[simStateObj.targetIdx-1].to : stage.from;
      document.getElementById('sim-wc-left').textContent    = simStateObj.wcLeft.toLocaleString();
      document.getElementById('sim-cur-rate').textContent   = simStateObj.done ? '—' : (simStateObj.currentRate*100).toFixed(4)+'%';
      document.getElementById('sim-attempts').textContent   = simStateObj.attempts.toLocaleString();
    }
    
    function renderSimStageStatsObj() {
      if (!simStateObj) return;
      const container = document.getElementById('sim-stage-stats');
      const startIdx = parseInt(document.getElementById('sim-start-rarity').value);
      const targetIdx= parseInt(document.getElementById('sim-target-rarity').value);
    
      let html = '<div class="compare-table-wrap"><table class="compare-table"><thead><tr><th>Stage</th><th>Click</th><th>WC Used</th></tr></thead><tbody>';
      for (let i = startIdx; i < targetIdx; i++) {
        const s = simStateObj.stageStats[i] || { wc:0, attempts:0 };
        const done = simStateObj.stageIdx > i;
        html += `<tr>
          <td style="color:${done?'#22c55e':'var(--text-main)'}">${simStagesObj[i].from} → ${simStagesObj[i].to} ${done?'✅':''}</td>
          <td>${s.attempts}</td>
          <td>${s.wc}</td>
        </tr>`;
      }
      const wcUsed = simStateObj.wcTotal - simStateObj.wcLeft;
      html += `</tbody><tfoot><tr style="font-weight:bold">
        <td style="color:var(--accent)">Total</td>
        <td style="color:var(--accent)">${simStateObj.attempts}</td>
        <td style="color:#f59e0b">${wcUsed}</td>
      </tr></tfoot></table></div>`;
      container.innerHTML = html;
    }
    
    function stopAutoObj() {
      if (simAutoTimerObj) { clearInterval(simAutoTimerObj); simAutoTimerObj = null; }
      const autoBtn = document.getElementById('sim-auto-btn');
      if (autoBtn) autoBtn.textContent = '⏩ Auto Run';
    }
    
    document.getElementById('sim-run-btn')?.addEventListener('click', () => { stopAutoObj(); simInitObj(); });
    document.getElementById('sim-reset-btn')?.addEventListener('click', () => {
      stopAutoObj(); simStateObj = null;
      document.getElementById('sim-status-card').style.display = 'none';
      document.getElementById('sim-stage-stats').innerHTML = '<p class="text-muted">Run a simulation to see stats.</p>';
      document.getElementById('sim-log').innerHTML = '';
    });
    document.getElementById('sim-step-btn')?.addEventListener('click', simAttemptObj);
    document.getElementById('sim-auto-btn')?.addEventListener('click', () => {
      if (simAutoTimerObj) { stopAutoObj(); return; }
      if (!simStateObj || simStateObj.done || simStateObj.outOfWC) { simInitObj(); }
      document.getElementById('sim-auto-btn').textContent = '⏹ Stop';
      simAutoTimerObj = setInterval(() => {
        simAttemptObj();
        if (!simStateObj || simStateObj.done || simStateObj.outOfWC) stopAutoObj();
      }, 30);
    });

    // ===== REROLL SIMULATOR =====
    const ATTRIBUTES_OBJ = [
      'Hp Boost','Attack Boost','Dodge Rate','Ignore Dodge Rate',
      'Critical Hit Rate','Critical Hit Damage','Hp Recovery',
      'Reflecting Damage Rate','Reflecting Damage','Talisman Damage',
      'Skill Damage','Boss Dmg Reduction','Damage To Boss','Attack Speed',
      'Ore Drop Rate','Exp Gain Rate','Gold Drop Rate',
      'Extra Gold Drop','Extra Exp Drop'
    ];
    
    const LOCK_WC_COST_OBJ = [0, 10, 20, 40, 80, 100, 120];
    const TRASH_COST_BY_RARITY_OBJ = [1,2,3,4,5,6,7,8,9];
    const SLOTS_BY_RARITY_OBJ = [1,2,3,4,5,6,7,8,9];
    
    const FIXED_ATTRS_OBJ = ['Hp','Attack','Attack Boost Multiplier'];
    
    let rrStateObj = null;
    let rrAutoTimerObj = null;
    
    function rrInitSlotsObj(count) {
      const usedPool = [...FIXED_ATTRS_OBJ];
      const rerollable = [];
      for (let i = 0; i < count; i++) {
        let attr;
        do { attr = ATTRIBUTES_OBJ[Math.floor(Math.random() * ATTRIBUTES_OBJ.length)]; }
        while (usedPool.includes(attr));
        usedPool.push(attr);
        rerollable.push({ attr, locked: false });
      }
      return rerollable;
    }
    
    function rrInitObj() {
      if (rrAutoTimerObj) { clearInterval(rrAutoTimerObj); rrAutoTimerObj = null; }
    
      const rarityIdx  = parseInt(document.getElementById('rr-rarity').value);
      const wcAvail    = parseInt(document.getElementById('rr-wc').value) || 0;
      const trashAvail = parseInt(document.getElementById('rr-trash').value) || 0;
      const slotCount  = SLOTS_BY_RARITY_OBJ[rarityIdx];
      const trashCost  = TRASH_COST_BY_RARITY_OBJ[rarityIdx];
    
      rrStateObj = {
        rarityIdx, slotCount, trashCost,
        wcLeft: wcAvail, trashLeft: trashAvail,
        wcSpent: 0, trashSpent: 0, rolls: 0, autoLock: false,
        slots: rrInitSlotsObj(slotCount),
      };
    
      document.getElementById('rr-slots-card').style.display = '';
      document.getElementById('rr-stats-card').style.display = '';
      document.getElementById('rr-log').innerHTML = '';
      rrRenderSlotsObj();
      rrUpdateCostObj();
      rrUpdateStatsObj();
      rrLogObj(`🎲 Initial attributes rolled — free!`);
    }
    
    window.rrToggleLockObj = function(idx) {
      if (!rrStateObj) return;
      const lockedCount = rrStateObj.slots.filter(s => s.locked).length;
      if (!rrStateObj.slots[idx].locked && lockedCount >= 6) {
        alert('Maximum 6 slots can be locked!'); return;
      }
      rrStateObj.slots[idx].locked = !rrStateObj.slots[idx].locked;
      rrRenderSlotsObj();
      rrUpdateCostObj();
    }

    window.rrAttrChangeObj = function(idx, val) {
      if (rrStateObj) rrStateObj.slots[idx].attr = val;
    }
    
    function rrRenderSlotsObj() {
      if (!rrStateObj) return;
    
      const fixedContainer = document.getElementById('rr-fixed-slots');
      fixedContainer.innerHTML = FIXED_ATTRS_OBJ.map((a, i) => `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;background:var(--overlay);border:1px solid var(--border-color);opacity:0.5;">
          <span style="font-size:10px;color:var(--text-muted);font-family:monospace;width:18px">${i+1}</span>
          <span style="font-size:12px;color:var(--text-muted)">🔒 ${a}</span>
        </div>
      `).join('');
    
      const container = document.getElementById('rr-slots');
      container.innerHTML = rrStateObj.slots.map((slot, i) => `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;background:${slot.locked ? 'rgba(14,165,233,0.1)' : 'var(--overlay)'};border:1px solid ${slot.locked ? 'var(--primary)' : 'var(--border-color)'};transition:all 0.2s;">
          <span style="font-size:10px;color:var(--text-muted);font-family:monospace;width:18px">${i+4}</span>
          <select class="reroll-select" style="flex:1;background:transparent;border:none;color:${slot.locked ? 'var(--accent)' : 'var(--text-main)'};font-size:12px;font-family:'Outfit',sans-serif;outline:none;cursor:pointer;padding:0;" onchange="rrAttrChangeObj(${i}, this.value)">
            ${ATTRIBUTES_OBJ.map(a => `<option value="${a}" style="background:#0f172a;color:#f8fafc;" ${a===slot.attr?'selected':''}>${a}</option>`).join('')}
          </select>
          <button onclick="rrToggleLockObj(${i})" style="padding:4px 10px;border-radius:6px;border:none;cursor:pointer;font-size:10px;font-weight:600;letter-spacing:1px;background:${slot.locked ? 'rgba(14,165,233,0.2)' : 'rgba(255,255,255,0.1)'};color:${slot.locked ? 'var(--accent)' : 'var(--text-muted)'};transition:all 0.15s;">${slot.locked ? '🔒 LOCK' : '🔓 LOCK'}</button>
        </div>
      `).join('');
    }
    
    function rrGetCostObj() {
      if (!rrStateObj) return { wc: 0, trash: 0 };
      const locked = rrStateObj.slots.filter(s => s.locked).length;
      return {
        wc: LOCK_WC_COST_OBJ[Math.min(locked, 6)],
        trash: rrStateObj.trashCost,
      };
    }
    
    function rrUpdateCostObj() {
      const { wc, trash } = rrGetCostObj();
      document.getElementById('rr-cost-display').textContent = `${wc} WC + ${trash} Trash`;
      document.getElementById('rr-wc-left').textContent = rrStateObj?.wcLeft.toLocaleString() ?? '—';
      document.getElementById('rr-trash-left').textContent = rrStateObj?.trashLeft.toLocaleString() ?? '—';
    }
    
    function rrUpdateStatsObj() {
      if (!rrStateObj) return;
      document.getElementById('rr-stat-rolls').textContent   = rrStateObj.rolls.toLocaleString();
      document.getElementById('rr-stat-wc').textContent      = rrStateObj.wcSpent.toLocaleString();
      document.getElementById('rr-stat-trash').textContent   = rrStateObj.trashSpent.toLocaleString();
      document.getElementById('rr-stat-wcleft').textContent  = rrStateObj.wcLeft.toLocaleString();
    }
    
    function rrLogObj(msg) {
      const log = document.getElementById('rr-log');
      const div = document.createElement('div');
      div.innerHTML = msg;
      log.appendChild(div);
      log.scrollTop = log.scrollHeight;
    }
    
    window.rrUpdateTargetLabelObj = function(attr) {
      const id = attr.replace(/\s+/g,'_');
      const cb = document.getElementById(`rr-target-${id}`);
      const label = document.getElementById(`rr-target-label-${id}`);
      label.style.border = '1px solid ' + (cb.checked ? 'var(--primary)' : 'var(--border-color)');
      label.style.color = cb.checked ? 'var(--accent)' : 'var(--text-muted)';
      label.style.background = cb.checked ? 'rgba(14,165,233,0.1)' : 'var(--overlay)';
    }

    function rrRenderTargetsObj() {
      const container = document.getElementById('rr-targets');
      if(!container) return;
      container.innerHTML = ATTRIBUTES_OBJ.map(a => `
        <label style="display:flex;align-items:center;gap:5px;padding:4px 10px;border-radius:6px;cursor:pointer;border:1px solid var(--border-color);font-size:0.8rem;background:var(--overlay);color:var(--text-muted);user-select:none;transition:all 0.15s;" id="rr-target-label-${a.replace(/\s+/g,'_')}">
          <input type="checkbox" id="rr-target-${a.replace(/\s+/g,'_')}" value="${a}" style="accent-color:var(--primary)" onchange="rrUpdateTargetLabelObj('${a}')">
          ${a}
        </label>
      `).join('');
    }
    
    function rrGetTargetsObj() {
      return ATTRIBUTES_OBJ.filter(a => {
        const cb = document.getElementById(`rr-target-${a.replace(/\s+/g,'_')}`);
        return cb && cb.checked;
      });
    }
    
    function rrRollObj() {
      if (!rrStateObj) return;
      const { wc, trash } = rrGetCostObj();
    
      if (rrStateObj.wcLeft < wc || rrStateObj.trashLeft < trash) {
        rrLogObj(`❌ Not enough ${rrStateObj.wcLeft < wc ? 'WC' : 'Trash Wings'}! Auto stopped.`);
        rrStopAutoObj();
        return;
      }
    
      rrStateObj.wcLeft    -= wc;
      rrStateObj.trashLeft -= trash;
      rrStateObj.wcSpent   += wc;
      rrStateObj.trashSpent+= trash;
      rrStateObj.rolls++;
      
      const changed = [];
      rrStateObj.slots.forEach((slot, i) => {
        if (slot.locked) return;
        const newAttr = ATTRIBUTES_OBJ[Math.floor(Math.random() * ATTRIBUTES_OBJ.length)];
        if (newAttr !== slot.attr) changed.push(`Slot ${i+4}: ${newAttr}`);
        slot.attr = newAttr;
      });
    
      rrLogObj(`#${rrStateObj.rolls} → ${changed.length ? changed.join(' · ') : 'No change'}`);
    
      const targets = rrGetTargetsObj();
      if (targets.length > 0) {
        const currentAttrs = rrStateObj.slots.filter(s => !s.locked).map(s => s.attr);
        const matched = targets.filter(t => currentAttrs.includes(t));
        const allFound = matched.length === targets.length;
    
        if (rrStateObj.autoLock && matched.length > 0) {
          rrStateObj.slots.forEach(slot => {
            if (matched.includes(slot.attr)) slot.locked = true;
          });
          rrLogObj(`🔒 Auto Locked: ${matched.join(', ')}`);
    
          if (allFound) {
            rrLogObj(`✅ All targets found & locked! Rolling for remaining...`);
            const lockedCount = rrStateObj.slots.filter(s => s.locked).length;
            if (lockedCount >= 6 || rrStateObj.slots.every(s => s.locked)) {
              rrLogObj(`🎉 All target slots locked! Done!`);
              rrStopAutoObj();
            }
          }
        } else if (!rrStateObj.autoLock && allFound) {
          rrLogObj(`🎉 All targets found! Stopped.`);
          rrStopAutoObj();
        }
      }
    
      rrRenderSlotsObj();
      rrUpdateCostObj();
      rrUpdateStatsObj();
    }
    
    function rrStopAutoObj() {
      if (rrAutoTimerObj) { clearInterval(rrAutoTimerObj); rrAutoTimerObj = null; }
      const autoBtn = document.getElementById('rr-auto-btn');
      if(autoBtn) {
          autoBtn.textContent = '⏩ Auto Run';
          autoBtn.style.background = 'rgba(255, 255, 255, 0.1)';
      }
      if (rrStateObj) rrStateObj.autoLock = false;
      const autolockBtn = document.getElementById('rr-autolock-btn');
      if(autolockBtn) {
          autolockBtn.style.background = 'rgba(245, 158, 11, 0.1)';
          autolockBtn.textContent = '🔒 Auto Lock';
      }
    }
    
    document.getElementById('rr-init-btn')?.addEventListener('click', () => {
      rrStopAutoObj(); rrInitObj(); rrRenderTargetsObj();
    });
    document.getElementById('rr-roll-btn')?.addEventListener('click', rrRollObj);
    
    document.getElementById('rr-auto-btn')?.addEventListener('click', () => {
      if (rrAutoTimerObj) { rrStopAutoObj(); return; }
      if (!rrStateObj) { rrInitObj(); rrRenderTargetsObj(); }
      document.getElementById('rr-auto-btn').textContent = '⏸ Pause';
      document.getElementById('rr-auto-btn').style.background = 'rgba(14, 165, 233, 0.2)';
      rrAutoTimerObj = setInterval(() => {
        const { wc, trash } = rrGetCostObj();
        if (rrStateObj.wcLeft < wc || rrStateObj.trashLeft < trash) { rrStopAutoObj(); return; }
        rrRollObj();
      }, 80);
    });
    
    document.getElementById('rr-autolock-btn')?.addEventListener('click', () => {
      if (!rrStateObj) { rrInitObj(); rrRenderTargetsObj(); }
      rrStateObj.autoLock = !rrStateObj.autoLock;
      const btn = document.getElementById('rr-autolock-btn');
    
      if (rrStateObj.autoLock) {
        btn.textContent = '🔒 Auto Lock ON';
        btn.style.background = 'rgba(245, 158, 11, 0.25)';
        if (!rrAutoTimerObj) {
          document.getElementById('rr-auto-btn').textContent = '⏸ Pause';
          document.getElementById('rr-auto-btn').style.background = 'rgba(14, 165, 233, 0.2)';
          rrAutoTimerObj = setInterval(() => {
            const { wc, trash } = rrGetCostObj();
            if (rrStateObj.wcLeft < wc || rrStateObj.trashLeft < trash) { rrStopAutoObj(); return; }
            rrRollObj();
          }, 80);
        }
      } else {
        btn.textContent = '🔒 Auto Lock';
        btn.style.background = 'rgba(245, 158, 11, 0.1)';
      }
    });

    // ===== ABSORB ANALYSIS =====
    const AB_PER_P_OBJ = {
      attack: 215,
      hp: 21500,
      crit: 0.01,
      skill: 0.002,
      talisman: 0.001,
    };
    
    function abParseValObj(str) {
      if (!str) return 0;
      str = str.toString().trim().toUpperCase();
      const num = parseFloat(str);
      if (isNaN(num)) return 0;
      if (str.endsWith('T')) return num * 1e12;
      if (str.endsWith('B')) return num * 1e9;
      if (str.endsWith('M')) return num * 1e6;
      if (str.endsWith('K')) return num * 1e3;
      return num;
    }
    
    function abFormatValObj(n, isPercent) {
      if (isPercent) return n.toLocaleString(undefined, {maximumFractionDigits:3}) + '%';
      if (n >= 1e12) return (n/1e12).toLocaleString(undefined,{maximumFractionDigits:3}) + 'T';
      if (n >= 1e9)  return (n/1e9).toLocaleString(undefined,{maximumFractionDigits:3}) + 'B';
      if (n >= 1e6)  return (n/1e6).toLocaleString(undefined,{maximumFractionDigits:3}) + 'M';
      if (n >= 1e3)  return (n/1e3).toLocaleString(undefined,{maximumFractionDigits:3}) + 'K';
      return n.toLocaleString();
    }
    
    function abBarColorObj(pct) {
      return pct >= 100 ? '#f59e0b' : 'var(--primary)';
    }
    
    function abCalcObj() {
      const stats = [
        { id:'hp',       label:'HP',                   cur: abParseValObj(document.getElementById('ab-hp-cur').value),  max: abParseValObj(document.getElementById('ab-hp-max').value),  perP: AB_PER_P_OBJ.hp,       isPercent: false },
        { id:'attack',   label:'Attack',               cur: abParseValObj(document.getElementById('ab-atk-cur').value), max: abParseValObj(document.getElementById('ab-atk-max').value), perP: AB_PER_P_OBJ.attack,   isPercent: false },
        { id:'crit',     label:'Critical Hit Damage',  cur: parseFloat(document.getElementById('ab-crit-cur').value)||0,  max: parseFloat(document.getElementById('ab-crit-max').value)||0,  perP: AB_PER_P_OBJ.crit,     isPercent: true },
        { id:'skill',    label:'Skill Damage',         cur: parseFloat(document.getElementById('ab-skill-cur').value)||0, max: parseFloat(document.getElementById('ab-skill-max').value)||0, perP: AB_PER_P_OBJ.skill,    isPercent: true },
        { id:'talisman', label:'Talisman Damage',      cur: parseFloat(document.getElementById('ab-tal-cur').value)||0,  max: parseFloat(document.getElementById('ab-tal-max').value)||0,  perP: AB_PER_P_OBJ.talisman, isPercent: true },
      ];
    
      let totalP = 0;
      const container = document.getElementById('ab-stat-list');
      container.innerHTML = '';
    
      stats.forEach(s => {
        const diff = Math.max(0, s.max - s.cur);
        const pNeeded = s.perP > 0 ? Math.ceil(diff / s.perP) : 0;
        const pAbsorbed = s.max > 0 ? Math.floor(s.cur / s.perP) : 0;
        totalP += pNeeded;
        const pct = s.max > 0 ? Math.min(100, (s.cur / s.max) * 100) : 100;
        const isMaxed = pct >= 100;
        const color = abBarColorObj(pct);
        const curFmt = abFormatValObj(s.cur, s.isPercent);
        const maxFmt = abFormatValObj(s.max, s.isPercent);
    
        container.innerHTML += `
          <div style="background:var(--overlay);border:1px solid ${isMaxed ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-color)'};border-radius:10px;padding:12px 14px;${isMaxed ? 'box-shadow:0 0 12px rgba(245, 158, 11, 0.15)' : ''}">
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px">
              <span style="font-weight:700;font-size:14px;color:${isMaxed ? '#f59e0b' : 'var(--text-main)'}">
                ${s.label} ${isMaxed ? '✨' : ''}
              </span>
              <span style="font-family:monospace;font-size:12px;color:${color}">
                ${pNeeded > 0 ? '+' + pNeeded.toLocaleString() + 'p needed' : 'MAXED'}
              </span>
            </div>
            <div style="background:var(--overlay-heavy);border-radius:20px;height:10px;margin-bottom:6px;overflow:hidden">
              <div style="height:100%;width:${pct.toFixed(1)}%;background:${color};border-radius:20px;transition:width 0.4s ease"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted);font-family:monospace">
              <span>${curFmt} / ${maxFmt}</span>
              <span style="color:${isMaxed ? '#f59e0b' : 'var(--text-muted)'}">absorbed: ${pAbsorbed.toLocaleString()}p</span>
            </div>
          </div>
        `;
      });

      const allMaxed = stats.every(s => s.max > 0 && s.cur >= s.max);
      const resultCard = document.getElementById('ab-result-card');
      if (allMaxed) {
        document.getElementById('ab-total-p').textContent = '✨ ALL MAXED!';
      } else {
        document.getElementById('ab-total-p').textContent = totalP.toLocaleString() + 'p';
      }
      resultCard.style.display = '';
    }
    
    document.getElementById('ab-calc-btn')?.addEventListener('click', abCalcObj);

    // Initializations for added calculators
    populateWingSelects();
    calcCoefficient();
    calcATBM();
    initElixirObj();
    initWorldObj();
    rrRenderTargetsObj();

    // --- Typewriter Effect for Home Page ---
    const twText = document.getElementById('typewriter-text');
    if (twText) {
        const words = [
            'Wing Calculator', 
            'Elixir Calculator', 
            'World Rate Calculator', 
            'Wing Simulator', 
            'Reroll Simulator', 
            'Absorb Analysis', 
            'Pet Absorb Analysis'
        ];
        let wIdx = 0;
        let charIdx = 0;
        let isDeleting = false;
        
        function typeEffect() {
            const currentWord = words[wIdx];
            if (isDeleting) {
                twText.textContent = currentWord.substring(0, charIdx - 1);
                charIdx--;
            } else {
                twText.textContent = currentWord.substring(0, charIdx + 1);
                charIdx++;
            }
            
            let speed = isDeleting ? 30 : 80;
            
            if (!isDeleting && charIdx === currentWord.length) {
                speed = 2000; // Pause at end of word
                isDeleting = true;
            } else if (isDeleting && charIdx === 0) {
                isDeleting = false;
                wIdx = (wIdx + 1) % words.length;
                speed = 500; // Pause before new word
            }
            setTimeout(typeEffect, speed);
        }
        setTimeout(typeEffect, 500);
    }


});
