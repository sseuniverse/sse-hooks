import { useCallback, useEffect, useState } from "react";
import { User, UseRoleGuardOptions, UseRoleGuardReturn } from "./types";

export function useRoleGuard(
  requiredRoles: string[],
  options: UseRoleGuardOptions = {},
): UseRoleGuardReturn {
  const {
    user: providedUser,
    redirectTo = "/unauthorized",
    onUnauthorized,
    sessionKey = "user",
  } = options;

  const [user, setUser] = useState<User | null>(providedUser || null);
  const [isLoading, setIsLoading] = useState(!providedUser);

  useEffect(() => {
    if (!providedUser && typeof window !== "undefined") {
      try {
        const sessionUser = sessionStorage.getItem(sessionKey);
        if (sessionUser) {
          const parsedUser = JSON.parse(sessionUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Error parsing user from session:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [providedUser, sessionKey]);

  const hasAnyRole = useCallback(
    (roles: string[]): boolean => {
      if (!user || !user.roles) return false;
      return roles.some((role) => user.roles.includes(role));
    },
    [user],
  );

  const hasAllRoles = useCallback(
    (roles: string[]): boolean => {
      if (!user || !user.roles) return false;
      return roles.every((role) => user.roles.includes(role));
    },
    [user],
  );

  const checkAccess = useCallback(
    (roles: string[]): boolean => {
      return hasAnyRole(roles);
    },
    [hasAnyRole],
  );

  const hasAccess = checkAccess(requiredRoles);

  const redirect = useCallback(() => {
    if (typeof window !== "undefined" && redirectTo) {
      window.location.href = redirectTo;
    }
  }, [redirectTo]);

  useEffect(() => {
    if (!isLoading && !hasAccess) {
      if (onUnauthorized) {
        onUnauthorized();
      } else if (redirectTo && typeof window !== "undefined") {
        redirect();
      }
    }
  }, [hasAccess, isLoading, onUnauthorized, redirect, redirectTo]);

  return {
    hasAccess,
    hasAnyRole,
    hasAllRoles,
    isLoading,
    user,
    checkAccess,
    redirect,
  };
}
