<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Table 1: cv_submission_koreas ──────────────────────────
        Schema::create('cv_submission_koreas', function (Blueprint $table) {
            $table->id();

            // Identitas
            $table->string('full_name');
            $table->string('korean_name')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female'])->nullable();
            $table->text('address')->nullable();
            $table->string('id_number', 20)->nullable();
            $table->string('nationality', 100)->nullable()->default('Indonesia');
            $table->string('religion', 100)->nullable()->default('Islam');

            // Fisik
            $table->decimal('height', 5, 1)->nullable();
            $table->decimal('weight', 5, 1)->nullable();
            $table->string('vision', 20)->nullable()->default('10/10');
            $table->enum('dominant_hand', ['right', 'left'])->nullable()->default('right');
            $table->boolean('tattoo')->default(false);
            $table->boolean('surgery')->default(false);

            // Status
            $table->enum('marital_status', ['single', 'married', 'divorced', 'widowed'])
                  ->nullable()
                  ->default('single');

            // Keluarga — Ayah
            $table->string('father_name')->nullable();
            $table->string('father_birth_year', 10)->nullable();
            $table->string('father_occupation')->nullable();
            $table->string('father_phone', 50)->nullable();

            // Keluarga — Ibu
            $table->string('mother_name')->nullable();
            $table->string('mother_birth_year', 10)->nullable();
            $table->string('mother_occupation')->nullable();
            $table->string('mother_phone', 50)->nullable();

            // Keluarga — Pasangan
            $table->string('spouse_name')->nullable();
            $table->string('spouse_birth_year', 10)->nullable();
            $table->string('spouse_occupation')->nullable();
            $table->string('spouse_phone', 50)->nullable();

            // Anak
            $table->integer('children_count')->nullable();
            $table->string('eldest_age', 20)->nullable();
            $table->string('youngest_age', 20)->nullable();

            // Pendidikan
            $table->enum('education_level', [
                'elementary', 'middle', 'highschool', 'diploma', 'bachelor',
            ])->nullable()->default('highschool');
            $table->string('school_name')->nullable();
            $table->string('school_address')->nullable();

            // Pengalaman kapal (flag)
            $table->boolean('has_seafaring_exp')->default(false);

            // Tes fisik
            $table->integer('pushups')->nullable();
            $table->integer('situps')->nullable();
            $table->string('right_balance', 30)->nullable();
            $table->string('forward_bend', 30)->nullable();
            $table->string('backward_bend', 30)->nullable();
            $table->decimal('hanging_seconds', 5, 1)->nullable();
            $table->decimal('right_grip', 5, 1)->nullable();
            $table->decimal('left_grip', 5, 1)->nullable();
            $table->decimal('horse_stance_seconds', 5, 1)->nullable();

            // Foto
            $table->string('photo_path')->nullable();
            $table->string('wajah_path')->nullable();
            $table->string('tangan_path')->nullable();
            $table->string('badan_path')->nullable();

            $table->timestamps();
        });

        // ── Table 2: korea_ship_experiences ───────────────────────
        Schema::create('korea_ship_experiences', function (Blueprint $table) {
            $table->id();

            $table->foreignId('cv_submission_korea_id')
                  ->constrained('cv_submission_koreas')
                  ->onDelete('cascade');

            $table->string('ship_name')->nullable();
            $table->string('period', 50)->nullable();
            $table->string('ship_nationality', 100)->nullable();
            $table->string('type', 100)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        // Drop child table dulu sebelum parent (foreign key constraint)
        Schema::dropIfExists('korea_ship_experiences');
        Schema::dropIfExists('cv_submission_koreas');
    }
};