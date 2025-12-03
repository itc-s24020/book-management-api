// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';
import * as argon2 from 'argon2'; // ✅ bcryptjs から argon2 に変更

const prisma = new PrismaClient();

// CSVファイル読み込み
const loadCSV = (fileName: string): Promise<Record<string, string>[]> => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, fileName);
        const data: Record<string, string>[] = [];

        fs.createReadStream(filePath)
            .pipe(parse({ columns: true, skip_empty_lines: true }))
            .on('data', (row) => data.push(row))
            .on('end', () => resolve(data))
            .on('error', (err) => reject(err));
    });
};

async function main() {
    console.log('✨ Start seeding (MySQL) ...');

    // 既存データ削除（順番に依存関係に注意）
    await prisma.rentalLog.deleteMany();
    await prisma.book.deleteMany();
    await prisma.user.deleteMany();
    await prisma.author.deleteMany();
    await prisma.publisher.deleteMany();

    // 1. Author
    const authors = await loadCSV('author.csv');
    for (const a of authors) {
        await prisma.author.create({ data: { id: a.id, name: a.name } });
    }
    console.log(`✅ Seeded ${authors.length} authors.`);

    // 2. Publisher
    const publishers = await loadCSV('publisher.csv');
    for (const p of publishers) {
        await prisma.publisher.create({ data: { id: p.id, name: p.name } });
    }
    console.log(`✅ Seeded ${publishers.length} publishers.`);

    // 3. Book
    const books = await loadCSV('book.csv');
    for (const b of books) {
        await prisma.book.create({
            data: {
                isbn: BigInt(b.isbn),
                title: b.title,
                authorId: b.author_id,
                publisherId: b.publisher_id,
                publicationYear: parseInt(b.publication_year, 10),
                publicationMonth: parseInt(b.publication_month, 10),
            },
        });
    }
    console.log(`✅ Seeded ${books.length} books.`);

    // 4. User (✅ argon2でハッシュ化)
    const users = [
        { email: 'admin@example.com', name: 'Admin User', password: 'admin123', isAdmin: true },
        { email: 'user1@example.com', name: 'User One', password: 'user123', isAdmin: false },
        { email: 'user2@example.com', name: 'User Two', password: 'user123', isAdmin: false },
    ];

    for (const u of users) {
        const hashedPassword = await argon2.hash(u.password);
        await prisma.user.create({
            data: {
                email: u.email,
                name: u.name,
                password: hashedPassword,
                isAdmin: u.isAdmin,
            },
        });
        console.log(`✅ Created user: ${u.email} (password: ${u.password})`);
    }
    console.log(`✅ Seeded ${users.length} users.`);

    // 5. RentalLog（サンプル）
    const firstUser = await prisma.user.findFirst({ where: { email: 'user1@example.com' } });
    const firstBooks = await prisma.book.findMany({ take: 2 });

    if (firstUser && firstBooks.length > 0) {
        for (const book of firstBooks) {
            await prisma.rentalLog.create({
                data: {
                    bookIsbn: book.isbn,
                    userId: firstUser.id,
                    checkoutDate: new Date(new Date().setDate(new Date().getDate() - 7)),
                    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
                    returnedDate: null,
                },
            });
        }
    }
    console.log(`✅ Seeded ${firstBooks.length} rental logs.`);

    console.log('✨ Seeding finished.');
    console.log('\n📝 Login credentials:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   User1: user1@example.com / user123');
    console.log('   User2: user2@example.com / user123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });