/**
 * Batch: 7 new functions_sequences items (equal_unequal_alg, algebra).
 * Cells: D3 PS pure, D4 DS pure, D4 PS real, D5 PS real ×3, D3 PS pure.
 * Run: node scripts/author/batch-functions_sequences.mjs   (dry run)
 *      APPEND=1 node scripts/author/batch-functions_sequences.mjs
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

const items = [
  // 1. D3 PS pure — geometric sequence with negative ratio, walk back to an early term
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "functions_sequences",
    difficulty: 3,
    stem_md:
      "In a certain sequence of nonzero numbers, each term after the first is $-2$ times the term immediately before it. If the fifth term of the sequence is $48$, what is the second term?",
    choices: ["$-24$", "$-6$", "$-3$", "$3$", "$6$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nLet the first term be $t$. Each step multiplies by $-2$, so the fifth term is $t \\cdot (-2)^4 = 16t$. From $16t = 48$ we get $t = 3$, and the second term is $t \\cdot (-2) = -6$.\n\n**Trigger cue**\nA geometric sequence with one far term given: write that term as first term times a power of the ratio.\n\n**Takeaway**\nEven powers of a negative ratio are positive; track signs term by term.",
    fastest_path_md:
      "Walk backward from $48$, dividing by $-2$ each step: fourth term $-24$, third term $12$, second term $-6$.",
    trap_map: {
      "0": "Divides $48$ by $-2$ only once, landing on the fourth term instead of the second.",
      "2": "Solves $16t = 48$ correctly but then attaches the ratio's negative sign to the first term itself.",
      "3": "Reports the first term $t = 3$ instead of the second term.",
      "4": "Uses ratio $2$ throughout, losing the sign of $-2$.",
    },
    numeric_check: "-6",
    check() {
      // brute force: scan first terms, build the sequence forward, keep those whose 5th term is 48
      const hits = [];
      for (let t1 = -200; t1 <= 200; t1 += 0.5) {
        const seq = [t1];
        for (let i = 0; i < 4; i++) seq.push(seq[seq.length - 1] * -2);
        if (seq[4] === 48) hits.push(seq[1]);
      }
      if (hits.length !== 1) throw new Error(`expected unique model, got ${hits.length}`);
      return { kind: "value", value: hits[0] };
    },
  },

  // 2. D4 DS pure — functional symmetry f(x) = f(4 - x)
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "functions_sequences",
    difficulty: 4,
    stem_md:
      "The function $f$ is defined for all real numbers and satisfies $f(x) = f(4 - x)$ for every real number $x$. What is the value of $f(3)$?\n\n(1) $f(1) = 9$\n\n(2) $f(2) = 9$",
    choices: [...DS_CHOICES],
    correct_index: 0,
    solution_md:
      "**Formal path**\nThe identity $f(x) = f(4 - x)$ pairs each input with its mirror across $x = 2$. Setting $x = 3$ gives $f(3) = f(1)$, so statement (1) forces $f(3) = 9$: sufficient. Setting $x = 2$ gives $f(2) = f(2)$ — the point $x = 2$ is its own mirror, so statement (2) constrains nothing beyond $x = 2$. Both $f(x) = 9$ and $f(x) = (x-2)^2 + 9$ satisfy the identity with $f(2) = 9$, yet give $f(3) = 9$ and $f(3) = 10$: insufficient.\n\n**Trigger cue**\nA relation $f(x) = f(c - x)$: substitute the queried input to locate its mirror point.\n\n**Takeaway**\nSymmetry $f(x) = f(c-x)$ equates values at inputs summing to $c$.",
    fastest_path_md:
      "Plug $x = 3$ into the identity: $f(3) = f(1)$, so (1) answers the question at once. The mirror of $2$ is $2$ itself, so (2) says nothing about $f(3)$.",
    trap_map: {
      "1": "Assumes the value at the axis of symmetry pins down nearby values, so takes (2) alone as sufficient.",
      "2": "Treats $f$ as an unknown curve needing two data points, so demands both statements.",
      "3": "Believes (2) also transfers by symmetry, missing that $4 - 2 = 2$ pairs $x = 2$ with itself.",
      "4": "Misses the pairing of $x = 1$ with $x = 3$ entirely and concludes nothing suffices.",
    },
    numeric_check: null,
    check() {
      // Models: sample any symmetric function on x = 0..4, i.e. f(0)=f(4), f(1)=f(3), f(2) free.
      const models = [];
      for (let a = 0; a <= 12; a++)
        for (let b = 0; b <= 12; b++)
          for (let c = 0; c <= 12; c++) models.push([a, b, c, b, a]); // f(0..4)
      const target = (m) => m[3]; // f(3)
      const s1 = (m) => m[1] === 9;
      const s2 = (m) => m[2] === 9;
      const sufficient = (pred) => {
        const kept = models.filter(pred);
        if (kept.length < 3) throw new Error("too few models for a statement");
        return new Set(kept.map(target)).size === 1;
      };
      const u1 = sufficient(s1);
      const u2 = sufficient(s2);
      const u12 = sufficient((m) => s1(m) && s2(m));
      let index;
      if (u1 && u2) index = 3;
      else if (u1) index = 0;
      else if (u2) index = 1;
      else if (u12) index = 2;
      else index = 4;
      return { kind: "index", index };
    },
  },

  // 3. D4 PS real — arithmetic series total (film montage)
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "functions_sequences",
    difficulty: 4,
    stem_md:
      "A film student edits a montage of $12$ clips. The first clip runs $45$ seconds, and each clip after the first runs $20$ seconds longer than the clip before it. What is the total running time, in seconds, of the montage?",
    choices: ["$930$", "$1{,}740$", "$1{,}860$", "$1{,}980$", "$3{,}180$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nThe clip lengths form an arithmetic sequence with first term $45$, common difference $20$, and $12$ terms. The last clip runs $45 + 11 \\cdot 20 = 265$ seconds. The total is $\\frac{12(45 + 265)}{2} = 6 \\cdot 310 = 1{,}860$ seconds.\n\n**Trigger cue**\nA total of evenly increasing quantities: arithmetic series, count times the average of first and last.\n\n**Takeaway**\nArithmetic series total equals count times average of first and last terms.",
    fastest_path_md:
      "Pair the ends: $45 + 265 = 310$, and $12$ clips make $6$ such pairs, so $6 \\cdot 310 = 1{,}860$.",
    trap_map: {
      "0": "Multiplies the average of the first and last clips by $6$ instead of by all $12$ clips.",
      "1": "Uses only $10$ steps of $20$ seconds, making the last clip $245$ seconds long.",
      "3": "Uses $12$ steps instead of $11$, making the last clip $285$ seconds long.",
      "4": "Multiplies the longest clip, $265$ seconds, by all $12$ clips.",
    },
    numeric_check: "12*(45+265)/2",
    check() {
      // brute force: simulate the 12 clips
      let len = 45;
      let total = 0;
      for (let i = 0; i < 12; i++) {
        total += len;
        len += 20;
      }
      return { kind: "value", value: total };
    },
  },

  // 4. D5 PS real — common terms of two arithmetic schedules
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "functions_sequences",
    difficulty: 5,
    stem_md:
      "Leah waters the ferns in her greenhouse every $4$ days, starting on day $3$ of a $100$-day season, and she waters the orchids every $6$ days, starting on day $5$ of the season. On how many days of the season does Leah water both the ferns and the orchids?",
    choices: ["$4$", "$7$", "$8$", "$9$", "$16$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nFern days satisfy $d \\equiv 3 \\pmod{4}$; orchid days satisfy $d \\equiv 5 \\pmod{6}$. Days that are $5 \\pmod 6$ are $5$ or $11 \\pmod{12}$; of these, only $11 \\pmod{12}$ is also $3 \\pmod 4$. So the shared days are $11, 23, 35, \\ldots$, stepping by $\\operatorname{lcm}(4,6) = 12$. Up to day $100$ the last is $95$, giving $\\frac{95 - 11}{12} + 1 = 8$ days.\n\n**Trigger cue**\nTwo repeating schedules asked to coincide: find the first common day, then step by the lcm.\n\n**Takeaway**\nCommon terms of two arithmetic sequences recur every lcm of the gaps.",
    fastest_path_md:
      "List briefly: ferns $3, 7, 11, \\ldots$; orchids $5, 11, \\ldots$ First match is day $11$, then every $12$ days: $11, 23, \\ldots, 95$ — that is $8$ days.",
    trap_map: {
      "0": "Steps the matches by $4 \\cdot 6 = 24$ days instead of by $\\operatorname{lcm}(4,6) = 12$.",
      "1": "Computes $\\frac{95 - 11}{12} = 7$ and forgets to add back the first match.",
      "3": "Divides $100$ by $12$ and rounds up, ignoring where the matches actually begin.",
      "4": "Counts every orchid-watering day from $5$ through $99$, not the shared days.",
    },
    numeric_check: "8",
    check() {
      // brute force: walk all 100 days
      let count = 0;
      for (let d = 1; d <= 100; d++) {
        const fern = d >= 3 && (d - 3) % 4 === 0;
        const orchid = d >= 5 && (d - 5) % 6 === 0;
        if (fern && orchid) count++;
      }
      return { kind: "value", value: count };
    },
  },

  // 5. D5 PS real — telescoping sum of 1/(n(n+1))
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "functions_sequences",
    difficulty: 5,
    stem_md:
      "A foundation awards grants from its original endowment in numbered rounds. In round $n$, for each positive integer $n$, the amount awarded equals $\\frac{1}{n(n+1)}$ of the original endowment. What fraction of the original endowment has been awarded in total once round $10$ is complete?",
    choices: [
      "$\\frac{1}{11}$",
      "$\\frac{5}{6}$",
      "$\\frac{9}{10}$",
      "$\\frac{10}{11}$",
      "$\\frac{11}{12}$",
    ],
    correct_index: 3,
    solution_md:
      "**Formal path**\nDecompose each round's fraction: $\\frac{1}{n(n+1)} = \\frac{1}{n} - \\frac{1}{n+1}$. Summing rounds $1$ through $10$ telescopes:\n$$\\left(1 - \\tfrac{1}{2}\\right) + \\left(\\tfrac{1}{2} - \\tfrac{1}{3}\\right) + \\cdots + \\left(\\tfrac{1}{10} - \\tfrac{1}{11}\\right) = 1 - \\tfrac{1}{11} = \\tfrac{10}{11}.$$\n\n**Trigger cue**\nSumming terms of the form $\\frac{1}{n(n+1)}$: split into partial fractions and let the middle cancel.\n\n**Takeaway**\nPartial fractions collapse consecutive-integer products into a telescoping sum.",
    fastest_path_md:
      "Running totals: $\\frac{1}{2}, \\frac{2}{3}, \\frac{3}{4}, \\ldots$ — after round $n$ the total is $\\frac{n}{n+1}$, so after round $10$ it is $\\frac{10}{11}$.",
    trap_map: {
      "0": "Reports the fraction of the endowment still unawarded after round $10$.",
      "1": "Stops the telescope at round $5$, giving $1 - \\frac{1}{6}$.",
      "2": "Ends the telescope at $\\frac{1}{10}$, using $n$ instead of $n+1$ in the final term.",
      "4": "Runs the telescope one round too far, to $1 - \\frac{1}{12}$.",
    },
    numeric_check: "10/11",
    check() {
      // brute force: add the ten rounds directly
      let total = 0;
      for (let n = 1; n <= 10; n++) total += 1 / (n * (n + 1));
      return { kind: "value", value: total };
    },
  },

  // 6. D5 PS real — hidden period-6 recurrence c(n+1) = c(n) - c(n-1)
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "functions_sequences",
    difficulty: 5,
    stem_md:
      "In a trivia app, a player's score changes by $c_n$ points in round $n$, where a change may be negative. The changes satisfy $c_{n+1} = c_n - c_{n-1}$ for every integer $n \\ge 2$, with $c_1 = 4$ and $c_2 = 9$. By how many points does the player's score change in round $75$?",
    choices: ["$-9$", "$-4$", "$4$", "$5$", "$9$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nGenerate terms: $4, 9, 5, -4, -9, -5$, and then $c_7 = 4$, $c_8 = 9$ — the starting pair returns, so the sequence repeats with period $6$. Since $75 = 6 \\cdot 12 + 3$, round $75$ matches the third term of the cycle: $c_{75} = c_3 = 5$.\n\n**Trigger cue**\nA recurrence subtracting the earlier term: list terms until the pair of consecutive values recurs.\n\n**Takeaway**\nThe recurrence $c_{n+1} = c_n - c_{n-1}$ always cycles with period $6$.",
    fastest_path_md:
      "Six terms, then repeat: $4, 9, 5, -4, -9, -5$. Since $75 \\equiv 3 \\pmod 6$, the answer is the third term, $5$.",
    trap_map: {
      "0": "Miscomputes $75 \\bmod 6$ as $5$ and lands on the fifth term of the cycle.",
      "1": "Starts the cycle count at $n = 0$, matching remainder $3$ to the fourth term, $-4$.",
      "2": "Stops at round $73 = 72 + 1$, the start of a new cycle, instead of round $75$.",
      "4": "Off-by-one in the last step: reports $c_{74} = c_2 = 9$.",
    },
    numeric_check: "5",
    check() {
      // brute force: iterate the recurrence all the way to round 75
      const c = [null, 4, 9];
      for (let n = 3; n <= 75; n++) c[n] = c[n - 1] - c[n - 2];
      return { kind: "value", value: c[75] };
    },
  },

  // 7. D3 PS pure — counting terms of an explicit sequence inside an open interval
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "functions_sequences",
    difficulty: 3,
    stem_md:
      "For every positive integer $n$, the $n$th term of a certain sequence is $3n + 2$. How many terms of the sequence are greater than $20$ and less than $100$?",
    choices: ["$24$", "$25$", "$26$", "$27$", "$32$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nSolve $20 < 3n + 2 < 100$, i.e. $18 < 3n < 98$, so $6 < n < 32\\tfrac{2}{3}$. The integers $n$ run from $7$ to $32$, giving $32 - 7 + 1 = 26$ terms.\n\n**Trigger cue**\nCounting terms of an explicit formula inside a range: solve the inequality for $n$, then count integers.\n\n**Takeaway**\nCount integers as last minus first plus one, minding strict inequalities.",
    fastest_path_md:
      "First qualifying term is $23$ ($n = 7$, since $a_6 = 20$ is excluded); last is $98$ ($n = 32$). Count: $32 - 7 + 1 = 26$.",
    trap_map: {
      "0": "Excludes both boundary terms $23$ and $98$, counting only $n = 8$ through $31$.",
      "1": "Computes $32 - 7$ and forgets to add $1$ back.",
      "3": "Includes $a_6 = 20$ by reading \"greater than\" as \"at least.\"",
      "4": "Counts every term less than $100$ and ignores the lower bound.",
    },
    numeric_check: "26",
    check() {
      // brute force: test every n over a generous range
      let count = 0;
      for (let n = 1; n <= 100000; n++) {
        const t = 3 * n + 2;
        if (t > 20 && t < 100) count++;
      }
      return { kind: "value", value: count };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
