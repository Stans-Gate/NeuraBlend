# backend/openai_utils.py

import os
import re
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_study_plan_text(name, grade, subject, goal):
    """
    Generate a study plan from GPT. If GPT returns an obviously 
    broken or placeholder link, we attempt to replace it by 
    calling generate_fallback_material.
    """
    prompt = f"""
    You are an AI tutor helping a grade {grade} student named {name} who wants to learn {subject}.
    Their goal is: {goal}.

    Please create a numbered list of step-by-step learning objectives.
    Each step should include:
    - A title
    - A short, clear explanation
    - A recommended resource (URL if available and working).
    If no valid resource is found, produce your own short reading material 
    (like a paragraph) that covers the same content.

    Presented in clean markdown format with appropriate headings and bullet points. 
    Do NOT include extraneous text or disclaimers. 
    Output ONLY the steps as a numbered list with clear titles and markdown formatting. 
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful AI tutor for K-12 students."},
                {"role": "user", "content": prompt}
            ]
        )
        plan_md = response.choices[0].message.content
        if is_invalid_resource_link(plan_md):
            fallback = generate_fallback_material(subject, goal)
            plan_md += "\n\nFallback Resource:\n" + fallback
        
        return plan_md

    except Exception as e:
        return f"Error generating plan: {str(e)}"


def is_invalid_resource_link(markdown_text):
    match = re.search(r"\((https?://[^\)]+)\)", markdown_text)
    if match:
        link = match.group(1)
        if "example.com" in link or "broken" in link or "..." in link:
            return True
    return False


def generate_fallback_material(subject, goal):
    """
    Ask GPT to produce a short reading paragraph if the link is invalid.
    """
    fallback_prompt = f"""
    Provide a concise reading passage about {subject} that addresses the goal: {goal}.
    1 or 2 paragraphs max, in markdown, no links needed.
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": fallback_prompt}]
        )
        return response.choices[0].message.content
    except:
        return "Could not generate fallback reading material."

def generate_step_quiz(step_content):
    """
    Generate a single multiple-choice quiz from the given step content.
    Return { question, options, answer_index, hint }.
    We ensure we parse out the 'Answer:' line
    instead of letting GPT produce a 5th option.
    """
    quiz_prompt = f"""
    Based on the following learning step, generate a single multiple-choice quiz with EXACTLY 4 answer options:
    {step_content}

    Format your response as:
    Question: <some question>
    Options:
    A) ...
    B) ...
    C) ...
    D) ...
    Answer: <single letter A, B, C, or D>
    Hint: <short hint if the student chooses the wrong answer>
    
    The response MUST strictly follow this format with clear separations between each section.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful quiz generator."},
                {"role": "user", "content": quiz_prompt}
            ]
        )
        text = response.choices[0].message.content
        
        import re
        
        q_match = re.search(r"Question:\s*(.*?)(?=Options:|$)", text, re.DOTALL)
        question = q_match.group(1).strip() if q_match else "No question found."
        
        opt_pattern = r"Options:\s*A\)\s*(.*?)\s*B\)\s*(.*?)\s*C\)\s*(.*?)\s*D\)\s*(.*?)(?=Answer:|$)"
        opts_match = re.search(opt_pattern, text, re.DOTALL)
        if opts_match:
            options = [o.strip() for o in opts_match.groups()]
        else:
            options = []
            option_lines = re.findall(r"[A-D]\)(.*?)(?=[A-D]\)|Answer:|$)", text, re.DOTALL)
            if option_lines:
                options = [o.strip() for o in option_lines[:4]]  
            
            if not options:
                options = ["Option A", "Option B", "Option C", "Option D"]
        
        ans_match = re.search(r"Answer:\s*([A-D])", text)
        if ans_match:
            correct_letter = ans_match.group(1)
            letter_map = {"A": 0, "B": 1, "C": 2, "D": 3}
            answer_index = letter_map.get(correct_letter, 0)
        else:
            answer_index = 0
        
        hint_match = re.search(r"Hint:\s*(.*?)(?=$)", text, re.DOTALL)
        hint = hint_match.group(1).strip() if hint_match else "Think about the process described in the material."

        return {
            "question": question,
            "options": options,
            "answer_index": answer_index,
            "hint": hint
        }

    except Exception as e:
        return {
            "question": f"Error generating quiz: {str(e)}",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer_index": 0,
            "hint": "Sorry, there was an error generating this quiz."
        }
