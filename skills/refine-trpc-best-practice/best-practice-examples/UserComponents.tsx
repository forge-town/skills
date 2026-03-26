import { useList, useOne, useCreate } from "@refinedev/core";

export function UserList() {
  const { data, isLoading } = useList({ resource: "users" });

  if (isLoading) return <p>Loading...</p>;
  return (
    <ul>
      {data?.data?.map((user) => (
        <li key={user.id as string}>{user.name as string}</li>
      ))}
    </ul>
  );
}

export function UserDetail({ id }: { id: string }) {
  const { data } = useOne({ resource: "users", id });
  const user = data?.data;

  return user ? <p>{user.name as string}</p> : null;
}

export function CreateUserButton() {
  const { mutate: createUser } = useCreate();

  const handleCreate = () => {
    createUser({
      resource: "users",
      values: { name: "New User", email: "user@example.com" },
    });
  };

  return <button onClick={handleCreate}>Create User</button>;
}
