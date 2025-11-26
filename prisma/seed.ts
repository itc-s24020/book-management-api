import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    try {
        // 既存データをクリア（オプション）
        // await prisma.rentalLog.deleteMany({});
        // await prisma.book.deleteMany({});
        // await prisma.author.deleteMany({});
        // await prisma.publisher.deleteMany({});
        // await prisma.user.deleteMany({});

        // 著者を作成
        console.log('📝 Creating authors...');
        const author1 = await prisma.author.upsert({
            where: { id: 'auth-001' },
            update: {},
            create: {
                id: 'auth-001',
                name: '掌田 津耶乃'
            }
        });

        const author2 = await prisma.author.upsert({
            where: { id: 'auth-002' },
            update: {},
            create: {
                id: 'auth-002',
                name: '山田 太郎'
            }
        });

        const author3 = await prisma.author.upsert({
            where: { id: 'auth-003' },
            update: {},
            create: {
                id: 'auth-003',
                name: '佐藤 次郎'
            }
        });

        const author4 = await prisma.author.upsert({
            where: { id: 'auth-004' },
            update: {},
            create: {
                id: 'auth-004',
                name: '田中 花子'
            }
        });

        const author5 = await prisma.author.upsert({
            where: { id: 'auth-005' },
            update: {},
            create: {
                id: 'auth-005',
                name: '遠藤 三郎'
            }
        });

        // 出版社を作成
        console.log('🏢 Creating publishers...');
        const publisher1 = await prisma.publisher.upsert({
            where: { id: 'pub-001' },
            update: {},
            create: {
                id: 'pub-001',
                name: '株式会社 秀和システム'
            }
        });

        const publisher2 = await prisma.publisher.upsert({
            where: { id: 'pub-002' },
            update: {},
            create: {
                id: 'pub-002',
                name: '株式会社 技術評論社'
            }
        });

        const publisher3 = await prisma.publisher.upsert({
            where: { id: 'pub-003' },
            update: {},
            create: {
                id: 'pub-003',
                name: '株式会社 インプレス'
            }
        });

        const publisher4 = await prisma.publisher.upsert({
            where: { id: 'pub-004' },
            update: {},
            create: {
                id: 'pub-004',
                name: 'SBクリエイティブ株式会社'
            }
        });

        const publisher5 = await prisma.publisher.upsert({
            where: { id: 'pub-005' },
            update: {},
            create: {
                id: 'pub-005',
                name: '株式会社 日経BP'
            }
        });

        // 書籍を作成
        console.log('📚 Creating books...');
        const book1 = await prisma.book.upsert({
            where: { isbn: 9784798070285n },
            update: {},
            create: {
                isbn: 9784798070285n,
                title: 'Node.js 超入門[第4版]',
                authorId: author1.id,
                publisherId: publisher1.id,
                publicationYear: 2023,
                publicationMonth: 7
            }
        });

        const book2 = await prisma.book.upsert({
            where: { isbn: 9784798154562n },
            update: {},
            create: {
                isbn: 9784798154562n,
                title: '徹底攻略C#の基本と応用',
                authorId: author2.id,
                publisherId: publisher4.id,
                publicationYear: 2024,
                publicationMonth: 1
            }
        });

        const book3 = await prisma.book.upsert({
            where: { isbn: 9784297138383n },
            update: {},
            create: {
                isbn: 9784297138383n,
                title: 'PythonによるWebスクレイピング入門',
                authorId: author3.id,
                publisherId: publisher2.id,
                publicationYear: 2023,
                publicationMonth: 11
            }
        });

        const book4 = await prisma.book.upsert({
            where: { isbn: 9784296116845n },
            update: {},
            create: {
                isbn: 9784296116845n,
                title: '図解ポケット IoTビジネスがわかる本',
                authorId: author4.id,
                publisherId: publisher2.id,
                publicationYear: 2022,
                publicationMonth: 5
            }
        });

        const book5 = await prisma.book.upsert({
            where: { isbn: 9784297141529n },
            update: {},
            create: {
                isbn: 9784297141529n,
                title: 'いちばんやさしいTypeScriptの教本',
                authorId: author5.id,
                publisherId: publisher3.id,
                publicationYear: 2024,
                publicationMonth: 2
            }
        });

        console.log('✅ Seed data created successfully!');
        console.log(`
    ✓ Authors: ${[author1, author2, author3, author4, author5].length}
    ✓ Publishers: ${[publisher1, publisher2, publisher3, publisher4, publisher5].length}
    ✓ Books: ${[book1, book2, book3, book4, book5].length}
    `);

    } catch (error) {
        console.error('❌ Error during seeding:', error);
        throw error;
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
        console.log('🔌 Disconnected from database');
    });