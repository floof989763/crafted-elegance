import { useRef, useState } from "react";
import { Upload, Loader2, X, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "product-images";

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  folder?: string;
};

export function ImageUploader({ value, onChange, multiple = true, folder = "products" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setBusy(true);
    try {
      const uploads: string[] = [];
      for (const file of Array.from(files)) {
        if (file.size > 8 * 1024 * 1024) {
          throw new Error(`"${file.name}" is larger than 8 MB.`);
        }
        if (!file.type.startsWith("image/")) {
          throw new Error(`"${file.name}" is not an image.`);
        }
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${folder}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { upsert: false, contentType: file.type });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        uploads.push(data.publicUrl);
      }
      onChange(multiple ? [...value, ...uploads] : uploads.slice(0, 1));
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (url: string) => {
    onChange(value.filter((u) => u !== url));
  };

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {value.map((url) => (
            <div
              key={url}
              className="relative aspect-square bg-walnut rounded-sm overflow-hidden group border border-border"
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(url)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-ink/85 text-cream flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-border rounded-sm text-xs uppercase tracking-[0.24em] text-ink hover:border-brass hover:text-brass transition-colors disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : value.length === 0 ? (
            <ImagePlus className="w-4 h-4" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {busy ? "Uploading…" : value.length === 0 ? "Upload from device" : "Add more"}
        </button>
        <span className="text-xs text-muted-foreground">
          JPG, PNG or WebP · up to 8 MB each
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
