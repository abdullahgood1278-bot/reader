import { TextExtractor } from '../textExtractor';

describe('TextExtractor', () => {
  describe('cleanText', () => {
    it('should remove extra whitespace', () => {
      const input = 'Hello    world\n\n\n\nTest';
      const expected = 'Hello world\n\nTest';
      expect(TextExtractor.cleanText(input)).toBe(expected);
    });

    it('should trim leading and trailing whitespace', () => {
      const input = '   Hello world   ';
      const expected = 'Hello world';
      expect(TextExtractor.cleanText(input)).toBe(expected);
    });
  });

  describe('countWords', () => {
    it('should count words correctly', () => {
      const text = 'Hello world, this is a test.';
      expect(TextExtractor.countWords(text)).toBe(6);
    });

    it('should handle empty strings', () => {
      expect(TextExtractor.countWords('')).toBe(0);
    });

    it('should handle multiple spaces', () => {
      const text = 'Hello    world';
      expect(TextExtractor.countWords(text)).toBe(2);
    });
  });

  describe('extractMetadata', () => {
    it('should extract title from text', () => {
      const text = 'Title: My Book\nAuthor: John Doe\n\nContent...';
      const metadata = TextExtractor.extractMetadata(text);
      expect(metadata.title).toBe('My Book');
      expect(metadata.author).toBe('John Doe');
    });

    it('should handle missing metadata', () => {
      const text = 'Just some content without metadata';
      const metadata = TextExtractor.extractMetadata(text);
      expect(metadata.title).toBeUndefined();
      expect(metadata.author).toBeUndefined();
    });
  });
});
