import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [isRecovering, setIsRecovering] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in' || isRecovering;

  const handleAuth = async () => {
    if (isAuthenticated) {
      // Logout
      try {
        await clear();
        queryClient.clear();
        toast.success('Logged out successfully');
      } catch (error) {
        console.error('Logout error:', error);
        toast.error('Failed to log out. Please try again.');
      }
    } else {
      // Login
      try {
        await login();
        toast.success('Logged in successfully');
      } catch (error: any) {
        console.error('Login error:', error);
        
        // Handle "already authenticated" error with single recovery attempt
        if (error.message === 'User is already authenticated' && !isRecovering) {
          setIsRecovering(true);
          toast.info('Recovering session...');
          try {
            await clear();
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 500));
            await login();
            toast.success('Logged in successfully');
          } catch (retryError: any) {
            console.error('Login retry error:', retryError);
            toast.error('Login failed. Please refresh the page and try again.');
          } finally {
            setIsRecovering(false);
          }
        } else {
          // Show user-friendly error message
          const errorMessage = error.message || 'Login failed';
          if (errorMessage.includes('popup') || errorMessage.includes('closed')) {
            toast.error('Login cancelled. Please try again.');
          } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
            toast.error('Network error. Please check your connection and try again.');
          } else {
            toast.error('Login failed. Please try again or refresh the page.');
          }
        }
      }
    }
  };

  return (
    <Button
      onClick={handleAuth}
      disabled={isLoggingIn}
      variant={isAuthenticated ? 'outline' : 'default'}
      size="sm"
      className="gap-2"
      data-login-button
    >
      {isLoggingIn ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {isRecovering ? 'Recovering...' : 'Logging in...'}
        </>
      ) : isAuthenticated ? (
        <>
          <LogOut className="h-4 w-4" />
          Logout
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4" />
          Login
        </>
      )}
    </Button>
  );
}
