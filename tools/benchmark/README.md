# Model Benchmark

Compares Ollama models across 8 domains: mathematics, physics, philosophy, coding, reasoning, function calling, agent skills, and Chinese.

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
| medium | qwen3.5:9b | 19GB |
| large | gemma4:26b | 24GB |

## Test Results

**Test Hardware:** MacBook Pro (M4 Max, 64 GB RAM, macOS)

Score = 70% accuracy + 30% speed (capped at 50 tok/s). Results will vary on different hardware — speed scales with GPU/memory bandwidth, accuracy stays the same.

### Small Tier (8 domains, 24 questions)

| # | Model | Accuracy | Speed | Memory | Score |
|---|-------|----------|-------|--------|-------|
| 1 | gemma4:e2b | 96% | 141.3/s | 8.2 GB | 0.97 |
| 2 | qwen2.5:7b | 94% | 75.9/s | 7.6 GB | 0.89 |
| 3 | qwen3:8b | 96% | 67.8/s | 10.6 GB | 0.88 |

**Winner: gemma4:e2b** — highest combined score, fastest, lowest memory. qwen3:8b wins most per-domain categories (philosophy, Chinese, physics, math, function calling, coding, reasoning) but uses more memory.

### Medium Tier (8 domains, 24 questions)

| # | Model | Accuracy | Speed | Memory | Score |
|---|-------|----------|-------|--------|-------|
| 1 | gemma4:e4b | 95% | 87.0/s | 12.1 GB | 0.96 |
| 2 | qwen3.5:9b | 97% | 44.7/s | 18.7 GB | 0.95 |
| 3 | qwen3:14b | 95% | 39.1/s | 15.1 GB | 0.90 |

**Default: qwen3.5:9b** — highest accuracy (97%), wins all 8 per-domain categories. gemma4:e4b is fastest (87 tok/s) with lowest memory (12.1 GB) but is a thinking model — may have idle timeout issues like gemma4:26b.

**Note:** All medium models are thinking models and may occasionally time out with "Agent couldn't generate a response" errors. Retrying usually works.

### Large Tier (20-24GB class)

| # | Model | Accuracy | Speed | Memory | Score |
|---|-------|----------|-------|--------|-------|
| 1 | gemma4:26b | 96% | 85.0/s | 24.0 GB | 0.97 |
| 2 | mistral-small:24b | 94% | 26.1/s | 20.1 GB | 0.81 |

**Default: gemma4:26b** — faster and more accurate. mistral-small:24b is a reliable alternative with lower memory.

**Known issue with gemma4:26b:** The model's "thinking" mode occasionally consumes all tokens on internal reasoning and produces no visible output, resulting in "Agent couldn't generate a response" errors. This happens intermittently — retrying usually works.

### XLarge Tier (32GB+ memory, known issues)

| # | Model | Accuracy | Speed | Memory | Score | Issue |
|---|-------|----------|-------|--------|-------|-------|
| 1 | qwen3.5:27b | 99% | 15.7/s | 39.3 GB | 0.79 | High memory despite 27B params |
| 2 | qwen2.5:32b | 96% | 18.6/s | 28.7 GB | 0.78 | Slow but reliable |
| 3 | gemma4:31b | 96% | 15.7/s | 43.9 GB | 0.77 | Thinking mode timeouts |

**Not recommended for most users.** These models require 32-64GB RAM and have responsiveness issues.

**Note on qwen3:32b (excluded):** 29.1 GB memory, 17.6 tok/s. Causes Ollama idle timeouts. Ranks #1 on MMLU (83.2%) but unusable for interactive use.

```bash
# To try xlarge models:
openclaw config set agents.defaults.model.primary ollama/qwen2.5:32b
openclaw gateway restart
```

## Test Domains

| Domain | Questions | What it tests |
|--------|-----------|---------------|
| Mathematics | 3 | Derivatives, equations, integrals |
| Physics | 3 | Newton's laws, photon energy, entropy |
| Philosophy | 3 | Kant, trolley problem, empiricism vs rationalism |
| Coding | 3 | LCS, binary search, cycle detection |
| Reasoning | 3 | Syllogisms, bat-and-ball, rate problems |
| Function Calling | 3 | JSON schema, parameter extraction, call chaining |
| Agent Skills | 3 | Tool selection, task decomposition, self-correction |
| Chinese | 3 | Quantum physics, coding, philosophy — all in Chinese |

## Scoring

Each question has 2-4 keyword groups. A group matches if any term appears (case-insensitive). Accuracy = matched groups / total groups.

Combined score = 70% accuracy + 30% speed (capped at 50 tok/s — anything faster is imperceptible to users).

## Validation

After each run, the tool compares our ranking order against published benchmarks (MMLU, HumanEval, GSM8K) to verify methodology soundness.

## Output

- **Terminal** — summary ranking table with accuracy, speed, memory, and combined score
- **results.json** — full JSON with per-question data
- **results-detail.txt** — per-domain and per-question breakdown
