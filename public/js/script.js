// Make the modals for books actually show up and close properly

let bookModal = document.querySelector(".bookModal");

let closeBtns = document.querySelectorAll(".closeModal");
closeBtns.forEach(button => {
    button.addEventListener('click', () => {
    const tId = button.getAttribute('data-target')
    const modal = document.getElementById(tId)
    if (modal) modal.close()
  })
})

const t = document.querySelectorAll(".showBookInfo");
t.forEach(button => {
    button.addEventListener('click', () => {
    const tId = button.getAttribute('data-target')
    const modal = document.getElementById(tId)
    if (modal) modal.showModal()
  })
})

//let addBtn = document.querySelector(".addToCart");

function searchBooks() {
  let searchBtn = document.querySelector("#searchBtn");
  
}

// not letting the user search with nothing in the search bar
const searchForm = document.querySelector("form[action='/searchResults']");
if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
        const input = searchForm.querySelector('input');
        if (input.value.trim() === '') {
            e.preventDefault();
            alert('Please enter a search term!');
        }
    });
}

// Login validation to make sure there are no empty fields before they submit 
const loginForm = document.querySelector("form[action='/loginForm']");
if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
        const username = document.querySelector('#uName').value;
        const password = document.querySelector('#pwd').value;
        if (username === '' || password === '') {
            event.preventDefault();
            alert('Please fill out all fields!');
        }
    });
}

// Signup validation to make sure there are no empty fields before they submit 
const signupForm = document.querySelector("form[action='/signupForm']");
if (signupForm) {
    signupForm.addEventListener('submit', (event) => {
        const inputs = signupForm.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.value === '') {
                event.preventDefault();
                alert('Please fill out all fields!');
            }
        });
    });
}
