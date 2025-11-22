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
        Schema::table('products', function (Blueprint $table) {
            // Ubah kolom sku menjadi nullable
            $table->string('sku')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Kembalikan ke NOT NULL (tapi perlu set default value untuk data yang null)
            // Hati-hati: ini bisa gagal jika ada data yang sku-nya null
            $table->string('sku')->nullable(false)->change();
        });
    }
};
