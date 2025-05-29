import { Component } from '@angular/core';
import { BooksService, Book } from '../../services/books.service';

@Component({
  selector: 'app-book-form',
  standalone: false,
  templateUrl: './book-form.component.html',
  styleUrl: './book-form.component.css'
})
export class BookFormComponent {
  book: Book = { title: '', author: '', year: null };
  books: Book[] = [];

  constructor(private booksService: BooksService) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.booksService.getBooks().subscribe(data => {
      this.books = data;
    });
  }

  onSubmit(): void {
    this.booksService.createBook(this.book).subscribe(response => {
      // alert('Libro guardado: ' + JSON.stringify(response));
      alert('Libro guardado: ');
      this.book = { title: '', author: '', year: null };
      this.loadBooks();
    });
  }
}
