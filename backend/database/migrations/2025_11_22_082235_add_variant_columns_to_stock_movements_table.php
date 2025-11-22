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
        Schema::table('stock_movements', function (Blueprint $table) {
            // Tambahkan kolom product_variant_id dan product_variant_pack_id untuk tracking yang lebih akurat
            if (!Schema::hasColumn('stock_movements', 'product_variant_id')) {
                $table->foreignId('product_variant_id')
                    ->nullable()
                    ->after('product_id')
                    ->constrained('product_variants')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('stock_movements', 'product_variant_pack_id')) {
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
        Schema::table('stock_movements', function (Blueprint $table) {
            // Drop foreign keys first
            $this->dropForeignKeyIfExists('stock_movements', 'stock_movements_product_variant_id_foreign');
            $this->dropForeignKeyIfExists('stock_movements', 'stock_movements_product_variant_pack_id_foreign');

            // Drop columns
            if (Schema::hasColumn('stock_movements', 'product_variant_pack_id')) {
                $table->dropColumn('product_variant_pack_id');
            }
            if (Schema::hasColumn('stock_movements', 'product_variant_id')) {
                $table->dropColumn('product_variant_id');
            }
        });
    }

    // Helper to drop foreign key if it exists
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
};
