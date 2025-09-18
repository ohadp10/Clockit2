import { subDays, format } from 'date-fns';

// This is a mock service simulating a backend endpoint for a SINGLE CLIENT.
// It generates a response that adheres to the AnalyticsDashboardResponse contract.

const PLATFORMS = ['instagram', 'youtube', 'facebook', 'tiktok', 'x', 'linkedin', 'threads'];

const generateTimeseries = (range) => {
  const points = [];
  const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    points.push({
      date: format(date, 'yyyy-MM-dd'),
      views: Math.floor(Math.random() * (10000 - 500 + 1) + 500),
      likes: Math.floor(Math.random() * (500 - 20 + 1) + 20),
      comments: Math.floor(Math.random() * (50 - 5 + 1) + 5),
      shares: Math.random() > 0.3 ? Math.floor(Math.random() * (20 - 0 + 1) + 0) : null, // Some platforms have null shares
    });
  }
  return { points };
};

const generatePlatformBreakdown = (timeseries) => {
  const breakdown = PLATFORMS.map(platform => {
    const platformMultiplier = Math.random() + 0.5;
    const total = timeseries.points.reduce((acc, point) => {
      acc.views += Math.floor(point.views * platformMultiplier / PLATFORMS.length);
      acc.likes += Math.floor(point.likes * platformMultiplier / PLATFORMS.length);
      acc.comments += Math.floor(point.comments * platformMultiplier / PLATFORMS.length);
      if (point.shares !== null) {
          acc.shares += Math.floor(point.shares * platformMultiplier / PLATFORMS.length);
      }
      return acc;
    }, { views: 0, likes: 0, comments: 0, shares: 0, posts: Math.floor(Math.random() * 20) });

    total.engagementRate = (total.likes + total.comments + (total.shares || 0)) / Math.max(total.views, 1);
    
    return { platform, ...total };
  });
  return breakdown;
};

const generateKpis = (platformBreakdown) => {
  return platformBreakdown.reduce((acc, platform) => {
    acc.views += platform.views;
    acc.likes += platform.likes;
    acc.comments += platform.comments;
    acc.shares += (platform.shares || 0);
    acc.posts += platform.posts;
    return acc;
  }, { views: 0, likes: 0, comments: 0, shares: 0, posts: 0, engagementRate: 0 });
};

const generateTopPosts = (range) => {
    const posts = [];
    const count = 10;
    for(let i = 0; i < count; i++) {
        const platform = PLATFORMS[Math.floor(Math.random()*PLATFORMS.length)];
        const views = Math.floor(Math.random() * 50000);
        const likes = Math.floor(views * (Math.random() * 0.1));
        const comments = Math.floor(likes * (Math.random() * 0.1));
        const shares = Math.random() > 0.3 ? Math.floor(likes * (Math.random() * 0.05)) : null;
        
        posts.push({
            id: `post_${i}_${Date.now()}`,
            platform,
            postUrl: 'https://www.instagram.com/p/C03g-CHrk9M/',
            thumbnailUrl: `https://picsum.photos/seed/${i * 10}/400/300`,
            caption: `This is a sample top post #${i+1} for ${platform}. It's doing great! #sample #analytics`,
            postedAt: subDays(new Date(), Math.floor(Math.random() * (range === '7d' ? 7 : 30))).toISOString(),
            views,
            likes,
            comments,
            shares,
            engagementRate: (likes + comments + (shares || 0)) / Math.max(views, 1),
        });
    }
    return posts.sort((a,b) => b.views - a.views);
}

export const getAnalyticsDashboard = async ({ clientId, platform, range, granularity = 'day' }) => {
  // This function now strictly requires a clientId.
  if (!clientId) {
    throw new Error("clientId is required to fetch analytics.");
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 200));

  const timeseries = generateTimeseries(range);
  let platformBreakdown = generatePlatformBreakdown(timeseries);
  let topPosts = generateTopPosts(range);

  if (platform !== 'all') {
    platformBreakdown = platformBreakdown.filter(p => p.platform === platform);
    topPosts = topPosts.filter(p => p.platform === platform);
  }

  const kpis = generateKpis(platformBreakdown);
  kpis.engagementRate = (kpis.likes + kpis.comments + kpis.shares) / Math.max(kpis.views, 1);
  
  // Occasionally return nulls to test UI resilience
  if (Math.random() > 0.8) {
      kpis.shares = null;
  }

  const response = {
    context: {
      clientId,
      platform,
      range,
      granularity,
      updatedAt: new Date().toISOString(),
    },
    kpis,
    timeseries,
    platformBreakdown,
    topPosts,
  };

  return response;
};