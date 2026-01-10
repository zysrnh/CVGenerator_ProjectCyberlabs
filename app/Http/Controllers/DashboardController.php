<?php

namespace App\Http\Controllers;

use App\Models\CvSubmission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    /**
     * Display dashboard with CV list
     */
    public function index(Request $request)
    {
        $query = CvSubmission::with([
            'workExperiences',
            'educations',
            'languages',
            'pcSkills',
            'otherSkills'
        ]);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('email_address', 'like', "%{$search}%")
                  ->orWhere('position_applied', 'like', "%{$search}%")
                  ->orWhere('nationality', 'like', "%{$search}%");
            });
        }

        // Filter by position
        if ($request->has('position') && $request->position) {
            $query->where('position_applied', $request->position);
        }

        // Filter by nationality
        if ($request->has('nationality') && $request->nationality) {
            $query->where('nationality', $request->nationality);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $cvSubmissions = $query->paginate(10)->withQueryString();

        // Statistics
        $stats = [
            'total' => CvSubmission::count(),
            'this_month' => CvSubmission::whereMonth('created_at', now()->month)->count(),
            'this_week' => CvSubmission::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'today' => CvSubmission::whereDate('created_at', today())->count(),
        ];

        // Get unique positions and nationalities for filters
        $positions = CvSubmission::distinct()->pluck('position_applied')->filter()->values();
        $nationalities = CvSubmission::distinct()->pluck('nationality')->filter()->values();

        return Inertia::render('Dashboard', [
            'cvSubmissions' => $cvSubmissions,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
                'position' => $request->position,
                'nationality' => $request->nationality,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
            'positions' => $positions,
            'nationalities' => $nationalities,
        ]);
    }

    /**
     * Show CV detail
     */
    public function show($id)
    {
        $cv = CvSubmission::with([
            'workExperiences',
            'educations',
            'languages',
            'pcSkills',
            'otherSkills'
        ])->findOrFail($id);

        return Inertia::render('CVDetail', [
            'cv' => $cv
        ]);
    }

    /**
     * 🆕 Show edit form
     */
    public function edit($id)
    {
        $cv = CvSubmission::with([
            'workExperiences',
            'educations',
            'languages',
            'pcSkills',
            'otherSkills'
        ])->findOrFail($id);

        return Inertia::render('CVEdit', [
            'cv' => $cv
        ]);
    }

  /**
 * 🆕 Update CV - FIXED VERSION
 */
public function update(Request $request, $id)
{
    try {
        $cv = CvSubmission::findOrFail($id);

        // Log incoming data for debugging
        Log::info('Update CV Request', [
            'id' => $id,
            'data' => $request->all()
        ]);

        // ✅ FIX: Ubah validation age
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'objective' => 'nullable|string',
            'position_applied' => 'nullable|string',
            'age' => 'nullable', // ✅ CHANGED: hapus |string
            'sex' => 'nullable|string',
            'height' => 'nullable|string',
            'weight' => 'nullable|string',
            'address' => 'nullable|string',
            'mobile_phone' => 'nullable|string',
            'email_address' => 'nullable|email',
            'place_of_birth' => 'nullable|string',
            'date_of_birth' => 'nullable|string',
            'nationality' => 'nullable|string',
            'marital_status' => 'nullable|string',
            'passport_number' => 'nullable|string',
            'passport_expiry_date' => 'nullable|string',
        ]);

        // ✅ Convert age to string if it exists
        if (isset($validated['age'])) {
            $validated['age'] = (string)$validated['age'];
        }

        // Handle photo upload if provided
        if ($request->has('photo') && $request->photo && strpos($request->photo, 'data:image') === 0) {
            // Delete old photo if exists
            if ($cv->photo_path && Storage::disk('public')->exists($cv->photo_path)) {
                Storage::disk('public')->delete($cv->photo_path);
            }

            // Save new photo (base64)
            $photoData = $request->photo;
            
            // Remove base64 prefix
            $photoData = preg_replace('/^data:image\/\w+;base64,/', '', $photoData);
            $photoData = str_replace(' ', '+', $photoData);
            
            $photoName = 'cv_photos/' . uniqid() . '_' . time() . '.png';
            Storage::disk('public')->put($photoName, base64_decode($photoData));
            $validated['photo_path'] = $photoName;
        }

        // Update CV basic info
        $cv->update($validated);

        // 🔥 Update Work Experiences
        $cv->workExperiences()->delete();
        if ($request->has('workExperiences') && is_array($request->workExperiences)) {
            foreach ($request->workExperiences as $work) {
                if (is_array($work) && (!empty($work['employer']) || !empty($work['position']))) {
                    $cv->workExperiences()->create([
                        'employer' => $work['employer'] ?? '',
                        'position' => $work['position'] ?? '',
                        'start_date' => $work['start_date'] ?? '',
                        'leaving_date' => $work['leaving_date'] ?? '',
                    ]);
                }
            }
        }

        // 🔥 Update Educations
        $cv->educations()->delete();
        if ($request->has('educations') && is_array($request->educations)) {
            foreach ($request->educations as $edu) {
                if (is_array($edu) && (!empty($edu['school']) || !empty($edu['study']))) {
                    $cv->educations()->create([
                        'school' => $edu['school'] ?? '',
                        'study' => $edu['study'] ?? '',
                        'start_date' => $edu['start_date'] ?? '',
                        'graduation_date' => $edu['graduation_date'] ?? '',
                    ]);
                }
            }
        }

        // 🔥 Update Languages
        $cv->languages()->delete();
        if ($request->has('languages') && is_array($request->languages)) {
            foreach ($request->languages as $lang) {
                if (is_array($lang) && !empty($lang['name'])) {
                    $cv->languages()->create([
                        'name' => $lang['name'],
                        'level' => $lang['level'] ?? '',
                    ]);
                }
            }
        }

        // 🔥 Update PC Skills
        $cv->pcSkills()->delete();
        if ($request->has('pcSkills') && is_array($request->pcSkills)) {
            foreach ($request->pcSkills as $skill) {
                if (is_array($skill) && !empty($skill['name'])) {
                    $cv->pcSkills()->create([
                        'name' => $skill['name'],
                        'level' => $skill['level'] ?? '',
                    ]);
                }
            }
        }

        // 🔥 Update Other Skills
        $cv->otherSkills()->delete();
        if ($request->has('otherSkills') && is_array($request->otherSkills)) {
            foreach ($request->otherSkills as $skill) {
                if (!empty($skill) && is_string($skill)) {
                    $cv->otherSkills()->create(['skill' => trim($skill)]);
                }
            }
        }

        Log::info('CV Updated Successfully', ['id' => $id]);

        // Return success response for Inertia
        return redirect()->route('dashboard.show', $id)->with('success', 'CV updated successfully!');

    } catch (\Exception $e) {
        Log::error('CV Update Failed', [
            'id' => $id,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        return back()->withErrors(['error' => 'Failed to update CV: ' . $e->getMessage()]);
    }
}
    public function destroy($id)
    {
        try {
            $cv = CvSubmission::findOrFail($id);
            
            // Delete photo if exists
            if ($cv->photo_path && Storage::disk('public')->exists($cv->photo_path)) {
                Storage::disk('public')->delete($cv->photo_path);
            }
            
            $cv->delete();
            
            return redirect()->route('dashboard')->with('success', 'CV deleted successfully!');
        } catch (\Exception $e) {
            Log::error('CV Delete Failed', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return back()->withErrors(['error' => 'Failed to delete CV']);
        }
    }
}