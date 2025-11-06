import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { ApiDocument, ApiGroupResponse } from "../types/api";
import { useAuth } from "../context/AuthContext";
import { GroupsApi, UploadDocumentPayload } from "../api/client";

type DocumentUploadScreenProps = {
  group: ApiGroupResponse;
};

type UploadState = {
  uploading: boolean;
  status: string | null;
  error: string | null;
};

const initialUploadState: UploadState = {
  uploading: false,
  status: null,
  error: null,
};

const defaultMetadata = {
  source: "mobile-client",
};

export const DocumentUploadScreen: React.FC<DocumentUploadScreenProps> = ({ group }) => {
  const { accessToken, refreshTokens, logout } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileType, setFileType] = useState("application/pdf");
  const [fileSize, setFileSize] = useState<number>(0);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [documents, setDocuments] = useState<ApiDocument[]>(group.documents ?? []);
  const [state, setState] = useState<UploadState>(initialUploadState);

  const setUploading = useCallback((updating: Partial<UploadState>) => {
    setState((prev) => ({ ...prev, ...updating }));
  }, []);

  const fetchLatestGroup = useCallback(
    async (token: string) => {
      const latest = await GroupsApi.retrieve(group.id, token);
      setDocuments(latest.documents ?? []);
    },
    [group.id],
  );

  const ensureToken = useCallback(async () => {
    if (accessToken) return accessToken;
    const refreshed = await refreshTokens();
    if (!refreshed) {
      logout();
      throw new Error("Authentication required");
    }
    return refreshed;
  }, [accessToken, refreshTokens, logout]);

  const handleUpload = useCallback(async () => {
    try {
      const token = await ensureToken();
      setUploading({ uploading: true, status: null, error: null });

      const payload: UploadDocumentPayload = {
        ownerType: "group",
        ownerId: group.id.toString(),
        title: title.trim(),
        description: description.trim() || undefined,
        fileType: fileType.trim() || "application/octet-stream",
        fileSize,
        metadata: {
          ...defaultMetadata,
          fileUri: fileUri || undefined,
        },
      };

      const response = await GroupsApi.uploadDocument(payload, token);
      setUploading({ uploading: false, status: "Metadata stored.", error: null });

      if (response.uploadUrl && fileUri) {
        try {
          await uploadFileToUrl(response.uploadUrl, fileUri, payload.fileType);
          setUploading({ uploading: false, status: "File uploaded to storage.", error: null });
        } catch (uploadError: any) {
          setUploading({
            uploading: false,
            status: "Metadata created. Upload to storage failed.",
            error: uploadError?.message ?? "Failed to upload file to storage provider.",
          });
        }
      } else if (response.uploadUrl && !fileUri) {
        setUploading({
          uploading: false,
          status: "Signed upload URL issued. Select a file and submit again to push binary content.",
          error: null,
        });
      }

      await fetchLatestGroup(token);
      setTitle("");
      setDescription("");
      setFileUri(null);
      setFileName(null);
      setFileSize(0);
      setFileType("application/pdf");
    } catch (error: any) {
      setUploading({
        uploading: false,
        status: null,
        error: error?.message ?? "Unable to upload document.",
      });
    }
  }, [ensureToken, group.id, title, description, fileType, fileSize, fileUri, fetchLatestGroup, setUploading]);

  useEffect(() => {
    setDocuments(group.documents ?? []);
  }, [group]);

  const hasUploadInstructions = useMemo(() => Boolean(fileUri), [fileUri]);

  const handleSelectFile = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false });
    if (("canceled" in result && result.canceled) || result.type === "cancel") {
      return;
    }
    const asset = "assets" in result && result.assets && result.assets.length > 0 ? result.assets[0] : (result as any);
    setFileUri(asset.uri ?? null);
    setFileName(asset.name ?? null);
    if (asset.mimeType) {
      setFileType(asset.mimeType);
    }
    if (typeof asset.size === "number") {
      setFileSize(asset.size);
    } else {
      setFileSize(0);
    }
    if (!title && asset.name) {
      const baseName = asset.name.replace(/\.[^/.]+$/, "");
      setTitle(baseName);
    }
  }, [title]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upload new document</Text>
        <TextInput
          style={styles.input}
          placeholder="Title"
          placeholderTextColor="#64748b"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Description (optional)"
          placeholderTextColor="#64748b"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="MIME type (e.g. application/pdf)"
          placeholderTextColor="#64748b"
          value={fileType}
          onChangeText={setFileType}
        />
        <View style={styles.fileSelectorRow}>
          <Button title={fileUri ? "Change file" : "Select file"} onPress={handleSelectFile} />
        </View>
        {fileName && (
          <Text style={styles.hint}>
            Selected: {fileName} · {(fileSize / 1024).toFixed(1)} KB
          </Text>
        )}
        {!hasUploadInstructions && (
          <Text style={styles.hint}>
            Choose a document to upload. Metadata is stored immediately; when the backend returns a signed uploadUrl, the file is
            streamed to your storage provider.
          </Text>
        )}
        <Button title={state.uploading ? "Uploading..." : "Submit document"} onPress={handleUpload} disabled={state.uploading} />
        {state.status && <Text style={styles.status}>{state.status}</Text>}
        {state.error && <Text style={styles.error}>{state.error}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Existing documents</Text>
        {documents.length === 0 ? (
          <Text style={styles.empty}>No documents uploaded yet.</Text>
        ) : (
          documents.map((doc) => (
            <View key={doc.id} style={styles.documentRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.documentTitle}>{doc.title}</Text>
                <Text style={styles.documentMeta}>
                  {doc.fileType} · {(doc.fileSize / 1024).toFixed(1)} KB · {new Date(doc.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.documentBadge}>{doc.isEncrypted ? "Encrypted" : "Plain"}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

async function uploadFileToUrl(uploadUrl: string, fileUri: string, contentType: string) {
  const uploadResult = await FileSystem.uploadAsync(uploadUrl, fileUri, {
    httpMethod: "PUT",
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: {
      "Content-Type": contentType,
    },
  });
  if (uploadResult.status < 200 || uploadResult.status >= 300) {
    throw new Error(`Storage upload failed with status ${uploadResult.status}`);
  }
}

export default DocumentUploadScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  content: {
    padding: 20,
    gap: 24,
  },
  section: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 16,
    columnGap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f8fafc",
  },
  input: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#e2e8f0",
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  hint: {
    fontSize: 12,
    color: "#94a3b8",
  },
  fileSelectorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 4,
    columnGap: 12,
  },
  status: {
    fontSize: 12,
    color: "#34d399",
  },
  error: {
    fontSize: 12,
    color: "#f87171",
  },
  empty: {
    fontSize: 12,
    color: "#94a3b8",
  },
  documentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    backgroundColor: "#0b1120",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  documentTitle: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "500",
  },
  documentMeta: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 4,
  },
  documentBadge: {
    fontSize: 11,
    color: "#38bdf8",
  },
});
