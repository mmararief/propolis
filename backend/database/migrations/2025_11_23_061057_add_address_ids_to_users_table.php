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
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedInteger('province_id')->nullable()->after('role');
            $table->unsignedInteger('city_id')->nullable()->after('provinsi');
            $table->unsignedInteger('district_id')->nullable()->after('kabupaten_kota');
            $table->unsignedInteger('subdistrict_id')->nullable()->after('kecamatan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['province_id', 'city_id', 'district_id', 'subdistrict_id']);
        });
    }
};
