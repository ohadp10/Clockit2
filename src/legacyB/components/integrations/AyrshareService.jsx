/**
 * Ayrshare Integration Service  
 * Real API implementation for social media posting
 */

const AYRSHARE_API_KEY = '869024F9-AF0A476C-8904A54F-A1183E5F';
const AYRSHARE_BASE_URL = 'https://app.ayrshare.com/api';

const PLATFORM_MAPPING = {
  'tiktok': 'tiktok',
  'instagram': 'instagram', 
  'facebook': 'facebook',
  'youtube': 'youtube',
  'twitter': 'twitter',
  'linkedin': 'linkedin',
  'threads': 'threads'
};

class AyrshareService {
  
  async makeRequest(endpoint, method = 'GET', data = null) {
    const config = {
      method,
      headers: {
        'Authorization': `Bearer ${AYRSHARE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${AYRSHARE_BASE_URL}${endpoint}`, config);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || `API Error: ${response.status}`);
      }
      
      return result;
    } catch (error) {
      console.error(`Ayrshare API Error (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Get all connected social media profiles from Ayrshare
   * These are the accounts you've connected in your Ayrshare dashboard
   */
  async getProfiles() {
    try {
      return await this.makeRequest('/profiles');
    } catch (error) {
      console.error('Error getting profiles:', error);
      return []; // Return empty array if can't fetch profiles
    }
  }

  /**
   * Post content to social media platforms
   * Uses the profiles that are already connected in Ayrshare
   */
  async createPost(postData) {
    try {
      const { platforms, videoUrl, caption, hashtags, clientSocialAccounts } = postData;
      
      // Filter platforms based on what's configured for this client
      const ayrshareplatforms = platforms
        .filter(p => clientSocialAccounts && clientSocialAccounts[p])
        .map(p => PLATFORM_MAPPING[p])
        .filter(Boolean);
      
      if (ayrshareplatforms.length === 0) {
        throw new Error('לא נמצאו רשתות חברתיות מוגדרות עבור הלקוח');
      }

      const postPayload = {
        post: `${caption}\n\n${hashtags}`,
        platforms: ayrshareplatforms,
        mediaUrls: [videoUrl],
        scheduleTime: postData.scheduleTime || null
      };

      const response = await this.makeRequest('/post', 'POST', postPayload);
      
      return {
        success: true,
        ayrshareId: response.id,
        platformData: response.postIds || {},
        message: 'הפוסט נוצר בהצלחה'
      };

    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error(`שגיאה ביצירת פוסט: ${error.message}`);
    }
  }

  /**
   * Schedule a post for later
   */
  async schedulePost(postData) {
    try {
      const { platforms, videoUrl, caption, hashtags, scheduledTime, clientSocialAccounts } = postData;
      
      const ayrshareplatforms = platforms
        .filter(p => clientSocialAccounts && clientSocialAccounts[p])
        .map(p => PLATFORM_MAPPING[p])
        .filter(Boolean);
      
      if (ayrshareplatforms.length === 0) {
        throw new Error('לא נמצאו רשתות חברתיות מוגדרות עבור הלקוח');
      }

      const schedulePayload = {
        post: `${caption}\n\n${hashtags}`,
        platforms: ayrshareplatforms,
        mediaUrls: [videoUrl],
        scheduleTime: new Date(scheduledTime).toISOString()
      };

      const response = await this.makeRequest('/post', 'POST', schedulePayload);
      
      return {
        success: true,
        ayrshareId: response.id,
        scheduledTime: scheduledTime,
        message: 'הפוסט תוזמן בהצלחה'
      };

    } catch (error) {
      console.error('Error scheduling post:', error);
      throw new Error(`שגיאה בתזמון פוסט: ${error.message}`);
    }
  }

  /**
   * Get post analytics
   */
  async getPostAnalytics(ayrsharePostId) {
    try {
      return await this.makeRequest(`/analytics/post/${ayrsharePostId}`);
    } catch (error) {
      console.error('Error getting post analytics:', error);
      return null;
    }
  }

  /**
   * Delete a scheduled post
   */
  async deletePost(ayrsharePostId) {
    try {
      await this.makeRequest(`/delete/${ayrsharePostId}`, 'DELETE');
      return { success: true, message: 'הפוסט נמחק בהצלחה' };
    } catch (error) {
      console.error('Error deleting post:', error);
      throw new Error(`שגיאה במחיקת פוסט: ${error.message}`);
    }
  }

  /**
   * Check if a platform is available (has connected profiles)
   */
  async isPlatformAvailable(platform) {
    try {
      const profiles = await this.getProfiles();
      return profiles.some(p => p.platform?.toLowerCase() === PLATFORM_MAPPING[platform]);
    } catch (error) {
      console.error(`Error checking platform availability for ${platform}:`, error);
      return false;
    }
  }
}

export default new AyrshareService();