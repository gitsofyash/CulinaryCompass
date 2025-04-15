
import config from './config.js';
const API_KEY = config.apiKey;
const BASE_URL = 'https://api.spoonacular.com/recipes';
const RECIPES_PER_PAGE = 20;

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const cuisineFilter = document.getElementById('cuisineFilter');
    const dietFilter = document.getElementById('dietFilter');
    const recipeGrid = document.getElementById('recipeGrid');
    const modal = document.getElementById('recipeModal');
    const closeBtn = document.querySelector('.close');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const currentPageSpan = document.getElementById('currentPage');
    
    let currentPage = 1;
    let totalResults = 0;

    // Initial recipe load
    fetchRandomRecipes();

    // Search functionality
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Filter changes
    cuisineFilter.addEventListener('change', handleSearch);
    dietFilter.addEventListener('change', handleSearch);

    // Modal close
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    async function fetchRandomRecipes() {
        try {
            const response = await fetch(
                `${BASE_URL}/random?number=${RECIPES_PER_PAGE}&apiKey=${API_KEY}`
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Random recipes data:', data); // Debug log
            renderRecipes(data.recipes);
            updatePaginationControls(RECIPES_PER_PAGE, RECIPES_PER_PAGE);
        } catch (error) {
            console.error('Error fetching random recipes:', error);
            recipeGrid.innerHTML = '<p>Error loading recipes. Please try again later.</p>';
        }
    }

    async function handleSearch() {
        const searchTerm = searchInput.value;
        const cuisine = cuisineFilter.value;
        const diet = dietFilter.value;

        try {
            const params = new URLSearchParams({
                apiKey: API_KEY,
                query: searchTerm || '',
                cuisine: cuisine,
                diet: diet,
                number: RECIPES_PER_PAGE,
                offset: (currentPage - 1) * RECIPES_PER_PAGE,
                addRecipeInformation: true
            });

            const response = await fetch(`${BASE_URL}/complexSearch?${params}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Search results:', data); // Debug log
            totalResults = data.totalResults;
            renderRecipes(data.results);
            updatePaginationControls(totalResults, RECIPES_PER_PAGE);
        } catch (error) {
            console.error('Error searching recipes:', error);
            recipeGrid.innerHTML = '<p>Error searching recipes. Please try again later.</p>';
        }
    }

    function renderRecipes(recipes) {
        if (!recipes || recipes.length === 0) {
            recipeGrid.innerHTML = '<p>No recipes found.</p>';
            return;
        }
        
        recipeGrid.innerHTML = '';
        recipes.forEach(recipe => {
            const card = createRecipeCard(recipe);
            recipeGrid.appendChild(card);
        });
    }

    // Add pagination controls event listeners
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            handleSearch();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    nextPageBtn.addEventListener('click', () => {
        currentPage++;
        handleSearch();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    function updatePaginationControls(total, perPage) {
        const totalPages = Math.ceil(total / perPage);
        currentPageSpan.textContent = `Page ${currentPage} of ${totalPages}`;
        
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages;
    }

    function renderRecipes(recipes) {
        recipeGrid.innerHTML = '';
        recipes.forEach(recipe => {
            const card = createRecipeCard(recipe);
            recipeGrid.appendChild(card);
        });
    }

    function createRecipeCard(recipe) {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <div class="content">
                <h3>${recipe.title}</h3>
                <p>Ready in ${recipe.readyInMinutes} minutes</p>
                <p>Servings: ${recipe.servings}</p>
            </div>
        `;

        card.addEventListener('click', () => fetchAndShowRecipeDetails(recipe.id));
        return card;
    }

    async function fetchAndShowRecipeDetails(recipeId) {
        try {
            const response = await fetch(
                `${BASE_URL}/${recipeId}/information?apiKey=${API_KEY}`
            );
            const recipe = await response.json();
            showRecipeDetails(recipe);
        } catch (error) {
            console.error('Error fetching recipe details:', error);
        }
    }

    function showRecipeDetails(recipe) {
        const recipeDetails = document.getElementById('recipeDetails');
        recipeDetails.innerHTML = `
            <h2>${recipe.title}</h2>
            <img src="${recipe.image}" alt="${recipe.title}" style="max-width: 100%; height: auto;">
            <div class="recipe-info">
                <p>Ready in: ${recipe.readyInMinutes} minutes</p>
                <p>Servings: ${recipe.servings}</p>
                <p>Health Score: ${recipe.healthScore}</p>
            </div>
            <h3>Ingredients:</h3>
            <ul>
                ${recipe.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('')}
            </ul>
            <h3>Instructions:</h3>
            <div>${recipe.instructions || 'No instructions available.'}</div>
        `;
        modal.style.display = 'block';
    }
});