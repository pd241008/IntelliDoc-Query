from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

# Initialize the Gemini model (requires GOOGLE_API_KEY in .env)
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", 
    temperature=0.2
)

prompt_template = PromptTemplate(
    input_variables=["context", "query"],
    template="""You are an expert document assistant. Answer the user's question using ONLY the provided context. If the context does not contain the answer, say "I cannot answer this based on the provided documents."

Context:
{context}

Question: {query}
Answer:"""
)

# LangChain Expression Language (LCEL) chain
rag_chain = prompt_template | llm


def generate_answer_stream(query: str, context: str):
    """
    Generates an answer using Gemini given the provided context.
    Yields chunks for streaming.
    """
    if not context or context.strip() == "No relevant documents found.":
        yield "I could not find relevant information in the uploaded documents to answer your question."
        return
        
    for chunk in rag_chain.stream({
        "context": context,
        "query": query
    }):
        yield chunk.content
