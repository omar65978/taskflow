<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskFlowApiTest extends TestCase
{
    use RefreshDatabase;

    private function createUser(array $attributes = []): User
    {
        return User::create(array_merge([
            'name' => 'Test User',
            'email' => 'user'.uniqid().'@example.com',
            'password' => 'password123',
        ], $attributes));
    }

    public function test_user_can_register_and_receives_a_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'New User',
            'email' => 'new@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['user' => ['id', 'name', 'email'], 'token']);

        $this->assertDatabaseHas('users', ['email' => 'new@example.com']);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $this->createUser(['email' => 'sam@example.com']);

        $this->postJson('/api/login', [
            'email' => 'sam@example.com',
            'password' => 'wrong-password',
        ])->assertUnprocessable();
    }

    public function test_authenticated_user_can_create_a_project_and_tasks(): void
    {
        $user = $this->createUser();

        $project = Project::create(['user_id' => $user->id, 'name' => 'Demo project']);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/projects/{$project->id}/tasks", ['title' => 'First task', 'priority' => 'high'])
            ->assertCreated();

        $this->assertDatabaseHas('tasks', [
            'project_id' => $project->id,
            'title' => 'First task',
            'priority' => 'high',
        ]);
    }

    public function test_task_status_can_be_updated(): void
    {
        $user = $this->createUser();
        $project = Project::create(['user_id' => $user->id, 'name' => 'Demo project']);
        $task = $project->tasks()->create(['title' => 'A task']);

        $this->actingAs($user, 'sanctum')
            ->patchJson("/api/tasks/{$task->id}/status", ['status' => 'done'])
            ->assertOk()
            ->assertJsonPath('task.status', 'done');
    }

    public function test_users_cannot_touch_other_users_projects(): void
    {
        $owner = $this->createUser();
        $stranger = $this->createUser();
        $project = Project::create(['user_id' => $owner->id, 'name' => 'Private project']);

        $this->actingAs($stranger, 'sanctum')
            ->putJson("/api/projects/{$project->id}", ['name' => 'Hacked'])
            ->assertForbidden();
    }
}
