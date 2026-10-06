import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

// Mở (hoặc tạo mới) database "studyroom.db", chỉ chạy 1 lần nhờ cache promise này
export function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('studyroom.db').then(async (db) => {
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS bookings (
          id TEXT PRIMARY KEY NOT NULL,
          roomId TEXT NOT NULL,
          date TEXT NOT NULL,
          slot TEXT NOT NULL,
          userId TEXT NOT NULL,
          createdAt INTEGER NOT NULL,
          notificationId TEXT,
          UNIQUE(roomId, date, slot)
        );
      `);
      try {
        await db.execAsync('ALTER TABLE bookings ADD COLUMN notificationId TEXT;');
      } catch {
        // Cột đã tồn tại, bỏ qua lỗi migration
      }
      return db;
    });
  }
  return dbPromise;
}
