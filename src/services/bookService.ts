import { prisma } from '../prismaClient';

export class BookService {
    // ===== 書籍一覧取得 =====

    async getBookList(page: number = 1, pageSize: number = 5) {
        const skip = (page - 1) * pageSize;

        console.log(`📚 Fetching book list: page ${page}, size ${pageSize}`);

        try {
            const books = await prisma.book.findMany({
                where: { isDeleted: false },
                include: {
                    author: {
                        select: {
                            name: true
                        }
                    }
                },
                orderBy: [
                    { publicationYear: 'desc' },
                    { publicationMonth: 'desc' }
                ],
                skip,
                take: pageSize
            });

            const total = await prisma.book.count({
                where: { isDeleted: false }
            });

            const lastPage = Math.ceil(total / pageSize);

            console.log(`✅ Found ${books.length} books, total: ${total}, lastPage: ${lastPage}`);

            return {
                current: page,
                last_page: lastPage,
                books: books.map(book => ({
                    isbn: Number(book.isbn),
                    title: book.title,
                    author: {
                        name: book.author.name
                    },
                    publication_year_month: `${book.publicationYear}-${String(book.publicationMonth).padStart(2, '0')}`
                }))
            };
        } catch (error) {
            console.error('❌ Error in getBookList:', error);
            throw new Error('書籍一覧の取得に失敗しました');
        }
    }

    // ===== 書籍詳細取得 =====

    async getBookDetail(isbn: bigint) {
        console.log(`📖 Fetching book detail: ${isbn}`);

        try {
            const book = await prisma.book.findUnique({
                where: { isbn },
                include: {
                    author: {
                        select: {
                            name: true
                        }
                    },
                    publisher: {
                        select: {
                            name: true
                        }
                    }
                }
            });

            if (!book || book.isDeleted) {
                console.log('❌ Book not found:', isbn);
                throw new Error('書籍が見つかりません');
            }

            console.log('✅ Book found:', book.title);

            return {
                isbn: Number(book.isbn),
                title: book.title,
                author: {
                    name: book.author.name
                },
                publisher: {
                    name: book.publisher.name
                },
                publication_year_month: `${book.publicationYear}-${String(book.publicationMonth).padStart(2, '0')}`
            };
        } catch (error) {
            console.error('❌ Error in getBookDetail:', error);
            throw error;
        }
    }

    // ===== 書籍貸出 =====

    async rentalBook(userId: string, bookIsbn: bigint) {
        console.log(`📤 Renting book: ${bookIsbn} to user: ${userId}`);

        try {
            // 書籍の存在確認
            const book = await prisma.book.findUnique({
                where: { isbn: bookIsbn }
            });

            if (!book || book.isDeleted) {
                console.log('❌ Book not found:', bookIsbn);
                throw new Error('書籍が存在しません');
            }

            // 貸出中かチェック
            const activeRental = await prisma.rentalLog.findFirst({
                where: {
                    bookIsbn: bookIsbn,
                    returnedDate: null
                }
            });

            if (activeRental) {
                console.log('❌ Book already rented:', bookIsbn);
                throw new Error('既に貸出中です');
            }

            // 貸出処理
            const checkoutDate = new Date();
            const dueDate = new Date(checkoutDate);
            dueDate.setDate(dueDate.getDate() + 7); // 7日後

            const rental = await prisma.rentalLog.create({
                data: {
                    bookIsbn,
                    userId,
                    checkoutDate,
                    dueDate
                }
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

    // ===== 書籍返却 =====

    async returnBook(rentalId: string, userId: string) {
        console.log(`📥 Returning book: rental ${rentalId} by user ${userId}`);

        try {
            // 貸出記録の確認
            const rental = await prisma.rentalLog.findUnique({
                where: { id: rentalId }
            });

            if (!rental) {
                console.log('❌ Rental log not found:', rentalId);
                throw new Error('存在しない貸出記録です');
            }

            // 既に返却済みかチェック
            if (rental.returnedDate) {
                console.log('❌ Book already returned:', rentalId);
                throw new Error('既に返却済みです');
            }

            // ユーザーの所有確認
            if (rental.userId !== userId) {
                console.log('❌ Rental belongs to different user:', { rentalId, userId });
                throw new Error('他のユーザの貸出書籍です');
            }

            // 返却処理
            const updated = await prisma.rentalLog.update({
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
}