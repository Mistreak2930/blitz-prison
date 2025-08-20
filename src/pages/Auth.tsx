import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MinecraftButton } from '@/components/ui/minecraft-button';
import Navigation from '@/components/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user, signInWithEmail, signUpWithEmail } = useAuth();
  const { toast } = useToast();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      
      if (isLogin) {
        result = await signInWithEmail(email, password);
      } else {
        if (!username.trim()) {
          toast({
            title: "Username required",
            description: "Please enter a username",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        result = await signUpWithEmail(email, password, username);
      }

      if (result.error) {
        toast({
          title: isLogin ? "Login failed" : "Signup failed",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: isLogin ? "Welcome back!" : "Account created!",
          description: isLogin ? "Successfully logged in" : "Check your email to verify your account",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-md mx-auto px-4 py-16">
        <Card className="shadow-blocky">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-black text-foreground">
              {isLogin ? 'LOGIN TO PRISON' : 'JOIN THE PRISON'}
            </CardTitle>
            <CardDescription>
              {isLogin ? 'Access your prisoner account' : 'Create your prisoner account'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="username">Prison Name</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your prison name"
                    required
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              <MinecraftButton 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'PROCESSING...' : (isLogin ? 'LOGIN' : 'CREATE ACCOUNT')}
              </MinecraftButton>
            </form>
            
            <div className="mt-6 text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsLogin(!isLogin)}
                className="text-muted-foreground hover:text-foreground"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Auth;