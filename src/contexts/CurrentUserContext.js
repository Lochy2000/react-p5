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
      const { data } = await axiosRes.get("/dj-rest-auth/user/");
      setCurrentUser(data);
    } catch (err) {
      console.log("User fetch error:", err);
      // Don't redirect here - the user might not be logged in yet
    }
  };

  useEffect(() => {
    handleMount();
  }, []);

  // Set up interceptors for token refresh
  useMemo(() => {
    // Request interceptor - runs before each request
    axiosReq.interceptors.request.use(
      async (config) => {
        // The JWT cookies should be sent automatically
        // No need to manually add headers
        return config;
      },
      (err) => {
        return Promise.reject(err);
      }
    );

    // Response interceptor - runs after each response
    axiosRes.interceptors.response.use(
      (response) => response,
      async (err) => {
        if (err.response?.status === 401) {
          try {
            // Try to refresh the token
            await axios.post("/dj-rest-auth/token/refresh/");
            // If refresh works, retry the original request
            return axios(err.config);
          } catch (refreshErr) {
            // If refresh fails, log out the user
            setCurrentUser(null);
            // Only redirect if user was previously logged in
            if (currentUser) {
              history.push("/signin");
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