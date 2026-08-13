Verified: 2026-08-12 - register and template only; contains no model-specific claims.

# Small and open-weight route

Use an explicit, low-ambiguity register without claiming behavior for an unverified model.

## Template

```text
Task: <one operation>

Input:
<bounded variable input>

Rules:
1. <short testable rule>
2. Use only these values: <closed list>.
3. If a value is missing, return <sentinel>.

Output:
<exact literal shape>

Examples:
Input: <representative input>
Output: <valid output>

Input: <edge or invalid input>
Output: <valid fallback>

Now process:
<runtime input>
```

Keep each call narrow. Put parsing, schema validation, retries, and repair attempts in the harness. Test exact-match and malformed-input cases. If the model cannot reliably satisfy the contract, change model, split the task, constrain decoding only with verified controls, or use deterministic code.
