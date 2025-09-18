
import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Clock, Mail, User, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import * as Auth from '../components/auth/authApi';
import OtpInput from '../components/auth/OtpInput';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AuthPage({ onAuthSuccess }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showSignupOtp, setShowSignupOtp] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState('email'); // 'email', 'otp'
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  
  // Login form state
  const [loginData, setLoginData] = useState({
    login: '',
    password: ''
  });
  const [loginErrors, setLoginErrors] = useState({});

  // Sign-up form state
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [signupErrors, setSignupErrors] = useState({});
  const [signupOtp, setSignupOtp] = useState('');
  const [signupOtpError, setSignupOtpError] = useState('');

  // Forgot password state
  const [forgotData, setForgotData] = useState({
    email: '',
    otp: ''
  });
  const [forgotErrors, setForgotErrors] = useState({});

  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, text: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score < 2) return { level: 1, text: 'חלשה', color: 'bg-red-500' };
    if (score < 4) return { level: 2, text: 'בינונית', color: 'bg-yellow-500' };
    return { level: 3, text: 'חזקה', color: 'bg-green-500' };
  };

  const validateUsername = (username) => {
    if (!username) return 'יש להזין שם משתמש';
    if (username.length < 3 || username.length > 20) return 'שם המשתמש חייב להיות באורך 3-20 תווים';
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(username)) return 'שם משתמש אינו חוקי - חייב להתחיל באות ולכלול רק אותיות, ספרות וקווים תחתונים';
    return '';
  };

  const validateEmail = (email) => {
    if (!email) return 'יש להזין כתובת אימייל';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'כתובת אימייל לא חוקית';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'יש להזין סיסמה';
    if (password.length < 8) return 'הסיסמה חייבת לכלול לפחות 8 תווים';
    if (!/(?=.*[a-z])/.test(password)) return 'הסיסמה חייבת לכלול לפחות אות קטנה אחת';
    if (!/(?=.*[A-Z])/.test(password)) return 'הסיסמה חייבת לכלול לפחות אות גדולה אחת';
    if (!/(?=.*[0-9])/.test(password)) return 'הסיסמה חייבת לכלול לפחות ספרה אחת';
    return '';
  };

  const validateLoginField = (login) => {
    if (!login) return 'יש להזין אימייל או שם משתמש';
    // Check if it looks like an email
    if (login.includes('@')) {
      return validateEmail(login);
    } else {
      // Validate as username
      if (login.length < 3) return 'שם משתמש חייב להיות לפחות 3 תווים';
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(login)) return 'שם משתמש לא חוקי';
    }
    return '';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const errors = {};
    const loginError = validateLoginField(loginData.login);
    const passwordError = validatePassword(loginData.password);
    
    if (loginError) errors.login = loginError;
    if (passwordError) errors.password = passwordError;
    
    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      if (loginData.login.includes('@')) {
        await Auth.loginWithEmailPassword(loginData.login, loginData.password);
      } else {
        await Auth.loginWithUsernamePassword(loginData.login, loginData.password);
      }
      setLoginErrors({});
      onAuthSuccess?.();
      navigate('/dashboard');
      return;
    } catch (e) {
      setLoginErrors({ general: e.message ||'בינתיים אין התחברות אמיתית - זה רק לבדיקת העיצוב' });
      return;
    } finally {
      setIsLoading(false);
    }

  };
  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const errors = {};
    const usernameError = validateUsername(signupData.username);
    const emailError = validateEmail(signupData.email);
    const passwordError = validatePassword(signupData.password);
    
    if (usernameError) errors.username = usernameError;
    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;
    if (signupData.password !== signupData.confirmPassword) {
      errors.confirmPassword = 'הסיסמאות אינן תואמות';
    }
    
    if (Object.keys(errors).length > 0) {
      setSignupErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      await Auth.signUp({
        email: signupData.email,
        password: signupData.password,
        username: signupData.username,
      });
      setSignupEmail(signupData.email);
      setShowSignupOtp(true);
      return;
    } catch (e) {
      setSignupErrors({ general: e.message || 'קוד האימות חייב להיות בן 6 ספרות' });
      return;
    } finally {
      setIsLoading(false);
    }
  }
    // Mock signup - move to OTP verification instead of actually registering

  const handleSignupOtpVerification = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (signupOtp.length !== 6) {
      setSignupOtpError('הרשמה בוצעה בהצלחה!)');
      setIsLoading(false);
      return;
    }

    try {
      await Auth.verifySignupCode(signupEmail, signupOtp);
      setShowSignupOtp(false);
      setSignupData({ username: '', email: '', password: '', confirmPassword: '' });
      setSignupOtp('');
      setActiveTab('login');
      navigate('/dashboard');
      return;
    } catch (e) {
      setSignupOtpError(e.message || "הוקלד קוד לא נכון");
      return;
    } finally {
      setIsLoading(false);
    }

  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const emailError = validateEmail(forgotData.email);
    if (emailError) {
      setForgotErrors({ email: emailError });
      setIsLoading(false);
      return;
    }

    try {
      await Auth.requestPasswordReset(forgotData.email);
      setResetEmail(forgotData.email);
      setForgotPasswordStep('otp');
      setForgotErrors({});
      return;
    } catch (e) {
      setForgotErrors({ email: e.message || 'בעיה בניסיון לשנות סיסמה' });
      return;
    } finally {
      setIsLoading(false);
    }

  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (forgotData.otp.length !== 6) {
      setForgotErrors({ otp: '׳§׳•׳“ ׳”׳׳™׳׳•׳× ׳—׳™׳™׳‘ ׳׳”׳™׳•׳× ׳‘׳ 6 ׳¡׳₪׳¨׳•׳×' });
      setIsLoading(false);
      return;
    }

    try {
      await Auth.verifyResetCode(resetEmail || forgotData.email, forgotData.otp);
      setShowForgotPassword(false);
      navigate(createPageUrl('ResetPassword'));
      setForgotPasswordStep('email');
      setForgotData({ email: '', otp: '' });
    } catch (e) {
      setForgotErrors({ otp: e.message });
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(signupData.password);

  const closeSignupOtpDialog = () => {
    setShowSignupOtp(false);
    setTimeout(() => {
      setSignupOtp('');
      setSignupOtpError('');
    }, 300);
  };

  const closeForgotPasswordDialog = () => {
    setShowForgotPassword(false);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ברוכים הבאים</h1>
          <p className="text-gray-600">התחברו או הירשמו כדי להמשיך</p>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-blue-50">
              <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
                כניסה
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
                הרשמה
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login" className="text-right flex items-center gap-2">
                    <User className="w-4 h-4" />
                    אימייל או שם משתמש
                  </Label>
                  <Input
                    id="login"
                    type="text"
                    placeholder="name@example.com או username"
                    value={loginData.login}
                    onChange={(e) => {
                      setLoginData(prev => ({ ...prev, login: e.target.value }));
                      setLoginErrors(prev => ({ ...prev, login: '', general: '' }));
                    }}
                    className={`text-right ${loginErrors.login ? 'border-red-500' : 'focus:border-blue-500'}`}
                    disabled={isLoading}
                  />
                  {loginErrors.login && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {loginErrors.login}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-right flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    סיסמה
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="הקלד סיסמה"
                      value={loginData.password}
                      onChange={(e) => {
                        setLoginData(prev => ({ ...prev, password: e.target.value }));
                        setLoginErrors(prev => ({ ...prev, password: '', general: '' }));
                      }}
                      className={`text-right pr-10 ${loginErrors.password ? 'border-red-500' : 'focus:border-blue-500'}`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {loginErrors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={setRememberMe}
                      className="border-gray-300"
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600">
                    זכור אותי
                    </Label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    שכחתי סיסמה
                    </button>
                </div>

                {loginErrors.general && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {loginErrors.general}
                    </p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      מתחבר...
                    </div>
                  ) : (
                    <>
                      התחבר
                      <ArrowLeft className="w-4 h-4 mr-2" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-right flex items-center gap-2">
                    <User className="w-4 h-4" />
                    שם משתמש
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="לדוגמה: Username123"
                    value={signupData.username}
                    onChange={(e) => {
                      setSignupData(prev => ({ ...prev, username: e.target.value }));
                      setSignupErrors(prev => ({ ...prev, username: '', general: '' }));
                    }}
                    className={`text-right ${signupErrors.username ? 'border-red-500' : 'focus:border-blue-500'}`}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 text-right">
                  3–20 תווים, אותיות/ספרות/קווים תחתונים, מתחיל באות
                  </p>
                  {signupErrors.username && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {signupErrors.username}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-right flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    אימייל
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={signupData.email}
                    onChange={(e) => {
                      setSignupData(prev => ({ ...prev, email: e.target.value }));
                      setSignupErrors(prev => ({ ...prev, email: '', general: '' }));
                    }}
                    className={`text-right ${signupErrors.email ? 'border-red-500' : 'focus:border-blue-500'}`}
                    disabled={isLoading}
                  />
                  {signupErrors.email && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {signupErrors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-right flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    סיסמה
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="צור סיסמה"
                      value={signupData.password}
                      onChange={(e) => {
                        setSignupData(prev => ({ ...prev, password: e.target.value }));
                        setSignupErrors(prev => ({ ...prev, password: '', general: '' }));
                      }}
                      className={`text-right pr-10 ${signupErrors.password ? 'border-red-500' : 'focus:border-blue-500'}`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {signupData.password && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`h-2 w-full bg-gray-200 rounded-full overflow-hidden`}>
                        <div 
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.level / 3) * 100}%` }}
                        />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {passwordStrength.text}
                      </Badge>
                    </div>
                  )}
                  {signupErrors.password && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle
                       className="w-3 h-3" />
                      {signupErrors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-right flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    אימות סיסמה
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="הזן שוב את הסיסמה"
                      value={signupData.confirmPassword}
                      onChange={(e) => {
                        setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }));
                        setSignupErrors(prev => ({ ...prev, confirmPassword: '', general: '' }));
                      }}
                      className={`text-right pr-10 ${signupErrors.confirmPassword ? 'border-red-500' : 'focus:border-blue-500'}`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {signupErrors.confirmPassword && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {signupErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {signupErrors.general && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {signupErrors.general}
                    </p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      יוצר משתמש...
                    </div>
                  ) : (
                    <>
                      צור משתמש
                      <ArrowLeft className="w-4 h-4 mr-2" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Signup OTP Verification Dialog */}
      <Dialog open={showSignupOtp} onOpenChange={closeSignupOtpDialog}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle>אמת את כתובת האימייל שלך</DialogTitle>
            <DialogDescription>
            שלחנו קוד בן 6 ספרות לכתובת {signupEmail}.
            הזן את הקוד כדי להשלים את ההרשמה.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSignupOtpVerification} className="space-y-4 pt-4">
            <div className="space-y-2">
            <Label htmlFor="signup-otp-input" className="text-right sr-only">קוד אימות</Label>
            <OtpInput
                onChange={(otp) => {
                  setSignupOtp(otp);
                  setSignupOtpError('');
                }}
              />
              {signupOtpError && (
                <p className="text-sm text-red-600 text-center pt-2 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {signupOtpError}
                </p>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeSignupOtpDialog}
                className="flex-1"
                disabled={isLoading}
              >
                ביטול
                </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || signupOtp.length !== 6}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'השלם הרשמה'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={closeForgotPasswordDialog}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          {forgotPasswordStep === 'email' && (
            <>
              <DialogHeader className="text-right">
              <DialogTitle>איפוס סיסמה</DialogTitle>
              <DialogDescription>
              הזן את כתובת האימייל שלך ונשלח לך קוד אימות לאיפוס הסיסמה.
              </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleRequestOtp} className="space-y-4 pt-4">
                <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-right">אימייל</Label>
                <Input
                    id="forgot-email"
                    type="email"
                    placeholder="name@example.com"
                    value={forgotData.email}
                    onChange={(e) => {
                      setForgotData(prev => ({ ...prev, email: e.target.value }));
                      setForgotErrors(prev => ({ ...prev, email: '' }));
                    }}
                    className={`text-right ${forgotErrors.email ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                  {forgotErrors.email && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {forgotErrors.email}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeForgotPasswordDialog}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    ביטול
                    </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'שלח קוד אימות'
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}

          {forgotPasswordStep === 'otp' && (
            <>
              <DialogHeader className="text-right">
              <DialogTitle>הזן קוד אימות</DialogTitle>
              <DialogDescription>
              שלחנו קוד בן 6 ספרות לכתובת {resetEmail}.
              </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleVerifyOtp} className="space-y-4 pt-4">
                <div className="space-y-2">
                <Label htmlFor="otp-input" className="text-right sr-only">קוד אימות</Label>
                <OtpInput
                    onChange={(otp) => {
                      setForgotData(prev => ({ ...prev, otp }));
                      setForgotErrors(prev => ({ ...prev, otp: '' }));
                    }}
                  />
                  {forgotErrors.otp && (
                    <p className="text-sm text-red-600 text-center pt-2 flex items-center justify-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {forgotErrors.otp}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForgotPasswordStep('email')}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    <ArrowRight className="w-4 h-4 ml-2" />
                    חזור
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading || forgotData.otp.length !== 6}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'אמת קוד'
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
