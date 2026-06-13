import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { UploadCloud, FileImage } from "lucide-react";

import { Button } from "../../components/ui/Button";

import SignatureCanvas from "./SignatureCanvas";

function SignatureUploadOrDraw({ onAssetUploaded, disabled }) {
  const [imageBlob, setImageBlob] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const fileInputRef = useRef(null);

  const handleCanvasChange = (blob) => {
    setImageBlob(blob);
    if (blob) {
      setSelectedFileName("Drawn Signature");
    } else {
      setSelectedFileName("");
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageBlob(file);
    setSelectedFileName(file.name);
  };

  const handleContainerClick = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  const upload = async () => {
    if (!imageBlob) {
      toast.error("Create or upload a signature first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", imageBlob, "signature.png");

    setUploading(true);
    try {
      // caller handles API call
      await onAssetUploaded(formData);
    } catch (e) {
      // onAssetUploaded should toast; but just in case
      toast.error("Failed to upload signature image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Draw signature</div>
        <SignatureCanvas onChange={handleCanvasChange} />
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Or upload an image</div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFile}
          disabled={disabled || uploading}
          className="hidden"
        />
        
        <div
          onClick={handleContainerClick}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all duration-200
            ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
            ${selectedFileName && selectedFileName !== "Drawn Signature"
              ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400'
              : 'border-slate-300 dark:border-slate-800 hover:border-primary-500 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-600 dark:text-slate-400'
            }`}
        >
          {selectedFileName && selectedFileName !== "Drawn Signature" ? (
            <>
              <FileImage className="h-8 w-8 mb-2 text-emerald-500" />
              <span className="text-sm font-semibold truncate max-w-full px-2">
                {selectedFileName}
              </span>
              <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                Image loaded successfully
              </span>
            </>
          ) : (
            <>
              <UploadCloud className="h-8 w-8 mb-2 text-slate-400" />
              <span className="text-sm font-semibold">
                Click to browse signature image
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                PNG, JPG, or WEBP (Max 2MB)
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={upload} disabled={disabled || uploading || !imageBlob}>
          {uploading ? "Uploading..." : "Upload Signature"}
        </Button>
      </div>
    </div>
  );
}

export default SignatureUploadOrDraw;

