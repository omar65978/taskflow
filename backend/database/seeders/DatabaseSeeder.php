<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the database with a demo account and sample data.
     */
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'demo@taskflow.test'],
            ['name' => 'Demo User', 'password' => 'password'],
        );

        $project = Project::updateOrCreate(
            ['user_id' => $user->id, 'name' => 'Website redesign'],
            ['description' => 'Refresh the marketing site and landing page.', 'status' => 'active'],
        );

        $tasks = [
            ['title' => 'Collect brand assets', 'status' => 'done', 'priority' => 'medium', 'due_date' => now()->subDays(2)->toDateString()],
            ['title' => 'Design landing page mockup', 'status' => 'in_progress', 'priority' => 'high', 'due_date' => now()->addDays(3)->toDateString()],
            ['title' => 'Implement responsive layout', 'status' => 'todo', 'priority' => 'high', 'due_date' => now()->addDays(7)->toDateString()],
            ['title' => 'Write copy for pricing section', 'status' => 'todo', 'priority' => 'low', 'due_date' => null],
        ];

        foreach ($tasks as $task) {
            Task::updateOrCreate(
                ['project_id' => $project->id, 'title' => $task['title']],
                $task,
            );
        }

        $this->command?->info('Seeded demo account: demo@taskflow.test / password');
    }
}
