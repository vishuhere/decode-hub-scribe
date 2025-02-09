
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

export default function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const username = req.query.username;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  fetchGitHubUser(username)
    .then((userData) => {
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json({
        status: 'success',
        data: {
          user: userData,
          meta: {
            cached: cache.has(username),
            timestamp: new Date().toISOString(),
          }
        }
      });
    })
    .catch((error) => {
      res.status(500).json({
        status: 'error',
        error: 'Internal server error',
        message: error.message
      });
    });
}
