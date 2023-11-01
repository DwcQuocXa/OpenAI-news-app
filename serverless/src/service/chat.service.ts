import { CharacterTextSplitter, RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { LLMChain } from 'langchain/chains';
import { RunnableSequence } from 'langchain/schema/runnable';
import { BufferMemory } from 'langchain/memory';
import { BaseMessage } from 'langchain/schema';
import { PromptTemplate } from 'langchain/prompts';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { Document } from 'langchain/document';
import { formatDocumentsAsString } from 'langchain/util/document';
import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio';
import { VectorStoreRetriever } from 'langchain/dist/vectorstores/base';

/*export async function createChatChain(articlesString: string) {
    const splitter = new CharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });

    const embeddings = new OpenAIEmbeddings({
        openAIApiKey: OPENAI_API_KEY,
        batchSize: 512,
    });

    const documents = await splitter.createDocuments([articlesString]);
    const vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);

    const model = new OpenAI({ temperature: 0 });

    return new RetrievalQAChain({
        combineDocumentsChain: loadQAStuffChain(model),
        retriever: vectorStore.asRetriever(),
        returnSourceDocuments: true,
    });
}*/

export class ConversationalChatBot {
    private memory: BufferMemory;
    private readonly questionPrompt: PromptTemplate;
    private readonly questionGeneratorTemplate: PromptTemplate;
    private readonly fasterModel: ChatOpenAI;
    private readonly slowerModel: ChatOpenAI;
    private readonly fasterChain: LLMChain;
    private readonly slowerChain: LLMChain;
    private readonly openAIApiKey: string;
    private readonly embeddings: OpenAIEmbeddings;

    constructor(openAIApiKey: string) {
        this.openAIApiKey = openAIApiKey;

        this.questionPrompt = PromptTemplate.fromTemplate(
            `Use the following pieces of context and your knowledge to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.
        ----------
        CONTEXT: {context}
        ----------
        CHAT HISTORY: {chatHistory}
        ----------
        QUESTION: {question}
        ----------
        Helpful Answer:`,
        );

        this.questionGeneratorTemplate = PromptTemplate.fromTemplate(
            `Given the following conversation and a follow up question or message, rephrase the follow up question or message to be a standalone question.
        ----------
        CHAT HISTORY: {chatHistory}
        ----------
        FOLLOWUP QUESTION: {question}
        ----------
        Standalone question:`,
        );

        this.fasterModel = new ChatOpenAI({
            modelName: 'gpt-3.5-turbo',
            openAIApiKey: openAIApiKey,
        });

        this.fasterChain = new LLMChain({
            llm: this.fasterModel,
            prompt: this.questionGeneratorTemplate,
        });

        this.slowerModel = new ChatOpenAI({
            modelName: 'gpt-3.5-turbo', //Best if it's gpt-4
            openAIApiKey: openAIApiKey,
        });

        this.slowerChain = new LLMChain({
            llm: this.slowerModel,
            prompt: this.questionPrompt,
        });

        this.embeddings = new OpenAIEmbeddings({
            openAIApiKey: this.openAIApiKey,
        });
    }

    articleUrlToRetriever = async (url: string) => {
        const loader = new CheerioWebBaseLoader(url);
        const articleHTMLDocs = await loader.load();

        /*const splitter = RecursiveCharacterTextSplitter.fromLanguage('html');
        const transformer = new HtmlToTextTransformer();

        const sequence = splitter.pipe(transformer);*/
        /*const articleDocs = await sequence.invoke(articleHTMLDocs);*/

        /*const splitter = new CharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 25,
        });*/

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 25,
            separators: [' ', ',', '\n'],
        });

        const articleDocs = await splitter.splitDocuments(articleHTMLDocs);

        console.log('creating articleUrlToRetriever', articleDocs.length);

        const documents = articleDocs.filter((doc) => doc.pageContent);

        const vectorStore = await MemoryVectorStore.fromDocuments(documents, this.embeddings);
        return vectorStore.asRetriever();
    };

    articleStringToRetriever = async (articlesString: string) => {
        const splitter = new CharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        const documents = await splitter.createDocuments([articlesString]);
        const vectorStore = await MemoryVectorStore.fromDocuments(documents, this.embeddings);
        return vectorStore.asRetriever();
    };

    private serializeChatHistory = (chatHistory: Array<BaseMessage>): string => {
        return chatHistory
            .map((chatMessage) => {
                if (chatMessage._getType() === 'human') {
                    return `Human: ${chatMessage.content}`;
                } else if (chatMessage._getType() === 'ai') {
                    return `Assistant: ${chatMessage.content}`;
                } else {
                    return `${chatMessage.content}`;
                }
            })
            .join('\n');
    };

    private performQuestionAnswering = async (input: {
        question: string;
        chatHistory: Array<BaseMessage> | null;
        context: Array<Document>;
    }): Promise<{ result: string; rephrasedQuestion: string; sourceDocuments: Array<Document> }> => {
        let newQuestion = input.question;
        // Serialize context and chat history into strings
        const serializedDocs = formatDocumentsAsString(input.context);
        const chatHistoryString = input.chatHistory ? this.serializeChatHistory(input.chatHistory) : null;

        if (chatHistoryString) {
            // Call the faster chain to generate a new question
            const { text } = await this.fasterChain.invoke({
                chatHistory: chatHistoryString,
                context: serializedDocs,
                question: input.question,
            });

            newQuestion = text;
        }

        console.log('newQuestion', newQuestion);

        const response = await this.slowerChain.invoke({
            chatHistory: chatHistoryString ?? '',
            context: serializedDocs,
            question: newQuestion,
        });

        // Save the chat history to memory
        await this.memory.saveContext(
            {
                question: input.question,
            },
            {
                text: response.text,
            },
        );

        return {
            result: response.text,
            rephrasedQuestion: newQuestion,
            sourceDocuments: input.context,
        };
    };

    createConversationalChain = async (retriever: VectorStoreRetriever) => {
        this.memory = new BufferMemory({
            memoryKey: 'chatHistory',
            inputKey: 'question',
            outputKey: 'text',
            returnMessages: true,
        });

        const chain = RunnableSequence.from([
            {
                // Pipe the question through unchanged
                question: (input: { question: string }) => input.question,
                // Fetch the chat history, and return the history or null if not present
                chatHistory: async () => {
                    const savedMemory = await this.memory.loadMemoryVariables({});
                    const hasHistory = savedMemory.chatHistory.length > 0;
                    return hasHistory ? savedMemory.chatHistory : null;
                },
                // Fetch relevant context based on the question
                context: async (input: { question: string }) => retriever.getRelevantDocuments(input.question),
            },
            this.performQuestionAnswering,
        ]);

        return chain;
    };
}
