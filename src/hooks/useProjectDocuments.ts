import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db, type ProjectDocument } from '../db/schema';
import { extractTextFromPDF, chunkText } from '../ai/documents';

export function useProjectDocuments(projectId?: string) {
  const documents = useLiveQuery(async () => {
    if (projectId) {
      return db.projectDocuments.where('projectId').equals(projectId).toArray();
    }
    return db.projectDocuments.toArray();
  }, [projectId]) ?? [];

  const uploadDocument = async (projectId: string, file: File): Promise<ProjectDocument> => {
    const extractedText = await extractTextFromPDF(file);
    const chunks = chunkText(extractedText);

    const doc: ProjectDocument = {
      id: uuidv4(),
      projectId,
      fileName: file.name,
      fileSize: file.size,
      extractedText,
      chunks,
      uploadedAt: new Date().toISOString(),
    };

    await db.projectDocuments.add(doc);
    return doc;
  };

  const deleteDocument = async (id: string) => {
    await db.projectDocuments.delete(id);
  };

  return { documents, uploadDocument, deleteDocument };
}
