package com.skillmatchai.service.ai.prompts;

public class PromptTemplates {
    public static final String RESUME_ANALYSIS = """
            Analyze this resume text and extract the following structured information.
            CRITICAL: You MUST calculate a realistic ATS score out of 100 based heavily on the applicant's skills, depth of experience, and projects. Provide a short 1-sentence feedback snippet on how to improve the score.
            CRITICAL: You MUST return ONLY valid, parseable JSON. Do NOT include markdown blocks like ```json. Do NOT include categories or text inside arrays (e.g., no "Frameworks:" inside the skills array, just string elements).
            CRITICAL: Do NOT use dots (.) in ANY JSON keys (e.g., use "ReactJS" instead of "React.js" in the skillLevels map), as this breaks the database.
            CRITICAL for "projects": Return each project as a single string formatted strictly as: "Project Name | Technologies Used | Short Description"
            CRITICAL for "education": Return each education entry formatted strictly as: "Degree | Institution | Year"
            CRITICAL for "certifications": Return each certification formatted strictly as: "Certification Name | Issuer"
            Output as valid JSON with the exact following schema:
            {
              "skills": ["Java", "Python", "SQL"],
              "skillLevels": {
                "Java": "Advanced",
                "Python": "Intermediate"
              },
              "projects": ["Project Name | Tech1, Tech2 | Brief description"],
              "education": ["Degree | College | Year"],
              "experience": [
                {
                  "company": "Company Name",
                  "role": "Job Title",
                  "bullets": [
                    {
                      "id": "uuid-1",
                      "originalText": "exact text of the bullet point from resume",
                      "optimizedText": null,
                      "injectedSkills": []
                    }
                  ]
                }
              ],
              "certifications": ["Certification Name | Issuer"],
              "summary": "a brief professional summary",
              "atsScore": 85,
              "atsFeedback": "Good foundation! Optimizing keywords in your experience section will push this above 90%%."
            }
            Do not invent information. Extract exact bullet points into originalText. Generate a unique short string for id. If missing, leave empty or null.
            Resume Text:
            %s
            """;

    public static final String BULLET_TAILORING = """
            You are an expert ATS optimizer and resume writer.
            Rewrite the following resume bullet point to naturally and truthfully incorporate the missing skill: '%s'.
            Use strong action verbs, emphasize impact, and use quantifiable metrics where appropriate.
            Do not invent completely new responsibilities, just reframe the existing one to highlight the skill.
            Output as valid JSON with the exact following schema:
            {
              "optimizedText": "the rewritten bullet point"
            }
            Original Bullet:
            %s
            """;


    public static final String JOB_ANALYSIS = """
            You are an expert job description analyzer and ATS system.
            Carefully analyze the job description below and extract all technical and domain requirements.

            CRITICAL RULES:
            1. Return ONLY valid, raw JSON. NO markdown, NO ```json blocks, NO extra text.
            2. "requiredSkills" MUST include every specific technical skill, programming language, framework, tool, platform, or domain mentioned anywhere in the job description. This is the MOST IMPORTANT field. Never return an empty array for this.
            3. "preferredSkills" should include bonus/nice-to-have skills mentioned.
            4. Do NOT use dots (.) in skill names (use "NodeJS" not "Node.js", "ReactJS" not "React.js").
            5. If the job says "AI Literacy" or "Cloud Management" extract those as skills too.
            
            Output schema (return ONLY this JSON, nothing else):
            {
              "role": "exact job title or role extracted from the description",
              "requiredSkills": ["skill1", "skill2", "skill3"],
              "preferredSkills": ["skill4"],
              "tools": ["tool1"],
              "experience": "required years/type of experience",
              "education": "required education",
              "softSkills": ["communication", "teamwork"]
            }
            
            Job Description:
            %s
            """;

    public static final String ROADMAP_GENERATION = """
            You are a senior tech lead and university campus placement coach.
            The student has an upcoming on-campus company recruitment drive in EXACTLY 15 TO 25 DAYS for the role: %s.
            
            The student needs to master/review the following technical skills and competencies:
            %s
            
            CRITICAL TIMELINE & PLACEMENT CRITERIA:
            1. Total Duration: EXACTLY %d WEEKS (Days 1 to %d, matching the student's 15-25 day placement drive timeline).
            2. Do NOT create 1 week per individual skill. Synthesize and GROUP all related skills into %d cohesive, intensive placement sprint modules:
               - Week 1: Core Backend & Data Layer (Microservices, REST APIs, Relational DBs, NoSQL DBs, Unit Testing)
               - Week 2: Modern Frontend & Full Stack Integration (ES6+, React, State Management, HTML5, CSS3, Modern UI)
               - Week 3: Cloud, DevOps, System Design & Final Placement Interview Defense (Docker, AWS, Git, CI/CD, Top Technical Interview Questions)
            3. INTERVIEW PREP EMPHASIS:
               - For every week, "topics" MUST include high-frequency campus placement interview questions, tricky edge cases, and code tracing concepts.
               - "practicalTask" must be a concrete, doable rapid coding challenge / interview scenario.
               - "project" must be a practical resume project highlight that impresses technical interviewers.
            4. "estimatedTime" should specify realistic daily/weekly hours (e.g., "15 hours (Days 1-7)").
            5. Return ONLY valid, raw JSON. NO markdown blocks (no ```json).
            
            Output schema:
            {
              "weeks": [
                {
                  "weekNumber": 1,
                  "skill": "Module Title summarizing the grouped skills",
                  "topics": [
                    "Topic 1 with interview focus",
                    "Topic 2 with interview focus",
                    "Topic 3",
                    "Topic 4",
                    "Topic 5"
                  ],
                  "estimatedTime": "15 hours (Days 1-7)",
                  "practicalTask": "Hands-on coding exercise / interview scenario",
                  "project": "Mini placement project highlight"
                }
              ]
            }
            Generate the %d-week campus placement sprint roadmap now:
            """;

