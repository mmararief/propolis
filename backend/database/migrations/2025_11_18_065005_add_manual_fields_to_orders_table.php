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
            $table->string('customer_name')->nullable()->after('user_id');
            $table->string('customer_email')->nullable()->after('customer_name');
            $table->string('channel', 50)->default('online')->after('status');
            $table->string('external_order_id', 100)->nullable()->after('channel');
            $table->timestamp('ordered_at')->nullable()->after('reservation_expires_at');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->change();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
            $table->index('channel');
            $table->index('external_order_id');
            $table->index('ordered_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if ($this->foreignKeyExists('orders', 'orders_user_id_foreign')) {
                $table->dropForeign('orders_user_id_foreign');
            }

            $this->dropIndexIfExists('orders', 'orders_channel_index', fn() => $table->dropIndex('orders_channel_index'));
            $this->dropIndexIfExists('orders', 'orders_external_order_id_index', fn() => $table->dropIndex('orders_external_order_id_index'));
            $this->dropIndexIfExists('orders', 'orders_ordered_at_index', fn() => $table->dropIndex('orders_ordered_at_index'));

            $columns = collect([
                'customer_name',
                'customer_email',
                'channel',
                'external_order_id',
                'ordered_at',
            ])->filter(fn($column) => Schema::hasColumn('orders', $column));

            if ($columns->isNotEmpty()) {
                $table->dropColumn($columns->all());
            }
        });

        Schema::table('orders', function (Blueprint $table) {
            $fallbackUserId = DB::table('users')->min('id');

            if ($fallbackUserId !== null) {
                DB::table('orders')
                    ->whereNull('user_id')
                    ->update(['user_id' => $fallbackUserId]);
            }

            $table->unsignedBigInteger('user_id')->nullable(($fallbackUserId === null))->change();
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();
        });
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
