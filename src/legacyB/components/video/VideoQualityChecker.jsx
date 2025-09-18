
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Eye,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  Settings,
  TrendingUp
} from "lucide-react";

// The platformRequirements object is defined outside the component to be a stable constant,
// avoiding re-creation on every render and potential issues with React Hooks dependencies.
const platformRequirements = {
  tiktok: {
    name: 'TikTok',
    optimal: {
      aspect_ratio: '9:16',
      duration: { min: 15, max: 180 },
      resolution: { min: 720, optimal: 1080 },
      file_size: { max: 75 }
    }
  },
  instagram: {
    name: 'Instagram',
    optimal: {
      aspect_ratio: ['9:16', '1:1'],
      duration: { min: 3, max: 90 },
      resolution: { min: 720, optimal: 1080 },
      file_size: { max: 50 }
    }
  },
  facebook: {
    name: 'Facebook',
    optimal: {
      aspect_ratio: ['16:9', '1:1'],
      duration: { min: 3, max: 240 },
      resolution: { min: 720, optimal: 1080 },
      file_size: { max: 100 }
    }
  },
  youtube: {
    name: 'YouTube',
    optimal: {
      aspect_ratio: ['16:9', '9:16'],
      duration: { min: 60, max: 900 },
      resolution: { min: 1080, optimal: 1920 },
      file_size: { max: 500 }
    }
  }
};

