// @ts-nocheck
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(__dirname, '../../data.sqlite');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export const query = async (text: string, params?: unknown[]) => {
  console.log('SQL Query:', text, params);
  
  try {
    // Convert PostgreSQL-style $1, $2, etc. to ? for SQLite
    let sqliteQuery = text;
    const paramArray = params || [];
    
    if (params && params.length > 0) {
      let paramIndex = 1;
      while (sqliteQuery.includes(`$${paramIndex}`)) {
        sqliteQuery = sqliteQuery.replace(`$${paramIndex}`, '?');
        paramIndex++;
      }
    }
    
    // Handle common PostgreSQL to SQLite conversions
    sqliteQuery = sqliteQuery.replace(/CURRENT_TIMESTAMP/g, "datetime('now')");
    
    // Handle RETURNING clause - extract what we need to return and handle separately
    let returnFields = null;
    if (sqliteQuery.includes('RETURNING')) {
      const parts = sqliteQuery.split('RETURNING');
      sqliteQuery = parts[0].trim().replace(/,\s*$/, ''); // Remove trailing comma
      returnFields = parts[1].trim().split(',').map(f => f.trim());
    }
    
    let stmt: any;
    let result: any;
    
    if (sqliteQuery.trim().toLowerCase().startsWith('select')) {
      // For SELECT queries
      stmt = db.prepare(sqliteQuery);
      result = stmt.all(...(paramArray as any[]));
      
      // Add rowCount for compatibility
      const rows = Array.isArray(result) ? result : [result];
      return {
        rows,
        rowCount: rows.length,
        command: 'SELECT'
      };
    } else if (sqliteQuery.trim().toLowerCase().startsWith('insert')) {
      // For INSERT queries
      stmt = db.prepare(sqliteQuery);
      const info = stmt.run(...(paramArray as any[]));
      
      // For SQLite, get the inserted data if RETURNING was requested
      let rows = [];
      if (returnFields && returnFields.length > 0) {
        const insertedId = info.lastInsertRowid;
        // Get the inserted record
        const selectQuery = sqliteQuery.replace(/INSERT\s+INTO\s+(\w+)/i, 'SELECT * FROM $1').replace(/VALUES\s*\([^)]*\)/i, 'WHERE id = ?');
        const selectStmt = db.prepare(selectQuery);
        const insertedRecord = selectStmt.get(insertedId);
        
        if (insertedRecord) {
          // Filter to only requested fields
          const filteredRecord = {};
          returnFields.forEach(field => {
            if (insertedRecord[field] !== undefined) {
              filteredRecord[field] = insertedRecord[field];
            }
          });
          rows = [filteredRecord];
        }
      }
      
      return {
        rows,
        rowCount: info.changes,
        command: 'INSERT'
      };
    } else {
      // For UPDATE, DELETE queries
      stmt = db.prepare(sqliteQuery);
      const info = stmt.run(...(paramArray as any[]));
      
      return {
        rows: info.changes > 0 ? [{ id: info.lastInsertRowid }] : [],
        rowCount: info.changes,
        command: sqliteQuery.trim().split(' ')[0].toUpperCase()
      };
    }
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

// Special method for executing multiple statements (like migrations)
export const executeMultiple = async (sqlScript: string) => {
  console.log('Executing SQL script with multiple statements');
  
  try {
    // First try to execute as a single script
    try {
      db.exec(sqlScript);
      console.log('Successfully executed SQL script as single transaction');
      return { success: true };
    } catch (singleError) {
      console.log('Single script execution failed, trying individual statements:', singleError.message);
    }
    
    // Fallback: Split by semicolons and filter out empty statements
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    const results = [];
    let successCount = 0;
    
    for (const statement of statements) {
      if (statement.length === 0) continue;
      
      try {
        // Handle PostgreSQL to SQLite conversions for each statement
        let sqliteStatement = statement;
        sqliteStatement = sqliteStatement.replace(/CURRENT_TIMESTAMP/g, "datetime('now')");
        
        // Remove comments
        sqliteStatement = sqliteStatement.replace(/--.*$/gm, '').trim();
        
        if (sqliteStatement.length === 0) continue;
        
        db.exec(sqliteStatement);
        results.push({ statement: sqliteStatement, success: true });
        successCount++;
      } catch (stmtError) {
        console.warn('Statement failed:', statement.substring(0, 100) + '...', stmtError.message);
        results.push({ statement, success: false, error: stmtError.message });
        // Continue with other statements even if one fails
      }
    }
    
    console.log(`Successfully executed ${successCount}/${statements.length} statements`);
    return { success: true, results, successCount, totalCount: statements.length };
  } catch (error) {
    console.error('Multiple statement execution error:', error);
    throw error;
  }
};

export const getClient = () => {
  return db;
};

// Export db for direct access when needed
export { db };