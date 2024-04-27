const mealsEl       = document.getElementById('meals');
const favContainer  = document.getElementById('fav-meals');
const mealPopup     = document.getElementById('meal-popup');
const mealInfoEl    = document.getElementById('meal-info');
const popupCloseBtn = document.getElementById('close-popup');

const searchTerm = document.getElementById('search-term');
const searchBtn  = document.getElementById('search');

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {

    // Clean the container
    mealsEl.innerHTML = "";

    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    
    const respData = await resp.json();
    const randomMeal = respData.meals[0];
    
    addMeal(randomMeal, true);
    
}

async function getMealById(id) {

    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id);
    
    const respData = await resp.json();
    
    if (respData) {
        
        const meal = respData.meals[0];
    
        return meal;
        
    } else {
        
        return false;
        
    }// else if (respData)
    
}

async function getMealsBySearch(term) {

    //Clean the container
    mealsEl.innerHTML = "";

    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + term);
    
    const respData = await resp.json();
    const meals = respData.meals;
    
    return meals;
    
}

function addMeal(mealData, random = false) {
    
    const meal = document.createElement('div');
    meal.classList.add('meal');
    
    // Add meal details in a div
    meal.innerHTML = `
        <div class="meal-header">
            ${random ? `
            <span class="random">
                Receitas Diversas
            </span>` : ''}
            <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>            
        </div>
    `;
    
    // Add button in a different div
    const mealBtn = document.createElement('div');
    mealBtn.classList.add('meal-fav-btn');
    
    mealBtn.innerHTML = `
        <div class="meal-footer">
            <button class="fav-btn" onclick="like(this, ${mealData.idMeal})">
                <i class="fas fa-heart"></i>
            </button>
        </div>
    `;
        
    //Show meal details
    meal.addEventListener("click", () => {
        showMealInfo(mealData);
    });
    
    //Insert data on HTML element
    mealsEl.appendChild(meal);
    mealsEl.appendChild(mealBtn);
    
}

//Add meals to Local Storage
function addMealLS(mealId) {
    
    const mealIds = getMealsLS();
    
    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
    
}

//Remove meals from Local Storage
function removeMealLS(mealId) {
    
    const mealIds = getMealsLS();
    
    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter((id) => id !== mealId)));
    
}

//Get meals from Local Storage
function getMealsLS() {
    
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));
    
    return mealIds === null ? [] : mealIds;
    
}

async function fetchFavMeals() {
            
    //Clean favourite meals container first
    favContainer.innerHTML = "";
    
    const mealIds = getMealsLS();
    
    for (let i = 0; i < mealIds.length; i++) {
        
        // Get meals id
        const mealId = mealIds[i];
        
        // Get meals details by id
        meal = await getMealById(mealId);
        
        // Add meals to HTML
        addMealFav(meal);
        
    }//for (let i = 0; i < mealIds.length; i++)
    
}

function addMealFav(mealData) {
    
    const favMeal = document.createElement('li');
    
    favMeal.innerHTML = `
        <div class="fav-meal-body">
            <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}" />
            <span>${mealData.strMeal}</span>
        </div>
        <div class="fav-meal-clear">
            <button class="clear" onclick="clear(${mealData.idMeal})"><i class="fas fa-window-close"></i></button>
        </div>
    `;
    
    /*
    const btn = favMeal.querySelector('.clear');
    
    btn.addEventListener("click", () => {
        
        //Remove ID from array in local storage
        removeMealLS(mealData.idMeal);
        
        //List favourite meals
        fetchFavMeals();
        
    });
    */
    
    const favMealBody = favMeal.getElementsByClassName("fav-meal-body");
        
    //show details of the favourite meal
    favMealBody[0].addEventListener("click", () => {
        showMealInfo(mealData);
    });
    
    //Add to favourite container
    favContainer.appendChild(favMeal);
    
}

function showMealInfo(mealData) {
    
    //Clean it up
    mealInfoEl.innerHTML = "";
    
    // update the meal info
    const mealEl = document.createElement('div');
    
    const ingredients = [];
    
    //get meal ingredients or measures
    for (let i = 1; i <= 20; i++) {
        
        if (mealData["strIngredient" + i]) {
            ingredients.push(`${mealData["strIngredient" + i]} - ${mealData["strMeasure" + i]}`);
        } else {
            break;
        }
        
    }//for (let i=0; i<20; i++)
    
    mealEl.innerHTML = `
        <h1>${mealData.strMeal}</h1>
    	<img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    	<p>
        	${mealData.strInstructions}
    	</p>
    	<h3>Ingredients:</h3>
    	<ul>
    	    ${ingredients.map((ing) => `<li>${ing}</li>`).join("")}
    	</ul>
    `;
    
    mealInfoEl.appendChild(mealEl);
    
    //show the popup
    mealPopup.classList.remove('hidden');
    
}

searchBtn.addEventListener("click", async () => {

    const search = searchTerm.value;
    
    const meals = await getMealsBySearch(search);
    
    if (meals) {
    
        meals.forEach((meal) => {
            addMeal(meal);
        })
        
    }//if (meals)
    
});

// Like button function
function like(btn, idMeal) {
    
    //Control like button appearance and behavior
    if (btn.classList.contains('active')) {
        
        removeMealLS(idMeal);
        btn.classList.remove('active');
        
    } else {
        
        addMealLS(idMeal);
        btn.classList.add("active");
        
    }// else if (likeBtn.classList.contains('active'))
    
    //List favourite meals
    fetchFavMeals();
    
};// function like(btn)

// Clear button function
/*
const clearFavBtn = document.getElementsByClassName("clear");
clearFavBtn.addEventListener("click", (this) => {
    console.log(this);
});
*/
function clear(idMeal) {
    
    console.log(this);
    console.log(idMeal);
    
    //Remove ID from array in local storage
    removeMealLS(idMeal);
    
    //List favourite meals
    fetchFavMeals();
    
};// function clear(btn)

popupCloseBtn.addEventListener("click", () => {
    mealPopup.classList.add("hidden");
});