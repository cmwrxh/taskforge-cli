#!/usr/bin/env node

import { Command } from 'commander';
import { loadTasks, saveTasks } from './storage';
import chalk from 'chalk';
import { table } from 'table';

const program = new Command();

program
  .name('taskforge')
  .description('CLI task manager')
  .version('1.0.0');

let tasks: { desc: string, done: boolean }[] = [];

(async () => {
  tasks = await loadTasks() as { desc: string, done: boolean }[];
})();

program
  .command('add')
  .description('Add a task')
  .argument('<task>', 'task description')
  .action(async (desc) => {
    tasks.push({ desc, done: false });
    await saveTasks(tasks);
    console.log(`Added: ${desc}`);
  });

program
  .command('list')
  .description('List tasks')
  .action(() => {
    const data = tasks.map((t, i) => [i, t.done ? chalk.green(t.desc) : t.desc]);
    console.log(table(data));
  });

// Add 'done' and 'delete' similarly...

program.parse();
