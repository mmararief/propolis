<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$order = \App\Models\Order::with(['items.productCodes'])->latest()->first();

if (!$order) {
    echo "No orders found\n";
    exit;
}

echo "=== Full JSON Response Structure ===\n\n";

$orderArray = $order->toArray();
echo json_encode($orderArray, JSON_PRETTY_PRINT);
