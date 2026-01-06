<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkExperience extends Model
{
    use HasFactory;

    protected $table = 'work_experience';

    protected $fillable = [
        'cv_submission_id',
        'employer',
        'position',
        'start_date',
        'leaving_date'
    ];

    public function cvSubmission()
    {
        return $this->belongsTo(CvSubmission::class);
    }
}