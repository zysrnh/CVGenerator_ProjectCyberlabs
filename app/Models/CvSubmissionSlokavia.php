<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CvSubmissionSlokavia extends Model
{
    protected $fillable = [
        'full_name',
        'about_me',
        'destination_country',
        'date_of_birth',
        'place_of_birth',
        'nationality',
        'gender',
        'address',
        'mobile_phone',
        'email_address',
        'mother_tongue',
        'photo_path',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    public function workExperiences()
    {
        return $this->hasMany(SlokviaWorkExperience::class, 'cv_submission_slokavia_id');
    }

    public function educations()
    {
        return $this->hasMany(SlokviaEducation::class, 'cv_submission_slokavia_id');
    }

    public function languages()
    {
        return $this->hasMany(SlokviaLanguage::class, 'cv_submission_slokavia_id');
    }

    public function certifications()
    {
        return $this->hasMany(SlokviaCertification::class, 'cv_submission_slokavia_id');
    }

    public function skills()
    {
        return $this->hasMany(SlokviaSkill::class, 'cv_submission_slokavia_id');
    }
}