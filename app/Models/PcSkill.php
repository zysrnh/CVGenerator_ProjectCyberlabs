<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PcSkill extends Model
{
    use HasFactory;

    protected $table = 'pc_skill';

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