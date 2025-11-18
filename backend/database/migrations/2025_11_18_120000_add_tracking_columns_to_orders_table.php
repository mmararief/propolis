<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (! Schema::hasColumn('orders', 'tracking_status')) {
                $table->string('tracking_status', 100)->nullable()->after('resi');
            }

            if (! Schema::hasColumn('orders', 'tracking_payload')) {
                $table->longText('tracking_payload')->nullable()->after('tracking_status');
            }

            if (! Schema::hasColumn('orders', 'tracking_last_checked_at')) {
                $table->timestamp('tracking_last_checked_at')->nullable()->after('tracking_payload');
            }

            if (! Schema::hasColumn('orders', 'tracking_completed_at')) {
                $table->timestamp('tracking_completed_at')->nullable()->after('tracking_last_checked_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'tracking_status')) {
                $table->dropColumn('tracking_status');
            }

            if (Schema::hasColumn('orders', 'tracking_payload')) {
                $table->dropColumn('tracking_payload');
            }

            if (Schema::hasColumn('orders', 'tracking_last_checked_at')) {
                $table->dropColumn('tracking_last_checked_at');
            }

            if (Schema::hasColumn('orders', 'tracking_completed_at')) {
                $table->dropColumn('tracking_completed_at');
            }
        });
    }
};
