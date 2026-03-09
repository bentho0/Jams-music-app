import { useState } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d124bc75`;

interface DebugInfo {
  spotify_client_id: {
    configured: boolean;
    length: number;
    preview: string | null;
    whitespace: {
      leading: boolean;
      trailing: boolean;
      internal: boolean;
    } | null;
    expectedLength: number;
    lengthMatch: boolean;
  };
  spotify_client_secret: {
    configured: boolean;
    length: number;
    preview: string | null;
    whitespace: {
      leading: boolean;
      trailing: boolean;
      internal: boolean;
    } | null;
    expectedLength: number;
    lengthMatch: boolean;
  };
  redirect_uri: {
    value: string | null;
    configured: boolean;
  };
  supabase_url: {
    configured: boolean;
    value: string | null;
  };
  instructions: {
    message: string;
    next_steps: string[];
  };
}

interface PipelineResult {
  env: Record<string, any>;
  spotify_token: Record<string, any>;
  spotify_search: Record<string, any>;
  openai: Record<string, any>;
  verdict: { all_systems_go: boolean; failing_step: string | null };
}

export function SpotifyDebug() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkConfig = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/debug/spotify-config`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch debug info');
      }

      const data = await response.json();
      setDebugInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testPipeline = async () => {
    setPipelineLoading(true);
    setError(null);
    setPipelineResult(null);
    try {
      const response = await fetch(`${API_BASE_URL}/debug/test-generation`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey,
        },
      });
      const data = await response.json();
      setPipelineResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pipeline test failed');
    } finally {
      setPipelineLoading(false);
    }
  };

  const getStatusIcon = (isOk: boolean) => {
    return isOk ? (
      <span className="text-[#4feec5]">✓</span>
    ) : (
      <span className="text-red-500">✗</span>
    );
  };

  const getWhitespaceWarning = (whitespace: { leading: boolean; trailing: boolean; internal: boolean } | null) => {
    if (!whitespace) return null;
    
    const issues = [];
    if (whitespace.leading) issues.push('leading spaces');
    if (whitespace.trailing) issues.push('trailing spaces');
    if (whitespace.internal) issues.push('internal spaces');
    
    if (issues.length === 0) return null;
    
    return (
      <span className="text-yellow-400 text-sm ml-2">
        ⚠️ Has {issues.join(', ')}
      </span>
    );
  };

  const stepBadge = (result: Record<string, any>) => {
    if (result?.skipped) return <span className="text-yellow-400 text-xs">SKIPPED</span>;
    if (result?.success === true) return <span className="text-[#4feec5] text-xs font-bold">PASS ✓</span>;
    if (result?.success === false) return <span className="text-red-400 text-xs font-bold">FAIL ✗</span>;
    return <span className="text-gray-400 text-xs">—</span>;
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex gap-2">
        <button
          onClick={checkConfig}
          disabled={loading}
          className="bg-[#4feec5] text-black px-4 py-2 rounded-lg font-medium hover:bg-[#3fd9b0] transition-colors disabled:opacity-50 text-sm"
        >
          {loading ? 'Checking...' : '🔍 Config'}
        </button>
        <button
          onClick={testPipeline}
          disabled={pipelineLoading}
          className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/15 transition-colors disabled:opacity-50 text-sm"
        >
          {pipelineLoading ? 'Testing...' : '🧪 Test Pipeline'}
        </button>
      </div>

      {/* Pipeline result panel */}
      {pipelineResult && (
        <div className="mt-4 bg-[#1a1a1a] border border-[#333] rounded-lg p-5 max-w-lg max-h-[80vh] overflow-y-auto shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Generation Pipeline Test</h3>
              <p className={`text-sm mt-0.5 ${pipelineResult.verdict.all_systems_go ? 'text-[#4feec5]' : 'text-red-400'}`}>
                {pipelineResult.verdict.all_systems_go ? '✓ All systems go' : `✗ Failing at: ${pipelineResult.verdict.failing_step}`}
              </p>
            </div>
            <button onClick={() => setPipelineResult(null)} className="text-gray-400 hover:text-white ml-4">✕</button>
          </div>
          <div className="space-y-3 text-sm">
            {/* Env */}
            <div className="bg-[#0f0f0f] rounded p-3 border border-[#2a2a2a]">
              <div className="flex justify-between mb-1"><span className="text-gray-400">Environment Variables</span></div>
              {Object.entries(pipelineResult.env).map(([k, v]: [string, any]) => (
                <div key={k} className="flex justify-between text-xs py-0.5">
                  <span className="text-gray-300 font-mono">{k}</span>
                  <span className={v.configured ? 'text-[#4feec5]' : 'text-red-400'}>
                    {v.configured ? `✓ (${v.length} chars)` : '✗ not set'}
                  </span>
                </div>
              ))}
            </div>
            {/* Spotify Token */}
            <div className="bg-[#0f0f0f] rounded p-3 border border-[#2a2a2a]">
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">Spotify Client Token</span>
                {stepBadge(pipelineResult.spotify_token)}
              </div>
              {pipelineResult.spotify_token?.success === false && (
                <pre className="text-red-300 text-xs whitespace-pre-wrap break-all mt-1">{JSON.stringify(pipelineResult.spotify_token, null, 2)}</pre>
              )}
              {pipelineResult.spotify_token?.success && (
                <p className="text-gray-400 text-xs">Token type: {pipelineResult.spotify_token.token_type}, expires in {pipelineResult.spotify_token.expires_in}s</p>
              )}
            </div>
            {/* Spotify Search */}
            <div className="bg-[#0f0f0f] rounded p-3 border border-[#2a2a2a]">
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">Spotify Search</span>
                {stepBadge(pipelineResult.spotify_search)}
              </div>
              {pipelineResult.spotify_search?.success === false && (
                <pre className="text-red-300 text-xs whitespace-pre-wrap break-all mt-1">{JSON.stringify(pipelineResult.spotify_search, null, 2)}</pre>
              )}
              {pipelineResult.spotify_search?.found_track && (
                <p className="text-gray-400 text-xs">Found: {pipelineResult.spotify_search.found_track}</p>
              )}
            </div>
            {/* OpenAI */}
            <div className="bg-[#0f0f0f] rounded p-3 border border-[#2a2a2a]">
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">OpenAI (gpt-4o-mini)</span>
                {stepBadge(pipelineResult.openai)}
              </div>
              {pipelineResult.openai?.success === false && (
                <pre className="text-red-300 text-xs whitespace-pre-wrap break-all mt-1">{JSON.stringify(pipelineResult.openai, null, 2)}</pre>
              )}
              {pipelineResult.openai?.sample && (
                <p className="text-gray-400 text-xs">Sample: "{pipelineResult.openai.sample.track}" by {pipelineResult.openai.sample.artist}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {debugInfo && (
        <div className="mt-4 bg-[#1a1a1a] border border-[#333] rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white">Spotify Configuration Debug</h3>
            <button
              onClick={() => setDebugInfo(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Client ID */}
            <div className="border border-[#333] rounded-lg p-4 bg-[#0f0f0f]">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-white">Client ID</h4>
                {getStatusIcon(debugInfo.spotify_client_id.configured && debugInfo.spotify_client_id.lengthMatch)}
              </div>
              <div className="text-sm text-gray-300 space-y-1">
                <p>Configured: {debugInfo.spotify_client_id.configured ? 'Yes' : 'No'}</p>
                <p>
                  Length: {debugInfo.spotify_client_id.length} / {debugInfo.spotify_client_id.expectedLength}
                  {debugInfo.spotify_client_id.length !== debugInfo.spotify_client_id.expectedLength && (
                    <span className="text-red-500 ml-2">❌ Should be 32 characters</span>
                  )}
                  {getWhitespaceWarning(debugInfo.spotify_client_id.whitespace)}
                </p>
                {debugInfo.spotify_client_id.preview && (
                  <p className="font-mono text-xs">Preview: {debugInfo.spotify_client_id.preview}</p>
                )}
              </div>
            </div>

            {/* Client Secret */}
            <div className="border border-[#333] rounded-lg p-4 bg-[#0f0f0f]">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-white">Client Secret</h4>
                {getStatusIcon(debugInfo.spotify_client_secret.configured && debugInfo.spotify_client_secret.lengthMatch)}
              </div>
              <div className="text-sm text-gray-300 space-y-1">
                <p>Configured: {debugInfo.spotify_client_secret.configured ? 'Yes' : 'No'}</p>
                <p>
                  Length: {debugInfo.spotify_client_secret.length} / {debugInfo.spotify_client_secret.expectedLength}
                  {debugInfo.spotify_client_secret.length !== debugInfo.spotify_client_secret.expectedLength && (
                    <span className="text-red-500 ml-2">❌ Should be 32 characters</span>
                  )}
                  {getWhitespaceWarning(debugInfo.spotify_client_secret.whitespace)}
                </p>
                {debugInfo.spotify_client_secret.preview && (
                  <p className="font-mono text-xs">Preview: {debugInfo.spotify_client_secret.preview}</p>
                )}
              </div>
            </div>

            {/* Redirect URI */}
            <div className="border border-[#333] rounded-lg p-4 bg-[#0f0f0f]">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-white">Redirect URI</h4>
                {getStatusIcon(debugInfo.redirect_uri.configured)}
              </div>
              <div className="text-sm text-gray-300 space-y-1">
                <p>Configured: {debugInfo.redirect_uri.configured ? 'Yes' : 'No'}</p>
                {debugInfo.redirect_uri.value && (
                  <p className="font-mono text-xs break-all bg-[#1a1a1a] p-2 rounded border border-[#333]">
                    {debugInfo.redirect_uri.value}
                  </p>
                )}
                <p className="text-yellow-400 text-xs mt-2">
                  ⚠️ Make sure this EXACT URL is added to your Spotify app's "Redirect URIs" in the Spotify Developer Dashboard
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="border border-[#4feec5] rounded-lg p-4 bg-[#0f0f0f]">
              <h4 className="font-semibold text-white mb-2">Next Steps</h4>
              <p className="text-sm text-gray-300 mb-3">{debugInfo.instructions.message}</p>
              <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                {debugInfo.instructions.next_steps.map((step, index) => (
                  <li key={index}>{step.replace(/^\d+\.\s*/, '')}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-900/20 border border-red-500 rounded-lg p-4 max-w-md">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}