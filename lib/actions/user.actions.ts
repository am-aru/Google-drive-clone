"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { error } from "console";
import { parseStringify } from "../utils";
import { string } from "zod";
import { cookies } from "next/headers";
import { strict } from "assert";

const getUserByEmail = async (email: string) => {
  try {
    const { databases } = await createAdminClient();

    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("email", [email])],
    );
    return result.total > 0 ? result.documents[0] : null;
  } catch (e) {
    console.log(e);
  }
};

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

export const sendEmailOTP = async ({ email }: { email: string }) => {
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

  console.log({ existingUser });

  const accountId = await sendEmailOTP({ email });

  if (!accountId) throw new Error("failed to send OTP");

  if (!existingUser) {
    try {
      const { databases } = await createAdminClient();

      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        ID.unique(),
        {
          fullName,
          email,
          avatar:
            "https://www.google.com/url?sa=i&url=https%3A%2F%2Fcommons.wikimedia.org%2Fwiki%2FFile%3AUser-avatar.svg&psig=AOvVaw1CXMSAOWpnasQOqW5paxM8&ust=1731826524412000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCKCtntyi4IkDFQAAAAAdAAAAABAE",
          accountId,
        },
      );
    } catch (e) {
      console.log(e);
    }
  }
  return parseStringify({ accountId });
};

export const verifySecret = async ({
  accountId,
  password,
}: {
  accountId: string;
  password: string;
}) => {
  try {
    const { account } = await createAdminClient();
    const session = await account.createSession(accountId, password);

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });
  } catch (error) {
    handleError(error, "Failed to verify OTP");
  }
};
