#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { table } from 'table';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

const program = new Command();

const HOME = os.homedir();
const DATA_DIR = path.join(HOME, '.taskforge');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

interface Task {
  id: number;
  description: string;
  done: boolean;
  createdAt: string;
}

let tasks: Task[] = [];

// ────────────────────────────────────────────────
// Helper: Load tasks from JSON file
// ────────────────────────────────────────────────
async function loadTasks(): Promise<Task[]> {
  try {
    await fs.ensureDir(DATA_DIR);
    if (await fs.pathExists(TASKS_FILE)) {
      const data = await fs.readJson(TASKS_FILE);
      return Array.isArray(data) ? data : [];
    }
  } catch (err) {
    console.error(chalk.red('Error reading tasks file:'), err);
  }
  return [];
}

// ────────────────────────────────────────────────
// Helper: Save tasks to JSON file
// ────────────────────────────────────────────────
async function saveTasks(): Promise<void> {
  try {
    await fs.ensureDir(DATA_DIR);
    await fs.writeJson(TASKS_FILE, tasks, { spaces: 2 });
  } catch (err) {
    console.error(chalk.red('Error saving tasks:'), err);
  }
}

// ────────────────────────────────────────────────
// Load tasks once on startup
// ────────────────────────────────────────────────
(async () => {
  tasks = await loadTasks();
  // Assign incremental IDs if missing
  tasks.forEach((t, i) => {
    if (!t.id) t.id = i + 1;
  });
})();

// ────────────────────────────────────────────────
// CLI Setup
// ────────────────────────────────────────────────
program
  .name('taskforge')
  .description('A clean & modern CLI task manager')
  .version('1.0.0');

// ── add ───────────────────────────────────────────
program
  .command('add')
  .description('Add a new task')
  .argument('<description...>', 'Task description (can contain spaces)')
  .action(async (description: string[]) => {
    const desc = description.join(' ');
    if (!desc.trim()) {
      console.log(chalk.yellow('Please provide a task description'));
      return;
    }

    const newTask: Task = {
      id: tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
      description: desc,
      done: false,
      createdAt: new Date().toISOString(),
    };

    tasks.push(newTask);
    await saveTasks();

    console.log(chalk.green('✓ Task added:'), chalk.white(desc));
  });

// ── list ──────────────────────────────────────────
program
  .command('list')
  .description('List all tasks')
  .action(() => {
    if (tasks.length === 0) {
      console.log(chalk.yellow('No tasks yet. Add one with:'));
      console.log(chalk.cyan('  taskforge add "Buy milk and bread"'));
      return;
    }

    const tableData = [
      [
        chalk.bold('ID'),
        chalk.bold('Status'),
        chalk.bold('Task'),
        chalk.bold('Created'),
      ],
    ];

    tasks.forEach(task => {
      const status = task.done
        ? chalk.green('✔ Done')
        : chalk.red('◻ Todo');

      const desc = task.done
        ? chalk.gray(task.description)
        : chalk.white(task.description);

      const date = new Date(task.createdAt).toLocaleDateString();

      tableData.push([
        chalk.cyan(task.id.toString().padStart(2)),
        status,
        desc,
        chalk.dim(date),
      ]);
    });

    console.log(
      table(tableData, {
        border: table.getBorderCharacters('void'),
        columnDefault: { paddingLeft: 1, paddingRight: 1 },
        drawHorizontalLine: () => false,
      })
    );

    console.log(chalk.gray(`Total: ${tasks.length} task${tasks.length === 1 ? '' : 's'}`));
  });

// ── done ──────────────────────────────────────────
program
  .command('done')
  .description('Mark a task as done')
  .argument('<id>', 'Task ID', parseInt)
  .action(async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) {
      console.log(chalk.red(`Task with ID ${id} not found`));
      return;
    }

    if (task.done) {
      console.log(chalk.yellow(`Task ${id} is already done`));
      return;
    }

    task.done = true;
    await saveTasks();

    console.log(chalk.green('✓ Marked as done:'), chalk.white(task.description));
  });

// ── delete ────────────────────────────────────────
program
  .command('delete')
  .description('Delete a task')
  .argument('<id>', 'Task ID', parseInt)
  .action(async (id: number) => {
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
      console.log(chalk.red(`Task with ID ${id} not found`));
      return;
    }

    const deleted = tasks.splice(index, 1)[0];
    // Re-number remaining tasks (optional but keeps IDs clean)
    tasks.forEach((t, i) => { t.id = i + 1; });

    await saveTasks();

    console.log(chalk.green('✓ Deleted:'), chalk.white(deleted.description));
  });

// ────────────────────────────────────────────────
program.parse(process.argv);

// Show help if no command was provided
if (!process.argv.slice(2).length) {
  program.outputHelp(chalk.cyan);
}
