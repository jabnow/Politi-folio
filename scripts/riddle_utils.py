import json
import hashlib

def get_riddle_for_pr(pr_number):
    with open(".coderabbit/riddles.json") as f:
        riddles = json.load(f)

    index = pr_number % len(riddles)
    return riddles[index]

def hash_answer(answer: str):
    return hashlib.sha256(answer.encode()).hexdigest()
