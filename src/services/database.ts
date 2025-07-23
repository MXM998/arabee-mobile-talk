import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { Student, Level, Batch } from '@/types/app';

class DatabaseService {
  private sqliteConnection: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private isInitialized = false;

  constructor() {
    this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize the plugin
      await this.sqliteConnection.initWebStore();
      
      // Create connection to database
      this.db = await this.sqliteConnection.createConnection(
        'arabee_students',
        false,
        'no-encryption',
        1,
        false
      );

      if (!this.db) {
        throw new Error('Failed to create database connection');
      }

      // Open the database
      await this.db.open();

      // Create tables
      await this.createTables();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  private async createTables() {
    if (!this.db) throw new Error('Database not connected');

    const sqlStatements = `
      CREATE TABLE IF NOT EXISTS batches (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        number INTEGER NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS levels (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sessions_count INTEGER NOT NULL,
        batch_id TEXT NOT NULL,
        FOREIGN KEY (batch_id) REFERENCES batches (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        points INTEGER DEFAULT 0,
        level_id TEXT NOT NULL,
        FOREIGN KEY (level_id) REFERENCES levels (id) ON DELETE CASCADE
      );
    `;

    await this.db.execute(sqlStatements);
  }

  // Batch operations
  async createBatch(batch: Batch): Promise<void> {
    if (!this.db) throw new Error('Database not connected');

    await this.db.run(
      'INSERT INTO batches (id, name, number, created_at) VALUES (?, ?, ?, ?)',
      [batch.id, batch.name, batch.number, batch.createdAt.toISOString()]
    );

    // Insert levels
    for (const level of batch.levels) {
      await this.db.run(
        'INSERT INTO levels (id, name, sessions_count, batch_id) VALUES (?, ?, ?, ?)',
        [level.id, level.name, level.sessionsCount, batch.id]
      );
    }
  }

  async getAllBatches(): Promise<Batch[]> {
    if (!this.db) throw new Error('Database not connected');

    const batchResult = await this.db.query('SELECT * FROM batches ORDER BY created_at DESC');
    const batches: Batch[] = [];

    for (const batchRow of batchResult.values || []) {
      const levelResult = await this.db.query(
        'SELECT * FROM levels WHERE batch_id = ?',
        [batchRow.id]
      );

      const levels: Level[] = [];
      for (const levelRow of levelResult.values || []) {
        const studentResult = await this.db.query(
          'SELECT * FROM students WHERE level_id = ?',
          [levelRow.id]
        );

        const students: Student[] = (studentResult.values || []).map((studentRow: any) => ({
          id: studentRow.id,
          name: studentRow.name,
          phone: studentRow.phone,
          points: studentRow.points,
          levelId: studentRow.level_id
        }));

        levels.push({
          id: levelRow.id,
          name: levelRow.name,
          sessionsCount: levelRow.sessions_count,
          students
        });
      }

      batches.push({
        id: batchRow.id,
        name: batchRow.name,
        number: batchRow.number,
        levels,
        createdAt: new Date(batchRow.created_at)
      });
    }

    return batches;
  }

  async updateBatch(batch: Batch): Promise<void> {
    if (!this.db) throw new Error('Database not connected');

    // Update batch info
    await this.db.run(
      'UPDATE batches SET name = ?, number = ? WHERE id = ?',
      [batch.name, batch.number, batch.id]
    );

    // Delete existing levels and students for this batch
    await this.db.run('DELETE FROM students WHERE level_id IN (SELECT id FROM levels WHERE batch_id = ?)', [batch.id]);
    await this.db.run('DELETE FROM levels WHERE batch_id = ?', [batch.id]);

    // Insert updated levels and students
    for (const level of batch.levels) {
      await this.db.run(
        'INSERT INTO levels (id, name, sessions_count, batch_id) VALUES (?, ?, ?, ?)',
        [level.id, level.name, level.sessionsCount, batch.id]
      );

      for (const student of level.students) {
        await this.db.run(
          'INSERT INTO students (id, name, phone, points, level_id) VALUES (?, ?, ?, ?, ?)',
          [student.id, student.name, student.phone, student.points, student.levelId]
        );
      }
    }
  }

  // Student operations
  async addStudent(student: Student): Promise<void> {
    if (!this.db) throw new Error('Database not connected');

    await this.db.run(
      'INSERT INTO students (id, name, phone, points, level_id) VALUES (?, ?, ?, ?, ?)',
      [student.id, student.name, student.phone, student.points, student.levelId]
    );
  }

  async updateStudentPoints(studentId: string, points: number): Promise<void> {
    if (!this.db) throw new Error('Database not connected');

    await this.db.run(
      'UPDATE students SET points = ? WHERE id = ?',
      [points, studentId]
    );
  }

  // Level operations
  async addLevel(level: Level, batchId: string): Promise<void> {
    if (!this.db) throw new Error('Database not connected');

    await this.db.run(
      'INSERT INTO levels (id, name, sessions_count, batch_id) VALUES (?, ?, ?, ?)',
      [level.id, level.name, level.sessionsCount, batchId]
    );
  }

  async close() {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
    this.isInitialized = false;
  }
}

export const databaseService = new DatabaseService();