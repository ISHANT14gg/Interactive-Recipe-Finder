// Interactive Recipe Finder - simple static implementation
// Load recipes from recipes.json (local file)
async function loadRecipes() {
    const res = await fetch('recipes.json');
    return await res.json();
  }
  
  function normalizeList(text){
    return text.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
  }
  
  function computeMatch(recipeIngredients, userIngredients){
    // Count exact or partial matches (word-level)
    const matched = new Set();
    for(const ui of userIngredients){
      for(const ri of recipeIngredients){
        if(ri.includes(ui) || ui.includes(ri) || ri.split(' ').some(tok=>tok===ui)){
          matched.add(ri);
        }
      }
    }
    const matchCount = matched.size;
    const percent = Math.round((matchCount / recipeIngredients.length) * 100);
    return {matchCount, percent, matched: Array.from(matched)};
  }
  
  function createCard(recipe, matchInfo){
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.name}" onerror="this.style.opacity=.6;this.src='https://via.placeholder.com/400x250?text=Recipe'">
      <h3>${recipe.name}</h3>
      <div class="meta">
        <div class="small">Ingredients: ${recipe.ingredients.length}</div>
        <div class="badge">${matchInfo.percent}% match</div>
      </div>
      <p class="small">Matched: ${matchInfo.matched.join(', ') || '—'}</p>
      <div style="margin-top:auto; display:flex; gap:8px">
        <button class="viewBtn">View Recipe</button>
        <a href="${recipe.source??'#'}" target="_blank" class="small" style="align-self:center">Source</a>
      </div>
    `;
    // attach view button
    div.querySelector('.viewBtn').addEventListener('click', ()=>openModal(recipe, matchInfo));
    return div;
  }
  
  function openModal(recipe, matchInfo){
    const modal = document.getElementById('modal');
    const body = document.getElementById('modalBody');
    body.innerHTML = `<h2>${recipe.name}</h2>
      <p class="small">Match: ${matchInfo.percent}% — matched ingredients: ${matchInfo.matched.join(', ') || '—'}</p>
      <h4>Ingredients</h4>
      <ul>${recipe.ingredients.map(i=>'<li>'+i+'</li>').join('')}</ul>
      <h4>Steps</h4>
      <ol>${recipe.steps.map(s=>'<li>'+s+'</li>').join('')}</ol>
      <p class="small">Source: <a href="${recipe.source??'#'}" target="_blank">Open</a></p>
    `;
    modal.setAttribute('aria-hidden','false');
  }
  
  function closeModal(){
    const modal = document.getElementById('modal');
    modal.setAttribute('aria-hidden','true');
  }
  
  document.addEventListener('DOMContentLoaded', async ()=>{
    const recipes = await loadRecipes();
    const findBtn = document.getElementById('findBtn');
    const ingredientsInput = document.getElementById('ingredients');
    const results = document.getElementById('results');
    const minMatch = document.getElementById('minMatch');
    const minVal = document.getElementById('minVal');
    document.getElementById('closeModal').addEventListener('click', closeModal);
  
    minMatch.addEventListener('input', ()=> minVal.textContent = minMatch.value);
  
    function showResults(userList){
      results.innerHTML = '';
      const userIngredients = userList.map(s=>s.toLowerCase().trim()).filter(Boolean);
      const scored = recipes.map(r=>{
        const rList = r.ingredients.map(x=>x.toLowerCase());
        const info = computeMatch(rList, userIngredients);
        return {...r, info};
      }).filter(x=>x.info.percent >= parseInt(minMatch.value))
        .sort((a,b)=>b.info.percent - a.info.percent || b.info.matchCount - a.info.matchCount);
  
      if(scored.length===0){
        results.innerHTML = '<p class="small">No matching recipes found. Try adding more ingredients.</p>';
        return;
      }
  
      for(const r of scored){
        results.appendChild(createCard(r, r.info));
      }
    }
  
    findBtn.addEventListener('click', ()=>{
      const text = ingredientsInput.value;
      const userList = text.split(',').map(s=>s.trim()).filter(Boolean);
      showResults(userList);
    });
  
    // optional: sample auto-run with prefilled ingredients
    ingredientsInput.placeholder = 'e.g. eggs, milk, flour, tomato, rice, chicken';
  });
  