<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Language extends Model
{
    use HasFactory;

    protected $table = 'language';

    protected $fillable = [
        'cv_submission_id',
        'name',
        'level'
    ];

    public function cvSubmission()
    {
        return $this->belongsTo(CvSubmission::class);
    }
}