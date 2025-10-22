import { useUser } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export const useStoreUser = () => {
  const { isAuthenticated } = useConvexAuth();
  const { user } = useUser();

  const createUser = useMutation(api.users.createUser);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    async function create() {
      await createUser({
        clerkId: user.id,
        email: user.primaryEmailAddress!.emailAddress,
        imageUrl: user.imageUrl,
        name: user.fullName!,
      });
    }

    create();
  }, [isAuthenticated, user, createUser]);
};