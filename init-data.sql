-- init-data.sql
-- 初期データ投入用のSQLファイル

-- ----------------------------------------------------
-- 1. Publisher (出版社) データの挿入
-- ----------------------------------------------------
-- データの重複挿入を防ぐための一時的な削除（開発/テスト時のみ推奨）
DELETE FROM publisher WHERE name IN ('株式会社 秀和システム', '株式会社 カットシステム', '株式会社 技術評論社', '株式会社 インプレス', 'SBクリエイティブ株式会社', '株式会社 オーム社', '株式会社 日経BP');

INSERT INTO publisher (id, name, is_deleted, created_at) VALUES
                                                             ('019a95f5-d68e-7f45-ba5b-e6d80bd4157e', '株式会社 秀和システム', FALSE, NOW()),
                                                             ('019a95f5-d68e-7131-878f-1818beach1d3', '株式会社 カットシステム', FALSE, NOW()),
                                                             ('019a95f5-d68e-73aa-aa7f-463d72faba8f', '株式会社 技術評論社', FALSE, NOW()),
                                                             ('019a95f5-d68e-7d2f-a3f3-920f2b20d938', '株式会社 インプレス', FALSE, NOW()),
                                                             ('019a95f5-d68e-761f-8dad-b4c7f36f7a18', 'SBクリエイティブ株式会社', FALSE, NOW()),
                                                             ('019a95f5-d68e-725b-8a39-11d3feeae7ad', '株式会社 オーム社', FALSE, NOW()),
                                                             ('019a95f5-d68e-7a6f-95a1-956f9c2a9563', '株式会社 日経BP', FALSE, NOW());


-- ----------------------------------------------------
-- 2. Author (著者) データの挿入
-- ----------------------------------------------------
-- 著者のUUIDを定義 (bookテーブルで使用するため)
SET @author_osada_id = 'c13c7515-d9c9-4f7f-8c3e-3b2d1d0c4b2a';
SET @author_yamada_id = 'd24d8626-e0d0-4a8a-9c4f-4c3e2e1d0c5b';
SET @author_sato_id = 'e35e9737-f1e1-5b9b-a1d0-5d4f3f2e1d6c';
SET @author_tanaka_id = 'f46fa848-02f2-6caca2e1-6e5g4g3e2f7d';
SET @author_endo_id = 'g57gb959-13g3-7dbd-b3f2-7f6h5h4g3g8e';
SET @author_kato_id = 'h68hc060-24h4-8ece-c4g3-8g7i6i5h4h9f';
SET @author_suzuki_id = 'i79id171-35i5-9fdf-d5h4-9h8j7j6i5i0g';
SET @author_watanabe_id = 'j80je282-46j6-a0ef-e6i5-0i9k8k7j6j1h';
SET @author_abe_id = 'k91kf393-57k7-b1fg-f7j6-1j0l9l8k7k2i';
SET @author_nakamura_id = 'l02lg404-68l8-c2gh-g8k7-2k1m0m9l8l3j';

DELETE FROM author WHERE name IN ('掌田 津耶乃', '山田 太郎', '佐藤 次郎', '田中 花子', '遠藤 三郎', '加藤 恵子', '鈴木 裕', '渡辺 和夫', '阿部 聡', '中村 幸子');

INSERT INTO author (id, name, is_deleted, created_at) VALUES
                                                          (@author_osada_id, '掌田 津耶乃', FALSE, NOW()),
                                                          (@author_yamada_id, '山田 太郎', FALSE, NOW()),
                                                          (@author_sato_id, '佐藤 次郎', FALSE, NOW()),
                                                          (@author_tanaka_id, '田中 花子', FALSE, NOW()),
                                                          (@author_endo_id, '遠藤 三郎', FALSE, NOW()),
                                                          (@author_kato_id, '加藤 恵子', FALSE, NOW()),
                                                          (@author_suzuki_id, '鈴木 裕', FALSE, NOW()),
                                                          (@author_watanabe_id, '渡辺 和夫', FALSE, NOW()),
                                                          (@author_abe_id, '阿部 聡', FALSE, NOW()),
                                                          (@author_nakamura_id, '中村 幸子', FALSE, NOW());


-- ----------------------------------------------------
-- 3. Book (書籍) データの挿入
-- ----------------------------------------------------
-- Publisher IDの定義（再利用のため）
SET @pub_shuwashisutemu = '019a95f5-d68e-7f45-ba5b-e6d80bd4157e'; -- 秀和システム
SET @pub_gihyosya = '019a95f5-d68e-73aa-aa7f-463d72faba8f';     -- 技術評論社
SET @pub_impress = '019a95f5-d68e-7d2f-a3f3-920f2b20d938';      -- インプレス
SET @pub_sbcreative = '019a95f5-d68e-761f-8dad-b4c7f36f7a18';   -- SBクリエイティブ
SET @pub_nikkeibp = '019a95f5-d68e-7a6f-95a1-956f9c2a9563';     -- 日経BP

-- 既存の書籍を削除 (ISBNベース)
DELETE FROM book WHERE isbn IN (
                                9784798070285, 9784798154562, 9784297138383, 9784296116845, 9784297141529,
                                9784861008889, 9784774189334, 9784297138390, 9784822287849, 9784844369062
    );


INSERT INTO book (isbn, title, author_id, publisher_id, publication_year, publication_month, is_deleted, created_at) VALUES
                                                                                                                         (9784798070285, 'Node.js 超入門[第4版]', @author_osada_id, @pub_shuwashisutemu, 2023, 07, FALSE, NOW()),
                                                                                                                         (9784798154562, '徹底攻略C#の基本と応用', @author_yamada_id, @pub_sbcreative, 2024, 01, FALSE, NOW()),
                                                                                                                         (9784297138383, 'PythonによるWebスクレイピング入門', @author_sato_id, @pub_gihyosya, 2023, 11, FALSE, NOW()),
                                                                                                                         (9784296116845, '図解ポケット IoTビジネスがわかる本', @author_tanaka_id, @pub_gihyosya, 2022, 05, FALSE, NOW()),
                                                                                                                         (9784297141529, 'いちばんやさしいTypeScriptの教本', @author_endo_id, @pub_impress, 2024, 02, FALSE, NOW()),
                                                                                                                         (9784861008889, '機械学習の基本', @author_kato_id, @pub_impress, 2021, 09, FALSE, NOW()),
                                                                                                                         (9784774189334, 'Web開発者のためのDocker入門', @author_suzuki_id, @pub_gihyosya, 2020, 04, FALSE, NOW()),
                                                                                                                         (9784297138390, 'Vue.js + Nuxt.js 実践開発', @author_watanabe_id, @pub_impress, 2023, 11, FALSE, NOW()),
                                                                                                                         (9784822287849, 'ChatGPT/AI時代のデータ分析入門', @author_abe_id, @pub_nikkeibp, 2023, 08, FALSE, NOW()),
                                                                                                                         (9784844369062, 'チーム開発のためのGit/GitHub入門', @author_nakamura_id, @pub_sbcreative, 2020, 10, FALSE, NOW());