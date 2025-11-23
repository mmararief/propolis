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
        Schema::table('product_variant_packs', function (Blueprint $table) {
            // Drop foreign key constraint dulu (harus sebelum drop index)
            $this->dropForeignKeyIfExists('product_variant_packs', 'product_variant_packs_product_variant_id_foreign');

            // Drop index setelah foreign key di-drop
            $this->dropIndexIfExists('product_variant_packs', 'product_variant_packs_product_variant_id_pack_size_index');

            // Tambahkan product_id
            if (!Schema::hasColumn('product_variant_packs', 'product_id')) {
                $table->foreignId('product_id')->nullable()->after('id')->constrained('products')->onDelete('cascade');
            }

            // Ubah product_variant_id menjadi nullable
            $table->foreignId('product_variant_id')->nullable()->change();

            // Re-add foreign key dengan nullable
            $this->addForeignKeyIfNotExists(
                'product_variant_packs',
                'product_variant_id',
                'product_variants',
                'id',
                'product_variant_packs_product_variant_id_foreign',
                'CASCADE'
            );

            // Update index
            $table->index(['product_id', 'pack_size'], 'product_variant_packs_product_id_pack_size_index');
            $table->index(['product_variant_id', 'pack_size'], 'product_variant_packs_product_variant_id_pack_size_index');
        });

        // Add check constraint: pack harus punya product_id ATAU product_variant_id (tidak boleh keduanya null)
        DB::statement('ALTER TABLE product_variant_packs ADD CONSTRAINT product_variant_packs_product_or_variant_check CHECK ((product_id IS NOT NULL AND product_variant_id IS NULL) OR (product_id IS NULL AND product_variant_id IS NOT NULL))');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop check constraint
        DB::statement('ALTER TABLE product_variant_packs DROP CONSTRAINT IF EXISTS product_variant_packs_product_or_variant_check');

        Schema::table('product_variant_packs', function (Blueprint $table) {
            // Drop indexes
            $this->dropIndexIfExists('product_variant_packs', 'product_variant_packs_product_id_pack_size_index');
            $this->dropIndexIfExists('product_variant_packs', 'product_variant_packs_product_variant_id_pack_size_index');

            // Drop foreign key
            $this->dropForeignKeyIfExists('product_variant_packs', 'product_variant_packs_product_variant_id_foreign');
            $this->dropForeignKeyIfExists('product_variant_packs', 'product_variant_packs_product_id_foreign');

            // Hapus product_id
            if (Schema::hasColumn('product_variant_packs', 'product_id')) {
                $table->dropColumn('product_id');
            }

            // Ubah product_variant_id menjadi required lagi
            $table->foreignId('product_variant_id')->nullable(false)->change();

            // Re-add foreign key
            $this->addForeignKeyIfNotExists(
                'product_variant_packs',
                'product_variant_id',
                'product_variants',
                'id',
                'product_variant_packs_product_variant_id_foreign',
                'CASCADE'
            );

            // Re-add original index
            $table->index(['product_variant_id', 'pack_size'], 'product_variant_packs_product_variant_id_pack_size_index');
        });
    }

    private function dropForeignKeyIfExists(string $table, string $foreignKeyName): void
    {
        $foreignKeys = DB::select(
            "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?",
            [$table, $foreignKeyName]
        );

        if (!empty($foreignKeys)) {
            Schema::table($table, function (Blueprint $table) use ($foreignKeyName) {
                $table->dropForeign($foreignKeyName);
            });
        }
    }

    private function addForeignKeyIfNotExists(string $table, string $column, string $referencedTable, string $referencedColumn, string $constraintName, string $onDelete = 'CASCADE'): void
    {
        $foreignKeys = DB::select(
            "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?",
            [$table, $constraintName]
        );

        if (empty($foreignKeys)) {
            Schema::table($table, function (Blueprint $table) use ($column, $referencedTable, $referencedColumn, $constraintName, $onDelete) {
                $table->foreign($column, $constraintName)
                    ->references($referencedColumn)
                    ->on($referencedTable)
                    ->onDelete($onDelete);
            });
        }
    }

    private function dropIndexIfExists(string $table, string $indexName): void
    {
        $indexes = DB::select(
            "SHOW INDEXES FROM {$table} WHERE Key_name = ?",
            [$indexName]
        );

        if (!empty($indexes)) {
            Schema::table($table, function (Blueprint $table) use ($indexName) {
                $table->dropIndex($indexName);
            });
        }
    }
};
