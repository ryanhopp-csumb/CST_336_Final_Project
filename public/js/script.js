// Make the modals for books actually show up and close properly

let bookRows = document.querySelectorAll("#bookRow");
bookRows.forEach(bookRow => {
    bookRow.addEventListener("click", openBookModal);
});

let bookModal = document.querySelector("#bookModal");
let closeBtn = document.querySelector("#closeModal");
closeBtn.addEventListener("click", closeBookModal);

function openBookModal () {
    bookModal.showModal();
}

function closeBookModal () {
    bookModal.close();
}