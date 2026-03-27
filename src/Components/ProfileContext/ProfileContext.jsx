import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const ProfileContext = createContext({
  profile: null,
  isLoading: true,
});

export const ProfileProvider = ({ children }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      const response = await axios.get(
        `https://route-posts.routemisr.com/users/profile-data`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
        }
      );
      return response.data.data.user;
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <ProfileContext.Provider value={{ profile: data || null, isLoading }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);