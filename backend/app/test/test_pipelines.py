import os
import pathlib
from google import generativeai as genai
from chromadb import Client
from chromadb.config import Settings

# -----------------------------
# IMPORT YOUR PIPELINE FUNCTIONS
# -----------------------------
from ocr.ocr_engine import OCRProcessor
from processing.pipeline import processing_pipeline
from vector.pipeline import vector_pipeline

# -----------------------------
# CONFIG
# -----------------------------
SAMPLE_PDF = "sample_docs/sample.pdf"   # change this to your test file

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

print("\n==============================")
print("      FULL PIPELINE TEST      ")
print("==============================\n")

# -----------------------------
# 1. CHECK FILE
# -----------------------------
print("🔍 Checking sample file...")

if not pathlib.Path(SAMPLE_PDF).exists():
    print(f"❌ Sample PDF not found at {SAMPLE_PDF}")
    exit()

print("✔ Sample PDF found")

# -----------------------------
# 2. OCR EXTRACTION
# -----------------------------
print("\n📄 Running OCR...")

try:
    ocr_engine = OCRProcessor()
    text = ocr_engine.extract_text(SAMPLE_PDF)
    print("✔ OCR Extracted Characters:", len(text))
except Exception as e:
    print("❌ OCR failed:", e)
    exit()

# -----------------------------
# 3. PROCESSING PIPELINE
# -----------------------------
print("\n🧹 Running Cleaning + Normalization Pipeline...")

try:
    cleaned = processing_pipeline(text)
    print("✔ Cleaned Text Length:", len(cleaned))
except Exception as e:
    print("❌ Processing pipeline failed:", e)
    exit()

# -----------------------------
# 4. VECTOR PIPELINE
# -----------------------------
print("\n🧠 Running Vector Embedding Pipeline...")

try:
    embeddings, chunks = vector_pipeline(cleaned)

    print("✔ Chunks:", len(chunks))
    print("✔ Embedding Dimensions:", len(embeddings[0]))
except Exception as e:
    print("❌ Vector pipeline failed:", e)
    exit()

# -----------------------------
# 5. STORE IN CHROMA
# -----------------------------
print("\n💾 Storing embeddings in ChromaDB...")

try:
    chroma_client = Client(
        Settings(
            chroma_api_impl="rest",
            chroma_server_host="api.trychroma.com",
            chroma_server_ssl_enabled=True,
            chroma_api_key=os.getenv("CHROMA_API_KEY")
        )
    )

    collection = chroma_client.get_or_create_collection(name="test_ingestion")

    ids = [f"chunk_{i}" for i in range(len(chunks))]

    collection.add(
        ids=ids,
        documents=chunks,
        embeddings=embeddings
    )

    print("✔ Stored in Chroma successfully")

except Exception as e:
    print("❌ Chroma storage failed:", e)
    exit()

# -----------------------------
# 6. LLM SUMMARIZATION
# -----------------------------
print("\n🧾 Running LLM Summary...")

try:
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(
        f"Summarize this document in 10 bullet points:\n\n{cleaned}"
    )
    print("✔ Summary Generated:\n")
    print(response.text)

except Exception as e:
    print("❌ LLM failed:", e)
    exit()

print("\n🎉 FULL TEST PASSED SUCCESSFULLY!")
