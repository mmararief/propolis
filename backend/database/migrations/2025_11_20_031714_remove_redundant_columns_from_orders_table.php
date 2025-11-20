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
        Schema::table('orders', function (Blueprint $table) {
            // Drop foreign key first if exists
            if ($this->foreignKeyExists('orders', 'orders_customer_id_foreign')) {
                $table->dropForeign('orders_customer_id_foreign');
            }

            // Drop indexes if exist
            if ($this->indexExists('orders', 'orders_customer_id_index')) {
                $table->dropIndex('orders_customer_id_index');
            }
            if ($this->indexExists('orders', 'orders_gross_revenue_index')) {
                $table->dropIndex('orders_gross_revenue_index');
            }

            // Drop redundant columns
            $columnsToDrop = collect([
                'customer_id',
                'gross_revenue',
                'net_revenue',
                'discount',
            ])->filter(fn($column) => Schema::hasColumn('orders', $column));

            if ($columnsToDrop->isNotEmpty()) {
                $table->dropColumn($columnsToDrop->all());
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'customer_id')) {
                $table->unsignedBigInteger('customer_id')->nullable()->after('user_id');
                $table->foreign('customer_id')
                    ->references('id')
                    ->on('users')
                    ->nullOnDelete();
                $table->index('customer_id');
            }

            if (!Schema::hasColumn('orders', 'gross_revenue')) {
                $table->decimal('gross_revenue', 12, 2)->nullable()->after('ordered_at');
                $table->index('gross_revenue');
            }

            if (!Schema::hasColumn('orders', 'net_revenue')) {
                $table->decimal('net_revenue', 12, 2)->nullable()->after('gross_revenue');
            }

            if (!Schema::hasColumn('orders', 'discount')) {
                $table->decimal('discount', 12, 2)->nullable()->after('net_revenue');
            }
        });
    }

    private function foreignKeyExists(string $table, string $constraint): bool
    {
        $connection = Schema::getConnection();
        $database = $connection->getDatabaseName();

        $result = \Illuminate\Support\Facades\DB::selectOne(
            'SELECT COUNT(*) as cnt FROM information_schema.key_column_usage WHERE table_schema = ? AND table_name = ? AND constraint_name = ?',
            [$database, $table, $constraint]
        );

        return (int) ($result->cnt ?? 0) > 0;
    }

    private function indexExists(string $table, string $indexName): bool
    {
        $connection = Schema::getConnection();
        $database = $connection->getDatabaseName();

        $result = \Illuminate\Support\Facades\DB::selectOne(
            'SELECT COUNT(*) as cnt FROM information_schema.statistics WHERE table_schema = ? AND table_name = ? AND index_name = ?',
            [$database, $table, $indexName]
        );

        return (int) ($result->cnt ?? 0) > 0;
    }
};
