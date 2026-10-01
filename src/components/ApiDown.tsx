export function ApiDown({ message }: { message: string }) {
  return (
    <div role="alert" className="mx-auto my-12 max-w-2xl rounded-lg border border-savanna-deep/30 bg-savanna/15 px-5 py-4">
      {message}
    </div>
  );
}
