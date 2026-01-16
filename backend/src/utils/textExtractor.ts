import pdfParse from 'pdf-parse';
import * as fs from 'fs/promises';
import mammoth from 'mammoth';
// @ts-ignore - epub module doesn't have types
import EPub from 'epub';

export class TextExtractor {
  static async extractFromPDF(filePath: string): Promise<string> {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  static async extractFromDOCX(filePath: string): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch (error) {
      console.error('DOCX extraction error:', error);
      throw new Error('Failed to extract text from DOCX');
    }
  }

  static async extractFromTXT(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      console.error('TXT extraction error:', error);
      throw new Error('Failed to read text file');
    }
  }

  static async extractFromEPUB(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const epub = new EPub(filePath);
        
        epub.on('error', (err: Error) => {
          console.error('EPUB parsing error:', err);
          reject(new Error('Failed to parse EPUB file'));
        });

        epub.on('end', () => {
          const chapters: Promise<string>[] = [];
          
          epub.flow.forEach((chapter: any) => {
            chapters.push(
              new Promise((resolveChapter, rejectChapter) => {
                epub.getChapter(chapter.id, (error: Error | null, text: string) => {
                  if (error) {
                    rejectChapter(error);
                  } else {
                    const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                    resolveChapter(cleanText);
                  }
                });
              })
            );
          });

          Promise.all(chapters)
            .then((texts) => resolve(texts.join('\n\n')))
            .catch(reject);
        });

        epub.parse();
      } catch (error) {
        console.error('EPUB extraction error:', error);
        reject(new Error('Failed to extract text from EPUB'));
      }
    });
  }

  static async extractText(filePath: string, fileType: string): Promise<string> {
    const extension = fileType.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return await this.extractFromPDF(filePath);
      case 'docx':
      case 'doc':
        return await this.extractFromDOCX(filePath);
      case 'txt':
        return await this.extractFromTXT(filePath);
      case 'epub':
        return await this.extractFromEPUB(filePath);
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  }

  static cleanText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();
  }

  static countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  static extractMetadata(text: string): { title?: string; author?: string } {
    const lines = text.split('\n').slice(0, 20);
    const metadata: { title?: string; author?: string } = {};
    
    for (const line of lines) {
      const titleMatch = line.match(/^(?:Title|TITLE):\s*(.+)$/i);
      if (titleMatch) {
        metadata.title = titleMatch[1].trim();
      }
      
      const authorMatch = line.match(/^(?:Author|AUTHOR|By):\s*(.+)$/i);
      if (authorMatch) {
        metadata.author = authorMatch[1].trim();
      }
    }
    
    return metadata;
  }
}
