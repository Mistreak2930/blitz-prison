import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MinecraftButton } from '@/components/ui/minecraft-button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import heroImage from "@/assets/blitz-prison-hero.jpg";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user, signInWithEmail, signUpWithEmail, signInWithGitHub } = useAuth();
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
          title: isLogin ? "Logged In!" : "Account created!",
          description: isLogin ? "You have successfully logged in!" : "Please check your email for a link to verify your new account!",
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative">
      {/* Background Hero Image */}
      <div className="absolute inset-0 opacity-5">
        <img 
          src={heroImage} 
          alt="Background" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          <Card className="shadow-blocky border-2 border-border backdrop-blur-sm bg-card/95">
            <CardHeader className="text-center pb-2">
              <div className="mb-4">
                <span className="text-4xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">⚡</span>
                <h1 className="text-2xl font-black bg-gradient-to-r from-primary via-accent to-gaming-purple bg-clip-text text-transparent mt-2">FLUXMC</h1>
              </div>
              <CardTitle className="text-xl font-bold text-foreground">
                {isLogin ? 'WELCOME BACK' : 'JOIN THE NETWORK'}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {isLogin ? 'Login to your account' : 'Create your free account and join thousands of players'}
              </CardDescription>
            </CardHeader>
          
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose your username"
                    required
                    className="border-2"
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
                  className="border-2"
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
                  className="border-2"
                />
              </div>
              
              <MinecraftButton 
                type="submit" 
                className="w-full text-lg py-6" 
                disabled={loading}
                variant="hero"
              >
                {loading ? 'PROCESSING...' : (isLogin ? 'ENTER NETWORK' : 'JOIN NETWORK')}
              </MinecraftButton>
            </form>
            
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full mt-4 border-2"
                onClick={async () => {
                  const { error } = await signInWithGitHub();
                  if (error) {
                    toast({
                      title: "GitHub login failed",
                      description: error.message,
                      variant: "destructive"
                    });
                  }
                }}
                disabled={loading}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Continue with GitHub
              </Button>
            </div>
            
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
        </div>
      </div>
    </div>
  );
};

export default Auth;
