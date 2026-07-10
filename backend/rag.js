import fs from 'fs';
import path from 'path';

// A lightweight, pure JS TF-IDF Vectorizer and Cosine Similarity search engine.
// Written from scratch to serve as a transparent and defensible CS thesis component.

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'cant', 'cannot', 'could',
  'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 'during', 'each', 'few', 'for', 'from', 'further',
  'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 'having', 'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres',
  'hers', 'herself', 'him', 'himself', 'his', 'how', 'hows', 'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is',
  'isnt', 'it', 'its', 'itself', 'lets', 'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not', 'of',
  'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same',
  'shan', 'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such', 'than', 'that', 'thats',
  'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'theres', 'these', 'they', 'theyd', 'theyll',
  'theyre', 'theyve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasnt',
  'we', 'wed', 'well', 'were', 'weve', 'werent', 'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which',
  'while', 'who', 'whos', 'whom', 'why', 'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll',
  'youre', 'youve', 'your', 'yours', 'yourself', 'yourselves'
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 1 && !STOP_WORDS.has(word));
}

export class HandbookSearchEngine {
  constructor() {
    this.chunks = [];      // Contains { id, title, content, citation, tokens }
    this.vocabulary = [];  // List of unique terms across all documents
    this.idf = {};         // Term -> Inverse Document Frequency mapping
    this.vectors = [];     // Array of sparse/dense TF-IDF vectors for each document
  }

  // Load and parse mmsu_handbook.md
  initialize(handbookPath) {
    try {
      const markdownContent = fs.readFileSync(handbookPath, 'utf-8');
      this.parseHandbook(markdownContent);
      this.buildTFIDFIndex();
      console.log(`[RAG Engine] Initialized with ${this.chunks.length} handbook chunks.`);
    } catch (err) {
      console.error('[RAG Engine] Error initializing search engine:', err);
    }
  }

  parseHandbook(markdown) {
    const lines = markdown.split('\n');
    let currentArticle = '';
    let currentSection = '';
    let currentChunkTitle = '';
    let currentChunkContent = [];
    let chunkId = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('## ')) {
        // Clear previous chunk before starting a new article
        this.saveChunk(chunkId++, currentArticle, currentSection, currentChunkTitle, currentChunkContent);
        currentChunkContent = [];
        
        currentArticle = line.replace('## ', '');
        currentSection = '';
        currentChunkTitle = currentArticle;
      } else if (line.startsWith('### ')) {
        // Save previous chunk
        this.saveChunk(chunkId++, currentArticle, currentSection, currentChunkTitle, currentChunkContent);
        currentChunkContent = [];

        currentSection = line.replace('### ', '');
        currentChunkTitle = `${currentArticle} - ${currentSection}`;
      } else if (line.length > 0) {
        currentChunkContent.push(line);
      }
    }
    // Save final chunk
    this.saveChunk(chunkId++, currentArticle, currentSection, currentChunkTitle, currentChunkContent);
  }

  saveChunk(id, article, section, title, contentLines) {
    const content = contentLines.join('\n').trim();
    if (content.length < 20) return; // Skip empty/trivial blocks

    const citation = `${article}${section ? ' - ' + section : ''}`;
    this.chunks.push({
      id,
      title,
      content,
      citation,
      tokens: tokenize(title + ' ' + content)
    });
  }

  buildTFIDFIndex() {
    const docCount = this.chunks.length;
    const termDocCount = {}; // Term -> Count of documents containing it

    // 1. Extract vocabulary and document frequency (DF)
    this.chunks.forEach(chunk => {
      const uniqueTokens = new Set(chunk.tokens);
      uniqueTokens.forEach(token => {
        termDocCount[token] = (termDocCount[token] || 0) + 1;
      });
    });

    this.vocabulary = Object.keys(termDocCount);

    // 2. Calculate Inverse Document Frequency (IDF)
    // Formula: IDF(t) = log(1 + (Total Docs / Docs containing t))
    this.vocabulary.forEach(term => {
      this.idf[term] = Math.log(1 + docCount / termDocCount[term]);
    });

    // 3. Vectorize each document
    this.vectors = this.chunks.map(chunk => this.vectorize(chunk.tokens));
  }

  // Convert token array into a TF-IDF vector
  vectorize(tokens) {
    const vector = {};
    const tokenCounts = {};
    
    // Term Frequency (TF)
    tokens.forEach(token => {
      tokenCounts[token] = (tokenCounts[token] || 0) + 1;
    });

    // TF-IDF = TF * IDF
    Object.keys(tokenCounts).forEach(term => {
      if (this.idf[term]) {
        const tf = tokenCounts[term] / tokens.length; // Normalized TF
        vector[term] = tf * this.idf[term];
      }
    });

    return vector;
  }

  // Calculate dot product of two sparse vectors
  dotProduct(vecA, vecB) {
    let product = 0;
    const keysA = Object.keys(vecA);
    keysA.forEach(key => {
      if (vecB[key]) {
        product += vecA[key] * vecB[key];
      }
    });
    return product;
  }

  // Calculate magnitude of a sparse vector
  magnitude(vec) {
    let sumSquares = 0;
    const keys = Object.keys(vec);
    keys.forEach(key => {
      sumSquares += vec[key] * vec[key];
    });
    return Math.sqrt(sumSquares);
  }

  // Compute cosine similarity between two vectors
  // Formula: CosSim = (A . B) / (||A|| * ||B||)
  cosineSimilarity(vecA, vecB) {
    const magA = this.magnitude(vecA);
    const magB = this.magnitude(vecB);
    if (magA === 0 || magB === 0) return 0;
    return this.dotProduct(vecA, vecB) / (magA * magB);
  }

  // Query index for top matching sections
  search(queryText, limit = 3) {
    const queryTokens = tokenize(queryText);
    if (queryTokens.length === 0) return [];

    const queryVector = this.vectorize(queryTokens);

    const scores = this.chunks.map((chunk, index) => {
      const docVector = this.vectors[index];
      const similarity = this.cosineSimilarity(queryVector, docVector);
      return {
        chunk,
        score: similarity
      };
    });

    // Sort by descending score and filter out zero matches
    return scores
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => ({
        title: item.chunk.title,
        content: item.chunk.content,
        citation: item.chunk.citation,
        score: Math.round(item.score * 100) / 100 // Round to 2 decimal places
      }));
  }
}
