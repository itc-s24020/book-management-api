-- CreateTable
CREATE TABLE `author` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `author_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `publisher` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `publisher_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(254) NOT NULL,
    `name` VARCHAR(512) NOT NULL,
    `password` VARCHAR(256) NOT NULL,
    `is_admin` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `user_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `book` (
    `isbn` BIGINT NOT NULL,
    `title` VARCHAR(512) NOT NULL,
    `author_id` VARCHAR(191) NOT NULL,
    `publisher_id` VARCHAR(191) NOT NULL,
    `publication_year` INTEGER NOT NULL,
    `publication_month` INTEGER NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`isbn`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rental_log` (
    `id` VARCHAR(191) NOT NULL,
    `book_isbn` BIGINT NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `checkout_date` DATETIME(3) NOT NULL,
    `due_date` DATETIME(3) NOT NULL,
    `returned_date` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `book` ADD CONSTRAINT `book_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `author`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `book` ADD CONSTRAINT `book_publisher_id_fkey` FOREIGN KEY (`publisher_id`) REFERENCES `publisher`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rental_log` ADD CONSTRAINT `rental_log_book_isbn_fkey` FOREIGN KEY (`book_isbn`) REFERENCES `book`(`isbn`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rental_log` ADD CONSTRAINT `rental_log_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
