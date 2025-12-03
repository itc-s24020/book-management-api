import { prisma } from '../prismaClient';

export class AdminService {
    // ===== 著者管理 =====

    async createAuthor(name: string) {
        if (!name || name.trim().length === 0) {
            throw new Error('著者名は必須です');
        }

        console.log('📝 Creating author:', name);

        const author = await prisma.author.create({
            data: { name: name.trim() }
        });

        console.log('✅ Author created:', author.id);

        return { id: author.id, name: author.name };
    }

    async updateAuthor(id: string, name: string) {
        if (!name || name.trim().length === 0) {
            throw new Error('著者名は必須です');
        }

        console.log('✏️ Updating author:', { id, name });

        const author = await prisma.author.update({
            where: { id },
            data: { name: name.trim() }
        });

        console.log('✅ Author updated:', author.id);

        return { id: author.id, name: author.name };
    }

    async deleteAuthor(id: string) {
        console.log('🗑️ Deleting author:', id);

        await prisma.author.update({
            where: { id },
            data: { isDeleted: true }
        });

        console.log('✅ Author deleted (soft delete):', id);

        return { message: '削除しました' };
    }

    // ===== 出版社管理 =====

    async createPublisher(name: string) {
        if (!name || name.trim().length === 0) {
            throw new Error('出版社名は必須です');
        }

        console.log('📝 Creating publisher:', name);

        const publisher = await prisma.publisher.create({
            data: { name: name.trim() }
        });

        console.log('✅ Publisher created:', publisher.id);

        return { id: publisher.id, name: publisher.name };
    }

    async updatePublisher(id: string, name: string) {
        if (!name || name.trim().length === 0) {
            throw new Error('出版社名は必須です');
        }

        console.log('✏️ Updating publisher:', { id, name });

        const publisher = await prisma.publisher.update({
            where: { id },
            data: { name: name.trim() }
        });

        console.log('✅ Publisher updated:', publisher.id);

        return { id: publisher.id, name: publisher.name };
    }

    async deletePublisher(id: string) {
        console.log('🗑️ Deleting publisher:', id);

        await prisma.publisher.update({
            where: { id },
            data: { isDeleted: true }
        });

        console.log('✅ Publisher deleted (soft delete):', id);

        return { message: '削除しました' };
    }

    // ===== 書籍管理 =====

    async createBook(
        isbn: bigint,
        title: string,
        authorId: string,
        publisherId: string,
        publicationYear: number,
        publicationMonth: number
    ) {
        console.log('📝 Creating book:', { isbn, title });

        // 既存チェック
        const existingBook = await prisma.book.findUnique({
            where: { isbn }
        });

        if (existingBook) {
            throw new Error('既に存在するISBNです');
        }

        // 著者・出版社の存在確認
        const author = await prisma.author.findUnique({
            where: { id: authorId }
        });
        const publisher = await prisma.publisher.findUnique({
            where: { id: publisherId }
        });

        if (!author || author.isDeleted) {
            throw new Error('指定された著者が見つかりません');
        }

        if (!publisher || publisher.isDeleted) {
            throw new Error('指定された出版社が見つかりません');
        }

        await prisma.book.create({
            data: {
                isbn,
                title: title.trim(),
                authorId,
                publisherId,
                publicationYear,
                publicationMonth
            }
        });

        console.log('✅ Book created:', isbn);

        return { message: '登録しました' };
    }

    async updateBook(
        isbn: bigint,
        title: string,
        authorId: string,
        publisherId: string,
        publicationYear: number,
        publicationMonth: number
    ) {
        console.log('✏️ Updating book:', { isbn, title });

        // 存在チェック
        const existingBook = await prisma.book.findUnique({
            where: { isbn }
        });

        if (!existingBook) {
            throw new Error('存在しないISBNです');
        }

        // 著者・出版社の存在確認
        const author = await prisma.author.findUnique({
            where: { id: authorId }
        });
        const publisher = await prisma.publisher.findUnique({
            where: { id: publisherId }
        });

        if (!author || author.isDeleted) {
            throw new Error('指定された著者が見つかりません');
        }

        if (!publisher || publisher.isDeleted) {
            throw new Error('指定された出版社が見つかりません');
        }

        await prisma.book.update({
            where: { isbn },
            data: {
                title: title.trim(),
                authorId,
                publisherId,
                publicationYear,
                publicationMonth
            }
        });

        console.log('✅ Book updated:', isbn);

        return { message: '登録しました' };
    }

    async deleteBook(isbn: bigint) {
        console.log('🗑️ Deleting book:', isbn);

        await prisma.book.update({
            where: { isbn },
            data: { isDeleted: true }
        });

        console.log('✅ Book deleted (soft delete):', isbn);

        return { message: '削除しました' };
    }

    // ===== 検索機能 =====

    async searchAuthor(keyword: string) {
        console.log('🔍 Searching authors:', keyword);

        const authors = await prisma.author.findMany({
            where: {
                name: { contains: keyword },
                isDeleted: false
            }
        });

        console.log(`✅ Found ${authors.length} authors`);

        return {
            authors: authors.map(a => ({
                id: a.id,
                name: a.name
            }))
        };
    }

    async searchPublisher(keyword: string) {
        console.log('🔍 Searching publishers:', keyword);

        const publishers = await prisma.publisher.findMany({
            where: {
                name: { contains: keyword },
                isDeleted: false
            }
        });

        console.log(`✅ Found ${publishers.length} publishers`);

        return {
            publishers: publishers.map(p => ({
                id: p.id,
                name: p.name
            }))
        };
    }
}