<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Education extends Model
{
    use HasFactory;

    protected $table = 'education';

    protected $fillable = [
        'cv_submission_id',
        'school',
        'study',
        'start_date',
        'graduation_date'
    ];

    public function cvSubmission()
    {
        return $this->belongsTo(CvSubmission::class);
    }
}