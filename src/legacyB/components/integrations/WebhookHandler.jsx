import React, { useEffect } from 'react';
import { ScheduledPost } from '@/legacyB/_compat/entities';
import { VideoAsset } from '@/legacyB/_compat/entities';
import { Analytics } from '@/legacyB/_compat/entities';
import { Client } from '@/legacyB/_compat/entities';

class WebhookHandler {
  static listeners = new Map();

  // הרשמה לאירועי webhook
  static addEventListener(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
  }

  // הסרת listener
  static removeEventListener(eventType, callback) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).delete(callback);
    }
  }

  // הפעלת listeners
  static emit(eventType, data) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in webhook listener:', error);
        }
      });
    }
  }

  // עיבוד webhook מ-Ayrshare
  static async processAyrshareWebhook(webhookData) {
    try {
      const { action, id, status, error, analytics, postUrl } = webhookData;

      switch (action) {
        case 'post':
          await this.handlePostWebhook(id, status, error, postUrl, analytics);
          break;
        case 'analytics':
          await this.handleAnalyticsWebhook(id, analytics);
          break;
        case 'social-connect':
          await this.handleSocialConnectWebhook(webhookData);
          break;
        default:
          console.log('Unknown webhook action:', action);
      }

      this.emit('webhook-processed', { action, id, status });
    } catch (error) {
      console.error('Error processing webhook:', error);
    }
  }

  // טיפול ב-webhook של פרסום פוסט
  static async handlePostWebhook(ayrsharePostId, status, error, postUrl, analytics) {
    try {
      // חיפוש הפוסט במסד הנתונים
      const posts = await ScheduledPost.filter({ ayrshare_post_id: ayrsharePostId });
      
      if (posts.length === 0) {
        console.warn('Post not found for Ayrshare ID:', ayrsharePostId);
        return;
      }

      const post = posts[0];
      const updateData = {};

      switch (status) {
        case 'success':
          updateData.status = 'published';
          if (postUrl) {
            updateData.published_urls = { ...post.published_urls, ...postUrl };
          }
          if (analytics) {
            updateData.analytics = analytics;
          }
          break;

        case 'error':
          updateData.status = 'failed';
          updateData.error_message = error || 'שגיאה לא ידועה בפרסום';
          updateData.retry_count = (post.retry_count || 0) + 1;
          break;

        case 'pending':
          updateData.status = 'publishing';
          break;
      }

      await ScheduledPost.update(post.id, updateData);
      
      // הפעלת listeners
      this.emit('post-status-change', {
        postId: post.id,
        status: updateData.status,
        error: updateData.error_message
      });

    } catch (error) {
      console.error('Error handling post webhook:', error);
    }
  }

  // טיפול ב-webhook של אנליטיקה
  static async handleAnalyticsWebhook(postId, analyticsData) {
    try {
      const posts = await ScheduledPost.filter({ ayrshare_post_id: postId });
      
      if (posts.length === 0) return;
      
      const post = posts[0];

      // שמירת נתוני אנליטיקה
      for (const [platform, data] of Object.entries(analyticsData)) {
        await Analytics.create({
          client_id: post.client_id,
          post_id: post.id,
          platform: platform,
          date: new Date().toISOString().split('T')[0],
          metrics: {
            views: data.totalViews || 0,
            likes: data.totalLikes || 0,
            comments: data.totalComments || 0,
            shares: data.totalShares || 0,
            engagement_rate: data.engagementRate || 0
          },
          source: 'ayrshare'
        });
      }

      this.emit('analytics-updated', {
        postId: post.id,
        analytics: analyticsData
      });

    } catch (error) {
      console.error('Error handling analytics webhook:', error);
    }
  }

  // טיפול בחיבור/ניתוק רשת חברתית
  static async handleSocialConnectWebhook(webhookData) {
    try {
      const { profileKey, platform, status, accountId } = webhookData;
      
      // חיפוש הלקוח לפי profile key
      const clients = await Client.filter({ ayrshare_profile_key: profileKey });
      
      if (clients.length === 0) return;
      
      const client = clients[0];
      const updateData = { ...client };

      if (status === 'connected') {
        updateData.social_accounts[platform] = true;
        updateData.ayrshare_social_accounts = {
          ...updateData.ayrshare_social_accounts,
          [platform]: accountId
        };
      } else if (status === 'disconnected') {
        updateData.social_accounts[platform] = false;
        if (updateData.ayrshare_social_accounts) {
          delete updateData.ayrshare_social_accounts[platform];
        }
      }

      await Client.update(client.id, updateData);

      this.emit('social-connect-change', {
        clientId: client.id,
        platform,
        status
      });

    } catch (error) {
      console.error('Error handling social connect webhook:', error);
    }
  }
}

// React Hook לשימוש ב-webhooks
export const useWebhookListener = (eventType, callback) => {
  useEffect(() => {
    WebhookHandler.addEventListener(eventType, callback);
    
    return () => {
      WebhookHandler.removeEventListener(eventType, callback);
    };
  }, [eventType, callback]);
};

export default WebhookHandler;
