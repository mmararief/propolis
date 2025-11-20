<?php

use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ShippingController;
use Illuminate\Support\Facades\Route;

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/categories', [ProductController::class, 'categories']);

// Public access to global price tiers
Route::get('/price-tiers', [\App\Http\Controllers\Admin\PriceTierController::class, 'index']);

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/shipping/provinces', [ShippingController::class, 'provinces']);
Route::get('/shipping/cities/{provinceId}', [ShippingController::class, 'cities']);
Route::get('/shipping/districts/{cityId}', [ShippingController::class, 'districts']);
Route::get('/shipping/subdistricts/{districtId}', [ShippingController::class, 'subdistricts']);
Route::post('/shipping/cost', [ShippingController::class, 'cost']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/profile', [AuthController::class, 'profile']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/checkout', CheckoutController::class);
    Route::get('/orders/me', [OrderController::class, 'index']);
    Route::post('/orders/{id}/upload-proof', [PaymentController::class, 'uploadProof']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders/{id}/confirm-delivery', [OrderController::class, 'confirmDelivery']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);

    // Cart Routes
    Route::get('/cart', [\App\Http\Controllers\CartController::class, 'index']);
    Route::post('/cart', [\App\Http\Controllers\CartController::class, 'store']);
    Route::put('/cart/{id}', [\App\Http\Controllers\CartController::class, 'update']);
    Route::delete('/cart/{id}', [\App\Http\Controllers\CartController::class, 'destroy']);
    Route::delete('/cart', [\App\Http\Controllers\CartController::class, 'clear']);
});

Route::middleware(['auth:sanctum', 'can:admin'])->group(function () {
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::post('/products/{id}/add-stock', [ProductController::class, 'addStock']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::get('/admin/categories', [CategoryController::class, 'index']);
    Route::post('/admin/categories', [CategoryController::class, 'store']);
    Route::put('/admin/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/admin/categories/{id}', [CategoryController::class, 'destroy']);

    // User Management
    Route::get('/admin/users', [AdminUserController::class, 'index']);
    Route::post('/admin/users', [AdminUserController::class, 'store']);
    Route::get('/admin/users/{id}', [AdminUserController::class, 'show']);
    Route::put('/admin/users/{id}', [AdminUserController::class, 'update']);
    Route::delete('/admin/users/{id}', [AdminUserController::class, 'destroy']);

    Route::get('/admin/orders', [AdminOrderController::class, 'index']);
    Route::post('/admin/orders/manual', [AdminOrderController::class, 'storeManual']);
    Route::get('/admin/orders/{id}', [AdminOrderController::class, 'show']);
    Route::post('/admin/orders/{id}/verify-payment', [AdminOrderController::class, 'verifyPayment']);
    Route::post('/admin/orders/{id}/product-codes', [AdminOrderController::class, 'updateProductCodes']);
    Route::post('/admin/orders/{id}/ship', [AdminOrderController::class, 'ship']);
    Route::post('/admin/orders/{id}/mark-delivered', [AdminOrderController::class, 'markDelivered']);
    Route::post('/admin/run-reservation-release', [AdminOrderController::class, 'runReservationRelease']);

    // Global Price Tiers Management
    Route::get('/admin/price-tiers', [\App\Http\Controllers\Admin\PriceTierController::class, 'index']);
    Route::post('/admin/price-tiers', [\App\Http\Controllers\Admin\PriceTierController::class, 'store']);
    Route::put('/admin/price-tiers/{id}', [\App\Http\Controllers\Admin\PriceTierController::class, 'update']);
    Route::delete('/admin/price-tiers/{id}', [\App\Http\Controllers\Admin\PriceTierController::class, 'destroy']);

    Route::get('/reports/summary', [ReportController::class, 'summary']);
    Route::get('/reports/sales-trend', [ReportController::class, 'salesTrend']);
    Route::get('/reports/product-sales', [ReportController::class, 'productSales']);
    Route::get('/reports/channel-performance', [ReportController::class, 'channelPerformance']);
    Route::get('/reports/export/product-sales', [ReportController::class, 'exportProductSales']);
});
