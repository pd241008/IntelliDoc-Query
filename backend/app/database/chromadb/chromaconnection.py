import os
import chromadb
from dotenv import load_dotenv
import numpy as np

# --- Configuration and Setup ---

# Load environment variables from .env file
load_dotenv()

# Define constants internally for the verification process
TEST_COLLECTION_NAME = "chroma_verification_check"
VERIFICATION_ID_1 = "v_id_001"
VERIFICATION_DOCUMENT_1 = "This is a controlled document for verification purposes only."
VERIFICATION_EMBEDDING_1 = [0.1, 0.2, 0.3]


# --- Verification Function ---

def run_secure_db_verification():
    """
    Connects to ChromaDB Cloud and performs self-contained CRUD operations 
    to verify communication. No external user data is used.
    """
    print("🚀 Starting Self-Contained ChromaDB Cloud Verification...")
    
    # 1. API Key Check (Necessary external dependency for connection)
    api_key = os.getenv("CHROMA_API_KEY")
    if not api_key:
        print("❌ FAILED: CHROMA_API_KEY not set.")
        raise ValueError("CHROMA_API_KEY must be set in environment variables.")

    client = None
    collection = None
    
    try:
        # 2. Connection
        print("Connecting to ChromaDB Cloud...")
        client = chromadb.CloudClient(api_key=api_key)
        print("✅ Connection successful.")
        
        # 3. Get or Create Collection 
        print(f"Ensuring collection exists: {TEST_COLLECTION_NAME}...")
        collection = client.get_or_create_collection(name=TEST_COLLECTION_NAME)
        print("✅ Collection ready.")
        
        # 4. Add Self-Defined Data (Write Verification)
        print(f"Adding verification data with ID: {VERIFICATION_ID_1}...")
        collection.add(
            embeddings=[VERIFICATION_EMBEDDING_1],
            documents=[VERIFICATION_DOCUMENT_1],
            ids=[VERIFICATION_ID_1],
            metadatas=[{"source": "internal-verification-script"}]
        )
        print("✅ Data write successful.")

        # 5. Get Data (Read Verification 1: Direct Fetch)
        print("Verifying data retrieval by ID...")
        retrieved_data = collection.get(ids=[VERIFICATION_ID_1])
        
        if (retrieved_data and 
            retrieved_data['documents'] and 
            retrieved_data['documents'][0] == VERIFICATION_DOCUMENT_1):
            
            print("✅ Direct Read Verification successful (Document content verified).")
        else:
            print("❌ FAILED: Direct Read Verification failed.")
            raise RuntimeError("Data retrieval by ID failed.")

        # 6. Query Data (Read Verification 2: Similarity Search)
        print("Verifying data retrieval via similarity search...")
        # Query using the exact same vector (high confidence match)
        query_results = collection.query(
            query_embeddings=[VERIFICATION_EMBEDDING_1],
            n_results=1
        )
        
        if (query_results and 
            query_results['ids'] and 
            query_results['ids'][0][0] == VERIFICATION_ID_1):
            
            # Check the distance for maximum confidence
            if query_results['distances'] and query_results['distances'][0][0] < 1e-6: # Expect distance to be near zero for exact match
                 print("✅ Similarity Search Verification successful (ID and distance verified).")
            else:
                 print(f"⚠️ WARNING: High distance detected ({query_results['distances'][0][0] if query_results['distances'] else 'N/A'}). Search passed, but unexpected distance.")
        else:
            print("❌ FAILED: Similarity Search Verification failed.")
            raise RuntimeError("Similarity search failed to return the expected ID.")

        print("\n✨ ALL SELF-CONTAINED DB COMMUNICATION CHECKS PASSED SUCCESSFULLY! ✨")

    except Exception as e:
        print(f"\n❌ A critical error occurred: {e}")
        print("❌ DB COMMUNICATION VERIFICATION FAILED.")
        # Re-raise the exception to signal failure
        raise
        
    finally:
        # 7. Cleanup (Ensuring no test data remains)
        if client:
            print(f"\n🧹 Attempting cleanup: Deleting collection {TEST_COLLECTION_NAME}...")
            try:
                client.delete_collection(name=TEST_COLLECTION_NAME)
                print("✅ Cleanup successful. Collection deleted.")
            except Exception as e:
                print(f"⚠️ WARNING: Failed to delete collection '{TEST_COLLECTION_NAME}'. Error: {e}")


# --- Script Execution ---
if __name__ == "__main__":
    try:
        run_secure_db_verification()
    except:
        # Exit with a non-zero status code if verification failed
        exit(1)