export default function VideoQualityChecker({ video, targetPlatforms = ['instagram', 'tiktok'] }) {
  const [qualityScore, setQualityScore] = useState(null);
  const [platformChecks, setPlatformChecks] = useState({});

  const validateForPlatform = useCallback((videoData, platform) => {
    // platformRequirements is a global constant, so it doesn't need to be in the dependency array.
    const reqs = platformRequirements[platform];
    if (!reqs) return { issues: [], warnings: [] }; // Removed score, it's calculated elsewhere

    const issues = [];
    const warnings = [];

    // בדיקת יחס מסך (Aspect Ratio)
    const expectedRatio = Array.isArray(reqs.optimal.aspect_ratio) 
      ? reqs.optimal.aspect_ratio 
      : [reqs.optimal.aspect_ratio];
    
    if (!expectedRatio.includes(videoData.aspect_ratio)) {
      warnings.push(`יחס מסך ${videoData.aspect_ratio} לא אופטימלי ל-${reqs.name}`);
    }

    // בדיקת משך (Duration)
    if (videoData.duration_seconds < reqs.optimal.duration.min) {
      issues.push(`וידאו קצר מדי ל-${reqs.name} (${videoData.duration_seconds}s < ${reqs.optimal.duration.min}s)`);
    } else if (videoData.duration_seconds > reqs.optimal.duration.max) {
      warnings.push(`וידאו ארוך ל-${reqs.name} (${videoData.duration_seconds}s > ${reqs.optimal.duration.max}s)`);
    }

    // בדיקת רזולוציה (Resolution)
    if (videoData.resolution.width < reqs.optimal.resolution.min) {
      issues.push(`רזולוציה נמוכה ל-${reqs.name} (${videoData.resolution.width}p < ${reqs.optimal.resolution.min}p)`);
    }

    // בדיקת גודל קובץ (File Size)
    if (videoData.file_size_mb > reqs.optimal.file_size.max) {
      issues.push(`קובץ גדול מדי ל-${reqs.name} (${videoData.file_size_mb}MB > ${reqs.optimal.file_size.max}MB)`);
    }

    return { issues, warnings };
  }, []); // Empty dependency array as platformRequirements is global

  const calculatePlatformScore = useCallback((videoData, platform, validation) => {
    let score = 100;
    
    // ניכוי נקודות עבור בעיות (Deduct points for issues)
    score -= validation.issues.length * 30;
    score -= validation.warnings.length * 10;
    
    // בונוס עבור תאימות מלאה (Bonus for full compatibility)
    const reqs = platformRequirements[platform]; // platformRequirements is a global constant
    const expectedRatio = Array.isArray(reqs.optimal.aspect_ratio) 
      ? reqs.optimal.aspect_ratio 
      : [reqs.optimal.aspect_ratio];
    
    if (expectedRatio.includes(videoData.aspect_ratio)) score += 10;
    if (videoData.duration_seconds >= reqs.optimal.duration.min && 
        videoData.duration_seconds <= reqs.optimal.duration.max) score += 10;
    if (videoData.resolution.width >= reqs.optimal.resolution.optimal) score += 10;
    
    return Math.max(0, Math.min(100, score));
  }, []); // Empty dependency array as platformRequirements is global

  const performGeneralQualityChecks = useCallback((videoData) => {
    const checks = [];
    
    // בדיקת רזולוציה (Resolution Check)
    if (videoData.resolution.width >= 1080) {
      checks.push({ type: 'success', message: 'רזולוציה גבוהה (HD+)' });
    } else if (videoData.resolution.width >= 720) {
      checks.push({ type: 'warning', message: 'רזולוציה בינונית (HD)' });
    } else {
      checks.push({ type: 'error', message: 'רזולוציה נמוכה - עלולה להשפיע על איכות' });
    }

    // בדיקת Bitrate (Bitrate Check)
    if (videoData.bitrate >= 3000) {
      checks.push({ type: 'success', message: 'איכות וידאו מעולה' });
    } else if (videoData.bitrate >= 1000) {
      checks.push({ type: 'warning', message: 'איכות וידאו סבירה' });
    } else {
      checks.push({ type: 'error', message: 'איכות וידאו נמוכה' });
    }

    // בדיקת FPS (FPS Check)
    if (videoData.fps >= 30) {
      checks.push({ type: 'success', message: 'FPS מתאים לרשתות חברתיות' });
    } else {
      checks.push({ type: 'warning', message: 'FPS נמוך - עלול להיראות קטוע' });
    }

    // בדיקת גודל קובץ (File Size Check)
    if (videoData.file_size_mb > 50) {
      checks.push({ type: 'error', message: 'קובץ גדול מדי - עלול להכשיל בהעלאה' });
    } else if (videoData.file_size_mb > 25) {
      checks.push({ type: 'warning', message: 'קובץ גדול - עלול להעלות לאט' });
    }

    return checks;
  }, []);

  const generateRecommendations = useCallback((videoData, platformResults) => {
    const recommendations = [];

    // המלצות כלליות (General Recommendations)
    if (videoData.file_size_mb > 25) {
      recommendations.push({
        type: 'optimization',
        title: 'דחיסת וידאו',
        description: 'שקול לדחוס את הוידאו לגודל קטן יותר לביצועים מיטביים'
      });
    }

    if (videoData.aspect_ratio === '16:9' && targetPlatforms.includes('tiktok')) {
      recommendations.push({
        type: 'format',
        title: 'יחס מסך ל-TikTok',
        description: 'המר ליחס 9:16 לביצועים מיטביים ב-TikTok'
      });
    }

    // המלצות ספציפיות לפלטפורמה (Platform-specific Recommendations)
    Object.entries(platformResults).forEach(([platform, result]) => {
      if (result.warnings && result.warnings.length > 0) {
        recommendations.push({
          type: 'warning',
          title: `אופטימיזציה ל-${platform}`,
          description: result.warnings.join(', ')
        });
      }
    });

    return recommendations;
  }, [targetPlatforms]); // Depends on targetPlatforms prop

  const performQualityCheck = useCallback(() => {
    // Ensure video object and its properties are safely accessed
    const videoData = {
      duration_seconds: video?.duration_seconds || 0,
      file_size_mb: video?.file_size_mb || 0,
      aspect_ratio: video?.aspect_ratio || '16:9',
      resolution: video?.resolution || { width: 1920, height: 1080 },
      bitrate: video?.bitrate || 2000,
      fps: video?.fps || 30
    };

    let totalScore = 0;
    let maxScore = 0;
    const platformResults = {};

    // בדיקה לכל פלטפורמה (Check for each platform)
    targetPlatforms.forEach(platform => {
      const validation = validateForPlatform(videoData, platform);
      const score = calculatePlatformScore(videoData, platform, validation);
      
      platformResults[platform] = {
        score,
        issues: validation.issues,
        warnings: validation.warnings,
        suitable: validation.issues.length === 0
      };

      totalScore += score;
      maxScore += 100;
    });

    // בדיקות איכות כלליות (General Quality Checks)
    const generalChecks = performGeneralQualityChecks(videoData);
    
    const overallScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    
    setQualityScore({
      overall: overallScore,
      general: generalChecks,
      platforms: platformResults,
      recommendations: generateRecommendations(videoData, platformResults)
    });
    
    setPlatformChecks(platformResults);
  }, [video, targetPlatforms, validateForPlatform, calculatePlatformScore, performGeneralQualityChecks, generateRecommendations]); // Dependencies for performQualityCheck

  // useEffect hook to trigger the quality check when the video prop changes
  useEffect(() => {
    if (video) {
      performQualityCheck();
    }
  }, [video, performQualityCheck]);

  // Helper functions for UI styling
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getCheckIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  // Render loading state if video data or quality score is not yet available
  if (!video || !qualityScore) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-6 text-center text-gray-500">
          <Eye className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>טוען בדיקת איכות...</p>
        </CardContent>
      </Card>
    );
  }

  // Main component rendering
  return (
    <div className="space-y-4">
      {/* ציון כללי (Overall Score) */}
      <Card className={`border-0 shadow-md ${getScoreBg(qualityScore.overall)}`}>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Eye className="w-6 h-6 text-gray-700" />
            <h3 className="text-lg font-semibold">ציון איכות כללי</h3>
          </div>
          <div className={`text-4xl font-bold mb-2 ${getScoreColor(qualityScore.overall)}`}>
            {qualityScore.overall}%
          </div>
          <Progress value={qualityScore.overall} className="mb-4" />
          {qualityScore.overall >= 80 && (
            <p className="text-green-700 font-medium">מעולה! הוידאו מתאים לכל הפלטפורמות</p>
          )}
          {qualityScore.overall >= 60 && qualityScore.overall < 80 && (
            <p className="text-yellow-700 font-medium">טוב, עם כמה שיפורים אפשריים</p>
          )}
          {qualityScore.overall < 60 && (
            <p className="text-red-700 font-medium">נדרשים שיפורים לפני פרסום</p>
          )}
        </CardContent>
      </Card>

      {/* בדיקות לפי פלטפורמה (Platform Compatibility Checks) */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            תאימות לפלטפורמות
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(qualityScore.platforms).map(([platform, result]) => (
            <div key={platform} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getScoreBg(result.score)}`}>
                  <span className={`font-bold ${getScoreColor(result.score)}`}>
                    {result.score}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium">{platformRequirements[platform]?.name || platform}</h4> {/* Added optional chaining for safety */}
                  <div className="flex gap-2 mt-1">
                    {result.suitable ? (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        מתאים
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 text-xs">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        בעיות
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-left">
                {result.issues && result.issues.map((issue, i) => (
                  <p key={i} className="text-xs text-red-600">• {issue}</p>
                ))}
                {result.warnings && result.warnings.map((warning, i) => (
                  <p key={i} className="text-xs text-yellow-600">⚠ {warning}</p>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* בדיקות כלליות (Technical Checks) */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            בדיקות טכניות
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {qualityScore.general.map((check, index) => (
            <div key={index} className="flex items-center gap-2 p-2">
              {getCheckIcon(check.type)}
              <span className={`text-sm ${
                check.type === 'success' ? 'text-green-700' :
                check.type === 'warning' ? 'text-yellow-700' : 'text-red-700'
              }`}>
                {check.message}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* המלצות (Recommendations) */}
      {qualityScore.recommendations.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-600" />
              המלצות לשיפור
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {qualityScore.recommendations.map((rec, index) => (
              <Alert key={index} className="border-orange-200 bg-orange-50">
                <Info className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>{rec.title}:</strong> {rec.description}
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
