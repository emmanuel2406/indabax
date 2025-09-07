// Login Page with animated background and form

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { useToastContext } from '@/contexts/ToastContext';
import type { LoginForm } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToastContext();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);

    // Dummy credentials for testing
    const dummyCredentials = {
      email: 'demo@indabax.com',
      password: 'demo123'
    };

    // Check credentials
    if (data.email === dummyCredentials.email && data.password === dummyCredentials.password) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Login Successful",
        description: "Welcome to IndabaX FX Hedge Platform.",
      });

      // Store auth state (mock)
      localStorage.setItem('indabax-auth', 'true');
      navigate('/dashboard');
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Login Failed",
        description: "Invalid email or password. Use demo@indabax.com / demo123",
        type: 'error'
      });
    }

    setIsLoading(false);
  };

  const handleSkip = () => {
    localStorage.setItem('indabax-auth', 'true');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-animated noise-overlay flex items-center justify-center p-4">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md space-y-8"
      >
        {/* Logo Section */}
        <div className="text-center">
          <Logo size="lg" className="mb-6" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-muted-foreground text-lg"
          >
            SME Currency Risk Management Platform
          </motion.p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Card className="glass-card border-border/30">
            <CardHeader>
              <CardTitle className="text-center text-foreground">
                Sign In to Continue
              </CardTitle>
              <div className="text-center text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                <p className="font-medium">Demo Credentials:</p>
                <p>Email: demo@indabax.com</p>
                <p>Password: demo123</p>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    {...register('email')}
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="glass-surface border-border/50 focus:border-primary/50"
                  />
                  {errors.email && (
                    <p className="text-sm text-secondary">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    {...register('password')}
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="glass-surface border-border/50 focus:border-primary/50"
                  />
                  {errors.password && (
                    <p className="text-sm text-secondary">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-metallic-primary micro-bounce"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleSkip}
                    className="w-full text-muted-foreground hover:text-foreground hover:bg-surface/50"
                  >
                    Continue without account
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
