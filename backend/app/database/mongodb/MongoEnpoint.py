import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, OperationFailure
from datetime import datetime

# --- Configuration and Setup ---

# Load environment variables (MONGO_URI)
load_dotenv()

# Define constants internally for the verification process
TEST_DB_NAME = "verification_db"
TEST_COLLECTION_NAME = "communication_checks"
TEST_DOCUMENT_ID = "mongo_check_001"
TEST_DOCUMENT_CONTENT = {
    "test_id": TEST_DOCUMENT_ID,
    "status": "initial_write_pending",
    "timestamp": datetime.utcnow(),
    "verification_source": "python_script_check"
}

# --- Verification Function ---

def run_mongo_verification():
    """
    Connects to MongoDB using a URI, performs Create, Read, and Delete operations
    to verify communication, and handles cleanup.
    """
    print("🚀 Starting MongoDB Communication Verification...")
    
    # 1. URI Check (Necessary external dependency for connection)
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        print("❌ FAILED: MONGO_URI not set in environment variables.")
        raise ValueError("MONGO_URI must be set for connection.")

    client = None
    collection = None
    
    try:
        # 2. Connection
        print("Connecting to MongoDB...")
        # Use MongoClient to establish connection
        client = MongoClient(mongo_uri)
        # The ismaster command is a lightweight way to check connection status
        client.admin.command('ping') 
        print("✅ Connection successful.")
        
        # Select the test database and collection
        db = client[TEST_DB_NAME]
        collection = db[TEST_COLLECTION_NAME]
        print(f"Using database: {TEST_DB_NAME}, collection: {TEST_COLLECTION_NAME}")

        # 3. Create Data (Write Verification)
        print("Inserting verification document...")
        
        # Use the explicit ID to simplify retrieval later
        document_to_insert = {**TEST_DOCUMENT_CONTENT, "_id": TEST_DOCUMENT_ID}
        
        # insert_one returns an InsertOneResult object
        result = collection.insert_one(document_to_insert)
        
        if result.acknowledged and result.inserted_id == TEST_DOCUMENT_ID:
            print(f"✅ Data write successful. Inserted ID: {result.inserted_id}")
        else:
            print("❌ FAILED: Data insertion not acknowledged by MongoDB.")
            raise RuntimeError("Write Verification Failed.")


        # 4. Read Data (Read Verification)
        print(f"Verifying data retrieval for _id: {TEST_DOCUMENT_ID}...")
        
        # find_one returns the document or None if not found
        retrieved_document = collection.find_one({"_id": TEST_DOCUMENT_ID})

        if retrieved_document is not None and retrieved_document.get("verification_source") == "python_script_check":
            print("✅ Read Verification successful. Document content verified.")
        else:
            print("❌ FAILED: Could not retrieve or verify document content.")
            # We must raise an error to stop execution here, as cleanup relies on this ID
            raise RuntimeError("Read Verification Failed.")


        print("\n✨ ALL MONGODB COMMUNICATION CHECKS PASSED SUCCESSFULLY! ✨")

    except ServerSelectionTimeoutError as e:
        print(f"\n❌ FAILED: Could not connect to MongoDB. Check MONGO_URI and network access. Error: {e}")
        raise
    except OperationFailure as e:
        print(f"\n❌ FAILED: MongoDB operation failed (e.g., authentication, permissions). Error: {e}")
        raise
    except Exception as e:
        print(f"\n❌ A critical error occurred during verification: {e}")
        print("❌ DB COMMUNICATION VERIFICATION FAILED.")
        raise
    finally:
        # 5. Cleanup (Deletion Verification)
        print("\n🧹 Initiating Cleanup Process...")

        # 5a. Document Deletion
        # Check if the collection object was successfully created before attempting to use it
        if collection is not None:
            print(f"Attempting to delete test document from {TEST_COLLECTION_NAME}...")
            try:
                # Delete the specific test document
                delete_result = collection.delete_one({"_id": TEST_DOCUMENT_ID})
                
                # We check the count to confirm deletion
                if delete_result.deleted_count == 1:
                    print("✅ Cleanup successful. Test document deleted.")
                else:
                    # This warning is useful if the write failed but the script kept going
                    print(f"⚠️ WARNING: Did not delete the expected 1 document. Count: {delete_result.deleted_count}")

            except Exception as e:
                # Catch any errors during the deletion attempt
                print(f"⚠️ WARNING: Failed to execute document deletion. Manual cleanup may be required. Error: {e}")
        else:
            print("Skipping document deletion: Collection object was not initialized.")


        # 5b. Connection Closure
        # Check if the client object was successfully connected before attempting to close it
        if client is not None:
            try:
                client.close()
                print("✅ Connection closed successfully.")
            except Exception as e:
                # Catch errors during closing (less common, but possible)
                print(f"⚠️ WARNING: Error while closing the connection. Error: {e}")
        else:
         print("Skipping connection closure: Client object was not initialized.")

# --- Script Execution ---
if __name__ == "__main__":
    try:
        run_mongo_verification()
    except:
        # Exit with a non-zero status code if verification failed
        exit(1)