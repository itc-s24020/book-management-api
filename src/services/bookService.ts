import { PrismaClient } from '@prisma/client';

const prismaBk = new PrismaClient();

export class BookService {
    async getBookList(page: number = 1, pageSize: number = 5) {
        const skip = (page - 1) * pageSize;

        try {
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

            console.log(`📚 Found ${books.length} books, total: ${total}, lastPage: ${lastPage}`);

            return {
                current: page,
                last_page: lastPage,
                total: total,
                books: books.map(book => ({
                    isbn: String(book.isbn), // ✅ BigIntを文字列に変換
                    title: book.title,
                    author: { name: book.author.name },
                    publisher: { name: book.publisher.name },
                    publication_year_month: `${book.publicationYear}-${String(book.publicationMonth).padStart(2, '0')}`
                }))
            };
        } catch (error) {
            console.error('❌ Error in getBookList:', error);
            throw new Error('書籍一覧の取得に失敗しました');
        }
    }

    async getBookDetail(isbn: bigint) {
        try {
            const book = await prismaBk.book.findUnique({
                where: { isbn },
                include: { author: true, publisher: true }
            });

            if (!book || book.isDeleted) {
                throw new Error('書籍が見つかりません');
            }

            return {
                isbn: String(book.isbn), // ✅ BigIntを文字列に変換
                title: book.title,
                author: { name: book.author.name },
                publisher: { name: book.publisher.name },
                publication_year_month: `${book.publicationYear}-${String(book.publicationMonth).padStart(2, '0')}`
            };
        } catch (error) {
            console.error('❌ Error in getBookDetail:', error);
            throw error;
        }
    }

    async rentalBook(userId: string, bookIsbn: bigint) {
        try {
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

            console.log('✅ Book rented successfully:', rental.id);

            return {
                id: rental.id,
                checkout_date: rental.checkoutDate,
                due_date: rental.dueDate
            };
        } catch (error) {
            console.error('❌ Error in rentalBook:', error);
            throw error;
        }
    }

    async returnBook(rentalId: string, userId: string) {
        try {
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

            console.log('✅ Book returned successfully:', rentalId);

            return {
                id: updated.id,
                returned_date: updated.returnedDate
            };
        } catch (error) {
            console.error('❌ Error in returnBook:', error);
            throw error;
        }
    }

    async getUserHistory(userId: string) {
        try {
            const history = await prismaBk.rentalLog.findMany({
                where: { userId },
                include: { book: true },
                orderBy: { checkoutDate: 'desc' }
            });

            return {
                history: history.map(log => ({
                    id: log.id,
                    book: {
                        isbn: String(log.book.isbn), // ✅ BigIntを文字列に変換
                        title: log.book.title
                    },
                    checkout_date: log.checkoutDate,
                    due_date: log.dueDate,
                    returned_date: log.returnedDate
                }))
            };
        } catch (error) {
            console.error('❌ Error in getUserHistory:', error);
            throw error;
        }
    }
}