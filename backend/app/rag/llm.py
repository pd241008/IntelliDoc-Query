from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

# Initialize the Gemini model (requires GOOGLE_API_KEY in .env)
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", 
    temperature=0.2
)

prompt_template = PromptTemplate(
    input_variables=["context", "query"],
    template="""You are an expert document analysis assistant for IntelliDoc. Your goal is to provide highly accurate, structured, and comprehensive answers based EXCLUSIVELY on the provided context.

Guidelines:
1. **Accuracy First**: Rely ONLY on the provided context. Do not invent information or use outside knowledge. If the context does not contain the answer, explicitly state: "I cannot answer this based on the provided document."
2. **Structured Output**: Use Markdown formatting for readability. Use bolding for key terms, bullet points for lists, and headings if the answer is long.
3. **Comprehensive Extraction**: When asked to summarize or extract data, ensure you capture all relevant details, nuances, and numbers present in the context.
4. **Professional Tone**: Maintain a helpful, clear, and objective tone.

Context:
{context}

User Question: {query}
Expert Answer:"""
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
        
    try:
        for chunk in rag_chain.stream({
            "context": context,
            "query": query
        }):
            yield chunk.content
    except Exception as e:
        print(f"LLM Generation failed: {e}")
        yield "I encountered an error while trying to answer your question. Please check your API key configuration."
