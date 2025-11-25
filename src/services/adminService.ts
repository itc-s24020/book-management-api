import { PrismaClient } from '@prisma/client';

const prismaAdmin = new PrismaClient();

export class AdminService {
    async createAuthor(name: string) {
        if (!name || name.trim().length === 0) {
            throw new Error('著者名は必須です');
        }

        const author = await prismaAdmin.author.create({ data: { name } });
        return { id: author.id, name: author.name };
    }

    async updateAuthor(id: string, name: string) {
        if (!name || name.trim().length === 0) {
            throw new Error('著者名は必須です');
        }

        const author = await prismaAdmin.author.update({
            where: { id },
            data: { name }
        });

        return { id: author.id, name: author.name };
    }

    async deleteAuthor(id: string) {
        await prismaAdmin.author.update({
            where: { id },
            data: { isDeleted: true }
        });

        return { message: '削除しました' };
    }

    async createPublisher(name: string) {
        if (!name || name.trim().length === 0) {
            throw new Error('出版社名は必須です');
        }

        const publisher = await prismaAdmin.publisher.create({ data: { name } });
        return { id: publisher.id, name: publisher.name };
    }

    async updatePublisher(id: string, name: string) {
        if (!name || name.trim().length === 0) {
            throw new Error('出版社名は必須です');
        }

        const publisher = await prismaAdmin.publisher.update({
            where: { id },
            data: { name }
        });

        return { id: publisher.id, name: publisher.name };
    }

    async deletePublisher(id: string) {
        await prismaAdmin.publisher.update({
            where: { id },
            data: { isDeleted: true }
        });

        return { message: '削除しました' };
    }

    async createBook(isbn: bigint, title: string, authorId: string, publisherId: string, publicationYear: number, publicationMonth: number) {
        const existingBook = await prismaAdmin.book.findUnique({ where: { isbn } });
        if (existingBook) {
            throw new Error('既に存在するISBNです');
        }

        await prismaAdmin.book.create({
            data: { isbn, title, authorId, publisherId, publicationYear, publicationMonth }
        });

        return { message: '登録しました' };
    }

    async updateBook(isbn: bigint, title: string, authorId: string, publisherId: string, publicationYear: number, publicationMonth: number) {
        await prismaAdmin.book.update({
            where: { isbn },
            data: { title, authorId, publisherId, publicationYear, publicationMonth }
        });

        return { message: '登録しました' };
    }

    async deleteBook(isbn: bigint) {
        await prismaAdmin.book.update({
            where: { isbn },
            data: { isDeleted: true }
        });

        return { message: '削除しました' };
    }

    async searchAuthor(keyword: string) {
        const authors = await prismaAdmin.author.findMany({
            where: { name: { contains: keyword }, isDeleted: false }
        });

        return { authors: authors.map(a => ({ id: a.id, name: a.name })) };
    }

    async searchPublisher(keyword: string) {
        const publishers = await prismaAdmin.publisher.findMany({
            where: { name: { contains: keyword }, isDeleted: false }
        });

        return { publishers: publishers.map(p => ({ id: p.id, name: p.name })) };
    }
}