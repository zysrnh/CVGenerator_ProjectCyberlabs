<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CvSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name', 'objective', 'position_applied', 'age', 'sex',
        'height', 'weight', 'address', 'mobile_phone', 'email_address',
        'place_of_birth', 'date_of_birth', 'nationality', 'marital_status',
        'passport_number', 'passport_expiry_date', 'photo_path',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    public function workExperiences()
    {
        return $this->hasMany(WorkExperience::class);
    }

    public function educations()
    {
        return $this->hasMany(Education::class);
    }

    public function languages()
    {
        return $this->hasMany(Language::class);
    }

    public function pcSkills()
    {
        return $this->hasMany(PcSkill::class);
    }

    public function otherSkills()
    {
        return $this->hasMany(OtherSkill::class);
    }
}