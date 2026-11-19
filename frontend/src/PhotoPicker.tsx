import { DragEvent, useEffect, useRef, useState } from "react";

const mb = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1);

/**
 * Photo field for the report form: a drop area with a preview. The real file input stays in the form
 * (name="photo"), so the form data and the browser's own picker behave exactly as before.
 */
export default function PhotoPicker({ error }: { error?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [noPreview, setNoPreview] = useState(false);
  const [over, setOver] = useState(false);

  useEffect(() => {
    if (!file) return setUrl(null);
    const u = URL.createObjectURL(file);
    setUrl(u);
    setNoPreview(false); // some browsers cannot show HEIC photos; the file is still sent
    return () => URL.revokeObjectURL(u);
  }, [file]);

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && input.current) {
      const dt = new DataTransfer();
      dt.items.add(dropped);
      input.current.files = dt.files;
      setFile(dropped);
    }
  }

  return (
    <div className="field">
      <span className="label">Photo</span>
      <div
        className={`drop${over ? " over" : ""}${file ? " has" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <input
          ref={input} id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/heic" required className="sr"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <label htmlFor="photo" className="drop-body">
          {file && url && !noPreview ? (
            <img src={url} alt="Preview of the photo you chose" className="drop-preview" onError={() => setNoPreview(true)} />
          ) : (
            <svg viewBox="0 0 48 48" width="44" height="44" aria-hidden="true" className="drop-icon">
              <rect x="5" y="11" width="38" height="28" rx="6" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="17" cy="21" r="3.5" fill="currentColor" />
              <path d="M7 36l11-10 8 7 6-5 10 9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          )}
          <span className="drop-text">
            {file ? (
              <>
                <strong>{file.name}</strong>
                <span className="hint">{mb(file.size)} MB · tap to choose a different photo</span>
              </>
            ) : (
              <>
                <strong>Add a photo</strong>
                <span className="hint">Drag one here, or tap to choose. JPEG, PNG or HEIC, up to 10 MB.</span>
              </>
            )}
          </span>
        </label>
      </div>
      <span className="hint">Location details stored inside the photo are removed when it is saved.</span>
      <span className="err">{error}</span>
    </div>
  );
}
