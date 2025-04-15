
let API_KEY;
const BASE_URL = 'https://api.spoonacular.com/recipes';
const RECIPES_PER_PAGE = 20;

async function initializeApp() {
    try {
        const apiUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000/api/key'
            : '/api/key';
        const response = await fetch(apiUrl);
        const data = await response.json();
        API_KEY = data.key;
        setupEventListeners();
        // Initial recipe load
        fetchRandomRecipes();
    } catch (error) {
        console.error('Error fetching API key:', error);
        document.getElementById('recipeGrid').innerHTML = '<p>Error initializing application. Please try again later.</p>';
    }
}

function setupEventListeners() {
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

    // Event Listeners
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    cuisineFilter.addEventListener('change', handleSearch);
    dietFilter.addEventListener('change', handleSearch);
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
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

    // Move fetchRandomRecipes outside setupEventListeners
    window.fetchRandomRecipes = async function() {
        try {
            const response = await fetch(
                `${BASE_URL}/random?number=${RECIPES_PER_PAGE}&apiKey=${API_KEY}`
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
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

        if (!searchTerm && !cuisine && !diet) {
            currentPage = 1;
            fetchRandomRecipes();
            return;
        }

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

    function updatePaginationControls(total, perPage) {
        const totalPages = Math.ceil(total / perPage);
        currentPageSpan.textContent = `Page ${currentPage} of ${totalPages}`;
        
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages;
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
}

document.addEventListener('DOMContentLoaded', initializeApp);