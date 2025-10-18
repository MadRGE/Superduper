import { supabase } from '@/lib/supabase';

export class StorageService {
  private static BUCKET_NAME = 'documentos';

  /**
   * Upload a file to Supabase Storage
   */
  static async uploadFile(
    file: File,
    expedienteId: string,
    onProgress?: (progress: number) => void
  ): Promise<{ path: string; error: Error | null }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${expedienteId}/${fileName}`;

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        return { path: '', error };
      }

      return { path: filePath, error: null };
    } catch (error) {
      return { path: '', error: error as Error };
    }
  }

  /**
   * Download a file from Supabase Storage
   */
  static async downloadFile(storagePath: string): Promise<{ blob: Blob | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .download(storagePath);

      if (error) {
        return { blob: null, error };
      }

      return { blob: data, error: null };
    } catch (error) {
      return { blob: null, error: error as Error };
    }
  }

  /**
   * Get a signed URL for a file (temporary access)
   */
  static async getSignedUrl(storagePath: string, expiresIn: number = 3600): Promise<{ url: string | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(storagePath, expiresIn);

      if (error) {
        return { url: null, error };
      }

      return { url: data.signedUrl, error: null };
    } catch (error) {
      return { url: null, error: error as Error };
    }
  }

  /**
   * Get public URL for a file (if bucket is public)
   */
  static getPublicUrl(storagePath: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(storagePath);

    return data.publicUrl;
  }

  /**
   * Delete a file from Supabase Storage
   */
  static async deleteFile(storagePath: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([storagePath]);

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * List files in a folder
   */
  static async listFiles(folderPath: string): Promise<{ files: any[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(folderPath);

      if (error) {
        return { files: null, error };
      }

      return { files: data, error: null };
    } catch (error) {
      return { files: null, error: error as Error };
    }
  }

  /**
   * Download file and trigger browser download
   */
  static async downloadFileToDevice(storagePath: string, fileName: string): Promise<{ error: Error | null }> {
    try {
      const { blob, error } = await this.downloadFile(storagePath);

      if (error || !blob) {
        return { error: error || new Error('No se pudo descargar el archivo') };
      }

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }
}
