import { CreateUserRequest, UserRole } from '../models/user.model';

/**
 * User Data Factory
 * Generates test user data with realistic values
 */
export class UserFactory {
  private static counter = 0;

  /**
   * Generate a unique email
   */
  private static generateEmail(prefix: string = 'testuser'): string {
    this.counter++;
    const timestamp = Date.now();
    return `${prefix}.${this.counter}.${timestamp}@test.com`;
  }

  /**
   * Generate a random first name
   */
  private static generateFirstName(): string {
    const names = [
      'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily',
      'Robert', 'Emma', 'William', 'Olivia', 'James', 'Sophia',
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  /**
   * Generate a random last name
   */
  private static generateLastName(): string {
    const names = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia',
      'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson',
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  /**
   * Generate a secure password
   */
  private static generatePassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  /**
   * Create a basic user
   */
  public static createUser(overrides?: Partial<CreateUserRequest>): CreateUserRequest {
    return {
      email: this.generateEmail(),
      firstName: this.generateFirstName(),
      lastName: this.generateLastName(),
      role: UserRole.VIEWER,
      password: this.generatePassword(),
      ...overrides,
    };
  }

  /**
   * Create an initiator user
   */
  public static createInitiator(overrides?: Partial<CreateUserRequest>): CreateUserRequest {
    return this.createUser({
      role: UserRole.INITIATOR,
      ...overrides,
    });
  }

  /**
   * Create an approver user
   */
  public static createApprover(overrides?: Partial<CreateUserRequest>): CreateUserRequest {
    return this.createUser({
      role: UserRole.APPROVER,
      ...overrides,
    });
  }

  /**
   * Create an admin user
   */
  public static createAdmin(overrides?: Partial<CreateUserRequest>): CreateUserRequest {
    return this.createUser({
      role: UserRole.ADMIN,
      ...overrides,
    });
  }

  /**
   * Create multiple users
   */
  public static createUsers(count: number, overrides?: Partial<CreateUserRequest>): CreateUserRequest[] {
    return Array.from({ length: count }, () => this.createUser(overrides));
  }

  /**
   * Create a user with specific email
   */
  public static createUserWithEmail(
    email: string,
    overrides?: Partial<CreateUserRequest>
  ): CreateUserRequest {
    return this.createUser({
      email,
      ...overrides,
    });
  }

  /**
   * Reset counter (useful for test isolation)
   */
  public static resetCounter(): void {
    this.counter = 0;
  }
}
