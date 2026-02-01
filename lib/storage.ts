// Storage system using file-based storage for server-side
import fs from 'fs'
import path from 'path'

export interface StorageAdapter {
  getResumeData(userId: string): Promise<any>
  saveResumeData(userId: string, data: any): Promise<boolean>
  getUserProfile(userId: string): Promise<any>
  saveUserProfile(userId: string, data: any): Promise<boolean>
}

// Server-side file-based storage
class FileStorageAdapter implements StorageAdapter {
  private dataDir: string

  constructor() {
    // Use a data directory in the project root
    this.dataDir = path.join(process.cwd(), '.data')
    this.ensureDataDir()
  }

  private ensureDataDir() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true })
      }
    } catch (error) {
      console.error('Error creating data directory:', error)
    }
  }

  private getFilePath(type: string, userId: string): string {
    // Sanitize userId to prevent directory traversal
    const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_')
    return path.join(this.dataDir, `${type}_${safeUserId}.json`)
  }

  async getResumeData(userId: string): Promise<any> {
    try {
      const filePath = this.getFilePath('resume', userId)
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8')
        return JSON.parse(data)
      }
      return null
    } catch (error) {
      console.error('Error reading resume data:', error)
      return null
    }
  }

  async saveResumeData(userId: string, data: any): Promise<boolean> {
    try {
      this.ensureDataDir()
      const filePath = this.getFilePath('resume', userId)
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
      return true
    } catch (error) {
      console.error('Error saving resume data:', error)
      return false
    }
  }

  async getUserProfile(userId: string): Promise<any> {
    try {
      const filePath = this.getFilePath('profile', userId)
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8')
        return JSON.parse(data)
      }
      return null
    } catch (error) {
      console.error('Error reading profile data:', error)
      return null
    }
  }

  async saveUserProfile(userId: string, data: any): Promise<boolean> {
    try {
      this.ensureDataDir()
      const filePath = this.getFilePath('profile', userId)
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
      return true
    } catch (error) {
      console.error('Error saving profile data:', error)
      return false
    }
  }
}

// Singleton instance
let storageInstance: StorageAdapter | null = null

// Factory function to get the storage adapter
export function getStorageAdapter(): StorageAdapter {
  if (!storageInstance) {
    storageInstance = new FileStorageAdapter()
  }
  return storageInstance
}
