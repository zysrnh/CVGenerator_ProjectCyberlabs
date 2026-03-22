<?php

namespace App\Http\Controllers;

use App\Models\CvSubmissionSlokavia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CvSubmissionSlokviaController extends Controller
{
    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'full_name'           => 'required|string|max:255',
                'about_me'            => 'nullable|string',
                'destination_country' => 'nullable|string|max:255',
                'date_of_birth'       => 'nullable|date',
                'place_of_birth'      => 'nullable|string|max:255',
                'nationality'         => 'nullable|string|max:100',
                'gender'              => 'nullable|in:Male,Female',
                'address'             => 'nullable|string',
                'mobile_phone'        => 'nullable|string|max:50',
                'email_address'       => 'nullable|email|max:255',
                'mother_tongue'       => 'nullable|string|max:100',
                'photo'               => 'nullable|string', // base64
                'workExperiences'     => 'nullable|array',
                'educations'          => 'nullable|array',
                'languages'           => 'nullable|array',
                'certifications'      => 'nullable|array',
                'skills'              => 'nullable|array',
            ]);

            // Handle photo upload (base64)
            $photoPath = null;
            if ($request->has('photo') && $request->photo) {
                $photoPath = $this->saveBase64Image($request->photo);
            }

            // Simpan data utama
            $cv = CvSubmissionSlokavia::create([
                'full_name'           => $validated['full_name'],
                'about_me'            => $validated['about_me'] ?? null,
                'destination_country' => $validated['destination_country'] ?? null,
                'date_of_birth'       => $validated['date_of_birth'] ?? null,
                'place_of_birth'      => $validated['place_of_birth'] ?? null,
                'nationality'         => $validated['nationality'] ?? null,
                'gender'              => $validated['gender'] ?? null,
                'address'             => $validated['address'] ?? null,
                'mobile_phone'        => $validated['mobile_phone'] ?? null,
                'email_address'       => $validated['email_address'] ?? null,
                'mother_tongue'       => $validated['mother_tongue'] ?? null,
                'photo_path'          => $photoPath,
            ]);

            // Work experiences (dengan responsibilities)
            if (!empty($validated['workExperiences'])) {
                foreach ($validated['workExperiences'] as $work) {
                    $responsibilities = '';
                    if (!empty($work['responsibilities']) && is_array($work['responsibilities'])) {
                        $responsibilities = implode('||', array_filter($work['responsibilities']));
                    }
                    $cv->workExperiences()->create([
                        'employer'         => $work['employer'] ?? null,
                        'position'         => $work['position'] ?? null,
                        'start_date'       => $work['start_date'] ?? null,
                        'leaving_date'     => $work['leaving_date'] ?? null,
                        'responsibilities' => $responsibilities,
                    ]);
                }
            }

            // Educations
            if (!empty($validated['educations'])) {
                foreach ($validated['educations'] as $edu) {
                    $cv->educations()->create([
                        'school'          => $edu['school'] ?? null,
                        'field_of_study'  => $edu['field_of_study'] ?? null,
                        'start_date'      => $edu['start_date'] ?? null,
                        'graduation_date' => $edu['graduation_date'] ?? null,
                    ]);
                }
            }

            // Languages (CEFR)
            if (!empty($validated['languages'])) {
                foreach ($validated['languages'] as $lang) {
                    if (!empty($lang['name'])) {
                        $cv->languages()->create([
                            'name'                => $lang['name'],
                            'listening'           => $lang['listening'] ?? null,
                            'reading'             => $lang['reading'] ?? null,
                            'spoken_production'   => $lang['spoken_production'] ?? null,
                            'spoken_interaction'  => $lang['spoken_interaction'] ?? null,
                            'writing'             => $lang['writing'] ?? null,
                        ]);
                    }
                }
            }

            // Certifications
            if (!empty($validated['certifications'])) {
                foreach ($validated['certifications'] as $cert) {
                    if (!empty($cert['title'])) {
                        $cv->certifications()->create([
                            'year'        => $cert['year'] ?? null,
                            'title'       => $cert['title'],
                            'description' => $cert['description'] ?? null,
                            'mode'        => $cert['mode'] ?? null,
                        ]);
                    }
                }
            }

            // Skills
            if (!empty($validated['skills'])) {
                foreach ($validated['skills'] as $skill) {
                    if (!empty($skill)) {
                        $cv->skills()->create([
                            'skill' => $skill,
                        ]);
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'CV Slokavia submitted successfully!',
                'data'    => $cv->load([
                    'workExperiences',
                    'educations',
                    'languages',
                    'certifications',
                    'skills',
                ])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit CV',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    private function saveBase64Image($base64String)
    {
        if (preg_match('/^data:image\/(\w+);base64,/', $base64String, $type)) {
            $base64String = substr($base64String, strpos($base64String, ',') + 1);
            $type = strtolower($type[1]);
        } else {
            return null;
        }

        $image = base64_decode($base64String);
        if ($image === false) return null;

        $filename = 'cv_photos_slokavia/' . uniqid() . '.' . $type;
        Storage::disk('public')->put($filename, $image);

        return $filename;
    }

    public function destroy($id)
    {
        try {
            $cv = CvSubmissionSlokavia::findOrFail($id);
            if ($cv->photo_path) {
                Storage::disk('public')->delete($cv->photo_path);
            }
            $cv->delete();

            return response()->json([
                'success' => true,
                'message' => 'CV deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete CV',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}