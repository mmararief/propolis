<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('harga_tingkat', function (Blueprint $table) {
            // Drop existing foreign key constraint first
            $table->dropForeign(['product_id']);

            // Modify column to be nullable (NULL = global tier, value = per-product tier)
            $table->unsignedBigInteger('product_id')->nullable()->change();

            // Re-add foreign key constraint with nullable support
            $table->foreign('product_id')
                ->references('id')
                ->on('products')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('harga_tingkat', function (Blueprint $table) {
            // Drop foreign key constraint
            $table->dropForeign(['product_id']);

            // Make product_id required again (non-nullable)
            $table->unsignedBigInteger('product_id')->nullable(false)->change();

            // Re-add foreign key constraint
            $table->foreign('product_id')
                ->references('id')
                ->on('products')
                ->onDelete('cascade');
        });
    }
};
