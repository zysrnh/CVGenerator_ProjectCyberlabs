<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SlokviaLanguage extends Model
{
    protected $table = 'slokavia_languages';

    protected $fillable = [
        'cv_submission_slokavia_id',
        'name',
        'listening',
        'reading',
        'spoken_production',
        'spoken_interaction',
        'writing',
    ];

    public function cvSubmission()
    {
        return $this->belongsTo(CvSubmissionSlokavia::class, 'cv_submission_slokavia_id');
    }
}