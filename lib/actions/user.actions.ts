"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { error } from "console";
import { parseStringify } from "../utils";

const getUserByEmail = async (email: string) => {
  const { database } = await createAdminClient();

  const result = await database.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    [Query.equal("email", [email])],
  );
  return result.total > 0 ? result.documents[0] : null;
};
const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};
const sendEmailOTP = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();
  try {
    const session = await account.createEmailToken(ID.unique(), email);
    return session.userId;
  } catch (err) {
    handleError(error, "Failed to send email OTP");
  }
};

export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) => {
  const existingUser = await getUserByEmail(email);
  const accountId = await sendEmailOTP({ email });
  if (!accountId) throw new Error("failed to send OTP");

  if (!existingUser) {
    const { database } = createAdminClient();

    await database.createAccount(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        name,
        email,
        avatar:
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Fcommons.wikimedia.org%2Fwiki%2FFile%3AUser-avatar.svg&psig=AOvVaw1CXMSAOWpnasQOqW5paxM8&ust=1731826524412000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCKCtntyi4IkDFQAAAAAdAAAAABAE",
        accountId,
      },
    );
  }
  return parseStringify({ accountId });
};
