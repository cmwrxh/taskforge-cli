import fs from 'fs-extra';
import os from 'os';

const filePath = `${os.homedir()}/.taskforge/tasks.json`;

export async function loadTasks(): Promise<string[]> {
  return fs.pathExists(filePath) ? await fs.readJson(filePath) : [];
}

export async function saveTasks(tasks: string[]): Promise<void> {
  await fs.ensureFile(filePath);
  await fs.writeJson(filePath, tasks);
}
