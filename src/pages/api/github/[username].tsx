
import { Octokit } from "@octokit/rest";
import NodeCache from "node-cache";

// Initialize cache with 1 hour TTL
const cache = new NodeCache({ stdTTL: 3600 });

interface GitHubUserData {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  location: string | null;
  company: string | null;
  email: string | null;
  blog: string | null;
}

const octokit = new Octokit();

export async function fetchGitHubUser(username: string): Promise<GitHubUserData | null> {
  try {
    // Check cache first
    const cachedData = cache.get<GitHubUserData>(username);
    if (cachedData) {
      return cachedData;
    }

    const response = await octokit.users.getByUsername({
      username,
    });

    const userData = response.data as GitHubUserData;
    
    // Cache the result
    cache.set(username, userData);
    
    return userData;
  } catch (error) {
    console.error(`Error fetching GitHub user data for ${username}:`, error);
    return null;
  }
}

export default async function handler(req: Request) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  const url = new URL(req.url);
  const username = url.pathname.split('/').pop();

  if (!username) {
    return new Response(JSON.stringify({ error: 'Username is required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const userData = await fetchGitHubUser(username);
    
    if (!userData) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return new Response(JSON.stringify({
      status: 'success',
      data: {
        user: userData,
        meta: {
          cached: cache.has(username),
          timestamp: new Date().toISOString(),
        }
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
