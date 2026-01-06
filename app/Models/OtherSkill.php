<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OtherSkill extends Model
{
    use HasFactory;

    protected $table = 'other_skill';

    protected $fillable = [
        'cv_submission_id',
        'skill'
    ];

    public function cvSubmission()
    {
        return $this->belongsTo(CvSubmission::class);
    }
}