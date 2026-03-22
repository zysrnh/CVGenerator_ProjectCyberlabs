<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CvSubmissionController;
use App\Http\Controllers\CVImportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CvSubmissionSlokviaController;
use App\Http\Controllers\CvSubmissionKoreaController;

// ══════════════════════════════════════════════════════════════
//  PUBLIC ROUTES
// ══════════════════════════════════════════════════════════════

// Template selector — halaman utama
Route::get('/', function () {
    return Inertia::render('CVTemplateSelect');
});

// ── TURKI ─────────────────────────────────────────────────────
Route::get('/import', function () {
    return Inertia::render('CVImportGenerator');
});

Route::get('/form/turki', function () {
    return Inertia::render('CVFormManual');
});

Route::post('/cv-submissions', [CvSubmissionController::class, 'store']);

// ── SLOKAVIA ──────────────────────────────────────────────────
Route::get('/import/slokavia', function () {
    return Inertia::render('CVImportGeneratorSlokavia');
});

Route::get('/form/slokavia', function () {
    return Inertia::render('CVFormSlokavia');
});

Route::post('/cv-submissions-slokavia', [CvSubmissionSlokviaController::class, 'store']);
Route::delete('/cv-submissions-slokavia/{id}', [CvSubmissionSlokviaController::class, 'destroy']);

// ── KOREA ─────────────────────────────────────────────────────
Route::get('/import/korea', function () {
    return Inertia::render('CVImportGeneratorKorea');
});

Route::get('/form/korea', function () {
    return Inertia::render('CVFormKorea');
});

Route::post('/cv-submissions-korea', [CvSubmissionKoreaController::class, 'store']);
Route::delete('/cv-submissions-korea/{id}', [CvSubmissionKoreaController::class, 'destroy']);

// ── IMPORT BULK ───────────────────────────────────────────────
Route::post('/cv-import', [CVImportController::class, 'store']);
Route::post('/cv-import/bulk', [CVImportController::class, 'bulkStore']);

// ══════════════════════════════════════════════════════════════
//  AUTH ROUTES
// ══════════════════════════════════════════════════════════════

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

// ══════════════════════════════════════════════════════════════
//  PROTECTED ROUTES
// ══════════════════════════════════════════════════════════════

Route::middleware('auth')->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Detail Slokavia — harus sebelum /{id} supaya tidak tertangkap duluan
    Route::get('/dashboard/slokavia/{id}', [DashboardController::class, 'showSlokavia']);
    Route::get('/dashboard/slokavia/{id}/edit', [DashboardController::class, 'editSlokavia'])->name('dashboard.slokavia.edit');
    Route::put('/dashboard/slokavia/{id}', [DashboardController::class, 'updateSlokavia'])->name('dashboard.slokavia.update');

    // Detail Korea — sama, harus sebelum /{id}
    Route::get('/dashboard/korea/{id}', [DashboardController::class, 'showKorea']);
    Route::get('/dashboard/korea/{id}/edit', [DashboardController::class, 'editKorea'])->name('dashboard.korea.edit');
    Route::put('/dashboard/korea/{id}', [DashboardController::class, 'updateKorea'])->name('dashboard.korea.update');

    // Detail Turki (default)
    Route::get('/dashboard/{id}', [DashboardController::class, 'show']);
    Route::get('/dashboard/{id}/edit', [DashboardController::class, 'edit'])->name('dashboard.edit');
    Route::put('/dashboard/{id}', [DashboardController::class, 'update'])->name('dashboard.update');
    Route::post('/dashboard/{id}', [DashboardController::class, 'update'])->name('dashboard.update.post');

    Route::delete('/cv-submissions/{id}', [CvSubmissionController::class, 'destroy']);
    Route::delete('/cv-submissions-korea/{id}', [CvSubmissionKoreaController::class, 'destroy']);
});