import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import type { IUser } from "../assets/assets";
import api from "../configs/api";
import toast from "react-hot-toast";

type ApiErrorResponse = {
  message?: string;
};

const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong",
) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message || fallback;
  }

  return fallback;
};

interface AuthContextProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;

  user: IUser | null;
  setUser: (user: IUser | null) => void;

  login: (user: { email: string; password: string }) => Promise<void>;

  signUp: (user: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;

  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  user: null,
  setUser: () => {},
  login: async () => {},
  signUp: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const signUp = async ({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }) => {
    try {
      const { data } = await api.post("/api/auth/register", {
        name,
        email,
        password,
      });

      if (data.user) {
        setUser(data.user as IUser);
        setIsLoggedIn(true);
      }

      toast.success(data.message);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to create account"));
    }
  };

  const login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    try {
      const { data } = await api.post("/api/auth/login", {
        email,
        password,
      });

      if (data.user) {
        setUser(data.user as IUser);
        setIsLoggedIn(true);
      }

      toast.success(data.message);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to log in"));
    }
  };

  const logout = async () => {
    try {
      const { data } = await api.post("/api/auth/logout");

      setUser(null);
      setIsLoggedIn(false);
      toast.success(data.message);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to log out"));
    }
  };

  const fetchUser = async () => {
    try {
      const { data } = await api.get("/api/auth/verify");

      if (data.user) {
        setUser(data.user as IUser);
        setIsLoggedIn(true);
      }
    } catch (error) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        if (error.response?.status !== 401) {
          toast.error(error.response?.data?.message || "Unable to verify user");
        }

        return;
      }

      toast.error("Unable to verify user");
    }
  };

  useEffect(() => {
    (async () => {
      await fetchUser();
    })();
  }, []);

  const value = {
    isLoggedIn,
    setIsLoggedIn,
    user,
    setUser,
    login,
    signUp,
    logout,
  };

  return (
    <AuthContext.Provider value={value as AuthContextProps}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
