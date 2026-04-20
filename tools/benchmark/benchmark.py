#!/usr/bin/env python3
"""Benchmark tool for comparing Ollama models across multiple domains."""

import json
import time
import sys
import argparse
import urllib.request
import urllib.error
from pathlib import Path

OLLAMA_API = "http://127.0.0.1:11434"

MODEL_PRESETS = {
    "small": "qwen3:8b",
    "medium": "mistral-small:24b",
    "large": "qwen3:32b",
}

COMPARE_GROUPS = {
    "small": ["qwen3:8b", "qwen3.5:9b", "qwen2.5:7b", "gemma4:e2b"],
    "medium": ["mistral-small:24b", "qwen2.5:14b", "gemma3:12b"],
    "large": ["qwen3:32b", "qwen2.5:32b"],
}

QUESTIONS = {
    "mathematics": [
        {
            "question": "What is the derivative of x^3 * sin(x)?",
            "keywords": [
                ["3x^2", "3x²", "3*x^2", "3*x²"],
                ["sin(x)", "sin x"],
                ["cos(x)", "cos x"],
                ["product rule"],
            ],
        },
        {
            "question": "Solve the equation 2x^2 - 5x + 3 = 0",
            "keywords": [
                ["x = 1", "x=1"],
                ["x = 3/2", "x=3/2", "x = 1.5", "x=1.5"],
                ["quadratic", "factoring", "factor"],
            ],
        },
        {
            "question": "What is the integral of 1/(1+x^2) dx?",
            "keywords": [
                ["arctan", "arctangent", "tan^(-1)", "tan⁻¹", "atan"],
                ["constant", "+ C", "+C"],
            ],
        },
    ],
    "physics": [
        {
            "question": "Explain Newton's second law and derive F=ma from it.",
            "keywords": [
                ["force", "F"],
                ["mass", "m"],
                ["acceleration", "a"],
                ["momentum", "dp/dt", "rate of change"],
            ],
        },
        {
            "question": "What is the energy of a photon with wavelength 500nm?",
            "keywords": [
                ["E = hf", "E=hf", "E = hc/λ", "E=hc/λ", "planck"],
                ["3.97", "3.98", "4.0", "eV", "electron volt", "joule"],
            ],
        },
        {
            "question": "Explain the concept of entropy in thermodynamics.",
            "keywords": [
                ["disorder", "randomness", "microstates"],
                ["second law"],
                ["heat", "temperature", "energy"],
            ],
        },
    ],
    "philosophy": [
        {
            "question": "Explain Kant's categorical imperative and give an example.",
            "keywords": [
                ["universal", "universalizable", "universal law"],
                ["maxim", "principle", "rule"],
                ["duty", "moral", "obligation"],
            ],
        },
        {
            "question": "What is the trolley problem and what are the main ethical perspectives on it?",
            "keywords": [
                ["trolley", "train", "track"],
                ["utilitarian", "consequential"],
                ["deontological", "deontology", "kantian"],
            ],
        },
        {
            "question": "Explain the difference between empiricism and rationalism.",
            "keywords": [
                ["experience", "senses", "observation"],
                ["reason", "innate", "a priori"],
                ["locke", "hume", "descartes", "leibniz"],
            ],
        },
    ],
    "coding": [
        {
            "question": "Write a Python function to find the longest common subsequence of two strings.",
            "keywords": [
                ["def ", "function"],
                ["dp", "dynamic programming", "table", "matrix"],
                ["len(", "length"],
            ],
        },
        {
            "question": "Implement a binary search algorithm in Python and explain its time complexity.",
            "keywords": [
                ["def ", "function"],
                ["O(log n)", "O(log(n))", "logarithmic"],
                ["mid", "middle", "low", "high", "left", "right"],
            ],
        },
        {
            "question": "Write a Python function to detect a cycle in a linked list.",
            "keywords": [
                ["def ", "function"],
                ["slow", "fast", "tortoise", "hare", "two pointer", "floyd"],
                ["next", "node"],
            ],
        },
    ],
}


