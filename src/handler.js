/* eslint-disable no-undef */
/* eslint-disable no-shadow */
const { response } = require('@hapi/hapi/lib/validation');
const { nanoid } = require('nanoid');
const books = require('./books');

// add new book
const addBook = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  // const id = customAlphabet('1234567890abcdef', 10);
  const id = nanoid(10);
  const finished = pageCount === readPage;
  const insertedAt = new Date().toDateString();
  const updatedAt = insertedAt;
  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };
  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  books.push(newBook);
  const isSuccess = books.filter((book) => book.id === id).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }
  const response = h.response({
    status: 'fail',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

// Menampilkan semua buku
const getAllBooks = (request, h) => {
  const { name, reading, finished } = request.query;

  let databooks = books;
  if (reading === '1') {
    const read = databooks.filter((book) => book.reading === (reading === '1')).map((book) => ({
      id: book.id,
      name: book.name,
      publisher: book.publisher,
    }));

    databooks = read;
    return h.response({
      status: 'success',
      data: {
        books: databooks,
      },
    });
  }

  if (reading === '0') {
    const unread = databooks.filter((book) => book.reading === (reading !== '1')).map((book) => ({
      id: book.id,
      name: book.name,
      publisher: book.publisher,
    }));
    databooks = unread;
    return h.response({
      status: 'success',
      data: {
        books: databooks,
      },
    });
  }

  if (finished === '0') {
    const unfinish = databooks.filter((book) => book.finished === false).map((book) => ({
      id: book.id,
      name: book.name,
      publisher: book.publisher,
    }));
    databooks = unfinish;
    return h.response({
      status: 'success',
      data: {
        books: databooks,
      },
    });
  }

  if (finished === '1') {
    const finish = books.filter((book) => book.finished === (finished === '1')).map((book) => ({
      id: book.id,
      name: book.name,
      publisher: book.publisher,
    }));
    databooks = finish;
    return h.response({
      status: 'success',
      data: {
        books: databooks,
      },
    });
  }

  if (name) {
    // eslint-disable-next-line max-len
    const filterByName = books.filter((book) => book.name.toLowerCase().includes(name.toLowerCase())).map((book) => ({
      id: book.id,
      name: book.name,
      publisher: book.publisher,
    }));
    databooks = filterByName;
    return h.response({
      status: 'success',
      data: {
        books: databooks,
      },
    });
  }

  if (name === undefined) {
    const randomBook = books.map((book) => ({
      id: book.id,
      name: book.name,
      publisher: book.publisher,
    }));
    databooks = randomBook;
    return h.response({
      status: 'success',
      data: {
        books: databooks,
      },
    });
  } response.code(200);
  return response;
};

// menampilkan buku sesuai ID
const getBookById = (request, h) => {
  const { bookId } = request.params;
  const book = books.filter((n) => n.id === bookId)[0];
  if (book !== undefined) {
    const response = h.response({
      status: 'success',
      data: {
        book,
      },
    });
    response.code(200);
    return response;
  }
  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

// Update buku
const updateBook = (request, h) => {
  const { bookId } = request.params;
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const updatedAt = new Date().toISOString();
  const index = books.findIndex((book) => book.id === bookId);

  // check id
  let checkId = true;
  for (const value of books) {
    if (value.id === bookId) {
      checkId = false;
    }
  }

  if (checkId) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Id tidak ditemukan',
    });

    response.code(404);
    return response;
  }

  // check name
  let checkName = false;
  if ((name === undefined) || (name === '') || !name) {
    checkName = true;
  }

  if (checkName) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });

    response.code(400);
    return response;
  }
  // check readPage
  let checkReadPage = false;
  if (readPage > pageCount) {
    checkReadPage = true;
  }

  if (checkReadPage) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });

    response.code(400);
    return response;
  }

  const response = h.response({
    status: 'success',
    message: 'Buku berhasil diperbarui',
  });
  books[index] = {
    ...books[index],
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  };

  response.code(200);
  return response;
};
// menghapus buku
const deleteBook = (request, h) => {
  const { bookId } = request.params;
  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }
  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });

  response.code(404);
  return response;
};

module.exports = {
  addBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
};
