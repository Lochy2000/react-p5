import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { axiosReq, axiosRes } from "../api/axiosDefaults";
import { useHistory } from "react-router-dom";

export const CurrentUserContext = createContext();
export const SetCurrentUserContext = createContext();

export const useCurrentUser = () => useContext(CurrentUserContext);
export const useSetCurrentUser = () => useContext(SetCurrentUserContext);

export const CurrentUserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const history = useHistory();

  // Fetch the current user when the app loads
  const handleMount = async () => {
    try {
      console.log("Attempting to fetch current user...");
      const { data } = await axios.get("/dj-rest-auth/user/");
      console.log("User data successfully retrieved:", data);
      setCurrentUser(data);
    } catch (err) {
      console.log("User fetch error:", err.response?.status, err.response?.data);
      // Don't redirect - user might not be logged in yet
    }
  };

  useEffect(() => {
    handleMount();
  }, []);

  // Set up interceptors for handling auth
  useMemo(() => {
    // Response interceptor - handle 401 errors
    axiosReq.interceptors.response.use(
      (response) => response,
      async (err) => {
        if (err.response?.status === 401) {
          // Only try to refresh if we previously had a user
          if (currentUser) {
            try {
              console.log("Attempting token refresh");
              await axios.post("/dj-rest-auth/token/refresh/");
              console.log("Token refresh successful");
              // If refresh works, retry the original request
              return axios(err.config);
            } catch (refreshErr) {
              // If refresh fails, log out the user and redirect
              console.log("Token refresh failed:", refreshErr.response?.status, refreshErr.response?.data);
              setCurrentUser(null);
              // Clear JWT cookies on failure
              document.cookie = "my-app-auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              document.cookie = "my-refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              history.push("/signin");
              return Promise.reject(refreshErr);
            }
          }
        }
        return Promise.reject(err);
      }
    );

    // Apply the same interceptor to axiosRes
    axiosRes.interceptors.response.use(
      (response) => response,
      async (err) => {
        if (err.response?.status === 401) {
          if (currentUser) {
            try {
              console.log("Attempting token refresh");
              await axios.post("/dj-rest-auth/token/refresh/");
              console.log("Token refresh successful");
              return axios(err.config);
            } catch (refreshErr) {
              console.log("Token refresh failed:", refreshErr.response?.status, refreshErr.response?.data);
              setCurrentUser(null);
              // Clear JWT cookies on failure
              document.cookie = "my-app-auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              document.cookie = "my-refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              history.push("/signin");
              return Promise.reject(refreshErr);
            }
          }
        }
        return Promise.reject(err);
      }
    );
  }, [history, currentUser]);

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <SetCurrentUserContext.Provider value={setCurrentUser}>
        {children}
      </SetCurrentUserContext.Provider>
    </CurrentUserContext.Provider>
  );
};