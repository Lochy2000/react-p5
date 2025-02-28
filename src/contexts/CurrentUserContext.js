import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { axiosReq, axiosRes } from "../api/axiosDefaults";
import { useHistory } from "react-router";

export const CurrentUserContext = createContext();
export const SetCurrentUserContext = createContext();

export const useCurrentUser = () => useContext(CurrentUserContext);
export const useSetCurrentUser = () => useContext(SetCurrentUserContext);

export const CurrentUserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const history = useHistory();

  const handleMount = async () => {
    try {
      const { data } = await axiosRes.get("dj-rest-auth/user/");
      setCurrentUser(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    handleMount();
  }, []);

  useMemo(() => {
    // Request interceptor - no need to refresh token on every request
    const requestInterceptor = axiosReq.interceptors.request.use(
      (config) => {
        // Just pass the config through, cookies will be sent automatically
        return config;
      },
      (err) => {
        return Promise.reject(err);
      }
    );

    // Response interceptor - handle 401 errors
    const responseInterceptor = axiosRes.interceptors.response.use(
      (response) => response,
      async (err) => {
        if (err.response?.status === 401) {
          try {
            // Try to refresh the token
            await axiosRes.post("/dj-rest-auth/token/refresh/");
            // If successful, retry the original request
            return axiosReq(err.config);
          } catch (refreshErr) {
            // If refresh fails, redirect to login if user was logged in
            setCurrentUser((prevCurrentUser) => {
              if (prevCurrentUser) {
                history.push("/signin");
              }
              return null;
            });
            return Promise.reject(refreshErr);
          }
        }
        return Promise.reject(err);
      }
    );

    // Clean up on unmount
    return () => {
      axiosReq.interceptors.request.eject(requestInterceptor);
      axiosRes.interceptors.response.eject(responseInterceptor);
    };
  }, [history]);

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <SetCurrentUserContext.Provider value={setCurrentUser}>
        {children}
      </SetCurrentUserContext.Provider>
    </CurrentUserContext.Provider>
  );
};