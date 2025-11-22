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
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->string('tipe'); // BP REGULER, BP KIDS, BP BLUE, dll
            $table->string('sku_variant')->nullable()->unique(); // SKU spesifik untuk varian ini
            $table->integer('stok')->default(0);
            $table->integer('stok_reserved')->default(0);
            $table->decimal('harga_ecer', 10, 2)->nullable(); // Harga khusus varian (optional, jika null pakai harga produk)
            $table->json('gambar')->nullable(); // Gambar khusus varian (optional)
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            $table->timestamps();
            $table->softDeletes();

            // Index untuk performa query
            $table->index(['product_id', 'tipe']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
