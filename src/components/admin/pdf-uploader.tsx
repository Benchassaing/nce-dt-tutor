"use client";

import { useState, useCallback } from "react";
import { createClient } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Upload, FileText, Loader2, CheckCircle, XCircle, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_TYPES = ['application/pdf'];

export function PDFUploader() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [docType, setDocType] = useState('TEXTBOOK');
  const [year, setYear] = useState(new Date().getFullYear());

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const validFiles = newFiles.filter(f => {
      if (!ALLOWED_TYPES.includes(f.type)) {
        toast.error(`${f.name}: Only PDF files allowed`);
        return false;
      }
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name}: File too large (max 50MB)`);
        return false;
      }
      return true;
    });
    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File, index: number) => {
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `uploads/${docType.toLowerCase()}/${fileName}`;

    setProgress(prev => ({ ...prev, [fileName]: 0 }));

    try {
      const { data, error } = await supabase.storage
        .from('nce-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      setProgress(prev => ({ ...prev, [fileName]: 100 }));

      // Save document metadata to database via API
      const response = await fetch('/api/admin/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: file.name,
          type: docType,
          year: parseInt(year),
          fileUrl: data.path,
          fileName: file.name,
          fileSize: file.size,
        }),
      });

      if (!response.ok) throw new Error('Failed to save metadata');

      toast.success(`${file.name} uploaded successfully`);
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(`Failed to upload ${file.name}`);
      setProgress(prev => ({ ...prev, [fileName]: -1 }));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      await uploadFile(files[i], i);
    }

    setFiles([]);
    setUploading(false);
    setProgress({});
  };

  const getProgressColor = (p: number) => {
    if (p === -1) return 'bg-red-500';
    if (p === 100) return 'bg-green-500';
    return 'bg-primary';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Upload PDF Documents</span>
          <Badge variant="outline" className="text-xs">
            Max 50MB per file
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Input */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary transition-colors">
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="pdf-upload"
            disabled={uploading}
          />
          <label htmlFor="pdf-upload" className="cursor-pointer">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-gray-900">Drag & drop PDF files here</p>
            <p className="text-sm text-gray-500 mt-1">or click to browse</p>
            <p className="text-xs text-gray-400 mt-2">PDF only • Max 50MB each</p>
          </label>
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Selected Files ({files.length})</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((file, index) => {
                const fileProgress = progress[`${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`] || 0;
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                    <FileText className="h-5 w-5 text-red-500" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    {fileProgress !== 0 && (
                      <div className="w-24">
                        <Progress
                          value={fileProgress === -1 ? 0 : fileProgress}
                          className="h-1.5"
                        />
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Document Type & Year */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Document Type</Label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TEXTBOOK">📚 Textbook / Curriculum</SelectItem>
                <SelectItem value="EXAM_PAPER">📝 Past Exam Paper</SelectItem>
                <SelectItem value="MARKING_SCHEME">✅ Marking Scheme</SelectItem>
                <SelectItem value="TEACHER_NOTES">📋 Teacher Notes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Year (for exam papers)</Label>
            <Select value={year.toString()} onValueChange={e => setYear(parseInt(e))}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[...Array(10)].map((_, i) => new Date().getFullYear() - i).map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          className="w-full justify-center gap-2"
          size="lg"
        >
          {uploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Uploading {files.length} file(s)...
            </>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              Upload {files.length} File{files.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>

        {files.length > 0 && !uploading && (
          <p className="text-center text-sm text-gray-500">
            Ready to upload {files.length} file{files.length !== 1 ? 's' : ''} as {docType}
          </p>
        )}
      </CardContent>
    </Card>
  );
}