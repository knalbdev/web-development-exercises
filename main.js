const books = [];
const STORAGE_KEY = 'BOOKSHELF_APPS';
const DARK_MODE_KEY = 'DARK_MODE_ACTIVE';

function isStorageExist() {
  if (typeof Storage === 'undefined') {
    alert('Browser kamu tidak mendukung localStorage');
    return false;
  }
  return true;
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year: Number(year),
    isComplete,
  };
}

function findBook(bookId) {
  return books.find(book => book.id === bookId);
}

function findBookIndex(bookId) {
  return books.findIndex(book => book.id === bookId);
}

function saveData() {
  if (isStorageExist()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  if (serializedData) {
    const data = JSON.parse(serializedData);
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event('ondataloaded'));
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function makeBookElement(book) {
  const bookContainer = document.createElement('div');
  bookContainer.setAttribute('data-bookid', book.id);
  bookContainer.setAttribute('data-testid', 'bookItem');

  const title = document.createElement('h3');
  title.innerText = book.title;
  title.setAttribute('data-testid', 'bookItemTitle');

  const author = document.createElement('p');
  author.innerText = `Penulis: ${book.author}`;
  author.setAttribute('data-testid', 'bookItemAuthor');

  const year = document.createElement('p');
  year.innerText = `Tahun: ${book.year}`;
  year.setAttribute('data-testid', 'bookItemYear');

  const actions = document.createElement('div');

  const toggleButton = document.createElement('button');
  toggleButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
  toggleButton.innerText = book.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
  toggleButton.addEventListener('click', () => {
    toggleBook(book.id);
    showToast('Status buku diperbarui.');
  });

  const deleteButton = document.createElement('button');
  deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
  deleteButton.innerText = 'Hapus Buku';
  deleteButton.addEventListener('click', () => {
    deleteBook(book.id);
    showToast('Buku dihapus dari rak.');
  });

  const editButton = document.createElement('button');
  editButton.setAttribute('data-testid', 'bookItemEditButton');
  editButton.innerText = 'Edit Buku';
  editButton.addEventListener('click', () => {
    const newTitle = prompt('Edit Judul Buku', book.title);
    const newAuthor = prompt('Edit Penulis Buku', book.author);
    const newYear = prompt('Edit Tahun Terbit Buku', book.year);
    if (newTitle && newAuthor && newYear) {
      book.title = newTitle;
      book.author = newAuthor;
      book.year = Number(newYear);
      saveData();
      refreshBookList();
      showToast('Buku berhasil diperbarui.');
    }
  });

  actions.append(toggleButton, deleteButton, editButton);
  bookContainer.append(title, author, year, actions);

  return bookContainer;
}

function addBookToList(book) {
  const bookElement = makeBookElement(book);
  if (book.isComplete) {
    document.getElementById('completeBookList').append(bookElement);
  } else {
    document.getElementById('incompleteBookList').append(bookElement);
  }
}

function refreshBookList() {
  document.getElementById('completeBookList').innerHTML = '';
  document.getElementById('incompleteBookList').innerHTML = '';

  for (const book of books) {
    addBookToList(book);
  }
}

function toggleBook(bookId) {
  const book = findBook(bookId);
  if (!book) return;
  book.isComplete = !book.isComplete;
  saveData();
  refreshBookList();
}

function deleteBook(bookId) {
  const index = findBookIndex(bookId);
  if (index !== -1) {
    books.splice(index, 1);
    saveData();
    refreshBookList();
  }
}

function applySavedTheme() {
  const saved = localStorage.getItem(DARK_MODE_KEY);
  if (saved === 'true') {
    document.body.classList.add('dark');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  applySavedTheme();

  const toggleButton = document.createElement('button');
  toggleButton.innerHTML = document.body.classList.contains('dark') ? '☀️' : '🌙';
  toggleButton.style.position = 'fixed';
  toggleButton.style.top = '20px';
  toggleButton.style.right = '20px';
  toggleButton.style.zIndex = '1001';
  toggleButton.style.backgroundColor = '#5A8DF7';
  toggleButton.style.color = '#fff';
  toggleButton.style.border = 'none';
  toggleButton.style.padding = '0.5rem 1rem';
  toggleButton.style.borderRadius = '4px';
  toggleButton.style.cursor = 'pointer';

  document.body.appendChild(toggleButton);

  toggleButton.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem(DARK_MODE_KEY, isDark);
    toggleButton.innerHTML = isDark ? '☀️' : '🌙';
    showToast(isDark ? 'Dark mode aktif' : 'Light mode aktif');
  });

  const submitForm = document.getElementById('bookForm');
  const searchForm = document.getElementById('searchBook');

  submitForm.addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('bookFormTitle').value;
    const author = document.getElementById('bookFormAuthor').value;
    const year = document.getElementById('bookFormYear').value;
    const isComplete = document.getElementById('bookFormIsComplete').checked;

    const id = generateId();
    const newBook = generateBookObject(id, title, author, year, isComplete);
    books.push(newBook);
    saveData();
    refreshBookList();
    showToast('Buku berhasil ditambahkan.');
    submitForm.reset();
  });

  searchForm.addEventListener('submit', e => {
    e.preventDefault();
    const query = document.getElementById('searchBookTitle').value.toLowerCase();
    const bookItems = document.querySelectorAll('[data-testid=\"bookItem\"]');

    bookItems.forEach(item => {
      const title = item.querySelector('[data-testid=\"bookItemTitle\"]').innerText.toLowerCase();
      item.style.display = title.includes(query) ? '' : 'none';
    });
  });

  if (isStorageExist()) loadDataFromStorage();
});

document.addEventListener('ondataloaded', () => {
  refreshBookList();
});
