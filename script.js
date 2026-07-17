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
  store.planner = store.planner || {};

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
    div.className = "mini-card";
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
      <div class="section-head">
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
    let currentCat = catNames[0];

    function refresh(cat){
      currentCat = cat || currentCat;
      catEl.textContent = currentCat;
      qEl.textContent = randomStarter(currentCat);
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

  // ---------------- PLANNER (Tool #1) ----------------
  (function(){
    const ids = ["pl-idea","pl-lead","pl-when","pl-budget","pl-childcare","pl-prep","pl-best","pl-laugh"];
    const p = store.planner;
    ids.forEach(id=>{
      const el = document.getElementById(id);
      if(p[id] !== undefined) el.value = p[id];
    });
    if(p["pl-again"]){
      const r = document.querySelector(`input[name="pl-again"][value="${p["pl-again"]}"]`);
      if(r) r.checked = true;
    }

    // 1–10 scale buttons
    const scaleEl = document.getElementById("pl-scale");
    let selected = p.scale || null;
    for(let i=1;i<=10;i++){
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = i;
      if(selected===i) b.classList.add("sel");
      b.addEventListener("click", ()=>{
        selected = i;
        scaleEl.querySelectorAll("button").forEach(x=>x.classList.remove("sel"));
        b.classList.add("sel");
      });
      scaleEl.appendChild(b);
    }

    function flashMsg(el){
      el.classList.add("show");
      setTimeout(()=>el.classList.remove("show"), 1800);
    }

    document.getElementById("pl-save").addEventListener("click", ()=>{
      ["pl-idea","pl-lead","pl-when","pl-budget","pl-childcare","pl-prep"].forEach(id=>{
        store.planner[id] = document.getElementById(id).value;
      });
      saveStore(store);
      flashMsg(document.getElementById("pl-msg"));
    });

    document.getElementById("pl-save2").addEventListener("click", ()=>{
      store.planner["pl-best"] = document.getElementById("pl-best").value;
      store.planner["pl-laugh"] = document.getElementById("pl-laugh").value;
      store.planner.scale = selected;
      const checked = document.querySelector('input[name="pl-again"]:checked');
      store.planner["pl-again"] = checked ? checked.value : null;
      saveStore(store);
      flashMsg(document.getElementById("pl-msg2"));
    });
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

})();
