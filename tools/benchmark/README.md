# Model Benchmark

Compares Ollama models across mathematics, physics, philosophy, and coding domains.

## Usage

```bash
# Benchmark all SoloClaw presets (small/medium/large)
python3 tools/benchmark/benchmark.py

# Compare models within a tier
python3 tools/benchmark/benchmark.py --small
python3 tools/benchmark/benchmark.py --medium
python3 tools/benchmark/benchmark.py --large

# Benchmark arbitrary models
python3 tools/benchmark/benchmark.py --models qwen3:8b gemma4:e2b qwen2.5:14b

# Custom output path
python3 tools/benchmark/benchmark.py --output my-results.json
```

## Requirements

- Python 3.9+
- Ollama running locally (`http://127.0.0.1:11434`)
- No pip packages needed (uses stdlib only)

## Model Presets

| Preset | Model | RAM |
|--------|-------|-----|
| small | gemma4:e2b | 8GB |
| medium | mistral-small:24b | 16GB |
| large | qwen3:32b | 32GB |

## Test Results

### Small Tier

Tested on macOS (Apple Silicon). Score = 70% accuracy + 30% speed.

| # | Model | Accuracy | Speed | Memory | Score |
|---|-------|----------|-------|--------|-------|
| 1 | gemma4:e2b | 97% | 141.4/s | 8.2 GB | 0.98 |
| 2 | qwen2.5:7b | 97% | 79.7/s | 7.6 GB | 0.92 |
| 3 | qwen3:8b | 97% | 66.8/s | 10.6 GB | 0.88 |

**Winner: gemma4:e2b** — same accuracy as others, 2x faster, lowest memory.

### Medium Tier

*Pending — run `python3 tools/benchmark/benchmark.py --medium` to generate.*

### Large Tier

*Pending — run `python3 tools/benchmark/benchmark.py --large` to generate.*

## Scoring

Each question has 2-4 keyword groups. A group matches if any term appears (case-insensitive). Accuracy = matched groups / total groups.

Combined score = 70% accuracy + 30% speed (normalized to 100 tok/s).

## Validation

After each run, the tool compares our ranking order against published benchmarks (MMLU, HumanEval, GSM8K) to verify methodology soundness.

## Output

- **Terminal** — summary ranking table with accuracy, speed, memory, and combined score
- **results.json** — full JSON with per-question data
- **results-detail.txt** — per-domain and per-question breakdown
