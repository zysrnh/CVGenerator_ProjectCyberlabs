<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SlokviaWorkExperience extends Model
{
    protected $table = 'slokavia_work_experiences';

    protected $fillable = [
        'cv_submission_slokavia_id',
        'employer',
        'position',
        'start_date',
        'leaving_date',
        'responsibilities',
    ];

    public function getResponsibilitiesArrayAttribute(): array
    {
        if (!$this->responsibilities) return [];
        return explode('||', $this->responsibilities);
    }

    public function cvSubmission()
    {
        return $this->belongsTo(CvSubmissionSlokavia::class, 'cv_submission_slokavia_id');
    }
}