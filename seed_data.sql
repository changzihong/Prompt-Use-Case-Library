
-- Seed Data for Prompt Library
-- Run this in your Supabase SQL Editor to populate with 10 professional examples

INSERT INTO public.prompts (title, use_case, prompt, tags, author_name, author_role)
VALUES 
(
  'Viral LinkedIn Post Generator', 
  'Small business owners struggle to write engaging LinkedIn posts that drive traffic without sounding too "salesy". This prompt creates high-hook content.', 
  'Act as a world-class social media strategist. Write a LinkedIn post about [TOPIC]. Use an "H-E-C-A" framework (Hook, Empathy, Case Study, Action). Keep sentences short. Use 3 relevant hashtags. Tone: Professional but slightly provocative.', 
  ARRAY['Marketing', 'Social Media', 'Growth'],
  'Sarah Chen',
  'Marketing Director'
),
(
  'Python Refactor Pro', 
  'When code is functional but messy (spaghetti code), this prompt helps refactor for PEP 8 compliance and better performance.', 
  'Examine the following Python script. Provide a refactored version that: 1. Improves time complexity, 2. Uses list comprehensions where applicable, 3. Adds descriptive docstrings. Original code: [CODE_BLOCK]', 
  ARRAY['Engineering', 'Python', 'Clean Code'],
  'Alex Rivera',
  'Senior Dev'
),
(
  'Customer Support De-escalator', 
  'Dealing with angry customers is taxing for staff. This prompt generates empathetic, professional responses that resolve conflict.', 
  'A customer is angry about [ISSUE]. Write a response that acknowledges their frustration first (empathy), explains the technical limitation without making excuses, and offers two specific resolutions. Do not use generic corporate jargon.', 
  ARRAY['Customer Success', 'Communication', 'Support'],
  'Jordan Smyth',
  'Support Lead'
),
(
  'Cold Email Outreach Architect', 
  'Sales teams need high-conversion first touches. This prompt creates personalized-sounding emails based on a prospect''s LinkedIn bio.', 
  'Based on this LinkedIn summary: [SUMMARY], write a 3-sentence cold email. Sentence 1: A specific compliment based on their career path. Sentence 2: The value proposition of [PRODUCT]. Sentence 3: A low-friction call to action (15-minute chat).', 
  ARRAY['Sales', 'Outreach', 'Business Development'],
  'Mike Vance',
  'Sales Executive'
),
(
  'Agile User Story Writer', 
  'Product managers often write vague user stories. This prompt enforces the "As a... I want... So that..." standard with acceptance criteria.', 
  'Convert this feature request: [REQUEST] into a professional user story. Include: 1. User Persona, 2. Core Desire, 3. Primary Business Value, 4. Three detailed Acceptance Criteria (Given/When/Then format).', 
  ARRAY['Product', 'Agile', 'Management'],
  'Elena Rodriguez',
  'Product Manager'
),
(
  'SEO Blog Outline Generator', 
  'Content writers need structured outlines that rank on Google. This prompt analyzes a keyword and builds a high-authority structure.', 
  'Analyze the primary keyword: [KEYWORD]. Create a blog post outline including an H1, four H2s, and sub-bullet points for H3s. Include a section for "Commonly Asked Questions" related to this topic for snippet optimization.', 
  ARRAY['Content', 'SEO', 'Writing'],
  'David Kim',
  'SEO Specialist'
),
(
  'New Hire Onboarding Roadmap', 
  'HR teams want to provide 30-60-90 day plans for new hires. This prompt generates a day-by-day task list for the first week.', 
  'Create a 5-day orientation schedule for a new [JOB_TITLE] in the [DEPARTMENT] department. Focus on cultural immersion for days 1-2 and technical setup for days 3-5. Include one "quick win" task for Friday.', 
  ARRAY['HR', 'Operations', 'Leadership'],
  'Samantha Wu',
  'HR Head'
),
(
  'SQL Query Debugger', 
  'Junior analysts often struggle with complex JOINs or subqueries. This prompt explains why a query is slow and fixes it.', 
  'Explain why this SQL query is inefficient: [QUERY]. Then, rewrite it to use indexed columns more effectively and avoid unnecessary subqueries. Explain the performance difference in simple terms.', 
  ARRAY['Data', 'SQL', 'Analytics'],
  'Tariq Aziz',
  'Data Analyst'
),
(
  'Brand Tone & Voice Guide', 
  'New brands need to define how they sound. This prompt creates a style guide based on 3 adjectives.', 
  'Our brand is: [ADJECTIVE 1], [ADJECTIVE 2], [ADJECTIVE 3]. Create a voice guide that includes: 1. Words we use, 2. Words we avoid, 3. How we greet customers, 4. Example response to a positive review.', 
  ARRAY['Design', 'Branding', 'Creative'],
  'Lisa Thorne',
  'Creative Director'
),
(
  'NDA Clause Summarizer', 
  'Non-legal staff need to understand contracts quickly. This prompt translates "legalese" into plain English.', 
  'Summarize the following NDA clause in 20 words or less for a non-lawyer. Specifically highlight: 1. What data is protected, 2. The duration of the protection, 3. The penalty for breach. Clause: [CLAUSE]', 
  ARRAY['Legal', 'Admin', 'Compliance'],
  'Robert Chang',
  'General Counsel'
);
