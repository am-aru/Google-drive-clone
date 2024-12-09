import React from "react";
import Search from "./Search";
import FileUploader from "./FileUploader";
import { signOutUser } from "@/lib/actions/user.actions";

const Header = ({
  accountId,
  userId,
}: {
  accountId: string;
  userId: string;
}) => {
  return (
    <header className="header">
      <Search />
      <div className="header-wrapper">
        <FileUploader accountId={accountId} ownerId={userId} className="" />
        <form
          action={async () => {
            "use server";

            await signOutUser();
          }}
        >
          <button type="submit" className="sign-out-button">
            <img
              src="/assets/icons/logout.svg"
              alt="logo"
              width={24}
              height={24}
              className="w-6"
            />
          </button>
        </form>
      </div>
    </header>
  );
};

export default Header;
