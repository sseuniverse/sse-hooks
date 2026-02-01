export interface User {
  id: string;
  roles: string[];
  [key: string]: any;
}

export interface UseRoleGuardOptions {
  user?: User | null;
  redirectTo?: string;
  fallbackComponent?: React.ComponentType;
  onUnauthorized?: () => void;
  sessionKey?: string;
}

export interface UseRoleGuardReturn {
  hasAccess: boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  isLoading: boolean;
  user: User | null;
  checkAccess: (requiredRoles: string[]) => boolean;
  redirect: () => void;
}
