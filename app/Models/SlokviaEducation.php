<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SlokviaEducation extends Model
{
    protected $table = 'slokavia_educations';

    protected $fillable = [
        'cv_submission_slokavia_id',
        'school',
        'field_of_study',
        'start_date',
        'graduation_date',
    ];

    public function cvSubmission()
    {
        return $this->belongsTo(CvSubmissionSlokavia::class, 'cv_submission_slokavia_id');
    }
}