<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SlokviaCertification extends Model
{
    protected $table = 'slokavia_certifications';

    protected $fillable = [
        'cv_submission_slokavia_id',
        'year',
        'title',
        'description',
        'mode',
    ];

    public function cvSubmission()
    {
        return $this->belongsTo(CvSubmissionSlokavia::class, 'cv_submission_slokavia_id');
    }
}