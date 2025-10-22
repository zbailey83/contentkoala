import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

const ProfilePage = () => {
  const user = useQuery(api.users.getUser);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Profile</h1>
      <div className="p-8 rounded-lg shadow-md bg-white">
        <div className="flex items-center mb-4">
          <img
            src={user?.imageUrl}
            alt="profile"
            className="w-24 h-24 rounded-full"
          />
          <div className="ml-4">
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2">Credits</h3>
          <p className="text-4xl font-bold">{user?.credits ?? 0}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;