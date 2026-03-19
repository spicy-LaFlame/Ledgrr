import { useState, useRef } from 'react';
import { Upload, FileText, Trash2, Loader2 } from 'lucide-react';
import { useProjectDocuments } from '../../hooks/useProjectDocuments';
import { useAI } from '../../hooks/useAI';

interface DocumentUploadProps {
  projectId: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const DocumentUpload: React.FC<DocumentUploadProps> = ({ projectId }) => {
  const { isEnabled } = useAI();
  const { documents, uploadDocument, deleteDocument } = useProjectDocuments(projectId);
  const fileRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!isEnabled) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      await uploadDocument(projectId, file);
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError('Failed to extract text from PDF. Ensure the file is a valid, text-based PDF.');
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDocument(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Agreement Documents</h3>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-lg disabled:opacity-50 transition-colors"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Extracting text...
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5" />
              Upload PDF
            </>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {uploadError && (
        <p className="text-xs text-red-500">{uploadError}</p>
      )}

      {documents.length === 0 ? (
        <p className="text-xs text-slate-400">
          No documents uploaded. Upload funding agreements or contracts to enable AI-powered agreement queries.
        </p>
      ) : (
        <div className="space-y-2">
          {documents.map(doc => (
            <div key={doc.id} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700">{doc.fileName}</p>
                  <p className="text-xs text-slate-400">
                    {formatFileSize(doc.fileSize)} • {doc.chunks.length} chunk{doc.chunks.length !== 1 ? 's' : ''} • {new Date(doc.uploadedAt).toLocaleDateString('en-CA')}
                  </p>
                </div>
              </div>
              {deleteConfirmId === doc.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="px-2 py-1 text-xs font-medium text-slate-600 bg-slate-200 rounded hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirmId(doc.id)}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
