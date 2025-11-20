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
        // Update any existing reseller users to pelanggan
        DB::table('users')
            ->where('role', 'reseller')
            ->update(['role' => 'pelanggan']);

        // Modify the enum column to remove 'reseller'
        // MySQL doesn't support direct enum modification, so we use raw SQL
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'pelanggan') NOT NULL DEFAULT 'pelanggan'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore the enum column to include 'reseller'
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'pelanggan', 'reseller') NOT NULL DEFAULT 'pelanggan'");
    }
};
