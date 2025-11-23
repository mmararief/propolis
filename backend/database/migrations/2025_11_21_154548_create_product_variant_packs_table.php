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
        Schema::create('product_variant_packs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_variant_id')->constrained('product_variants')->onDelete('cascade');
            $table->string('label')->nullable(); // Contoh: "1 Botol", "3 Botol"
            $table->unsignedInteger('pack_size')->default(1); // Jumlah botol per paket
            $table->string('sku_pack')->nullable()->unique(); // SKU khusus paket (opsional)
            $table->decimal('harga_pack', 12, 2)->nullable(); // Harga total per paket (opsional, fallback ke harga varian x pack_size)
            $table->integer('stok')->default(0);
            $table->integer('stok_reserved')->default(0);
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['product_variant_id', 'pack_size']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variant_packs');
    }
};
