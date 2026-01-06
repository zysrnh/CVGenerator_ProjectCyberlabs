<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin Loring Margi',
            'email' => 'admin@dashboard.com',
            'password' => Hash::make('4dm1nM4rG1nJu4ra!'),
        ]);
    }
}