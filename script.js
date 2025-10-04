// Improved Interactive Recipe Finder Script
// Author: Ishant Sharma

document.addEventListener('DOMContentLoaded', () => {
  const findBtn = document.getElementById('findBtn');
  const ingredientsInput = document.getElementById('ingredients');
  const resultsContainer = document.getElementById('results');
  const minMatchSlider = document.getElementById('minMatch');
  const minValLabel = document.getElementById('minVal');
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  const closeModal = document.getElementById('closeModal');

  let recipes = [];

  // Load recipes from JSON
  fetch('recipes.json')
    .then(res => res.json())
    .then(data => recipes = data)
    .catch(err => console.error('Error loading recipes:', err));

  // Update slider value display
  minMatchSlider.addEventListener('input', () => {
    minValLabel.textContent = minMatchSlider.value;
  });

  // Parse ingredients input
  const parseIngredients = (raw) => {
    return [...new Set(
      raw.split(',')
         .map(i => i.trim().toLowerCase())
         .filter(Boolean)
    )];
  };

  // Calculate match percentage
  const calculateMatch = (recipeIngredients, userIngredients) => {
    const matches = recipeIngredients.filter(ing => userIngredients.includes(ing));
    return (matches.length / recipeIngredients.length) * 100;
  };

  // Render results
  const renderResults = (filteredRecipes) => {
    resultsContainer.innerHTML = '';

    if (filteredRecipes.length === 0) {
      resultsContainer.innerHTML = '<p class="small">❌ No recipes found. Try adding more ingredients or lowering the match percentage.</p>';
      return;
    }

    filteredRecipes.forEach(r => {
      const card = document.createElement('div');
      card.classList.add('card');
      card.innerHTML = `
        <img src="${r.image}" alt="${r.name}">
        <h3>${r.name}</h3>
        <p class="small">Match: ${r.match.toFixed(0)}%</p>
      `;
      card.addEventListener('click', () => openModal(r));
      resultsContainer.appendChild(card);
    });
  };

  // Open modal with recipe details
  const openModal = (recipe) => {
    modalBody.innerHTML = `
      <h2>${recipe.name}</h2>
      <img src="${recipe.image}" alt="${recipe.name}" style="width:100%; border-radius:8px;">
      <h4>Ingredients:</h4>
      <ul>${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
      <h4>Steps:</h4>
      <ol>${recipe.steps.map(s => `<li>${s}</li>`).join('')}</ol>
    `;
    modal.setAttribute('aria-hidden', 'false');
  };

  // Close modal
  closeModal.addEventListener('click', () => modal.setAttribute('aria-hidden', 'true'));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') modal.setAttribute('aria-hidden', 'true'); });

  // Find recipes
  findBtn.addEventListener('click', () => {
    const userIngredients = parseIngredients(ingredientsInput.value);
    const minMatch = parseFloat(minMatchSlider.value);

    if (userIngredients.length === 0) {
      resultsContainer.innerHTML = '<p class="small">⚠️ Please enter at least one ingredient.</p>';
      return;
    }

    const results = recipes.map(r => ({
      ...r,
      match: calculateMatch(r.ingredients, userIngredients)
    })).filter(r => r.match >= minMatch);

    renderResults(results);
  });
});
