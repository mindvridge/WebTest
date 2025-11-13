/**
 * API Client for communicating with backend
 */

const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:8788/api';

export class ApiClient {
  private static token: string | null = null;

  /**
   * Set authentication token
   */
  static setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  /**
   * Get authentication token
   */
  static getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  /**
   * Clear authentication token
   */
  static clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  /**
   * Make API request
   */
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Request failed' };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('API request error:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  }

  /**
   * Register new user
   */
  static async register(username: string, password: string): Promise<{
    success: boolean;
    token?: string;
    username?: string;
    message?: string;
    error?: string;
  }> {
    const result = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (result.success && result.data) {
      const data = result.data as any;
      if (data.token) {
        this.setToken(data.token);
      }
      return {
        success: true,
        token: data.token,
        username: data.username,
        message: data.message,
      };
    }

    return { success: false, error: result.error };
  }

  /**
   * Login user
   */
  static async login(username: string, password: string): Promise<{
    success: boolean;
    token?: string;
    username?: string;
    message?: string;
    error?: string;
  }> {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (result.success && result.data) {
      const data = result.data as any;
      if (data.token) {
        this.setToken(data.token);
      }
      return {
        success: true,
        token: data.token,
        username: data.username,
        message: data.message,
      };
    }

    return { success: false, error: result.error };
  }

  /**
   * Get user profile
   */
  static async getUserProfile(): Promise<{
    success: boolean;
    profile?: any;
    error?: string;
  }> {
    const result = await this.request('/user/profile', {
      method: 'GET',
    });

    if (result.success && result.data) {
      const data = result.data as any;
      return { success: true, profile: data.profile };
    }

    return { success: false, error: result.error };
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(updates: any): Promise<{
    success: boolean;
    profile?: any;
    error?: string;
  }> {
    const result = await this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    if (result.success && result.data) {
      const data = result.data as any;
      return { success: true, profile: data.profile };
    }

    return { success: false, error: result.error };
  }

  /**
   * Save game
   */
  static async saveGame(saveData: any): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    const result = await this.request('/game/save', {
      method: 'POST',
      body: JSON.stringify(saveData),
    });

    if (result.success && result.data) {
      const data = result.data as any;
      return { success: true, message: data.message };
    }

    return { success: false, error: result.error };
  }

  /**
   * Load game
   */
  static async loadGame(): Promise<{
    success: boolean;
    save?: any;
    error?: string;
  }> {
    const result = await this.request('/game/save', {
      method: 'GET',
    });

    if (result.success && result.data) {
      const data = result.data as any;
      return { success: true, save: data.save };
    }

    return { success: false, error: result.error };
  }

  /**
   * Delete saved game
   */
  static async deleteSave(): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    const result = await this.request('/game/save', {
      method: 'DELETE',
    });

    if (result.success && result.data) {
      const data = result.data as any;
      return { success: true, message: data.message };
    }

    return { success: false, error: result.error };
  }

  /**
   * Get leaderboard
   */
  static async getLeaderboard(type: 'survival' | 'level' | 'kills' = 'survival', limit: number = 100): Promise<{
    success: boolean;
    leaderboard?: any[];
    error?: string;
  }> {
    const result = await this.request(`/game/leaderboard?type=${type}&limit=${limit}`, {
      method: 'GET',
    });

    if (result.success && result.data) {
      const data = result.data as any;
      return { success: true, leaderboard: data.leaderboard };
    }

    return { success: false, error: result.error };
  }
}
