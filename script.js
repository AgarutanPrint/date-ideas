// A Letter to Tired Parents — Digital Companion — behavior

(function(){
  "use strict";

  const LS_KEY = "tiredParents";

  function loadStore(){
    try{ return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
    catch(e){ return {}; }
  }
  function saveStore(store){
    try{ localStorage.setItem(LS_KEY, JSON.stringify(store)); }
    catch(e){ /* storage unavailable — silently no-op */ }
  }
  let store = loadStore();
  store.sparks = store.sparks || [];
  store.budget = store.budget || [];
  store.plans = store.plans || [];
  store.starterNotes = store.starterNotes || [];

  // ---------------- NAVIGATION ----------------
  const NAV_TO_VIEW = {
    "home":"view-home",
    "quick":"view-quick",
    "home-adv":"view-home-adv",
    "frugal":"view-frugal",
    "sitter":"view-sitter",
    "celebrate":"view-celebrate",
    "toolkit":"view-toolkit"
  };
  const NAV_TO_SECTIONKEY = { "quick":"quick", "home-adv":"home", "frugal":"frugal", "sitter":"sitter", "celebrate":"celebrate" };

  function showView(navKey){
    document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
    const el = document.getElementById(NAV_TO_VIEW[navKey]);
    if(el) el.classList.add("active");
    document.querySelectorAll(".navlist button").forEach(b=>{
      b.classList.toggle("active", b.dataset.view === navKey);
    });
    window.scrollTo({top:0, behavior:"instant" in window ? "instant":"auto"});
  }

  // Menu-style color coding: tint each nav item to match its section
  document.querySelectorAll(".navlist button[data-view]").forEach(btn=>{
    const navKey = btn.dataset.view;
    if(navKey === "toolkit"){ btn.classList.add("tint-yellow"); return; }
    const sKey = NAV_TO_SECTIONKEY[navKey];
    if(!sKey) return; // "home" stays neutral
    const meta = SECTIONS.find(s=>s.id===sKey);
    if(meta) btn.classList.add("tint-"+meta.color);
  });

  document.getElementById("navlist").addEventListener("click", e=>{
    const btn = e.target.closest("button[data-view]");
    if(!btn) return;
    showView(btn.dataset.view);
  });
  document.querySelectorAll("[data-goto]").forEach(el=>{
    el.addEventListener("click", ()=> showView(el.dataset.goto));
  });

  // ---------------- HOME: section cards ----------------
  const homeCardsEl = document.getElementById("home-section-cards");
  const NAV_ORDER = ["quick","home-adv","frugal","sitter","celebrate"];
  NAV_ORDER.forEach(navKey=>{
    const sKey = NAV_TO_SECTIONKEY[navKey];
    const meta = SECTIONS.find(s=>s.id===sKey);
    const count = DATES.filter(d=>d.section===sKey).length;
    const div = document.createElement("div");
    div.className = "mini-card tint-"+meta.color;
    div.innerHTML = `<div class="n">${count} ideas</div><div class="t">${meta.label}</div><div style="font-size:.82rem;color:var(--ink-soft);margin-top:4px;">${meta.tagline}</div>`;
    div.addEventListener("click", ()=> showView(navKey));
    homeCardsEl.appendChild(div);
  });

  // ---------------- DATE SECTION RENDERING ----------------
  function pillClass(section){
    if(section==="quick"||section==="sitter") return "blush";
    if(section==="home"||section==="celebrate") return "sage";
    return "lavender";
  }

  function renderCard(d){
    const wrap = document.createElement("div");
    wrap.className = "recipe-card";
    wrap.innerHTML = `
      <div class="num">DATE #${String(d.id).padStart(2,"0")}</div>
      <h3>${d.title}</h3>
      <div class="vibe">${d.vibe}</div>
      <div class="stat-strip">
        <span class="pill ${pillClass(d.section)}">⏱ ${d.time}</span>
        <span class="pill ${pillClass(d.section)}">${d.cost}</span>
        <span class="pill ${pillClass(d.section)}">⚡ ${d.energy}</span>
      </div>
      <div class="expand-hint">Tap for the full plan ▾</div>
      <div class="card-detail">
        <h4>You'll need</h4><p>${d.need}</p>
        <h4>The plan</h4><p>${d.plan}</p>
        <h4>Pro-tip</h4><p>${d.tip}</p>
        <h4>Conversation spark</h4><p>“${d.spark}”</p>
        ${d.hack ? `<div class="hack-box"><b>Parent hack:</b> ${d.hack}</div>` : ""}
        <button class="btn btn-ghost btn-sm" style="margin-top:12px;" data-use="${d.title.replace(/"/g,'&quot;')}">Plan this date →</button>
      </div>
    `;
    wrap.addEventListener("click", (e)=>{
      if(e.target.closest("[data-use]")) return; // handled separately
      wrap.classList.toggle("open");
    });
    wrap.querySelector("[data-use]").addEventListener("click", (e)=>{
      e.stopPropagation();
      document.getElementById("pl-idea").value = d.title;
      showView("toolkit");
      document.querySelector('.tool-tab[data-tool="planner"]').click();
      document.getElementById("pl-idea").focus();
    });
    return wrap;
  }

  function buildSectionView(navKey){
    const sKey = NAV_TO_SECTIONKEY[navKey];
    const meta = SECTIONS.find(s=>s.id===sKey);
    const items = DATES.filter(d=>d.section===sKey).sort((a,b)=>a.id-b.id);
    const el = document.getElementById(NAV_TO_VIEW[navKey]);

    const energies = ["All","Low","Medium","High"];

    el.innerHTML = `
      <div class="section-head tint-${meta.color}">
        <span class="eyebrow">${items.length} ideas</span>
        <h1>${meta.label}</h1>
        <p>${meta.tagline}</p>
      </div>
      <div class="chipbar" id="chipbar-${sKey}"></div>
      <div class="card-grid" id="grid-${sKey}"></div>
      ${DATES_MORE[sKey] ? `
      <div class="more-ideas">
        <h4>More ideas from the book, ready to try</h4>
        <div class="tagcloud">${DATES_MORE[sKey].map(t=>`<span>${t}</span>`).join("")}</div>
      </div>` : ""}
    `;

    const grid = document.getElementById(`grid-${sKey}`);
    function draw(filter){
      grid.innerHTML = "";
      items
        .filter(d=> filter==="All" || d.energy.startsWith(filter))
        .forEach(d=> grid.appendChild(renderCard(d)));
    }
    const chipbar = document.getElementById(`chipbar-${sKey}`);
    energies.forEach((en,i)=>{
      const chip = document.createElement("button");
      chip.className = "chip" + (i===0 ? " active":"");
      chip.textContent = en==="All" ? "All energy levels" : en+" energy";
      chip.addEventListener("click", ()=>{
        chipbar.querySelectorAll(".chip").forEach(c=>c.classList.remove("active"));
        chip.classList.add("active");
        draw(en);
      });
      chipbar.appendChild(chip);
    });
    draw("All");
  }

  NAV_ORDER.forEach(buildSectionView);

  // ---------------- CONVERSATION STARTERS ----------------
  const catNames = Object.keys(CONVO_STARTERS);
  function randomStarter(cat){
    const list = CONVO_STARTERS[cat];
    return list[Math.floor(Math.random()*list.length)];
  }
  function pickRandomCat(){
    return catNames[Math.floor(Math.random()*catNames.length)];
  }

  // Home widget
  (function(){
    const catEl = document.getElementById("home-starter-cat");
    const qEl = document.getElementById("home-starter-q");
    function refresh(){
      const cat = pickRandomCat();
      catEl.textContent = cat;
      qEl.textContent = randomStarter(cat);
    }
    document.getElementById("home-starter-shuffle").addEventListener("click", refresh);
    refresh();
  })();

  // Toolkit widget with category buttons
  (function(){
    const catEl = document.getElementById("tk-starter-cat");
    const qEl = document.getElementById("tk-starter-q");
    const catButtonsEl = document.getElementById("tk-starter-cats");
    const noteEl = document.getElementById("tk-starter-note");
    const saveBtn = document.getElementById("tk-starter-save");
    const msgEl = document.getElementById("tk-starter-msg");
    const archiveEl = document.getElementById("starter-archive");
    let currentCat = catNames[0];

    function refresh(cat){
      currentCat = cat || currentCat;
      catEl.textContent = currentCat;
      qEl.textContent = randomStarter(currentCat);
      noteEl.value = "";
      catButtonsEl.querySelectorAll("button").forEach(b=>{
        b.classList.toggle("active", b.textContent === currentCat);
      });
    }
    catNames.forEach(cat=>{
      const b = document.createElement("button");
      b.className = "chip";
      b.textContent = cat;
      b.addEventListener("click", ()=> refresh(cat));
      catButtonsEl.appendChild(b);
    });
    document.getElementById("tk-starter-shuffle").addEventListener("click", ()=> refresh());
    refresh(currentCat);

    function renderArchive(){
      archiveEl.innerHTML = "";
      if(store.starterNotes.length===0){
        archiveEl.innerHTML = `<p class="empty-note">Nothing saved yet — answer a starter above and save it.</p>`;
        return;
      }
      store.starterNotes.forEach(n=>{
        const div = document.createElement("div");
        div.className = "spark-entry";
        div.innerHTML = `
          <button class="del" title="Delete">✕</button>
          <div class="stat-strip"><span class="pill lavender">${n.cat}</span></div>
          <h4>“${n.q}”</h4>
          <p style="margin:0;font-size:.9rem;white-space:pre-line;">${n.note}</p>
        `;
        div.querySelector(".del").addEventListener("click", ()=>{
          store.starterNotes = store.starterNotes.filter(x=>x.id!==n.id);
          saveStore(store);
          renderArchive();
        });
        archiveEl.appendChild(div);
      });
    }

    saveBtn.addEventListener("click", ()=>{
      const note = noteEl.value.trim();
      if(!note){ noteEl.focus(); return; }
      store.starterNotes.unshift({
        id: Date.now(),
        cat: currentCat,
        q: qEl.textContent,
        note
      });
      saveStore(store);
      msgEl.classList.add("show");
      setTimeout(()=>msgEl.classList.remove("show"), 1800);
      noteEl.value = "";
      renderArchive();
    });

    renderArchive();
  })();

  // ---------------- TOOLKIT TAB SWITCHING ----------------
  document.getElementById("tool-tabs").addEventListener("click", e=>{
    const btn = e.target.closest(".tool-tab");
    if(!btn) return;
    document.querySelectorAll(".tool-tab").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".tool-pane").forEach(p=>p.classList.remove("active"));
    document.getElementById(`pane-${btn.dataset.tool}`).classList.add("active");
  });

  // ---------------- PLANNER ARCHIVE (Tool #1) ----------------
  (function(){
    store.plans = store.plans || [];

    // one-time migration: earlier version of this site only stored a single
    // plan under store.planner — fold it into the archive so nobody loses data.
    if(store.planner && store.planner["pl-idea"]){
      store.plans.unshift({
        id: Date.now(),
        idea: store.planner["pl-idea"]||"",
        lead: store.planner["pl-lead"]||"Partner A",
        when: store.planner["pl-when"]||"",
        budget: store.planner["pl-budget"]||"",
        childcare: store.planner["pl-childcare"]||"At-home (kids asleep)",
        prep: store.planner["pl-prep"]||"",
        reflection: {
          best: store.planner["pl-best"]||"",
          laugh: store.planner["pl-laugh"]||"",
          scale: store.planner.scale||null,
          again: store.planner["pl-again"]||null,
        }
      });
      delete store.planner;
      saveStore(store);
    }

    function flashMsg(el){
      el.classList.add("show");
      setTimeout(()=>el.classList.remove("show"), 1800);
    }

    document.getElementById("pl-save").addEventListener("click", ()=>{
      const idea = document.getElementById("pl-idea").value.trim();
      if(!idea){ document.getElementById("pl-idea").focus(); return; }
      store.plans.unshift({
        id: Date.now(),
        idea,
        lead: document.getElementById("pl-lead").value,
        when: document.getElementById("pl-when").value,
        budget: document.getElementById("pl-budget").value,
        childcare: document.getElementById("pl-childcare").value,
        prep: document.getElementById("pl-prep").value,
        reflection: { best:"", laugh:"", scale:null, again:null }
      });
      saveStore(store);
      ["pl-idea","pl-when","pl-budget","pl-prep"].forEach(id=> document.getElementById(id).value = "");
      flashMsg(document.getElementById("pl-msg"));
      renderArchive();
    });

    const archiveEl = document.getElementById("plan-archive");

    function renderArchive(){
      archiveEl.innerHTML = "";
      if(store.plans.length===0){
        archiveEl.innerHTML = `<p class="empty-note">No dates logged yet — add your first one above.</p>`;
        return;
      }
      store.plans.forEach((plan)=>{
        const div = document.createElement("div");
        div.className = "spark-entry";
        const r = plan.reflection || (plan.reflection = {best:"",laugh:"",scale:null,again:null});
        div.innerHTML = `
          <button class="del" title="Delete">✕</button>
          <h4>${plan.idea}</h4>
          <div class="stat-strip">
            ${plan.when?`<span class="pill lavender">🗓 ${plan.when}</span>`:""}
            ${plan.budget?`<span class="pill lavender">${plan.budget}</span>`:""}
            <span class="pill lavender">${plan.lead}</span>
            <span class="pill lavender">${plan.childcare}</span>
          </div>
          ${plan.prep?`<p style="margin:8px 0 4px;font-size:.87rem;color:var(--ink-soft);"><b>Prep:</b> ${plan.prep}</p>`:""}

          <div style="margin-top:14px;padding-top:12px;border-top:1px dashed var(--border);">
            <div class="field">
              <label>Best moment</label>
              <input type="text" class="r-best" placeholder="What was the best moment?" value="${r.best||""}">
            </div>
            <div class="field">
              <label>What made us laugh</label>
              <input type="text" class="r-laugh" value="${r.laugh||""}">
            </div>
            <div class="field">
              <label>How connected did we feel? (1–10)</label>
              <div class="scale-row r-scale"></div>
            </div>
            <div class="field">
              <label>Do this again?</label>
              <div class="radio-row">
                <label><input type="radio" name="again-${plan.id}" value="yes" ${r.again==="yes"?"checked":""}> Yes!</label>
                <label><input type="radio" name="again-${plan.id}" value="tweak" ${r.again==="tweak"?"checked":""}> Maybe, with tweaks</label>
              </div>
            </div>
            <div class="save-row">
              <button class="btn btn-ghost btn-sm r-save">Save reflection</button>
              <span class="save-msg r-msg">Saved ✓</span>
            </div>
          </div>
        `;

        // 1–10 scale buttons for this entry
        const scaleEl = div.querySelector(".r-scale");
        for(let i=1;i<=10;i++){
          const b = document.createElement("button");
          b.type = "button";
          b.textContent = i;
          if(r.scale===i) b.classList.add("sel");
          b.addEventListener("click", ()=>{
            r.scale = i;
            scaleEl.querySelectorAll("button").forEach(x=>x.classList.remove("sel"));
            b.classList.add("sel");
          });
          scaleEl.appendChild(b);
        }

        div.querySelector(".del").addEventListener("click", ()=>{
          store.plans = store.plans.filter(p=>p.id!==plan.id);
          saveStore(store);
          renderArchive();
        });

        div.querySelector(".r-save").addEventListener("click", ()=>{
          r.best = div.querySelector(".r-best").value;
          r.laugh = div.querySelector(".r-laugh").value;
          const checked = div.querySelector(`input[name="again-${plan.id}"]:checked`);
          r.again = checked ? checked.value : null;
          saveStore(store);
          flashMsg(div.querySelector(".r-msg"));
        });

        archiveEl.appendChild(div);
      });
    }

    renderArchive();
  })();

  // ---------------- BUDGET TRACKER (Tool #3) ----------------
  (function(){
    const tbody = document.getElementById("budget-rows");
    const totalEl = document.getElementById("budget-total");

    function num(v){ const n = parseFloat(String(v).replace(/[^0-9.\-]/g,"")); return isNaN(n)?0:n; }

    function renderRows(){
      tbody.innerHTML = "";
      store.budget.forEach((row,i)=>{
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><input type="text" data-f="date" placeholder="Date" value="${row.date||""}"></td>
          <td><input type="text" data-f="idea" placeholder="Idea" value="${row.idea||""}"></td>
          <td><input type="text" data-f="budget" placeholder="$" value="${row.budget||""}"></td>
          <td><input type="text" data-f="spent" placeholder="$" value="${row.spent||""}"></td>
          <td><input type="text" data-f="notes" placeholder="Worth it?" value="${row.notes||""}"></td>
          <td><button class="row-del" title="Delete row">✕</button></td>
        `;
        tr.querySelectorAll("input").forEach(inp=>{
          inp.addEventListener("input", ()=>{
            store.budget[i][inp.dataset.f] = inp.value;
            saveStore(store);
            renderTotal();
          });
        });
        tr.querySelector(".row-del").addEventListener("click", ()=>{
          store.budget.splice(i,1);
          saveStore(store);
          renderRows();
          renderTotal();
        });
        tbody.appendChild(tr);
      });
    }
    function renderTotal(){
      const totBudget = store.budget.reduce((s,r)=>s+num(r.budget),0);
      const totSpent = store.budget.reduce((s,r)=>s+num(r.spent),0);
      totalEl.textContent = `Total planned: $${totBudget.toFixed(2)} · Total spent: $${totSpent.toFixed(2)}`;
    }
    document.getElementById("budget-add").addEventListener("click", ()=>{
      store.budget.push({date:"",idea:"",budget:"",spent:"",notes:""});
      saveStore(store);
      renderRows();
      renderTotal();
    });
    if(store.budget.length===0){
      store.budget.push({date:"",idea:"",budget:"",spent:"",notes:""});
    }
    renderRows();
    renderTotal();
  })();

  // ---------------- IDEA SPARK PAGES (Tool #4) ----------------
  (function(){
    const listEl = document.getElementById("spark-list");
    function render(){
      listEl.innerHTML = "";
      if(store.sparks.length===0){
        listEl.innerHTML = `<p class="empty-note">No custom dates yet — add your first one above.</p>`;
        return;
      }
      store.sparks.forEach((s,i)=>{
        const div = document.createElement("div");
        div.className = "spark-entry";
        div.innerHTML = `
          <button class="del" title="Delete">✕</button>
          <h4>${s.title}</h4>
          <div class="stat-strip">
            ${s.time?`<span class="pill lavender">⏱ ${s.time}</span>`:""}
            ${s.cost?`<span class="pill lavender">${s.cost}</span>`:""}
            ${s.energy?`<span class="pill lavender">⚡ ${s.energy}</span>`:""}
          </div>
          ${s.plan?`<p style="margin:8px 0 4px;font-size:.9rem;white-space:pre-line;">${s.plan}</p>`:""}
          ${s.spark?`<p style="margin:0;font-size:.85rem;font-style:italic;color:var(--ink-soft);">“${s.spark}”</p>`:""}
        `;
        div.querySelector(".del").addEventListener("click", ()=>{
          store.sparks.splice(i,1);
          saveStore(store);
          render();
        });
        listEl.appendChild(div);
      });
    }
    document.getElementById("spark-add").addEventListener("click", ()=>{
      const title = document.getElementById("spark-title").value.trim();
      if(!title){ document.getElementById("spark-title").focus(); return; }
      store.sparks.unshift({
        title,
        time: document.getElementById("spark-time").value,
        cost: document.getElementById("spark-cost").value,
        energy: document.getElementById("spark-energy").value,
        plan: document.getElementById("spark-plan").value,
        spark: document.getElementById("spark-spark").value,
      });
      saveStore(store);
      ["spark-title","spark-time","spark-cost","spark-energy","spark-plan","spark-spark"].forEach(id=>{
        document.getElementById(id).value = "";
      });
      render();
    });
    render();
  })();

  // ---------------- EXPORT AS PDF ----------------
  (function(){
    const btn = document.getElementById("export-pdf-btn");
    const printArea = document.getElementById("print-area");

    function esc(s){
      const d = document.createElement("div");
      d.textContent = s == null ? "" : String(s);
      return d.innerHTML;
    }

    function buildPrintHTML(){
      const today = new Date().toLocaleDateString(undefined, {year:"numeric",month:"long",day:"numeric"});
      let html = `<h1>Our Date Night Toolkit</h1><div class="print-sub">From "A Letter to Tired Parents" — exported ${today}</div>`;

      html += `<h2>Our Date Archive</h2>`;
      if(store.plans.length===0){
        html += `<p class="p-empty">No dates logged yet.</p>`;
      } else {
        store.plans.forEach(p=>{
          const r = p.reflection || {};
          html += `<div class="p-entry">
            <h3>${esc(p.idea)}</h3>
            <div class="p-meta">${esc(p.when)||"No date set"} · ${esc(p.lead)} · ${esc(p.childcare)}${p.budget?` · Budget: ${esc(p.budget)}`:""}</div>
            ${p.prep?`<div class="p-field"><b>Prep:</b> ${esc(p.prep)}</div>`:""}
            ${r.best?`<div class="p-field"><b>Best moment:</b> ${esc(r.best)}</div>`:""}
            ${r.laugh?`<div class="p-field"><b>What made us laugh:</b> ${esc(r.laugh)}</div>`:""}
            ${r.scale?`<div class="p-field"><b>Connection score:</b> ${r.scale}/10</div>`:""}
            ${r.again?`<div class="p-field"><b>Do again:</b> ${r.again==="yes"?"Yes!":"Maybe, with tweaks"}</div>`:""}
          </div>`;
        });
      }

      html += `<h2>Starters We've Talked Through</h2>`;
      if(store.starterNotes.length===0){
        html += `<p class="p-empty">Nothing saved yet.</p>`;
      } else {
        store.starterNotes.forEach(n=>{
          html += `<div class="p-entry">
            <h3>“${esc(n.q)}”</h3>
            <div class="p-meta">${esc(n.cat)}</div>
            <div class="p-field">${esc(n.note)}</div>
          </div>`;
        });
      }

      html += `<h2>Budget Tracker</h2>`;
      const rows = store.budget.filter(r=> r.date||r.idea||r.budget||r.spent||r.notes);
      if(rows.length===0){
        html += `<p class="p-empty">No budget entries yet.</p>`;
      } else {
        html += `<table><thead><tr><th>Date</th><th>Idea</th><th>Budget</th><th>Spent</th><th>Notes</th></tr></thead><tbody>`;
        rows.forEach(r=>{
          html += `<tr><td>${esc(r.date)}</td><td>${esc(r.idea)}</td><td>${esc(r.budget)}</td><td>${esc(r.spent)}</td><td>${esc(r.notes)}</td></tr>`;
        });
        html += `</tbody></table>`;
      }

      html += `<h2>Our Idea Spark Pages</h2>`;
      if(store.sparks.length===0){
        html += `<p class="p-empty">No custom dates added yet.</p>`;
      } else {
        store.sparks.forEach(s=>{
          html += `<div class="p-entry">
            <h3>${esc(s.title)}</h3>
            <div class="p-meta">${[s.time,s.cost,s.energy].filter(Boolean).map(esc).join(" · ")}</div>
            ${s.plan?`<div class="p-field">${esc(s.plan)}</div>`:""}
            ${s.spark?`<div class="p-field"><b>Conversation spark:</b> “${esc(s.spark)}”</div>`:""}
          </div>`;
        });
      }

      return html;
    }

    btn.addEventListener("click", ()=>{
      printArea.innerHTML = buildPrintHTML();
      window.print();
    });
  })();

})();
