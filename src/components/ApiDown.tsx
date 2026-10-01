export function ApiDown({ message }: { message: string }) {
  return (
    <div role="alert" className="mx-auto my-12 max-w-2xl rounded-lg border border-accent-deep/30 bg-accent/15 px-5 py-4">
      {message}
    </div>
  );
}
