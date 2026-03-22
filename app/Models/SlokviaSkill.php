<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SlokviaSkill extends Model
{
    protected $table = 'slokavia_skills';

    protected $fillable = [
        'cv_submission_slokavia_id',
        'skill',
    ];

    public function cvSubmission()
    {
        return $this->belongsTo(CvSubmissionSlokavia::class, 'cv_submission_slokavia_id');
    }
}