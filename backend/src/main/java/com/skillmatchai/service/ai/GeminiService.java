package com.skillmatchai.service.ai;

import com.skillmatchai.service.ai.dto.GeminiRequest;
import com.skillmatchai.service.ai.dto.GeminiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);
    
    private final RestTemplate restTemplate;
    
    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent}")
    private String apiUrl;

    private static final int MAX_RETRIES = 3;
    private static final int MAX_PROMPT_LENGTH = 30000;

    public GeminiService(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder
                .connectTimeout(Duration.ofSeconds(15))
                .readTimeout(Duration.ofSeconds(90)) // Extended for 25+ question generation
                .build();
    }

    public String generateJson(String prompt) {
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("your_gemini_api_key")) {
            logger.warn("Gemini API key is not configured. Falling back to mock response.");
            return generateMockResponse(prompt);
        }

        // Enforce max prompt size to avoid token limit errors
        String safePrompt = prompt.length() > MAX_PROMPT_LENGTH 
                ? prompt.substring(0, MAX_PROMPT_LENGTH) + "\n...[TRUNCATED]" 
                : prompt;

        GeminiRequest requestPayload = new GeminiRequest(safePrompt);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<GeminiRequest> entity = new HttpEntity<>(requestPayload, headers);

        String urlWithKey = apiUrl + "?key=" + apiKey;

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                GeminiResponse response = restTemplate.postForObject(urlWithKey, entity, GeminiResponse.class);
                if (response != null && response.extractText() != null) {
                    return cleanJsonResponse(response.extractText());
                }
            } catch (RestClientException e) {
                logger.error("Gemini API call failed (attempt {}/{}): {}", attempt, MAX_RETRIES, e.getMessage());
                if (attempt == MAX_RETRIES) {
                    logger.warn("Exhausted retries or hit quota limit. Falling back to mock response.");
                    return generateMockResponse(prompt);
                }
                try {
                    Thread.sleep(1000 * attempt); // Exponential backoff
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    logger.warn("Thread interrupted during retry backoff. Falling back to mock response.");
                    return generateMockResponse(prompt);
                }
            }
        }
        
        return generateMockResponse(prompt);
    }

    private String generateMockResponse(String prompt) {
        if (prompt.contains("Analyze this resume")) {
            return "{\"skills\": [\"Java\", \"Spring Boot\"], \"skillLevels\": {\"Java\": \"Advanced\"}, \"projects\": [], \"education\": [], \"experience\": [], \"certifications\": [], \"summary\": \"Mock Java Developer\"}";
        } else if (prompt.contains("Analyze this job description")) {
            return "{\"role\": \"Mock Developer\", \"requiredSkills\": [\"Java\", \"SQL\"], \"preferredSkills\": [\"Docker\"], \"tools\": [], \"experience\": \"3 years\", \"education\": \"BSc\", \"softSkills\": [\"Communication\"]}";
        } else if (prompt.contains("Generate a weekly learning roadmap") || prompt.toLowerCase().contains("roadmap")) {
            // Dynamically generate mock weeks based on the skill gaps passed in the prompt
            // Prompt contains: "Skill gaps to cover (one week each, in this exact order): 1. SkillA, 2. SkillB"
            List<String> skills = new ArrayList<>();
            try {
                if (prompt.contains("Skill gaps to cover")) {
                    String after = prompt.substring(prompt.indexOf("Skill gaps to cover"));
                    String list = after.substring(after.indexOf(":") + 1, after.indexOf("CRITICAL")).trim();
                    String[] parts = list.split(",");
                    for (String part : parts) {
                        String skill = part.replaceFirst("^\\s*\\d+\\.\\s*", "").trim();
                        if (!skill.isEmpty()) {
                            skills.add(skill);
                        }
                    }
                }
            } catch (Exception e) {
                logger.warn("Failed to parse mock skills from prompt", e);
            }
            
            // Fallback if parsing failed
            if (skills.isEmpty()) {
                skills.add("Spring Boot");
                skills.add("Docker");
            }
            
            StringBuilder sb = new StringBuilder();
            sb.append("{\"weeks\": [");
            for (int i = 0; i < skills.size(); i++) {
                sb.append(String.format(
                    "{\"weekNumber\": %d, \"skill\": \"%s\", \"topics\": [\"Basics of %s\", \"Advanced %s\"], \"estimatedTime\": \"5 hours\", \"practicalTask\": \"Build a sample %s app\", \"project\": \"Mini %s Project\"}",
                    (i + 1), skills.get(i), skills.get(i), skills.get(i), skills.get(i), skills.get(i)
                ));
                if (i < skills.size() - 1) sb.append(", ");
            }
            sb.append("]}");
            return sb.toString();
        } else if (prompt.toLowerCase().contains("assessment designer") || prompt.toLowerCase().contains("assessment architect") || prompt.toLowerCase().contains("assessment")) {
            return """
            {
              "questions": [
                {"id": "1", "type": "MCQ", "questionText": "Which of the following statements about the volatile keyword in Java is true?", "options": ["It guarantees atomic operations on the variable", "It ensures thread-caching is disabled for the variable", "It is used to prevent serialization of a field", "It locks the object monitor during variable access"], "correctOption": "It ensures thread-caching is disabled for the variable", "skillCategory": "Java Core", "difficulty": "Intermediate", "explanation": "The volatile keyword ensures visibility of changes to variables across threads by bypassing local thread caches."},
                {"id": "2", "type": "MCQ", "questionText": "What happens when a RuntimeException is thrown inside a finally block?", "options": ["It is caught by the closest catch block for Exception", "It suppresses any exception thrown in the try block", "The JVM terminates immediately", "It gets wrapped in a finallyException"], "correctOption": "It suppresses any exception thrown in the try block", "skillCategory": "Java Core", "difficulty": "Advanced", "explanation": "If a finally block throws an exception, it abruptly terminates and shadows/suppresses any unhandled exception previously thrown in the try block."},
                {"id": "3", "type": "MCQ", "questionText": "Which isolation level prevents phantom reads in a relational database?", "options": ["Read Committed", "Repeatable Read", "Serializable", "Read Uncommitted"], "correctOption": "Serializable", "skillCategory": "SQL", "difficulty": "Intermediate", "explanation": "Serializable is the strictest isolation level and uses range locks to completely prevent phantom reads."},
                {"id": "4", "type": "MCQ", "questionText": "What is the primary difference between useMemo and useCallback in React?", "options": ["useMemo memoizes a value, useCallback memoizes a function", "useMemo is for state, useCallback is for props", "useCallback runs asynchronously, useMemo is synchronous", "There is no difference, they are aliases"], "correctOption": "useMemo memoizes a value, useCallback memoizes a function", "skillCategory": "React", "difficulty": "Intermediate", "explanation": "useCallback(fn, deps) is equivalent to useMemo(() => fn, deps). One caches the function instance, the other caches the result."},
                {"id": "5", "type": "MCQ", "questionText": "In Spring Boot, which annotation is a meta-annotation that includes @ComponentScan?", "options": ["@SpringBootApplication", "@Configuration", "@EnableAutoConfiguration", "@RestController"], "correctOption": "@SpringBootApplication", "skillCategory": "Spring Boot", "difficulty": "Beginner", "explanation": "@SpringBootApplication is a convenience annotation that wraps @Configuration, @EnableAutoConfiguration, and @ComponentScan."},
                {"id": "6", "type": "MCQ", "questionText": "What is the purpose of the EXPOSE instruction in a Dockerfile?", "options": ["It maps a port from the container to the host", "It documents which ports are intended to be published", "It opens the port in the firewall automatically", "It binds the container to a specific IP address"], "correctOption": "It documents which ports are intended to be published", "skillCategory": "Docker", "difficulty": "Beginner", "explanation": "EXPOSE does not actually publish the port. It functions as a type of documentation between the person who builds the image and the person who runs the container."},
                {"id": "7", "type": "MCQ", "questionText": "Which pattern is typically used to handle distributed transactions across microservices?", "options": ["Two-Phase Commit (2PC)", "Saga Pattern", "API Gateway", "Circuit Breaker"], "correctOption": "Saga Pattern", "skillCategory": "Microservices", "difficulty": "Advanced", "explanation": "The Saga pattern manages distributed transactions by breaking them into local transactions mapped with compensating transactions for rollbacks."},
                {"id": "8", "type": "MCQ", "questionText": "Can you override a private or static method in Java?", "options": ["Yes, both can be overridden", "No, neither can be overridden", "Private methods can, static cannot", "Static methods can, private cannot"], "correctOption": "No, neither can be overridden", "skillCategory": "Java Core", "difficulty": "Intermediate", "explanation": "Private methods are not visible to subclasses. Static methods belong to the class, not the instance; redefining a static method in a subclass is called 'hiding', not overriding."},
                {"id": "9", "type": "MCQ", "questionText": "In a SQL query, what is the correct logical order of execution?", "options": ["SELECT, FROM, WHERE, GROUP BY, HAVING", "FROM, WHERE, GROUP BY, HAVING, SELECT", "FROM, SELECT, WHERE, GROUP BY, HAVING", "SELECT, WHERE, FROM, GROUP BY, HAVING"], "correctOption": "FROM, WHERE, GROUP BY, HAVING, SELECT", "skillCategory": "SQL", "difficulty": "Intermediate", "explanation": "The logical execution order evaluates FROM first to resolve the dataset, applies WHERE filtering, groups the data, applies HAVING filters on groups, and finally SELECTs the output columns."},
                {"id": "10", "type": "MCQ", "questionText": "Why should you avoid using the array index as a 'key' prop in React?", "options": ["It causes an immediate runtime crash", "It negatively impacts rendering performance and state mapping on reorders", "It is deprecated in React 18", "Keys must strictly be UUID strings"], "correctOption": "It negatively impacts rendering performance and state mapping on reorders", "skillCategory": "React", "difficulty": "Intermediate", "explanation": "If the order of items changes, using indexes as keys can confuse React's reconciliation algorithm, causing state to incorrectly bleed across un-reordered components."},
                {"id": "11", "type": "MCQ", "questionText": "What is the result of running 'git reset --soft HEAD~1'?", "options": ["Deletes the last commit and discards all file changes", "Moves the HEAD back one commit, keeping changes in the staging area", "Moves the HEAD back and leaves changes unstaged", "Pushes the local revert to the remote repository"], "correctOption": "Moves the HEAD back one commit, keeping changes in the staging area", "skillCategory": "Git", "difficulty": "Intermediate", "explanation": "The --soft flag moves HEAD but leaves your index (staging area) and working tree completely untouched."},
                {"id": "12", "type": "MCQ", "questionText": "What does the 'L' in SOLID principles stand for?", "options": ["Loose Coupling", "Liskov Substitution Principle", "Linear Scalability", "Low Latency"], "correctOption": "Liskov Substitution Principle", "skillCategory": "System Design", "difficulty": "Beginner", "explanation": "The Liskov Substitution Principle states that objects of a superclass shall be replaceable with objects of its subclasses without breaking the application."},
                {"id": "13", "type": "MCQ", "questionText": "What is the default bean scope in the Spring Framework?", "options": ["Prototype", "Singleton", "Request", "Session"], "correctOption": "Singleton", "skillCategory": "Spring Boot", "difficulty": "Beginner", "explanation": "By default, Spring creates a single shared instance (Singleton) of the bean and caches it in the application context."},
                {"id": "14", "type": "MCQ", "questionText": "Which HTTP method is defined as idempotent?", "options": ["POST", "PATCH", "PUT", "CONNECT"], "correctOption": "PUT", "skillCategory": "API Design", "difficulty": "Intermediate", "explanation": "PUT is idempotent; making the same PUT request multiple times will always yield the same resource state. POST is not idempotent."},
                {"id": "15", "type": "MCQ", "questionText": "What is the output of 'typeof null' in JavaScript?", "options": ["'null'", "'undefined'", "'object'", "'number'"], "correctOption": "'object'", "skillCategory": "JavaScript", "difficulty": "Beginner", "explanation": "Due to a historical bug in early JavaScript implementations, typeof null evaluates to 'object', which has been retained for backward compatibility."},
                {"id": "16", "type": "MCQ", "questionText": "Which functional interface accepts two arguments and produces a boolean result?", "options": ["Predicate<T>", "BiPredicate<T, U>", "BiFunction<T, U, R>", "Supplier<T>"], "correctOption": "BiPredicate<T, U>", "skillCategory": "Java Core", "difficulty": "Intermediate", "explanation": "BiPredicate represents a predicate (boolean-valued function) of two arguments."},
                {"id": "17", "type": "MCQ", "questionText": "What does a LEFT JOIN guarantee in its output?", "options": ["Only matching rows from both tables", "All rows from the right table", "All rows from the left table, with nulls for unmatched right table columns", "Cartesian product of both tables"], "correctOption": "All rows from the left table, with nulls for unmatched right table columns", "skillCategory": "SQL", "difficulty": "Beginner", "explanation": "A LEFT JOIN returns all records from the left table, and the matched records from the right table. The result is 0 records from the right side if there is no match."},
                {"id": "18", "type": "MCQ", "questionText": "What triggers a re-render in a React component?", "options": ["Modifying a ref's current property", "Changing local variables inside the component function", "Updating state or receiving new props", "Calling console.log"], "correctOption": "Updating state or receiving new props", "skillCategory": "React", "difficulty": "Beginner", "explanation": "React re-renders components only when their props change, state changes via a setter function, or the parent component re-renders."},
                {"id": "19", "type": "MCQ", "questionText": "In Kubernetes, what is a Pod?", "options": ["A physical node in the cluster", "The smallest deployable computing unit consisting of one or more containers", "A network policy governing traffic", "A storage volume attached to a container"], "correctOption": "The smallest deployable computing unit consisting of one or more containers", "skillCategory": "Kubernetes", "difficulty": "Beginner", "explanation": "A Pod models an application-specific 'logical host' and can contain one or more tightly coupled containers."},
                {"id": "20", "type": "MCQ", "questionText": "What is the time complexity of searching for an element in a balanced Binary Search Tree (BST)?", "options": ["O(1)", "O(n)", "O(log n)", "O(n log n)"], "correctOption": "O(log n)", "skillCategory": "Data Structures", "difficulty": "Beginner", "explanation": "In a perfectly balanced BST, half the tree is eliminated at each step, resulting in a logarithmic O(log n) search time."}
              ]
            }
            """;
        } else if (prompt.contains("Generate interview questions")) {
            return "{\"questions\": [{\"questionText\": \"Explain OOP\", \"expectedAnswer\": \"Object Oriented Programming\"}, {\"questionText\": \"How do you test code?\", \"expectedAnswer\": \"Testing\"}]}";
        } else if (prompt.contains("Evaluate the following interview answers")) {
            return "{\"overallScore\": 68, \"technicalCorrectness\": 80, \"clarity\": 90, \"completeness\": 70, \"relevance\": 100, \"strengths\": [\"Clear\"], \"weaknesses\": [\"Short\"], \"suggestions\": \"Add detail\"}";
        }
        return "{}";
    }

    public static String cleanJsonResponse(String raw) {
        if (raw == null || raw.isBlank()) {
            return "{}";
        }
        String text = raw.trim();
        if (text.startsWith("```")) {
            int firstNewline = text.indexOf('\n');
            if (firstNewline != -1) {
                text = text.substring(firstNewline + 1);
            } else {
                text = text.replaceFirst("^```[a-zA-Z]*", "");
            }
        }
        if (text.endsWith("```")) {
            text = text.substring(0, text.length() - 3);
        }
        text = text.trim();

        int firstBrace = text.indexOf('{');
        int firstBracket = text.indexOf('[');
        int start = -1;
        if (firstBrace != -1 && firstBracket != -1) {
            start = Math.min(firstBrace, firstBracket);
        } else if (firstBrace != -1) {
            start = firstBrace;
        } else {
            start = firstBracket;
        }

        int lastBrace = text.lastIndexOf('}');
        int lastBracket = text.lastIndexOf(']');
        int end = Math.max(lastBrace, lastBracket);

        if (start != -1 && end != -1 && end >= start) {
            text = text.substring(start, end + 1);
        }

        return text.trim();
    }
}
