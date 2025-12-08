import { BlogPost } from './types';

// --- Trie Implementation ---

class TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  postIds: Set<string>; // Store IDs of posts containing this word

  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.postIds = new Set();
  }
}

class Trie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(word: string, postId: string) {
    let current = this.root;
    const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (!cleanWord) return; // Skip empty after cleaning

    for (const char of cleanWord) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
      current.postIds.add(postId);
    }
    current.isEndOfWord = true;
  }

  search(prefix: string): Set<string> {
    let current = this.root;
    const cleanPrefix = prefix.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (!cleanPrefix) return new Set();

    for (const char of cleanPrefix) {
      if (!current.children.has(char)) {
        return new Set(); // No match found
      }
      current = current.children.get(char)!;
    }
    return this.collectAllPostIds(current);
  }

  private collectAllPostIds(node: TrieNode): Set<string> {
    let ids = new Set(node.postIds);
    // Depth-first traversal to get all children IDs (autocomplete behavior)
    for (const child of node.children.values()) {
        const childIds = this.collectAllPostIds(child);
        childIds.forEach(id => ids.add(id));
    }
    return ids;
  }
}

// --- Levenshtein Distance ---

function getLevenshteinDistance(a: string, b: string): number {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// --- Character Overlap Helper (Bag of Words / Anagram Logic) ---
function getCharFrequency(str: string): Map<string, number> {
  const freq = new Map<string, number>();
  for (const char of str.toLowerCase()) {
    if (/[a-z0-9]/.test(char)) {
        freq.set(char, (freq.get(char) || 0) + 1);
    }
  }
  return freq;
}

function getOverlapCoefficient(query: string, target: string): number {
  const qFreq = getCharFrequency(query);
  const tFreq = getCharFrequency(target);
  
  let matchCount = 0;
  qFreq.forEach((count, char) => {
    if (tFreq.has(char)) {
      matchCount += Math.min(count, tFreq.get(char)!);
    }
  });

  const maxLen = Math.max(query.length, target.length);
  return maxLen === 0 ? 0 : matchCount / maxLen;
}

// --- Date Scoring Helper ---
function calculateDateScore(query: string, targetDateStr: string): number {
    const queryDate = new Date(query);
    const targetDate = new Date(targetDateStr);

    // Invalid date parsing check
    if (isNaN(queryDate.getTime()) || isNaN(targetDate.getTime())) {
        return -100;
    }

    // Calculate difference in days
    const diffTime = Math.abs(queryDate.getTime() - targetDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Score logic: 100 for exact match, decay by 1 point per day
    // Returns negative if far away, which is fine (will be filtered out or overridden by text score)
    return 100 - diffDays;
}

// --- Custom Heuristic Ranking ---

function calculateRankingScore(query: string, text: string): number {
  const q = query.toLowerCase().trim();
  const t = text.toLowerCase();
  
  if (!q) return 0;

  // Global substring check (highest priority for "contains anywhere")
  const containsBonus = t.includes(q) ? 80 : 0;
  
  // Split title into words to evaluate heuristics against "candidate terms"
  const words = t.split(/[\s\-_]+/); 
  let maxWordScore = -1000;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let currentWordScore = 0;

    // Heuristic 1: Huge bonus if search term and candidate term start with same letter
    if (word.startsWith(q[0])) {
      currentWordScore += 100;
    }

    // Heuristic 2: Smaller bonus for every consecutive character match from beginning of word
    let consecutiveMatches = 0;
    const minLen = Math.min(q.length, word.length);
    for (let k = 0; k < minLen; k++) {
      if (q[k] === word[k]) consecutiveMatches++;
      else break;
    }
    currentWordScore += (consecutiveMatches * 15);

    // Heuristic 3: Bonus given if matched word appears at the beginning in a phrase
    if (i === 0) {
      currentWordScore += 75; 
    }
    
    // Heuristic 4: Position Penalty (Early Occurence Preference)
    // We want words appearing earlier in the title to weigh slightly more heavily than words at the end.
    // E.g. searching "m" -> "Models ..." (index 2) > "... Market" (index 5)
    // We subtract points based on the word index.
    currentWordScore -= (i * 4);

    // Substring bonus within word (e.g. "eep" in "Deep")
    if (word.includes(q)) {
        currentWordScore += 50;
    }

    // Heuristic 5: Character Overlap (Fuzzy / Scrambled letters)
    // Helps with "erbalanc" -> "Neural" or misplaced letters
    const overlap = getOverlapCoefficient(q, word);
    if (overlap > 0.5) {
        // Up to 60 points for perfect anagram/overlap
        currentWordScore += (overlap * 60); 
    }

    // Levenshtein Penalty
    // Reduced multiplier from 5 to 3 to be more forgiving for typos
    const dist = getLevenshteinDistance(q, word);
    currentWordScore -= (dist * 3);

    // We take the score of the best matching word in the title
    if (currentWordScore > maxWordScore) {
      maxWordScore = currentWordScore;
    }
  }

  return maxWordScore + containsBonus;
}

// --- Main Search Orchestrator ---

export class SearchEngine {
  private trie: Trie;
  private posts: BlogPost[];

  constructor(posts: BlogPost[]) {
    this.posts = posts;
    this.trie = new Trie();
    this.buildIndex();
  }

  private buildIndex() {
    this.posts.forEach(post => {
      // 1. Index Title words
      const titleWords = post.title.split(/\s+/);
      titleWords.forEach(word => this.trie.insert(word, post.id));

      // 2. Index Author words (for author search)
      const authorWords = post.author.split(/\s+/);
      authorWords.forEach(word => this.trie.insert(word, post.id));
      
      // 3. Index Category
      this.trie.insert(post.category, post.id);

      // 4. Index Date parts (e.g. "January", "2025") for text search
      // (This helps if user types "2025" and we want to find posts from 2025 via text match)
      const dateParts = post.date.split(/[\s,]+/);
      dateParts.forEach(part => this.trie.insert(part, post.id));
    });
  }

  public search(query: string): BlogPost[] {
    if (!query.trim()) return this.posts;

    const normalizedQuery = query.toLowerCase().trim();
    
    // Check if query is a valid date for proximity scoring
    const isDateQuery = !isNaN(Date.parse(query)) && query.length > 3;

    // 1. Trie Search (Candidate Generation)
    // We use Trie to find a broad set of candidates quickly if possible
    let resultIds = this.trie.search(normalizedQuery);
    
    let candidates: BlogPost[] = [];

    // Fallback/Augment: If Trie returns few results or if we suspect fuzzy/date intent,
    // we should score ALL posts to be safe, or at least augment the list.
    // Given the small dataset in a typical blog frontend, scanning all for ranking is fast (O(N)).
    // So we will use the Trie result as a "High confidence" set but still rank everything 
    // to support the complex fuzzy requirements requested.
    candidates = [...this.posts];

    // 2. Comprehensive Scoring (Title, Author, Date)
    const scoredCandidates = candidates.map(post => {
      // A. Title Score (Text & Fuzzy)
      const titleScore = calculateRankingScore(normalizedQuery, post.title);
      
      // B. Author Score (Text & Fuzzy - handles typos in author names)
      const authorScore = calculateRankingScore(normalizedQuery, post.author);
      
      // C. Date Score (Proximity)
      let dateScore = -200; // Default low
      if (isDateQuery) {
          dateScore = calculateDateScore(query, post.date);
      }

      // The final score is the best match across any field.
      // E.g. If Author matches perfectly but Title doesn't, we want it to show up.
      const maxScore = Math.max(titleScore, authorScore, dateScore);

      return { post, score: maxScore };
    });

    // 3. Filtering and Sorting
    // Filter out bad results. 
    // -30 allows for some fuzzy matches (like 'eep' in 'Deep' might rely on substring bonus of 50, so score > 0)
    // But pure Levenshtein penalties might drop below 0. 
    // With our heuristics, a decent fuzzy match usually stays above -20 or so.
    // Proximity dates within ~3 months (90 days) will be > 10.
    const finalResults = scoredCandidates
        .filter(item => item.score > -20) 
        .sort((a, b) => b.score - a.score);

    return finalResults.map(item => item.post);
  }
}

