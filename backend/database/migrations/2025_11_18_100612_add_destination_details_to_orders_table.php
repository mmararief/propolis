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
            $table->unsignedInteger('destination_province_id')->nullable()->after('courier_service');
            $table->string('destination_province_name')->nullable()->after('destination_province_id');
            $table->string('destination_city_name')->nullable()->after('destination_city_id');
            $table->string('destination_district_name')->nullable()->after('destination_district_id');
            $table->string('destination_subdistrict_name')->nullable()->after('destination_subdistrict_id');
            $table->string('destination_postal_code', 10)->nullable()->after('destination_subdistrict_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'destination_province_id',
                'destination_province_name',
                'destination_city_name',
                'destination_district_name',
                'destination_subdistrict_name',
                'destination_postal_code',
            ]);
        });
    }
};
