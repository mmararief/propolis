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
            if (! Schema::hasColumn('products', 'stok_reserved')) {
                $table->integer('stok_reserved')->default(0)->after('stok');
            }
        });

        Schema::dropIfExists('order_item_batches');
        Schema::dropIfExists('batch_stock_movements');
        Schema::dropIfExists('product_batches');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('product_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products');
            $table->string('batch_number');
            $table->unsignedInteger('qty_initial');
            $table->unsignedInteger('qty_remaining');
            $table->unsignedInteger('reserved_qty')->default(0);
            $table->date('expiry_date')->nullable()->index();
            $table->decimal('purchase_price', 12, 2)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['product_id', 'batch_number']);
        });

        Schema::create('batch_stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('batch_id')->constrained('product_batches');
            $table->integer('change_qty');
            $table->enum('reason', ['restock', 'reserve', 'sold', 'release', 'adjustment']);
            $table->string('reference_table', 50)->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['reference_table', 'reference_id']);
        });

        Schema::create('order_item_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_item_id')->constrained('order_items')->cascadeOnDelete();
            $table->foreignId('batch_id')->constrained('product_batches');
            $table->unsignedInteger('qty');
            $table->timestamps();
        });

        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'stok_reserved')) {
                $table->dropColumn('stok_reserved');
            }
        });
    }
};
