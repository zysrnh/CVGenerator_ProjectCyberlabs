<?php

namespace App\Http\Controllers;

use App\Models\CvSubmission;
use App\Models\WorkExperience;
use App\Models\Education;
use App\Models\Language;
use App\Models\PcSkill;
use App\Models\OtherSkill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CvSubmissionController extends Controller
{
    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            // Validasi data
            $validated = $request->validate([
                'full_name' => 'required|string|max:255',
                'objective' => 'nullable|string',
                'position_applied' => 'nullable|string|max:255',
                'age' => 'nullable|integer',
                'sex' => 'nullable|in:Male,Female',
                'height' => 'nullable|string|max:50',
                'weight' => 'nullable|string|max:50',
                'address' => 'nullable|string',
                'mobile_phone' => 'nullable|string|max:50',
                'email_address' => 'nullable|email|max:255',
                'place_of_birth' => 'nullable|string|max:255',
                'date_of_birth' => 'nullable|date',
                'nationality' => 'nullable|string|max:100',
                'marital_status' => 'nullable|string|max:100',
                'passport_number' => 'nullable|string|max:100',
                'passport_expiry_date' => 'nullable|string|max:100',
                'photo' => 'nullable|string', // base64 image
                'workExperiences' => 'nullable|array',
                'educations' => 'nullable|array',
                'languages' => 'nullable|array',
                'pcSkills' => 'nullable|array',
                'otherSkills' => 'nullable|array',
            ]);

            // Handle photo upload (base64)
            $photoPath = null;
            if ($request->has('photo') && $request->photo) {
                $photoPath = $this->saveBase64Image($request->photo);
            }

            // Simpan data utama CV
            $cvSubmission = CvSubmission::create([
                'full_name' => $validated['full_name'],
                'objective' => $validated['objective'] ?? null,
                'position_applied' => $validated['position_applied'] ?? null,
                'age' => $validated['age'] ?? null,
                'sex' => $validated['sex'] ?? null,
                'height' => $validated['height'] ?? null,
                'weight' => $validated['weight'] ?? null,
                'address' => $validated['address'] ?? null,
                'mobile_phone' => $validated['mobile_phone'] ?? null,
                'email_address' => $validated['email_address'] ?? null,
                'place_of_birth' => $validated['place_of_birth'] ?? null,
                'date_of_birth' => $validated['date_of_birth'] ?? null,
                'nationality' => $validated['nationality'] ?? null,
                'marital_status' => $validated['marital_status'] ?? null,
                'passport_number' => $validated['passport_number'] ?? null,
                'passport_expiry_date' => $validated['passport_expiry_date'] ?? null,
                'photo_path' => $photoPath,
            ]);

            // Simpan work experiences
            if (!empty($validated['workExperiences'])) {
                foreach ($validated['workExperiences'] as $work) {
                    WorkExperience::create([
                        'cv_submission_id' => $cvSubmission->id,
                        'employer' => $work['employer'] ?? null,
                        'position' => $work['position'] ?? null,
                        'start_date' => $work['start_date'] ?? null,
                        'leaving_date' => $work['leaving_date'] ?? null,
                    ]);
                }
            }

            // Simpan educations
            if (!empty($validated['educations'])) {
                foreach ($validated['educations'] as $edu) {
                    Education::create([
                        'cv_submission_id' => $cvSubmission->id,
                        'school' => $edu['school'] ?? null,
                        'study' => $edu['study'] ?? null,
                        'start_date' => $edu['start_date'] ?? null,
                        'graduation_date' => $edu['graduation_date'] ?? null,
                    ]);
                }
            }

            // Simpan languages
            if (!empty($validated['languages'])) {
                foreach ($validated['languages'] as $lang) {
                    if (!empty($lang['name'])) {
                        Language::create([
                            'cv_submission_id' => $cvSubmission->id,
                            'name' => $lang['name'],
                            'level' => $lang['level'] ?? null,
                        ]);
                    }
                }
            }

            // Simpan PC skills
            if (!empty($validated['pcSkills'])) {
                foreach ($validated['pcSkills'] as $skill) {
                    if (!empty($skill['name'])) {
                        PcSkill::create([
                            'cv_submission_id' => $cvSubmission->id,
                            'name' => $skill['name'],
                            'level' => $skill['level'] ?? null,
                        ]);
                    }
                }
            }

            // Simpan other skills
            if (!empty($validated['otherSkills'])) {
                foreach ($validated['otherSkills'] as $skill) {
                    if (!empty($skill)) {
                        OtherSkill::create([
                            'cv_submission_id' => $cvSubmission->id,
                            'skill' => $skill,
                        ]);
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'CV submitted successfully!',
                'data' => $cvSubmission->load([
                    'workExperiences',
                    'educations',
                    'languages',
                    'pcSkills',
                    'otherSkills'
                ])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit CV',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Function untuk save base64 image
    private function saveBase64Image($base64String)
    {
        // Remove data URI scheme if present
        if (preg_match('/^data:image\/(\w+);base64,/', $base64String, $type)) {
            $base64String = substr($base64String, strpos($base64String, ',') + 1);
            $type = strtolower($type[1]); // jpg, png, gif
        } else {
            return null;
        }

        $image = base64_decode($base64String);
        
        if ($image === false) {
            return null;
        }

        $filename = 'cv_photos/' . uniqid() . '.' . $type;
        Storage::disk('public')->put($filename, $image);

        return $filename;
    }

    // Function untuk get semua CV submissions
    public function index()
    {
        $cvSubmissions = CvSubmission::with([
            'workExperiences',
            'educations',
            'languages',
            'pcSkills',
            'otherSkills'
        ])->latest()->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $cvSubmissions
        ]);
    }

    // Function untuk get single CV submission
    public function show($id)
    {
        $cvSubmission = CvSubmission::with([
            'workExperiences',
            'educations',
            'languages',
            'pcSkills',
            'otherSkills'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $cvSubmission
        ]);
    }

    // Function untuk delete CV submission
    public function destroy($id)
    {
        try {
            $cvSubmission = CvSubmission::findOrFail($id);
            
            // Delete photo if exists
            if ($cvSubmission->photo_path) {
                Storage::disk('public')->delete($cvSubmission->photo_path);
            }

            $cvSubmission->delete();

            return response()->json([
                'success' => true,
                'message' => 'CV deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete CV',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}