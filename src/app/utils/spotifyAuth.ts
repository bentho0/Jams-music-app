import { projectId, publicAnonKey } from '/utils/supabase/info';
import { isFigmaSandbox } from './sandbox';
import { apiFetch } from './apiClient';

// Session storage key
const SESSION_KEY = 'jams_spotify_session';

// Get stored session ID
export function getSessionId(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

// Store session ID
export function setSessionId(sessionId: string): void {
  localStorage.setItem(SESSION_KEY, sessionId);
}

// Clear session
export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

// Initialize Spotify OAuth flow
export async function initiateSpotifyAuth(isPlaylistGeneration: boolean = false): Promise<void> {
  if (isFigmaSandbox()) {
    throw new Error(
      "Spotify connection is not available in Figma's preview sandbox. " +
      "Open the published app URL in a browser tab to connect."
    );
  }
  try {
    console.log('=== INITIATING SPOTIFY AUTH ===');
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('publicAnonKey exists:', !!publicAnonKey);
    console.log('publicAnonKey preview:', publicAnonKey?.substring(0, 20) + '...');

    // Store whether this is a playlist generation flow
    if (isPlaylistGeneration) {
      sessionStorage.setItem('spotify_playlist_generation', 'true');
    }

    // Use current window origin as the redirect URI
    const redirectUri = window.location.origin;
    console.log('Redirect URI:', redirectUri);
    console.log('window.location.origin:', window.location.origin);
    console.log('window.location.href:', window.location.href);

    const url = `${API_BASE_URL}/auth/spotify/init`;
    console.log('Full URL:', url);

    const requestBody = { redirectUri };
    console.log('Request body:', JSON.stringify(requestBody));

    const response = await apiFetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'apikey': publicAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('=== ERROR RESPONSE ===');
      console.error('Status:', response.status);
      console.error('Status Text:', response.statusText);
      console.error('Response body (raw text):', errorText);
      
      let error;
      try {
        error = JSON.parse(errorText);
        console.error('Response body (parsed JSON):', error);
      } catch (e) {
        console.error('Could not parse response as JSON');
        error = { error: errorText };
      }
      
      throw new Error(error.error || error.message || 'Failed to initialize Spotify authentication');
    }

    const data = await response.json();
    console.log('Success response:', data);
    
    const { authUrl, sessionId } = data;
    
    // Store session ID temporarily
    sessionStorage.setItem('spotify_auth_session', sessionId);
    
    console.log('Redirecting to Spotify...');
    // Redirect to Spotify authorization page
    window.location.href = authUrl;
  } catch (error) {
    console.error('=== CAUGHT ERROR IN initiateSpotifyAuth ===');
    console.error('Error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'N/A');
    throw error;
  }
}

// Check if user is authenticated
export async function checkAuthStatus(): Promise<{ authenticated: boolean; spotifyUserId?: string }> {
  const sessionId = getSessionId();
  if (!sessionId) return { authenticated: false };
  if (isFigmaSandbox()) return { authenticated: false };

  try {
    const response = await apiFetch(`${API_BASE_URL}/auth/status?session_id=${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'apikey': publicAnonKey,
      },
    });

    if (!response.ok) {
      clearSession();
      return { authenticated: false };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking auth status:', error);
    clearSession();
    return { authenticated: false };
  }
}

// Get user profile
export async function getUserProfile() {
  const sessionId = getSessionId();
  if (!sessionId) throw new Error('Not authenticated');
  if (isFigmaSandbox()) throw new Error('Not available in Figma preview sandbox.');

  try {
    const response = await apiFetch(`${API_BASE_URL}/user/profile?session_id=${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'apikey': publicAnonKey,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      
      // If token refresh failed, clear session and require reconnect
      if (error.error === 'reconnect_required') {
        clearSession();
        throw new Error('Please reconnect to Spotify');
      }
      
      throw new Error(error.error || 'Failed to get user profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

// Handle OAuth callback (call this on app mount)
export async function handleOAuthCallback(): Promise<{ success: boolean; error?: string }> {
  if (isFigmaSandbox()) return { success: false };
  const params = new URLSearchParams(window.location.search);
  
  // Check for authorization code from Spotify (step 1 of callback)
  const code = params.get('code');
  const state = params.get('state');
  
  if (code && state) {
    console.log('=== HANDLING SPOTIFY CALLBACK ===');
    const sessionId = sessionStorage.getItem('spotify_auth_session');
    
    if (!sessionId) {
      console.error('No session ID found in sessionStorage');
      window.history.replaceState({}, document.title, window.location.pathname);
      return { success: false, error: 'Session expired. Please try again.' };
    }
    
    try {
      // Complete the OAuth flow
      const response = await apiFetch(`${API_BASE_URL}/auth/spotify/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey,
        },
        body: JSON.stringify({ code, state, sessionId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'Failed to complete authentication');
      }
      
      const data = await response.json();
      
      console.log('=== AUTH COMPLETE RESPONSE ===');
      console.log('Response data:', data);
      console.log('Session ID from response:', data.sessionId);
      
      // Store the user session
      setSessionId(data.sessionId);
      
      // Store session in sessionStorage for playlist generation
      sessionStorage.setItem('spotify_session_id', data.sessionId);
      
      console.log('=== SESSION STORED ===');
      console.log('localStorage value:', localStorage.getItem('jams_spotify_session'));
      console.log('sessionStorage value:', sessionStorage.getItem('spotify_session_id'));
      
      // Clean up temporary session storage
      sessionStorage.removeItem('spotify_auth_session');
      
      // Check if this was a playlist generation flow and preserve that info
      const isPlaylistGeneration = sessionStorage.getItem('spotify_playlist_generation') === 'true';
      const playlistPrompt = sessionStorage.getItem('spotify_playlist_prompt') || '';
      
      console.log('=== CHECKING PLAYLIST GENERATION INFO ===');
      console.log('isPlaylistGeneration from sessionStorage:', isPlaylistGeneration);
      console.log('playlistPrompt from sessionStorage:', playlistPrompt);
      
      // Clean URL but preserve playlist generation params if needed
      if (isPlaylistGeneration && playlistPrompt) {
        const newUrl = `${window.location.pathname}?spotify_connected=true&playlist_generation=true&prompt=${encodeURIComponent(playlistPrompt)}`;
        console.log('Setting new URL with playlist params:', newUrl);
        window.history.replaceState({}, document.title, newUrl);
        console.log('New window.location.search:', window.location.search);
      } else {
        console.log('Cleaning URL without playlist params');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      console.log('Successfully authenticated with Spotify');
      return { success: true };
    } catch (error) {
      console.error('Error completing OAuth flow:', error);
      sessionStorage.removeItem('spotify_auth_session');
      window.history.replaceState({}, document.title, window.location.pathname);
      return { success: false, error: error instanceof Error ? error.message : 'Authentication failed' };
    }
  }
  
  // Check for session parameter (successful auth from backend redirect - no longer used)
  const session = params.get('session');
  if (session) {
    setSessionId(session);
    
    // Clean up URL
    window.history.replaceState({}, document.title, window.location.pathname);
    
    return { success: true };
  }
  
  // Check for error parameter
  const error = params.get('error');
  if (error) {
    const message = params.get('message');
    
    // Clean up URL
    window.history.replaceState({}, document.title, window.location.pathname);
    
    return { success: false, error: message || error };
  }
  
  return { success: false };
}