    public static final String ASSESSMENT_GENERATION = """
            You are an expert technical assessment designer for software engineering roles.
            Generate a DAILY skill-focused assessment for the skill: %s at %s difficulty level.
            
            CRITICAL RULES:
            1. Generate EXACTLY 20 unique MCQ questions minimum. You may generate more for technical skills.
            2. Every question MUST be type "MCQ" with exactly 4 options.
            3. Options must be plausible — wrong answers should be common misconceptions, not obviously wrong.
            4. Include output-prediction questions (e.g., "What does this code print?") for programming skills.
            5. Include concept questions, tricky edge cases, and practical application questions.
            6. Distribute questions across: fundamentals (30%%), advanced concepts (40%%), practical/coding (30%%).
            7. Each question MUST include a concise explanation of why the correct answer is right.
            
            Output ONLY valid JSON — no markdown, no commentary:
            {
              "questions": [
                {
                  "type": "MCQ",
                  "questionText": "the full question text",
                  "options": ["option A text", "option B text", "option C text", "option D text"],
                  "correctOption": "exact text of correct option (must match one option exactly)",
                  "explanation": "brief explanation of why this answer is correct"
                }
              ]
            }
            
            Skill: %s
            Difficulty: %s
            Generate minimum 20 questions now:
            """;

    public static final String FULL_ASSESSMENT_GENERATION = """
            You are a senior technical assessment architect for top IT companies like Wipro, TCS, Infosys, Cognizant, Accenture.
            Generate a COMPREHENSIVE WEEKLY FULL-PORTION TEST for a candidate applying to: %s for the role: %s.
            
            Required Skills to cover: %s
            Difficulty Level: %s
            
            MANDATORY REQUIREMENTS:
            1. Generate AT LEAST 25 unique questions (minimum 20 MCQ + additional coding/scenario questions).
            2. Distribute questions PROPORTIONALLY across ALL listed required skills.
            3. Mirror the question PATTERNS AND STYLE historically used by %s in technical assessments.
            4. MCQs must have exactly 4 options with plausible wrong answers (common misconceptions).
            5. Include code snippet questions where user predicts output (for Java/Python/SQL skills).
            6. Include SQL query writing scenarios where relevant.
            7. Include scenario-based design/architecture questions for senior skills.
            8. Each question MUST include an explanation field.
            9. Mark each question with which skill it tests in a "skill" field.
            
            Question type distribution:
            - "MCQ" → conceptual and knowledge questions with 4 options
            - "coding" → predict output / trace code questions (still provide 4 options)
            - "scenario" → real-world design/approach questions (still provide 4 options)
            
            Output ONLY valid JSON — no markdown, no commentary:
            {
              "questions": [
                {
                  "type": "MCQ",
                  "skill": "which skill this tests",
                  "questionText": "complete question text including any code snippet",
                  "options": ["option A", "option B", "option C", "option D"],
                  "correctOption": "exact text of correct option",
                  "explanation": "clear explanation of why this is correct"
                }
              ]
            }
            
            Company: %s
            Job Title: %s
            Skills: %s
            Generate the full assessment with 25+ questions now:
            """;

    public static final String INTERVIEW_GENERATION = """
            Generate interview questions for a %s role focusing on: %s.
            Output as valid JSON with the exact following schema:
            {
              "questions": [
                {
                  "questionText": "the question",
                  "expectedAnswer": "the expected ideal answer or key points"
                }
              ]
            }
            Generate exactly 3 questions.
            """;

    public static final String INTERVIEW_EVALUATION = """
            Evaluate the following interview answers for a %s role.
            Output as valid JSON with the exact following schema:
            {
              "overallScore": 85, // 0-100 overall score
              "technicalCorrectness": 80,
              "clarity": 90,
              "completeness": 85,
              "relevance": 95,
              "strengths": ["clear strength demonstrated in candidate answers"],
              "weaknesses": ["specific weakness or improvement area"],
              "suggestions": "practical suggestions for the candidate to improve",
              "questionScores": [
                {
                  "score": 85,
                  "feedback": "specific feedback for this individual question"
                }
              ]
            }
            CRITICAL EVALUATION RULES:
            - If candidate answers are empty, nonsensical, irrelevant, or have zero technical depth, overallScore and individual question scores MUST be 0.
            - If the candidate demonstrated no strengths, return an empty array: "strengths": [].
            - In weaknesses, explain clearly what was missing or why the answers were insufficient.
            - In questionScores, provide an entry for each question in the input with a score from 0-100 and specific feedback.
            Questions and Candidate Answers:
            %s
            """;
}
