// auth/src/services/user_service.ts
import User, { IUser } from "../models/users";

/**
 * Service to sync an Auth0 user with the MongoDB database.
 * Upserts the user (creates if they don't exist, updates if they do).
 */
export const syncUserInDB = async (
  auth0Id: string,
  email?: string,
  name?: string,
): Promise<IUser> => {
  const user = await User.findOneAndUpdate(
    { auth0Id },
    { auth0Id, email, name },
    { new: true, upsert: true },
  );

  return user;
};
