#!/usr/bin/env python3
"""
Vibe Code Compliance Analyzer
Analyzes code quality across 10 professional metrics
and returns a unified Vibe Score (0-100)
"""

import sys
import json
import re
import ast
import math
from typing import Dict, List, Any, Tuple


# ============================================================
# METRIC WEIGHTS — must add up to 100
# ============================================================
METRIC_WEIGHTS = {
    "readability_formatting": 12,
    "naming_conventions": 12,
    "code_complexity": 12,
    "best_practice_compliance": 12,
    "documentation_comments": 8,
    "error_handling": 10,
    "code_duplication": 8,
    "security_vulnerabilities": 10,
    "performance_patterns": 8,
    "code_modularity": 8,
}


# ============================================================
# MAIN ANALYZER CLASS
# ============================================================
class VibeCodeAnalyzer:

    def __init__(self, code: str, language: str):
        self.code = code
        self.language = language.lower()
        self.lines = code.splitlines()
        self.total_lines = len(self.lines)
        self.tree = None

        if self.language == "python":
            try:
                self.tree = ast.parse(code)
            except SyntaxError:
                self.tree = None

    def analyze(self) -> Dict[str, Any]:
        metrics = {}

        metrics["readability_formatting"] = self.check_readability_formatting()
        metrics["naming_conventions"] = self.check_naming_conventions()
        metrics["code_complexity"] = self.check_code_complexity()
        metrics["best_practice_compliance"] = self.check_best_practices()
        metrics["documentation_comments"] = self.check_documentation()
        metrics["error_handling"] = self.check_error_handling()
        metrics["code_duplication"] = self.check_code_duplication()
        metrics["security_vulnerabilities"] = self.check_security()
        metrics["performance_patterns"] = self.check_performance()
        metrics["code_modularity"] = self.check_modularity()

        vibe_score = self._compute_vibe_score(metrics)
        vibe_level = self._get_vibe_level(vibe_score)

        return {
            "vibe_score": round(vibe_score, 2),
            "vibe_level": vibe_level,
            "language": self.language,
            "total_lines": self.total_lines,
            "metrics": metrics,
            "summary": self._build_summary(metrics, vibe_score)
        }

    # ============================================================
    # METRIC 1 — READABILITY & FORMATTING
    # ============================================================
    def check_readability_formatting(self) -> Dict[str, Any]:
        violations = []
        score = 100.0

        # Check line length
        long_lines = []
        for i, line in enumerate(self.lines, 1):
            if len(line) > 100:
                long_lines.append(i)
                violations.append({
                    "line": i,
                    "severity": "LOW",
                    "message": f"Line too long ({len(line)} chars). Keep under 100.",
                    "suggestion": "Break this line into multiple lines."
                })
        score -= min(len(long_lines) * 3, 25)

        # Check indentation consistency
        indent_types = set()
        for line in self.lines:
            if line.startswith("\t"):
                indent_types.add("tab")
            elif line.startswith("  "):
                indent_types.add("space")
        if len(indent_types) > 1:
            score -= 20
            violations.append({
                "line": 1,
                "severity": "HIGH",
                "message": "Mixed tabs and spaces detected.",
                "suggestion": "Use only spaces (4 spaces per indent level)."
            })

        # Check trailing whitespace
        trailing = [i + 1 for i, line in enumerate(self.lines) if line.rstrip() != line]
        if trailing:
            score -= min(len(trailing) * 2, 15)
            violations.append({
                "line": trailing[0],
                "severity": "LOW",
                "message": f"Trailing whitespace found on {len(trailing)} lines.",
                "suggestion": "Remove trailing spaces from all lines."
            })

        # Check multiple blank lines
        consecutive_blanks = 0
        for i, line in enumerate(self.lines, 1):
            if line.strip() == "":
                consecutive_blanks += 1
                if consecutive_blanks > 2:
                    score -= 5
                    violations.append({
                        "line": i,
                        "severity": "LOW",
                        "message": "More than 2 consecutive blank lines.",
                        "suggestion": "Use maximum 2 blank lines between sections."
                    })
                    break
            else:
                consecutive_blanks = 0

        # Check file ends with newline
        if self.code and not self.code.endswith("\n"):
            score -= 3
            violations.append({
                "line": self.total_lines,
                "severity": "LOW",
                "message": "File does not end with a newline.",
                "suggestion": "Add a newline at the end of the file."
            })

        score = max(0.0, score)
        return self._build_metric(
            "readability_formatting",
            score,
            violations,
            f"Checked {self.total_lines} lines for formatting issues."
        )

    # ============================================================
    # METRIC 2 — NAMING CONVENTIONS
    # ============================================================
    def check_naming_conventions(self) -> Dict[str, Any]:
        violations = []
        score = 100.0

        # Single letter variables (except loop counters)
        single_letter = re.findall(
            r'\b([a-zA-Z])\s*=(?!=)', self.code)
        allowed_singles = {'i', 'j', 'k', 'x', 'y', 'z', 'n', 'e'}
        bad_singles = [v for v in single_letter if v not in allowed_singles]
        if bad_singles:
            score -= min(len(bad_singles) * 5, 20)
            violations.append({
                "line": 1,
                "severity": "MEDIUM",
                "message": f"Single-letter variables found: {set(bad_singles)}",
                "suggestion": "Use descriptive names like 'count' instead of 'c'."
            })

        # Check for generic names
        generic_names = ['temp', 'tmp', 'foo', 'bar', 'baz',
                        'data2', 'data3', 'var1', 'var2', 'obj2']
        for name in generic_names:
            pattern = rf'\b{name}\b'
            if re.search(pattern, self.code, re.IGNORECASE):
                score -= 5
                violations.append({
                    "line": 1,
                    "severity": "MEDIUM",
                    "message": f"Generic variable name '{name}' found.",
                    "suggestion": f"Replace '{name}' with a descriptive name."
                })

        if self.language == "python" and self.tree:
            # Check function names (should be snake_case)
            for node in ast.walk(self.tree):
                if isinstance(node, ast.FunctionDef):
                    if not re.match(r'^[a-z][a-z0-9_]*$', node.name):
                        if not node.name.startswith('__'):
                            score -= 8
                            violations.append({
                                "line": node.lineno,
                                "severity": "HIGH",
                                "message": f"Function '{node.name}' should be snake_case.",
                                "suggestion": f"Rename to '{self._to_snake_case(node.name)}'."
                            })

                # Check class names (should be PascalCase)
                if isinstance(node, ast.ClassDef):
                    if not re.match(r'^[A-Z][a-zA-Z0-9]*$', node.name):
                        score -= 8
                        violations.append({
                            "line": node.lineno,
                            "severity": "HIGH",
                            "message": f"Class '{node.name}' should be PascalCase.",
                            "suggestion": f"Rename to '{node.name.capitalize()}'."
                        })

        # Check constants (should be UPPER_SNAKE_CASE)
        constants = re.findall(
            r'^([A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*)\s*=', self.code, re.MULTILINE)
        lower_constants = re.findall(
            r'^([a-z][a-z0-9]*(?:_[a-z0-9]+)*)\s*=\s*(?:\d+|True|False|"[^"]*")',
            self.code, re.MULTILINE)

        score = max(0.0, score)
        return self._build_metric(
            "naming_conventions",
            score,
            violations,
            "Checked naming conventions for variables, functions, and classes."
        )

    # ============================================================
    # METRIC 3 — CODE COMPLEXITY
    # ============================================================
    def check_code_complexity(self) -> Dict[str, Any]:
        violations = []
        score = 100.0

        # Check function length
        if self.language == "python" and self.tree:
            for node in ast.walk(self.tree):
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    func_lines = (node.end_lineno - node.lineno + 1
                                  if hasattr(node, 'end_lineno') else 0)
                    if func_lines > 50:
                        score -= 15
                        violations.append({
                            "line": node.lineno,
                            "severity": "HIGH",
                            "message": f"Function '{node.name}' is {func_lines} lines long.",
                            "suggestion": "Keep functions under 50 lines. Break into smaller functions."
                        })
                    elif func_lines > 30:
                        score -= 7
                        violations.append({
                            "line": node.lineno,
                            "severity": "MEDIUM",
                            "message": f"Function '{node.name}' is {func_lines} lines long.",
                            "suggestion": "Consider breaking into smaller functions (aim for under 30 lines)."
                        })

        # Check nesting depth
        max_depth = self._get_max_nesting_depth()
        if max_depth > 5:
            score -= 20
            violations.append({
                "line": 1,
                "severity": "CRITICAL",
                "message": f"Maximum nesting depth is {max_depth} levels deep.",
                "suggestion": "Refactor deeply nested code. Use early returns or extract functions."
            })
        elif max_depth > 3:
            score -= 10
            violations.append({
                "line": 1,
                "severity": "MEDIUM",
                "message": f"Nesting depth of {max_depth} detected.",
                "suggestion": "Try to keep nesting under 3 levels."
            })

        # Check cyclomatic complexity (count decision points)
        decision_keywords = ['if ', 'elif ', 'else:', 'for ',
                             'while ', 'except', 'case ']
        decision_count = sum(
            len(re.findall(rf'\b{kw}', self.code))
            for kw in decision_keywords
        )
        if decision_count > 30:
            score -= 20
            violations.append({
                "line": 1,
                "severity": "HIGH",
                "message": f"High cyclomatic complexity: {decision_count} decision points.",
                "suggestion": "Simplify logic by extracting conditions into named functions."
            })
        elif decision_count > 15:
            score -= 10
            violations.append({
                "line": 1,
                "severity": "MEDIUM",
                "message": f"Moderate complexity: {decision_count} decision points.",
                "suggestion": "Consider simplifying conditional logic."
            })

        score = max(0.0, score)
        return self._build_metric(
            "code_complexity",
            score,
            violations,
            f"Analyzed complexity: max nesting {max_depth}, decision points {decision_count}."
        )

    # ============================================================
    # METRIC 4 — BEST PRACTICE COMPLIANCE
    # ============================================================
    def check_best_practices(self) -> Dict[str, Any]:
        violations = []
        score = 100.0

        # Check for print statements in production code
        print_count = len(re.findall(r'\bprint\s*\(', self.code))
        if print_count > 5:
            score -= 15
            violations.append({
                "line": 1,
                "severity": "MEDIUM",
                "message": f"Found {print_count} print() statements.",
                "suggestion": "Use a logging framework instead of print() for production code."
            })

        # Check for TODO/FIXME/HACK comments
        todo_lines = []
        for i, line in enumerate(self.lines, 1):
            if re.search(r'\b(TODO|FIXME|HACK|XXX|BUG)\b', line, re.IGNORECASE):
                todo_lines.append(i)
        if todo_lines:
            score -= min(len(todo_lines) * 5, 20)
            violations.append({
                "line": todo_lines[0],
                "severity": "MEDIUM",
                "message": f"Found {len(todo_lines)} TODO/FIXME comments.",
                "suggestion": "Resolve or create tickets for all TODO/FIXME items."
            })

        # Check for commented out code blocks
        commented_code = 0
        for line in self.lines:
            stripped = line.strip()
            if stripped.startswith('#') and any(
                kw in stripped for kw in ['def ', 'class ', 'import ', '= ', 'if ', 'for ']):
                commented_code += 1
        if commented_code > 3:
            score -= 10
            violations.append({
                "line": 1,
                "severity": "LOW",
                "message": f"Found {commented_code} lines of commented-out code.",
                "suggestion": "Remove commented code. Use Git history instead."
            })

        # Check for wildcard imports
        wildcard_imports = re.findall(r'from\s+\w+\s+import\s+\*', self.code)
        if wildcard_imports:
            score -= 15
            violations.append({
                "line": 1,
                "severity": "HIGH",
                "message": f"Wildcard imports found: {wildcard_imports}",
                "suggestion": "Import specific names instead of using '*'."
            })

        # Check for magic numbers
        magic_numbers = re.findall(
            r'(?<![.\w])(?!0\.)\b([2-9]\d{2,}|\d{4,})\b(?!\s*[,\]])',
            self.code)
        if len(magic_numbers) > 3:
            score -= 10
            violations.append({
                "line": 1,
                "severity": "LOW",
                "message": f"Magic numbers found: {set(magic_numbers[:5])}",
                "suggestion": "Define magic numbers as named constants."
            })

        # Check for bare except
        bare_except = len(re.findall(r'except\s*:', self.code))
        if bare_except:
            score -= bare_except * 10
            violations.append({
                "line": 1,
                "severity": "HIGH",
                "message": f"Found {bare_except} bare except clause(s).",
                "suggestion": "Always catch specific exceptions: except ValueError as e."
            })

        score = max(0.0, score)
        return self._build_metric(
            "best_practice_compliance",
            score,
            violations,
            "Checked against industry best practices and common code smells."
        )

    # ============================================================
    # METRIC 5 — DOCUMENTATION & COMMENTS
    # ============================================================
    def check_documentation(self) -> Dict[str, Any]:
        violations = []
        score = 100.0

        if self.language == "python" and self.tree:
            # Check module docstring
            if not (self.tree.body and isinstance(
                    self.tree.body[0], ast.Expr) and isinstance(
                    self.tree.body[0].value, ast.Constant)):
                score -= 10
                violations.append({
                    "line": 1,
                    "severity": "LOW",
                    "message": "Missing module-level docstring.",
                    "suggestion": "Add a module docstring at the top of the file."
                })

            # Check function docstrings
            undocumented_funcs = []
            for node in ast.walk(self.tree):
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    if not (node.body and isinstance(
                            node.body[0], ast.Expr) and isinstance(
                            node.body[0].value, ast.Constant)):
                        if not node.name.startswith('__'):
                            undocumented_funcs.append((node.name, node.lineno))

            if undocumented_funcs:
                score -= min(len(undocumented_funcs) * 8, 40)
                for name, lineno in undocumented_funcs[:3]:
                    violations.append({
                        "line": lineno,
                        "severity": "MEDIUM",
                        "message": f"Function '{name}' missing docstring.",
                        "suggestion": f"Add a docstring explaining what '{name}' does."
                    })

            # Check class docstrings
            for node in ast.walk(self.tree):
                if isinstance(node, ast.ClassDef):
                    if not (node.body and isinstance(
                            node.body[0], ast.Expr) and isinstance(
                            node.body[0].value, ast.Constant)):
                        score -= 10
                        violations.append({
                            "line": node.lineno,
                            "severity": "MEDIUM",
                            "message": f"Class '{node.name}' missing docstring.",
                            "suggestion": "Add a class-level docstring."
                        })

        # Check comment ratio
        comment_lines = sum(
            1 for line in self.lines if line.strip().startswith('#'))
        code_lines = sum(
            1 for line in self.lines if line.strip()
            and not line.strip().startswith('#'))

        if code_lines > 0:
            comment_ratio = comment_lines / code_lines
            if comment_ratio < 0.05 and code_lines > 20:
                score -= 15
                violations.append({
                    "line": 1,
                    "severity": "MEDIUM",
                    "message": f"Low comment ratio: {comment_ratio:.1%}",
                    "suggestion": "Aim for at least 10-15% comment coverage."
                })

        score = max(0.0, score)
        return self._build_metric(
            "documentation_comments",
            score,
            violations,
            "Checked docstrings, comments, and documentation coverage."
        )

    # ============================================================
    # METRIC 6 — ERROR HANDLING
    # ============================================================
    def check_error_handling(self) -> Dict[str, Any]:
        violations = []
        score = 100.0

        # Check for empty except blocks
        empty_except = re.findall(
            r'except[^:]*:\s*\n\s*pass', self.code)
        if empty_except:
            score -= len(empty_except) * 15
            violations.append({
                "line": 1,
                "severity": "HIGH",
                "message": f"Found {len(empty_except)} empty except block(s) with 'pass'.",
                "suggestion": "Never silently swallow exceptions. Log or handle them."
            })

        # Check for functions without any error handling
        if self.language == "python" and self.tree:
            risky_calls = ['open(', 'requests.', 'json.loads',
                          'int(', 'float(', '.read()', '.write(']
            has_try = 'try:' in self.code

            for call in risky_calls:
                if call in self.code and not has_try:
                    score -= 10
                    violations.append({
                        "line": 1,
                        "severity": "HIGH",
                        "message": f"Risky call '{call}' used without try/except.",
                        "suggestion": f"Wrap '{call}' in a try/except block."
                    })
                    break

        # Check for proper exception chaining
        raise_from = re.findall(r'raise\s+\w+Exception\(', self.code)
        raise_without_from = re.findall(
            r'except[^:]+:\s*\n[^\n]*raise\s+\w+(?!.*from)', self.code)

        # Check for finally blocks with cleanup
        file_opens = len(re.findall(r'open\s*\(', self.code))
        with_statements = len(re.findall(r'\bwith\b', self.code))
        if file_opens > 0 and with_statements == 0:
            score -= 15
            violations.append({
                "line": 1,
                "severity": "HIGH",
                "message": "File opened without using 'with' statement.",
                "suggestion": "Use 'with open(...) as f:' for automatic resource cleanup."
            })

        # Check for None checks
        none_deref = re.findall(
            r'(\w+)\s*=.*\n.*\1\.', self.code)
        if len(none_deref) > 5:
            score -= 10
            violations.append({
                "line": 1,
                "severity": "MEDIUM",
                "message": "Multiple variable dereferences without None checks.",
                "suggestion": "Add None checks before accessing object attributes."
            })

        score = max(0.0, score)
        return self._build_metric(
            "error_handling",
            score,
            violations,
            "Checked exception handling, resource management, and error safety."
        )

    # ============================================================
    # METRIC 7 — CODE DUPLICATION
    # ============================================================
    def check_code_duplication(self) -> Dict[str, Any]:
        violations = []
        score = 100.0

        # Find duplicate lines (ignoring blanks and comments)
        code_lines = [
            line.strip() for line in self.lines
            if line.strip() and not line.strip().startswith('#')
            and len(line.strip()) > 10
        ]

        seen = {}
        duplicates = {}
        for i, line in enumerate(code_lines):
            if line in seen:
                duplicates[line] = duplicates.get(line, 1) + 1
            else:
                seen[line] = i

        if duplicates:
            dup_count = len(duplicates)
            score -= min(dup_count * 8, 40)
            top_dups = sorted(duplicates.items(),
                             key=lambda x: x[1], reverse=True)[:3]
            for line, count in top_dups:
                violations.append({
                    "line": 1,
                    "severity": "MEDIUM",
                    "message": f"Line repeated {count} times: '{line[:50]}...'",
                    "suggestion": "Extract repeated logic into a reusable function."
                })

        # Check for similar code blocks (5-line chunks)
        chunk_size = 5
        chunks = []
        for i in range(len(self.lines) - chunk_size):
            chunk = '\n'.join(
                self.lines[i:i + chunk_size]).strip()
            if len(chunk) > 50:
                chunks.append(chunk)

        seen_chunks = {}
        for chunk in chunks:
            normalized = re.sub(r'\s+', ' ', chunk)
            if normalized in seen_chunks:
                seen_chunks[normalized] += 1
            else:
                seen_chunks[normalized] = 1

        repeated_chunks = {k: v for k, v in seen_chunks.items() if v > 1}
        if repeated_chunks:
            score -= min(len(repeated_chunks) * 15, 30)
            violations.append({
                "line": 1,
                "severity": "HIGH",
                "message": f"Found {len(repeated_chunks)} repeated code block(s).",
                "suggestion": "Extract duplicated blocks into reusable functions (DRY principle)."
            })

        score = max(0.0, score)
        return self._build_metric(
            "code_duplication",
            score,
            violations,
            f"Checked for DRY violations. Found {len(duplicates)} duplicate lines."
        )

    # ============================================================
    # METRIC 8 — SECURITY VULNERABILITIES
    # ============================================================
    def check_security(self) -> Dict[str, Any]:
        violations = []
        score = 100.0

        # Check for hardcoded secrets
        secret_patterns = [
            (r'password\s*=\s*["\'][^"\']+["\']', "Hardcoded password"),
            (r'secret\s*=\s*["\'][^"\']+["\']', "Hardcoded secret"),
            (r'api_key\s*=\s*["\'][^"\']+["\']', "Hardcoded API key"),
            (r'token\s*=\s*["\'][^"\']+["\']', "Hardcoded token"),
            (r'private_key\s*=\s*["\'][^"\']+["\']', "Hardcoded private key"),
        ]
        for pattern, label in secret_patterns:
            matches = re.findall(pattern, self.code, re.IGNORECASE)
            if matches:
                score -= 25
                violations.append({
                    "line": 1,
                    "severity": "CRITICAL",
                    "message": f"{label} detected in source code.",
                    "suggestion": "Use environment variables or a secrets manager instead."
                })

        # Check for SQL injection risks
        sql_patterns = [
            r'execute\s*\(\s*["\'].*%s',
            r'execute\s*\(\s*f["\']',
            r'SELECT.*\+.*input',
            r'query\s*=\s*["\']SELECT.*\+',
        ]
        for pattern in sql_patterns:
            if re.search(pattern, self.code, re.IGNORECASE):
                score -= 30
                violations.append({
                    "line": 1,
                    "severity": "CRITICAL",
                    "message": "Potential SQL injection vulnerability.",
                    "suggestion": "Use parameterized queries or an ORM."
                })
                break

        # Check for eval/exec usage
        eval_usage = re.findall(r'\beval\s*\(', self.code)
        exec_usage = re.findall(r'\bexec\s*\(', self.code)
        if eval_usage:
            score -= 25
            violations.append({
                "line": 1,
                "severity": "CRITICAL",
                "message": f"eval() used {len(eval_usage)} time(s).",
                "suggestion": "Never use eval(). It executes arbitrary code."
            })
        if exec_usage:
            score -= 20
            violations.append({
                "line": 1,
                "severity": "CRITICAL",
                "message": f"exec() used {len(exec_usage)} time(s).",
                "suggestion": "Avoid exec(). Find a safer alternative."
            })

        # Check for shell injection
        shell_patterns = [
            r'os\.system\s*\(',
            r'subprocess\.call\s*\([^)]*shell\s*=\s*True',
            r'subprocess\.run\s*\([^)]*shell\s*=\s*True',
        ]
        for pattern in shell_patterns:
            if re.search(pattern, self.code):
                score -= 20
                violations.append({
                    "line": 1,
                    "severity": "CRITICAL",
                    "message": "Shell injection risk: shell=True or os.system() detected.",
                    "suggestion": "Use subprocess with a list of arguments and shell=False."
                })
                break

        # Check for insecure random
        if re.search(r'\brandom\b', self.code) and 'secrets' not in self.code:
            if any(kw in self.code for kw in ['password', 'token', 'key', 'auth']):
                score -= 15
                violations.append({
                    "line": 1,
                    "severity": "HIGH",
                    "message": "Using random module for security-sensitive operations.",
                    "suggestion": "Use the 'secrets' module for cryptographic randomness."
                })

        score = max(0.0, score)
        return self._build_metric(
            "security_vulnerabilities",
            score,
            violations,
            "Scanned for hardcoded secrets, injection risks, and unsafe operations."
        )

    # ============================================================
    # METRIC 9 — PERFORMANCE PATTERNS
    # ============================================================
    def check_performance(self) -> Dict[str, Any]:
        violations = []
        score = 100.0

        # Check for string concatenation in loops
        loop_concat = re.findall(
            r'for\s+\w+\s+in[^:]+:\s*\n[^\n]*\+=\s*["\']', self.code)
        if loop_concat:
            score -= 20
            violations.append({
                "line": 1,
                "severity": "HIGH",
                "message": "String concatenation inside a loop detected.",
                "suggestion": "Use a list and ''.join() instead of += in loops."
            })

        # Check for repeated function calls in loops
        nested_calls = re.findall(
            r'for\s+\w+\s+in\s+range\s*\(\s*len\s*\(', self.code)
        if nested_calls:
            score -= 15
            violations.append({
                "line": 1,
                "severity": "MEDIUM",
                "message": "for i in range(len(x)) pattern detected.",
                "suggestion": "Use 'for item in x' or 'for i, item in enumerate(x)'."
            })

        # Check for unnecessary list comprehension in loops
        global_list_ops = re.findall(
            r'for\s+\w+\s+in[^:]+:\s*\n[^\n]*\.append\(', self.code)
        if len(global_list_ops) > 2:
            score -= 10
            violations.append({
                "line": 1,
                "severity": "LOW",
                "message": f"Found {len(global_list_ops)} append() in loops.",
                "suggestion": "Replace with list comprehension for better performance."
            })

        # Check for global variables
        globals_count = len(re.findall(r'^global\s+\w+', self.code, re.MULTILINE))
        if globals_count > 2:
            score -= 15
            violations.append({
                "line": 1,
                "severity": "MEDIUM",
                "message": f"Found {globals_count} global variable declarations.",
                "suggestion": "Minimize global state. Pass variables as parameters."
            })

        # Check for nested loops (O(n²) complexity)
        nested_loops = re.findall(
            r'for\s+\w+\s+in[^:]+:\s*\n(?:[^\n]*\n)*?[^\n]*for\s+\w+\s+in',
            self.code)
        if nested_loops:
            score -= 15
            violations.append({
                "line": 1,
                "severity": "MEDIUM",
                "message": f"Found {len(nested_loops)} nested loop(s) — O(n²) complexity risk.",
                "suggestion": "Consider using dictionaries or sets to avoid nested loops."
            })

        # Check for inefficient membership testing
        list_in = re.findall(r'if\s+\w+\s+in\s+\[', self.code)
        if list_in:
            score -= 10
            violations.append({
                "line": 1,
                "severity": "LOW",
                "message": "Membership test on a list literal.",
                "suggestion": "Use a set for O(1) lookup: if x in {1, 2, 3}."
            })

        score = max(0.0, score)
        return self._build_metric(
            "performance_patterns",
            score,
            violations,
            "Checked for common performance anti-patterns and O(n²) risks."
        )

    # ============================================================
    # METRIC 10 — CODE MODULARITY
    # ============================================================
    def check_modularity(self) -> Dict[str, Any]:
        violations = []
        score = 100.0

        if self.language == "python" and self.tree:
            # Check for functions with too many parameters
            for node in ast.walk(self.tree):
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    param_count = len(node.args.args)
                    if param_count > 7:
                        score -= 15
                        violations.append({
                            "line": node.lineno,
                            "severity": "HIGH",
                            "message": f"Function '{node.name}' has {param_count} parameters.",
                            "suggestion": "Use a data class or dict to group related parameters."
                        })
                    elif param_count > 5:
                        score -= 7
                        violations.append({
                            "line": node.lineno,
                            "severity": "MEDIUM",
                            "message": f"Function '{node.name}' has {param_count} parameters.",
                            "suggestion": "Consider reducing parameters to improve readability."
                        })

        # Check total file length
        if self.total_lines > 500:
            score -= 20
            violations.append({
                "line": 1,
                "severity": "HIGH",
                "message": f"File is {self.total_lines} lines long.",
                "suggestion": "Split into multiple modules. Files should be under 300 lines."
            })
        elif self.total_lines > 300:
            score -= 10
            violations.append({
                "line": 1,
                "severity": "MEDIUM",
                "message": f"File is {self.total_lines} lines long.",
                "suggestion": "Consider splitting into smaller modules."
            })

        # Check number of functions
        func_count = len(re.findall(r'\bdef\s+\w+\s*\(', self.code))
        class_count = len(re.findall(r'\bclass\s+\w+', self.code))

        if func_count == 0 and self.total_lines > 30:
            score -= 20
            violations.append({
                "line": 1,
                "severity": "HIGH",
                "message": "No functions defined — all code in global scope.",
                "suggestion": "Organize code into functions and classes."
            })

        # Check for large classes
        if self.language == "python" and self.tree:
            for node in ast.walk(self.tree):
                if isinstance(node, ast.ClassDef):
                    methods = [n for n in ast.walk(node)
                               if isinstance(n, ast.FunctionDef)]
                    if len(methods) > 15:
                        score -= 15
                        violations.append({
                            "line": node.lineno,
                            "severity": "HIGH",
                            "message": f"Class '{node.name}' has {len(methods)} methods.",
                            "suggestion": "Consider splitting into smaller classes (Single Responsibility)."
                        })

        # Check for import organization
        import_lines = [i + 1 for i, line in enumerate(self.lines)
                       if line.strip().startswith('import ')
                       or line.strip().startswith('from ')]
        if import_lines:
            non_consecutive = any(
                import_lines[i] - import_lines[i-1] > 3
                for i in range(1, len(import_lines))
            )
            if non_consecutive:
                score -= 5
                violations.append({
                    "line": import_lines[0],
                    "severity": "LOW",
                    "message": "Imports are scattered throughout the file.",
                    "suggestion": "Group all imports at the top of the file."
                })

        score = max(0.0, score)
        return self._build_metric(
            "code_modularity",
            score,
            violations,
            f"Checked modularity: {func_count} functions, {class_count} classes."
        )

    # ============================================================
    # HELPER METHODS
    # ============================================================
    def _compute_vibe_score(self, metrics: Dict) -> float:
        total = 0.0
        for metric_name, weight in METRIC_WEIGHTS.items():
            if metric_name in metrics:
                metric_score = metrics[metric_name]["score"]
                total += (metric_score * weight) / 100
        return total

    def _get_vibe_level(self, score: float) -> str:
        if score >= 90:
            return "EXCELLENT"
        elif score >= 75:
            return "GOOD"
        elif score >= 60:
            return "AVERAGE"
        elif score >= 40:
            return "POOR"
        else:
            return "CRITICAL"

    def _get_max_nesting_depth(self) -> int:
        max_depth = 0
        current_depth = 0
        indent_stack = []

        for line in self.lines:
            if not line.strip():
                continue
            indent = len(line) - len(line.lstrip())
            indent_keywords = ['if ', 'else:', 'elif ',
                               'for ', 'while ', 'try:', 'except',
                               'with ', 'def ', 'class ']
            is_block = any(line.strip().startswith(kw)
                          for kw in indent_keywords)
            if is_block:
                while indent_stack and indent_stack[-1] >= indent:
                    indent_stack.pop()
                indent_stack.append(indent)
                current_depth = len(indent_stack)
                max_depth = max(max_depth, current_depth)

        return max_depth

    def _to_snake_case(self, name: str) -> str:
        s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
        return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

    def _build_metric(self, name: str, score: float,
                      violations: List, details: str) -> Dict:
        weight = METRIC_WEIGHTS.get(name, 10)
        return {
            "weight": weight,
            "score": round(score, 2),
            "passed": score >= 70,
            "details": details,
            "violation_count": len(violations),
            "violations": violations
        }

    def _build_summary(self, metrics: Dict, vibe_score: float) -> Dict:
        total_violations = sum(
            m["violation_count"] for m in metrics.values())
        passed_metrics = sum(
            1 for m in metrics.values() if m["passed"])
        critical_count = sum(
            1 for m in metrics.values()
            for v in m["violations"] if v["severity"] == "CRITICAL"
        )
        high_count = sum(
            1 for m in metrics.values()
            for v in m["violations"] if v["severity"] == "HIGH"
        )

        return {
            "total_violations": total_violations,
            "passed_metrics": passed_metrics,
            "total_metrics": len(metrics),
            "critical_violations": critical_count,
            "high_violations": high_count,
            "recommendation": self._get_recommendation(vibe_score, critical_count)
        }

    def _get_recommendation(self, score: float, critical: int) -> str:
        if critical > 0:
            return "Fix all CRITICAL violations immediately before deploying."
        if score >= 90:
            return "Excellent code quality! Keep up the great work."
        if score >= 75:
            return "Good code. Address HIGH severity issues to improve further."
        if score >= 60:
            return "Average quality. Focus on complexity and best practices."
        if score >= 40:
            return "Poor quality. Major refactoring needed across multiple areas."
        return "Critical quality issues. Consider a complete code review."


# ============================================================
# ENTRY POINT
# ============================================================
if __name__ == "__main__":
    language = sys.argv[1] if len(sys.argv) > 1 else "python"
    code = sys.stdin.read()

    if not code.strip():
        print(json.dumps({"error": "No code provided"}))
        sys.exit(1)

    analyzer = VibeCodeAnalyzer(code, language)
    result = analyzer.analyze()
    print(json.dumps(result, indent=2))