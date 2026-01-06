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
use Illuminate\Support\Facades\Log;

class CVImportController extends Controller
{
    /**
     * Store CV data from Excel import
     */
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
                'sex' => 'nullable|string|max:50',
                'height' => 'nullable|string|max:50',
                'weight' => 'nullable|string|max:50',
                'address' => 'nullable|string',
                'mobile_phone' => 'nullable|string|max:50',
                'email_address' => 'nullable|email|max:255',
                'place_of_birth' => 'nullable|string|max:255',
                'date_of_birth' => 'nullable|string|max:100',
                'nationality' => 'nullable|string|max:100',
                'marital_status' => 'nullable|string|max:100',
                'passport_number' => 'nullable|string|max:100',
                'passport_expiry_date' => 'nullable|string|max:100',
                'photo' => 'nullable|string', // base64 image
                'workExperiences' => 'nullable|array',
                'workExperiences.*.employer' => 'nullable|string',
                'workExperiences.*.position' => 'nullable|string',
                'workExperiences.*.start_date' => 'nullable|string',
                'workExperiences.*.leaving_date' => 'nullable|string',
                'educations' => 'nullable|array',
                'educations.*.school' => 'nullable|string',
                'educations.*.study' => 'nullable|string',
                'educations.*.start_date' => 'nullable|string',
                'educations.*.graduation_date' => 'nullable|string',
                'languages' => 'nullable|array',
                'languages.*.name' => 'nullable|string',
                'languages.*.level' => 'nullable|string',
                'pcSkills' => 'nullable|array',
                'pcSkills.*.name' => 'nullable|string',
                'pcSkills.*.level' => 'nullable|string',
                'otherSkills' => 'nullable|array',
            ]);

            // Handle photo upload (base64)
            $photoPath = null;
            if (!empty($validated['photo'])) {
                $photoPath = $this->saveBase64Image($validated['photo']);
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
                    if (!empty($work['employer'])) {
                        WorkExperience::create([
                            'cv_submission_id' => $cvSubmission->id,
                            'employer' => $work['employer'] ?? null,
                            'position' => $work['position'] ?? null,
                            'start_date' => $work['start_date'] ?? null,
                            'leaving_date' => $work['leaving_date'] ?? null,
                        ]);
                    }
                }
            }

            // Simpan educations
            if (!empty($validated['educations'])) {
                foreach ($validated['educations'] as $edu) {
                    if (!empty($edu['school'])) {
                        Education::create([
                            'cv_submission_id' => $cvSubmission->id,
                            'school' => $edu['school'] ?? null,
                            'study' => $edu['study'] ?? null,
                            'start_date' => $edu['start_date'] ?? null,
                            'graduation_date' => $edu['graduation_date'] ?? null,
                        ]);
                    }
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
                    if (!empty($skill['name']) && !empty($skill['level'])) {
                        PcSkill::create([
                            'cv_submission_id' => $cvSubmission->id,
                            'name' => $skill['name'],
                            'level' => $skill['level'],
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
                            'skill' => is_string($skill) ? $skill : ($skill['skill'] ?? ''),
                        ]);
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'CV from Excel imported successfully!',
                'data' => [
                    'id' => $cvSubmission->id,
                    'full_name' => $cvSubmission->full_name,
                ]
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('CV Import Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to import CV',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save base64 image to storage
     */
    private function saveBase64Image($base64String)
    {
        try {
            // Remove data URI scheme if present
            if (preg_match('/^data:image\/(\w+);base64,/', $base64String, $type)) {
                $base64String = substr($base64String, strpos($base64String, ',') + 1);
                $type = strtolower($type[1]); // jpg, png, gif
            } else {
                // If no data URI, assume it's already base64
                $type = 'png';
            }

            $image = base64_decode($base64String);
            
            if ($image === false) {
                return null;
            }

            // Generate unique filename
            $filename = 'cv_photos/' . uniqid() . '_' . time() . '.' . $type;
            
            // Save to storage
            Storage::disk('public')->put($filename, $image);

            return $filename;

        } catch (\Exception $e) {
            Log::error('Image save error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Bulk import multiple CVs
     */
    public function bulkStore(Request $request)
    {
        try {
            $cvs = $request->validate([
                'cvs' => 'required|array',
                'cvs.*' => 'required|array',
            ]);

            $results = [
                'success' => [],
                'failed' => [],
            ];

            foreach ($cvs['cvs'] as $index => $cvData) {
                try {
                    $result = $this->storeSingle($cvData);
                    $results['success'][] = [
                        'index' => $index,
                        'name' => $cvData['full_name'] ?? 'Unknown',
                        'id' => $result->id
                    ];
                } catch (\Exception $e) {
                    $results['failed'][] = [
                        'index' => $index,
                        'name' => $cvData['full_name'] ?? 'Unknown',
                        'error' => $e->getMessage()
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Bulk import completed',
                'results' => $results,
                'summary' => [
                    'total' => count($cvs['cvs']),
                    'success' => count($results['success']),
                    'failed' => count($results['failed'])
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bulk import failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store single CV (helper method for bulk)
     */
    private function storeSingle($data)
    {
        DB::beginTransaction();

        try {
            $photoPath = null;
            if (!empty($data['photo'])) {
                $photoPath = $this->saveBase64Image($data['photo']);
            }

            $cvSubmission = CvSubmission::create([
                'full_name' => $data['full_name'] ?? null,
                'objective' => $data['objective'] ?? null,
                'position_applied' => $data['position_applied'] ?? null,
                'age' => $data['age'] ?? null,
                'sex' => $data['sex'] ?? null,
                'height' => $data['height'] ?? null,
                'weight' => $data['weight'] ?? null,
                'address' => $data['address'] ?? null,
                'mobile_phone' => $data['mobile_phone'] ?? null,
                'email_address' => $data['email_address'] ?? null,
                'place_of_birth' => $data['place_of_birth'] ?? null,
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'nationality' => $data['nationality'] ?? null,
                'marital_status' => $data['marital_status'] ?? null,
                'passport_number' => $data['passport_number'] ?? null,
                'passport_expiry_date' => $data['passport_expiry_date'] ?? null,
                'photo_path' => $photoPath,
            ]);

            // Work experiences
            if (!empty($data['workExperiences'])) {
                foreach ($data['workExperiences'] as $work) {
                    if (!empty($work['employer'])) {
                        WorkExperience::create([
                            'cv_submission_id' => $cvSubmission->id,
                            'employer' => $work['employer'] ?? null,
                            'position' => $work['position'] ?? null,
                            'start_date' => $work['start_date'] ?? null,
                            'leaving_date' => $work['leaving_date'] ?? null,
                        ]);
                    }
                }
            }

            // Educations
            if (!empty($data['educations'])) {
                foreach ($data['educations'] as $edu) {
                    if (!empty($edu['school'])) {
                        Education::create([
                            'cv_submission_id' => $cvSubmission->id,
                            'school' => $edu['school'] ?? null,
                            'study' => $edu['study'] ?? null,
                            'start_date' => $edu['start_date'] ?? null,
                            'graduation_date' => $edu['graduation_date'] ?? null,
                        ]);
                    }
                }
            }

            // Languages
            if (!empty($data['languages'])) {
                foreach ($data['languages'] as $lang) {
                    if (!empty($lang['name'])) {
                        Language::create([
                            'cv_submission_id' => $cvSubmission->id,
                            'name' => $lang['name'],
                            'level' => $lang['level'] ?? null,
                        ]);
                    }
                }
            }

            // PC Skills
            if (!empty($data['pcSkills'])) {
                foreach ($data['pcSkills'] as $skill) {
                    if (!empty($skill['name']) && !empty($skill['level'])) {
                        PcSkill::create([
                            'cv_submission_id' => $cvSubmission->id,
                            'name' => $skill['name'],
                            'level' => $skill['level'],
                        ]);
                    }
                }
            }

            // Other Skills
            if (!empty($data['otherSkills'])) {
                foreach ($data['otherSkills'] as $skill) {
                    if (!empty($skill)) {
                        OtherSkill::create([
                            'cv_submission_id' => $cvSubmission->id,
                            'skill' => is_string($skill) ? $skill : ($skill['skill'] ?? ''),
                        ]);
                    }
                }
            }

            DB::commit();
            return $cvSubmission;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}