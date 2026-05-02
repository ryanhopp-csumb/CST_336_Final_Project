// Make the modals for books actually show up and close properly


let bookModal = document.querySelector(".bookModal");

// let bookRows = document.querySelectorAll(".bookRow");
// for (const bookRow of bookRows) {
//     bookRow.addEventListener("click", bookModal.showModal);
// }

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

let addBtn = document.querySelector(".addToCart");