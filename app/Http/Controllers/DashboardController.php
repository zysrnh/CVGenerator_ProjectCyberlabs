<?php

namespace App\Http\Controllers;

use App\Models\CvSubmission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
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
}