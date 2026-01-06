<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cv_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->text('objective')->nullable();
            $table->string('position_applied')->nullable();
            $table->integer('age')->nullable();
            $table->enum('sex', ['Male', 'Female'])->nullable();
            $table->string('height')->nullable();
            $table->string('weight')->nullable();
            $table->text('address')->nullable();
            $table->string('mobile_phone')->nullable();
            $table->string('email_address')->nullable();
            $table->string('place_of_birth')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('nationality')->nullable();
            $table->string('marital_status')->nullable();
            $table->string('passport_number')->nullable();
            $table->string('passport_expiry_date')->nullable();
            $table->string('photo_path')->nullable();
            $table->timestamps();
        });

        // Changed from 'work_experiences' to 'work_experience'
        Schema::create('work_experience', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cv_submission_id')->constrained()->onDelete('cascade');
            $table->string('employer')->nullable();
            $table->text('position')->nullable();
            $table->string('start_date')->nullable();
            $table->string('leaving_date')->nullable();
            $table->timestamps();
        });

        // Changed from 'educations' to 'education'
        Schema::create('education', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cv_submission_id')->constrained()->onDelete('cascade');
            $table->string('school')->nullable();
            $table->string('study')->nullable();
            $table->string('start_date')->nullable();
            $table->string('graduation_date')->nullable();
            $table->timestamps();
        });

        // Changed from 'languages' to 'language'
        Schema::create('language', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cv_submission_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('level')->nullable();
            $table->timestamps();
        });

        // Changed from 'pc_skills' to 'pc_skill'
        Schema::create('pc_skill', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cv_submission_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('level')->nullable();
            $table->timestamps();
        });

        // Changed from 'other_skills' to 'other_skill'
        Schema::create('other_skill', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cv_submission_id')->constrained()->onDelete('cascade');
            $table->text('skill');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('other_skill');
        Schema::dropIfExists('pc_skill');
        Schema::dropIfExists('language');
        Schema::dropIfExists('education');
        Schema::dropIfExists('work_experience');
        Schema::dropIfExists('cv_submissions');
    }
};