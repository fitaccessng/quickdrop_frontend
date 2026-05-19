export const resolvePostAuthRoute = (accountType, user) => {
  if (accountType === "vendor") {
    return user?.is_onboarded ? "/vendor/dashboard" : "/vendor/onboarding";
  }
  if (accountType === "rider") {
    return user?.is_onboarded ? "/rider/dashboard" : "/rider/onboarding";
  }
  if (accountType === "admin") {
    return "/admin/dashboard";
  }
  return user?.is_onboarded ? "/dashboard" : "/onboarding";
};
