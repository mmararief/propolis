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
        // Convert existing string gambar to JSON array
        DB::table('products')->whereNotNull('gambar')->get()->each(function ($product) {
            $gambar = $product->gambar;
            if ($gambar && !is_array(json_decode($gambar, true))) {
                // Convert single string to array
                DB::table('products')
                    ->where('id', $product->id)
                    ->update(['gambar' => json_encode([$gambar])]);
            }
        });

        // Change column type to JSON
        Schema::table('products', function (Blueprint $table) {
            $table->json('gambar')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Convert JSON array back to single string (take first image)
        DB::table('products')->whereNotNull('gambar')->get()->each(function ($product) {
            $gambar = json_decode($product->gambar, true);
            if (is_array($gambar) && count($gambar) > 0) {
                DB::table('products')
                    ->where('id', $product->id)
                    ->update(['gambar' => $gambar[0]]);
            } else {
                DB::table('products')
                    ->where('id', $product->id)
                    ->update(['gambar' => null]);
            }
        });

        Schema::table('products', function (Blueprint $table) {
            $table->string('gambar')->nullable()->change();
        });
    }
};
