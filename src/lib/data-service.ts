import { promises as fs } from 'fs';
import path from 'path';

// Primary data directory (committed files)
const primaryDataDir = path.join(process.cwd(), 'data');

// Writable directory for serverless environments
const isServerless = process.env.VERCEL || process.env.RENDER || process.env.AWS_LAMBDA_FUNCTION_NAME;
const writableDataDir = isServerless 
  ? path.join('/tmp', 'data')
  : primaryDataDir;

// Ensure writable directory exists on module load
(async () => {
  try {
    await fs.access(writableDataDir);
  } catch {
    try {
      await fs.mkdir(writableDataDir, { recursive: true });
    } catch (error) {
      console.error(`[DataService] Failed to create data directory: ${writableDataDir}`, error);
    }
  }
})();

// File locking to prevent race conditions
const fileLocks = new Map<string, Promise<void>>();
const LOCK_TIMEOUT_MS = 5000; // 5 second timeout

async function acquireLock(filePath: string): Promise<() => void> {
  const startTime = Date.now();
  
  while (fileLocks.has(filePath)) {
    // Wait for existing lock with timeout
    await Promise.race([
      fileLocks.get(filePath)!,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('File lock timeout')), LOCK_TIMEOUT_MS)
      )
    ]).catch(() => {
      // If timeout, force release the stuck lock
      fileLocks.delete(filePath);
    });
    
    // Safety check: if we've been waiting too long, break
    if (Date.now() - startTime > LOCK_TIMEOUT_MS * 2) {
      fileLocks.delete(filePath);
      break;
    }
  }
  
  let release: () => void = () => {};
  const lockPromise = new Promise<void>((resolve) => {
    release = () => {
      fileLocks.delete(filePath);
      resolve();
    };
  });
  
  fileLocks.set(filePath, lockPromise);
  return release;
}

// Read data from JSON file (tries writable dir first, then committed files)
export async function readData<T>(filename: string): Promise<T> {
  // Try writable directory first (for admin changes on serverless)
  const writablePath = path.join(writableDataDir, `${filename}.json`);
  const release = await acquireLock(writablePath);
  
  try {
    try {
      const data = await fs.readFile(writablePath, 'utf8');
      return JSON.parse(data) as T;
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        console.error(`Error reading ${filename} from writable:`, error);
      }
      // File doesn't exist in writable dir, try primary (committed) dir
    }
    
    const primaryPath = path.join(primaryDataDir, `${filename}.json`);
    const data = await fs.readFile(primaryPath, 'utf8');
    return JSON.parse(data) as T;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist anywhere - return default empty structure
      if (filename === 'carousel') return { images: [] } as unknown as T;
      if (filename === 'events') return { events: [] } as unknown as T;
      if (filename === 'resources') return { resources: [] } as unknown as T;
      if (filename === 'form-backup') return { submissions: [] } as unknown as T;
    }
    console.error(`Error reading ${filename}:`, error);
    throw new Error(`Failed to read ${filename}`);
  } finally {
    release();
  }
}

// Write data to JSON file atomically (always writes to writable dir)
export async function writeData<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(writableDataDir, `${filename}.json`);
  const tempPath = `${filePath}.tmp`;
  const release = await acquireLock(filePath);
  
  try {
    // Write to temporary file first for atomicity
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf8');
    // Rename is atomic on most filesystems
    await fs.rename(tempPath, filePath);
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    // Clean up temp file if it exists
    try {
      await fs.unlink(tempPath);
    } catch {
      // Ignore cleanup errors
    }
    throw new Error(`Failed to write ${filename}`);
  } finally {
    release();
  }
}

// Types
export interface Event {
  id: string;
  title: string;
  start: string;
  end?: string;
  location?: string;
  imageSrc?: string;
  imageAlt: string;
  eventCategory: 'general' | 'coffee' | 'social' | 'fundraising' | 'advocacy' | 'education' | 'health' | 'youth' | 'pride' | 'volunteer' | 'cultural' | 'community';
  externalUrl?: string;
  externalCtaLabel?: string;
  summary?: string;
  isRecurring?: boolean;
  parentId?: string;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  category: string;
  description?: string;
}

export interface CarouselImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
}