def _post_json(url, data, timeout=300):
    """POST JSON to a URL and return parsed response."""
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        url, data=body, headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _get_json(url, timeout=10):
    """GET JSON from a URL and return parsed response."""
    with urllib.request.urlopen(url, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def query_model(model, prompt):
    """Send a prompt to an Ollama model and return the response with timing."""
    start = time.time()
    try:
        data = _post_json(
            f"{OLLAMA_API}/api/generate",
            {"model": model, "prompt": prompt, "stream": False},
        )
    except urllib.error.URLError:
        print(f"  Error: Cannot connect to Ollama at {OLLAMA_API}")
        return {"response": "", "elapsed": 0, "tokens_per_second": 0, "error": "connection_failed"}
    except Exception as e:
        print(f"  Error querying {model}: {e}")
        return {"response": "", "elapsed": 0, "tokens_per_second": 0, "error": str(e)}

    elapsed = time.time() - start
    response_text = data.get("response", "")
    eval_count = data.get("eval_count", 0)
    eval_duration_ns = data.get("eval_duration", 0)
    tps = (eval_count / (eval_duration_ns / 1e9)) if eval_duration_ns > 0 else 0

    return {
        "response": response_text,
        "elapsed": elapsed,
        "tokens_per_second": round(tps, 1),
    }


def score_response(response, keyword_groups):
    """Score a response by checking keyword group matches."""
    response_lower = response.lower()
    matched = 0
    for group in keyword_groups:
        if any(term.lower() in response_lower for term in group):
            matched += 1
    return matched / len(keyword_groups) if keyword_groups else 0


def ensure_model_available(model):
    """Check if a model is available, pull if not."""
    try:
        data = _get_json(f"{OLLAMA_API}/api/tags")
        available = [m["name"] for m in data.get("models", [])]
        if model in available or any(m.startswith(model.split(":")[0]) for m in available):
            return True
    except Exception:
        print(f"  Cannot connect to Ollama at {OLLAMA_API}")
        return False

    print(f"  Pulling {model}...")
    try:
        _post_json(f"{OLLAMA_API}/api/pull", {"name": model, "stream": False}, timeout=600)
        return True
    except Exception as e:
        print(f"  Failed to pull {model}: {e}")
        return False


def benchmark_model(model):
    """Run all benchmark questions against a single model."""
    print(f"\nBenchmarking: {model}")
    print("=" * 50)

    if not ensure_model_available(model):
        print(f"  Skipping {model} (not available)")
        return {}

    results = {}
    for domain, questions in QUESTIONS.items():
        print(f"\n  Domain: {domain}")
        domain_results = []
        for q in questions:
            print(f"    Q: {q['question'][:60]}...")
            result = query_model(model, q["question"])
            if "error" in result:
                print(f"    Error: {result['error']}")
                continue
            accuracy = score_response(result["response"], q["keywords"])
            print(f"    Accuracy: {accuracy:.0%} | Time: {result['elapsed']:.1f}s | Speed: {result['tokens_per_second']} tok/s")
            domain_results.append({
                "question": q["question"],
                "accuracy": round(accuracy, 2),
                "time_seconds": round(result["elapsed"], 2),
                "tokens_per_second": result["tokens_per_second"],
            })

        if domain_results:
            avg_acc = sum(r["accuracy"] for r in domain_results) / len(domain_results)
            avg_time = sum(r["time_seconds"] for r in domain_results) / len(domain_results)
            avg_tps = sum(r["tokens_per_second"] for r in domain_results) / len(domain_results)
            results[domain] = {
                "questions": domain_results,
                "average_accuracy": round(avg_acc, 2),
                "average_time_seconds": round(avg_time, 2),
                "average_tokens_per_second": round(avg_tps, 1),
            }

    return results


def build_summary(all_results):
    """Build summary, ranking, and recommendation from results."""
    summary = {}
    for model, domains in all_results.items():
        if not domains:
            continue
        accuracies = [d["average_accuracy"] for d in domains.values()]
        speeds = [d["average_tokens_per_second"] for d in domains.values()]
        overall_acc = sum(accuracies) / len(accuracies) if accuracies else 0
        overall_speed = sum(speeds) / len(speeds) if speeds else 0

        domain_accs = {d: info["average_accuracy"] for d, info in domains.items()}
        strengths = [d for d, a in domain_accs.items() if a >= overall_acc and a > 0]
        weaknesses = [d for d, a in domain_accs.items() if a < overall_acc]

        summary[model] = {
            "overall_accuracy": round(overall_acc, 2),
            "overall_speed_tokens_per_second": round(overall_speed, 1),
            "strengths": strengths,
            "weaknesses": weaknesses,
        }

    ranked = sorted(summary.items(), key=lambda x: x[1]["overall_accuracy"], reverse=True)
    ranking = [
        {"rank": i + 1, "model": model, "score": info["overall_accuracy"]}
        for i, (model, info) in enumerate(ranked)
    ]

    best_overall = ranking[0]["model"] if ranking else None
    best_per_domain = {}
    all_domains = set()
    for domains in all_results.values():
        all_domains.update(domains.keys())
    for domain in all_domains:
        best_model = None
        best_acc = -1
        for model, domains in all_results.items():
            if domain in domains and domains[domain]["average_accuracy"] > best_acc:
                best_acc = domains[domain]["average_accuracy"]
                best_model = model
        if best_model:
            best_per_domain[domain] = best_model

    return {
        "summary": summary,
        "ranking": ranking,
        "recommendation": {
            "best_overall": best_overall,
            "best_per_domain": best_per_domain,
        },
    }


def main():
    parser = argparse.ArgumentParser(description="Benchmark Ollama models")
    parser.add_argument(
        "--models",
        nargs="+",
        help="Models to benchmark (default: small/medium/large presets)",
    )
    parser.add_argument(
        "--presets",
        nargs="+",
        choices=["small", "medium", "large"],
        help="Use preset model sizes (default: all three)",
    )
    parser.add_argument(
        "--compare",
        choices=["small", "medium", "large"],
        help="Compare similar-size models within a tier",
    )
    parser.add_argument(
        "--output",
        default="tools/benchmark/results.json",
        help="Output file path (default: tools/benchmark/results.json)",
    )
    args = parser.parse_args()

    if args.models:
        models = args.models
    elif args.compare:
        models = COMPARE_GROUPS[args.compare]
    elif args.presets:
        models = [MODEL_PRESETS[p] for p in args.presets]
    else:
        models = list(MODEL_PRESETS.values())

    print("SoloClaw Model Benchmark")
    print(f"Models: {', '.join(models)}")
    print(f"Domains: {', '.join(QUESTIONS.keys())}")
    print(f"Questions per domain: {len(next(iter(QUESTIONS.values())))}")

    all_results = {}
    for model in models:
        all_results[model] = benchmark_model(model)

    analysis = build_summary(all_results)
    output = {
        "models": all_results,
        **analysis,
    }

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(output, indent=2) + "\n")
    print(f"\nResults saved to {output_path}")

    print_results_table(all_results, analysis)


