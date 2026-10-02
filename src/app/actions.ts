"use server";
import Database from "better-sqlite3";

// --- 1. LIB & DATABASE CONNECTION (Mixed) ---
const db = new Database("app.db");
db.pragma("journal_mode = WAL");

// --- 2. MODEL (Mixed) ---
export interface Todo {
  id: number;
  title: string;
  completed: number; // SQLite doesn't have booleans
}

// Initialize table
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0
  )
`);

// --- 3. SERVER ACTIONS (API/Logic Mixed) ---
export async function getTodos(): Promise<Todo[]> {
  const stmt = db.prepare("SELECT * FROM todos ORDER BY id DESC");
  return stmt.all() as Todo[];
}

export async function addTodo(title: string) {
  const stmt = db.prepare("INSERT INTO todos (title) VALUES (?)");
  stmt.run(title);
}

export async function toggleTodo(id: number, currentStatus: number) {
  const stmt = db.prepare("UPDATE todos SET completed = ? WHERE id = ?");
  stmt.run(currentStatus === 1 ? 0 : 1, id);
}

export async function deleteTodo(id: number) {
  const stmt = db.prepare("DELETE FROM todos WHERE id = ?");
  stmt.run(id);
}
