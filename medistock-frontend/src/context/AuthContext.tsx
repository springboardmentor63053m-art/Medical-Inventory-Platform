import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext =
  createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [user, setUser] =
    useState<User | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);


  // ============================================
  // RESTORE LOGIN AFTER PAGE REFRESH
  // ============================================

  useEffect(() => {

    const storedToken =
      localStorage.getItem("token");

    const storedUser =
      localStorage.getItem("user");

    if (storedToken && storedUser) {

      try {

        const parsedUser =
          JSON.parse(storedUser) as User;

        if (
          !parsedUser?.username ||
          !Array.isArray(parsedUser.roles)
        ) {
          throw new Error(
            "Invalid stored user"
          );
        }

        setToken(storedToken);
        setUser(parsedUser);

      } catch (error) {

        console.error(
          "Invalid authentication data:",
          error
        );

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");

        setToken(null);
        setUser(null);
      }

    }

    setLoading(false);

  }, []);


  // ============================================
  // LOGIN
  // ============================================

  const login = (
    newToken: string,
    newUser: User
  ) => {

    localStorage.setItem(
      "token",
      newToken
    );

    localStorage.setItem(
      "user",
      JSON.stringify(newUser)
    );

    /*
     * Save the role separately for
     * easy frontend access.
     */

    if (
      newUser.roles &&
      newUser.roles.length > 0
    ) {

      const backendRole =
        newUser.roles[0];

      const role =
        backendRole.replace(
          "ROLE_",
          ""
        );

      localStorage.setItem(
        "role",
        role
      );
    }

    setToken(newToken);
    setUser(newUser);
  };


  // ============================================
  // LOGOUT
  // ============================================

  const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    setToken(null);
    setUser(null);

    window.location.href = "/login";
  };


  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return null;
  }


  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


// ============================================
// USE AUTH HOOK
// ============================================

export const useAuth = () => {

  const context =
    useContext(AuthContext);

  if (context === undefined) {

    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
};