def print_results_table(all_results, analysis):
    """Print a detailed results table to stdout."""
    models = [m for m in all_results if all_results[m]]
    if not models:
        print("\nNo results to display.")
        return

    domains = list(QUESTIONS.keys())

    # Per-domain accuracy table
    print("\n" + "=" * 80)
    print("DETAILED RESULTS")
    print("=" * 80)

    header = f"{'Model':<25}"
    for d in domains:
        header += f" {'':>2}{d:>12}"
    header += f" {'':>2}{'OVERALL':>12}"
    print(f"\n{header}")
    print("-" * len(header))

    for model in models:
        row = f"{model:<25}"
        for d in domains:
            if d in all_results[model]:
                acc = all_results[model][d]["average_accuracy"]
                row += f" {'':>2}{acc:>11.0%}"
            else:
                row += f" {'':>2}{'n/a':>12}"
        overall = analysis["summary"].get(model, {}).get("overall_accuracy", 0)
        row += f" {'':>2}{overall:>11.0%}"
        print(row)

    # Speed table
    print(f"\n{'Model':<25}", end="")
    for d in domains:
        print(f" {'':>2}{d:>12}", end="")
    print(f" {'':>2}{'OVERALL':>12}")
    print("-" * len(header))

    for model in models:
        row = f"{model:<25}"
        for d in domains:
            if d in all_results[model]:
                tps = all_results[model][d]["average_tokens_per_second"]
                row += f" {'':>2}{tps:>10.1f}/s"
            else:
                row += f" {'':>2}{'n/a':>12}"
        overall_tps = analysis["summary"].get(model, {}).get("overall_speed_tokens_per_second", 0)
        row += f" {'':>2}{overall_tps:>10.1f}/s"
        print(row)

    # Per-question detail
    print(f"\n{'=' * 80}")
    print("PER-QUESTION BREAKDOWN")
    print("=" * 80)

    for model in models:
        print(f"\n  {model}")
        print(f"  {'-' * 76}")
        for d in domains:
            if d not in all_results[model]:
                continue
            for q in all_results[model][d]["questions"]:
                question = q["question"][:50]
                acc = q["accuracy"]
                t = q["time_seconds"]
                tps = q["tokens_per_second"]
                marker = "+" if acc >= 0.75 else ("~" if acc >= 0.5 else "-")
                print(f"  {marker} [{d[:4]:>4}] {question:<50} {acc:>4.0%}  {t:>5.1f}s  {tps:>5.1f} tok/s")

    # Ranking
    if analysis["ranking"]:
        print(f"\n{'=' * 80}")
        print("RANKING")
        print("=" * 80)
        for entry in analysis["ranking"]:
            print(f"  #{entry['rank']} {entry['model']:<25} accuracy: {entry['score']:.0%}")
        print(f"\n  Best overall: {analysis['recommendation']['best_overall']}")
        if analysis["recommendation"].get("best_per_domain"):
            for d, m in analysis["recommendation"]["best_per_domain"].items():
                print(f"  Best {d}: {m}")


if __name__ == "__main__":
    main()
