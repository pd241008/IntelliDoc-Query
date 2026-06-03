"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Document } from "@/types";
import { sampleDocuments } from "../sampleDocuments";

type DocumentContextType = {
  documents: Document[];
  isLoading: boolean;
  addDocument: (doc: Document) => void;
  updateDocument: (id: string, data: Partial<Document>) => void;
};

const DocumentContext = createContext<DocumentContextType | null>(null);

export const DocumentProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch("/api/documents");
        const data = await res.json();
        if (res.ok && data.success) {
          // Map backend schema to frontend Document type
          const formattedDocs = data.documents.map((doc: any) => ({
            id: doc.fileId || doc._id,
            name: doc.filename,
            type: "document", // default
            uploadDate: doc.createdAt ? new Date(doc.createdAt).toISOString().split("T")[0] : "",
            expiryDate: "",
            fileUrl: doc.fileUrl || "", 
          }));
          setDocuments(formattedDocs);
        }
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const addDocument = (doc: Document) => setDocuments((prev) => [doc, ...prev]);

  const updateDocument = (id: string, data: Partial<Document>) =>
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...data } : d))
    );

  return (
    <DocumentContext.Provider
      value={{ documents, addDocument, updateDocument, isLoading } as any}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error("useDocuments must be used inside provider");
  return ctx;
};
