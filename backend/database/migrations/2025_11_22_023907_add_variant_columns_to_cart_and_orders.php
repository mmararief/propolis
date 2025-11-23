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
            // Check if columns already exist
            if (!Schema::hasColumn('keranjang', 'product_variant_id')) {
                $table->foreignId('product_variant_id')
                    ->nullable()
                    ->after('product_id')
                    ->constrained('product_variants')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('keranjang', 'product_variant_pack_id')) {
                $table->foreignId('product_variant_pack_id')
                    ->nullable()
                    ->after('product_variant_id')
                    ->constrained('product_variant_packs')
                    ->nullOnDelete();
            }

            // Drop foreign keys temporarily to modify unique constraint (only if they exist)
            $this->dropForeignKeyIfExists('keranjang', 'keranjang_user_id_foreign');
            $this->dropForeignKeyIfExists('keranjang', 'keranjang_product_id_foreign');
            $this->dropForeignKeyIfExists('keranjang', 'keranjang_harga_tingkat_id_foreign');
            $this->dropForeignKeyIfExists('keranjang', 'keranjang_product_variant_id_foreign');
            $this->dropForeignKeyIfExists('keranjang', 'keranjang_product_variant_pack_id_foreign');

            // Drop old unique constraint if it exists
            $this->dropIndexIfExists('keranjang', 'keranjang_user_id_product_id_harga_tingkat_id_unique');

            // Add new unique constraint (drop first if exists)
            $this->dropIndexIfExists('keranjang', 'keranjang_unique_variant');
            $table->unique(['user_id', 'product_id', 'product_variant_id', 'product_variant_pack_id'], 'keranjang_unique_variant');

            // Re-add foreign keys (only if they don't exist)
            $this->addForeignKeyIfNotExists('keranjang', 'user_id', 'users', 'id', 'keranjang_user_id_foreign');
            $this->addForeignKeyIfNotExists('keranjang', 'product_id', 'products', 'id', 'keranjang_product_id_foreign');
            if (Schema::hasColumn('keranjang', 'harga_tingkat_id')) {
                $this->addForeignKeyIfNotExists('keranjang', 'harga_tingkat_id', 'harga_tingkat', 'id', 'keranjang_harga_tingkat_id_foreign', 'SET NULL');
            }
            if (Schema::hasColumn('keranjang', 'product_variant_id')) {
                $this->addForeignKeyIfNotExists('keranjang', 'product_variant_id', 'product_variants', 'id', 'keranjang_product_variant_id_foreign', 'SET NULL');
            }
            if (Schema::hasColumn('keranjang', 'product_variant_pack_id')) {
                $this->addForeignKeyIfNotExists('keranjang', 'product_variant_pack_id', 'product_variant_packs', 'id', 'keranjang_product_variant_pack_id_foreign', 'SET NULL');
            }
        });

        Schema::table('order_items', function (Blueprint $table) {
            if (!Schema::hasColumn('order_items', 'product_variant_id')) {
                $table->foreignId('product_variant_id')
                    ->nullable()
                    ->after('product_id')
                    ->constrained('product_variants')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('order_items', 'product_variant_pack_id')) {
                $table->foreignId('product_variant_pack_id')
                    ->nullable()
                    ->after('product_variant_id')
                    ->constrained('product_variant_packs')
                    ->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('keranjang', function (Blueprint $table) {
            $table->dropForeign(['product_variant_pack_id']);
            $table->dropForeign(['product_variant_id']);
            $table->dropForeign(['harga_tingkat_id']);
            $table->dropForeign(['product_id']);
            $table->dropForeign(['user_id']);

            $table->dropUnique('keranjang_unique_variant');
            $table->unique(['user_id', 'product_id', 'harga_tingkat_id'], 'keranjang_user_id_product_id_harga_tingkat_id_unique');

            $table->dropColumn(['product_variant_id', 'product_variant_pack_id']);

            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('product_id')->references('id')->on('products');
            $table->foreign('harga_tingkat_id')->references('id')->on('harga_tingkat')->nullOnDelete();
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['product_variant_id']);
            $table->dropForeign(['product_variant_pack_id']);
            $table->dropColumn(['product_variant_id', 'product_variant_pack_id']);
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
