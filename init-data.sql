-- 初期データ投入用のシンプルなSQLファイル

-- 出版社データの挿入
INSERT INTO publisher (id, name, is_deleted, created_at) VALUES
                                                             ('pub-001', '株式会社 秀和システム', FALSE, NOW()),
                                                             ('pub-002', '株式会社 技術評論社', FALSE, NOW()),
                                                             ('pub-003', '株式会社 インプレス', FALSE, NOW()),
                                                             ('pub-004', 'SBクリエイティブ株式会社', FALSE, NOW()),
                                                             ('pub-005', '株式会社 日経BP', FALSE, NOW());

-- 著者データの挿入
INSERT INTO author (id, name, is_deleted, created_at) VALUES
                                                          ('auth-001', '掌田 津耶乃', FALSE, NOW()),
                                                          ('auth-002', '山田 太郎', FALSE, NOW()),
                                                          ('auth-003', '佐藤 次郎', FALSE, NOW()),
                                                          ('auth-004', '田中 花子', FALSE, NOW()),
                                                          ('auth-005', '遠藤 三郎', FALSE, NOW());

-- 書籍データの挿入
INSERT INTO book (isbn, title, author_id, publisher_id, publication_year, publication_month, is_deleted, created_at) VALUES
                                                                                                                         (9784798070285, 'Node.js 超入門[第4版]', 'auth-001', 'pub-001', 2023, 7, FALSE, NOW()),
                                                                                                                         (9784798154562, '徹底攻略C#の基本と応用', 'auth-002', 'pub-004', 2024, 1, FALSE, NOW()),
                                                                                                                         (9784297138383, 'PythonによるWebスクレイピング入門', 'auth-003', 'pub-002', 2023, 11, FALSE, NOW()),
                                                                                                                         (9784296116845, '図解ポケット IoTビジネスがわかる本', 'auth-004', 'pub-002', 2022, 5, FALSE, NOW()),
                                                                                                                         (9784297141529, 'いちばんやさしいTypeScriptの教本', 'auth-005', 'pub-003', 2024, 2, FALSE, NOW());