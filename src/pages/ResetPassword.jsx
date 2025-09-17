
import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, ArrowRight, Clock, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { setNewPassword } from '@/components/auth/authApi';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [passwordData, setPasswordData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});

    const getPasswordStrength = (password) => {
        if (!password) return { level: 0, text: '' };
        let score = 0;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;

        if (score < 2) return { level: 1, text: 'חלשה', color: 'bg-red-500' };
        if (score < 4) return { level: 2, text: 'בינונית', color: 'bg-yellow-500' };
        return { level: 3, text: 'חזקה', color: 'bg-green-500' };
    };

    const validatePassword = (password) => {
        if (!password) return 'יש להזין סיסמה';
        if (password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(password)) {
          return 'הסיסמה חייבת לכלול לפחות 8 תווים, אות גדולה, אות קטנה וספרה';
        }
        return '';
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const passwordError = validatePassword(passwordData.password);
        if (passwordError) {
            setErrors({ password: passwordError });
            setIsLoading(false);
            return;
        }

        if (passwordData.password !== passwordData.confirmPassword) {
            setErrors({ confirmPassword: 'הסיסמאות אינן תואמות' });
            setIsLoading(false);
            return;
        }
        
        try {
            await setNewPassword(passwordData.password);
            setSuccess(true);
        } catch (e) {
            setErrors({ general: e.message || 'שגיאהבשינויסיסמה' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const passwordStrength = getPasswordStrength(passwordData.password);

    if (success) {
        return (
            <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur text-center">
                    <CardHeader>
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <h1 className="text-2xl font-bold text-gray-900">הסיסמה עודכנה בהצלחה!</h1>
                        <p className="text-gray-600">
                            כעת באפשרותך להתחבר עם הסיסמה החדשה שלך.
                        </p>
                        <Button
                            onClick={() => navigate(createPageUrl('Auth'))}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            חזור למסך הכניסה
                            <ArrowLeft className="w-4 h-4 mr-2" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                        <Clock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">הגדרת סיסמה חדשה</h1>
                    <p className="text-gray-600">אנא בחר סיסמה חדשה וחזקה.</p>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="reset-password" className="text-right flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            סיסמה חדשה
                          </Label>
                          <div className="relative">
                            <Input
                              id="reset-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="צור סיסמה חדשה"
                              value={passwordData.password}
                              onChange={(e) => {
                                setPasswordData(prev => ({ ...prev, password: e.target.value }));
                                setErrors(prev => ({ ...prev, password: '', confirmPassword: '' }));
                              }}
                              className={`text-right pr-10 ${errors.password ? 'border-red-500' : 'focus:border-blue-500'}`}
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
                          {passwordData.password && (
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
                          {errors.password && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.password}
                            </p>
                          )}
                        </div>
        
                        <div className="space-y-2">
                          <Label htmlFor="confirm-reset-password" className="text-right flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            אימות סיסמה חדשה
                          </Label>
                          <div className="relative">
                            <Input
                              id="confirm-reset-password"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="הזן שוב את הסיסמה החדשה"
                              value={passwordData.confirmPassword}
                              onChange={(e) => {
                                setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }));
                                setErrors(prev => ({ ...prev, confirmPassword: '' }));
                              }}
                              className={`text-right pr-10 ${errors.confirmPassword ? 'border-red-500' : 'focus:border-blue-500'}`}
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
                          {errors.confirmPassword && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.confirmPassword}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row-reverse gap-3 pt-4">
                          <Button 
                            type="submit" 
                            className="flex-1 bg-blue-600 hover:bg-blue-700 transition-colors"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <div className="flex items-center gap-2 justify-center">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                מעדכן סיסמה...
                              </div>
                            ) : (
                              <>
                                אפס סיסמה
                                <CheckCircle className="w-4 h-4 mr-2" />
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(createPageUrl('Auth'))}
                            className="flex-1"
                            disabled={isLoading}
                          >
                            <ArrowRight className="w-4 h-4 ml-2" />
                            חזור
                          </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
