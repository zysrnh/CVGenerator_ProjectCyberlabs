<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('CVImportGenerator');
});

Route::get('/form', function () {
    return Inertia::render('CVFormManual');
});