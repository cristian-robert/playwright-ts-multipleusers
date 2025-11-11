import { BaseApiClient } from './base-api.client';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserListResponse,
} from '../models/user.model';

/**
 * User API Client
 * Handles all user-related API operations
 */
export class UserApiClient extends BaseApiClient {
  private readonly USERS_ENDPOINT = '/users';

  /**
   * Get all users
   */
  public async getAllUsers(page: number = 1, pageSize: number = 10): Promise<UserListResponse> {
    const response = await this.get<UserListResponse>(
      `${this.USERS_ENDPOINT}?page=${page}&pageSize=${pageSize}`
    );
    return response.data;
  }

  /**
   * Get user by ID
   */
  public async getUserById(userId: string): Promise<User> {
    const response = await this.get<User>(`${this.USERS_ENDPOINT}/${userId}`);
    return response.data;
  }

  /**
   * Get user by email
   */
  public async getUserByEmail(email: string): Promise<User> {
    const response = await this.get<User>(`${this.USERS_ENDPOINT}/email/${email}`);
    return response.data;
  }

  /**
   * Create a new user
   */
  public async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await this.post<User>(this.USERS_ENDPOINT, userData);
    return response.data;
  }

  /**
   * Update user
   */
  public async updateUser(userId: string, userData: UpdateUserRequest): Promise<User> {
    const response = await this.patch<User>(`${this.USERS_ENDPOINT}/${userId}`, userData);
    return response.data;
  }

  /**
   * Delete user
   */
  public async deleteUser(userId: string): Promise<void> {
    await this.delete(`${this.USERS_ENDPOINT}/${userId}`);
  }

  /**
   * Activate user
   */
  public async activateUser(userId: string): Promise<User> {
    const response = await this.post<User>(`${this.USERS_ENDPOINT}/${userId}/activate`);
    return response.data;
  }

  /**
   * Deactivate user
   */
  public async deactivateUser(userId: string): Promise<User> {
    const response = await this.post<User>(`${this.USERS_ENDPOINT}/${userId}/deactivate`);
    return response.data;
  }
}
