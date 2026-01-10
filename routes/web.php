<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CvSubmissionController;
use App\Http\Controllers\CVImportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AuthController;

// Public Routes
Route::get('/', function () {
    return Inertia::render('CVImportGenerator');
});

Route::get('/form', function () {
    return Inertia::render('CVFormManual');
});

Route::post('/cv-submissions', [CvSubmissionController::class, 'store']);
Route::post('/cv-import', [CVImportController::class, 'store']);
Route::post('/cv-import/bulk', [CVImportController::class, 'bulkStore']);

// Auth Routes
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

// Protected Routes (butuh login)
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/{id}', [DashboardController::class, 'show']);
    Route::delete('/cv-submissions/{id}', [CvSubmissionController::class, 'destroy']);

    Route::get('/dashboard/{id}/edit', [DashboardController::class, 'edit'])->name('dashboard.edit');
Route::put('/dashboard/{id}', [DashboardController::class, 'update'])->name('dashboard.update');
Route::post('/dashboard/{id}', [DashboardController::class, 'update'])->name('dashboard.update.post');

});