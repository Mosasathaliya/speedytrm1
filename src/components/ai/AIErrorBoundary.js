'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

class AIErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    console.error('AI Component Error:', error);
    console.error('Error Info:', errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Track error for analytics (optional)
    if (typeof window !== 'undefined' && window.userTrackingService) {
      window.userTrackingService.trackEvent('ai_error', {
        error: error.message,
        componentStack: errorInfo.componentStack,
        retryCount: this.state.retryCount
      });
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-destructive/50 bg-destructive/5">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-destructive" dir="rtl">
                خطأ في الذكاء الاصطناعي
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                AI Component Error
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground" dir="rtl">
                  عذراً، حدث خطأ غير متوقع في نظام الذكاء الاصطناعي.
                </p>
                <p className="text-xs text-muted-foreground">
                  Sorry, an unexpected error occurred in the AI system.
                </p>
              </div>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-3 bg-muted/50 rounded-md">
                  <p className="text-xs font-mono text-destructive break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex flex-col space-y-2">
                <Button 
                  onClick={this.handleRetry}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  <span dir="rtl">إعادة المحاولة</span>
                  <span className="mx-2">•</span>
                  <span>Try Again</span>
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  className="w-full"
                  variant="outline"
                >
                  <Home className="h-4 w-4 mr-2" />
                  <span dir="rtl">العودة للرئيسية</span>
                  <span className="mx-2">•</span>
                  <span>Go Home</span>
                </Button>
              </div>

              {this.state.retryCount > 0 && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Retry attempts: {this.state.retryCount}
                  </p>
                </div>
              )}

              <div className="text-center pt-4 border-t">
                <p className="text-xs text-muted-foreground" dir="rtl">
                  إذا استمر الخطأ، يرجى المحاولة لاحقاً أو الاتصال بالدعم الفني.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  If the error persists, please try again later or contact support.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AIErrorBoundary;
