export interface User {
  id: string;
  roles: string[];
  [key: string]: any;
}

export interface UseRoleGuardOptions {
  /** The user object. If not provided, attempts to read from session storage. */
  user?: User | null;
  /** URL to redirect to if access is denied. @default "/unauthorized" */
  redirectTo?: string;
  /** Component to render while loading or if unauthorized (not fully implemented in hook logic, mainly for HOCs). */
  fallbackComponent?: React.ComponentType;
  /** Callback fired when access is denied. */
  onUnauthorized?: () => void;
  /** The key used to fetch user data from sessionStorage. @default "user" */
  sessionKey?: string;
}

export interface UseRoleGuardReturn {
  /** Whether the user has the required roles. */
  hasAccess: boolean;
  /** Checks if the user has at least one of the provided roles. */
  hasAnyRole: (roles: string[]) => boolean;
  /** Checks if the user has all of the provided roles. */
  hasAllRoles: (roles: string[]) => boolean;
  /** Whether user data is being loaded. */
  isLoading: boolean;
  /** The current user object. */
  user: User | null;
  /** Manually checks access against a specific set of roles. */
  checkAccess: (requiredRoles: string[]) => boolean;
  /** Function to trigger the redirect manually. */
  redirect: () => void;
}
