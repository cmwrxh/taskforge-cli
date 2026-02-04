#!/usr/bin/env node

import { Command } from 'commander';

const program = new Command();
let tasks: string[] = [];

program
  .name('taskforge')
  .description('CLI task manager')
  .version('1.0.0');

program
  .command('add')
  .description('Add a task')
  .argument('<task>', 'task description')
  .action((task) => {
    tasks.push(task);
    console.log(`Added: ${task}`);
  });

program.parse();
