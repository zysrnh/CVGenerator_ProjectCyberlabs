<?php

namespace App\Http\Controllers;

use App\Models\CvSubmissionKorea;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CvSubmissionKoreaController extends Controller
{
    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'full_name'            => 'required|string|max:255',
                'korean_name'          => 'nullable|string|max:255',
                'date_of_birth'        => 'nullable|date',
                'gender'               => 'nullable|in:male,female',
                'address'              => 'nullable|string',
                'id_number'            => 'nullable|string|max:20',
                'nationality'          => 'nullable|string|max:100',
                'religion'             => 'nullable|string|max:100',
                'height'               => 'nullable|numeric',
                'weight'               => 'nullable|numeric',
                'vision'               => 'nullable|string|max:20',
                'dominant_hand'        => 'nullable|in:right,left',
                'tattoo'               => 'nullable|boolean',
                'surgery'              => 'nullable|boolean',
                'marital_status'       => 'nullable|in:single,married,divorced,widowed',
                'father_name'          => 'nullable|string|max:255',
                'father_birth_year'    => 'nullable|string|max:10',
                'father_occupation'    => 'nullable|string|max:255',
                'father_phone'         => 'nullable|string|max:50',
                'mother_name'          => 'nullable|string|max:255',
                'mother_birth_year'    => 'nullable|string|max:10',
                'mother_occupation'    => 'nullable|string|max:255',
                'mother_phone'         => 'nullable|string|max:50',
                'spouse_name'          => 'nullable|string|max:255',
                'spouse_birth_year'    => 'nullable|string|max:10',
                'spouse_occupation'    => 'nullable|string|max:255',
                'spouse_phone'         => 'nullable|string|max:50',
                'children_count'       => 'nullable|integer|min:0',
                'eldest_age'           => 'nullable|string|max:20',
                'youngest_age'         => 'nullable|string|max:20',
                'education_level'      => 'nullable|in:elementary,middle,highschool,diploma,bachelor',
                'school_name'          => 'nullable|string|max:255',
                'school_address'       => 'nullable|string|max:255',
                'has_seafaring_exp'    => 'nullable|boolean',
                'ship_experiences'     => 'nullable|array',
                'pushups'              => 'nullable|integer',
                'situps'               => 'nullable|integer',
                'right_balance'        => 'nullable|string|max:30',
                'forward_bend'         => 'nullable|string|max:30',
                'backward_bend'        => 'nullable|string|max:30',
                'hanging_seconds'      => 'nullable|numeric',
                'right_grip'           => 'nullable|numeric',
                'left_grip'            => 'nullable|numeric',
                'horse_stance_seconds' => 'nullable|numeric',
                'photo'                => 'nullable|string',
                'wajah'                => 'nullable|string',
                'tangan'               => 'nullable|string',
                'badan'                => 'nullable|string',
                'physPhotos'           => 'nullable|array',
            ]);

            // Handle physPhotos nested object from import generator
            if ($request->has('physPhotos') && is_array($request->physPhotos)) {
                foreach (['wajah', 'tangan', 'badan'] as $k) {
                    if (!empty($request->physPhotos[$k]) && !$request->filled($k)) {
                        $request->merge([$k => $request->physPhotos[$k]]);
                    }
                }
            }

            $paths = [];
            foreach (['photo', 'wajah', 'tangan', 'badan'] as $imgField) {
                if ($request->filled($imgField)) {
                    $paths[$imgField . '_path'] = $this->saveBase64Image($request->$imgField);
                }
            }

            $cv = CvSubmissionKorea::create(array_merge(
                collect($validated)->except(['ship_experiences', 'photo', 'wajah', 'tangan', 'badan', 'physPhotos'])->toArray(),
                $paths
            ));

            if (!empty($validated['ship_experiences'])) {
                foreach ($validated['ship_experiences'] as $ship) {
                    if (!empty($ship['ship_name'])) {
                        $cv->shipExperiences()->create([
                            'ship_name'        => $ship['ship_name'] ?? null,
                            'period'           => $ship['period'] ?? null,
                            'ship_nationality' => $ship['ship_nationality'] ?? null,
                            'type'             => $ship['type'] ?? null,
                        ]);
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'CV Korea submitted successfully!',
                'data'    => $cv->load('shipExperiences'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit CV Korea',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    private function saveBase64Image(string $base64): ?string
    {
        if (!preg_match('/^data:image\/(\w+);base64,/', $base64, $type)) return null;
        $data = base64_decode(substr($base64, strpos($base64, ',') + 1));
        if (!$data) return null;
        $filename = 'cv_photos_korea/' . uniqid() . '.' . strtolower($type[1]);
        Storage::disk('public')->put($filename, $data);
        return $filename;
    }

    public function destroy($id)
    {
        try {
            $cv = CvSubmissionKorea::findOrFail($id);
            if ($cv->photo_path) Storage::disk('public')->delete($cv->photo_path);
            $cv->delete();
            return response()->json(['success' => true, 'message' => 'CV deleted']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}