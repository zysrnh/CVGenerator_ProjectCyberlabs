<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KoreaShipExperience extends Model
{
    protected $fillable = [
        'cv_submission_korea_id',
        'ship_name', 'period', 'ship_nationality', 'type',
    ];

    public function cvSubmission()
    {
        return $this->belongsTo(CvSubmissionKorea::class, 'cv_submission_korea_id');
    }
}