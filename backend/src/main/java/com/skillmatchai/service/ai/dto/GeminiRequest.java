package com.skillmatchai.service.ai.dto;

import java.util.List;
import java.util.Map;

public class GeminiRequest {
    private List<Content> contents;
    private GenerationConfig generationConfig;

    public GeminiRequest(String text) {
        this.contents = List.of(new Content(List.of(new Part(text))));
        this.generationConfig = new GenerationConfig("application/json");
    }

    public List<Content> getContents() { return contents; }
    public void setContents(List<Content> contents) { this.contents = contents; }
    public GenerationConfig getGenerationConfig() { return generationConfig; }
    public void setGenerationConfig(GenerationConfig generationConfig) { this.generationConfig = generationConfig; }

    public static class Content {
        private List<Part> parts;
        public Content(List<Part> parts) { this.parts = parts; }
        public List<Part> getParts() { return parts; }
        public void setParts(List<Part> parts) { this.parts = parts; }
    }

    public static class Part {
        private String text;
        public Part(String text) { this.text = text; }
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
    }

    public static class GenerationConfig {
        private String responseMimeType;
        public GenerationConfig(String responseMimeType) { this.responseMimeType = responseMimeType; }
        public String getResponseMimeType() { return responseMimeType; }
        public void setResponseMimeType(String responseMimeType) { this.responseMimeType = responseMimeType; }
    }
}
