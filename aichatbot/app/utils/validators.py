from fastapi import HTTPException

def validate_chat_message(message: str):
    if not message or not message.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be empty.")
    if len(message) > 4000:
        raise HTTPException(status_code=400, detail="Message exceeds maximum length of 4000 characters.")
    return True
