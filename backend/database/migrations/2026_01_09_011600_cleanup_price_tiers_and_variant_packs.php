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
        // Drop harga_tingkat table
        Schema::dropIfExists('harga_tingkat');

        // Remove redundant stock columns from product_variant_packs
        Schema::table('product_variant_packs', function (Blueprint $table) {
            $table->dropColumn(['stok', 'stok_reserved']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Re-create harga_tingkat table
        Schema::create('harga_tingkat', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id')->nullable();
            $table->unsignedInteger('min_jumlah');
            $table->unsignedInteger('max_jumlah')->nullable();
            $table->decimal('harga_total', 12, 2);
            $table->string('label')->nullable();
            $table->timestamps();

            $table->foreign('product_id')
                ->references('id')
                ->on('products')
                ->onDelete('cascade');
        });

        // Add back columns to product_variant_packs
        Schema::table('product_variant_packs', function (Blueprint $table) {
            $table->integer('stok')->default(0);
            $table->integer('stok_reserved')->default(0);
        });
    }
};
