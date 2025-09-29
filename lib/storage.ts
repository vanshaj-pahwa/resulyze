// Fallback storage system using localStorage when MongoDB is unavailable

export interface StorageAdapter {
  getResumeData(userId: string): Promise<any>
  saveResumeData(userId: string, data: any): Promise<boolean>
  getUserProfile(userId: string): Promise<any>
  saveUserProfile(userId: string, data: any): Promise<boolean>
}

class LocalStorageAdapter implements StorageAdapter {
  async getResumeData(userId: string): Promise<any> {
    try {
      const key = `resume_${userId}`
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return null
    }
  }

  async saveResumeData(userId: string, data: any): Promise<boolean> {
    try {
      const key = `resume_${userId}`
      localStorage.setItem(key, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Error saving to localStorage:', error)
      return false
    }
  }

  async getUserProfile(userId: string): Promise<any> {
    try {
      const key = `profile_${userId}`
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error reading profile from localStorage:', error)
      return null
    }
  }

  async saveUserProfile(userId: string, data: any): Promise<boolean> {
    try {
      const key = `profile_${userId}`
      localStorage.setItem(key, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Error saving profile to localStorage:', error)
      return false
    }
  }
}

class MongoDBAdapter implements StorageAdapter {
  async getResumeData(userId: string): Promise<any> {
    const { connectToDB } = await import('./mongodb')
    const { UserProfile } = await import('./models/User')
    
    await connectToDB()
    const user = await UserProfile.findOne({ userId })
    return user?.resumeData || null
  }

  async saveResumeData(userId: string, data: any): Promise<boolean> {
    try {
      const { connectToDB } = await import('./mongodb')
      const { UserProfile } = await import('./models/User')
      
      await connectToDB()
      
      const result = await UserProfile.findOneAndUpdate(
        { userId },
        { 
          resumeData: data,
          updatedAt: new Date() 
        },
        { upsert: true, new: true }
      )
      
      return !!result
    } catch (error) {
      console.error('Error saving resume data:', error)
      return false
    }
  }

  async getUserProfile(userId: string): Promise<any> {
    try {
      const { connectToDB } = await import('./mongodb')
      const { UserProfile } = await import('./models/User')
      
      await connectToDB()
      return await UserProfile.findOne({ userId })
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  async saveUserProfile(userId: string, data: any): Promise<boolean> {
    try {
      const { connectToDB } = await import('./mongodb')
      const { UserProfile } = await import('./models/User')
      
      await connectToDB()
      
      const result = await UserProfile.findOneAndUpdate(
        { userId },
        { 
          ...data, 
          updatedAt: new Date() 
        },
        { upsert: true, new: true }
      )
      
      return !!result
    } catch (error) {
      console.error('Error saving user profile:', error)
      return false
    }
  }
}

// Factory function to get the appropriate storage adapter
export async function getStorageAdapter(): Promise<StorageAdapter> {
  // Check if we're in browser environment
  if (typeof window !== 'undefined') {
    return new LocalStorageAdapter()
  }

  // Server-side: try MongoDB first, fallback to localStorage simulation
  try {
    const { isMongoAvailable } = await import('./mongodb')
    const mongoAvailable = await isMongoAvailable()
    
    if (mongoAvailable) {
      return new MongoDBAdapter()
    } else {
      console.warn('MongoDB not available, using localStorage fallback')
      return new LocalStorageAdapter()
    }
  } catch (error) {
    console.error('Error checking MongoDB availability:', error)
    return new LocalStorageAdapter()
  }
}