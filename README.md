## Installation

```bash
npm install react-activestorage
```

## Usage

```tsx
import { useActiveStorage } from "react-active-storage";

const Example = () => {
  const form = useRef<HTMLFormElement>(null);
  const [file, setFile] = useState<File | undefined>();

  const { uploading, progress } = useActiveStorage(
    file,
    async ({ blob, error }) => {
      if (blob) console.log(blob.signed_id);
      setError(error);
      setFile(undefined);
      form.current?.reset();
    }
  );

  return (
    <form ref={form}>
      {error && <div>{error.message}</div>}

      <input
        type="file"
        disabled={uploading}
        onChange={(event) => {
          if (!event.target.files) return;
          setFile(event.target.files.item(0) ?? undefined);
        }}
      />

      {progress && (
        <div>
          {progress.loaded} of {progress.total}
        </div>
      )}
    </form>
  );
};
```
