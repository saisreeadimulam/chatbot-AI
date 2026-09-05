import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import OceanScene from '@/components/OceanScene';
import ChatWindow from '@/components/ChatWindow';
import MessageInput from '@/components/MessageInput';
import { Button } from '@/components/ui/button';
import { LogOut, Waves } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Welcome to the Official ARGO Global Ocean Data Chatbot 🌊\n\nI can help you explore ocean observations including temperature, salinity, pressure, depth measurements, and float locations worldwide.\n\nWhat would you like to learn about today?',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) {
          navigate('/auth');
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleSendMessage = async (message: string) => {
    const userMessage: Message = { role: 'user', content: message };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setIsResponding(true);

    try {
      const { data, error } = await supabase.functions.invoke('argo-chat', {
        body: { message },
      });

      if (error) {
        throw error;
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        imageUrl: data.imageUrl,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to get response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsResponding(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <OceanScene isTyping={isTyping} isResponding={isResponding} />
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Waves className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">ARGO Ocean Data</h1>
              <p className="text-sm text-muted-foreground">Global Ocean Observation System</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="border-primary/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </header>

        <div className="space-y-4">
          <ChatWindow messages={messages} isLoading={isLoading} />
          <MessageInput
            onSend={handleSendMessage}
            onTyping={setIsTyping}
            disabled={isLoading}
          />
        </div>

        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>🐠 🐢 🐋 Powered by ARGO global ocean observation network</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
