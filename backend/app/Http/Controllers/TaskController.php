<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request, Project $project): JsonResponse
    {
        $this->authorizeProject($request, $project);

        return response()->json(['tasks' => $project->tasks()->latest()->get()]);
    }

    public function store(Request $request, Project $project): JsonResponse
    {
        $this->authorizeProject($request, $project);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'in:todo,in_progress,done'],
            'priority' => ['nullable', 'in:low,medium,high'],
            'due_date' => ['nullable', 'date'],
        ]);

        $task = $project->tasks()->create($data);

        return response()->json(['task' => $task], 201);
    }

    public function update(Request $request, Task $task): JsonResponse
    {
        $this->authorizeTask($request, $task);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'in:todo,in_progress,done'],
            'priority' => ['nullable', 'in:low,medium,high'],
            'due_date' => ['nullable', 'date'],
        ]);

        $task->update($data);

        return response()->json(['task' => $task]);
    }

    public function updateStatus(Request $request, Task $task): JsonResponse
    {
        $this->authorizeTask($request, $task);

        $data = $request->validate([
            'status' => ['required', 'in:todo,in_progress,done'],
        ]);

        $task->update(['status' => $data['status']]);

        return response()->json(['task' => $task]);
    }

    public function destroy(Request $request, Task $task): JsonResponse
    {
        $this->authorizeTask($request, $task);

        $task->delete();

        return response()->json(['message' => 'Task deleted.']);
    }

    private function authorizeProject(Request $request, Project $project): void
    {
        abort_if($project->user_id !== $request->user()->id, 403, 'This project does not belong to you.');
    }

    private function authorizeTask(Request $request, Task $task): void
    {
        abort_if($task->project->user_id !== $request->user()->id, 403, 'This task does not belong to you.');
    }
}
