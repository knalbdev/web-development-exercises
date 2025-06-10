const books = [];
const STORAGE_KEY = 'BOOKSHELF_APPS';
const DARK_MODE_KEY = 'DARK_MODE_ACTIVE';

function isStorageExist() {
  return typeof Storage !== 'undefined';
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return { id, title, author, year: Number(year), isComplete };
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
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    JSON.parse(data).forEach(book => books.push(book));
  }
  document.dispatchEvent(new Event('ondataloaded'));
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.innerHTML = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function showEditToast(book, onUpdate) {
  const old = document.getElementById('edit-toast-form');
  if (old) old.remove();

  const container = document.createElement('div');
  container.id = 'edit-toast-form';
  container.className = 'toast show';
  Object.assign(container.style, {
    left: '50%',
    top: '50%',
    bottom: 'unset',
    transform: 'translate(-50%, -50%)',
    width: '300px',
    maxWidth: '90%',
  });

  container.innerHTML = `
    <form id="editForm">
      <label>Judul:</label>
      <input type="text" name="title" value="${book.title}" required><br>
      <label>Penulis:</label>
      <input type="text" name="author" value="${book.author}" required><br>
      <label>Tahun:</label>
      <input type="number" name="year" value="${book.year}" required><br>
      <div style="display: flex; justify-content: space-between; margin-top: 0.5rem;">
        <button type="submit">Simpan</button>
        <button type="button" id="cancelEdit">Batal</button>
      </div>
    </form>
  `;

  document.body.appendChild(container);

  document.getElementById('editForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    onUpdate(f.title.value, f.author.value, f.year.value);
    container.remove();
    showToast('Buku berhasil diperbarui.');
  });

  document.getElementById('cancelEdit').addEventListener('click', () => container.remove());
}

function makeBookElement(book) {
  const container = document.createElement('div');
  container.dataset.bookid = book.id;
  container.dataset.testid = 'bookItem';

  const title = document.createElement('h3');
  title.dataset.testid = 'bookItemTitle';
  title.innerText = book.title;

  const author = document.createElement('p');
  author.dataset.testid = 'bookItemAuthor';
  author.innerText = `Penulis: ${book.author}`;

  const year = document.createElement('p');
  year.dataset.testid = 'bookItemYear';
  year.innerText = `Tahun: ${book.year}`;

  const action = document.createElement('div');

  const toggleBtn = document.createElement('button');
  toggleBtn.dataset.testid = 'bookItemIsCompleteButton';
  toggleBtn.innerText = book.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
  toggleBtn.onclick = () => {
    toggleBook(book.id);
    showToast('Status buku diperbarui.');
  };

  const deleteBtn = document.createElement('button');
  deleteBtn.dataset.testid = 'bookItemDeleteButton';
  deleteBtn.innerText = 'Hapus Buku';
  deleteBtn.onclick = () => {
    deleteBook(book.id);
    showToast('Buku dihapus dari rak.');
  };

  const editBtn = document.createElement('button');
  editBtn.dataset.testid = 'bookItemEditButton';
  editBtn.innerText = 'Edit Buku';
  editBtn.onclick = () => showEditToast(book, (t, a, y) => {
    book.title = t;
    book.author = a;
    book.year = Number(y);
    saveData();
    refreshBookList();
  });

  action.append(toggleBtn, deleteBtn, editBtn);
  container.append(title, author, year, action);
  return container;
}

function addBookToList(book) {
  const el = makeBookElement(book);
  (book.isComplete
    ? document.getElementById('completeBookList')
    : document.getElementById('incompleteBookList')
  ).append(el);
}

function refreshBookList() {
  document.getElementById('completeBookList').innerHTML = '';
  document.getElementById('incompleteBookList').innerHTML = '';
  books.forEach(addBookToList);
}

function toggleBook(id) {
  const b = findBook(id);
  if (!b) return;
  b.isComplete = !b.isComplete;
  saveData();
  refreshBookList();
}

function deleteBook(id) {
  const i = findBookIndex(id);
  if (i !== -1) {
    books.splice(i, 1);
    saveData();
    refreshBookList();
  }
}

function applySavedTheme() {
  if (localStorage.getItem(DARK_MODE_KEY) === 'true') {
    document.body.classList.add('dark');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  applySavedTheme();

  const toggleBtn = document.createElement('button');
  toggleBtn.innerHTML = document.body.classList.contains('dark') ? '☀️' : '🌙';
  Object.assign(toggleBtn.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: '1001',
    backgroundColor: '#5A8DF7',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
  });

  toggleBtn.onclick = () => {
    const dark = document.body.classList.toggle('dark');
    localStorage.setItem(DARK_MODE_KEY, dark);
    toggleBtn.innerHTML = dark ? '☀️' : '🌙';
    showToast(dark ? 'Dark mode aktif' : 'Light mode aktif');
  };

  document.body.appendChild(toggleBtn);

  const form = document.getElementById('bookForm');
  const searchForm = document.getElementById('searchBook');

  form.onsubmit = e => {
    e.preventDefault();
    const title = form.bookFormTitle.value;
    const author = form.bookFormAuthor.value;
    const year = form.bookFormYear.value;
    const isComplete = form.bookFormIsComplete.checked;

    const book = generateBookObject(generateId(), title, author, year, isComplete);
    books.push(book);
    saveData();
    refreshBookList();
    showToast('Buku berhasil ditambahkan.');
    form.reset();
  };

  searchForm.onsubmit = e => {
    e.preventDefault();
    const query = document.getElementById('searchBookTitle').value.toLowerCase();
    const matched = books.filter(b => b.title.toLowerCase().includes(query));

    const oldModal = document.getElementById('searchModal');
    if (oldModal) oldModal.remove();

    const modal = document.createElement('div');
    modal.id = 'searchModal';
    Object.assign(modal.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '2000',
    });

    const box = document.createElement('div');
    Object.assign(box.style, {
      backgroundColor: 'var(--card-background)',
      padding: '1.5rem',
      borderRadius: '8px',
      maxWidth: '90%',
      width: '400px',
      color: 'var(--text-color)',
      boxShadow: '0 5px 20px rgba(0, 0, 0, 0.3)',
    });

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    Object.assign(closeBtn.style, {
      position: 'absolute',
      top: '10px',
      right: '20px',
      fontSize: '1.5rem',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'white',
    });
    closeBtn.onclick = () => modal.remove();

    let content;
    if (matched.length === 0) {
      content = document.createElement('p');
      content.innerText = 'Tidak ada hasil.';
    } else {
      content = document.createElement('ul');
      content.style.listStyle = 'none';
      content.style.padding = '0';
      matched.forEach(book => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.innerText = book.title;
        link.href = '#';
        link.style.color = 'var(--text-color)';
        link.style.textDecoration = 'underline';
        link.onclick = () => {
          const el = document.querySelector(`[data-bookid=\"${book.id}\"]`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.style.outline = '2px solid var(--primary-dark)';
            setTimeout(() => (el.style.outline = ''), 2000);
          }
          modal.remove();
        };
        li.appendChild(link);
        content.appendChild(li);
      });
    }

    box.appendChild(content);
    modal.appendChild(box);
    modal.appendChild(closeBtn);
    document.body.appendChild(modal);
  };

  if (isStorageExist()) loadDataFromStorage();
});

document.addEventListener('ondataloaded', refreshBookList);
