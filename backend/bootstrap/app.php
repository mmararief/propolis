<?php

use App\Console\Commands\BatchReportExpiring;
use App\Console\Commands\OrdersReleaseExpiredReservations;
use App\Console\Commands\SyncShipmentTrackingCommand;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withCommands([
        OrdersReleaseExpiredReservations::class,
        BatchReportExpiring::class,
        SyncShipmentTrackingCommand::class,
    ])
    ->withSchedule(function (Schedule $schedule) {
        $schedule->command('tracking:sync')->everySixHours()->withoutOverlapping();
        $schedule->command('orders:release-expired-reservations')->everyFiveMinutes()->withoutOverlapping();
    })
    ->withMiddleware(function (Middleware $middleware) {
        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
