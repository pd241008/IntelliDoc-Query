
import os
api_key=os.getenv("CHROMA_API_KEY")
if(api_key!=api_key):
   print("api key not found") 
else:
   print("API Found",api_key)

