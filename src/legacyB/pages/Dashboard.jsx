
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Users,
  Video,
  Calendar,
  BarChart3,
  Plus,
  Clock,
  Eye,
  FileVideo,
  Upload,
  PlayCircle,
  UserPlus,
  TrendingUp,
  Zap,
  Star,
  Heart,
  MessageCircle,
  Share2,
  Target,
  Award,
  ExternalLink
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Client } from "@/legacyB/_compat/entities";
import { VideoAsset } from "@/legacyB/_compat/entities";
import { ScheduledPost } from "@/legacyB/_compat/entities";
import { Analytics } from "@/legacyB/_compat/entities";
import { User } from "@/legacyB/_compat/entities";
import { format, subDays } from 'date-fns';
import { he } from 'date-fns/locale';

const PLATFORM_COLORS = {
  tiktok: '#000000',
  instagram: '#E4405F',
  facebook: '#1877F2',
  youtube: '#FF0000',
  twitter: '#1DA1F2',
  linkedin: '#0A66C2'
};

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [recentPosts, setRecentPosts] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [videos, setVideos] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const lastLoadTimeRef = useRef(0); // Added: Track last load time using useRef

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error loading current user:', error);
      }
    };

    loadCurrentUser();
  }, []);

  // הפך את loadDashboardData ל-useCallback עם מנגנון הגנה מפני טעינות מרובות
  const loadDashboardData = useCallback(async () => {
    if (!currentUser) return;

    // מנגנון הגנה עם ref במקום state כדי למנוע dependency issues
    const now = Date.now();
    if (now - lastLoadTimeRef.current < 30000) { // Allow re-fetching data only after 30 seconds
      console.log('Skipping dashboard data load - too soon since last load.');
      return;
    }

    setIsLoading(true);
    lastLoadTimeRef.current = now; // Update last load time when starting a new load operation
    
    try {
      // Fetch clients first, with a small delay to distribute API calls
      const [myClients, sampleClients] = await Promise.all([
        Client.filter({ owner_email: currentUser.email }),
        Client.filter({ owner_email: "user@example.com" })
      ]);

      // Add a small delay after the first set of parallel calls before processing client data
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay

      const clientMap = new Map();
      myClients.forEach(client => clientMap.set(client.id, client));
      sampleClients.forEach(client => {
          if (!clientMap.has(client.id)) {
              clientMap.set(client.id, client);
          }
      });
      const clientsData = Array.from(clientMap.values());
      
      setClients(clientsData);
      
      // If no clients are found, set default stats and return early to avoid unnecessary API calls for videos/posts/analytics
      if (clientsData.length === 0) {
        setStats({
          totalClients: 0,
          totalVideos: 0,
          recentUploads: 0,
          scheduledPosts: 0,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          avgEngagement: 0
        });
        setIsLoading(false);
        return; // Exit early as there's no data to fetch for videos, posts, analytics
      }

      // Only proceed to fetch more data if clients exist
      const clientIds = clientsData.map(c => c.id);
      
      // Add another delay before the next set of parallel calls
      await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay

      const [videosData, postsData, analyticsData] = await Promise.all([
        VideoAsset.list(),
        ScheduledPost.list('-updated_date', 10),
        Analytics.list()
      ]);

      const userVideos = videosData.filter(v => clientIds.includes(v.client_id));
      const userPosts = postsData.filter(p => clientIds.includes(p.client_id));
      const userAnalytics = analyticsData.filter(a => clientIds.includes(a.client_id));
      
      setVideos(userVideos);
      setRecentPosts(userPosts);
      setAnalytics(userAnalytics);

      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const recentVideos = userVideos.filter(v => new Date(v.created_date) >= weekAgo);
      const scheduledPostsCount = userPosts.filter(p => p.status === 'scheduled').length;

      // חישוב מדדי ביצוע מהאנליטיקות
      const last7DaysAnalytics = userAnalytics.filter(a => {
        const analyticsDate = new Date(a.date);
        return analyticsDate >= weekAgo;
      });

      const totalViews = last7DaysAnalytics.reduce((sum, a) => sum + (a.metrics?.views || 0), 0);
      const totalLikes = last7DaysAnalytics.reduce((sum, a) => sum + (a.metrics?.likes || 0), 0);
      const totalComments = last7DaysAnalytics.reduce((sum, a) => sum + (a.metrics?.comments || 0), 0);
      const avgEngagement = last7DaysAnalytics.length > 0 
        ? last7DaysAnalytics.reduce((sum, a) => sum + (a.metrics?.engagement_rate || 0), 0) / last7DaysAnalytics.length
        : 0;
      
      setStats({
        totalClients: clientsData.length,
        totalVideos: userVideos.length,
        recentUploads: recentVideos.length,
        scheduledPosts: scheduledPostsCount,
        totalViews,
        totalLikes,
        totalComments,
        avgEngagement
      });

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Per outline: "אל תציג alert - רק לוג" (Don't show alert - just log)
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, setClients, setStats, setIsLoading, setVideos, setRecentPosts, setAnalytics]); // Dependency array: only currentUser. Setters are stable.

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]); // Now loadDashboardData is available as a dependency

  const getPostStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'publishing': return 'bg-yellow-100 text-yellow-800';
      case 'published': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // נתוני גרף המגמה לשבוע האחרון
  const getWeeklyTrendData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = format(date, 'yyyy-MM-dd');
      
      const dayAnalytics = analytics.filter(a => a.date === dayStr);
      days.push({
        date: format(date, 'dd/MM'),
        views: dayAnalytics.reduce((sum, a) => sum + (a.metrics?.views || 0), 0),
        engagement: dayAnalytics.reduce((sum, a) => sum + (a.metrics?.engagement_rate || 0), 0)
      });
    }
    return days;
  };

  // נתוני התפלגות פלטפורמות
  const getPlatformData = () => {
    const platformStats = {};
    
    recentPosts.forEach(post => {
      post.platforms?.forEach(platform => {
        if (!platformStats[platform]) {
          platformStats[platform] = { name: platform, value: 0 };
        }
        platformStats[platform].value += 1;
      });
    });

    return Object.values(platformStats);
  };

  // הפוסטים הכי מצליחים
  const getTopPosts = () => {
    return recentPosts
      .filter(post => post.status === 'published')
      .map(post => {
        const postAnalytics = analytics.filter(a => a.post_id === post.id);
        const totalViews = postAnalytics.reduce((sum, a) => sum + (a.metrics?.views || 0), 0);
        const video = videos.find(v => v.id === post.video_id);
        const client = clients.find(c => c.id === post.client_id);
        
        return { ...post, totalViews, video, client };
      })
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 5);
  };

  const weeklyData = getWeeklyTrendData();
  const platformData = getPlatformData();
  const topPosts = getTopPosts();

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="modern-card p-12 text-center rounded-2xl">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">טוען נתוני דשבורד...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full overflow-x-hidden">
        
        {/* Header */}
        <div className="text-center py-4 sm:py-6">
          <div className="flex flex-col items-center gap-3 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
              <Star className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="text-center px-2">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800 mb-1 break-words">
                שלום {currentUser?.full_name || 'משתמש'}! 👋
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 font-medium px-2">
                ברוך הבא ל-Clockit. הנה סיכום הפעילות שלך.
              </p>
            </div>
          </div>
          
          {clients.length === 0 && (
            <div className="modern-card p-4 sm:p-6 rounded-xl sm:rounded-2xl max-w-2xl mx-auto">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                מתחילים לעבוד! 🎉
              </h3>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-2">
                הצעד הראשון הוא להוסיף את הלקוח הראשון שלך.
              </p>
              <Link to={createPageUrl("Clients")}>
                <button className="modern-button px-4 sm:px-6 py-3 text-white font-semibold text-sm sm:text-base rounded-xl sm:rounded-2xl flex items-center gap-2 mx-auto">
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                  צור לקוח ראשון
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="modern-card p-4 sm:p-6 rounded-xl sm:rounded-2xl">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2">פעולות מהירות</h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600">הדברים החשובים במרחק לחיצה</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* העלאת וידאו */}
            <Link to={createPageUrl("VideoUpload")} className="group block">
              <div className="modern-card p-4 sm:p-6 text-center rounded-xl sm:rounded-2xl transition-all duration-300 h-full flex flex-col">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg flex-shrink-0">
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">העלה וידאו</h3>
                <p className="text-gray-600 mb-3 sm:mb-4 leading-relaxed text-sm flex-grow px-1">העלה עד 20 סרטונים ביחד</p>
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold shadow-lg text-sm">
                  התחל כאן 
                </div>
              </div>
            </Link>

            {/* תזמון פרסום */}
            <Link to={createPageUrl("Schedule")} className="group block">
              <div className="modern-card p-4 sm:p-6 text-center rounded-xl sm:rounded-2xl transition-all duration-300 h-full flex flex-col">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg flex-shrink-0">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">תזמן פרסום</h3>
                <p className="text-gray-600 mb-3 sm:mb-4 leading-relaxed text-sm flex-grow px-1">קבע מתי הסרטונים יפורסמו</p>
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold shadow-lg text-sm">
                  אוטומטי
                </div>
              </div>
            </Link>

            {/* ניהול לקוחות */}
            <Link to={createPageUrl("Clients")} className="group block">
              <div className="modern-card p-4 sm:p-6 text-center rounded-xl sm:rounded-2xl transition-all duration-300 h-full flex flex-col">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg flex-shrink-0">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">ניהול לקוחות</h3>
                <p className="text-gray-600 mb-3 sm:mb-4 leading-relaxed text-sm flex-grow px-1">הוסף וערוך לקוחות בקלות</p>
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold shadow-lg text-sm">
                  קל לנהל
                </div>
              </div>
            </Link>

          </div>
        </div>

        {/* Analytics Overview */}
        {analytics.length > 0 && (
          <div className="modern-card p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">ביצועים השבוע</h2>
                  <p className="text-sm sm:text-base text-gray-600">סיכום מדדי הביצוע ב-7 הימים האחרונים</p>
                </div>
              </div>
              <Link to={createPageUrl("Analytics")}>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base px-3 sm:px-4 py-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">אנליטיקות מלאות</span>
                  <span className="sm:hidden">אנליטיקות</span>
                </Button>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="modern-card p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">צפיות</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600">{stats.totalViews?.toLocaleString() || 0}</p>
                  </div>
                  <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
                </div>
              </div>

              <div className="modern-card p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">לייקים</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">{stats.totalLikes?.toLocaleString() || 0}</p>
                  </div>
                  <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                </div>
              </div>

              <div className="modern-card p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">תגובות</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{stats.totalComments?.toLocaleString() || 0}</p>
                  </div>
                  <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                </div>
              </div>

              <div className="modern-card p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">מעורבות</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-teal-600">{stats.avgEngagement?.toFixed(1) || 0}%</p>
                  </div>
                  <Target className="w-6 h-6 sm:w-8 sm:h-8 text-teal-500" />
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Weekly Trend Chart */}
              <div className="modern-card p-4 sm:p-6 rounded-lg sm:rounded-xl">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">מגמת צפיות שבועית</h3>
                <div className="h-40 sm:h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="views" stroke="#8b5cf6" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Platform Distribution */}
              <div className="modern-card p-4 sm:p-6 rounded-lg sm:rounded-xl">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">התפלגות פלטפורמות</h3>
                <div className="h-40 sm:h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={platformData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                      >
                        {platformData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PLATFORM_COLORS[entry.name] || '#8884d8'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Top Posts */}
            {topPosts.length > 0 && (
              <div className="mt-4 sm:mt-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                  הפוסטים הכי מצליחים השבוע
                </h3>
                <div className="space-y-3">
                  {topPosts.map((post, index) => (
                    <div key={post.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg sm:rounded-xl border border-gray-100">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                          {post.video?.filename || 'וידאו לא נמצא'}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {post.client?.name} • {post.totalViews.toLocaleString()} צפיות
                        </p>
                      </div>

                      <div className="flex gap-1 flex-shrink-0">
                        {post.platforms?.slice(0, 3).map(platform => (
                          <div
                            key={platform}
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: PLATFORM_COLORS[platform] }}
                            title={platform}
                          >
                            {platform.charAt(0).toUpperCase()}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="modern-card p-4 sm:p-6 rounded-xl sm:rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">סה"כ לקוחות</p>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">{stats.totalClients || 0}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="modern-card p-4 sm:p-6 rounded-xl sm:rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">סה"כ וידאו</p>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">{stats.totalVideos || 0}</p>
                <p className="text-green-500 text-xs sm:text-sm font-semibold">+{stats.recentUploads || 0} השבוע</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <FileVideo className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="modern-card p-4 sm:p-6 rounded-xl sm:rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">פוסטים מתוזמנים</p>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">{stats.scheduledPosts || 0}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="modern-card p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">פוסטים אחרונים</h2>
            </div>
            <Link to={createPageUrl("Schedule") + "?tab=queue"}>
              <button className="modern-button px-4 sm:px-6 py-2 sm:py-3 text-white font-medium rounded-lg sm:rounded-xl text-sm sm:text-base">
                צפה בהכל
              </button>
            </Link>
          </div>
          
          {recentPosts.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="font-bold text-lg sm:text-xl text-gray-700 mb-3">אין פוסטים עדיין</h3>
              <p className="text-gray-500 mb-6 sm:mb-8 text-base sm:text-lg px-4">התחל ליצור ולתזמן פוסטים מדהימים</p>
              <Link to={createPageUrl("Schedule")}>
                <button className="modern-button px-6 sm:px-8 py-3 sm:py-4 text-white font-semibold rounded-xl sm:rounded-2xl flex items-center gap-3 mx-auto">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  צור פוסט ראשון
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {recentPosts.slice(0, 5).map(post => {
                const client = clients.find(c => c.id === post.client_id);
                const video = videos.find(v => v.id === post.video_id);

                return (
                  <div key={post.id} className="flex items-center justify-between p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl sm:rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
                      <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0 ${post.status === 'published' ? 'bg-green-500' : post.status === 'scheduled' ? 'bg-blue-500' : post.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'}`} />
                      <h4 className="font-semibold text-gray-900 truncate text-sm sm:text-base md:text-lg">
                        {video?.filename || 'וידאו לא נמצא'}
                      </h4>
                      <p className="text-gray-600 truncate text-xs sm:text-sm">
                        {client?.name || 'לקוח לא ידוע'} • {format(new Date(post.scheduled_time), 'dd/MM HH:mm')}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold ${getPostStatusColor(post.status)}`}>
                        {post.status === 'scheduled' ? 'מתוזמן' : post.status === 'published' ? 'פורסם' : post.status === 'failed' ? 'נכשל' : post.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
    </div>
  );
}
