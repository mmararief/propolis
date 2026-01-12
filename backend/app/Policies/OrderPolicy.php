<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    /**
     * Pelanggan hanya boleh melihat order miliknya, admin bisa melihat semua.
     */
    public function view(User $user, Order $order): bool
    {
        // Cast both to int to avoid string/int mismatch issues
        return $user->isAdmin() || (int) $order->user_id === (int) $user->id;
    }

    /**
     * Hanya admin yang bisa memverifikasi pembayaran.
     */
    public function verify(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Hanya admin yang bisa melakukan pengiriman.
     */
    public function ship(User $user): bool
    {
        return $user->isAdmin();
    }
}
