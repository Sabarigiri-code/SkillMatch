package com.skillmatchai.service.resume;

import com.skillmatchai.exception.InvalidResumeException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Set;

/**
 * Extracts plain text from PDF and DOCX resume files.
 * Also validates file type and size before processing.
 */
@Service
public class ResumeParserService {

    private static final Logger logger = LoggerFactory.getLogger(ResumeParserService.class);

    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".pdf", ".docx", ".jpg", ".jpeg", ".png", ".webp");

    /**
     * Validates then extracts text from a resume file.
     *
     * @param file the uploaded resume file
     * @return extracted plain text
     */
    public String extractText(MultipartFile file) {
        validateFile(file);

        String contentType = file.getContentType();
        try {
            if ("application/pdf".equals(contentType)) {
                return extractFromPdf(file.getInputStream());
            } else if ("application/vnd.openxmlformats-officedocument.wordprocessingml.document".equals(contentType)) {
                return extractFromDocx(file.getInputStream());
            } else {
                return "Image resume uploaded: " + file.getOriginalFilename() + ". (OCR text extraction pending)";
            }
        } catch (IOException e) {
            logger.error("Failed to read file for extraction", e);
            throw new InvalidResumeException("Could not read file: " + e.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidResumeException("File is empty or missing.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new InvalidResumeException("File size exceeds the 10MB limit.");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null) {
            throw new InvalidResumeException("File name is invalid.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new InvalidResumeException(
                    "Unsupported file type. Only PDF, DOCX, and Image files are accepted."
            );
        }

        String lowerName = originalName.toLowerCase();
        boolean hasValidExtension = ALLOWED_EXTENSIONS.stream().anyMatch(lowerName::endsWith);
        if (!hasValidExtension) {
            throw new InvalidResumeException("File must have a .pdf, .docx, .jpg, .png, or .webp extension.");
        }
    }

    private String extractFromPdf(InputStream inputStream) throws IOException {
        try (PDDocument document = org.apache.pdfbox.Loader.loadPDF(inputStream.readAllBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            if (text == null || text.isBlank()) {
                throw new InvalidResumeException(
                        "Could not extract text from PDF. The file may be image-only or encrypted.");
            }
            return text.trim();
        }
    }

    private String extractFromDocx(InputStream inputStream) throws IOException {
        try (XWPFDocument document = new XWPFDocument(inputStream)) {
            List<XWPFParagraph> paragraphs = document.getParagraphs();
            StringBuilder sb = new StringBuilder();
            for (XWPFParagraph paragraph : paragraphs) {
                String text = paragraph.getText();
                if (text != null && !text.isBlank()) {
                    sb.append(text).append("\n");
                }
            }
            String result = sb.toString().trim();
            if (result.isBlank()) {
                throw new InvalidResumeException(
                        "Could not extract text from DOCX. The file may be empty.");
            }
            return result;
        }
    }

    public boolean isPdf(MultipartFile file) {
        return "application/pdf".equals(file.getContentType());
    }
}
