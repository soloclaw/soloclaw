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
| medium | mistral-small:24b | 16GB |
| large | qwen3:32b | 32GB |

## Test Results

### Small Tier (8 domains, 24 questions)

Tested on macOS (Apple Silicon). Score = 70% accuracy + 30% speed.

| # | Model | Accuracy | Speed | Memory | Score |
|---|-------|----------|-------|--------|-------|
| 1 | gemma4:e2b | 96% | 141.3/s | 8.2 GB | 0.97 |
| 2 | qwen2.5:7b | 94% | 75.9/s | 7.6 GB | 0.89 |
| 3 | qwen3:8b | 96% | 67.8/s | 10.6 GB | 0.88 |

**Winner: gemma4:e2b** — highest combined score, fastest, lowest memory. qwen3:8b wins most per-domain categories (philosophy, Chinese, physics, math, function calling, coding, reasoning) but uses more memory.

### Medium Tier (8 domains, 24 questions)

| # | Model | Accuracy | Speed | Memory | Score |
|---|-------|----------|-------|--------|-------|
| 1 | qwen3.5:9b | 97% | 44.8/s | 18.7 GB | 0.81 |
| 2 | qwen2.5:14b | 95% | 36.7/s | 16.5 GB | 0.78 |
| 3 | mistral-small:24b | 95% | 26.6/s | 20.1 GB | 0.74 |

**Default: mistral-small:24b** — despite lower combined score, it wins 6/8 per-domain categories including function calling and agent skills, which are critical for SoloClaw's agent workflow. qwen3.5:9b is faster but uses 18.7GB memory.

### Large Tier

| # | Model | Accuracy | Speed | Memory | Score |
|---|-------|----------|-------|--------|-------|
| 1 | qwen2.5:32b | 97% | 19.8/s | 28.7 GB | 0.74 |
| 2 | qwen3:32b | 97% | 18.2/s | 29.1 GB | 0.73 |

**Winner: qwen2.5:32b** — slightly faster with lower memory. qwen3:32b wins on public benchmarks (MMLU 83.2% vs 80.1%) and is best per-domain in philosophy, physics, mathematics, and coding — so it remains the default large preset.

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
