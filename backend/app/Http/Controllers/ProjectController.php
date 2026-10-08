<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $projects = $request->user()
            ->projects()
            ->withCount('tasks')
            ->latest()
            ->get();

        return response()->json(['projects' => $projects]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'in:active,completed,archived'],
        ]);

        $project = $request->user()->projects()->create($data);

        return response()->json(['project' => $project], 201);
    }

    public function show(Request $request, Project $project): JsonResponse
    {
        $this->authorizeOwner($request, $project);

        return response()->json(['project' => $project->load('tasks')]);
    }

    public function update(Request $request, Project $project): JsonResponse
    {
        $this->authorizeOwner($request, $project);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'in:active,completed,archived'],
        ]);

        $project->update($data);

        return response()->json(['project' => $project]);
    }

    public function destroy(Request $request, Project $project): JsonResponse
    {
        $this->authorizeOwner($request, $project);

        $project->delete();

        return response()->json(['message' => 'Project deleted.']);
    }

    private function authorizeOwner(Request $request, Project $project): void
    {
        abort_if($project->user_id !== $request->user()->id, 403, 'This project does not belong to you.');
    }
}
