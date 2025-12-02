import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';

const prisma = new PrismaClient();

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

    // 既存データを削除して重複を防ぐ
    await prisma.book.deleteMany();
    await prisma.author.deleteMany();
    await prisma.publisher.deleteMany();

    // 1. Author データ投入
    const authorRawData = await loadCSV('author.csv');
    for (const row of authorRawData) {
        await prisma.author.create({
            data: {
                id: row.id,   // 文字列のまま
                name: row.name,
            },
        });
    }
    console.log(`✅ Seeded ${authorRawData.length} authors.`);

    // 2. Publisher データ投入
    const publisherRawData = await loadCSV('publisher.csv');
    for (const row of publisherRawData) {
        await prisma.publisher.create({
            data: {
                id: row.id,  // 文字列のまま
                name: row.name,
            },
        });
    }
    console.log(`✅ Seeded ${publisherRawData.length} publishers.`);

    // 3. Book データ投入
    const bookRawData = await loadCSV('book.csv');
    for (const row of bookRawData) {
        await prisma.book.create({
            data: {
                isbn: BigInt(row.isbn),
                title: row.title,
                authorId: row.author_id,       // 文字列のまま
                publisherId: row.publisher_id, // 文字列のまま
                publicationYear: parseInt(row.publication_year, 10),
                publicationMonth: parseInt(row.publication_month, 10),
            },
        });
    }
    console.log(`✅ Seeded ${bookRawData.length} books.`);

    console.log('✨ Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
