import React from "react";

const Client = ({ socketId, username }) => {
  return (
    <div className="flex items-center w-10/12 mx-auto gap-4">
      <div>
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
            username
          )}&background=random&size=40`}
          alt={`${username} Avatar`}
          className="rounded-md"
        />
      </div>

      <div
        className="w-40 truncate text-ellipsis overflow-hidden whitespace-nowrap"
        title={username}
      >
        {username}
      </div>
    </div>
  );
};

export default Client;
