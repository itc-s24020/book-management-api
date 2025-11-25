import { PrismaClient } from '@prisma/client';

const prismaBk = new PrismaClient();

export class BookService {
    async getBookList(page: number = 1, pageSize: number = 5) {
        const skip = (page - 1) * pageSize;

        const books = await prismaBk.book.findMany({
            where: { isDeleted: false },
            include: { author: true, publisher: true },
            orderBy: [
                { publicationYear: 'desc' },
                { publicationMonth: 'desc' }
            ],
            skip,
            take: pageSize
        });

        const total = await prismaBk.book.count({ where: { isDeleted: false } });
        const lastPage = Math.ceil(total / pageSize);

        return {
            current: page,
            last_page: lastPage,
            books: books.map(book => ({
                isbn: book.isbn,
                title: book.title,
                author: { name: book.author.name },
                publication_year_month: `${book.publicationYear}-${String(book.publicationMonth).padStart(2, '0')}`
            }))
        };
    }

    async getBookDetail(isbn: bigint) {
        const book = await prismaBk.book.findUnique({
            where: { isbn },
            include: { author: true, publisher: true }
        });

        if (!book || book.isDeleted) {
            throw new Error('書籍が見つかりません');
        }

        return {
            isbn: book.isbn,
            title: book.title,
            author: { name: book.author.name },
            publisher: { name: book.publisher.name },
            publication_year_month: `${book.publicationYear}-${String(book.publicationMonth).padStart(2, '0')}`
        };
    }

    async rentalBook(userId: string, bookIsbn: bigint) {
        const book = await prismaBk.book.findUnique({ where: { isbn: bookIsbn } });
        if (!book || book.isDeleted) {
            throw new Error('書籍が存在しません');
        }

        const activeRental = await prismaBk.rentalLog.findFirst({
            where: { bookIsbn: bookIsbn, returnedDate: null }
        });

        if (activeRental) {
            throw new Error('既に貸出中です');
        }

        const checkoutDate = new Date();
        const dueDate = new Date(checkoutDate);
        dueDate.setDate(dueDate.getDate() + 7);

        const rental = await prismaBk.rentalLog.create({
            data: { bookIsbn, userId, checkoutDate, dueDate }
        });

        return {
            id: rental.id,
            checkout_date: rental.checkoutDate,
            due_date: rental.dueDate
        };
    }

    async returnBook(rentalId: string, userId: string) {
        const rental = await prismaBk.rentalLog.findUnique({
            where: { id: rentalId }
        });

        if (!rental) {
            throw new Error('存在しない貸出記録です');
        }

        if (rental.userId !== userId) {
            throw new Error('他のユーザの貸出書籍です');
        }

        const updated = await prismaBk.rentalLog.update({
            where: { id: rentalId },
            data: { returnedDate: new Date() }
        });

        return {
            id: updated.id,
            returned_date: updated.returnedDate
        };
    }

    async getUserHistory(userId: string) {
        const history = await prismaBk.rentalLog.findMany({
            where: { userId },
            include: { book: true },
            orderBy: { checkoutDate: 'desc' }
        });

        return {
            history: history.map(log => ({
                id: log.id,
                book: {
                    isbn: log.book.isbn,
                    name: log.book.title
                },
                checkout_date: log.checkoutDate,
                due_date: log.dueDate,
                returned_date: log.returnedDate
            }))
        };
    }
}