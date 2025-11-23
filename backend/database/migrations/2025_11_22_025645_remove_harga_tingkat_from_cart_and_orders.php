<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('keranjang', function (Blueprint $table) {
            // Drop all foreign keys temporarily
            $this->dropForeignKeyIfExists('keranjang', 'keranjang_user_id_foreign');
            $this->dropForeignKeyIfExists('keranjang', 'keranjang_product_id_foreign');
            $this->dropForeignKeyIfExists('keranjang', 'keranjang_harga_tingkat_id_foreign');
            $this->dropForeignKeyIfExists('keranjang', 'keranjang_product_variant_id_foreign');
            $this->dropForeignKeyIfExists('keranjang', 'keranjang_product_variant_pack_id_foreign');

            // Drop unique constraint that includes harga_tingkat_id
            $this->dropIndexIfExists('keranjang', 'keranjang_unique_variant');

            // Drop column
            if (Schema::hasColumn('keranjang', 'harga_tingkat_id')) {
                $table->dropColumn('harga_tingkat_id');
            }

            // Re-add unique constraint without harga_tingkat_id
            $table->unique(['user_id', 'product_id', 'product_variant_id', 'product_variant_pack_id'], 'keranjang_unique_variant');

            // Re-add foreign keys
            $this->addForeignKeyIfNotExists('keranjang', 'user_id', 'users', 'id', 'keranjang_user_id_foreign');
            $this->addForeignKeyIfNotExists('keranjang', 'product_id', 'products', 'id', 'keranjang_product_id_foreign');
            if (Schema::hasColumn('keranjang', 'product_variant_id')) {
                $this->addForeignKeyIfNotExists('keranjang', 'product_variant_id', 'product_variants', 'id', 'keranjang_product_variant_id_foreign', 'SET NULL');
            }
            if (Schema::hasColumn('keranjang', 'product_variant_pack_id')) {
                $this->addForeignKeyIfNotExists('keranjang', 'product_variant_pack_id', 'product_variant_packs', 'id', 'keranjang_product_variant_pack_id_foreign', 'SET NULL');
            }
        });

        Schema::table('order_items', function (Blueprint $table) {
            // Drop foreign key if exists
            $this->dropForeignKeyIfExists('order_items', 'order_items_harga_tingkat_id_foreign');

            // Drop column
            if (Schema::hasColumn('order_items', 'harga_tingkat_id')) {
                $table->dropColumn('harga_tingkat_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('keranjang', function (Blueprint $table) {
            // Drop unique constraint
            $this->dropIndexIfExists('keranjang', 'keranjang_unique_variant');

            // Re-add harga_tingkat_id column
            if (!Schema::hasColumn('keranjang', 'harga_tingkat_id')) {
                $table->foreignId('harga_tingkat_id')
                    ->nullable()
                    ->after('product_variant_pack_id')
                    ->constrained('harga_tingkat')
                    ->nullOnDelete();
            }

            // Re-add unique constraint with harga_tingkat_id
            $table->unique(['user_id', 'product_id', 'product_variant_id', 'product_variant_pack_id', 'harga_tingkat_id'], 'keranjang_unique_variant');
        });

        Schema::table('order_items', function (Blueprint $table) {
            // Re-add harga_tingkat_id column
            if (!Schema::hasColumn('order_items', 'harga_tingkat_id')) {
                $table->foreignId('harga_tingkat_id')
                    ->nullable()
                    ->after('product_variant_pack_id')
                    ->constrained('harga_tingkat')
                    ->nullOnDelete();
            }
        });
    }

    /**
     * Drop foreign key if it exists
     */
    private function dropForeignKeyIfExists(string $table, string $foreignKey): void
    {
        $foreignKeys = DB::select("
            SELECT CONSTRAINT_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = ?
            AND CONSTRAINT_NAME = ?
            AND REFERENCED_TABLE_NAME IS NOT NULL
        ", [$table, $foreignKey]);

        if (!empty($foreignKeys)) {
            DB::statement("ALTER TABLE `{$table}` DROP FOREIGN KEY `{$foreignKey}`");
        }
    }

    /**
     * Drop index if it exists
     */
    private function dropIndexIfExists(string $table, string $index): void
    {
        $indexes = DB::select("
            SELECT INDEX_NAME
            FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = ?
            AND INDEX_NAME = ?
        ", [$table, $index]);

        if (!empty($indexes)) {
            DB::statement("ALTER TABLE `{$table}` DROP INDEX `{$index}`");
        }
    }

    /**
     * Add foreign key if it doesn't exist
     */
    private function addForeignKeyIfNotExists(string $table, string $column, string $referencedTable, string $referencedColumn, string $foreignKey, string $onDelete = 'RESTRICT'): void
    {
        $foreignKeys = DB::select("
            SELECT CONSTRAINT_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = ?
            AND CONSTRAINT_NAME = ?
            AND REFERENCED_TABLE_NAME IS NOT NULL
        ", [$table, $foreignKey]);

        if (empty($foreignKeys)) {
            $onDeleteClause = $onDelete === 'SET NULL' ? 'ON DELETE SET NULL' : 'ON DELETE RESTRICT';
            DB::statement("ALTER TABLE `{$table}` ADD CONSTRAINT `{$foreignKey}` FOREIGN KEY (`{$column}`) REFERENCES `{$referencedTable}` (`{$referencedColumn}`) {$onDeleteClause}");
        }
    }
};
