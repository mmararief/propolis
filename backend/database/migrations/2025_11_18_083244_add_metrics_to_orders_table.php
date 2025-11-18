<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (! Schema::hasColumn('orders', 'gross_revenue')) {
                $table->decimal('gross_revenue', 12, 2)->nullable()->after('ordered_at');
            }
            if (! Schema::hasColumn('orders', 'net_revenue')) {
                $table->decimal('net_revenue', 12, 2)->nullable()->after('gross_revenue');
            }
            if (! Schema::hasColumn('orders', 'discount')) {
                $table->decimal('discount', 12, 2)->nullable()->after('net_revenue');
            }
            if (! Schema::hasColumn('orders', 'customer_id')) {
                $table->unsignedBigInteger('customer_id')->nullable()->after('user_id');
                $table->foreign('customer_id')
                    ->references('id')
                    ->on('users')
                    ->nullOnDelete();
            }

            $this->ensureIndex('orders', ['ordered_at', 'status'], 'orders_ordered_at_status_index', function () use ($table) {
                $table->index(['ordered_at', 'status'], 'orders_ordered_at_status_index');
            });
            $this->ensureIndex('orders', ['channel'], 'orders_channel_index', function () use ($table) {
                $table->index('channel', 'orders_channel_index');
            });
            $this->ensureIndex('orders', ['gross_revenue'], 'orders_gross_revenue_index', function () use ($table) {
                $table->index('gross_revenue', 'orders_gross_revenue_index');
            });
        });

        Schema::table('order_items', function (Blueprint $table) {
            if (! Schema::hasColumn('order_items', 'harga_tingkat_id')) {
                $table->foreignId('harga_tingkat_id')
                    ->nullable()
                    ->constrained('harga_tingkat')
                    ->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if ($this->foreignKeyExists('orders', 'orders_customer_id_foreign')) {
                $table->dropForeign('orders_customer_id_foreign');
            }
            $this->dropIndexIfExists('orders', 'orders_ordered_at_status_index', fn() => $table->dropIndex('orders_ordered_at_status_index'));
            $this->dropIndexIfExists('orders', 'orders_channel_index', fn() => $table->dropIndex('orders_channel_index'));
            $this->dropIndexIfExists('orders', 'orders_gross_revenue_index', fn() => $table->dropIndex('orders_gross_revenue_index'));

            $columns = collect(['gross_revenue', 'net_revenue', 'discount', 'customer_id'])
                ->filter(fn($column) => Schema::hasColumn('orders', $column))
                ->all();

            if (! empty($columns)) {
                $table->dropColumn($columns);
            }
        });

        Schema::table('order_items', function (Blueprint $table) {
            if (Schema::hasColumn('order_items', 'harga_tingkat_id')) {
                $table->dropForeign(['harga_tingkat_id']);
                $table->dropColumn('harga_tingkat_id');
            }
        });
    }

    private function ensureIndex(string $table, array $columns, string $indexName, callable $callback): void
    {
        if (! Schema::hasColumn($table, $columns[0])) {
            return;
        }

        if (! $this->indexExists($table, $indexName)) {
            $callback();
        }
    }

    private function dropIndexIfExists(string $table, string $indexName, callable $callback): void
    {
        if ($this->indexExists($table, $indexName)) {
            $callback();
        }
    }

    private function indexExists(string $table, string $indexName): bool
    {
        $connection = Schema::getConnection();
        $database = $connection->getDatabaseName();

        $result = DB::selectOne(
            'SELECT COUNT(*) as cnt FROM information_schema.statistics WHERE table_schema = ? AND table_name = ? AND index_name = ?',
            [$database, $table, $indexName]
        );

        return (int) ($result->cnt ?? 0) > 0;
    }

    private function foreignKeyExists(string $table, string $constraint): bool
    {
        $connection = Schema::getConnection();
        $database = $connection->getDatabaseName();

        $result = DB::selectOne(
            'SELECT COUNT(*) as cnt FROM information_schema.key_column_usage WHERE table_schema = ? AND table_name = ? AND constraint_name = ?',
            [$database, $table, $constraint]
        );

        return (int) ($result->cnt ?? 0) > 0;
    }
};
