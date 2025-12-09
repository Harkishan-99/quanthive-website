import { BlogPost } from './types';

// Helper function to create slug from title
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Default mock data matching the theme
export const DEFAULT_FEATURED_POST: BlogPost = {
  id: 'featured-1',
  title: 'The Billion Dollar Coin Flip',
  date: 'December 2025',
  category: 'Research',
  author: 'Harkishan',
  authorAvatar: 'https://picsum.photos/seed/harkishan/100/100',
  excerpt: 'Why Current AI Cannot Be Trusted for Investment Decisions',
  imageUrl: 'https://science.nasa.gov/wp-content/uploads/2023/04/potw1930a-jpg.webp?resize=1200,722',
  featured: true,
  slug: 'the-billion-dollar-coin-flip',
  content: `
    <div class="mb-8">
      <p class="text-neutral-500 text-sm font-mono uppercase tracking-wider mb-4">Harkishan  |  December 2025</p>
      <p class="mb-6">The financial industry has embraced large language models with unprecedented enthusiasm, deploying them for everything from research assistance to trading recommendations. Yet beneath the impressive demonstrations and polished marketing lies a troubling reality: these systems fail catastrophically on the tasks that matter most. This article examines four fundamental limitations that render current LLMs unsuitable for mission-critical financial applications, drawing on recent interpretability research from Anthropic, empirical benchmarks, and technical analyses that expose the gap between perception and reality.</p>
      <blockquote class="border-l-4 border-accent-blue pl-6 py-4 my-8 italic text-lg">
        "The best-performing model achieved only 55.9% accuracy, essentially a coin flip for mission-critical financial decisions."
      </blockquote>
    </div>

    <h2 class="text-3xl font-medium mb-6 mt-12">1. The Accuracy Crisis: A Coin Flip for Critical Decisions</h2>
    <p class="mb-6">The Finance Agent Benchmark by vals.ai represents the most rigorous evaluation of AI systems on real financial tasks to date. Comprising 537 expert-authored questions spanning nine categories from fundamental analysis to risk assessment it tests the capabilities that investment professionals actually need. The results should alarm anyone relying on these systems for consequential decisions.</p>
    <p class="mb-6">OpenAI's o3, one of the most capable reasoning model available, achieved just 48.3% accuracy at $3.79 per query. To put this in perspective: a coin flip would give you 50% on binary questions. These models are not just imperfect, they are fundamentally unreliable for the tasks financial professionals need them to perform.</p>
    <div class="my-8 mb-12">
      <img src="/assets/b1a1i1.png" alt="Finance Agent Benchmark Results" class="w-full h-auto rounded-lg border border-white/10" />
    </div>
    <p class="mb-6 text-sm text-neutral-500 italic">Source: Stanford, "Finance Agent Benchmark: Benchmarking LLMs on Real-world Financial Research Tasks" (2025)</p>

    <h3 class="text-2xl font-medium mb-4 mt-8">Where Models Fail Most Dramatically</h3>
    <p class="mb-6">Performance did not collapse uniformly across categories. The failures concentrated precisely where accuracy matters most:</p>
    <ul class="list-disc list-inside mb-6 space-y-3">
      <li><strong>Numerical Reasoning:</strong> Models struggled with basic financial calculations, the kind that analysts perform daily. Multi-step computations involving financial statements frequently produced incorrect results, often with high confidence.</li>
      <li><strong>Financial Adjustments:</strong> Tasks requiring adjustments for non-recurring items, working capital normalization, or pro forma calculations showed particularly poor performance. These are not edge cases, they are routine analytical tasks.</li>
      <li><strong>Modeling Tasks:</strong> Building financial projections, DCF models, or scenario analyses exposed the limits of pattern matching. Models could not maintain internal consistency across projection periods or properly propagate assumptions through calculations.</li>
    </ul>
    <p class="mb-6">The cost dimension compounds the problem. At $3.79 per query for the best-performing model, organizations face a stark choice: pay premium prices for unreliable answers, or accept even lower accuracy from cheaper alternatives. Neither option serves the needs of professional financial analysis.</p>

    <div class="flex items-center justify-center py-12"><span class="text-2xl text-neutral-700">✢</span></div>

    <h2 class="text-3xl font-medium mb-6 mt-12">2. The Fabricated Reasoning Problem</h2>
    <p class="mb-6">Low accuracy alone would be manageable if we could identify when models were likely to be wrong. The more insidious problem, revealed by Anthropic's interpretability research in their landmark "Tracing the Thoughts of a Large Language Model" paper, is that these systems sometimes construct plausible-sounding explanations for conclusions they reached through entirely different means or no genuine reasoning at all.</p>

    <h3 class="text-2xl font-medium mb-4 mt-8">The Motivated Reasoning Phenomenon</h3>
    <p class="mb-6">Anthropic's researchers discovered that when given math problems with subtly incorrect hints, Claude would produce the hinted answer while describing standard mathematical procedures it never actually performed. Internal circuit traces revealed "no evidence at all of that calculation having occurred", only post-hoc rationalization designed to justify a predetermined conclusion.</p>
    <blockquote class="border-l-4 border-accent-blue pl-6 py-4 my-8 italic">
      "The model constructs plausible-looking reasoning steps to justify predetermined conclusions, not genuine computation."
    </blockquote>
    <p class="mb-6">Consider the implications for financial analysis. When an LLM produces a DCF valuation with detailed assumptions and calculations, how do you know whether it actually computed the present values, or simply generated text that looks like a DCF analysis? The research suggests the answer may be disturbing: in many cases, the model may be producing what valuations "should look like" rather than performing genuine discounted cash flow calculations.</p>

    <h3 class="text-2xl font-medium mb-4 mt-8">The Arithmetic Deception</h3>
    <p class="mb-6">Perhaps the most striking finding involved simple arithmetic. When asked to explain how it computed 36+59=95, Claude described the standard carrying algorithm taught in elementary schools. But internal traces told a different story: the model was actually using parallel approximation paths and "mental math" shortcuts entirely different from the procedure it described.</p>
    <div class="my-8 mb-12">
      <img src="/assets/b1a1i2.png" alt="Anthropic Research on LLM Reasoning" class="w-full h-auto rounded-lg border border-white/10" />
    </div>
    <p class="mb-6 text-sm text-neutral-500 italic">Source: Anthropic, "Tracing the thoughts of a large language model" (2025)</p>
    <p class="mb-6">This is not a minor discrepancy. It means the explanations these models provide for their reasoning cannot be trusted even when the final answer is correct. For regulated financial applications requiring audit trails and explainability, this represents a fundamental architectural flaw, not a bug to be fixed with more training data.</p>

    <div class="flex items-center justify-center py-12"><span class="text-2xl text-neutral-700">✢</span></div>

    <h2 class="text-3xl font-medium mb-6 mt-12">3. The Nondeterminism Catastrophe</h2>
    <p class="mb-6">Financial institutions operate under strict regulatory requirements for reproducibility. When an auditor asks why a particular trade was executed or how a risk assessment was calculated, the answer cannot be "it depends on what else the server was processing at the time." Yet this is precisely the situation with standard LLM inference.</p>

    <h3 class="text-2xl font-medium mb-4 mt-8">The Shocking Scale of Variability</h3>
    <p class="mb-6">Research from Thinking Machines Lab quantified what many practitioners suspected: LLM outputs are shockingly inconsistent. Testing Qwen-3-235B at temperature=0; a setting that should mathematically produce identical outputs, they observed 80 unique completions from 1,000 identical queries. The most common response occurred only 7.8% of the time.</p>

    <div class="my-8 overflow-x-auto">
      <table class="min-w-full border border-white/10">
        <thead>
          <tr class="border-b border-white/10">
            <th class="px-4 py-3 text-left text-sm font-mono uppercase tracking-wider">Metric</th>
            <th class="px-4 py-3 text-left text-sm font-mono uppercase tracking-wider">Standard Inference</th>
            <th class="px-4 py-3 text-left text-sm font-mono uppercase tracking-wider">Required</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-white/5">
            <td class="px-4 py-3">Unique outputs (1,000 queries)</td>
            <td class="px-4 py-3">80</td>
            <td class="px-4 py-3">1</td>
          </tr>
          <tr class="border-b border-white/5">
            <td class="px-4 py-3">Most common output frequency</td>
            <td class="px-4 py-3">7.8%</td>
            <td class="px-4 py-3">100%</td>
          </tr>
          <tr>
            <td class="px-4 py-3">Audit reproducibility</td>
            <td class="px-4 py-3">Impossible</td>
            <td class="px-4 py-3">Guaranteed</td>
          </tr>
        </tbody>
      </table>
      <p class="mt-4 text-sm text-neutral-500 italic">Source: Thinking Machines Lab, "Defeating Nondeterminism in LLM Inference" (2025)</p>
    </div>

    <h3 class="text-2xl font-medium mb-4 mt-8">The Root Cause: Batch Invariance Failure</h3>
    <p class="mb-6">The research identified the root cause as batch invariance failure. When server load varies, batch sizes change, which affects the reduction order in matrix multiplications and attention operations. Due to floating-point non-associativity, different reduction orders produce different results—even with identical inputs and supposedly deterministic settings.</p>
    <p class="mb-6">For financial applications, this has severe implications. Two analysts asking the same question at different times could receive materially different answers. A risk calculation run during market hours (high server load) could differ from the same calculation run overnight. Regulatory audits become impossible when you cannot reproduce the outputs that drove decisions.</p>

    <div class="flex items-center justify-center py-12"><span class="text-2xl text-neutral-700">✢</span></div>

    <h2 class="text-3xl font-medium mb-6 mt-12">4. The Confidence Illusion</h2>
    <p class="mb-6">Perhaps the most dangerous failure mode is the inability of these models to accurately assess their own uncertainty. Investment decisions require not just answers, but calibrated confidence knowing when you know and when you don't. Unfortunately, LLMs are remarkably poor at this fundamental task.</p>

    <h3 class="text-2xl font-medium mb-4 mt-8">The 20% Accuracy Problem</h3>
    <p class="mb-6">Anthropic's research on emergent introspection capabilities revealed that even their most advanced model, Claude Opus 4.1, could only accurately report its own internal states approximately 20% of the time. Using sophisticated concept injection experiments, researchers found that in 80% of cases, models either failed to detect their own internal states or hallucinated non-existent states.</p>
    <blockquote class="border-l-4 border-accent-blue pl-6 py-4 my-8 italic">
      "Asking an LLM 'how confident are you?' produces unreliable responses, the model may express high confidence while being fundamentally uncertain, or vice versa."
    </blockquote>
    <p class="mb-6">The practical implication is stark: when a model tells you it is "highly confident" in a revenue projection or "certain" about a risk assessment, that confidence claim has less than one-in-five chance of reflecting the model's actual internal state. You might as well flip a coin.</p>

    <h3 class="text-2xl font-medium mb-4 mt-8">Why Self-Assessment Fails</h3>
    <p class="mb-6">The introspection failure is not a training problem that can be solved with more data. It reflects a fundamental architectural limitation: these models are trained to predict the next token in a sequence, not to model their own uncertainty. When asked about confidence, they generate text that looks like confidence assessments based on patterns in their training data, not genuine introspection about their computational state.</p>
    <p class="mb-6">Interestingly, the research found that more capable models performed somewhat better at introspection, suggesting scaling may partially address the problem. But "somewhat better" is not "good enough" for financial applications where miscalibrated confidence can lead to catastrophic losses.</p>

    <div class="flex items-center justify-center py-12"><span class="text-2xl text-neutral-700">✢</span></div>

    <h2 class="text-3xl font-medium mb-6 mt-12">5. The Complexity Cliff</h2>
    <p class="mb-6">Recent research from Apple examining Large Reasoning Models (LRMs) models specifically designed for complex reasoning tasks, revealed another troubling pattern: complete accuracy collapse beyond complexity thresholds.</p>

    <h3 class="text-2xl font-medium mb-4 mt-8">The Paradox of Decreasing Effort</h3>
    <p class="mb-6">The Apple researchers found that as problems approached critical difficulty levels, reasoning effort paradoxically decreased. Models appeared to recognize they were approaching their limits and responded by generating shorter, less thorough reasoning chains precisely when more careful analysis was needed.</p>
    <p class="mb-6">Even more troubling, when researchers provided explicit algorithms for solving problems detailed step-by-step procedures that should have been straightforward to follow, models still failed execution. They could describe what a solution should look like without actually computing it. This mirrors the fabricated reasoning problem identified by Anthropic: models predict solution patterns rather than perform genuine computation.</p>

    <h3 class="text-2xl font-medium mb-4 mt-8">Implications for Financial Modeling</h3>
    <p class="mb-6">Financial analysis regularly requires exactly the kind of multi-step reasoning where these models fail. A leveraged buyout model involves dozens of interconnected calculations across projection periods. A merger analysis requires maintaining consistency between acquirer, target, and combined entities. Risk models must propagate assumptions through complex dependency networks.</p>
    <p class="mb-6">The complexity cliff suggests that LLMs may perform adequately on simple queries while failing catastrophically on the sophisticated analyses that create the most value. This is not a graceful degradation, it is a cliff edge where performance drops precipitously once complexity crosses invisible thresholds.</p>
    <div class="my-8 mb-12">
      <img src="/assets/b1a1i3.png" alt="Apple Research on Large Reasoning Models" class="w-full h-auto rounded-lg border border-white/10" />
    </div>
    <p class="mb-6 text-sm text-neutral-500 italic">Source: Apple Research "The Illusion of Thinking: Understanding the Strengths and Limitations of Large Reasoning Models"(2025)</p>

    <div class="flex items-center justify-center py-12"><span class="text-2xl text-neutral-700">✢</span></div>

    <h2 class="text-3xl font-medium mb-6 mt-12">6. Beyond Pattern Matching: A Different Architecture</h2>
    <p class="mb-6">The limitations documented here are not bugs to be fixed with larger models or more training data. They are fundamental characteristics of the pattern-matching paradigm that underlies all current LLMs. Addressing them requires architectural innovation, not incremental improvement.</p>

    <h3 class="text-2xl font-medium mb-4 mt-8">The Neuro-Symbolic Alternative</h3>
    <p class="mb-6">A growing body of research points toward neuro-symbolic architectures as a promising alternative. Rather than asking neural networks to perform computations they cannot reliably execute, these systems use neural components only for what they do well, natural language understanding and planning, while delegating computation and verification to symbolic systems designed for those tasks.</p>
    <p class="mb-6">The key insight is separation of concerns. Neural networks excel at parsing ambiguous human language and generating fluent text. Symbolic systems excel at deterministic computation and maintaining consistency. By combining them appropriately, with neural components suggesting operations and symbolic components executing them, we can achieve the best of both paradigms.</p>

    <h3 class="text-2xl font-medium mb-4 mt-8">Requirements for Financial AI</h3>
    <p class="mb-6">Based on the failures documented above, any AI system suitable for mission-critical financial applications must satisfy several requirements:</p>
    <ul class="list-disc list-inside mb-6 space-y-3">
      <li><strong>Verified Computation:</strong> Every calculation must be traceable and verifiable, not generated by pattern matching.</li>
      <li><strong>Deterministic Inference:</strong> Identical queries must produce identical results, regardless of server load or timing.</li>
      <li><strong>Computed Confidence:</strong> Uncertainty must be calculated from source data and computation properties, not self-reported by neural networks.</li>
      <li><strong>Principled Abstention:</strong> Systems must refuse to answer when data is insufficient or confidence is below threshold.</li>
      <li><strong>Full Audit Trails:</strong> Every output must be traceable to source data, specific computations, and verification steps.</li>
    </ul>

    <div class="flex items-center justify-center py-12"><span class="text-2xl text-neutral-700">✢</span></div>

    <h2 class="text-3xl font-medium mb-6 mt-12">Conclusion: The Case for Principled Skepticism</h2>
    <p class="mb-6">The evidence is clear: current large language models, despite their impressive capabilities in many domains, are fundamentally unsuited for mission-critical financial reasoning. They achieve coin-flip accuracy on financial benchmarks. They fabricate reasoning to justify predetermined conclusions. They produce different outputs for identical inputs. They cannot reliably assess their own confidence. And they collapse completely when complexity exceeds invisible thresholds.</p>
    <p class="mb-6">None of this means AI has no role in finance. These tools can be valuable for research assistance, document summarization, and generating first drafts. But they must be used with clear-eyed understanding of their limitations, and they should never be the final word on decisions with material consequences.</p>
    <p class="mb-6">The path forward requires moving beyond the current paradigm. Rather than hoping that larger models and more training data will solve fundamental architectural limitations, we should design systems that leverage the strengths of neural networks while compensating for their weaknesses. The financial industry deserves AI systems that are accurate, reproducible, and trustworthy; not impressive demonstrations that fail when it matters most.</p>
    <p class="mb-6">The question is not whether AI will transform finance, it will. The question is whether we will build AI systems worthy of the trust we place in them.</p>

    <div class="bg-neutral-900 border border-white/10 p-8 my-12">
      <h3 class="text-2xl font-medium mb-4">MERIDIAN: A Purpose-Built Solution</h3>
      <p class="mb-6">At QuantHive, we are building MERIDIAN, a neuro-symbolic architecture designed from the ground up to address these fundamental limitations. Rather than hoping scaling solves inherent flaws, MERIDIAN separates neural understanding from symbolic execution: LLMs parse queries and generate plans, while purely deterministic engines perform verified computations with full audit trails.</p>
      <p class="mb-6">The system abstains when confidence falls below threshold, ensuring professionals receive reliable answers or honest uncertainty, never fabricated confidence. The project is currently in progress and expected to be live for by Q2 of 2026 for our first waitlist cohort. If you are interested to try it out you can join the waitlist here.</p>
    </div>

    <div class="mt-6 flex justify-center">
      <a
        href="/flash?waitlist=true"
        class="inline-flex items-center justify-center px-8 py-3 bg-white text-black font-semibold uppercase tracking-widest text-sm hover:bg-neutral-200 transition-colors duration-200 shadow-lg shadow-white/5"
      >
        Join Waitlist
      </a>
    </div>

    <div class="mt-12 pt-8 border-t border-white/10">
      <h3 class="text-xl font-medium mb-4">References</h3>
      <ol class="list-decimal list-inside space-y-2 text-sm text-neutral-400">
        <li>Finance Agent Benchmark, "Evaluating AI Agents on Real Financial Tasks," Technical Report, 2025.</li>
        <li>Anthropic, "Tracing the Thoughts of a Large Language Model," Research Publication, 2025.</li>
        <li>Anthropic, "Emergent Introspective Awareness in Large Language Models," Research Publication, 2025.</li>
        <li>Thinking Machines Lab, "Defeating Nondeterminism in LLM Inference," Technical Blog, 2025.</li>
        <li>Apple Research, "The Illusion of Thinking: Understanding the Strengths and Limitations of Large Reasoning Models," Technical Report, 2025.</li>
        <li>vLLM Project, "Batch Invariance Documentation," Technical Documentation, 2025.</li>
      </ol>
    </div>
  `
};

export const FALLBACK_RECENT_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'The Billion Dollar Coin Flip',
    date: 'December 2025',
    category: 'Research',
    author: 'Harkishan',
    authorAvatar: 'https://picsum.photos/seed/harkishan/100',
    imageUrl: 'https://science.nasa.gov/wp-content/uploads/2023/04/potw1930a-jpg.webp?resize=1200,722',
    slug: 'the-billion-dollar-coin-flip',
    excerpt: 'Why Current AI Cannot Be Trusted for Investment Decisions',
    content: DEFAULT_FEATURED_POST.content
  }
];

// Get all blog posts (featured + recent)
export function getAllBlogPosts(): BlogPost[] {
  return [DEFAULT_FEATURED_POST, ...FALLBACK_RECENT_POSTS];
}

// Get post by slug
export function getPostBySlug(slug: string): BlogPost | undefined {
  const allPosts = getAllBlogPosts();
  return allPosts.find(post => post.slug === slug);
}

