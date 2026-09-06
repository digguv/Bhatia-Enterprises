// Lightweight, dependency-free fuzzy text search so spelling mistakes still surface matches.

function levenshtein(a, b) {
    const dp = [];
    for (let i = 0; i <= a.length; i++) dp.push([i]);
    for (let j = 1; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
        }
    }
    return dp[a.length][b.length];
}

const maxDistanceFor = (len) => (len <= 4 ? 1 : len <= 8 ? 2 : 3);

const tokenize = (str) => (str || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

// Returns the best (lowest) edit distance between qWord and any token, or Infinity if no token is close enough.
function bestMatchDistance(qWord, tokens) {
    let best = Infinity;
    for (const t of tokens) {
        if (t === qWord) return 0;
        if (t.includes(qWord) || qWord.includes(t)) {
            best = Math.min(best, 0.5);
            continue;
        }
        const dist = levenshtein(qWord, t);
        if (dist <= maxDistanceFor(Math.max(qWord.length, t.length))) {
            best = Math.min(best, dist);
        }
    }
    return best;
}

// Fuzzy-filters `products` against `query`, tolerating typos/misspellings.
// Matching looks at name, category and description; results are ranked best-match first.
export function fuzzySearchProducts(products, query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) return products;

    const qWords = tokenize(q);
    if (qWords.length === 0) return products;

    const scored = [];
    for (const p of products) {
        const nameLower = (p.name || '').toLowerCase();
        const tokens = tokenize(`${p.name || ''} ${p.category || ''} ${p.description || ''}`);

        let totalDist = 0;
        let allMatched = true;
        for (const qWord of qWords) {
            const dist = bestMatchDistance(qWord, tokens);
            if (dist === Infinity) { allMatched = false; break; }
            totalDist += dist;
        }
        if (!allMatched) continue;

        const directBonus = nameLower.includes(q) ? -1000 : 0;
        scored.push({ product: p, score: totalDist + directBonus });
    }

    scored.sort((a, b) => a.score - b.score);
    return scored.map(s => s.product);
}
