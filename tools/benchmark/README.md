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
| 1 | qwen3.5:9b | 97% | 45.0/s | 18.7 GB | 0.95 |
| 2 | qwen2.5:14b | 94% | 41.6/s | 16.5 GB | 0.91 |
| 3 | mistral-small:24b | 94% | 26.1/s | 20.1 GB | 0.81 |

**Default: mistral-small:24b** — despite lower combined score, it wins 4/8 per-domain categories (physics, function calling, philosophy, mathematics) which are critical for SoloClaw's agent workflow. Our ranking diverges from public benchmarks (MMLU ranks mistral-small #1), suggesting our keyword scoring favors qwen3.5's newer architecture on reasoning and Chinese tasks.

### Large Tier

| # | Model | Accuracy | Speed | Memory | Score |
|---|-------|----------|-------|--------|-------|
| 1 | gemma4:26b | 97% | 88.1/s | 24.0 GB | 0.98 |
| 2 | qwen2.5:32b | 96% | 19.0/s | 28.7 GB | 0.79 |
| 3 | qwen3:32b | 96% | 17.6/s | 29.1 GB | 0.78 |

**Default: qwen3:32b** — wins 6/8 per-domain categories and ranks #1 on public benchmarks (MMLU 83.2%).

**Warning:** qwen3:32b uses 29.1 GB memory and runs at only 17.6 tok/s. On machines with limited RAM, Ollama may unload the model during idle periods, causing unresponsive behavior. If you experience timeouts or no response, consider switching to **gemma4:26b** (24 GB, 88 tok/s) which is 5x faster with lower memory:

```bash
openclaw config set agents.defaults.model.primary ollama/gemma4:26b
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
