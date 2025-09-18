
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  FileText,
  RefreshCw,
  Download,
  Award,
  Info,
  Users
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Client } from '@/legacyB/_compat/entities';
import { User } from '@/legacyB/_compat/entities';
import { getAnalyticsDashboard } from '@/legacyB/components/analytics/AyrshareAnalyticsService';
import { format, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';

const PLATFORM_COLORS = {
  tiktok: '#000000',
  instagram: '#E4405F',
  facebook: '#1877F2',
  youtube: '#FF0000',
  x: '#1DA1F2',
  linkedin: '#0A66C2',
  threads: '#000000'
};

const rangeMap = { '7days': '7d', '30days': '30d', '90days': '90d' };
const periodOptions = [
    { value: '7days', label: '7 ימים אחרונים' },
    { value: '30days', label: '30 ימים אחרונים' },
    { value: '90days', label: '90 ימים אחרונים' }
];
const platformOptions = [
    { value: 'all', label: 'כל הפלטפורמות' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'x', label: 'X (Twitter)' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'threads', label: 'Threads' }
];

const formatNumber = (num) => num != null ? num.toLocaleString() : '—';

const KpiCard = ({ title, value, icon: Icon, color, tooltipText }) => (
  <Card className="border-0 shadow-lg">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3 h-3 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tooltipText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
    </CardContent>
  </Card>
);

export default function Analytics() {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInitialClients = async () => {
      try {
        const user = await User.me();
        const [myClients, sampleClients] = await Promise.all([
          Client.filter({ owner_email: user.email }),
          Client.filter({ owner_email: "user@example.com" })
        ]);
        const clientMap = new Map();
        myClients.forEach(client => clientMap.set(client.id, client));
        sampleClients.forEach(client => {
          if (!clientMap.has(client.id)) clientMap.set(client.id, client);
        });
        const allClients = Array.from(clientMap.values());
        setClients(allClients);

        if (allClients.length > 0 && !selectedClientId) {
          setSelectedClientId(allClients[0].id);
        } else if (allClients.length === 0) {
          setIsLoading(false); // No clients, stop loading
        }
      } catch (err) {
        console.error('Error loading initial client data:', err);
        setError('שגיאה בטעינת רשימת הלקוחות.');
        setIsLoading(false);
      }
    };
    loadInitialClients();
  }, [selectedClientId]); // Added selectedClientId to the dependency array

  const fetchDashboardData = useCallback(async () => {
    if (!selectedClientId) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await getAnalyticsDashboard({
        clientId: selectedClientId,
        platform: selectedPlatform,
        range: rangeMap[selectedPeriod],
      });
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching analytics dashboard:', err);
      setError('שגיאה בטעינת נתוני האנליטיקות. נסה שוב.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedClientId, selectedPeriod, selectedPlatform]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const refreshAnalytics = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  const { kpis, timeseries, platformBreakdown, topPosts, context } = dashboardData || {};

  const kpiCards = [
    { title: 'סה"כ פוסטים', value: formatNumber(kpis?.posts), icon: FileText, color: 'text-blue-600', tooltip: 'מספר הפוסטים שפורסמו בטווח הזמן הנבחר.' },
    { title: 'סה"כ צפיות', value: formatNumber(kpis?.views), icon: Eye, color: 'text-purple-600', tooltip: 'סך כל הצפיות/חשיפות. ההגדרה משתנה בין פלטפורמות.' },
    { title: 'סה"כ לייקים', value: formatNumber(kpis?.likes), icon: Heart, color: 'text-red-600', tooltip: 'סך כל הלייקים על הפוסטים.' },
    { title: 'סה"כ תגובות', value: formatNumber(kpis?.comments), icon: MessageCircle, color: 'text-green-600', tooltip: 'סך כל התגובות על הפוסטים.' },
    { title: 'סה"כ שיתופים', value: formatNumber(kpis?.shares), icon: Share2, color: 'text-orange-600', tooltip: 'סך כל השיתופים. לא זמין בכל הפלטפורמות.' },
    { title: 'אחוז מעורבות', value: kpis?.engagementRate != null ? `${(kpis.engagementRate * 100).toFixed(1)}%` : '—', icon: TrendingUp, color: 'text-teal-600', tooltip: 'יחס המעורבות (לייקים, תגובות, שיתופים) לצפיות.' },
  ];

  if (clients.length === 0 && !isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <Users className="w-20 h-20 text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-700">לא נמצאו לקוחות</h2>
            <p className="text-gray-500 mt-2">יש להוסיף לקוח בדף "ניהול לקוחות" כדי לראות אנליטיקות.</p>
        </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full overflow-x-hidden">
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                אנליטיקות ביצועים
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">מדדי ביצוע מפורטים עבור הלקוח הנבחר</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              {context?.updatedAt && (
                <p className="text-xs text-gray-500 whitespace-nowrap">
                  עודכן: {format(parseISO(context.updatedAt), 'dd/MM/yy HH:mm')}
                </p>
              )}
              <div className="flex gap-3">
                <Button onClick={refreshAnalytics} disabled={isRefreshing || !selectedClientId} variant="outline" className="gap-2 text-xs sm:text-sm px-3 py-2">
                  <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'מרענן...' : 'רענן'}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">לקוח</label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId} disabled={clients.length === 0}>
                <SelectTrigger><SelectValue placeholder="בחר לקוח..." /></SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">תקופה</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod} disabled={!selectedClientId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{periodOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">פלטפורמה</label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform} disabled={!selectedClientId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{platformOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isLoading && <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}
      {error && !isLoading && <div className="text-red-500 text-center bg-red-50 p-4 rounded-lg">{error}</div>}

      {dashboardData && !isLoading && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
            {kpiCards.map(kpi => <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} icon={kpi.icon} color={kpi.color} tooltipText={kpi.tooltip} />)}
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <div className="w-full mb-4">
              <TabsList className="w-full h-auto p-1 grid grid-cols-3 bg-gray-100 rounded-lg">
                <TabsTrigger value="overview" className="text-xs sm:text-sm py-2 px-1 data-[state=active]:bg-white">
                  <span className="hidden sm:inline">סקירה כללית</span>
                  <span className="sm:hidden">סקירה</span>
                </TabsTrigger>
                <TabsTrigger value="platforms" className="text-xs sm:text-sm py-2 px-1 data-[state=active]:bg-white">
                  <span className="hidden sm:inline">פירוט פלטפורמות</span>
                  <span className="sm:hidden">פלטפורמות</span>
                </TabsTrigger>
                <TabsTrigger value="posts" className="text-xs sm:text-sm py-2 px-1 data-[state=active]:bg-white">
                  <span className="hidden sm:inline">פוסטים מובילים</span>
                  <span className="sm:hidden">פוסטים</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="overview" className="space-y-4 sm:space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader><CardTitle className="text-base sm:text-lg">מגמת ביצועים יומית</CardTitle></CardHeader>
                <CardContent className="p-2 sm:p-6">
                  <div className="h-48 sm:h-64 lg:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeseries?.points} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(d) => format(parseISO(d), 'dd/MM')} />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Area type="monotone" dataKey="views" stackId="1" stroke="#8884d8" fill="#8884d8" name="צפיות" />
                        <Area type="monotone" dataKey="likes" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="לייקים" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="platforms" className="space-y-4 sm:space-y-6">
                <Card className="border-0 shadow-lg">
                    <CardHeader><CardTitle className="text-base sm:text-lg">ביצועים לפי פלטפורמה</CardTitle></CardHeader>
                    <CardContent className="p-0 sm:p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500" style={{ minWidth: '600px' }}>
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-3 py-3 text-right">פלטפורמה</th>
                                        <th scope="col" className="px-3 py-3 text-center">פוסטים</th>
                                        <th scope="col" className="px-3 py-3 text-center">צפיות</th>
                                        <th scope="col" className="px-3 py-3 text-center">לייקים</th>
                                        <th scope="col" className="px-3 py-3 text-center">תגובות</th>
                                        <th scope="col" className="px-3 py-3 text-center">שיתופים</th>
                                        <th scope="col" className="px-3 py-3 text-center">מעורבות</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {platformBreakdown?.map(p => (
                                    <tr key={p.platform} className="bg-white border-b hover:bg-gray-50">
                                        <th scope="row" className="px-3 py-4 font-medium text-gray-900 whitespace-nowrap flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[p.platform] }}></div>
                                          <span className="text-xs sm:text-sm">{p.platform}</span>
                                        </th>
                                        <td className="px-3 py-4 text-center text-xs sm:text-sm">{formatNumber(p.posts)}</td>
                                        <td className="px-3 py-4 text-center text-xs sm:text-sm">{formatNumber(p.views)}</td>
                                        <td className="px-3 py-4 text-center text-xs sm:text-sm">{formatNumber(p.likes)}</td>
                                        <td className="px-3 py-4 text-center text-xs sm:text-sm">{formatNumber(p.comments)}</td>
                                        <td className="px-3 py-4 text-center text-xs sm:text-sm">{formatNumber(p.shares)}</td>
                                        <td className="px-3 py-4 text-center text-xs sm:text-sm">{p.engagementRate != null ? `${(p.engagementRate * 100).toFixed(1)}%` : '—'}</td>
                                    </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="posts" className="space-y-4 sm:space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader><CardTitle className="flex items-center gap-2 text-base sm:text-lg"><Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />הפוסטים המצליחים ביותר</CardTitle></CardHeader>
                <CardContent className="p-3 sm:p-6">
                  {topPosts && topPosts.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">{topPosts.map((post, index) => (
                      <div key={post.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-gray-50">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">{index + 1}</div>
                        <img src={post.thumbnailUrl} alt="Post thumbnail" className="w-12 h-9 sm:w-16 sm:h-12 object-cover rounded flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate text-sm sm:text-base" title={post.caption}>{post.caption || 'ללא כיתוב'}</h4>
                          <p className="text-xs sm:text-sm text-gray-500">{format(parseISO(post.postedAt), 'dd/MM/yyyy')}</p>
                          <div className="flex gap-2 sm:gap-4 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {formatNumber(post.views)}</span>
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {formatNumber(post.likes)}</span>
                            <span className="flex items-center gap-1 hidden sm:flex"><TrendingUp className="w-3 h-3" /> {post.engagementRate != null ? `${(post.engagementRate * 100).toFixed(1)}%` : '—'}</span>
                          </div>
                        </div>
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: PLATFORM_COLORS[post.platform] }} title={post.platform}>{post.platform.charAt(0).toUpperCase()}</div>
                      </div>))}
                    </div>) : (
                    <p className="text-center text-gray-500 py-8">אין נתונים על פוסטים מובילים עבור בחירה זו.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
