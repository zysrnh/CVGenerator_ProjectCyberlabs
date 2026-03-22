<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CvSubmissionKorea extends Model
{
    protected $fillable = [
        'full_name', 'korean_name', 'date_of_birth', 'gender',
        'address', 'id_number', 'nationality', 'religion',
        'height', 'weight', 'vision', 'dominant_hand',
        'tattoo', 'surgery', 'marital_status',
        'father_name', 'father_birth_year', 'father_occupation', 'father_phone',
        'mother_name', 'mother_birth_year', 'mother_occupation', 'mother_phone',
        'spouse_name', 'spouse_birth_year', 'spouse_occupation', 'spouse_phone',
        'children_count', 'eldest_age', 'youngest_age',
        'education_level', 'school_name', 'school_address',
        'has_seafaring_exp',
        'pushups', 'situps', 'right_balance', 'forward_bend',
        'backward_bend', 'hanging_seconds', 'right_grip', 'left_grip', 'horse_stance_seconds',
        'photo_path', 'wajah_path', 'tangan_path', 'badan_path',
    ];

    protected $casts = [
        'date_of_birth'     => 'date',
        'tattoo'            => 'boolean',
        'surgery'           => 'boolean',
        'has_seafaring_exp' => 'boolean',
    ];

    public function shipExperiences()
    {
        return $this->hasMany(KoreaShipExperience::class, 'cv_submission_korea_id');
    }
}