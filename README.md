# TaskForge CLI

A clean, modern, and powerful command-line task manager built with TypeScript + Node.js.

Features:
- Add, list, complete, and delete tasks
- Persistent storage in `~/.taskforge/tasks.json`
- Colorful output with status icons and formatted tables
- Global install support (`npm install -g .`)
- Simple, readable code with proper error handling

## Installation (local development / global use)

```bash
# Clone or download the repo
git clone https://github.com/cmwrxh/taskforge-cli.git
cd taskforge-cli

# Install dependencies
npm install

# Build TypeScript → JavaScript
npm run build

# Install globally so you can run `taskforge` from anywhere
npm install -g .
