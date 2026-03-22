<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Main CV Slokavia table
        Schema::create('cv_submission_slokavias', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->text('about_me')->nullable();
            $table->string('destination_country')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('place_of_birth')->nullable();
            $table->string('nationality')->nullable();
            $table->string('gender')->nullable();
            $table->text('address')->nullable();
            $table->string('mobile_phone')->nullable();
            $table->string('email_address')->nullable();
            $table->string('mother_tongue')->nullable();
            $table->string('photo_path')->nullable();
            $table->timestamps();
        });

        // Work Experiences
        Schema::create('slokavia_work_experiences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cv_submission_slokavia_id')->constrained('cv_submission_slokavias')->onDelete('cascade');
            $table->string('employer')->nullable();
            $table->string('position')->nullable();
            $table->string('start_date')->nullable();
            $table->string('leaving_date')->nullable();
            $table->text('responsibilities')->nullable(); // disimpan pakai separator "||"
            $table->timestamps();
        });

        // Educations
        Schema::create('slokavia_educations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cv_submission_slokavia_id')->constrained('cv_submission_slokavias')->onDelete('cascade');
            $table->string('school')->nullable();
            $table->string('field_of_study')->nullable();
            $table->string('start_date')->nullable();
            $table->string('graduation_date')->nullable();
            $table->timestamps();
        });

        // Languages (CEFR)
        Schema::create('slokavia_languages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cv_submission_slokavia_id')->constrained('cv_submission_slokavias')->onDelete('cascade');
            $table->string('name');
            $table->string('listening')->nullable();
            $table->string('reading')->nullable();
            $table->string('spoken_production')->nullable();
            $table->string('spoken_interaction')->nullable();
            $table->string('writing')->nullable();
            $table->timestamps();
        });

        // Certifications
        Schema::create('slokavia_certifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cv_submission_slokavia_id')->constrained('cv_submission_slokavias')->onDelete('cascade');
            $table->string('year')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('mode')->nullable();
            $table->timestamps();
        });

        // Skills
        Schema::create('slokavia_skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cv_submission_slokavia_id')->constrained('cv_submission_slokavias')->onDelete('cascade');
            $table->string('skill');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('slokavia_skills');
        Schema::dropIfExists('slokavia_certifications');
        Schema::dropIfExists('slokavia_languages');
        Schema::dropIfExists('slokavia_educations');
        Schema::dropIfExists('slokavia_work_experiences');
        Schema::dropIfExists('cv_submission_slokavias');
    }
};