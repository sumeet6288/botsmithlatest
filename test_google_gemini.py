#!/usr/bin/env python3
"""Test Google Gemini integration"""

import asyncio
import os
import sys
from dotenv import load_dotenv

# Add backend to path
sys.path.insert(0, '/app/backend')

load_dotenv('/app/backend/.env')

from services.chat_service import ChatService

async def test_gemini():
    """Test Gemini model"""
    print("🧪 Testing Google Gemini Integration...\n")
    
    try:
        # Initialize chat service
        chat_service = ChatService()
        print(f"✅ Chat service initialized with key: {chat_service.api_key[:20]}...\n")
        
        # Test with Gemini model
        print("📤 Sending test message to Gemini...")
        response, citations = await chat_service.generate_response(
            message="Say 'Hello from Gemini!' and nothing else.",
            session_id="test-session-gemini",
            system_message="You are a helpful assistant.",
            model="gemini-2.0-flash-lite",
            provider="google"  # This should be mapped to "gemini" internally
        )
        
        print(f"✅ Gemini Response: {response}\n")
        
        # Test with different Gemini model
        print("📤 Testing gemini-2.5-flash model...")
        response2, _ = await chat_service.generate_response(
            message="Say 'Gemini 2.5 Flash works!' and nothing else.",
            session_id="test-session-gemini-2",
            system_message="You are a helpful assistant.",
            model="gemini-2.5-flash",
            provider="google"
        )
        
        print(f"✅ Gemini 2.5 Flash Response: {response2}\n")
        
        print("✅ All Gemini tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Error testing Gemini: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_gemini())
    sys.exit(0 if success else 1)
