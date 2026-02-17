import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    console.log('[Auth] AuthContext useEffect running');

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[Auth] getSession result:', session ? `User: ${session.user.id}` : 'No session');
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch(err => {
      if (!mounted) return;
      const isAbort = err.name === 'AbortError' || err.code === '20' || err.message?.includes('AbortError');
      if (!isAbort) {
        console.warn('[Auth] getSession error:', err.message);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] Auth state change:', event, session ? `User: ${session.user.id}` : 'No session');
        if (!mounted) return;
        try {
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchProfile(session.user.id);
          } else {
            setProfile(null);
          }
        } catch (err) {
          const isAbort = err.name === 'AbortError' || err.code === '20' || err.message?.includes('AbortError');
          if (!isAbort) {
            console.warn('[Auth] Auth state change error:', err.message);
          }
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function fetchProfile(userId) {
    console.log('[Auth] Fetching profile for user:', userId);

    // Add a small delay to let things stabilize
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      console.log('[Auth] Executing profile query...');

      // Create a timeout to force completion
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000);
      });

      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      console.log('[Auth] Profile query completed!');
      console.log('[Auth] Profile query result:', { data, error });

      // Check for AbortError (code '20')
      if (error && (error.code === '20' || error.message?.includes('AbortError'))) {
        console.log('[Auth] Profile fetch aborted, setting profile to null and continuing');
        setProfile(null);
        setLoading(false);
        return;
      }

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist yet, that's okay
        console.warn('[Auth] Profile does not exist for user:', userId);
        setProfile(null);
      } else if (error) {
        console.error('[Auth] Error fetching profile:', error);
        setProfile(null); // Set to null even on error
      } else {
        console.log('[Auth] Profile loaded successfully:', data);
        setProfile(data);
      }
    } catch (err) {
      console.error('[Auth] Profile fetch exception:', err.message);
      const isAbort = err.name === 'AbortError' || err.code === '20' || err.message?.includes('AbortError');
      if (!isAbort) {
        console.error('[Auth] Profile fetch catch error:', err);
      } else {
        console.log('[Auth] Profile fetch caught AbortError, ignoring');
      }
      setProfile(null); // Ensure profile is set even on error
    } finally {
      console.log('[Auth] Setting loading to false');
      setLoading(false);
    }
  }

  async function signUp(email, password, username) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (error) return { error };
    return { data };
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  async function signOut() {
    console.log('[Auth] Signing out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[Auth] Error signing out:', error);
    } else {
      console.log('[Auth] Sign out successful');
      setUser(null);
      setProfile(null);
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    fetchProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
