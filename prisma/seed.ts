// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';

const prisma = new PrismaClient();

// CSVファイルからデータを読み込む汎用関数
// CSVの生データ (全て string) を配列として返す
const loadCSV = (fileName: string): Promise<Record<string, string>[]> => {
    return new Promise((resolve, reject) => {
        // CSVファイルは prisma ディレクトリにあることを前提
        const filePath = path.join(__dirname, fileName);
        const data: Record<string, string>[] = [];

        fs.createReadStream(filePath)
            .pipe(parse({
                columns: true, // ヘッダーをキーとして使用
                skip_empty_lines: true,
            }))
            .on('data', (row) => {
                data.push(row);
            })
            .on('end', () => {
                resolve(data);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};

async function main() {
    console.log('✨ Start seeding (MySQL) ...');

    // 1. Author データの投入
    const authorRawData = await loadCSV('author.csv');

    for (const row of authorRawData) {
        // スキーマの id, name に合わせてデータを投入
        await prisma.author.create({
            data: {
                id: row.id,
                name: row.name,
                // isDeleted, createdAt は @default で自動設定される
            },
        });
    }
    console.log(`✅ Seeded ${authorRawData.length} authors.`);

    // 2. Publisher データの投入
    const publisherRawData = await loadCSV('publisher.csv');

    for (const row of publisherRawData) {
        // スキーマの id, name に合わせてデータを投入
        await prisma.publisher.create({
            data: {
                id: row.id,
                name: row.name,
            },
        });
    }
    console.log(`✅ Seeded ${publisherRawData.length} publishers.`);

    // 3. Book データの投入
    const bookRawData = await loadCSV('book.csv');

    for (const row of bookRawData) {
        // CSVの snake_case をスキーマの camelCase と BigInt/Int 型に変換して投入
        await prisma.book.create({
            data: {
                // BigInt への変換が必要
                isbn: BigInt(row.isbn),
                title: row.title,
                // フィールド名のマッピング (snake_case -> camelCase)
                authorId: row.author_id,
                publisherId: row.publisher_id,
                // Int への変換が必要
                publicationYear: parseInt(row.publication_year, 10),
                publicationMonth: parseInt(row.publication_month, 10),
            },
        });
    }
    console.log(`✅ Seeded ${bookRawData.length} books.`);

    // User や RentalLog のCSVデータがないためスキップ
    // 必要に応じて、ここでダミーの User データなどを投入できます

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