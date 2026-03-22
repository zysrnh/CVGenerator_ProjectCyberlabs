<?php

namespace App\Http\Controllers;

use App\Models\CvSubmission;
use App\Models\CvSubmissionSlokavia;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $tab = $request->get('tab', 'turki');

        if ($tab === 'slokavia') {
            $query = CvSubmissionSlokavia::with([
                'workExperiences',
                'educations',
                'languages',
                'certifications',
                'skills',
            ]);

            if ($request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('full_name', 'like', "%{$search}%")
                      ->orWhere('email_address', 'like', "%{$search}%")
                      ->orWhere('nationality', 'like', "%{$search}%");
                });
            }

            if ($request->nationality) {
                $query->where('nationality', $request->nationality);
            }

            $sortBy    = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            $cvSubmissions = $query->paginate(10)->withQueryString();

            $stats = [
                'total'      => CvSubmissionSlokavia::count(),
                'this_month' => CvSubmissionSlokavia::whereMonth('created_at', now()->month)->count(),
                'this_week'  => CvSubmissionSlokavia::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                'today'      => CvSubmissionSlokavia::whereDate('created_at', today())->count(),
            ];

            $positions     = collect();
            $nationalities = CvSubmissionSlokavia::distinct()->pluck('nationality')->filter()->values();

        } elseif ($tab === 'korea') {
            $query = \App\Models\CvSubmissionKorea::with([
                'shipExperiences',
            ]);

            if ($request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('full_name', 'like', "%{$search}%")
                      ->orWhere('id_number', 'like', "%{$search}%")
                      ->orWhere('nationality', 'like', "%{$search}%");
                });
            }

            if ($request->nationality) {
                $query->where('nationality', $request->nationality);
            }

            $sortBy    = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            $cvSubmissions = $query->paginate(10)->withQueryString();

            $stats = [
                'total'      => \App\Models\CvSubmissionKorea::count(),
                'this_month' => \App\Models\CvSubmissionKorea::whereMonth('created_at', now()->month)->count(),
                'this_week'  => \App\Models\CvSubmissionKorea::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                'today'      => \App\Models\CvSubmissionKorea::whereDate('created_at', today())->count(),
            ];

            $positions     = collect();
            $nationalities = \App\Models\CvSubmissionKorea::distinct()->pluck('nationality')->filter()->values();

        } else {
            $query = CvSubmission::with([
                'workExperiences',
                'educations',
                'languages',
                'pcSkills',
                'otherSkills',
            ]);

            if ($request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('full_name', 'like', "%{$search}%")
                      ->orWhere('email_address', 'like', "%{$search}%")
                      ->orWhere('position_applied', 'like', "%{$search}%")
                      ->orWhere('nationality', 'like', "%{$search}%");
                });
            }

            if ($request->position) {
                $query->where('position_applied', $request->position);
            }

            if ($request->nationality) {
                $query->where('nationality', $request->nationality);
            }

            $sortBy    = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            $cvSubmissions = $query->paginate(10)->withQueryString();

            $stats = [
                'total'      => CvSubmission::count(),
                'this_month' => CvSubmission::whereMonth('created_at', now()->month)->count(),
                'this_week'  => CvSubmission::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                'today'      => CvSubmission::whereDate('created_at', today())->count(),
            ];

            $positions     = CvSubmission::distinct()->pluck('position_applied')->filter()->values();
            $nationalities = CvSubmission::distinct()->pluck('nationality')->filter()->values();
        }

        return Inertia::render('Dashboard', [
            'cvSubmissions' => $cvSubmissions,
            'stats'         => $stats,
            'filters'       => [
                'search'      => $request->search,
                'position'    => $request->position,
                'nationality' => $request->nationality,
                'sort_by'     => $sortBy,
                'sort_order'  => $sortOrder,
                'tab'         => $tab,
            ],
            'positions'     => $positions,
            'nationalities' => $nationalities,
            'activeTab'     => $tab,
        ]);
    }

    public function show($id)
    {
        $cv = CvSubmission::with([
            'workExperiences',
            'educations',
            'languages',
            'pcSkills',
            'otherSkills',
        ])->findOrFail($id);

        return Inertia::render('CVDetail', ['cv' => $cv]);
    }

    public function showSlokavia($id)
    {
        $cv = CvSubmissionSlokavia::with([
            'workExperiences',
            'educations',
            'languages',
            'certifications',
            'skills',
        ])->findOrFail($id);

        return Inertia::render('CVDetailSlokavia', ['cv' => $cv]);
    }

    public function showKorea($id)
    {
        $cv = \App\Models\CvSubmissionKorea::with([
            'shipExperiences',
        ])->findOrFail($id);

        return Inertia::render('CVDetailKorea', ['cv' => $cv]);
    }

    
    public function editSlokavia($id)
    {
        $cv = CvSubmissionSlokavia::with([
            'workExperiences',
            'educations',
            'languages',
            'certifications',
            'skills',
        ])->findOrFail($id);

        return Inertia::render('CVEditSlokavia', ['cv' => $cv]);
    }

    public function updateSlokavia(Request $request, $id)
    {
        try {
            $cv = CvSubmissionSlokavia::findOrFail($id);
            Log::info('Update Slokavia CV', ['id' => $id]);
            
            // Clean relations
            $cv->workExperiences()->delete();
            $cv->educations()->delete();
            $cv->languages()->delete();
            $cv->certifications()->delete();
            $cv->skills()->delete();

            $data = $request->except(['workExperiences', 'educations', 'languages', 'certifications', 'skills', '_method', 'photo']);

            if ($request->has('photo') && $request->photo && strpos($request->photo, 'data:image') === 0) {
                if ($cv->photo_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($cv->photo_path)) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($cv->photo_path);
                }
                $photoData = preg_replace('/^data:image\/\w+;base64,/', '', $request->photo);
                $photoData = str_replace(' ', '+', $photoData);
                $photoName = 'cv_photos_slokavia/' . uniqid() . '_' . time() . '.png';
                \Illuminate\Support\Facades\Storage::disk('public')->put($photoName, base64_decode($photoData));
                $data['photo_path'] = $photoName;
            }

            // Store new ones
            $cv->update($data);

            if (!empty($request->workExperiences)) {
                foreach ($request->workExperiences as $work) {
                    $cv->workExperiences()->create([
                        'employer' => $work['employer'] ?? '',
                        'position' => $work['position'] ?? '',
                        'start_date' => $work['start_date'] ?? '',
                        'leaving_date' => $work['leaving_date'] ?? '',
                        'responsibilities' => isset($work['responsibilities']) && is_array($work['responsibilities']) ? implode('||', $work['responsibilities']) : '',
                    ]);
                }
            }

            if (!empty($request->educations)) {
                foreach ($request->educations as $edu) {
                    $cv->educations()->create([
                        'school' => $edu['school'] ?? '',
                        'field_of_study' => $edu['field_of_study'] ?? '',
                        'start_date' => $edu['start_date'] ?? '',
                        'graduation_date' => $edu['graduation_date'] ?? '',
                    ]);
                }
            }

            if (!empty($request->languages)) {
                foreach ($request->languages as $lang) {
                    if (!empty($lang['name'])) {
                        $cv->languages()->create([
                            'name' => $lang['name'],
                            'listening' => $lang['listening'] ?? '',
                            'reading' => $lang['reading'] ?? '',
                            'spoken_production' => $lang['spoken_production'] ?? '',
                            'spoken_interaction' => $lang['spoken_interaction'] ?? '',
                            'writing' => $lang['writing'] ?? '',
                        ]);
                    }
                }
            }

            if (!empty($request->certifications)) {
                foreach ($request->certifications as $cert) {
                    if (!empty($cert['title'])) {
                        $cv->certifications()->create([
                            'year' => $cert['year'] ?? '',
                            'title' => $cert['title'],
                            'description' => $cert['description'] ?? '',
                            'mode' => $cert['mode'] ?? '',
                        ]);
                    }
                }
            }

            if (!empty($request->skills)) {
                foreach ($request->skills as $skill) {
                    if (!empty($skill)) {
                        $cv->skills()->create(['skill' => $skill]);
                    }
                }
            }

            return redirect()->route('dashboard.slokavia.edit', $id)->with('success', 'CV Slokavia updated successfully!');
        } catch (\Exception $e) {
            Log::error('Update Slokavia failed', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Gagal update']);
        }
    }

    public function editKorea($id)
    {
        $cv = \App\Models\CvSubmissionKorea::with(['shipExperiences'])->findOrFail($id);
        return Inertia::render('CVEditKorea', ['cv' => $cv]);
    }

    public function updateKorea(Request $request, $id)
    {
        try {
            $cv = \App\Models\CvSubmissionKorea::findOrFail($id);
            
            $data = $request->except(['ship_experiences', 'photo', 'wajah', 'tangan', 'badan', 'logo', '_method']);
            
            if ($request->has('photo') && $request->photo && strpos($request->photo, 'data:image') === 0) {
                if ($cv->photo_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($cv->photo_path)) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($cv->photo_path);
                }
                $photoData = preg_replace('/^data:image\/\w+;base64,/', '', $request->photo);
                $photoData = str_replace(' ', '+', $photoData);
                $photoName = 'cv_photos_korea/' . uniqid() . '_' . time() . '.png';
                \Illuminate\Support\Facades\Storage::disk('public')->put($photoName, base64_decode($photoData));
                $data['photo_path'] = $photoName;
            }

            foreach (['wajah', 'tangan', 'badan'] as $phys) {
                if ($request->has($phys) && $request->$phys && strpos($request->$phys, 'data:image') === 0) {
                    $pathField = $phys . '_path';
                    if ($cv->$pathField && \Illuminate\Support\Facades\Storage::disk('public')->exists($cv->$pathField)) {
                        \Illuminate\Support\Facades\Storage::disk('public')->delete($cv->$pathField);
                    }
                    $physData = preg_replace('/^data:image\/\w+;base64,/', '', $request->$phys);
                    $physData = str_replace(' ', '+', $physData);
                    $physName = 'cv_photos_korea/' . $phys . '_' . uniqid() . '_' . time() . '.png';
                    \Illuminate\Support\Facades\Storage::disk('public')->put($physName, base64_decode($physData));
                    $data[$pathField] = $physName;
                }
            }

            $cv->update($data);

            $cv->shipExperiences()->delete();
            if (!empty($request->ship_experiences)) {
                foreach ($request->ship_experiences as $ship) {
                    if (!empty($ship['ship_name'])) {
                        $cv->shipExperiences()->create([
                            'ship_name' => $ship['ship_name'],
                            'period' => $ship['period'] ?? '',
                            'ship_nationality' => $ship['ship_nationality'] ?? '',
                            'type' => $ship['type'] ?? '',
                        ]);
                    }
                }
            }

            return redirect()->route('dashboard.korea.edit', $id)->with('success', 'CV Korea updated successfully!');
        } catch (\Exception $e) {
            Log::error('Update Korea failed', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Gagal update']);
        }
    }

    public function edit($id)
    {
        $cv = CvSubmission::with([
            'workExperiences',
            'educations',
            'languages',
            'pcSkills',
            'otherSkills',
        ])->findOrFail($id);

        return Inertia::render('CVEdit', ['cv' => $cv]);
    }

    public function update(Request $request, $id)
    {
        try {
            $cv = CvSubmission::findOrFail($id);

            Log::info('Update CV Request', ['id' => $id, 'data' => $request->all()]);

            $validated = $request->validate([
                'full_name'            => 'required|string|max:255',
                'objective'            => 'nullable|string',
                'position_applied'     => 'nullable|string',
                'age'                  => 'nullable',
                'sex'                  => 'nullable|string',
                'height'               => 'nullable|string',
                'weight'               => 'nullable|string',
                'address'              => 'nullable|string',
                'mobile_phone'         => 'nullable|string',
                'email_address'        => 'nullable|email',
                'place_of_birth'       => 'nullable|string',
                'date_of_birth'        => 'nullable|string',
                'nationality'          => 'nullable|string',
                'marital_status'       => 'nullable|string',
                'passport_number'      => 'nullable|string',
                'passport_expiry_date' => 'nullable|string',
            ]);

            if (isset($validated['age'])) {
                $validated['age'] = (string) $validated['age'];
            }

            if ($request->has('photo') && $request->photo && strpos($request->photo, 'data:image') === 0) {
                if ($cv->photo_path && Storage::disk('public')->exists($cv->photo_path)) {
                    Storage::disk('public')->delete($cv->photo_path);
                }
                $photoData = preg_replace('/^data:image\/\w+;base64,/', '', $request->photo);
                $photoData = str_replace(' ', '+', $photoData);
                $photoName = 'cv_photos/' . uniqid() . '_' . time() . '.png';
                Storage::disk('public')->put($photoName, base64_decode($photoData));
                $validated['photo_path'] = $photoName;
            }

            $cv->update($validated);

            $cv->workExperiences()->delete();
            if ($request->has('workExperiences') && is_array($request->workExperiences)) {
                foreach ($request->workExperiences as $work) {
                    if (!empty($work['employer']) || !empty($work['position'])) {
                        $cv->workExperiences()->create([
                            'employer'     => $work['employer'] ?? '',
                            'position'     => $work['position'] ?? '',
                            'start_date'   => $work['start_date'] ?? '',
                            'leaving_date' => $work['leaving_date'] ?? '',
                        ]);
                    }
                }
            }

            $cv->educations()->delete();
            if ($request->has('educations') && is_array($request->educations)) {
                foreach ($request->educations as $edu) {
                    if (!empty($edu['school']) || !empty($edu['study'])) {
                        $cv->educations()->create([
                            'school'          => $edu['school'] ?? '',
                            'study'           => $edu['study'] ?? '',
                            'start_date'      => $edu['start_date'] ?? '',
                            'graduation_date' => $edu['graduation_date'] ?? '',
                        ]);
                    }
                }
            }

            $cv->languages()->delete();
            if ($request->has('languages') && is_array($request->languages)) {
                foreach ($request->languages as $lang) {
                    if (!empty($lang['name'])) {
                        $cv->languages()->create([
                            'name'  => $lang['name'],
                            'level' => $lang['level'] ?? '',
                        ]);
                    }
                }
            }

            $cv->pcSkills()->delete();
            if ($request->has('pcSkills') && is_array($request->pcSkills)) {
                foreach ($request->pcSkills as $skill) {
                    if (!empty($skill['name'])) {
                        $cv->pcSkills()->create([
                            'name'  => $skill['name'],
                            'level' => $skill['level'] ?? '',
                        ]);
                    }
                }
            }

            $cv->otherSkills()->delete();
            if ($request->has('otherSkills') && is_array($request->otherSkills)) {
                foreach ($request->otherSkills as $skill) {
                    if (!empty($skill) && is_string($skill)) {
                        $cv->otherSkills()->create(['skill' => trim($skill)]);
                    }
                }
            }

            return redirect()->route('dashboard.edit', $id)->with('success', 'CV updated successfully!');

        } catch (\Exception $e) {
            Log::error('CV Update Failed', ['id' => $id, 'error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Failed to update CV: ' . $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        try {
            $cv = CvSubmission::findOrFail($id);
            if ($cv->photo_path && Storage::disk('public')->exists($cv->photo_path)) {
                Storage::disk('public')->delete($cv->photo_path);
            }
            $cv->delete();
            return redirect('/dashboard')->with('success', 'CV deleted successfully!');
        } catch (\Exception $e) {
            Log::error('CV Delete Failed', ['id' => $id, 'error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Failed to delete CV']);
        }
    }
}